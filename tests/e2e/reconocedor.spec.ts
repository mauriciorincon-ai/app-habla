import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// «¿DIJO LA PALABRA?» (S11, ADR-023), por la UI y con el micrófono falso: una grabación de Lingua Libre
// («gato», voluntaria adulta, CC BY-SA 4.0, nunca de la familia; tests/e2e/fixtures/palabras/mic-es.wav).
//
// Lo que blinda: viene apagado; encenderlo descarga el modelo; en el juego el «quizás dijo» sale SOLO
// cuando la palabra de la ronda coincide; jamás hay un «no»; el conteo local sube cuando el adulto
// juzga; durante el juego hay CERO red; y «Borrar el reconocedor» deja el aparato limpio.

const PALABRA = "gato";
const origen = () => new URL(test.info().project.use.baseURL ?? "http://127.0.0.1:3500").origin;

async function encender(page: Page) {
  await page.goto("/ajustes");
  const interruptor = page.getByTestId("reconocedor");
  await expect(interruptor).toBeEnabled();
  await expect(interruptor).toHaveAttribute("aria-checked", "false");
  await interruptor.click();
  await expect(interruptor).toHaveAttribute("aria-checked", "true", { timeout: 150_000 });
  await expect(page.getByTestId("reconocedor-estado")).toContainText("Listo");
}

test("viene apagado, se enciende con la descarga y se borra del aparato", async ({ page }) => {
  await page.goto("/ajustes");
  await expect(page.getByTestId("seccion-reconocedor")).toContainText("unos 40 MB");
  await expect(page.getByTestId("animacion-reconocedor")).toHaveCount(0);
  await encender(page);

  // La luz suave del niño: segundo interruptor, apagado por defecto.
  const luz = page.getByTestId("animacion-reconocedor");
  await expect(luz).toHaveAttribute("aria-checked", "false");
  await expect(page.getByTestId("conteo-lectura")).toContainText("Todavía no se puede decir");

  const axe = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(axe.violations).toEqual([]);

  await page.getByTestId("borrar-reconocedor").click();
  await expect(page.getByTestId("reconocedor")).toHaveAttribute("aria-checked", "false");
  await expect(page.getByTestId("reconocedor-estado")).toContainText("borrado");
  expect(await page.evaluate(() => caches.has("habla-reconocedor-v1"))).toBe(false);
  // Neither does the Worker's own copy of the model (vosk's IndexedDB, ADR-023 §9) stay behind.
  expect(
    (await page.evaluate(async () => (await indexedDB.databases()).map((d) => d.name))).filter(
      (n) => n?.includes("vosk"),
    ),
  ).toEqual([]);
});

test("palabras: «quizás dijo» solo con la palabra de la ronda, cero red, y el conteo sube con el juicio", async ({
  page,
}) => {
  await encender(page);
  await page.getByTestId("animacion-reconocedor").click();

  const fuera: string[] = [];
  await page.context().route("**/*", async (route) => {
    const url = route.request().url();
    if (!url.startsWith(origen()) && !url.startsWith("blob:") && !url.startsWith("data:")) {
      fuera.push(url);
      await route.abort();
      return;
    }
    await route.continue();
  });

  await page.goto("/jugar/palabras");
  await page.getByTestId("empezar-juego").click();
  await expect(page.getByTestId("juego")).toHaveAttribute("data-fase", "jugando", { timeout: 30_000 });

  // Ventana de juego: nada de red (salvo los dibujos locales y el ruido del servidor de desarrollo).
  const peticiones: string[] = [];
  page.on("request", (r) => {
    const u = r.url();
    const ruido =
      u.includes("webpack-hmr") || u.includes("hot-update") || u.includes("__nextjs") ||
      u.includes("/_next/") || u.endsWith("favicon.ico") || u.startsWith("blob:") ||
      u.startsWith(`${origen()}/pictogramas/`);
    if (!ruido) peticiones.push(u);
  });

  // Una ronda con otro dibujo: el reconocedor oye «gato» y NO dice nada (jamás un «no»).
  const palabraVisible = async () => (await page.getByTestId("palabra-del-picto").innerText()).trim();
  for (let i = 0; i < 40 && (await palabraVisible()) === PALABRA; i++)
    await page.getByTestId("siguiente-picto").click();
  await page.waitForTimeout(6000);
  await expect(page.getByTestId("quizas-dijo")).toHaveCount(0);

  // La ronda de «gato»: aparece la línea del adulto, y el halo del niño (sin texto).
  for (let i = 0; i < 40 && (await palabraVisible()) !== PALABRA; i++)
    await page.getByTestId("siguiente-picto").click();
  await expect(page.getByTestId("quizas-dijo")).toContainText(`Quizás dijo «${PALABRA}»`, { timeout: 30_000 });
  await expect(page.getByTestId("quizas-dijo")).not.toContainText(/no /i);
  // The child's glow (switched on above): a soft light, no text, hidden from assistive tech.
  const halo = page.getByTestId("halo-reconocedor");
  await expect(halo).toBeVisible();
  await expect(halo).toHaveAttribute("aria-hidden", "true");
  await expect(halo).toHaveText("");
  await expect(page.getByTestId("juego")).not.toContainText(/incorrect|mal\b/i);

  // Axe sobre la línea del adulto (el resto de la pantalla del niño lo audita a11y.spec.ts).
  const axeJuego = await new AxeBuilder({ page })
    .include('[data-testid="quizas-region"]')
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(axeJuego.violations).toEqual([]);

  // El adulto juzga: el conteo local sube. Pasa de ronda (cierra el 2×2).
  await page.getByTestId("dijo-la-palabra").click();
  await page.getByTestId("siguiente-picto").click();
  expect(peticiones, `Hubo red durante el juego: ${peticiones.join(", ")}`).toEqual([]);
  expect(fuera, `Salió tráfico del dispositivo: ${fuera.join(", ")}`).toEqual([]);

  await page.goto("/ajustes");
  await expect(page.getByTestId("conteo-siSi")).toHaveText("1");
});

test("gemelas: el micrófono solo se abre si el adulto toca «Escuchar»; con «gato» en el par sale el «quizás» (sin halo: la luz está apagada) y no hay red", async ({
  page,
}) => {
  await encender(page);
  const fuera: string[] = [];
  await page.context().route("**/*", async (route) => {
    const url = route.request().url();
    if (!url.startsWith(origen()) && !url.startsWith("blob:") && !url.startsWith("data:")) {
      fuera.push(url);
      await route.abort();
      return;
    }
    await route.continue();
  });
  await page.addInitScript(() => {
    (window as unknown as { __gum: number }).__gum = 0;
    const md = navigator.mediaDevices;
    const orig = md.getUserMedia.bind(md);
    md.getUserMedia = (...a: Parameters<typeof orig>) => {
      (window as unknown as { __gum: number }).__gum++;
      return orig(...a);
    };
  });
  await page.goto("/jugar/gemelas");
  await page.getByTestId("empezar-juego").click();
  await expect(page.getByTestId("gemelas-ronda")).toBeVisible();
  expect(await page.evaluate(() => (window as unknown as { __gum: number }).__gum)).toBe(0);

  // Two taps in a row open ONE microphone (the second one, with the permission prompt open, does nothing).
  const escuchar = page.getByTestId("escuchar-reconocedor");
  await escuchar.dblclick();
  await expect(page.getByTestId("reconocedor-escuchando")).toBeVisible({ timeout: 60_000 });
  expect(await page.evaluate(() => (window as unknown as { __gum: number }).__gum)).toBe(1);

  // Walk the rounds: when the pair has «gato» the adult's line says so; otherwise there is nothing (never a «no»).
  // The fake microphone repeats «gato» about every 9 s.
  let vistoGato = false;
  for (let ronda = 1; ronda <= 6; ronda++) {
    const palabras = await page.locator('[data-testid="gemelas-ronda"] p.font-display').allInnerTexts();
    if (palabras.map((p) => p.trim()).includes(PALABRA)) {
      await expect(page.getByTestId("quizas-dijo")).toContainText(`Quizás dijo «${PALABRA}»`, {
        timeout: 30_000,
      });
      await expect(page.getByTestId("halo-reconocedor")).toHaveCount(0); // the glow is off by default
      vistoGato = true;
      break;
    }
    await page.waitForTimeout(9500);
    await expect(page.getByTestId("quizas-dijo")).toHaveCount(0);
    if (ronda < 6) await page.getByTestId("saltar-ronda").click();
  }
  console.log(vistoGato ? "gemelas: par con «gato» probado" : "gemelas: hoy no sale un par con «gato»");
  expect(fuera, `Salió tráfico del dispositivo: ${fuera.join(", ")}`).toEqual([]);
});
