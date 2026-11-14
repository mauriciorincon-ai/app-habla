// Content-Security-Policy of the production build (S11, ADR-023).
//
// Why it exists: the recognizer's Worker is kept offline by a prelude that removes fetch, XHR and
// friends (src/lib/reconocer/preludio.ts). That is a software guard; the browser itself now backs it:
// `connect-src 'self' blob:` means that even a Worker that got past the prelude could not talk to any
// other origin. Nothing else is allowed that the app does not really use.
//
// What each directive is for (checked against the code, not guessed):
//  - script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval': Next's static pages ship inline bootstrap scripts
//    (a nonce would force every page to render per request, and this app is static on purpose) and
//    the theme/language script in the root layout; the recognizer compiles the Vosk wasm (`wasm-unsafe-eval`
//    allows WebAssembly only). `unsafe-eval` is here because vosk-browser's Emscripten glue builds its
//    embind invokers with `new Function` (found by the e2e under `next start`: EvalError in the Worker).
//    A blob: Worker inherits the page's policy, and the page cannot give the Worker a policy of its
//    own, so the allowance is page-wide; it is declared as an owner decision in the S11 close.
//  - worker-src 'self' blob:: the recognizer Worker is built from a blob: URL; the service worker is /sw.js.
//  - connect-src 'self' blob:: the app's own files (models are read from its own origin) and the blob: URLs the
//    Worker reads (the verified wasm and model). Sentry is initialized nowhere, so no ingest origin.
//  - img-src / media-src: pictograms are served from this origin (also through /_next/image), the videoteca
//    and the voice bank play blob: URLs, printables embed data: images.
//  - font-src 'self': next/font self-hosts the Google fonts at build time.
//  - object-src 'none', base-uri 'self', form-action 'self', frame-ancestors 'none': closed doors the app never uses.
// Not included on purpose: upgrade-insecure-requests (the e2e job serves http://127.0.0.1).

export const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "media-src 'self' blob:",
  "font-src 'self' data:",
  "connect-src 'self' blob:",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

/** Headers for every route; empty outside production (the dev server needs eval and websockets). */
export function cabecerasSeguridad(
  entorno: string | undefined,
): Array<{ source: string; headers: Array<{ key: string; value: string }> }> {
  if (entorno !== "production") return [];
  return [
    {
      source: "/:path*",
      headers: [{ key: "Content-Security-Policy", value: CSP }],
    },
  ];
}
