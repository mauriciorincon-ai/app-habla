import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "./base";

// SHORT SESSIONS, in English (S12, rule 20): the cap notice and the setting read in English, the notice is an
// adult-only `role="status"`, it never says «over», and it passes axe in both themes frozen on screen.

test.use({ locale: "en-US" });

const hoy = () => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

async function sembrar(page: import("@playwright/test").Page, ms: number, extra: object = {}) {
  await page.addInitScript(
    ({ fecha, ms, extra }) => {
      window.localStorage.setItem("habla:v1:pantalla", JSON.stringify({ fecha, ms, avisado: false }));
      if (Object.keys(extra).length) window.localStorage.setItem("habla:v1:ajustes", JSON.stringify(extra));
    },
    { fecha: hoy(), ms, extra },
  );
}

test("the cap notice and the setting read in English and never block", async ({ page }) => {
  await sembrar(page, 10 * 60_000 - 3000);
  await page.goto("/jugar/globo");
  await page.getByTestId("empezar-juego").click();
  await expect(page.getByTestId("juego")).toHaveAttribute("data-fase", "guion", { timeout: 25_000 });
  const aviso = page.getByTestId("aviso-tope");
  await expect(aviso).toBeVisible();
  await expect(aviso).toContainText("You've played as much as you planned today");
  await expect(aviso).toContainText("It's your call");
  await expect(aviso).not.toContainText(/game over|forbidden|blocked|punish/i);
  for (const esquema of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme: esquema });
    const { violations } = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
  }
  await page.getByTestId("empezar-juego").click();
  await expect(page.getByTestId("juego")).toHaveAttribute("data-fase", "jugando", { timeout: 20_000 });
  await page.getByTestId("salir-al-guion").click();
  await expect(page.getByTestId("hoy-jugaron")).toContainText("You've played");

  await page.goto("/ajustes");
  await expect(page.getByText("Short sessions")).toBeVisible();
  await expect(page.getByTestId("tope-7")).toContainText("7 minutes");
  await page.getByTestId("tope-7").click();
  await expect(page.getByTestId("tope-7")).toHaveAttribute("aria-pressed", "true");
});
