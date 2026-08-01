import { expect, test } from "@playwright/test";

// El camino completo del sprint, con micrófono falso real (el pipeline de audio se ejerce de
// verdad: getUserMedia → AudioWorklet → RMS → histéresis → celebración).
// Corre en móvil (Pixel 7) y desktop.

test("de la cápsula de hoy al juego: la voz mueve el globo y la celebración dice la verdad", async ({
  page,
}) => {
  // 1. Primera vez: onboarding local (sin cuentas).
  await page.goto("/");
  await expect(page.getByTestId("onboarding")).toBeVisible();

  await page.getByRole("textbox", { name: /cómo le dicen/i }).fill("Peque");
  await page.getByRole("button", { name: "Animales" }).click();
  await page.getByTestId("terminar-onboarding").click();

  // 2. La cápsula de hoy: técnica, guion accionable y fuente citada.
  const capsula = page.getByTestId("capsula");
  await expect(capsula).toBeVisible();
  const tituloDeHoy = await page.getByTestId("capsula-titulo").innerText();
  await expect(page.getByTestId("capsula-guion")).not.toBeEmpty();

  // 3. Al juego por la puerta PERMANENTE de "Hoy" (existe sea cual sea la cápsula del día —
  //    hallazgo del primer uso real). Desde el S2 esa puerta abre el SELECTOR de juegos, y de
  //    ahí se elige el globo; el guion del padre va PRIMERO.
  await page.getByTestId("ir-al-juego").click();
  await page.getByTestId("juego-globo").click();
  await expect(page.getByTestId("empezar-juego")).toBeEnabled();
  await page.getByTestId("empezar-juego").click();

  // 4. Calibración: 2 s midiendo el ruido de la casa (el WAV empieza en "silencio").
  await expect(page.getByTestId("calibrando")).toBeVisible();

  // 5. Jugando: el WAV entra en su ventana de voz y el globo despega.
  const juego = page.getByTestId("juego");
  await expect(juego).toHaveAttribute("data-fase", "jugando", {
    timeout: 20_000,
  });
  await expect(page.getByTestId("medidor")).toBeVisible();

  // 6. Sin meta que corte el juego (gate S4, hallazgo E6): al acumular 3 s de voz el globo da
  //    su primera VUELTA —se celebra en vivo, sin detener nada— y el juego sigue. El intento lo
  //    cierra el padre con "Ya jugamos".
  const vueltas = page.getByTestId("vueltas");
  await expect(vueltas).toBeVisible({ timeout: 20_000 });
  await expect(vueltas).toContainText("vuelta");
  await expect(juego).toHaveAttribute("data-fase", "jugando");

  // Cada vuelta estalla su confeti (re-mirada del gate S4). El estallido es determinista, corre
  // una vez y QUEDA en el DOM hasta la vuelta siguiente — la aserción no depende del timing.
  await expect(page.getByTestId("confeti-vuelta")).toBeAttached();

  await page.getByTestId("terminar").click();

  // Celebración honesta: reporta el tiempo REALMENTE sostenido, no un elogio vacío.
  await expect(page.getByTestId("celebracion")).toBeVisible();
  const metrica = await page.getByTestId("metrica-real").innerText();
  expect(metrica).toMatch(/^\d+(,\d)? segundos$/);
  const segundos = parseFloat(
    metrica.replace(",", ".").replace(" segundos", ""),
  );
  expect(segundos).toBeGreaterThanOrEqual(3); // al menos la vuelta que ya dio

  // 7. Marcar el día como hecho.
  await page.getByTestId("terminar-sesion").click();
  await expect(page.getByTestId("capsula-completada")).toBeVisible();

  // 8. La promesa del daily-coach: tras recargar, sigue completada y es LA MISMA cápsula.
  await page.reload();
  await expect(page.getByTestId("capsula-completada")).toBeVisible();
  await expect(page.getByTestId("capsula-titulo")).toHaveText(tituloDeHoy);
});

test("sin micrófono no hay pantalla rota: explica cómo habilitarlo", async ({
  browser,
}) => {
  // Contexto sin permiso de micrófono: getUserMedia será denegado.
  const context = await browser.newContext({ permissions: [] });
  await context.grantPermissions([]);
  const page = await context.newPage();

  // El flag --use-fake-ui-for-media-stream autoconcede; lo neutralizamos denegando por origen.
  await context.clearPermissions();
  await page.addInitScript(() => {
    navigator.mediaDevices.getUserMedia = () =>
      Promise.reject(new DOMException("Permission denied", "NotAllowedError"));
  });

  await page.goto("/jugar/globo");
  await page.getByTestId("empezar-juego").click();

  const denegado = page.getByTestId("mic-denegado");
  await expect(denegado).toBeVisible();
  await expect(denegado).toContainText("Permitir");
  await expect(page.getByTestId("reintentar-mic")).toBeVisible();

  await context.close();
});

test("modo calma en un toque: sin medidor y sin meta", async ({ page }) => {
  await page.goto("/jugar/globo");
  await page.getByTestId("empezar-juego").click();

  const juego = page.getByTestId("juego");
  await expect(juego).toHaveAttribute("data-fase", "jugando", {
    timeout: 20_000,
  });
  await expect(page.getByTestId("medidor")).toBeVisible();

  await page.getByTestId("modo-calma").click();

  await expect(juego).toHaveAttribute("data-calma", "true");
  await expect(page.getByTestId("medidor")).toHaveCount(0);

  // El globo NO se congela en calma: mientras el WAV suena, sube (translateY negativo).
  // (Hallazgo del gate 2026-07-12: la versión anterior lo dejaba clavado en el piso.)
  await expect
    .poll(
      async () => {
        const transform = await page
          .getByTestId("globo")
          .evaluate((el) => el.style.transform);
        const y = /,\s*(-?[\d.]+)px\)/.exec(transform)?.[1];
        return y ? parseFloat(y) : 0;
      },
      { timeout: 15_000 },
    )
    .toBeLessThan(-20);

  // Sin meta: aunque la voz siga sonando, no salta la celebración automática.
  await page.waitForTimeout(4000);
  await expect(page.getByTestId("celebracion")).toHaveCount(0);
});

test("salir del juego vuelve al GUION, y el guion sale al selector (gate S4)", async ({
  page,
}) => {
  await page.goto("/jugar/globo");
  // El guion tiene su salida estándar hacia el selector.
  await expect(page.getByTestId("volver-a-juegos")).toBeVisible();

  await page.getByTestId("empezar-juego").click();
  await expect(page.getByTestId("juego")).toHaveAttribute(
    "data-fase",
    "jugando",
    {
      timeout: 20_000,
    },
  );

  // "Salir" dentro del juego NO abandona la pantalla: trae de vuelta el guion del padre.
  await page.getByTestId("salir-al-guion").click();
  await expect(page.getByTestId("empezar-juego")).toBeVisible();

  // Y desde el guion, "← Juegos" sí lleva al selector de los cuatro.
  await page.getByTestId("volver-a-juegos").click();
  await expect(page.getByTestId("juego-globo")).toBeVisible();
});

test("los toques del niño son grandes (≥64 px) y no hay límite de tiempo", async ({
  page,
}) => {
  await page.goto("/jugar/globo");
  await page.getByTestId("empezar-juego").click();
  await expect(page.getByTestId("juego")).toHaveAttribute(
    "data-fase",
    "jugando",
    {
      timeout: 20_000,
    },
  );

  for (const testId of ["terminar", "recalibrar"]) {
    const caja = await page.getByTestId(testId).boundingBox();
    expect(caja?.height ?? 0).toBeGreaterThanOrEqual(64);
  }
});
