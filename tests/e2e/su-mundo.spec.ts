import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "./base";
import { axeLimpio, jugar, sembrar } from "./su-mundo-ayuda";

// SU MUNDO EN TODO (S14, ADR-026), en español. Perfiles inventados. Lo que garantiza: el protagonista de la
// escena es UNO de sus temas y viste sin cambiar la mecánica; la tarjeta de guion y el apuntador le dicen al
// ADULTO qué palabras modelar según la meta (y callan sin meta); palabra↔objeto sigue a la meta en vivo; la
// tarjeta del recordatorio es del adulto y se esconde; sus intereses viven en el perfil y Cuentos los lee.
// Los otros cuatro juegos de voz tienen su prueba junto a la suya (cada uno con su micrófono falso).

const HOY = "2026-11-16";

test("el globo lleva a su protagonista (uno de sus temas), con nombre, y pasa axe en claro y oscuro", async ({
  page,
}) => {
  await sembrar(page, { temas: ["dinosaurios"] });
  await jugar(page, "/jugar/globo");
  const p = page.getByTestId("protagonista");
  await expect(p).toHaveAttribute("data-tema", "dinosaurios");
  await expect(p).toHaveAttribute("role", "img");
  await expect(p).toHaveAttribute("aria-label", /dinosaurio/i);
  // Dibujo cargado de verdad (import dinámico): hay un SVG dentro.
  await expect(p.locator("svg")).toHaveCount(1);
  // Viste, no cambia la mecánica: el globo y el medidor siguen ahí.
  await expect(page.getByTestId("globo")).toBeVisible();
  await expect(page.getByTestId("medidor")).toBeVisible();
  await axeLimpio(page);
  await page.screenshot({ path: "test-results/su-mundo-globo-dinosaurios.png" });
});

test("cada perfil ve el suyo: con «el mar» y sin meta, el protagonista es el mar y la tarjeta no inventa palabras", async ({
  page,
}) => {
  await sembrar(page, { temas: ["mar"] });
  await page.goto("/jugar/globo");
  await expect(page.getByTestId("empezar-juego")).toBeEnabled();
  // Sin meta, la tarjeta no inventa palabras.
  await expect(page.getByTestId("guion-modele")).toHaveCount(0);
  await page.getByTestId("empezar-juego").click();
  await expect(page.getByTestId("juego")).toHaveAttribute("data-fase", "jugando", { timeout: 20_000 });
  await expect(page.getByTestId("protagonista")).toHaveAttribute("data-tema", "mar");
});

test("la meta «colores» pone las palabras en la tarjeta del adulto y en su turno del apuntador", async ({
  page,
}) => {
  await sembrar(page, { temas: ["dinosaurios"], objetivo: "colores" });
  await page.goto("/jugar/globo");
  await expect(page.getByTestId("guion-modele")).toContainText("Modele una palabra de su meta:");
  await expect(page.getByTestId("guion-modele")).toContainText("rojo · azul · amarillo · verde");
  await page.getByTestId("empezar-juego").click();
  await expect(page.getByTestId("juego")).toHaveAttribute("data-fase", "jugando", { timeout: 20_000 });
  // El apuntador propone la palabra SOLO en el turno del adulto.
  await expect(page.getByTestId("apuntador-palabras")).toHaveCount(0);
  await page.getByTestId("cambiar-turno").click();
  await expect(page.getByTestId("apuntador-palabras")).toContainText("Puede decir: rojo · azul");
  await page.getByTestId("cambiar-turno").click();
  await expect(page.getByTestId("apuntador-palabras")).toHaveCount(0);
  // La vista del niño no dice nada de la meta ni de las palabras (soberana).
  await expect(page.getByTestId("escenario")).not.toContainText(/modele|puede decir|rojo/i);
});

test("palabra↔objeto sigue a la meta: sin meta abre con un dibujo de sus temas; al guardar «colores» en Objetivo, abre con el rojo", async ({
  page,
}) => {
  await sembrar(page, { temas: ["animales"] });
  const primero = async () => {
    await page.goto("/jugar/palabras");
    await page.getByTestId("empezar-juego").click();
    await expect(page.getByTestId("juego")).toHaveAttribute("data-fase", "jugando", { timeout: 20_000 });
    return (await page.getByTestId("palabra-del-picto").innerText()).trim();
  };
  expect(await primero()).not.toBe("rojo");
  await page.goto("/objetivo");
  await page.getByTestId("objetivo-input").fill("colores");
  await page.getByTestId("guardar-objetivo").click();
  await expect(page.getByTestId("objetivo-activo")).toContainText("colores");
  // La tarjeta dice la verdad: «colores» SÍ cambia los juegos (no «sin-juegos»).
  await expect(page.getByTestId("objetivo-activo")).toHaveAttribute("data-estado", "alineado");
  expect(await primero()).toBe("rojo");
});

test("la tarjeta del recordatorio es del adulto: aparece sin lote, «Ahora no» la esconde hasta mañana, y es axe limpia", async ({
  page,
}) => {
  await page.clock.install({ time: new Date(`${HOY}T10:00:00`) });
  await sembrar(page, { temas: ["animales"] });
  await page.goto("/");
  const tarjeta = page.getByTestId("recordatorio-cuentos");
  await expect(tarjeta).toBeVisible();
  await expect(tarjeta).toHaveAttribute("data-motivo", "nunca");
  await expect(tarjeta).toContainText("Los cuentos del mes");
  await expect(page.getByTestId("recordatorio-pedir")).toHaveAttribute("href", "/cuentos");
  await axeLimpio(page);
  await page.screenshot({ path: "test-results/su-mundo-recordatorio.png" });

  await page.getByTestId("recordatorio-ahora-no").click();
  await expect(tarjeta).toHaveCount(0);
  await page.reload();
  await expect(page.getByTestId("capsula")).toBeVisible();
  await expect(page.getByTestId("recordatorio-cuentos")).toHaveCount(0);

  // Mañana vuelve (la fecha es la perilla).
  await page.clock.setFixedTime(new Date("2026-11-17T10:00:00"));
  await page.reload();
  await expect(page.getByTestId("recordatorio-cuentos")).toBeVisible();
});

test("con un lote reciente no hay recordatorio; con el último de hace más de un mes, sí", async ({
  page,
}) => {
  await page.clock.install({ time: new Date(`${HOY}T10:00:00`) });
  const lote = JSON.parse(
    readFileSync(join(__dirname, "../fixtures/lote-cuentos-prueba.json"), "utf8"),
  ) as { cuentos: { id: string }[] };
  const guardado = (importado: string) => ({
    intereses: [],
    palabrasMeta: [],
    cuentos: lote.cuentos.slice(0, 1).map((cuento) => ({
      cuento,
      estado: "aprobado",
      lote: "prueba",
      importado,
    })),
  });
  await sembrar(page, { temas: ["animales"], cuentos: guardado("2026-11-10") });
  await page.goto("/");
  await expect(page.getByTestId("capsula")).toBeVisible();
  await expect(page.getByTestId("recordatorio-cuentos")).toHaveCount(0);

  // El mismo lote, pero de hace 40 días: toca pedir el del mes (con el motivo y los días).
  const otra = await page.context().newPage();
  await otra.clock.install({ time: new Date(`${HOY}T10:00:00`) });
  await sembrar(otra, { temas: ["animales"], cuentos: guardado("2026-10-07") });
  await otra.goto("/");
  const tarjeta = otra.getByTestId("recordatorio-cuentos");
  await expect(tarjeta).toHaveAttribute("data-motivo", "vencido");
  await expect(tarjeta).toContainText("40 días");
});

test("sus intereses viven en el perfil: se añaden ahí, se ven en el resumen y Cuentos los lee (sin campo «Le gusta»)", async ({
  page,
}) => {
  await sembrar(page, { temas: ["animales"] });
  await page.goto("/ajustes");
  await page.getByTestId("editar-perfil").click();
  await page.getByTestId("otras-cosas-entrada").fill("burbujas");
  await page.getByTestId("otras-cosas-anadir").click();
  await expect(page.getByTestId("otras-cosas")).toContainText("burbujas");
  await page.getByTestId("guardar-perfil").click();
  await expect(page.getByTestId("perfil-otras-cosas")).toHaveText("burbujas");

  await page.goto("/estudio/cuentos");
  await expect(page.getByTestId("cuentos-guardar-gustos")).toBeEnabled();
  await expect(page.getByTestId("cuentos-intereses")).toContainText("burbujas");
  await expect(page.getByTestId("cuentos-ir-al-perfil")).toBeVisible();
  // No hay un segundo lugar donde escribirlos.
  await expect(page.getByRole("textbox", { name: /^Le gusta$/ })).toHaveCount(0);
});

test("el «Le gusta» que ya existía pasa al perfil sin perder nada", async ({ page }) => {
  await sembrar(page, {
    temas: ["animales"],
    cuentos: { intereses: ["trenes", "nubes"], palabrasMeta: [], cuentos: [] },
  });
  await page.goto("/ajustes");
  await expect(page.getByTestId("perfil-otras-cosas")).toHaveText("trenes · nubes");
  await page.goto("/estudio/cuentos");
  await expect(page.getByTestId("cuentos-intereses")).toContainText("trenes, nubes");
});

test("«otras cosas» solo admite palabras generales: un valor con números se rechaza con su ayuda y nada se escribe", async ({
  page,
}) => {
  await sembrar(page, { temas: ["animales"] });
  await page.goto("/ajustes");
  await page.getByTestId("editar-perfil").click();
  // Un valor mal formado (números) se rechaza con su ayuda, y nada se escribe.
  await page.getByTestId("otras-cosas-entrada").fill("tren 4");
  await page.getByTestId("otras-cosas-anadir").click();
  await expect(page.getByTestId("otras-cosas-aviso")).toContainText("Una a tres palabras");
  await expect(page.getByTestId("otras-cosas")).toHaveCount(0);
});

test("el protagonista no cambia la privacidad: cero red jugando con su mundo puesto", async ({
  page,
  context,
  baseURL,
}) => {
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
  await sembrar(page, { temas: ["espacio", "musica"], otrasCosas: ["trenes"], objetivo: "colores" });
  await jugar(page, "/jugar/globo");
  await expect(page.getByTestId("protagonista")).toBeVisible();
  await page.waitForTimeout(1_000);
  expect(fuera, `salió tráfico del dispositivo: ${fuera.join(", ")}`).toEqual([]);
});
