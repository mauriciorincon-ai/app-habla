import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// «Hojas para imprimir» (S10). Cada hoja lleva su pie de ARASAAC, ninguna lleva el apodo del niño
// (perfil inventado «Pipo» sembrado a propósito) ni el texto libre de la familia, y en papel solo
// quedan las hojas (emulación de `print`). Español únicamente (UN idioma por sprint).

const APODO = "Pipo";

test.beforeEach(async ({ page }) => {
  await page.addInitScript((apodo) => {
    localStorage.setItem(
      "habla:v1:perfil",
      JSON.stringify({ apodo, temas: ["animales"] }),
    );
    localStorage.setItem(
      "habla:v1:cuentos",
      JSON.stringify({
        intereses: ["trenecitos"],
        palabrasMeta: ["perro", "gato"],
        cuentos: [],
      }),
    );
  }, APODO);
});

test("cada hoja lleva su pie de ARASAAC, sin nombre ni texto de la familia", async ({
  page,
}) => {
  await page.goto("/estudio");
  await page.getByTestId("ir-a-imprimibles").click();
  await expect(page.getByTestId("hojas")).toBeVisible();

  const hojas = page.locator(".hoja");
  const pies = page.getByTestId("pie-arasaac");
  const n = await hojas.count();
  expect(n).toBeGreaterThanOrEqual(2); // al menos una de tarjetas y el tablero
  await expect(pies).toHaveCount(n);
  await expect(pies.first()).toContainText("Sergio Palao");
  await expect(pies.first()).toContainText("ARASAAC");

  // Las palabras meta encontraron su dibujo; el interés escrito por la familia no se imprime.
  const texto = await page.getByTestId("hojas").innerText();
  expect(texto).toContain("perro");
  expect(texto).toContain("gato");
  expect(texto).not.toContain(APODO);
  expect(texto).not.toContain("trenecitos");
  await expect(page.getByTestId("hoja-tablero")).toContainText("Mi turno");
  await expect(page.getByTestId("hoja-tablero")).toContainText("Tu turno");

  // El selector cambia el idioma de las hojas (practicar en inglés).
  await page.getByTestId("idioma-hojas-en").check();
  await expect(page.getByTestId("hoja-tablero")).toContainText("My turn");
  await expect(page.getByTestId("hojas")).toContainText("dog");
});

test("en papel solo quedan las hojas y la atribución, en claro y oscuro la vista pasa axe", async ({
  page,
}) => {
  await page.goto("/estudio/imprimibles");
  await expect(page.getByTestId("hojas")).toBeVisible();

  for (const esquema of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme: esquema });
    const { violations } = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
  }

  await page.emulateMedia({ media: "print" });
  await expect(page.getByTestId("imprimir")).toBeHidden();
  await expect(page.getByTestId("volver-a-estudio")).toBeHidden();
  const n = await page.locator(".hoja").count();
  await expect(page.locator(".hoja:visible")).toHaveCount(n);
  await expect(page.getByTestId("pie-arasaac")).toHaveCount(n);
  // Cada hoja ocupa su página.
  const saltos = await page
    .locator(".hoja")
    .evaluateAll((els) => els.slice(0, -1).map((e) => getComputedStyle(e).breakAfter));
  expect(saltos.every((s) => s === "page")).toBe(true);
});
