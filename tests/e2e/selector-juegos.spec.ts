import { expect, test } from "@playwright/test";

// EL SELECTOR DE JUEGOS (COGA §C): tres opciones, siempre las mismas y en el mismo orden.
// La predictibilidad importa más que la variedad — y el niño elige por el dibujo, sin leer.

test("hay exactamente 3 juegos, grandes, y cada uno lleva al suyo", async ({
  page,
}) => {
  await page.goto("/jugar");

  const juegos = ["juego-globo", "juego-cohete", "juego-palabras"];
  for (const testid of juegos) {
    const tarjeta = page.getByTestId(testid);
    await expect(tarjeta).toBeVisible();
    // Toque del niño: muy por encima de los 64 px.
    const caja = await tarjeta.boundingBox();
    expect(caja?.height ?? 0).toBeGreaterThanOrEqual(64);
  }

  // Ni un juego más: tres opciones es el techo (carga cognitiva).
  await expect(page.locator("[data-testid^='juego-']")).toHaveCount(3);

  await page.getByTestId("juego-cohete").click();
  await expect(page).toHaveURL(/\/jugar\/cohete$/);
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
  // La promesa más delicada: la app nunca afirma qué palabra dijo el niño.
  await expect(page.getByTestId("juego-palabras")).toContainText(
    /nunca qué palabra/i,
  );
});
