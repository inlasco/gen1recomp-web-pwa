"use strict";

/*
 * Gen1Recomp Web/PWA service worker.
 *
 * The job here is narrow and the failure mode is nasty, so the rules are
 * few and blunt:
 *
 *  1. THE ENTRY DOCUMENT IS NEVER SERVED STALE. index.html carries no cache
 *     key -- it is what names every other file's version -- so it is fetched
 *     network-first, always. A visitor who reloads after an upload gets the
 *     new page even if the browser's own HTTP cache still holds the old one.
 *     The cached copy exists only so the app still opens offline.
 *
 *  2. EVERYTHING ELSE IS CACHE-FIRST, because everything else is versioned
 *     by its URL: the scripts and the stylesheet carry ?v= keys, the game
 *     archive carries its version in the filename, and love.wasm only ever
 *     changes with a runtime bump. A URL that has not changed cannot have
 *     new bytes, so re-validating it would only cost the visitor time.
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
 *   - changed any file?      bump VERSION
 *   - changed the .love?     bump VERSION and the g= filename in index.html
 *   - want the worker gone?  KILL = true, upload sw.js, load the site once
 */

var VERSION = "13.4-fr-r2";
var KILL = false;

var CACHE = "gen1recomp-" + VERSION;

// The shell: small, and the app is useless without any one of them, so they
// are fetched as a set at install time. The two heavy files (11.5/love.wasm,
// the .love archive) are deliberately NOT here -- an all-or-nothing 8 MB
// install over a phone connection fails as a unit and would leave the worker
// permanently uninstalled. They are cached on first use instead.
var SHELL = [
  "./",
  "index.html",
  "app-v13.css?v=13.3-pwa-final",
  "boot-guard.js?v=13.4-fr",
  "player.js?v=11.5&n=2&g=game-v13.4-fr.love&arg=%5B%22--web%22%5D",
  "web-bridge-v13.js?v=13.4-fr-r2",
  "web-mod-import.js?v=13.3-pwa-final",
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
      return Promise.all(SHELL.map(function (url) {
        return cache.add(new Request(url, { cache: "reload" }))
          .catch(function (error) {
            console.warn("[sw] shell asset skipped: " + url, error);
          });
      }));
    }).then(function () {
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
      return self.clients.claim();
    })
  );
});

// player.js keeps its OWN cache of these in IndexedDB, with an integrity
// check in front of it (boot-guard.js).  Caching them here as well would
// store 8 MB twice AND put a second, unguarded copy in the way: a damaged
// download that reached the Cache Storage would be replayed cache-first
// forever, exactly the failure boot-guard.js exists to end.  They are left
// to the network and to the layer that verifies them.
function isEnginePackage(pathname) {
  return /\.love$/.test(pathname)
    || /\/love\.wasm$/.test(pathname)
    || /\/normalize\d*\.lua$/.test(pathname);
}

function isEntryDocument(request) {
  if (request.mode === "navigate") return true;
  var accept = request.headers.get("accept") || "";
  return accept.indexOf("text/html") !== -1;
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
  if (isEnginePackage(url.pathname)) return;

  // Rule 1: the entry document, network-first.
  if (isEntryDocument(request)) {
    event.respondWith(
      fetch(request).then(function (response) {
        if (response && response.ok) {
          var copy = response.clone();
          caches.open(CACHE).then(function (cache) {
            cache.put(request, copy);
          });
        }
        return response;
      }).catch(function () {
        return caches.match(request).then(function (hit) {
          return hit || caches.match("index.html") || caches.match("./");
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
