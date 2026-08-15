"use strict";

self.addEventListener("install", function (event) {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (names) {
      return Promise.all(names.map(function (name) {
        return name.indexOf("gen1recomp-web-") === 0 ? caches.delete(name) : false;
      }));
    }).then(function () {
      return self.registration.unregister();
    })
  );
});
