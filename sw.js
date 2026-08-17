"use strict";

/*
 * Gen1Recomp Web/PWA service worker.
 *
 * WHY IT EXISTS: without it, the entry document is at the mercy of the
 * browser's HTTP cache. index.html is the one file that cannot carry a ?v=
 * key -- it is what names every other file's version -- so once a browser
 * decides to hold a copy, nothing uploaded to the server reaches that visitor
 * until the copy expires on its own. .htaccess makes the server ask for
 * revalidation; a service worker makes it unconditional, because the worker
 * runs before the HTTP cache is consulted at all.
 *
 * The failure mode of a bad service worker is nasty -- a visitor pinned to a
 * half-old build with no way to tell them -- so the rules are few and blunt:
 *
 *  1. THE ENTRY DOCUMENT IS NEVER SERVED STALE. index.html and diagnostic.html
 *     are fetched network-first, always. A visitor who relaunches after an
 *     upload gets the new page even if their HTTP cache still holds the old
 *     one. The cached copy exists only so the app still opens with no network.
 *
 *  2. WHAT THE APP IS MADE OF IS ASKED FOR, NOT ASSUMED. The scripts, the
 *     stylesheet, the manifest and the game archive go to the network first,
 *     with the cache as the offline fallback. They carry ?v= keys, but the
 *     worker does not trust them: that would mean trusting a human to bump
 *     every key on every deploy, and the one that gets forgotten is the one
 *     that pins a visitor to a stale build. Measured: with boot-guard.js left
 *     on its previous ?v=, the update landed on the second launch instead of
 *     the first. Asking costs a 304 and needs no discipline.
 *
 *     Only the frozen runtime is cache-first -- 11.5/, lua/, icons/. That is
 *     where the megabytes are, and none of it moves without a runtime bump,
 *     which bumps VERSION, which drops the cache anyway.
 *
 *  3. AN UPLOAD IS PUBLISHED BY BUMPING VERSION BELOW. Activation deletes
 *     every cache that is not the current one, so a deploy cannot leave a
 *     half-old, half-new mixture behind -- the class of bug that makes a
 *     service worker worse than none at all.
 *
 *  4. THERE IS A KILL SWITCH. Set KILL to true, upload this file alone, and
 *     the next visit unregisters the worker and drops every cache. That is
 *     the escape hatch if a deploy ever goes wrong; it needs no other file.
 *
 * DEPLOY CHECKLIST
 *   - changed ANY file?      bump VERSION
 *   - changed a ?v= key?     update SHELL below to match index.html
 *   - want the worker gone?  KILL = true, upload sw.js, load the site once
 */

var VERSION = "13.4-fr-inlascomp-v1";
var KILL = false;

var CACHE = "gen1recomp-" + VERSION;

// The shell: small, and the app is useless without any one of them, so they
// are fetched as a set at install time. The two heavy files (11.5/love.wasm,
// the .love archive) are deliberately NOT here -- an all-or-nothing 8 MB
// install over a phone connection fails as a unit and would leave the worker
// permanently uninstalled. They are cached on first use instead.
//
// These URLs must match index.html exactly, query string included: a Request
// is keyed by its full URL, so "app-v13.css" and "app-v13.css?v=13.4-fr-r3"
// are two different cache entries.
var SHELL = [
  "./",
  "index.html",
  "app-v13.css?v=13.4-fr-r3",
  "inlascomp-launcher.css?v=1",
  "web-mod-import.js?v=13.3-pwa-final",
  "web-bridge-v13.js?v=13.4-fr-r4",
  "inlascomp-launcher.js?v=1",
  "boot-guard.js?v=13.4-fr-inlascomp-v1",
  "player.js?v=11.5&n=2&g=game-v13.4-fr.love&arg=%5B%22--web%22%5D",
  "manifest.webmanifest?v=13.3-pwa-final",
  "icons/icon-192.png",
  "icons/icon-512.png"
];

function dropEveryCache() {
  return caches.keys().then(function (names) {
    return Promise.all(names.map(function (name) {
      return caches.delete(name);
    }));
  });
}

self.addEventListener("install", function (event) {
  if (KILL) {
    event.waitUntil(self.skipWaiting());
    return;
  }
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      // Individually, not addAll: one asset missing from the server must not
      // abort the whole install and leave the visitor with no worker at all.
      // cache:"reload" bypasses the HTTP cache, so the install cannot bake a
      // stale copy into the new version's cache.
      return Promise.all(SHELL.map(function (url) {
        return cache.add(new Request(url, { cache: "reload" }))
          .catch(function (error) {
            console.warn("[sw] shell asset skipped: " + url, error);
          });
      }));
    }).then(function () {
      // No waiting phase: the visitor should not have to close every tab to
      // get the build that was just uploaded.
      return self.skipWaiting();
    })
  );
});

self.addEventListener("activate", function (event) {
  if (KILL) {
    event.waitUntil(
      dropEveryCache()
        .then(function () { return self.registration.unregister(); })
        .then(function () { return self.clients.claim(); })
    );
    return;
  }
  event.waitUntil(
    caches.keys().then(function (names) {
      // Everything that is not this VERSION goes, including the caches the
      // pre-13.4 builds left behind ("gen1recomp-web-*").
      return Promise.all(names.map(function (name) {
        return name === CACHE ? false : caches.delete(name);
      }));
    }).then(function () {
      // Take over the pages that are already open, so the very launch that
      // installed the worker is already controlled by it.
      return self.clients.claim();
    })
  );
});

function isEntryDocument(request) {
  if (request.mode === "navigate") return true;
  var accept = request.headers.get("accept") || "";
  return accept.indexOf("text/html") !== -1;
}

// The frozen runtime: LÖVE compiled to wasm and its loader, the Lua
// normalizers, the PWA icons. Megabytes, and none of it changes without a
// runtime bump -- which bumps VERSION, which drops the whole cache. This is
// the only material served cache-first.
function isFrozenRuntime(url) {
  return /(^|\/)(11\.5|lua|icons)\//.test(url.pathname);
}

// Everything the app is actually made of: the page, the scripts, the
// stylesheet, the manifest, the game archive. Together they are well under
// 100 kB plus the archive, and they are the files a deploy changes.
//
// They are deliberately NOT trusted to their ?v= keys. Relying on those means
// relying on a human bumping every key on every deploy, and the one that gets
// forgotten is the one that pins a visitor to a stale build -- measured: with
// boot-guard.js left on its old ?v=, the update took two launches instead of
// one. Asking the network is cheap and needs no discipline.
function isLiveAsset(url) {
  if (isFrozenRuntime(url)) return false;
  return /\.(html|js|css|webmanifest|love)$/.test(url.pathname) || /\/$/.test(url.pathname);
}

self.addEventListener("fetch", function (event) {
  if (KILL) return;

  var request = event.request;
  if (request.method !== "GET") return;

  var url;
  try {
    url = new URL(request.url);
  } catch (_) {
    return;
  }
  if (url.origin !== self.location.origin) return;
  // Never let the worker serve itself from a cache: that is how a kill
  // switch gets locked out.
  if (url.pathname === self.location.pathname) return;
  // diagnostic.html asks the SERVER what it is really sending, headers
  // included. Answering those probes from the cache would make the diagnostic
  // report the worker's opinion instead of the server's -- worse than no
  // diagnostic at all.
  if (url.search.indexOf("diag=") !== -1) return;

  // Rules 1 and 1b, network-first with the cache as the offline fallback.
  //
  // The cache MODE is the whole point here. A plain fetch(request) inside a
  // worker still consults the browser's HTTP cache, so on a host that serves
  // long max-age headers "network-first" would quietly mean "stale-first" and
  // the worker would be decoration. Asking explicitly means the guarantee no
  // longer depends on what the server sends:
  //
  //   "reload"   -- ignore the HTTP cache entirely, take the bytes. Used for
  //                 the entry document, which is 2 KB.
  //   "no-cache" -- ignore freshness but still allow a conditional request.
  //                 Used for the .love, which is 3.4 MB: unchanged means a
  //                 304 of a few bytes, changed means the new archive.
  if (isEntryDocument(request) || isLiveAsset(url)) {
    var mode = isEntryDocument(request) ? "reload" : "no-cache";
    var fresh = new Request(request.url, {
      cache: mode,
      credentials: "same-origin",
      redirect: "follow"
    });
    event.respondWith(
      fetch(fresh).then(function (response) {
        if (response && response.ok && response.type === "basic") {
          var copy = response.clone();
          caches.open(CACHE).then(function (cache) {
            cache.put(request, copy);
          });
        }
        return response;
      }).catch(function () {
        return caches.match(request).then(function (hit) {
          if (hit) return hit;
          if (!isEntryDocument(request)) return Response.error();
          return caches.match("index.html").then(function (page) {
            return page || caches.match("./");
          });
        });
      })
    );
    return;
  }

  // Rule 2: everything else, cache-first.
  event.respondWith(
    caches.match(request).then(function (hit) {
      if (hit) return hit;
      return fetch(request).then(function (response) {
        // Only successful, non-opaque responses are worth keeping. Caching a
        // 404 or a partial 206 is how a broken deploy becomes permanent.
        if (response && response.ok && response.type === "basic") {
          var copy = response.clone();
          caches.open(CACHE).then(function (cache) {
            cache.put(request, copy);
          });
        }
        return response;
      });
    })
  );
});