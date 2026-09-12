// CBMS Admin Simple Service Worker
const CACHE_NAME = "cbms-admin-v2";

// Install Event
self.addEventListener("install", () => {
  self.skipWaiting();
});

// Activate Event - Clean up all old caches immediately
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => caches.delete(key)));
    })
  );
  self.clients.claim();
});

// Fetch Event - Pure network-first, NEVER cache _next bundles
self.addEventListener("fetch", (event) => {
  // Let browser handle all requests directly from network
  return;
});
