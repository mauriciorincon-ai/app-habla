import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "./base";

// SESIONES CORTAS (S12, ADR-024): el tope diario de juego. Se llega POR LA UI, con el micrófono falso. La fecha
// y los milisegundos se siembran en el almacenamiento local (el contador es local y solo guarda eso). Lo que
// garantiza: al tope, UN aviso al adulto (`role="status"`, icono + texto) y el juego se cierra con calma como
// «Salir»; no bloquea (se puede volver a empezar y no se corta una segunda vez); jamás «se acabó»; el contador
// no viaja al archivo de la otra casa; y el tope se elige en Ajustes entre 5 y 10.

const hoy = () => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

async function sembrar(page: import("@playwright/test").Page, ms: number, extra: object = {}) {
  await page.addInitScript(
    ({ fecha, ms, extra }) => {
      window.localStorage.setItem("habla:v1:pantalla", JSON.stringify({ fecha, ms, avisado: false }));
      if (Object.keys(extra).length) window.localStorage.setItem("habla:v1:ajustes", JSON.stringify(extra));
    },
    { fecha: hoy(), ms, extra },
  );
}

test("al llegar al tope el juego se cierra con calma, avisa UNA vez al adulto y no se corta de nuevo", async ({
  page,
}) => {
  await sembrar(page, 10 * 60_000 - 3000);
  await page.goto("/jugar/globo");
  await page.getByTestId("empezar-juego").click();
  await expect(page.getByTestId("juego")).toHaveAttribute("data-fase", "jugando", { timeout: 20_000 });

  // A los pocos segundos: de vuelta al guion (como «Salir»), con el aviso al adulto.
  await expect(page.getByTestId("juego")).toHaveAttribute("data-fase", "guion", { timeout: 15_000 });
  const aviso = page.getByTestId("aviso-tope");
  await expect(aviso).toBeVisible();
  await expect(aviso).toHaveAttribute("role", "status");
  await expect(aviso).toContainText(/10 min/);
  await expect(aviso).toContainText("Es su decisión");
  // Jamás «se acabó», un «no» ni un castigo.
  await expect(aviso).not.toContainText(/se acab|prohibid|bloquead|no puede|castig/i);
  // Es una pantalla del adulto: nada en la del niño.
  await expect(page.getByTestId("juego")).not.toHaveClass(/tema-nino/);

  // El estado efímero, congelado, pasa axe en claro y oscuro.
  for (const esquema of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme: esquema });
    const { violations } = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
  }

  // No bloquea: se vuelve a empezar y NO se corta por segunda vez ese día.
  await page.getByTestId("empezar-juego").click();
  await expect(page.getByTestId("juego")).toHaveAttribute("data-fase", "jugando", { timeout: 20_000 });
  await page.waitForTimeout(5000);
  await expect(page.getByTestId("juego")).toHaveAttribute("data-fase", "jugando");

  // Al salir, el guion lleva solo la línea tranquila, sin repetir el aviso.
  await page.getByTestId("salir-al-guion").click();
  await expect(page.getByTestId("juego")).toHaveAttribute("data-fase", "guion");
  await expect(page.getByTestId("aviso-tope")).toHaveCount(0);
  await expect(page.getByTestId("hoy-jugaron")).toContainText("Hoy ya jugaron");
});

test("el contador de ayer no cuenta hoy: no hay aviso ni corte", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "habla:v1:pantalla",
      JSON.stringify({ fecha: "2000-01-01", ms: 9 * 60_000, avisado: true }),
    );
  });
  await page.goto("/jugar/globo");
  await expect(page.getByTestId("hoy-jugaron")).toHaveCount(0);
  await page.getByTestId("empezar-juego").click();
  await expect(page.getByTestId("juego")).toHaveAttribute("data-fase", "jugando", { timeout: 20_000 });
  await page.waitForTimeout(3000);
  await expect(page.getByTestId("juego")).toHaveAttribute("data-fase", "jugando");
  await expect(page.getByTestId("aviso-tope")).toHaveCount(0);
});

test("Gemelas también cuenta el tiempo y se cierra con calma al tope", async ({ page }) => {
  await sembrar(page, 10 * 60_000 - 2000);
  await page.goto("/jugar/gemelas");
  await page.getByTestId("empezar-juego").click();
  await expect(page.getByTestId("gemelas-ronda")).toBeVisible();
  await expect(page.getByTestId("aviso-tope")).toBeVisible({ timeout: 10_000 });
  await expect(page.getByTestId("empezar-juego")).toBeVisible();
});

test("en Ajustes el adulto elige el tope entre 5 y 10 minutos, 10 de fábrica, y el aviso lo respeta", async ({
  page,
}) => {
  await page.goto("/ajustes");
  const grupo = page.getByTestId("tope-diario");
  await expect(grupo).toBeVisible();
  await expect(page.getByTestId("tope-10")).toHaveAttribute("aria-pressed", "true");
  for (const n of [5, 6, 7, 8, 9, 10]) await expect(page.getByTestId(`tope-${n}`)).toBeVisible();
  await expect(page.getByTestId("tope-4")).toHaveCount(0);
  await expect(page.getByTestId("tope-11")).toHaveCount(0);
  // Toque del adulto ≥ 44 px.
  const caja = await page.getByTestId("tope-5").boundingBox();
  expect(caja?.height ?? 0).toBeGreaterThanOrEqual(44);

  await page.getByTestId("tope-5").click();
  await expect(page.getByTestId("tope-5")).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("tope-10")).toHaveAttribute("aria-pressed", "false");
  const ajustes = await page.evaluate(() => JSON.parse(window.localStorage.getItem("habla:v1:ajustes")!));
  expect(ajustes.topeMinutos).toBe(5);

  // Con 5 min, 4:57 jugados ya no avisan a los 10: avisan en cuanto llegan a 5.
  await page.evaluate((fecha) => {
    window.localStorage.setItem("habla:v1:pantalla", JSON.stringify({ fecha, ms: 5 * 60_000 - 3000, avisado: false }));
  }, hoy());
  await page.goto("/jugar/globo");
  await page.getByTestId("empezar-juego").click();
  await expect(page.getByTestId("aviso-tope")).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTestId("aviso-tope")).toContainText(/5 min/);
});
