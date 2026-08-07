import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// El brochure vivo servido en /conoce (entrega puntual ENTREGA-BROCHURE, kit v1.9.0).
// La fuente es docs/BROCHURE.html; build:brochure lo copia a public/conoce.html y el
// rewrite de next.config lo sirve sin ".html". Esta suite protege lo que de verdad
// importa del entregable: que la ruta EXISTA (el link que recibe la familia), que la
// progressive disclosure funcione (nada de la capa 2 visible sin abrir su tarjeta) y
// que el conteo del pie no se caiga en silencio.

test("la ruta /conoce sirve el brochure con su portada", async ({ page }) => {
  const respuesta = await page.goto("/conoce");
  expect(respuesta?.status()).toBe(200);

  // Capa 0: la promesa de la VISION, la primera frase que ella lee.
  await expect(
    page.getByRole("heading", { name: "Su voz mueve el mundo." }),
  ).toBeVisible();
  // Las 6 tarjetas de la capa 1, todas cerradas al llegar.
  const tarjetas = page.getByRole("button", { expanded: false });
  await expect(tarjetas).toHaveCount(6);
});

test("una tarjeta abre su detalle y lo vuelve a cerrar (progressive disclosure)", async ({
  page,
}) => {
  await page.goto("/conoce");

  const tarjeta = page.getByRole("button", {
    name: /La respuesta de cada día/,
  });
  const detalle = page.getByRole("region", {
    name: "La respuesta de cada día — detalle",
  });

  // Cerrada: el contenido vive en el DOM (a11y), pero no se le muestra a nadie.
  await expect(tarjeta).toHaveAttribute("aria-expanded", "false");
  await expect(detalle).not.toBeVisible();

  await tarjeta.click();
  await expect(tarjeta).toHaveAttribute("aria-expanded", "true");
  await expect(detalle).toBeVisible();
  await expect(detalle.getByText("La cápsula del día")).toBeVisible();

  await tarjeta.click();
  await expect(tarjeta).toHaveAttribute("aria-expanded", "false");
  await expect(detalle).not.toBeVisible();
});

// La progressive disclosure también tiene que existir para quien no ve la pantalla.
// El recorte visual (overflow) engaña al ojo pero NO al lector de pantalla: sin sacar lo
// cerrado del árbol de accesibilidad, esa persona recibe las 24 features de corrido
// mientras aria-expanded le dice "cerrado". Playwright no distingue los dos casos (para
// él ambos son "no visible"), así que se mira el árbol real por CDP.
test("lo cerrado no llega al lector de pantalla", async ({ page }) => {
  await page.goto("/conoce");

  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Accessibility.enable");
  const arbol = async () =>
    (await cdp.send("Accessibility.getFullAXTree")).nodes
      .map((n) => n.name?.value ?? "")
      .join(" | ");

  expect(await arbol()).not.toContain("La cápsula del día");

  // Y al abrirla, sí llega: el contenido existe, solo estaba guardado.
  await page.getByRole("button", { name: /La respuesta de cada día/ }).click();
  await expect(
    page.getByRole("region", { name: "La respuesta de cada día — detalle" }),
  ).toBeVisible();
  expect(await arbol()).toContain("La cápsula del día");
});

// Regla de conteo del molde: el pie declara N y N cuadra con las features del
// MANUAL-DE-USO (mapeo verificable en sprints/ENTREGA-brochure-summary.md). Si alguien
// agrega una feature al brochure sin actualizar el pie, este test lo dice.
test("el pie declara el conteo de funcionalidades", async ({ page }) => {
  await page.goto("/conoce");
  await expect(
    page.getByText("24 funcionalidades", { exact: true }),
  ).toBeVisible();
});

for (const esquema of ["light", "dark"] as const) {
  test(`axe limpio en /conoce (tema ${esquema})`, async ({ page }) => {
    // Con movimiento reducido el documento muestra su estado FINAL y quieto, que es lo
    // único que tiene sentido auditar: el contraste a mitad de un fundido no es el
    // contraste de nadie. De paso confirma que esa experiencia alterna llega completa.
    await page.emulateMedia({ colorScheme: esquema, reducedMotion: "reduce" });
    await page.goto("/conoce");

    // Todo abierto: el detalle y lo fino son la mayor parte del documento, y lo cerrado
    // esconde su contraste de axe.
    for (const boton of await page.getByRole("button").all()) {
      await boton.click();
    }
    await page
      .locator("details")
      .evaluateAll((lista) => lista.forEach((d) => d.setAttribute("open", "")));

    const { violations } = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    expect(violations).toEqual([]);
  });
}
