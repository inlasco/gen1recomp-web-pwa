"use strict";

/*
 * Boot guard — runs before player.js, and is the reason a bad deploy can be
 * fixed by re-uploading.
 *
 * THE PROBLEM IT SOLVES
 *
 * player.js (love.js by 2dengine) keeps its own package cache in IndexedDB:
 * database EM_PRELOAD_CACHE, object store PACKAGES, keyed by the URI it
 * fetched. Player.requestPkg reads that store FIRST and, on a hit, resolves
 * with the stored bytes without ever contacting the server:
 *
 *     Player.readPkg(uri).then(function (raw) { ... })
 *     ...
 *     if (data && Player.cache) { resolve({data: data, name: uri}); return; }
 *
 * The only integrity check on the download side is the four-byte ZIP magic
 * (50 4B 03 04). A truncated archive — an upload cut short, a flaky mobile
 * connection — still starts with those four bytes, passes, and is written to
 * the cache. From then on the browser boots that broken copy on every visit
 * and re-uploading the file on the server changes nothing, because the URI
 * is unchanged and the cache short-circuits the fetch.
 *
 * The symptom is LÖVE's own pre-window alert: "An error occurred before the
 * game window could be initialised" — PhysFS could not mount the archive.
 *
 * WHAT THIS DOES
 *
 * Before player.js is allowed to run, every entry in PACKAGES is checked
 * against the byte length this build expects:
 *
 *   - an entry for a URI this build does not use  -> deleted (old deploy)
 *   - an entry whose length is not the expected one -> deleted (bad download)
 *   - an entry that matches exactly                 -> kept (fast boot)
 *
 * Then, and only then, player.js is injected. Nothing else changes: a good
 * cache is still a cache, and the visitor keeps the instant second boot.
 *
 * ON EVERY DEPLOY: update EXPECT below with the new byte lengths. `stat -c%s`
 * on each file, or the sizes printed by the deploy manifest.
 */

(function () {
  // uri (exactly as player.js requests it) -> exact byte length
  var EXPECT = {
    "game-v13.4-fr.love": 3476413,
    "11.5/love.wasm": 4720510,
    "lua/normalize1.lua": 2832,
    "lua/normalize2.lua": 4095
  };

  var PLAYER_SRC =
    "player.js?v=11.5&n=2&g=game-v13.4-fr.love&arg=%5B%22--web%22%5D";

  var started = false;
  function startPlayer(note) {
    if (started) return;
    started = true;
    if (note) console.info("[boot-guard] " + note);
    var script = document.createElement("script");
    script.src = PLAYER_SRC;
    document.body.appendChild(script);
  }

  // The guard must never be the reason the game does not start. Anything
  // unexpected — no IndexedDB, private browsing, a hung transaction — and we
  // simply boot as before.
  var bail = window.setTimeout(function () {
    startPlayer("cache check timed out; booting anyway");
  }, 4000);

  function proceed(note) {
    window.clearTimeout(bail);
    startPlayer(note);
  }

  var idb = window.indexedDB || window.mozIndexedDB
    || window.webkitIndexedDB || window.msIndexedDB;
  if (!idb) {
    proceed("no IndexedDB; nothing to verify");
    return;
  }

  var open;
  try {
    // Same name and version player.js uses, so this does not trigger an
    // upgrade it would then have to undo.
    open = idb.open("EM_PRELOAD_CACHE", 1);
  } catch (error) {
    proceed("could not open the package cache: " + error);
    return;
  }

  open.onerror = function () { proceed("package cache unreadable"); };
  open.onblocked = function () { proceed("package cache blocked"); };

  // A first-ever visit lands here: create the store exactly the way player.js
  // would, so its own openDB finds a well-formed database.
  open.onupgradeneeded = function (event) {
    var db = event.target.result;
    if (!db.objectStoreNames.contains("PACKAGES")) {
      db.createObjectStore("PACKAGES");
    }
  };

  open.onsuccess = function (event) {
    var db = event.target.result;
    if (!db.objectStoreNames.contains("PACKAGES")) {
      db.close();
      proceed("package cache is empty");
      return;
    }

    var tx, store;
    try {
      tx = db.transaction(["PACKAGES"], "readwrite");
      store = tx.objectStore("PACKAGES");
    } catch (error) {
      db.close();
      proceed("package cache busy: " + error);
      return;
    }

    var purged = [];
    // Everything below runs inside ONE transaction, so tx.oncomplete is the
    // moment every delete has actually been flushed. Booting before that
    // would let player.js read an entry we just decided to drop.
    tx.oncomplete = function () {
      db.close();
      proceed(purged.length
        ? "purged " + purged.length + " stale or damaged package(s): "
          + purged.join(", ")
        : "package cache verified");
    };
    tx.onerror = function () { db.close(); proceed("package cache write failed"); };
    tx.onabort = function () { db.close(); proceed("package cache aborted"); };

    var keysRequest = store.getAllKeys ? store.getAllKeys() : null;
    if (!keysRequest) {
      // getAllKeys is everywhere we care about, but a cursor is the portable
      // fallback and costs nothing to keep.
      keysRequest = store.openKeyCursor();
      var keys = [];
      keysRequest.onsuccess = function (e) {
        var cursor = e.target.result;
        if (cursor) { keys.push(cursor.key); cursor.continue(); return; }
        inspect(keys);
      };
      return;
    }
    keysRequest.onsuccess = function () { inspect(keysRequest.result || []); };

    function inspect(keys) {
      for (var i = 0; i < keys.length; i += 1) {
        checkOne(keys[i]);
      }
    }

    function checkOne(key) {
      var name = String(key);
      if (!Object.prototype.hasOwnProperty.call(EXPECT, name)) {
        // A package from an earlier deploy. Harmless to keep, but it is dead
        // weight in the visitor's storage quota and it hides real problems.
        store.delete(key);
        purged.push(name + " (not part of this build)");
        return;
      }
      var read = store.get(key);
      read.onsuccess = function () {
        var value = read.result;
        var length = 0;
        if (value) {
          if (typeof value.byteLength === "number") length = value.byteLength;
          else if (typeof value.length === "number") length = value.length;
        }
        if (length !== EXPECT[name]) {
          store.delete(key);
          purged.push(name + " (" + length + " bytes, expected "
            + EXPECT[name] + ")");
        }
      };
    }
  };
})();
