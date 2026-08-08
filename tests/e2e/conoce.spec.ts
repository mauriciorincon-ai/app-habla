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

// El recorrido va pasando páginas: al bajar, la tarjeta que llega a la banda alta se
// abre sola y la anterior se cierra. Pero en cuanto la persona toca una, esa queda bajo
// SU mando y el recorrido no vuelve a moverla — nada se cierra en sus narices mientras
// lee. Este test protege las dos mitades de esa regla.
test("las tarjetas se abren al bajar, y tu toque manda sobre el recorrido", async ({
  page,
}) => {
  await page.goto("/conoce");

  const tarjeta = page.getByRole("button", {
    name: /La respuesta de cada día/,
  });
  const detalle = page.getByRole("region", {
    name: "La respuesta de cada día — detalle",
  });

  // Al llegar: cerrada. El contenido vive en el DOM, pero no se le muestra a nadie.
  await expect(tarjeta).toHaveAttribute("aria-expanded", "false");
  await expect(detalle).not.toBeVisible();

  // Al bajar hasta ella, se abre sola.
  await page.evaluate(() =>
    document
      .querySelector(".tarjetas .tarjeta")
      ?.scrollIntoView({ block: "start" }),
  );
  await expect(tarjeta).toHaveAttribute("aria-expanded", "true");
  await expect(detalle).toBeVisible();
  await expect(detalle.getByText("La cápsula del día")).toBeVisible();

  // Y si la cierras a mano, se queda cerrada: tu decisión gana.
  await tarjeta.click();
  await expect(tarjeta).toHaveAttribute("aria-expanded", "false");
  await expect(detalle).not.toBeVisible();
  await page.mouse.wheel(0, 400);
  await expect(tarjeta).toHaveAttribute("aria-expanded", "false");
});

// El recorrido es de ida: bajando se abren, subiendo NO. El camino de vuelta queda
// limpio — quien ya leyó y regresa no vuelve a encontrarse el contenido desplegado.
test("al volver hacia arriba, las tarjetas se quedan cerradas", async ({
  page,
}) => {
  await page.goto("/conoce");

  const tarjeta = page.getByRole("button", {
    name: /La respuesta de cada día/,
  });
  await page.evaluate(() =>
    document
      .querySelector(".tarjetas .tarjeta")
      ?.scrollIntoView({ block: "start" }),
  );
  await expect(tarjeta).toHaveAttribute("aria-expanded", "true");

  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(page.getByRole("button", { expanded: true })).toHaveCount(0);
  await expect(page.getByRole("button", { expanded: false })).toHaveCount(6);
});

// Cada tarjeta lleva a su sitio en la app: la entrega no es solo entender, es llegar.
test("cada tarjeta y cada juego enlazan a su ruta real", async ({ page }) => {
  await page.goto("/conoce");

  const rutas = [
    "/",
    "/jugar",
    "/estudio",
    "/objetivo",
    "/rumbo",
    "/ajustes",
    "/jugar/globo",
    "/jugar/cohete",
    "/jugar/palabras",
    "/jugar/gemelas",
  ];
  for (const ruta of rutas) {
    await expect(page.locator(`a.enlace[href="${ruta}"]`).first()).toHaveCount(
      1,
    );
  }
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

  // Y cuando el recorrido la abre, sí llega: el contenido existe, solo estaba guardado.
  await page.evaluate(() =>
    document
      .querySelector(".tarjetas .tarjeta")
      ?.scrollIntoView({ block: "start" }),
  );
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

    // Todo abierto de forma determinista (sin depender del recorrido por scroll): el
    // detalle y lo fino son la mayor parte del documento, y lo cerrado esconde su
    // contraste de axe.
    await page.evaluate(() => {
      document.querySelectorAll(".tarjeta").forEach((t) => {
        t.setAttribute("data-abierta", "");
        t.setAttribute("data-manual", "");
        t.querySelector(".tarjeta-boton")?.setAttribute(
          "aria-expanded",
          "true",
        );
      });
      document
        .querySelectorAll("details")
        .forEach((d) => d.setAttribute("open", ""));
    });

    const { violations } = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    expect(violations).toEqual([]);
  });
}
