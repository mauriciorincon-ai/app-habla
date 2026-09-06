import { readFileSync } from "node:fs";
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { RegistroExportSchema } from "../../content/registro-contacto-visual";

// El documento de contacto visual de la mamá, servido en /mirada (Sprint 005). La fuente es
// docs/CATALOGO-CONTACTO-VISUAL.html (generado de content/contacto-visual.ts); build:documentos
// lo copia a public/mirada.html y el rewrite lo sirve sin ".html".
//
// Lo que esta suite protege: que la ruta EXISTA, que el REGISTRO funcione de punta a punta en
// un teléfono (registrar → sobrevive a cerrar y volver → se envía como ejemplos → se guarda como
// un JSON que cumple el contrato del repo) y que nada de eso rompa la accesibilidad.

async function registrarPrimerMomento(page: Page, ejemplo = "hoy abrió los brazos en la pausa") {
  const capsula = page.locator("article.capsula").first();
  await capsula.getByRole("button", { name: "Registrar este momento" }).click();
  const form = capsula.locator("form[data-registro]");
  await expect(form).toBeVisible();
  // A · lo que hice yo: tres respuestas.
  await form.getByRole("group", { name: "Me puse a su altura y de frente" }).getByText("Lo hice").click();
  await form.getByRole("group", { name: "Seguí lo que él eligió y esperé" }).getByText("A medias").click();
  await form.getByRole("group", { name: "Hice la pausa o lo imité, sin pedirle nada" }).getByText("Lo hice").click();
  // B · lo que vi en él: se marca, no se cuenta.
  await form.getByText("Miró de mí al juguete y de vuelta").click();
  await form.getByLabel(/Un ejemplo, si quieres/).fill(ejemplo);
  // C · cómo estuvo él.
  await form.getByText("A gusto", { exact: true }).click();
  await form.getByRole("button", { name: "Guardar en este teléfono" }).click();
  await expect(page.getByRole("status")).toContainText("Guardado en este teléfono");
  return capsula;
}

test("la ruta /mirada sirve el documento con su encuadre y sus cápsulas", async ({ page }) => {
  const respuesta = await page.goto("/mirada");
  expect(respuesta?.status()).toBe(200);
  await expect(page.getByRole("heading", { name: "Mirarse jugando" })).toBeVisible();
  await expect(page.getByText("Esto no es una prueba.")).toBeVisible();
  await expect(page.getByText("El único semáforo:")).toBeVisible();
  expect(await page.locator("article.capsula").count()).toBeGreaterThan(0);
  // El modo revisión (para el papá) NO se ve por defecto.
  await expect(page.getByText("Modo revisión")).toBeHidden();
});

test("registrar un momento: falta algo → lo dice; completo → queda, y sobrevive a cerrar y volver", async ({ page }) => {
  await page.goto("/mirada");
  const capsula = page.locator("article.capsula").first();
  await capsula.getByRole("button", { name: "Registrar este momento" }).click();
  await capsula.getByRole("button", { name: "Guardar en este teléfono" }).click();
  await expect(capsula.getByRole("alert")).toBeVisible();
  await capsula.getByRole("button", { name: "Ahora no" }).click();

  await registrarPrimerMomento(page);
  const panel = page.locator("[data-entradas]");
  await expect(panel.locator("li")).toHaveCount(1);
  await expect(panel).toContainText("Yo: me puse a su altura y de frente: lo hice");
  await expect(panel).toContainText("Vi: miró de mí al juguete y de vuelta. «hoy abrió los brazos en la pausa»");
  await expect(panel).toContainText("Él: a gusto.");

  // Cerrar y volver: sigue ahí (localStorage del teléfono).
  await page.reload();
  await expect(page.locator("[data-entradas] li")).toHaveCount(1);
});

test("«Guardar registro» descarga un JSON que cumple el contrato del repo", async ({ page }) => {
  await page.goto("/mirada");
  await registrarPrimerMomento(page, "señaló el avión");
  const [descarga] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Guardar registro" }).click(),
  ]);
  expect(descarga.suggestedFilename()).toMatch(/^registro-mirada-\d{4}-\d{2}-\d{2}\.json$/);
  const ruta = await descarga.path();
  const archivo = JSON.parse(readFileSync(ruta!, "utf8"));
  const r = RegistroExportSchema.safeParse(archivo);
  expect(r.success, JSON.stringify(r.success ? null : r.error.issues)).toBe(true);
  expect(archivo.entradas).toHaveLength(1);
  expect(archivo.entradas[0].b.ejemplo).toBe("señaló el avión");
  expect(archivo.entradas[0].a.seguiLoQueEligioYEspere).toBe("a-medias");
});

test("«Enviar a papá» arma ejemplos, no números, y usa el compartir del teléfono", async ({ page }) => {
  await page.addInitScript(() => {
    (window as unknown as { __compartido: unknown }).__compartido = null;
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: (datos: unknown) => {
        (window as unknown as { __compartido: unknown }).__compartido = datos;
        return Promise.resolve();
      },
    });
  });
  await page.goto("/mirada");
  await page.getByRole("button", { name: "Enviar a papá" }).click();
  await expect(page.getByRole("status")).toContainText("Todavía no hay nada que enviar");

  await registrarPrimerMomento(page, "me buscó la cara en la pausa");
  await page.getByRole("button", { name: "Enviar a papá" }).click();
  const compartido = await page.evaluate(
    () => (window as unknown as { __compartido: { text: string } }).__compartido,
  );
  expect(compartido.text).toContain("Yo: me puse a su altura y de frente: lo hice");
  expect(compartido.text).toContain("«me buscó la cara en la pausa»");
  expect(compartido.text).toContain("Sin números a propósito");
  // Ningún total: el texto no trae "N veces", "N de", ni porcentajes.
  expect(compartido.text).not.toMatch(/\d+ (veces|de \d+)|%/);
});

test("una entrada rota en el teléfono no tumba el panel: se ignora, y exportar sigue funcionando", async ({ page }) => {
  // Auditoría S5 (M1): antes, una entrada sin forma lanzaba al pintar el panel ANTES de conectar
  // «Guardar registro» y «Borrar» — y dejaba el registro entero muerto, sin vía de rescate.
  await page.goto("/mirada");
  await registrarPrimerMomento(page);
  await page.evaluate(() => {
    const clave = "registro-mirada-v1";
    const j = JSON.parse(localStorage.getItem(clave) ?? "{}");
    j.entradas.push({}, { id: "rota", fecha: "2026-09-06" }, null);
    localStorage.setItem(clave, JSON.stringify(j));
  });
  await page.reload();
  await expect(page.locator("[data-entradas] li")).toHaveCount(1);
  const descarga = page.waitForEvent("download");
  await page.getByRole("button", { name: "Guardar registro" }).click();
  const archivo = JSON.parse(readFileSync(await (await descarga).path(), "utf8"));
  expect(RegistroExportSchema.safeParse(archivo).success).toBe(true);
  expect(archivo.entradas).toHaveLength(1);
});

test("borrar todo pide un segundo toque y deja el panel vacío", async ({ page }) => {
  await page.goto("/mirada");
  await registrarPrimerMomento(page);
  const borrar = page.getByRole("button", { name: /Borrar todos mis registros/ });
  await borrar.click();
  await expect(page.getByRole("button", { name: /¿Seguro\?/ })).toBeVisible();
  await expect(page.locator("[data-entradas] li")).toHaveCount(1);
  await page.getByRole("button", { name: /¿Seguro\?/ }).click();
  await expect(page.locator("[data-entradas] li")).toHaveCount(0);
  await expect(page.locator("[data-vacio]")).toBeVisible();
});

test("?revision muestra las preguntas de juicio y la casilla por cápsula (solo para el papá)", async ({ page }) => {
  await page.goto("/mirada?revision");
  await expect(page.getByText("Modo revisión")).toBeVisible();
  const primera = page.locator("article.capsula").first().getByLabel("Revisada");
  await primera.check();
  await expect(page.locator("#revisadas")).toHaveText("1");
});

test("axe: el documento no tiene violaciones de accesibilidad, con el registro abierto", async ({ page }) => {
  await page.goto("/mirada?revision");
  await page.locator("article.capsula").first().getByRole("button", { name: "Registrar este momento" }).click();
  const resultados = await new AxeBuilder({ page }).analyze();
  expect(resultados.violations).toEqual([]);
});
