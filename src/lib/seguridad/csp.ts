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
//    allows WebAssembly only; it is redundant while `unsafe-eval` is present and stays so the wasm keeps
//    compiling the day the eval goes away). `unsafe-eval` is here because vosk-browser's Emscripten glue builds its
//    embind invokers with `new Function` (found by the e2e under `next start`: EvalError in the Worker).
//    A blob: Worker inherits the page's policy, and the page cannot give the Worker a policy of its
//    own, so the allowance is page-wide; it is declared as an owner decision in the S11 close.
//  - worker-src 'self' blob:: the recognizer Worker is built from a blob: URL; the service worker is /sw.js.
//  - connect-src 'self' blob:: the app's own files (models are read from its own origin) and the blob: URLs the
//    Worker reads (the verified wasm and model). Sentry is inert without NEXT_PUBLIC_SENTRY_DSN (instrumentation-client.ts), so no ingest origin
//    today; setting a DSN REQUIRES the owner to add its ingest origin here in the same change
//    (tests/unit/csp.test.ts fails otherwise), because it breaks «no other origin».
//  - img-src / media-src: pictograms are served from this origin (also through /_next/image), the videoteca
//    and the voice bank play blob: URLs, printables embed data: images.
//  - font-src 'self': next/font self-hosts the Google fonts at build time (/_next/static/media).
//  - object-src 'none', base-uri 'self', form-action 'self', frame-ancestors 'none': closed doors the app never uses.
// Also sent, from the audit: Permissions-Policy (no camera, no geolocation: the app never opens them;
// the microphone stays for this origin) and nosniff. `connect-src 'self'` closes OTHER origins, not
// every request: the guarantee is «no other origin», and the prelude still removes the rest.
// Not included on purpose: upgrade-insecure-requests (the e2e job serves http://127.0.0.1).

export const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "media-src 'self' blob:",
  "font-src 'self'",
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
      headers: [
        { key: "Content-Security-Policy", value: CSP },
        {
          key: "Permissions-Policy",
          value: "camera=(), geolocation=(), microphone=(self)",
        },
        { key: "X-Content-Type-Options", value: "nosniff" },
      ],
    },
  ];
}
