const STATIC_CACHE = "eduos-static-v1";
const STATIC_ASSETS = ["/", "/icon.svg"];
const SENSITIVE_PATH_PREFIXES = [
  "/api/",
  "/login",
  "/dashboard",
  "/teacher",
  "/student",
  "/parent",
  "/unauthorized",
];

function networkOnly(request) {
  return fetch(request);
}

function isSensitiveRequest(request) {
  const url = new URL(request.url);

  if (request.method !== "GET") {
    return true;
  }

  return SENSITIVE_PATH_PREFIXES.some((prefix) => url.pathname.startsWith(prefix));
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== STATIC_CACHE)
          .map((cacheName) => caches.delete(cacheName)),
      );
    }),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (isSensitiveRequest(request)) {
    event.respondWith(networkOnly(request));
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((response) => {
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(STATIC_CACHE).then((cache) => {
          cache.put(request, responseToCache);
        });

        return response;
      });
    }),
  );
});
