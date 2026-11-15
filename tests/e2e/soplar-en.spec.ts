import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "./base";

// BLOWING, in English (S12, rule 20). Same fake microphone as soplar.spec.ts (three blows, a vowel and a
// «sh» that must not count). The device is in English: the adult script comes first, the live counter and the
// celebration say the SAME number, never a «no», and axe passes in both themes while playing and celebrating.

test.use({ locale: "en-US" });

test("Blowing counts real blows in English and celebrates only that", async ({ page }) => {
  await page.goto("/jugar/soplar");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByTestId("empezar-juego")).toBeEnabled();
  await expect(page.getByText("Go first, with your lips")).toBeVisible();

  await page.getByTestId("empezar-juego").click();
  await expect(page.getByTestId("juego")).toHaveAttribute("data-fase", "jugando", { timeout: 20_000 });
  await expect(page.getByTestId("soplos")).toContainText("Blows I heard:", { timeout: 25_000 });
  await expect(page.getByTestId("soplos")).toContainText(/[1-9]\d* blows?/);

  for (const esquema of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme: esquema });
    const { violations } = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
  }
  await expect(page.getByTestId("juego")).not.toContainText(/wrong|incorrect|you lost|game over/i);

  await page.getByTestId("terminar").click();
  await expect(page.getByTestId("celebracion")).toBeVisible();
  expect(await page.getByTestId("metrica-real").innerText()).toMatch(/^[1-9]\d* times?$/);
  // No Spanish interface words on an English screen.
  expect(await page.locator("main").innerText()).not.toMatch(/\b(Empezar|Sopló|veces|soplos)\b/);

  for (const esquema of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme: esquema });
    const { violations } = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
  }
});
