import { AxeBuilder } from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// LA VIDEOTECA DE LA FAMILIA (S8) — se llega POR LA UI: Estudio → «Abrir los videos». El clip se
// FABRICA en la prueba (un lienzo grabado un segundo con MediaRecorder): jamás hay video real en el
// repo. Lo que se blinda: elegir de la galería (<input type="file"> sin `capture`, la app no abre la
// cámara) → guardarlo solo en el dispositivo → mostrarlo → borrarlo de un toque; «Borrar mis datos»
// también la vacía, y todo el rato cero conexiones hacia afuera.

/** Fabrica un clip webm de un segundo en el propio navegador y lo devuelve en base64. */
async function fabricarClip(page: Page): Promise<Buffer> {
  const b64 = await page.evaluate(async () => {
    const lienzo = document.createElement("canvas");
    lienzo.width = 64;
    lienzo.height = 48;
    const ctx = lienzo.getContext("2d")!;
    const flujo = lienzo.captureStream(10);
    const grabador = new MediaRecorder(flujo, { mimeType: "video/webm" });
    const trozos: Blob[] = [];
    grabador.ondataavailable = (e) => trozos.push(e.data);
    const fin = new Promise<void>((res) => (grabador.onstop = () => res()));
    grabador.start();
    for (let i = 0; i < 10; i++) {
      ctx.fillStyle = `hsl(${i * 30} 60% 50%)`;
      ctx.fillRect(0, 0, 64, 48);
      await new Promise((r) => setTimeout(r, 100));
    }
    grabador.stop();
    await fin;
    const datos = new Uint8Array(await new Blob(trozos, { type: "video/webm" }).arrayBuffer());
    let bin = "";
    datos.forEach((b) => (bin += String.fromCharCode(b)));
    return btoa(bin);
  });
  return Buffer.from(b64, "base64");
}

test("elegir un clip de la galería, verlo, y borrarlo de un toque — sin cámara y sin red", async ({ page }) => {
  const origen = new URL(test.info().project.use.baseURL ?? "http://127.0.0.1:3500").origin;
  const fuera: string[] = [];
  page.on("request", (r) => {
    if (r.url().startsWith("http") && !r.url().startsWith(origen)) fuera.push(r.url());
  });

  await page.goto("/estudio");
  await page.getByTestId("ir-a-videos").click();
  await expect(page).toHaveURL(/\/estudio\/videos$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Videos de la familia");
  await expect(page.getByTestId("videoteca-promesa")).toContainText("La app no abre la cámara.");
  await expect(page.getByTestId("clips-vacio")).toBeVisible();

  // El selector pide VIDEO de la galería: sin `capture`, la cámara jamás se abre.
  const archivo = page.getByTestId("clip-archivo");
  await expect(archivo).toHaveAttribute("accept", "video/*");
  await expect(archivo).not.toHaveAttribute("capture", /.*/);

  await page.getByTestId("conducta-jugar").check();
  await page.getByTestId("clip-quien").fill("la abuela");
  const clip = await fabricarClip(page);
  await archivo.setInputFiles({ name: "clip.webm", mimeType: "video/webm", buffer: clip });

  const lista = page.getByTestId("clips-lista");
  await expect(lista).toBeVisible();
  await expect(lista.locator("li")).toHaveCount(1);
  await expect(lista).toContainText("Clip de Jugar");
  await expect(lista).toContainText("la abuela");

  // Sobrevive a recargar: vive en IndexedDB, en este dispositivo.
  await page.reload();
  await expect(page.getByTestId("clips-lista").locator("li")).toHaveCount(1);

  // Verlo: el reproductor aparece, en bucle y sin sonido hasta que el adulto lo pida.
  await page.locator('[data-testid^="clip-ver-"]').click();
  const video = page.getByTestId("clip-video");
  await expect(video).toBeVisible();
  await expect(video).toHaveJSProperty("loop", true);
  await expect(video).toHaveJSProperty("muted", true);
  await page.getByTestId("clip-sonido").click();
  await expect(video).toHaveJSProperty("muted", false);

  // Borrar: dos toques (el segundo confirma) y no queda nada.
  await page.locator('[data-testid^="clip-borrar-"]').click();
  await expect(page.locator('[data-testid^="clip-borrar-"]')).toContainText("¿Seguro?");
  await page.locator('[data-testid^="clip-borrar-"]').click();
  await expect(page.getByTestId("clips-vacio")).toBeVisible();
  await page.reload();
  await expect(page.getByTestId("clips-vacio")).toBeVisible();

  expect(fuera, "la videoteca no abre conexiones hacia afuera").toEqual([]);
});

test("un archivo que no es video se rechaza con un aviso honesto, y no se guarda nada", async ({ page }) => {
  await page.goto("/estudio/videos");
  await page.getByTestId("clip-archivo").setInputFiles({ name: "foto.png", mimeType: "image/png", buffer: Buffer.from([137, 80, 78, 71]) });
  await expect(page.getByTestId("clip-error")).toContainText("no es un video");
  await expect(page.getByTestId("clips-vacio")).toBeVisible();
});

test("«Borrar mis datos» también vacía la videoteca", async ({ page }) => {
  await page.goto("/estudio/videos");
  const clip = await fabricarClip(page);
  await page.getByTestId("clip-archivo").setInputFiles({ name: "clip.webm", mimeType: "video/webm", buffer: clip });
  await expect(page.getByTestId("clips-lista").locator("li")).toHaveCount(1);

  await page.goto("/ajustes");
  await page.getByTestId("borrar-datos").click();
  await page.getByTestId("confirmar-borrado").click();
  // «Borrar mis datos» manda al inicio: esperamos a que la navegación termine.
  await page.waitForURL((u) => u.pathname === "/");
  await page.goto("/estudio/videos");
  await expect(page.getByTestId("clips-vacio")).toBeVisible();
});

test("en inglés, la videoteca habla inglés y nombra lo mismo", async ({ browser }) => {
  const ctx = await browser.newContext({ locale: "en-US", serviceWorkers: "block" });
  const page = await ctx.newPage();
  await page.goto("/estudio/videos");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Family videos");
  await expect(page.getByTestId("videoteca-promesa")).toContainText("The app never opens the camera.");
  expect(await page.locator("main").innerText()).not.toMatch(/\b(Añadir|Videos de la familia|Borrar)\b/);
  await ctx.close();
});

test("a11y: la videoteca sin violaciones serias", async ({ page }) => {
  await page.goto("/estudio/videos");
  await expect(page.getByTestId("clips-vacio")).toBeVisible();
  const r = await new AxeBuilder({ page }).analyze();
  expect(r.violations.filter((v) => v.impact === "serious" || v.impact === "critical")).toEqual([]);
});
