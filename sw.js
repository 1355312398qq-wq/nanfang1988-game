const CACHE_NAME = "nanfang-1988-static-v1";
const APP_SHELL = [
  "./",
  "./index.html",
  "./pwa.js",
  "./site.webmanifest",
  "./assets/south-chronicle-mark.svg",
  "./assets/app-icon-180.png",
  "./assets/app-icon-192.png",
  "./assets/app-icon-512.png",
  "./assets/app-icon-maskable-512.png",
  "./assets/founder-portrait-f.webp",
  "./assets/founder-portrait.webp",
  "./assets/partner-sulan.webp",
  "./assets/partner-sulan-v2.webp",
  "./assets/sector-electronics-1988.webp",
  "./assets/sector-food-1988.webp",
  "./assets/sector-goods-1988.webp",
  "./assets/sector-sewing-1988.webp",
  "./assets/shenzhen-1988.webp",
  "./assets/shenzhen-market-1988.webp"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys
        .filter((key) => key.startsWith("nanfang-1988-") && key !== CACHE_NAME)
        .map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      try {
        const fresh = await fetch(request);
        if (fresh.ok) await cache.put("./index.html", fresh.clone());
        return fresh;
      } catch (_) {
        return await cache.match(request) || await cache.match("./index.html") || Response.error();
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) return cached;
    const response = await fetch(request);
    if (response.ok && response.type === "basic") {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, response.clone());
    }
    return response;
  })());
});
