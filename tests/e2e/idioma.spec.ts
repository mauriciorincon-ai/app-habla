import { AxeBuilder } from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// EL IDIOMA (S7, ADR-017). Los demás e2e corren en español (locale es-CO); este cubre el inglés:
//   · el dispositivo en inglés arranca en inglés (sigue al navegador) y `lang` es «en»;
//   · el conmutador de Ajustes cambia todo sin recargar y la elección sobrevive a un reload;
//   · la cápsula del día es la misma en los dos idiomas;
//   · en inglés los juegos de palabras muestran la línea honesta y NO abren el micrófono;
//   · cambiar de idioma no abre ninguna conexión hacia afuera.

/** Un perfil inventado, para saltar el primer uso (sin él, Hoy pide el apodo y los temas). */
const conPerfil = () => {
  if (!localStorage.getItem("habla:v1:perfil")) {
    localStorage.setItem("habla:v1:perfil", JSON.stringify({ apodo: "Luna", temas: ["animales"] }));
  }
};

test("el dispositivo en inglés arranca en inglés, con lang=en", async ({ browser }) => {
  const ctx = await browser.newContext({ locale: "en-US", serviceWorkers: "block" });
  await ctx.addInitScript(conPerfil);
  const page = await ctx.newPage();
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByTestId("capsula-titulo")).toBeVisible();
  await expect(page.getByTestId("etiqueta-capsula")).toContainText("Technique:");
  await ctx.close();
});

test("el conmutador cambia la app entera sin recargar, y la elección se recuerda", async ({ browser }) => {
  const ctx = await browser.newContext({ locale: "es-CO", serviceWorkers: "block" });
  const fuera: string[] = [];
  const origen = new URL(test.info().project.use.baseURL ?? "http://127.0.0.1:3500").origin;
  await ctx.route("**/*", async (route) => {
    if (!route.request().url().startsWith(origen)) {
      fuera.push(route.request().url());
      return route.abort();
    }
    return route.continue();
  });
  await ctx.addInitScript(conPerfil);
  const page = await ctx.newPage();
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "es-CO");
  const idEs = await page.getByTestId("capsula").getAttribute("data-capsula-id");
  const tituloEs = await page.getByTestId("capsula-titulo").innerText();

  await page.goto("/ajustes");
  await expect(page.getByTestId("idioma-es")).toHaveAttribute("aria-pressed", "true");
  await page.getByTestId("idioma-en").click();
  await expect(page.getByTestId("idioma-en")).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Settings and privacy");

  // Hoy: otra cara, la MISMA cápsula.
  await page.getByTestId("volver-a-hoy").click();
  await expect(page.getByTestId("capsula-titulo")).not.toHaveText(tituloEs);
  expect(await page.getByTestId("capsula").getAttribute("data-capsula-id")).toBe(idEs);

  // Sobrevive a recargar.
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");

  // Otras pantallas cambian de idioma.
  for (const ruta of ["/jugar", "/estudio", "/objetivo", "/rumbo"]) {
    await page.goto(ruta);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    expect(await page.locator("main").innerText(), ruta).not.toMatch(/\b(Ajustes|Hoy|Volver)\b/);
  }

  // Y de vuelta a español.
  await page.goto("/ajustes");
  await page.getByTestId("idioma-es").click();
  await expect(page.locator("html")).toHaveAttribute("lang", "es-CO");
  expect(fuera, "el cambio de idioma no abre conexiones hacia afuera").toEqual([]);
  await ctx.close();
});

test("en inglés, palabras y gemelas muestran la línea honesta y no abren el micrófono", async ({ browser }) => {
  const ctx = await browser.newContext({ locale: "en-US", permissions: ["microphone"], serviceWorkers: "block" });
  const page = await ctx.newPage();
  await page.addInitScript(() => {
    (window as unknown as { __mic: number }).__mic = 0;
    const md = navigator.mediaDevices;
    const original = md.getUserMedia.bind(md);
    md.getUserMedia = (...a) => {
      (window as unknown as { __mic: number }).__mic++;
      return original(...a);
    };
  });
  for (const ruta of ["/jugar/palabras", "/jugar/gemelas"]) {
    await page.goto(ruta);
    await expect(page.getByTestId("solo-en-espanol")).toBeVisible();
    await expect(page.getByTestId("solo-en-espanol")).toContainText("coming soon");
    expect(await page.evaluate(() => (window as unknown as { __mic: number }).__mic)).toBe(0);
  }
  await ctx.close();
});

test("a11y: Ajustes en inglés sin violaciones serias", async ({ browser }) => {
  const ctx = await browser.newContext({ locale: "en-US", serviceWorkers: "block" });
  const page = await ctx.newPage();
  await page.goto("/ajustes");
  const r = await new AxeBuilder({ page }).analyze();
  expect(r.violations.filter((v) => v.impact === "serious" || v.impact === "critical")).toEqual([]);
  await ctx.close();
});
