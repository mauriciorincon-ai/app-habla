import { mkdirSync } from "node:fs";
import path from "node:path";
import { AxeBuilder } from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// THE H-2 IN ENGLISH (S11, rule 20: e2e and screenshots in ONE language per sprint, the other at the
// milestone's close). Every screen of the H-2 with the device in English: `lang` is «en», no Spanish
// interface words leak into the page, no serious axe violation, and a screenshot per screen that the
// builder READS as an image (they are written to test-results/h2-en/, never committed).

const PERFIL = { apodo: "Luna", temas: ["animales"] };
const FUERA = path.resolve(__dirname, "../../test-results/h2-en");

// Interface words of the Spanish app that must never show on an English screen.
const ESPANOL = /\b(Empezar|Ajustes|Jugar|Guardar|Borrar|Atrás|Siguiente|Hoy|Cuentos|Videoteca|Imprimir|Objetivo de la semana)\b/;

const PANTALLAS: { ruta: string; nombre: string }[] = [
  { ruta: "/", nombre: "hoy" },
  { ruta: "/jugar", nombre: "selector" },
  { ruta: "/jugar/globo", nombre: "globo" },
  { ruta: "/jugar/cohete", nombre: "cohete" },
  { ruta: "/jugar/palabras", nombre: "palabras" },
  { ruta: "/jugar/gemelas", nombre: "gemelas" },
  { ruta: "/jugar/vocales", nombre: "vocales" },
  { ruta: "/estudio", nombre: "estudio" },
  { ruta: "/estudio/videos", nombre: "videoteca" },
  { ruta: "/estudio/cuentos", nombre: "cuentos-estudio" },
  { ruta: "/estudio/imprimibles", nombre: "imprimibles" },
  { ruta: "/cuentos", nombre: "cuentos" },
  { ruta: "/rumbo", nombre: "rumbo" },
  { ruta: "/objetivo", nombre: "objetivo" },
  { ruta: "/ajustes", nombre: "ajustes" },
];

for (const tema of ["claro", "oscuro"] as const) {
  test(`el H-2 entero en inglés · tema ${tema}`, async ({ browser }) => {
    const ctx = await browser.newContext({
      locale: "en-US",
      colorScheme: tema === "claro" ? "light" : "dark",
      serviceWorkers: "block",
    });
    await ctx.addInitScript((perfil) => {
      if (!localStorage.getItem("habla:v1:perfil"))
        localStorage.setItem("habla:v1:perfil", JSON.stringify(perfil));
    }, PERFIL);
    const page = await ctx.newPage();
    mkdirSync(FUERA, { recursive: true });
    for (const { ruta, nombre } of PANTALLAS) {
      await page.goto(ruta);
      await expect(page.locator("html"), ruta).toHaveAttribute("lang", "en");
      await expect(page.locator("main"), ruta).toBeVisible();
      const texto = await page.locator("main").innerText();
      expect(texto, `${ruta} must not show Spanish interface words`).not.toMatch(ESPANOL);
      const r = await new AxeBuilder({ page }).analyze();
      expect(
        r.violations
          .filter((v) => v.impact === "serious" || v.impact === "critical")
          .map((v) => `${ruta}: ${v.id}`),
      ).toEqual([]);
      await page.screenshot({
        path: path.join(FUERA, `${nombre}-${tema}-${test.info().project.name}.png`),
        fullPage: true,
      });
    }
    await ctx.close();
  });
}

test("en inglés, la sección «Did they say the word?» de Ajustes se lee en inglés y viene apagada", async ({ browser }) => {
  const ctx = await browser.newContext({ locale: "en-US", serviceWorkers: "block" });
  const page = await ctx.newPage();
  await page.goto("/ajustes");
  const seccion = page.getByTestId("seccion-reconocedor");
  await expect(seccion).toBeVisible();
  await expect(seccion).toContainText("Did they say the word?");
  await expect(page.getByTestId("reconocedor")).toHaveAttribute("aria-checked", "false");
  await ctx.close();
});
