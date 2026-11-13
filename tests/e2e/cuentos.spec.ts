import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test, type Page } from "@playwright/test";

// «Cuentos de casa» (S9, ADR-019), de punta a punta y en español, con un lote FIJO de un perfil inventado
// (tests/fixtures/lote-cuentos-prueba.json): pedir → traer el lote → aprobar → verlo del lado del niño →
// ponerle la voz del adulto. Ningún cuento pendiente llega al niño y nada sale del dispositivo.

const LOTE = join(__dirname, "../fixtures/lote-cuentos-prueba.json");

async function traerLote(page: Page) {
  await page.getByTestId("cuentos-importar").setInputFiles(LOTE);
  await expect(page.getByTestId("cuentos-resultado")).toContainText("2 cuentos nuevos esperan tu lectura");
}

test("pedir, traer el lote, aprobar uno y verlo del lado del niño, sin red", async ({ page, context, baseURL }) => {
  const fuera: string[] = [];
  await context.route("**/*", async (route) => {
    const url = route.request().url();
    if (!url.startsWith(baseURL!)) {
      fuera.push(url);
      await route.abort();
      return;
    }
    await route.continue();
  });

  await page.goto("/estudio/cuentos");
  await expect(page.getByTestId("cuentos-guardar-gustos")).toBeEnabled();
  await page.getByTestId("cuentos-intereses").fill("trenes, nubes");
  await page.getByTestId("cuentos-palabras").fill("sube");
  await page.getByTestId("cuentos-guardar-gustos").click();
  await expect(page.getByTestId("cuentos-aviso")).toContainText("Guardado");

  // El pedido: solo intereses y palabras meta (decisión «1a»).
  const [descarga] = await Promise.all([
    page.waitForEvent("download"),
    page.getByTestId("cuentos-descargar-pedido").click(),
  ]);
  expect(descarga.suggestedFilename()).toMatch(/^pedido-\d{4}-\d{2}-\d{2}\.json$/);
  const pedido = JSON.parse(readFileSync((await descarga.path())!, "utf8"));
  expect(Object.keys(pedido.entrada).sort()).toEqual(["intereses", "palabrasMeta"]);
  expect(pedido.entrada).toEqual({ intereses: ["trenes", "nubes"], palabrasMeta: ["sube"] });
  expect(pedido.pedido_por).toBe("usuario");

  // El lote: dos entran pendientes, el del plazo no entra.
  await traerLote(page);
  await expect(page.getByTestId("cuentos-resultado")).toContainText("1 no entraron");
  await expect(page.getByTestId("cuento-pendiente")).toHaveCount(2);

  // Pendiente = invisible para el niño.
  await page.goto("/cuentos");
  await expect(page.getByTestId("cuentos-guion")).toBeVisible();
  await expect(page.getByTestId("cuento-tarjeta")).toHaveCount(6);
  await expect(page.locator('[data-cuento-id="el-tren-de-las-nubes"]')).toHaveCount(0);

  // El adulto lee y decide.
  await page.goto("/estudio/cuentos");
  await page.locator('[data-testid="cuento-pendiente"][data-cuento-id="el-tren-de-las-nubes"]').getByTestId("cuento-aprobar").click();
  await page.locator('[data-testid="cuento-pendiente"][data-cuento-id="la-gata-y-el-sombrero"]').getByTestId("cuento-rechazar").click();
  await expect(page.getByTestId("cuentos-pendientes")).toContainText("No hay cuentos esperando");

  // Del lado del niño: la biblioteca + solo el aprobado.
  await page.goto("/cuentos");
  await expect(page.getByTestId("cuento-tarjeta")).toHaveCount(7);
  const aprobado = page.locator('[data-testid="cuento-tarjeta"][data-cuento-id="el-tren-de-las-nubes"]');
  await expect(aprobado).toContainText("Aprobado por ti");
  await expect(page.locator('[data-cuento-id="la-gata-y-el-sombrero"]')).toHaveCount(0);

  // «Lo leo yo»: la biblioteca trae sus gustos en los huecos, texto grande, sin voz grabada.
  await page.locator('[data-testid="cuento-tarjeta"][data-cuento-id="el-paseo"]').click();
  await expect(page.getByTestId("cuento-texto")).toContainText("trenes");
  await expect(page.getByTestId("cuento-palabra")).toHaveText("casa");
  await expect(page.getByTestId("modo-con-mi-voz")).toHaveCount(0);
  for (let i = 0; i < 3; i++) await page.getByTestId("cuento-siguiente").click();
  await expect(page.getByTestId("cuento-palabra")).toHaveText("adiós");
  await page.getByTestId("cuento-fin").click();
  await aprobado.click();
  await expect(page.getByTestId("cuento-palabra")).toHaveText("tren");

  expect(fuera, `salió tráfico del dispositivo: ${fuera.join(", ")}`).toEqual([]);
});

test("un archivo que no es lote no mete nada", async ({ page }) => {
  await page.goto("/estudio/cuentos");
  await expect(page.getByTestId("cuentos-guardar-gustos")).toBeEnabled();
  await page.getByTestId("cuentos-importar").setInputFiles({
    name: "otra-cosa.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify({ hola: "mundo" })),
  });
  await expect(page.getByTestId("cuentos-resultado")).toContainText("No entró nada");
  await expect(page.getByTestId("cuento-pendiente")).toHaveCount(0);
});

test("la voz del adulto en una página, y el niño la escucha con «Con mi voz grabada»", async ({ page }) => {
  await page.goto("/estudio/cuentos");
  await expect(page.getByTestId("cuentos-guardar-gustos")).toBeEnabled();
  await page.getByTestId("cuento-grabar-voz").first().click();
  const narrar = page.getByTestId("narrar-cuento");
  await narrar.getByTestId("narrar-grabar").click();
  await expect(narrar.getByTestId("narrar-parar")).toBeVisible();
  await page.waitForTimeout(800);
  await narrar.getByTestId("narrar-parar").click();
  await narrar.getByTestId("narrar-guardar").click();
  await expect(narrar).toContainText("Grabada");
  await narrar.getByTestId("narrar-listo").click();

  await page.goto("/cuentos");
  await page.getByTestId("cuento-tarjeta").first().click();
  await expect(page.getByTestId("modo-leer-yo")).toHaveAttribute("aria-pressed", "true");
  await page.getByTestId("modo-con-mi-voz").click();
  await expect(page.getByTestId("modo-con-mi-voz")).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("cuento-tu-voz")).toBeVisible();
  await page.getByTestId("cuento-siguiente").click();
  await expect(page.getByText("Esta página no tiene tu voz")).toBeVisible();
});
