import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// EL MAPA DE LAS VOCALES (S10, experimental). Corre en `desktop-chromium-vocales`: el micrófono
// falso reproduce vocales sintéticas de voz infantil (a·e·i·o·u, 0,4 s de pausa entre cada una;
// scripts/gen-vocales.mjs). Lo que garantiza: «Experimental» a la vista, las cinco zonas con letra
// + dibujo + nombre de la forma, solo se enciende lo medido, el intento lo cierra el padre y la
// celebración cuenta zonas y cambios REALES.

test("el mapa dice que es experimental, enciende las zonas que suenan y celebra solo lo medido", async ({
  page,
}) => {
  await page.goto("/jugar/vocales");
  await expect(page.getByTestId("etiqueta-experimental")).toBeVisible();
  await expect(page.getByTestId("aviso-experimental")).toContainText(
    "margen de error",
  );

  await expect(page.getByTestId("empezar-juego")).toBeEnabled();
  await page.getByTestId("empezar-juego").click();
  await expect(page.getByTestId("calibrando")).toBeVisible();
  await expect(page.getByTestId("juego")).toHaveAttribute(
    "data-fase",
    "jugando",
    { timeout: 20_000 },
  );

  // Las cinco zonas existen con su forma escrita (el color no va solo).
  for (const v of ["a", "e", "i", "o", "u"]) {
    await expect(page.getByTestId(`zona-${v}`)).toBeVisible();
  }
  await expect(page.getByTestId("zona-a")).toContainText("círculo");

  // Alguna zona se enciende y el texto dice «quizás», jamás un veredicto.
  await expect(page.getByTestId("vocal-actual")).toContainText("Quizás suena como", {
    timeout: 25_000,
  });
  await expect(page.locator('[data-testid^="zona-"][data-encendida="true"]')).toHaveCount(1);

  // Jugando también pasa axe (letra + forma + color, contraste AA), en claro y oscuro.
  for (const esquema of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme: esquema });
    const { violations } = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
  }

  // Con varias vocales que pasaron, el conteo honesto aparece.
  await expect(page.getByTestId("vocales-conteo")).toBeVisible({ timeout: 25_000 });

  await page.getByTestId("terminar").click();
  await expect(page.getByTestId("celebracion")).toBeVisible();
  const metrica = await page.getByTestId("metrica-real").innerText();
  expect(metrica).toMatch(/^[1-5] zonas? del mapa$/);
});

test("en modo calma no hay conteo ni texto de lectura, y sin vocales no se inventa nada", async ({
  page,
}) => {
  await page.goto("/jugar/vocales");
  await page.getByTestId("empezar-juego").click();
  await page.getByTestId("modo-calma").click();
  await expect(page.getByTestId("juego")).toHaveAttribute(
    "data-fase",
    "jugando",
    { timeout: 20_000 },
  );
  await expect(page.getByTestId("vocales-conteo")).toHaveCount(0);
  await expect(page.getByTestId("vocal-actual")).toHaveText("");
});
