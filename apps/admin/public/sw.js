// CBMS Admin Simple Service Worker
const CACHE_NAME = "cbms-admin-v2";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => caches.delete(key)));
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", () => {
  // Let the browser handle network directly without caching
  return;
});

