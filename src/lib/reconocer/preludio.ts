// The prelude that runs in the recognizer Worker BEFORE the vosk-browser code (S11, ADR-023).
//
// It takes the network away from the Worker: the only addresses it can read are the blob: URLs of the
// files the adult already downloaded and the app already checked by hash (the wasm and the model). Any
// other request fails, and the other network APIs are removed. So whatever the Worker does with the
// child's audio, it has no way out (hard rule 2). A unit test runs this text in a sandbox and checks it.
//
// The model keeps a stable address (`/modelos/<lang>.zip?v=<hash>`) because vosk names its unpacked copy
// after it; the prelude answers that address with the verified blob.

export type MapaPreludio = Record<string, string>;

export function preludio(mapa: MapaPreludio): string {
  return `"use strict";
(() => {
  const MAPA = ${JSON.stringify(mapa)};
  const PERMITIDAS = new Set(Object.values(MAPA));
  const original = self.fetch.bind(self);
  const destino = (entrada) => {
    const texto = typeof entrada === "string" ? entrada : entrada && entrada.url ? entrada.url : String(entrada);
    if (PERMITIDAS.has(texto)) return texto;
    try {
      const u = new URL(texto, self.location.href.replace(/^blob:/, ""));
      return MAPA[u.pathname + u.search] || MAPA[u.pathname] || null;
    } catch (_) {
      return null;
    }
  };
  self.fetch = (entrada, opciones) => {
    const a = destino(entrada);
    if (!a) return Promise.reject(new TypeError("habla: the recognizer has no network"));
    return original(a, opciones);
  };
  for (const nombre of ["XMLHttpRequest", "WebSocket", "EventSource", "WebTransport"]) {
    try { Object.defineProperty(self, nombre, { value: undefined, configurable: false, writable: false }); } catch (_) {}
  }
  self.importScripts = () => { throw new TypeError("habla: the recognizer cannot load scripts"); };
  if (self.navigator && "sendBeacon" in self.navigator) {
    try { Object.defineProperty(self.navigator, "sendBeacon", { value: () => false }); } catch (_) {}
  }
})();
`;
}
