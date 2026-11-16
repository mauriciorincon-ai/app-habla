import { expect, test, type Page } from "./base";

// «DID THEY SAY THE WORD?» in English (S11, ADR-023), through the UI with a fake microphone: `cat`, an adult
// Lingua Libre volunteer (CC BY-SA 4.0, never the family; tests/e2e/fixtures/palabras/mic-en.wav).
// Shows that the English model downloads, the adult's line reads “Maybe they said “cat”” only for that
// round, and nothing is shown for another picture.

const PALABRA = "cat";

async function encender(page: Page) {
  await page.goto("/ajustes");
  const interruptor = page.getByTestId("reconocedor");
  await expect(interruptor).toBeEnabled();
  await interruptor.click();
  await expect(interruptor).toHaveAttribute("aria-checked", "true", { timeout: 150_000 });
  await expect(page.getByTestId("reconocedor-estado")).toContainText("Ready in this language");
}

test.use({ locale: "en-US" });

test("in English: the recognizer downloads and the adult sees “Maybe they said “cat”” only in that round", async ({
  page,
}) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem("habla:v1:perfil"))
      localStorage.setItem("habla:v1:perfil", JSON.stringify({ apodo: "Luna", temas: ["animales"] }));
  });
  await encender(page);
  await page.goto("/jugar/palabras");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.getByTestId("empezar-juego").click();
  await expect(page.getByTestId("juego")).toHaveAttribute("data-fase", "jugando", { timeout: 30_000 });

  const palabraVisible = async () => (await page.getByTestId("palabra-del-picto").innerText()).trim();
  for (let i = 0; i < 40 && (await palabraVisible()) === PALABRA; i++)
    await page.getByTestId("siguiente-picto").click();
  await page.waitForTimeout(6000);
  await expect(page.getByTestId("quizas-dijo")).toHaveCount(0);

  for (let i = 0; i < 40 && (await palabraVisible()) !== PALABRA; i++)
    await page.getByTestId("siguiente-picto").click();
  await expect(page.getByTestId("quizas-dijo")).toContainText(`Maybe they said “${PALABRA}”`, {
    timeout: 30_000,
  });
});
