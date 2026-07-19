import { expect, test, type Page } from "@playwright/test";

// LA VOZ DE LA FAMILIA EN LOS JUEGOS (Outcome 2). Se llega POR LA UI: el picto suena con la voz
// grabada, y el altavoz (≥64 px) la repite. Si no hay grabación, la app suena como antes: en
// silencio, sin errores (fallback limpio).
//
// NOTA HONESTA (bitácora F1): el bucle de retroalimentación parlante→micrófono NO es medible con
// el mic falso de Playwright (es un ARCHIVO, no capta los parlantes). Aquí verificamos el CABLEADO
// —que el picto ofrezca y dispare la voz familiar, y que el toggle la silencie— no el eco acústico
// real, que queda como ítem del gate de tablet.

/** El mismo slug del catálogo (banco-voz/catalogo.ts): "camión" → "camion". */
function slug(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Arranca el juego y devuelve la palabra del primer dibujo (el mazo es determinista por semilla). */
async function primerPicto(page: Page): Promise<string> {
  await page.goto("/jugar/palabras");
  await page.getByTestId("empezar-juego").click();
  await expect(page.getByTestId("juego")).toHaveAttribute(
    "data-fase",
    "jugando",
    { timeout: 20_000 },
  );
  return (await page.getByTestId("palabra-del-picto").innerText()).trim();
}

/** Mete una grabación directa en el banco (IndexedDB) para un ítem, como si el padre la hubiera
 *  grabado. Por defecto el audio es un buffer mínimo NO reproducible (basta para que el ítem
 *  exista y el altavoz aparezca); con `reproducibleMs` se guarda un WAV REAL de silencio de esa
 *  duración — play() sí suena, y con él se prueba la guarda del bucle por la UI. */
async function inyectarGrabacion(
  page: Page,
  id: string,
  reproducibleMs?: number,
): Promise<void> {
  await page.evaluate(
    async ({ clave, wavMs }) => {
      /** WAV PCM válido (silencio): cabecera de 44 bytes + muestras en cero. */
      function wavSilencio(ms: number): ArrayBuffer {
        const rate = 8000;
        const n = Math.round((rate * ms) / 1000);
        const buf = new ArrayBuffer(44 + n * 2);
        const v = new DataView(buf);
        const texto = (o: number, s: string) => {
          for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i));
        };
        texto(0, "RIFF");
        v.setUint32(4, 36 + n * 2, true);
        texto(8, "WAVE");
        texto(12, "fmt ");
        v.setUint32(16, 16, true);
        v.setUint16(20, 1, true);
        v.setUint16(22, 1, true);
        v.setUint32(24, rate, true);
        v.setUint32(28, rate * 2, true);
        v.setUint16(32, 2, true);
        v.setUint16(34, 16, true);
        texto(36, "data");
        v.setUint32(40, n * 2, true);
        return buf;
      }

      await new Promise<void>((resolve, reject) => {
        const req = indexedDB.open("habla-banco-voz", 1);
        req.onupgradeneeded = () => {
          if (!req.result.objectStoreNames.contains("grabaciones")) {
            req.result.createObjectStore("grabaciones");
          }
        };
        req.onsuccess = () => {
          const db = req.result;
          const tx = db.transaction("grabaciones", "readwrite");
          tx.objectStore("grabaciones").put(
            wavMs
              ? {
                  datos: wavSilencio(wavMs),
                  mimeType: "audio/wav",
                  duracionMs: wavMs,
                  fecha: "2026-07-18",
                }
              : {
                  datos: new ArrayBuffer(64),
                  mimeType: "audio/webm",
                  duracionMs: 500,
                  fecha: "2026-07-18",
                },
            clave,
          );
          tx.oncomplete = () => {
            db.close();
            resolve();
          };
          tx.onerror = () => reject(tx.error);
        };
        req.onerror = () => reject(req.error);
      });
    },
    { clave: id, wavMs: reproducibleMs },
  );
}

test("sin grabación, palabra↔objeto suena en silencio (fallback limpio)", async ({
  page,
}) => {
  await primerPicto(page);
  // No hay banco → no hay altavoz. La app juega igual que antes, sin ruido roto ni error.
  await expect(page.getByTestId("altavoz-palabra")).toHaveCount(0);
});

test("con grabación, el dibujo ofrece su palabra en la voz de la familia", async ({
  page,
}) => {
  // Escuchamos el evento de la voz familiar desde antes de cargar (atrapa también el autoplay).
  await page.addInitScript(() => {
    (window as unknown as { __sono: string[] }).__sono = [];
    window.addEventListener("voz-familiar:sono", (e) => {
      (window as unknown as { __sono: string[] }).__sono.push(
        (e as CustomEvent<{ id: string }>).detail.id,
      );
    });
  });

  const palabra = await primerPicto(page);
  const id = `palabra:${slug(palabra)}`;
  await expect(page.getByTestId("altavoz-palabra")).toHaveCount(0); // aún sin grabar

  await inyectarGrabacion(page, id);

  // Nuevo montaje: el mazo es determinista, vuelve a salir la misma palabra, y ahora SÍ hay voz.
  const palabra2 = await primerPicto(page);
  expect(palabra2).toBe(palabra);

  const altavoz = page.getByTestId("altavoz-palabra");
  await expect(altavoz).toBeVisible();
  await expect(altavoz).toHaveAttribute("data-fuente-voz", "familiar");
  // Toque del niño: ≥64 px (COGA).
  const caja = await altavoz.boundingBox();
  expect(caja?.height ?? 0).toBeGreaterThanOrEqual(64);
  expect(caja?.width ?? 0).toBeGreaterThanOrEqual(64);

  // Tocarlo dispara la voz de ESE ítem (el autoplay ya lo habrá disparado al entrar).
  await altavoz.click();
  await expect
    .poll(() =>
      page.evaluate(() => (window as unknown as { __sono: string[] }).__sono),
    )
    .toContain(id);
});

test("el toggle de Ajustes silencia la voz familiar en el juego (POR la UI)", async ({
  page,
}) => {
  const palabra = await primerPicto(page);
  await inyectarGrabacion(page, `palabra:${slug(palabra)}`);

  // Con grabación y toggle por defecto (activo), el altavoz aparece.
  const palabra2 = await primerPicto(page);
  expect(palabra2).toBe(palabra);
  await expect(page.getByTestId("altavoz-palabra")).toBeVisible();

  // El padre apaga "usar la voz de la familia" desde Ajustes (interruptor controlado → .click,
  // regla 8; la aserción va al resultado observable: el altavoz desaparece del juego).
  await page.goto("/ajustes");
  const toggle = page.getByTestId("toggle-voz-familiar");
  await expect(toggle).toHaveAttribute("aria-checked", "true");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-checked", "false");

  // De vuelta al juego: misma palabra grabada, pero ya no suena → sin altavoz.
  const palabra3 = await primerPicto(page);
  expect(palabra3).toBe(palabra);
  await expect(page.getByTestId("altavoz-palabra")).toHaveCount(0);
});

// LA CONSIGNA DEL JUEGO en voz familiar (remate S3, A-1): "Haz sonar tu voz: aaaaah" es texto
// fijo del globo → grabable → suena. Sin grabación, el globo se ve igual que siempre.
test("la consigna del globo suena en la voz de la familia (y sin grabación, no hay altavoz)", async ({
  page,
}) => {
  await page.addInitScript(() => {
    (window as unknown as { __sono: string[] }).__sono = [];
    window.addEventListener("voz-familiar:sono", (e) => {
      (window as unknown as { __sono: string[] }).__sono.push(
        (e as CustomEvent<{ id: string }>).detail.id,
      );
    });
  });

  // Sin grabación: el globo juega como siempre, sin altavoz de consigna.
  await page.goto("/jugar/globo");
  await page.getByTestId("empezar-juego").click();
  await expect(page.getByTestId("juego")).toHaveAttribute(
    "data-fase",
    /esperando-voz|jugando/,
    { timeout: 20_000 },
  );
  await expect(page.getByTestId("altavoz-consigna")).toHaveCount(0);

  // El padre graba la consigna → el altavoz aparece y la dispara.
  await inyectarGrabacion(page, "consigna:aaah");
  await page.goto("/jugar/globo");
  await page.getByTestId("empezar-juego").click();

  const altavoz = page.getByTestId("altavoz-consigna");
  await expect(altavoz).toBeVisible({ timeout: 20_000 });
  await expect(altavoz).toHaveAttribute("data-fuente-voz", "familiar");
  const caja = await altavoz.boundingBox();
  expect(caja?.height ?? 0).toBeGreaterThanOrEqual(64); // el niño lo puede tocar (COGA)

  await altavoz.click();
  await expect
    .poll(() =>
      page.evaluate(() => (window as unknown as { __sono: string[] }).__sono),
    )
    .toContain("consigna:aaah");
});

// LA GUARDA DEL BUCLE + VOZ NUEVA POR DIBUJO, por la UI (remate S3, A-2/A-4). Con un WAV REAL
// (play() de verdad): al pasar a un dibujo grabado, su palabra suena sola y — mientras suena —
// el dibujo NO se enciende: ni con el eco, ni con la voz ACUMULADA del dibujo anterior (antes
// del remate, el 2.º dibujo se encendía SOLO con la voz que encendió al 1.º — mentira, regla
// dura 3). El backstop determinista de la guarda es use-voice-session.test.tsx; aquí se
// verifica el cableado real en el navegador.
test("al cambiar de dibujo, la voz grabada suena y el dibujo exige voz NUEVA (no se enciende solo)", async ({
  page,
}) => {
  await page.addInitScript(() => {
    (window as unknown as { __sono: string[] }).__sono = [];
    window.addEventListener("voz-familiar:sono", (e) => {
      (window as unknown as { __sono: string[] }).__sono.push(
        (e as CustomEvent<{ id: string }>).detail.id,
      );
    });
  });

  // Primera pasada: descubrir la SEGUNDA palabra del mazo (determinista por semilla).
  await primerPicto(page);
  await page.getByTestId("siguiente-picto").click();
  const segunda = (
    await page.getByTestId("palabra-del-picto").innerText()
  ).trim();

  // Grabación REAL (WAV reproducible, 3 s) solo para la segunda palabra.
  await inyectarGrabacion(page, `palabra:${slug(segunda)}`, 3000);

  // Segunda pasada: jugar de verdad.
  const primera2 = await primerPicto(page);
  expect(primera2).not.toBe(segunda);

  // La voz del mic falso enciende el primer dibujo (control: el medidor SÍ oye).
  await expect(page.getByTestId("escenario")).toHaveAttribute(
    "data-encendido",
    "true",
    { timeout: 20_000 },
  );

  // Al pasar al dibujo grabado: su palabra suena sola (autoplay real)…
  await page.getByTestId("siguiente-picto").click();
  await expect(page.getByTestId("palabra-del-picto")).toHaveText(segunda);
  await expect
    .poll(() =>
      page.evaluate(() => (window as unknown as { __sono: string[] }).__sono),
    )
    .toContain(`palabra:${slug(segunda)}`);

  // …y el dibujo NO se enciende solo: ni por la voz acumulada del anterior (ancla de voz nueva)
  // ni por el clip sonando (guarda del bucle). Se re-verifica pasado un rato del clip.
  await expect(page.getByTestId("escenario")).toHaveAttribute(
    "data-encendido",
    "false",
  );
  await page.waitForTimeout(1500);
  await expect(page.getByTestId("escenario")).toHaveAttribute(
    "data-encendido",
    "false",
  );

  // Cuando el clip termina y la guarda expira, la voz REAL del micrófono vuelve a contar:
  // el dibujo se enciende con voz nueva (el juego no quedó sordo).
  await expect(page.getByTestId("escenario")).toHaveAttribute(
    "data-encendido",
    "true",
    { timeout: 25_000 },
  );
});
