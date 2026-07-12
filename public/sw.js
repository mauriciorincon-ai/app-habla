// Service worker mínimo, escrito a mano (sin serwist/next-pwa: este repo compila con Turbopack).
// Objetivo: que el núcleo de la app funcione sin conexión tras la primera visita (best-effort,
// declarado así en el manual).
//
// PRIVACIDAD (regla dura 2): aquí NO pasa audio. Este worker solo cachea archivos públicos de la
// app (HTML, JS, CSS, iconos). No intercepta ni almacena nada del micrófono — el audio del niño
// nunca sale del hilo de análisis, así que nunca llega a la red.

const CACHE = "habla-v1";

// El shell: lo mínimo para que "Hoy" y el juego abran sin red.
const SHELL = ["/", "/jugar", "/ajustes", "/worklets/rms-processor.js?v=1"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      // addAll falla entero si un recurso falla: lo hacemos tolerante (best-effort).
      .then((cache) => Promise.allSettled(SHELL.map((url) => cache.add(url))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((claves) =>
        Promise.all(
          claves
            .filter((clave) => clave !== CACHE)
            .map((clave) => caches.delete(clave)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Solo GET del mismo origen. Todo lo demás pasa de largo, sin tocarlo.
  if (request.method !== "GET") return;
  if (new URL(request.url).origin !== self.location.origin) return;

  // Navegaciones: red primero (para no servir un HTML viejo tras un deploy), caché si no hay red.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((respuesta) => {
          const copia = respuesta.clone();
          void caches.open(CACHE).then((cache) => cache.put(request, copia));
          return respuesta;
        })
        .catch(() =>
          caches
            .match(request)
            .then((cacheada) => cacheada ?? caches.match("/")),
        ),
    );
    return;
  }

  // Estáticos con hash: caché primero (son inmutables).
  if (request.url.includes("/_next/static/")) {
    event.respondWith(
      caches.match(request).then(
        (cacheada) =>
          cacheada ??
          fetch(request).then((respuesta) => {
            const copia = respuesta.clone();
            void caches.open(CACHE).then((cache) => cache.put(request, copia));
            return respuesta;
          }),
      ),
    );
    return;
  }

  // El resto (iconos, worklet): sirve de caché y refresca por detrás.
  event.respondWith(
    caches.match(request).then((cacheada) => {
      const red = fetch(request)
        .then((respuesta) => {
          const copia = respuesta.clone();
          void caches.open(CACHE).then((cache) => cache.put(request, copia));
          return respuesta;
        })
        .catch(() => cacheada);
      return cacheada ?? red;
    }),
  );
});
