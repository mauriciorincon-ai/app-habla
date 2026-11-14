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

test("gemelas: el micrófono solo se abre si el adulto toca «Escuchar»", async ({ page }) => {
  await encender(page);
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

  await page.getByTestId("escuchar-reconocedor").click();
  await expect(page.getByTestId("reconocedor-escuchando")).toBeVisible({ timeout: 60_000 });
  expect(await page.evaluate(() => (window as unknown as { __gum: number }).__gum)).toBe(1);
});
