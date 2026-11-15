import { expect, test } from "./base";

// EL SELECTOR DE JUEGOS (COGA §C): opciones grandes, siempre las mismas y en el mismo orden.
// La predictibilidad importa más que la variedad — y el niño elige por el dibujo, sin leer.
// En el S3 pasa de 3 a 4 juegos (llega "palabras gemelas"): decisión de producto de la orden. En el S10
// llega un quinto, EXPERIMENTAL (el mapa de las vocales), siempre al final: el orden de los cuatro
// primeros no cambia — el niño encuentra su juego donde siempre estuvo. En el S12 llegan Soplar y Fuerte y
// suave y el orden se FIJA una sola vez (ADR-024): globo, soplar, fuerte y suave, cohete, palabras,
// gemelas y vocales (experimental, al final).

test("hay exactamente 7 juegos, grandes, en el orden fijo, y cada uno lleva al suyo", async ({
  page,
}) => {
  await page.goto("/jugar");

  const juegos = [
    "juego-globo",
    "juego-soplar",
    "juego-fuerte-suave",
    "juego-cohete",
    "juego-palabras",
    "juego-gemelas",
    "juego-vocales",
  ];
  for (const testid of juegos) {
    const tarjeta = page.getByTestId(testid);
    await expect(tarjeta).toBeVisible();
    // Toque del niño: muy por encima de los 64 px.
    const caja = await tarjeta.boundingBox();
    expect(caja?.height ?? 0).toBeGreaterThanOrEqual(64);
  }

  // Siete y no más, y SIEMPRE en este orden (predictibilidad, COGA §C).
  await expect(page.locator("[data-testid^='juego-']")).toHaveCount(7);
  const enPantalla = await page
    .locator("[data-testid^='juego-']")
    .evaluateAll((els) => els.map((e) => e.getAttribute("data-testid")));
  expect(enPantalla).toEqual(juegos);
  await expect(page.getByTestId("juego-vocales")).toContainText(/experimental/i);

  await page.getByTestId("juego-gemelas").click();
  await expect(page).toHaveURL(/\/jugar\/gemelas$/);
});

test("el selector se opera con teclado", async ({ page }) => {
  await page.goto("/jugar");

  const globo = page.getByTestId("juego-globo");
  await globo.focus();
  await expect(globo).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/jugar\/globo$/);
});

test("cada juego dice honestamente qué mide (y qué no)", async ({ page }) => {
  await page.goto("/jugar");

  await expect(page.getByTestId("juego-globo")).toContainText(/cuánto dura/i);
  await expect(page.getByTestId("juego-cohete")).toContainText(/tono/i);
  // La promesa más delicada: la app nunca afirma qué palabra dijo el niño (a lo sumo, un «quizás» al adulto).
  await expect(page.getByTestId("juego-palabras")).toContainText(
    /lo juzgas tú/i,
  );
  // Gemelas es co-uso puro: lo dice de frente: sin micrófono por defecto.
  await expect(page.getByTestId("juego-gemelas")).toContainText(
    /sin micrófono por defecto/i,
  );
});
