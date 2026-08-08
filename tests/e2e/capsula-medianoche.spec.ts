import { expect, test } from "@playwright/test";

// El bug de la medianoche (2026-08-08, cazado por el usuario GRABANDO un video para la
// familia): la pestaña quedó abierta de un día para otro y cada toque de «Sí, ya lo
// hicimos» sumaba un «día» sin marcar nunca la cápsula — la asignación guardada era la de
// ayer, así que el selector servía una cápsula efímera nueva tras cada marca y el botón
// renacía virgen. Este e2e reproduce la noche real con el reloj falso de Playwright y
// protege la garantía completa: marcar sella el día, el botón no renace, y el contador
// cuenta días únicos (no toques).

test("la pestaña que cruza la medianoche no convierte el botón en un contador infinito", async ({
  page,
}) => {
  // La noche del video: la app se abre a las 11:50 pm.
  await page.clock.install({ time: new Date("2026-08-07T23:50:00") });

  await page.goto("/");
  await page.getByRole("textbox", { name: /cómo le dicen/i }).fill("Peque");
  await page.getByRole("button", { name: "Animales" }).click();
  await page.getByTestId("terminar-onboarding").click();

  const marcar = page.getByTestId("marcar-hecha");
  const completada = page.getByTestId("capsula-completada");
  await expect(marcar).toBeVisible();

  // …y a las 12:10 am sigue abierta. El padre marca la actividad que tiene enfrente.
  await page.clock.setFixedTime(new Date("2026-08-08T00:10:00"));
  await marcar.click();

  // La marca cuenta UN día. Como amaneció, la app ofrece la cápsula NUEVA de hoy (eso es
  // correcto: «la cápsula solo cambia cuando cambia el día») — el padre también la hace.
  await expect(page.getByTestId("historial")).toContainText(
    "Han practicado juntos 1 día en total",
  );
  if (await marcar.isVisible()) {
    await marcar.click();
  }

  // Y AQUÍ estaba el bucle: tras marcar, el botón renacía virgen otra vez, para siempre.
  // Ahora el día quedó sellado: marcada, sin botón, y el contador dice la verdad.
  await expect(completada).toBeVisible();
  await expect(marcar).not.toBeVisible();
  await expect(page.getByTestId("historial")).toContainText(
    "Han practicado juntos 2 días en total",
  );

  // Recargar no resucita el botón ni mueve el número.
  await page.clock.setFixedTime(new Date("2026-08-08T00:12:00"));
  await page.reload();
  await expect(completada).toBeVisible();
  await expect(page.getByTestId("marcar-hecha")).not.toBeVisible();
  await expect(page.getByTestId("historial")).toContainText(
    "Han practicado juntos 2 días en total",
  );
});

// La otra cara del mismo defecto: la PWA que quedó abierta desde anoche y DESPIERTA hoy.
// Sin re-asignar al despertar, la pantalla mostraba la cápsula de ayer (ya marcada) como
// si el día nuevo no existiera.
test("la pestaña que despierta en otro día ofrece la cápsula de hoy, no la de ayer", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-08-07T10:00:00") });

  await page.goto("/");
  await page.getByRole("textbox", { name: /cómo le dicen/i }).fill("Peque");
  await page.getByRole("button", { name: "Animales" }).click();
  await page.getByTestId("terminar-onboarding").click();

  // Ayer se practicó y quedó marcada: pantalla en reposo, sin botón.
  await page.getByTestId("marcar-hecha").click();
  await expect(page.getByTestId("capsula-completada")).toBeVisible();

  // Amanece con la pestaña dormida; el padre vuelve a la app.
  await page.clock.setFixedTime(new Date("2026-08-08T08:00:00"));
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));

  // La app despertó en HOY: cápsula nueva por hacer, y el día de ayer intacto.
  await expect(page.getByTestId("marcar-hecha")).toBeVisible();
  await expect(page.getByTestId("capsula-completada")).not.toBeVisible();
  await expect(page.getByTestId("historial")).toContainText(
    "Han practicado juntos 1 día en total",
  );
});
