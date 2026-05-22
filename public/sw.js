const STATIC_CACHE = "eduos-static-v3";
const STATIC_ASSETS = ["/icon.svg", "/icons/eduos-icon.svg", "/icons/eduos-maskable.svg"];
const CACHEABLE_STATIC_PREFIXES = [
  "/_next/static/",
  "/icon.svg",
  "/icons/",
  "/manifest.webmanifest",
];
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

function isDevelopmentHost() {
  return ["localhost", "127.0.0.1", "::1"].includes(self.location.hostname);
}

function isSensitiveRequest(request) {
  const url = new URL(request.url);

  if (request.method !== "GET") {
    return true;
  }

  return SENSITIVE_PATH_PREFIXES.some((prefix) => url.pathname.startsWith(prefix));
}

function isCacheableStaticRequest(request) {
  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return false;
  }

  return CACHEABLE_STATIC_PREFIXES.some((prefix) => url.pathname.startsWith(prefix));
}

self.addEventListener("install", (event) => {
  if (isDevelopmentHost()) {
    event.waitUntil(self.skipWaiting());
    return;
  }

  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  if (isDevelopmentHost()) {
    event.waitUntil(
      caches
        .keys()
        .then((cacheNames) => Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName))))
        .then(() => self.registration.unregister())
        .then(() => self.clients.claim()),
    );
    return;
  }

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

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
    return;
  }

  if (event.data?.type === "CLEAR_EDUOS_CACHES") {
    event.waitUntil(
      caches
        .keys()
        .then((cacheNames) =>
          Promise.all(
            cacheNames
              .filter((cacheName) => cacheName.startsWith("eduos-"))
              .map((cacheName) => caches.delete(cacheName)),
          ),
        ),
    );
  }
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (isDevelopmentHost()) {
    event.respondWith(networkOnly(request));
    return;
  }

  if (isSensitiveRequest(request)) {
    event.respondWith(networkOnly(request));
    return;
  }

  if (!isCacheableStaticRequest(request)) {
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
