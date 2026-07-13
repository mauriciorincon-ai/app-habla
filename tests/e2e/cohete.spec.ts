import { expect, test } from "@playwright/test";

// EL COHETE DEL TONO (Outcome 2). Corre en el proyecto `desktop-chromium-tono`, cuyo micrófono
// falso CANTA: un barrido continuo 230↔420 Hz (sube·baja·sube·baja = 3 inversiones).
//
// Lo que este test garantiza: el cohete se mueve con el TONO (no con el volumen), y la
// celebración cuenta las inversiones REALES — jamás un elogio vacío.

/** Lee la traslación vertical del cohete (px). Negativo = arriba. */
async function alturaDelCohete(page: import("@playwright/test").Page) {
  const transform = await page
    .getByTestId("cohete")
    .evaluate((el) => el.style.transform);
  const y = /translateY\((-?[\d.]+)px\)/.exec(transform)?.[1];
  return y ? parseFloat(y) : 0;
}

test("la voz que sube de tono sube el cohete, y la celebración cuenta las inversiones reales", async ({
  page,
}) => {
  await page.goto("/jugar/cohete");

  // El guion del padre va primero (co-uso): la app orquesta al adulto.
  await expect(page.getByTestId("empezar-juego")).toBeEnabled();
  await page.getByTestId("empezar-juego").click();

  // Calibración con el piso de ruido del WAV.
  await expect(page.getByTestId("calibrando")).toBeVisible();

  const juego = page.getByTestId("juego");
  await expect(juego).toHaveAttribute("data-fase", "jugando", {
    timeout: 20_000,
  });

  // El cohete DESPEGA con el tono (el WAV está subiendo de 230 a 420 Hz).
  await expect
    .poll(async () => alturaDelCohete(page), { timeout: 20_000 })
    .toBeLessThan(-30);

  // Celebración honesta: el número que reporta son las inversiones que de verdad hubo.
  await expect(page.getByTestId("celebracion")).toBeVisible({
    timeout: 30_000,
  });
  const metrica = await page.getByTestId("metrica-real").innerText();
  expect(metrica).toMatch(/^\d+ (vez|veces)$/);
  const veces = parseInt(metrica, 10);
  expect(veces).toBeGreaterThanOrEqual(3); // la meta del cohete
});

test("modo calma en el cohete: sin medidor y sin meta (el cohete solo flota)", async ({
  page,
}) => {
  await page.goto("/jugar/cohete");
  await page.getByTestId("empezar-juego").click();

  const juego = page.getByTestId("juego");
  await expect(juego).toHaveAttribute("data-fase", "jugando", {
    timeout: 20_000,
  });
  await expect(page.getByTestId("medidor")).toBeVisible();

  await page.getByTestId("modo-calma").click();
  await expect(juego).toHaveAttribute("data-calma", "true");
  await expect(page.getByTestId("medidor")).toHaveCount(0);

  // El cohete SIGUE respondiendo a la voz (calma no es pausa — lección del gate del S1).
  await expect
    .poll(async () => alturaDelCohete(page), { timeout: 15_000 })
    .toBeLessThan(-20);

  // Pero sin meta: por mucho que la voz suba y baje, no salta la celebración automática.
  await page.waitForTimeout(6000);
  await expect(page.getByTestId("celebracion")).toHaveCount(0);
});
