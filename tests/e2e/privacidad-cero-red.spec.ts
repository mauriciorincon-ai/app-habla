import { expect, test } from "@playwright/test";

// LA PROMESA MÁS SAGRADA DE LA APP, bajo test (regla dura 2):
// el audio del niño no sale del dispositivo — y durante el juego no sale NADA.
// Desde el Sprint 2 esto incluye el PITCH (dato derivado de su voz) y cubre los TRES juegos.
//
// Doble candado:
//   A) Ninguna petición cross-origin en toda la sesión (si algún día Sentry despertara con DSN,
//      o alguien añadiera una fuente/analítica externa —o una llamada a la API de ARASAAC—,
//      este candado lo caza).
//   B) Cero peticiones de red durante la ventana de juego.
//
// El service worker se bloquea en el contexto: así toda petición observada es de la app, no del
// precache — y el test no puede "pasar" por accidente porque el SW sirvió algo de caché.

const JUEGOS = [
  { ruta: "/jugar/globo", nombre: "el globo" },
  { ruta: "/jugar/cohete", nombre: "el cohete" },
  { ruta: "/jugar/palabras", nombre: "palabra↔objeto" },
] as const;

for (const juego of JUEGOS) {
  test(`cero red durante ${juego.nombre}, y nada cross-origin en toda la sesión`, async ({
    browser,
  }) => {
    const context = await browser.newContext({
      permissions: ["microphone"],
      serviceWorkers: "block",
    });

    const violacionesCrossOrigin: string[] = [];
    await context.route("**/*", async (route) => {
      const url = route.request().url();
      if (!url.startsWith("http://localhost:3000")) {
        violacionesCrossOrigin.push(url);
        await route.abort();
        return;
      }
      await route.continue();
    });

    const page = await context.newPage();

    // En CI el servidor es `next build && next start` (sin HMR): la aserción es estricta.
    // En local, el dev server añade ruido propio del entorno de desarrollo.
    const esDev = !process.env.CI;
    const ruidoDeDesarrollo = (url: string) =>
      url.includes("webpack-hmr") ||
      url.includes("hot-update") ||
      url.includes("__nextjs") ||
      url.includes("/_next/static/chunks/") ||
      url.endsWith("favicon.ico");

    await page.goto(juego.ruta);
    await page.getByTestId("empezar-juego").click();

    // Ventana de medición: abre cuando el juego ya corre.
    const escena = page.getByTestId("juego");
    await expect(escena).toHaveAttribute("data-fase", "jugando", {
      timeout: 20_000,
    });

    const peticionesDuranteElJuego: string[] = [];
    const registrar = (url: string) => {
      if (esDev && ruidoDeDesarrollo(url)) return;
      // Los pictogramas son archivos ESTÁTICOS del repo (ADR 008). Que el navegador los pida al
      // servidor local es legítimo — lo prohibido es que salgan del dispositivo (candado A) o
      // que se pidan a ARASAAC. Se anotan igual para poder verificarlo abajo.
      peticionesDuranteElJuego.push(url);
    };
    page.on("request", (request) => registrar(request.url()));

    // Deja correr el juego con voz real del micrófono falso.
    await page.waitForTimeout(3000);

    // Cierra la ventana ANTES de la celebración (que podría navegar/prefetchear).
    page.removeAllListeners("request");

    const soloPictogramasLocales = peticionesDuranteElJuego.filter(
      (url) => !url.startsWith("http://localhost:3000/pictogramas/"),
    );

    expect(
      soloPictogramasLocales,
      `Hubo red durante ${juego.nombre}: ${soloPictogramasLocales.join(", ")}`,
    ).toEqual([]);

    // Y jamás una llamada a ARASAAC en runtime (los dibujos viven en el repo).
    for (const url of peticionesDuranteElJuego) {
      expect(url).not.toMatch(/arasaac/i);
    }

    expect(
      violacionesCrossOrigin,
      `Salió tráfico del dispositivo: ${violacionesCrossOrigin.join(", ")}`,
    ).toEqual([]);

    await context.close();
  });
}

// EL BANCO DE VOZ FAMILIAR ES 100 % LOCAL (regla dura 2-bis, S3): grabar Y reproducir la voz de
// la familia no dispara UNA sola llamada de red. Si alguien subiera el banco a la nube (o metiera
// una analítica en el estudio), este candado lo caza.
test("cero red al grabar y reproducir en el estudio (banco 100 % local)", async ({
  browser,
}) => {
  const context = await browser.newContext({
    permissions: ["microphone"],
    serviceWorkers: "block",
  });

  const violacionesCrossOrigin: string[] = [];
  await context.route("**/*", async (route) => {
    const url = route.request().url();
    if (!url.startsWith("http://localhost:3000")) {
      violacionesCrossOrigin.push(url);
      await route.abort();
      return;
    }
    await route.continue();
  });

  const page = await context.newPage();
  await page.goto("/estudio");

  // Grabar un ítem con el micrófono falso…
  await page.getByTestId("ir-al-lote").click();
  await page.getByTestId("grabar").click();
  await expect(page.getByTestId("detener")).toBeVisible();
  await page.waitForTimeout(600);
  await page.getByTestId("detener").click();

  // …escucharlo (reproduce la voz familiar, blob local)…
  await expect(page.getByTestId("escuchar-captura")).toBeVisible();
  await page.getByTestId("escuchar-captura").click();
  // …y guardarlo en el banco (IndexedDB local).
  await page.getByTestId("aceptar").click();
  await expect(page.getByTestId("progreso-lote")).toContainText("2 de");

  expect(
    violacionesCrossOrigin,
    `Salió tráfico del dispositivo al grabar/reproducir: ${violacionesCrossOrigin.join(", ")}`,
  ).toEqual([]);

  await context.close();
});

test("el audio y el pitch del niño no dejan rastro en el almacenamiento", async ({
  page,
}) => {
  await page.goto("/jugar/cohete");
  await page.getByTestId("empezar-juego").click();
  await expect(page.getByTestId("juego")).toHaveAttribute(
    "data-fase",
    "jugando",
    {
      timeout: 20_000,
    },
  );
  await page.waitForTimeout(2000);

  // Lo único que la app puede guardar: perfil, ajustes y progreso. Nada de audio ni de tono.
  const almacenamiento = await page.evaluate(async () => {
    const local = Object.fromEntries(
      Object.entries(localStorage).map(([clave, valor]) => [
        clave,
        String(valor),
      ]),
    );
    const bases = (await indexedDB.databases?.()) ?? [];
    return {
      claves: Object.keys(local),
      contenido: Object.values(local).join(" "),
      // El dev server de Next usa sessionStorage para su canal de depuración (__next_*), cuyo
      // valor es el payload RSC en base64 (no existe en producción). Se excluye entero —clave y
      // valor—; lo que se vigila aquí es que la APP no escriba nada en sessionStorage.
      sessionStorage: Object.entries(sessionStorage)
        .filter(([clave]) => !clave.startsWith("__next"))
        .map(([clave]) => clave),
      sessionStorageContenido: Object.entries(sessionStorage)
        .filter(([clave]) => !clave.startsWith("__next"))
        .map(([, valor]) => String(valor))
        .join(" "),
      basesDeDatos: bases.map((b) => b.name ?? ""),
    };
  });

  for (const clave of almacenamiento.claves) {
    expect(clave).toMatch(/^habla:v1:(perfil|ajustes|progreso)$/);
  }
  expect(almacenamiento.sessionStorage).toEqual([]);
  expect(almacenamiento.basesDeDatos).toEqual([]);
  // Ni en el sessionStorage ajeno puede haber rastro de audio ni de tono.
  expect(almacenamiento.sessionStorageContenido).not.toMatch(
    /audio|rms|pcm|wav|pitch|data:audio/i,
  );
  // Ni rastros de audio/pitch en lo que sí se guarda.
  expect(almacenamiento.contenido).not.toMatch(
    /audio|rms|pcm|wav|pitch|hz|blob:|data:audio/i,
  );
});
