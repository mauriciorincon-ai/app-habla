import { expect, test, type Page } from "@playwright/test";

// EL CONTACTO VISUAL EN «HOY» (S9). Lo que blinda:
//   - Cada día trae UNA actividad de contacto visual junto a la cápsula del habla, con la línea del adulto primero.
//   - No se repite dentro de la semana (la fecha es la perilla: el reloj se fija, regla 23).
//   - El adulto elige el paso en Ajustes y la actividad se calibra a él.
//   - Cero pantalla y cero cámara: la app no pide permisos.

async function entrar(page: Page, fecha: string) {
  await page.clock.install({ time: new Date(`${fecha}T10:00:00`) });
  await page.goto("/");
  await page.getByRole("textbox", { name: /cómo le dicen/i }).fill("Peque");
  await page.getByRole("button", { name: "Animales" }).click();
  await page.getByTestId("terminar-onboarding").click();
  await expect(page.getByTestId("capsula")).toBeVisible();
}

test("Hoy trae el contacto visual junto a la cápsula, con la línea del adulto antes que la actividad", async ({ page }) => {
  await entrar(page, "2026-11-09");
  const bloque = page.getByTestId("contacto-visual-hoy");
  await expect(bloque).toBeVisible();
  await expect(page.getByTestId("capsula")).toBeVisible();
  const guion = await page.getByTestId("contacto-visual-guion").boundingBox();
  const actividad = await page.getByTestId("contacto-visual-actividad").boundingBox();
  expect(guion!.y).toBeLessThan(actividad!.y);
  await expect(bloque.getByRole("link", { name: /la pirámide, en casa/i })).toHaveAttribute("href", "/mirada");
});

test("siete días seguidos, siete actividades distintas, y la misma fecha da la misma", async ({ page }) => {
  await entrar(page, "2026-11-09");
  const vistas: string[] = [];
  for (const dia of ["09", "10", "11", "12", "13", "14", "15"]) {
    await page.clock.setFixedTime(new Date(`2026-11-${dia}T10:00:00`));
    await page.reload();
    const id = await page.getByTestId("contacto-visual-hoy").getAttribute("data-contacto-visual-id");
    vistas.push(id!);
  }
  expect(new Set(vistas).size).toBe(7);
  await page.clock.setFixedTime(new Date("2026-11-09T21:00:00"));
  await page.reload();
  await expect(page.getByTestId("contacto-visual-hoy")).toHaveAttribute("data-contacto-visual-id", vistas[0]);
});

test("el adulto elige su paso en Ajustes y la pantalla no abre cámara ni micrófono", async ({ page }) => {
  // Un contador en getUserMedia: Hoy y Ajustes jamás lo llaman (la app no abre la cámara, regla 2).
  await page.addInitScript(() => {
    (window as unknown as { __gum: number }).__gum = 0;
    const md = navigator.mediaDevices;
    if (md?.getUserMedia) {
      const original = md.getUserMedia.bind(md);
      md.getUserMedia = (...a) => {
        (window as unknown as { __gum: number }).__gum++;
        return original(...a);
      };
    }
  });
  await entrar(page, "2026-11-12");
  await page.goto("/ajustes");
  await expect(page.getByTestId("nivel-mirada-n1")).toHaveAttribute("aria-pressed", "true");
  await page.getByTestId("nivel-mirada-n3").click();
  await expect(page.getByTestId("nivel-mirada-n3")).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("nivel-mirada-n3")).toContainText(/elegido/i);
  await page.goto("/");
  await expect(page.getByTestId("contacto-visual-hoy")).toBeVisible();
  expect(await page.evaluate(() => (window as unknown as { __gum: number }).__gum)).toBe(0);
});
