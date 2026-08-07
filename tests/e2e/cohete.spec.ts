import { expect, test } from "@playwright/test";

// EL COHETE DEL TONO (Outcome 2). Corre en el proyecto `desktop-chromium-tono`, cuyo micrófono
// falso CANTA: un barrido continuo 230↔420 Hz (sube·baja·sube·baja = 3 inversiones).
//
// Lo que este test garantiza: el cohete se mueve con el TONO (no con el volumen), el juego NO se
// cierra solo (ADR-013: cada subida-y-bajada es un HITO celebrado en vivo) y la celebración
// cuenta las inversiones REALES — jamás un elogio vacío.

/** Lee la traslación vertical del cohete (px). Negativo = arriba. */
async function alturaDelCohete(page: import("@playwright/test").Page) {
  const transform = await page
    .getByTestId("cohete")
    .evaluate((el) => el.style.transform);
  const y = /translateY\((-?[\d.]+)px\)/.exec(transform)?.[1];
  return y ? parseFloat(y) : 0;
}

test("la voz que sube de tono sube el cohete, los hitos se celebran en vivo y el padre cierra", async ({
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

  // Sin meta que corte el juego (ADR-013): cada subida-y-bajada es un HITO celebrado en vivo —
  // el contador honesto y el confeti al instante; la capa de cielo pasa en la SIGUIENTE subida
  // (el mundo solo corre mientras el cohete sube — re-mirada del gate F). Todos quedan en el
  // DOM hasta el hito siguiente: las aserciones no dependen del timing. El juego SIGUE jugando.
  const subidas = page.getByTestId("subidas");
  await expect(subidas).toBeVisible({ timeout: 30_000 });
  await expect(subidas).toContainText(/vez|veces/);
  await expect(page.getByTestId("confeti-vuelta")).toBeAttached();
  await expect(page.getByTestId("capa-cielo")).toBeAttached({
    timeout: 15_000,
  });
  await expect(juego).toHaveAttribute("data-fase", "jugando");
  const contadas = parseInt(
    (await subidas.innerText()).replace(/\D+/g, " ").trim(),
    10,
  );

  // El intento lo cierra el padre. La celebración dice EL MISMO número (o más, si la voz siguió
  // subiendo y bajando entre la lectura y el toque) — jamás menos de lo celebrado en vivo.
  await page.getByTestId("terminar").click();
  await expect(page.getByTestId("celebracion")).toBeVisible();
  const metrica = await page.getByTestId("metrica-real").innerText();
  expect(metrica).toMatch(/^\d+ (vez|veces)$/);
  const veces = parseInt(metrica, 10);
  expect(veces).toBeGreaterThanOrEqual(contadas);
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

  // Pero sin hitos: en calma no hay contador, ni confeti, ni capa de cielo — solo flotar
  // (carga sensorial). Y por mucho que la voz suba y baje, no salta ninguna celebración.
  await page.waitForTimeout(6000);
  await expect(page.getByTestId("celebracion")).toHaveCount(0);
  await expect(page.getByTestId("subidas")).toHaveCount(0);
  await expect(page.getByTestId("confeti-vuelta")).toHaveCount(0);
});
