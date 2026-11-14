import { readFileSync } from "node:fs";
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// «Pasar a la otra casa» (S10, ADR-020), de punta a punta en español, con DOS aparatos (dos contextos
// del navegador) y un perfil inventado. La casa A crea el archivo cifrado; la casa B lo rechaza con la
// frase equivocada sin tocar nada, y con la buena ve qué cambia, confirma y lo tiene. Nada sale a la red.

const FRASE = "el tren azul de los martes";
const APODO_INVENTADO = "Pipo";

async function sinRed(page: Page, baseURL: string, fuera: string[]) {
  await page.context().route("**/*", async (route) => {
    const url = route.request().url();
    if (!url.startsWith(baseURL)) {
      fuera.push(url);
      await route.abort();
      return;
    }
    await route.continue();
  });
}

const almacen = (page: Page) =>
  page.evaluate(() =>
    Object.fromEntries(
      Object.keys(localStorage)
        .filter((k) => k.startsWith("habla:"))
        .sort()
        .map((k) => [k, localStorage.getItem(k)]),
    ),
  );

test("la casa A crea el archivo; la casa B lo abre solo con la frase y confirma", async ({ browser, baseURL }, testInfo) => {
  test.setTimeout(90_000);
  const fuera: string[] = [];

  // ── Casa A ────────────────────────────────────────────────────────────────────────────────
  const casaA = await browser.newContext({ locale: "es-CO" });
  const a = await casaA.newPage();
  await sinRed(a, baseURL!, fuera);
  await a.goto("/");
  await a.evaluate((apodo) => {
    localStorage.setItem("habla:v1:perfil", JSON.stringify({ apodo, temas: ["animales"] }));
    localStorage.setItem("habla:v1:objetivo", JSON.stringify({ texto: "animales", desde: "2026-11-10" }));
    localStorage.setItem(
      "habla:v1:sesiones",
      JSON.stringify({ sesiones: [{ juego: "globo", fecha: "2026-11-12", vozMs: 4000, rachaMs: 2000 }] }),
    );
  }, APODO_INVENTADO);
  await a.goto("/ajustes");
  const seccionA = a.getByTestId("otra-casa");
  await expect(seccionA).toBeVisible();
  await expect(seccionA).toContainText("Nunca viaja la voz de su hijo");

  // La frase corta y la repetida distinta no crean nada.
  await a.getByTestId("otra-casa-frase").fill("corta");
  await a.getByTestId("otra-casa-crear").click();
  await expect(a.getByTestId("otra-casa-crear-estado")).toContainText("al menos diez");
  await a.getByTestId("otra-casa-frase").fill(FRASE);
  await a.getByTestId("otra-casa-frase-repetida").fill(`${FRASE}!`);
  await a.getByTestId("otra-casa-crear").click();
  await expect(a.getByTestId("otra-casa-crear-estado")).toContainText("no son iguales");

  await a.getByTestId("otra-casa-frase-repetida").fill(FRASE);
  const [descarga] = await Promise.all([a.waitForEvent("download"), a.getByTestId("otra-casa-crear").click()]);
  expect(descarga.suggestedFilename()).toMatch(/^habla-otra-casa-\d{4}-\d{2}-\d{2}\.habla$/);
  await expect(a.getByTestId("otra-casa-crear-estado")).toContainText("Archivo descargado");
  // Se guarda fuera del contexto: al cerrarlo, Playwright borra sus descargas.
  const ruta = testInfo.outputPath("habla-otra-casa.habla");
  await descarga.saveAs(ruta);
  const texto = readFileSync(ruta, "utf8");
  // Cifrado: ni la frase, ni el apodo, ni el objetivo se leen en el archivo.
  expect(texto).not.toContain(FRASE);
  expect(texto).not.toContain(APODO_INVENTADO);
  expect(texto).not.toContain("animales");
  expect(JSON.parse(texto).formato).toBe("habla-otra-casa");
  await casaA.close();

  // ── Casa B: otro aparato ──────────────────────────────────────────────────────────────────
  const casaB = await browser.newContext({ locale: "es-CO" });
  const b = await casaB.newPage();
  await sinRed(b, baseURL!, fuera);
  await b.goto("/");
  await b.evaluate(() => {
    localStorage.setItem("habla:v1:perfil", JSON.stringify({ temas: ["carros"] }));
    localStorage.setItem(
      "habla:v1:sesiones",
      JSON.stringify({ sesiones: [{ juego: "cohete", fecha: "2026-11-11", inversiones: 3 }] }),
    );
  });
  await b.goto("/ajustes");
  await expect(b.getByTestId("otra-casa")).toBeVisible();
  const antes = await almacen(b);

  // La frase equivocada: rechazado, nada cambia.
  await b.getByTestId("otra-casa-archivo").setInputFiles(ruta);
  await b.getByTestId("otra-casa-frase-abrir").fill("esta no es la frase");
  await b.getByTestId("otra-casa-abrir").click();
  await expect(b.getByTestId("otra-casa-error")).toContainText("La frase no abre este archivo");
  await expect(b.getByTestId("otra-casa-plan")).toHaveCount(0);
  expect(await almacen(b)).toEqual(antes);

  // La buena: el plan, y todavía nada escrito.
  await b.getByTestId("otra-casa-frase-abrir").fill(FRASE);
  await b.getByTestId("otra-casa-abrir").click();
  const plan = b.getByTestId("otra-casa-plan");
  await expect(plan).toContainText("«ninguno» → «animales»");
  await expect(plan).toContainText("Juegos practicados que se suman: 1");
  await expect(plan).toContainText("Nada de este aparato se borra");
  expect(await almacen(b)).toEqual(antes);

  for (const esquema of ["light", "dark"] as const) {
    await b.emulateMedia({ colorScheme: esquema });
    const { violations } = await new AxeBuilder({ page: b })
      .include('[data-testid="otra-casa"]')
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(violations, esquema).toEqual([]);
  }

  await b.getByTestId("otra-casa-confirmar").click();
  await expect(b.getByTestId("otra-casa-aviso")).toContainText("Listo");
  const despues = await almacen(b);
  expect(JSON.parse(despues["habla:v1:objetivo"]!).texto).toBe("animales");
  const sesiones = JSON.parse(despues["habla:v1:sesiones"]!).sesiones;
  expect(sesiones.map((s: { juego: string }) => s.juego).sort()).toEqual(["cohete", "globo"]);
  // El perfil de B es el suyo: el apodo de A no llegó.
  expect(despues["habla:v1:perfil"]).toBe(antes["habla:v1:perfil"]);
  expect(JSON.stringify(despues)).not.toContain(APODO_INVENTADO);
  await casaB.close();

  expect(fuera).toEqual([]);
});
