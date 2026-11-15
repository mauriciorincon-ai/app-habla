import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "./base";

// SOPLAR (S12, ADR-024). Corre en `desktop-chromium-soplo`: el micrófono falso reproduce tres soplos con
// una vocal y una «sh» entre ellos (scripts/gen-senales-soplo.mjs; tests/unit/senales-e2e.test.ts cuenta,
// exacto, 3 por pasada). Lo que garantiza: el guion del adulto antes del juego, el molino gira solo con lo
// medido, el contador vivo y la celebración dicen EL MISMO número, jamás un «no», y el estado se guarda como
// solo contadores.

test("Soplar cuenta soplos de verdad, celebra solo eso y pasa axe jugando y celebrando", async ({
  page,
}) => {
  await page.goto("/jugar/soplar");
  // El guion del adulto precede al juego.
  await expect(page.getByTestId("empezar-juego")).toBeEnabled();
  await expect(page.getByText("Hágalo usted primero")).toBeVisible();

  await expect(page.getByTestId("guion-turnos")).toBeVisible();
  await page.getByTestId("empezar-juego").click();
  await expect(page.getByTestId("calibrando")).toBeVisible();
  await expect(page.getByTestId("juego")).toHaveAttribute("data-fase", "jugando", { timeout: 20_000 });
  await expect(page.getByTestId("juego")).toHaveAttribute("data-juego", "soplar");
  // S13: el guion avisó de los turnos y el juego trae su franja e indicador (nace en su turno).
  await expect(page.getByTestId("franja-apuntador")).toHaveAttribute("data-turno", "nino");
  await expect(page.getByTestId("indicador-turno")).toBeVisible();

  // El primer soplo aparece en el contador vivo, con texto (el color no va solo).
  await expect(page.getByTestId("soplos")).toContainText("Soplos que oí", { timeout: 25_000 });
  await expect(page.getByTestId("soplos")).toContainText(/[1-9]\d* sopl(o|os)/);

  // Jugando, en claro y oscuro: paleta del niño, molino, medidor.
  for (const esquema of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme: esquema });
    const { violations } = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
  }

  // Jamás un «no» ni un game-over a la vista del niño.
  await expect(page.getByTestId("juego")).not.toContainText(/incorrecto|equivocad|perdiste|se acab/i);

  await page.getByTestId("terminar").click();
  await expect(page.getByTestId("celebracion")).toBeVisible();
  const metrica = await page.getByTestId("metrica-real").innerText();
  expect(metrica).toMatch(/^[1-9]\d* (vez|veces)$/);

  // La celebración congelada también pasa axe (texto de celebración ≥ 4,5:1), en los dos esquemas.
  for (const esquema of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme: esquema });
    const { violations } = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
  }

  // Lo que se guarda son contadores: soplos y ms. Ni señal ni fuerza ni audio.
  const guardado = await page.evaluate(() => window.localStorage.getItem("habla:v1:sesiones"));
  const sesiones = JSON.parse(guardado!).sesiones as Array<Record<string, unknown>>;
  const ultima = sesiones[sesiones.length - 1]!;
  expect(Object.keys(ultima).sort()).toEqual(["fecha", "juego", "soploMs", "soplos", "turnosNino"]);
  expect(ultima.juego).toBe("soplar");
});

test("en modo calma no hay contador, y sin soplos no se inventa nada", async ({ page }) => {
  await page.goto("/jugar/soplar");
  await page.getByTestId("empezar-juego").click();
  await page.getByTestId("modo-calma").click();
  await expect(page.getByTestId("juego")).toHaveAttribute("data-fase", "jugando", { timeout: 20_000 });
  await expect(page.getByTestId("soplos")).toHaveCount(0);
  // Sin medidor visible en calma.
  await expect(page.getByTestId("medidor")).toHaveCount(0);
});

test("con «reducir animaciones» el árbol es el mismo y el juego sigue contando", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "habla:v1:ajustes",
      JSON.stringify({ reducirAnimaciones: true }),
    );
  });
  await page.goto("/jugar/soplar");
  await page.getByTestId("empezar-juego").click();
  await expect(page.getByTestId("juego")).toHaveAttribute("data-fase", "jugando", { timeout: 20_000 });
  await expect(page.getByTestId("molino")).toBeAttached();
  await expect(page.getByTestId("escenario")).toBeVisible();
  await expect(page.getByTestId("soplos")).toBeVisible({ timeout: 25_000 });
});
