import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "./base";

// LOUD AND SOFT, in English (S12, rule 20). Same fake microphone as fuerte-suave.spec.ts (soft and loud, taking
// turns). The level always has its word (soft, loud, quiet), no volume is «right», and the celebration says
// the same number as the live counter.

test.use({ locale: "en-US" });

test("Loud and soft celebrates the changes in English and never a «right» volume", async ({ page }) => {
  await page.goto("/jugar/fuerte-suave");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByTestId("empezar-juego")).toBeEnabled();
  await expect(page.getByText("Go first and exaggerate")).toBeVisible();

  await page.getByTestId("empezar-juego").click();
  await expect(page.getByTestId("juego")).toHaveAttribute("data-fase", "jugando", { timeout: 20_000 });
  await expect(page.getByTestId("nivel-voz")).toContainText(/soft|loud|quiet/);
  await expect(page.getByTestId("cambios-voz")).toContainText("Changes between soft and loud", { timeout: 25_000 });
  await expect(page.getByTestId("juego")).not.toContainText(/correct|wrong|well done|you lost|game over/i);

  for (const esquema of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme: esquema });
    const { violations } = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
  }

  await page.getByTestId("terminar").click();
  await expect(page.getByTestId("celebracion")).toBeVisible();
  expect(await page.getByTestId("metrica-real").innerText()).toMatch(/^[1-9]\d* times?$/);
  await expect(page.getByTestId("celebracion")).toContainText("between soft and loud");
  expect(await page.locator("main").innerText()).not.toMatch(/\b(suave|fuerte|veces)\b/);

  for (const esquema of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme: esquema });
    const { violations } = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
  }
});
