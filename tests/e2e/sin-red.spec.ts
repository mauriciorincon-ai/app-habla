import { RUTAS_SIN_RED } from "../../scripts/precache.mjs";
import { expect, test } from "./base";

// SIN RED DE VERDAD (S15, ADR-027): tras UNA visita a "/", cada ruta propia —Hoy, los siete juegos,
// Cuentos y Ajustes— abre y se hidrata con la red cortada, aunque nunca se haya abierto antes.
// El service worker solo existe con `next start` (registrar-sw.tsx), así que esto corre con CI=1.

test.skip(
  !process.env.CI && !process.env.E2E_START,
  "the service worker is only registered under next start: run with CI=1 (or E2E_START=1 against pnpm start)",
);

test("tras la primera visita a Hoy, cada ruta abre sin red", async ({
  page,
  context,
}) => {
  test.setTimeout(120_000);
  await page.goto("/");
  // Wait until the worker has installed the whole generated list and controls the page.
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) {
      await new Promise((r) =>
        navigator.serviceWorker.addEventListener("controllerchange", r, {
          once: true,
        }),
      );
    }
  });
  const cacheados = await page.evaluate(async () => {
    const claves = await caches.keys();
    const propia = claves.find(
      (c) => c.startsWith("habla-") && c !== "habla-reconocedor-v1",
    );
    const cache = await caches.open(propia!);
    return (await cache.keys()).map((r) => new URL(r.url).pathname);
  });
  // Never audio and never the recognizer in the precache.
  expect(cacheados.some((u) => /^\/(modelos|vosk)\//.test(u))).toBe(false);
  expect(cacheados.some((u) => /\.(wav|mp3|ogg|webm|m4a)$/.test(u))).toBe(
    false,
  );

  await context.setOffline(true);
  const fallidos: string[] = [];
  page.on("requestfailed", (r) => {
    // A request our own goto/reload aborts is not a missing file; anything else offline is.
    if (r.failure()?.errorText.includes("ERR_ABORTED")) return;
    if (new URL(r.url()).pathname.startsWith("/_next/static/"))
      fallidos.push(`${r.url()} ${r.failure()?.errorText ?? ""}`);
  });
  const errores: string[] = [];
  page.on("pageerror", (e) => errores.push(e.message));

  for (const ruta of RUTAS_SIN_RED) {
    await page.goto(ruta);
    await page.reload();
    await expect(page.locator("h1, h2").first(), ruta).toBeVisible();
    // The page's own controls are there (links or buttons), not a browser offline page.
    await expect(
      page.locator("main a, main button").first(),
      ruta,
    ).toBeVisible();
  }
  expect(fallidos, "chunks missing offline").toEqual([]);
  expect(errores, "page errors offline").toEqual([]);
  await context.setOffline(false);
});
