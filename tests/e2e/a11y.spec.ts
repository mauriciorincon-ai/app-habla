import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// Gate 6 (UX/A11y): axe sin violaciones en las 3 rutas, en móvil y desktop.
// El juego además se audita EN VIVO (paleta del niño y modo calma tienen sus propios colores:
// auditar solo la pantalla del padre dejaría el contraste del niño sin vigilancia).

const RUTAS = [
  "/",
  "/jugar",
  "/jugar/globo",
  "/jugar/cohete",
  "/jugar/palabras",
  "/jugar/gemelas",
  "/estudio",
  "/ajustes",
];

// Los dos esquemas: la paleta del padre tiene modo oscuro, y sus colores de estado NO son los
// mismos que en claro. Auditar solo el claro dejaba pasar violaciones reales (el botón de
// "Borrar mis datos" daba 3.1:1 sobre fondo oscuro).
const ESQUEMAS = ["light", "dark"] as const;

for (const ruta of RUTAS) {
  for (const esquema of ESQUEMAS) {
    test(`axe limpio en ${ruta} (tema ${esquema})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: esquema });
      await page.goto(ruta);
      // Espera a que hidrate: el contenido real llega tras leer el almacenamiento local.
      await page.waitForFunction(() => document.readyState === "complete");

      const { violations } = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

      expect(violations).toEqual([]);
    });
  }
}

test("axe limpio dentro del juego (paleta del niño y modo calma)", async ({
  page,
}) => {
  await page.goto("/jugar/globo");
  await page.getByTestId("empezar-juego").click();

  // Escenario del niño, con su paleta clara.
  await page.waitForFunction(
    () =>
      document
        .querySelector('[data-testid="juego"]')
        ?.getAttribute("data-fase") === "jugando",
    undefined,
    { timeout: 20_000 },
  );

  const enJuego = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(enJuego.violations).toEqual([]);

  // Modo calma: cambia la paleta, así que se audita aparte.
  await page.getByTestId("modo-calma").click();
  await page.waitForFunction(
    () =>
      document
        .querySelector('[data-testid="juego"]')
        ?.getAttribute("data-calma") === "true",
  );

  const enCalma = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(enCalma.violations).toEqual([]);
});
