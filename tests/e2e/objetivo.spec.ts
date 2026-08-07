import { expect, test, type Page } from "@playwright/test";

// OBJETIVO DE LA SEMANA (Outcome 2). Se prueba POR LA UI, de punta a punta: escribir "animales"
// alinea la cápsula de Hoy, el mazo de palabra↔objeto y el lote del estudio; "colores" no coincide
// con nada y la app lo dice honesto; y borrarlo restaura el orden por defecto (identidad).

const ANIMALES = [
  "perro",
  "gato",
  "pájaro",
  "caballo",
  "vaca",
  "pato",
  "conejo",
  "elefante",
];

// El niño ya tiene perfil (Hoy muestra su cápsula, no el onboarding) y sus temas incluyen animales
// —así el mazo tiene animales que el objetivo puede subir— y mar —para que subirlos signifique algo.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "habla:v1:perfil",
      JSON.stringify({ temas: ["animales", "mar"] }),
    );
  });
});

/** Arranca palabra↔objeto y devuelve la palabra del primer dibujo (el mazo es determinista). */
async function primerPicto(page: Page): Promise<string> {
  await page.goto("/jugar/palabras");
  await page.getByTestId("empezar-juego").click();
  await expect(page.getByTestId("juego")).toHaveAttribute(
    "data-fase",
    "jugando",
    {
      timeout: 20_000,
    },
  );
  return (await page.getByTestId("palabra-del-picto").innerText()).trim();
}

async function guardarObjetivo(page: Page, texto: string): Promise<void> {
  await page.goto("/objetivo");
  await page.getByTestId("objetivo-input").fill(texto);
  await page.getByTestId("guardar-objetivo").click();
  await expect(page.getByTestId("objetivo-activo")).toContainText(texto);
}

test("«animales» alinea la cápsula de Hoy, el mazo y el lote del estudio", async ({
  page,
}) => {
  await guardarObjetivo(page, "animales");

  // Hoy: aparece la línea del objetivo activo.
  await page.goto("/");
  await expect(page.getByTestId("objetivo-activo-hoy")).toContainText(
    "animales",
  );

  // Mazo de palabra↔objeto: el primer dibujo es un animal (el objetivo va al frente).
  const primero = await primerPicto(page);
  expect(ANIMALES).toContain(primero);

  // Lote del estudio: lo primero a grabar es una palabra del objetivo.
  await page.goto("/estudio");
  await page.getByTestId("ir-al-lote").click();
  const item = (await page.getByTestId("item-texto").innerText()).trim();
  expect(ANIMALES).toContain(item);
});

test("«colores» no coincide con nada y la app lo dice honesto (sin fingir)", async ({
  page,
}) => {
  await page.goto("/objetivo");
  await page.getByTestId("objetivo-input").fill("colores");
  await expect(page.getByTestId("objetivo-sin-matches")).toBeVisible();
  await expect(page.getByTestId("objetivo-preview")).toHaveCount(0);
});

// Gate S4 (O1): escribir a medias no es error — mientras el texto sea el comienzo de un término
// real, la app acompaña con sugerencias vivas en vez de regañar con "no está en el contenido".
test("a medio teclazo («anim») la app sugiere, no regaña; tocar la sugerencia alinea", async ({
  page,
}) => {
  await page.goto("/objetivo");
  await page.getByTestId("objetivo-input").fill("anim");

  const vivas = page.getByTestId("objetivo-sugerencias-vivas");
  await expect(vivas).toBeVisible();
  await expect(page.getByTestId("objetivo-sin-matches")).toHaveCount(0);

  await page.getByTestId("sugerencia-viva-animales").click();
  await expect(page.getByTestId("objetivo-preview")).toBeVisible();
  // El botón nombra EXACTAMENTE lo que va a guardar (la conexión campo→botón).
  await expect(page.getByTestId("guardar-objetivo")).toContainText(
    "Guardar «animales»",
  );
});

// Gate S4 (O1, hallazgo del usuario en la preview): la eñe se conserva — "bañ" debe sugerir
// «baño» (antes salía «bano», la forma normalizada) y sin ruido de palabras a 2 letras (rana…).
test("«bañ» sugiere «baño» con su eñe y sin palabras lejanas de relleno", async ({
  page,
}) => {
  await page.goto("/objetivo");
  await page.getByTestId("objetivo-input").fill("bañ");

  const vivas = page.getByTestId("objetivo-sugerencias-vivas");
  await expect(vivas).toBeVisible();
  await expect(vivas).toContainText("baño");
  await expect(vivas).not.toContainText("bano");
  await expect(vivas).not.toContainText("rana");

  await page.getByTestId("sugerencia-viva-baño").click();
  await expect(page.getByTestId("guardar-objetivo")).toContainText(
    "Guardar «baño»",
  );
});

// Gate S4 (O1, segundo remate — pedido del usuario): ortografía GENERAL. La app solo tiene ~90
// palabras de contenido; para lo demás viaja el diccionario embebido (10 000 palabras curadas),
// que sugiere la palabra bien escrita en su propio grupo. Y una palabra bien escrita se guarda
// SIN pregunta: existir en el idioma ES estar bien escrito, aunque no alinee nada.
test("«medi» sugiere «medio» del idioma en su grupo; la palabra bien escrita se guarda sin pregunta", async ({
  page,
}) => {
  await page.goto("/objetivo");
  await page.getByTestId("objetivo-input").fill("medi");

  const vivas = page.getByTestId("objetivo-sugerencias-vivas");
  await expect(vivas).toBeVisible();
  await expect(vivas).toContainText("aún no están en la app");
  await expect(page.getByTestId("ortografia-medio")).toBeVisible();

  await page.getByTestId("ortografia-medio").click();
  // «medio» es palabra completa que no alinea nada: el mensaje honesto (con sus
  // continuaciones «medios»… como oferta, no como pregunta) — y guardar NO pregunta.
  await expect(page.getByTestId("objetivo-sin-matches")).toBeVisible();
  await expect(page.getByTestId("ortografia-medios")).toBeVisible();
  await page.getByTestId("guardar-objetivo").click();
  await expect(page.getByTestId("objetivo-confirmar")).toHaveCount(0);
  await expect(page.getByTestId("objetivo-activo")).toContainText("«medio»");
});

// Gate S4 (O1): el paso de ortografía — guardar un texto que no coincide con NADA pero se parece
// a un término real pregunta primero; las dos salidas son honestas.
test("guardar «animles» pregunta «¿Quisiste decir animales?» antes de grabar", async ({
  page,
}) => {
  await page.goto("/objetivo");
  await page.getByTestId("objetivo-input").fill("animles");
  await page.getByTestId("guardar-objetivo").click();

  const confirmar = page.getByTestId("objetivo-confirmar");
  await expect(confirmar).toBeVisible();
  await expect(confirmar).toContainText("¿Quisiste decir «animales»?");

  await page.getByTestId("guardar-candidata").click();
  await expect(page.getByTestId("objetivo-activo")).toContainText("«animales»");
});

test("lo que existe en la app pero FUERA de su alcance se dice de frente (auditoría de cierre)", async ({
  page,
}) => {
  // Temas SIN dinosaurios: la app tiene dibujos de dinosaurios, pero el mazo del niño no los
  // trae y ninguna cápsula lleva esa etiqueta → el preview no puede prometer que "se ponen
  // primero" en los juegos. Sí es verdad en el estudio (el lote matchea el catálogo completo).
  await page.addInitScript(() => {
    localStorage.setItem(
      "habla:v1:perfil",
      JSON.stringify({ temas: ["carros", "musica"] }),
    );
  });
  await page.goto("/objetivo");
  await page.getByTestId("objetivo-input").fill("dinosaurios");

  const fuera = page.getByTestId("objetivo-fuera-de-alcance");
  await expect(fuera).toBeVisible();
  await expect(fuera).toContainText("no en lo que él ve hoy");
  await expect(fuera).toContainText("estudio de grabación");
  await expect(page.getByTestId("objetivo-preview")).toHaveCount(0);
  await expect(page.getByTestId("objetivo-sin-matches")).toHaveCount(0);
});

test("quitar el objetivo restaura el orden por defecto (identidad)", async ({
  page,
}) => {
  // El primer dibujo por defecto, sin objetivo.
  const porDefecto = await primerPicto(page);

  // Con objetivo animales, el primero cambia a un animal.
  await guardarObjetivo(page, "animales");
  const conObjetivo = await primerPicto(page);
  expect(ANIMALES).toContain(conObjetivo);

  // Se quita el objetivo → el mazo vuelve EXACTAMENTE al orden por defecto.
  await page.goto("/objetivo");
  await page.getByTestId("quitar-objetivo").click();
  await expect(page.getByTestId("objetivo-activo")).toHaveCount(0);

  const despues = await primerPicto(page);
  expect(despues).toBe(porDefecto);
});
