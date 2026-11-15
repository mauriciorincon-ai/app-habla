import { expect, test } from "./base";
import { axeLimpio, sembrar } from "./su-mundo-ayuda";

// THEIR WORLD EVERYWHERE (S14, ADR-026), in English (rule 20: the sprint's e2e ran in Spanish, this closes
// the milestone's other language). Invented profiles. English is practised in English: the words to model
// come from the goal in English, the companion has an English name, and the reminder card speaks English.

test.use({ locale: "en-US", serviceWorkers: "block" });

test("in English the companion has an English name and the guide card models the goal's English words", async ({
  page,
}) => {
  await sembrar(page, { temas: ["dinosaurios"], objetivo: "colors" });
  await page.goto("/jugar/globo");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByTestId("guion-modele")).toContainText("Model a word from their goal:");
  await expect(page.getByTestId("guion-modele")).toContainText("red · blue · yellow · green");
  await page.getByTestId("empezar-juego").click();
  await expect(page.getByTestId("juego")).toHaveAttribute("data-fase", "jugando", { timeout: 20_000 });
  const p = page.getByTestId("protagonista");
  await expect(p).toHaveAttribute("data-tema", "dinosaurios");
  await expect(p).toHaveAttribute("aria-label", /dinosaur/i);
  // The prompter proposes the words only in the adult's turn.
  await expect(page.getByTestId("apuntador-palabras")).toHaveCount(0);
  await page.getByTestId("cambiar-turno").click();
  await expect(page.getByTestId("apuntador-palabras")).toContainText("You could say: red · blue");
  await axeLimpio(page);
});

test("in English the stories reminder is an adult card on Today and «Not now» hides it", async ({ page }) => {
  await sembrar(page, { temas: ["mar"] });
  await page.goto("/");
  const tarjeta = page.getByTestId("recordatorio-cuentos");
  await expect(tarjeta).toBeVisible();
  await expect(page.getByTestId("recordatorio-pedir")).toHaveText("Order this month's stories");
  await axeLimpio(page);
  await page.getByTestId("recordatorio-ahora-no").click();
  await expect(tarjeta).toHaveCount(0);
});

test("in English the profile keeps «Other things they love» in one place and Stories only reads it", async ({
  page,
}) => {
  await sembrar(page, { temas: ["animales"], otrasCosas: ["trains"] });
  await page.goto("/ajustes");
  await expect(page.getByTestId("perfil-otras-cosas")).toContainText("trains");
  await page.goto("/cuentos");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.goto("/estudio/cuentos");
  await expect(page.getByTestId("cuentos-intereses")).toContainText("trains");
  await expect(page.getByTestId("cuentos-ir-al-perfil")).toBeVisible();
});
