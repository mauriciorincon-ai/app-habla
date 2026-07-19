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
 *  grabado. El audio es un buffer mínimo: basta para que el ítem exista y el altavoz aparezca. */
async function inyectarGrabacion(page: Page, id: string): Promise<void> {
  await page.evaluate(async (clave) => {
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
          {
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
  }, id);
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
