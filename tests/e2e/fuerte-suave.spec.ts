import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "./base";

// FUERTE Y SUAVE (S12, ADR-024). Corre en `desktop-chromium-fuerte-suave`: el micrófono falso alterna una
// voz suave y una fuerte (scripts/gen-senales-soplo.mjs; tests/unit/senales-e2e.test.ts cuenta, exacto,
// 4 cambios por pasada). Lo que garantiza: la barra celebra los CAMBIOS y nunca un volumen «correcto»; el
// nivel se dice con texto y símbolo (el color nunca va solo); la celebración dice el mismo número.

test("Fuerte y suave celebra los cambios, nombra el nivel con texto y símbolo, y pasa axe", async ({
  page,
}) => {
  await page.goto("/jugar/fuerte-suave");
  await expect(page.getByTestId("empezar-juego")).toBeEnabled();
  await expect(page.getByText("Hágalo usted primero")).toBeVisible();

  await page.getByTestId("empezar-juego").click();
  await expect(page.getByTestId("calibrando")).toBeVisible();
  await expect(page.getByTestId("juego")).toHaveAttribute("data-fase", "jugando", { timeout: 20_000 });
  await expect(page.getByTestId("juego")).toHaveAttribute("data-juego", "fuerte-suave");

  // El nivel siempre tiene su palabra: suave, fuerte o en silencio.
  await expect(page.getByTestId("nivel-voz")).toContainText(/suave|fuerte|en silencio/);
  // Los cambios aparecen cuando de verdad pasaron.
  await expect(page.getByTestId("cambios-voz")).toContainText("Cambios entre suave y fuerte", { timeout: 25_000 });

  // No hay un volumen «correcto»: ningún texto de meta, de acierto o de error.
  await expect(page.getByTestId("juego")).not.toContainText(/correcto|incorrecto|muy bien|perdiste|se acab/i);

  for (const esquema of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme: esquema });
    const { violations } = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
  }

  await page.getByTestId("terminar").click();
  await expect(page.getByTestId("celebracion")).toBeVisible();
  const metrica = await page.getByTestId("metrica-real").innerText();
  expect(metrica).toMatch(/^[1-9]\d* (vez|veces)$/);
  await expect(page.getByTestId("celebracion")).toContainText("entre suave y fuerte");

  for (const esquema of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme: esquema });
    const { violations } = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
  }

  const guardado = await page.evaluate(() => window.localStorage.getItem("habla:v1:sesiones"));
  const sesiones = JSON.parse(guardado!).sesiones as Array<Record<string, unknown>>;
  const ultima = sesiones[sesiones.length - 1]!;
  expect(Object.keys(ultima).sort()).toEqual(["cambios", "fecha", "juego"]);
});

test("en modo calma no hay conteo de cambios", async ({ page }) => {
  await page.goto("/jugar/fuerte-suave");
  await page.getByTestId("empezar-juego").click();
  await page.getByTestId("modo-calma").click();
  await expect(page.getByTestId("juego")).toHaveAttribute("data-fase", "jugando", { timeout: 20_000 });
  await expect(page.getByTestId("cambios-voz")).toHaveCount(0);
  await expect(page.getByTestId("nivel-voz")).toBeVisible();
});
