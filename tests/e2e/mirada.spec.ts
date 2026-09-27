import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { GRUPOS, GRUPOS_PRIORITARIOS } from "../../content/schema";

// El documento de la mamá, «La pirámide, en casa», servido en /mirada (Sprint 006). La fuente es
// docs/LA-PIRAMIDE.html (generado de content/fichas.ts); build:documentos lo copia a
// public/mirada.html y el rewrite lo sirve sin ".html".
//
// Lo que esta suite protege: que la ruta EXISTA con su portada; que las fichas estén por los seis
// grupos de la pirámide y cada una traiga sus seis partes en orden; que el REGISTRO del S5 ya no
// exista (se retiró entero: ni formularios, ni «Enviar a papá», ni cuadrícula); que el modo
// revisión sea solo para el papá; que nada desborde a lo ancho en el teléfono; y axe limpio.

const PARTES = [
  "Ten a la mano",
  "Haz",
  "Tu línea",
  "Espera ver",
  "Funcionó si",
  "Si no pasa",
];

test("la ruta /mirada sirve «La pirámide, en casa» con su portada", async ({
  page,
}) => {
  const respuesta = await page.goto("/mirada");
  expect(respuesta?.status()).toBe(200);
  await expect(
    page.getByRole("heading", { level: 1, name: "La pirámide, en casa" }),
  ).toBeVisible();
  await expect(page.getByText("Esto no es una prueba.")).toBeVisible();
  await expect(page.getByText("El único semáforo:")).toBeVisible();
  await expect(page.getByText("Lo que ya le gusta")).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "La pirámide: un mapa, no una escalera",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Qué no hacer" }),
  ).toBeVisible();
  // El modo revisión (para el papá) NO se ve por defecto, ni la lista de lo que quedó fuera.
  await expect(page.getByText("Modo revisión")).toBeHidden();
  await expect(page.getByText(/Quedaron fuera del documento/)).toBeHidden();
});

test("las fichas van por los seis grupos, y el índice lleva a cada uno", async ({
  page,
}) => {
  await page.goto("/mirada");
  // Cada sección muestra exactamente las fichas que anuncia su título (que cada grupo TENGA fichas
  // lo garantiza el schema de la biblioteca en el unit; aquí se prueba el cable dato → documento).
  let total = 0;
  for (const g of GRUPOS) {
    const seccion = page.locator(`#grupo-${g}`);
    await expect(seccion).toBeAttached();
    const anunciadas = Number(
      (await seccion.locator("h2 .conteo").textContent())?.match(/\d+/)?.[0],
    );
    const n = await seccion.locator("article.ficha").count();
    expect(n, g).toBe(anunciadas);
    total += n;
  }
  expect(total).toBe(await page.locator("article.ficha").count());
  // Los grupos de prioridad ahora llevan la marca en su título, y solo ellos.
  expect(await page.locator("section.grupo h2 .chip-prioridad").count()).toBe(
    GRUPOS_PRIORITARIOS.length,
  );
  await page
    .getByRole("navigation", { name: "Grupos de fichas" })
    .getByRole("link", { name: /^Juego/ })
    .click();
  await expect(page).toHaveURL(/#grupo-juego$/);
});

test("cada ficha trae sus seis partes, en orden", async ({ page }) => {
  await page.goto("/mirada");
  const fichas = page.locator("article.ficha");
  const n = await fichas.count();
  expect(n).toBeGreaterThan(0);
  for (let i = 0; i < n; i++) {
    const rotulos = await fichas.nth(i).locator(".rotulo").allTextContents();
    expect(
      rotulos.map((r) => r.trim()),
      `ficha ${i}`,
    ).toEqual(PARTES);
    expect(
      await fichas.nth(i).locator("ol li").count(),
      `pasos de la ficha ${i}`,
    ).toBeGreaterThanOrEqual(3);
  }
});

test("se ve dónde empieza cada ficha: título grande, su grupo encima, franja arriba y aire entre una y otra", async ({
  page,
}) => {
  // Pedido del usuario al ver producción: «no se identifica bien dónde empieza una y dónde termina otra».
  await page.goto("/mirada");
  const medida = await page.evaluate(() => {
    const fichas = [...document.querySelectorAll("article.ficha")];
    const px = (el: Element, prop: string) =>
      parseFloat(getComputedStyle(el).getPropertyValue(prop));
    const texto = px(
      document.querySelector("article.ficha .parte p:not(.rotulo)")!,
      "font-size",
    );
    const grupo = px(document.querySelector("section.grupo h2")!, "font-size");
    return fichas.map((f) => ({
      titulo: px(f.querySelector("h3")!, "font-size") / texto,
      debajoDelGrupo: px(f.querySelector("h3")!, "font-size") < grupo,
      grupoEncima:
        f
          .querySelector("h3")
          ?.previousElementSibling?.classList.contains("grupo-ficha") ?? false,
      franja: px(f, "border-top-width"),
      aire: px(f, "margin-top"),
    }));
  });
  for (const [i, m] of medida.entries()) {
    expect(m.titulo, `título de la ficha ${i}`).toBeGreaterThanOrEqual(1.3);
    expect(
      m.debajoDelGrupo,
      `la ficha ${i} no le gana al título del grupo`,
    ).toBe(true);
    expect(
      m.grupoEncima,
      `el grupo va encima del título en la ficha ${i}`,
    ).toBe(true);
    expect(m.franja, `franja de la ficha ${i}`).toBeGreaterThanOrEqual(4);
    expect(m.aire, `aire antes de la ficha ${i}`).toBeGreaterThanOrEqual(24);
  }
});

test("el registro del S5 ya no existe: ni formularios, ni envío, ni cuadrícula", async ({
  page,
}) => {
  await page.goto("/mirada");
  expect(await page.locator("form").count()).toBe(0);
  expect(await page.locator("button").count()).toBe(0);
  await expect(page.getByText("Enviar a papá")).toHaveCount(0);
  await expect(page.getByText("Registrar este momento")).toHaveCount(0);
  await expect(page.getByText("Mis registros")).toHaveCount(0);
  await expect(page.getByText("Mi semana, a mano")).toHaveCount(0);
  // Y el documento no escribe nada en el teléfono de la mamá.
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
});

test("?revision muestra las preguntas de juicio, de dónde viene cada ficha y la casilla (solo para el papá)", async ({
  page,
}) => {
  await page.goto("/mirada?revision");
  await expect(page.getByText("Modo revisión")).toBeVisible();
  // Lo que el mapa dejó fuera del documento, con su razón (sigue en la app).
  await expect(page.getByText(/Quedaron fuera del documento/)).toBeVisible();
  const primera = page.locator("article.ficha").first();
  await expect(primera.locator(".origen")).toBeVisible();
  await primera.getByLabel("Revisada").check();
  await expect(page.locator("#revisadas")).toHaveText("1");
  await page.reload();
  await expect(
    page.locator("article.ficha").first().getByLabel("Revisada"),
  ).toBeChecked();
});

test("?revision no le cambia la cara al documento: misma letra, mismo tamaño, mismo flujo", async ({
  page,
}) => {
  const estilo = () =>
    page.evaluate(() => {
      const b = getComputedStyle(document.body);
      const p = getComputedStyle(
        document.querySelector("article.ficha .funciono")!,
      );
      return {
        fuente: b.fontFamily,
        tamano: b.fontSize,
        posicion: b.position,
        color: p.color,
        letra: p.fontSize,
      };
    });
  await page.goto("/mirada");
  const normal = await estilo();
  await page.goto("/mirada?revision");
  await expect(page.getByText("Modo revisión")).toBeVisible();
  expect(await estilo()).toEqual(normal);
});

test("nada desborda a lo ancho: ni el documento ni ninguna ficha", async ({
  page,
}) => {
  await page.goto("/mirada");
  const desbordes = await page.evaluate(() => {
    const ancho = document.documentElement.clientWidth;
    const fuera: string[] = [];
    if (document.documentElement.scrollWidth > ancho) fuera.push("documento");
    document
      .querySelectorAll<HTMLElement>("article.ficha, header, nav, .aviso")
      .forEach((el) => {
        if (el.scrollWidth > el.clientWidth + 1)
          fuera.push(el.id || el.className);
      });
    return fuera;
  });
  expect(desbordes).toEqual([]);
});

test("axe: el documento no tiene violaciones de accesibilidad, también en modo revisión", async ({
  page,
}) => {
  for (const ruta of ["/mirada", "/mirada?revision"]) {
    await page.goto(ruta);
    const resultados = await new AxeBuilder({ page }).analyze();
    expect(resultados.violations, ruta).toEqual([]);
  }
});
