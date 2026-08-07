import { expect, test } from "@playwright/test";

// LAS ETAPAS DEL HABLA (Outcome 1, ADR 006). Lo que este test blinda:
//   - "Palabras sueltas" es el DEFAULT: nadie tiene que elegir nada para que la app funcione.
//   - "Primeras frases" NUNCA se activa sola (ADR 005): hay que elegirla a mano.
//   - Cambiar de etapa cambia la cápsula del día y NO BORRA NADA.

async function pasarOnboarding(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.getByRole("textbox", { name: /cómo le dicen/i }).fill("Peque");
  await page.getByRole("button", { name: "Animales" }).click();
  await page.getByTestId("terminar-onboarding").click();
  await expect(page.getByTestId("capsula")).toBeVisible();
}

// EL HALLAZGO DEL GATE (usuario, 2026-07-12): la etapa se puede cambiar... si encuentras Ajustes.
// Era un texto gris AL PIE de "Hoy", debajo de la tarjeta de juegos: el usuario no lo halló en dos
// sprints seguidos. Ningún e2e lo cazó porque TODOS entraban por URL (`goto("/ajustes")`) — se
// saltaban justo el camino que le falló a él. Este test llega a la etapa como llega un humano:
// mirando la pantalla de Hoy y tocando lo que ve, sin scroll y sin saberse la URL.
test("desde Hoy se llega a la etapa del habla SIN saberse la URL y sin bajar la página", async ({
  page,
}) => {
  await pasarOnboarding(page);

  // Completar el onboarding (tocar el botón del final del formulario) puede dejar la página
  // desplazada; el usuario aterriza en su Hoy y mira desde arriba. Nos ponemos en el tope y
  // verificamos que Ajustes esté AHÍ, visible — no enterrado al pie (el defecto que este test caza).
  await page.evaluate(() => window.scrollTo(0, 0));
  const entrada = page.getByTestId("ir-a-ajustes");
  await expect(entrada).toBeInViewport(); // visible arriba, sin bajar la página
  await entrada.click();

  await expect(
    page.getByRole("heading", { name: /cómo habla su hijo hoy/i }),
  ).toBeVisible();
  await expect(page.getByTestId("etapa-sonidos-e-intentos")).toBeVisible();
});

test("por defecto la app está en palabras sueltas, sin que nadie elija nada (ADR 005)", async ({
  page,
}) => {
  await pasarOnboarding(page);
  await expect(page.getByTestId("etiqueta-etapa")).toHaveText(
    "Palabras sueltas",
  );

  await page.goto("/ajustes");
  await expect(page.getByTestId("etapa-palabras-sueltas")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  // Las otras dos NO están activas: "primeras frases" jamás se enciende sola.
  await expect(page.getByTestId("etapa-primeras-frases")).toHaveAttribute(
    "aria-pressed",
    "false",
  );
});

test("cambiar de etapa cambia la cápsula del día y NO borra el progreso", async ({
  page,
}) => {
  await pasarOnboarding(page);

  // Deja huella: marca la cápsula de hoy como hecha.
  const tituloPalabras = await page.getByTestId("capsula-titulo").innerText();
  await page.getByTestId("marcar-hecha").click();
  await expect(page.getByTestId("capsula-completada")).toBeVisible();

  // El padre elige otra etapa (elección EXPLÍCITA).
  await page.goto("/ajustes");
  await page.getByTestId("etapa-sonidos-e-intentos").click();
  await expect(page.getByTestId("etapa-sonidos-e-intentos")).toHaveAttribute(
    "aria-pressed",
    "true",
  );

  // "Hoy" sirve una cápsula de la etapa nueva…
  await page.goto("/");
  await expect(page.getByTestId("etiqueta-etapa")).toHaveText(
    "Sonidos e intentos",
  );
  await expect(page.getByTestId("capsula-titulo")).not.toHaveText(
    tituloPalabras,
  );
  // …y esa cápsula está pendiente (es otra etapa, con su propio ciclo).
  await expect(page.getByTestId("marcar-hecha")).toBeVisible();

  // El historial NO se perdió: el día practicado sigue contado.
  await expect(page.getByTestId("historial")).toContainText("1 día");

  // Y al volver a palabras sueltas, la cápsula de hoy es la MISMA de antes, y sigue hecha.
  await page.goto("/ajustes");
  await page.getByTestId("etapa-palabras-sueltas").click();
  await page.goto("/");
  await expect(page.getByTestId("capsula-titulo")).toHaveText(tituloPalabras);
  await expect(page.getByTestId("capsula-completada")).toBeVisible();
});

test("la etapa elegida sobrevive a la recarga", async ({ page }) => {
  await pasarOnboarding(page);
  await page.goto("/ajustes");
  await page.getByTestId("etapa-primeras-frases").click();

  await page.reload();
  await expect(page.getByTestId("etapa-primeras-frases")).toHaveAttribute(
    "aria-pressed",
    "true",
  );

  await page.goto("/");
  await expect(page.getByTestId("etiqueta-etapa")).toHaveText(
    "Primeras frases",
  );
});
