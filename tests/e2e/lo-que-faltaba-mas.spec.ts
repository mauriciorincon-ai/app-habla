import { expect, test, type Page } from "./base";

// LO QUE FALTABA, LO QUE QUEDABA SIN PROBAR (S15, auditoría): el aviso del Estudio sin voz local, «le salió»
// en la celebración, la sorpresa en un juego de voz y el tope en la videoteca. Todo por la UI.

const LOCALE = { es: "es-ES", en: "en-US" } as const;

async function inyectarGrabacion(page: Page, id: string) {
  await page.evaluate(async (clave) => {
    await new Promise<void>((resolve, reject) => {
      const req = indexedDB.open("habla-banco-voz", 1);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains("grabaciones"))
          req.result.createObjectStore("grabaciones");
      };
      req.onsuccess = () => {
        const tx = req.result.transaction("grabaciones", "readwrite");
        tx.objectStore("grabaciones").put(
          { datos: new ArrayBuffer(64), mimeType: "audio/webm", duracionMs: 500, fecha: "2026-07-18" },
          clave,
        );
        tx.oncomplete = () => {
          req.result.close();
          resolve();
        };
        tx.onerror = () => reject(tx.error);
      };
      req.onerror = () => reject(req.error);
    });
  }, id);
}

for (const idioma of ["es", "en"] as const) {
  test.describe(`idioma ${idioma}`, () => {
    test.use({ locale: LOCALE[idioma] });

    test("Estudio: sin voz local avisa qué grabar; con una voz local no aparece", async ({ page }) => {
      // base.ts deja getVoices() vacío: este aparato no trae voz propia.
      await page.goto("/estudio");
      const aviso = page.getByTestId("aviso-sin-voz-local");
      await aviso.scrollIntoViewIfNeeded();
      await expect(aviso).toBeVisible();
      await expect(aviso).toContainText(/\d+/);

      // Con una voz local en el idioma de la pantalla, el aviso desaparece.
      const lang = LOCALE[idioma];
      await page.addInitScript((l) => {
        Object.defineProperty(window, "speechSynthesis", {
          value: {
            getVoices: () => [{ name: "Local", lang: l, localService: true, default: true, voiceURI: "Local" }],
            speak: () => undefined,
            cancel: () => undefined,
            addEventListener: () => undefined,
            removeEventListener: () => undefined,
          },
          configurable: true,
        });
      }, lang);
      await page.goto("/estudio");
      await expect(page.getByTestId("ir-a-videos")).toBeVisible();
      await expect(page.getByTestId("aviso-sin-voz-local")).toHaveCount(0);
    });

    test("«le salió» suena con la voz de la familia cuando su voz se midió", async ({ page }) => {
      await page.addInitScript(() => {
        (window as unknown as { __sono: string[] }).__sono = [];
        window.addEventListener("voz-familiar:sono", (e) =>
          (window as unknown as { __sono: string[] }).__sono.push((e as CustomEvent<{ id: string }>).detail.id),
        );
      });
      await page.goto("/jugar/globo");
      const sufijo = idioma === "es" ? "" : "-en";
      await inyectarGrabacion(page, `celebracion${sufijo}:le-salio`);
      await inyectarGrabacion(page, `celebracion${sufijo}:casi`);
      await page.goto("/jugar/globo");
      await page.getByTestId("empezar-juego").click();
      await expect(page.getByTestId("juego")).toHaveAttribute("data-fase", "jugando", { timeout: 20_000 });
      // Let the meter measure a little voice before «Ya jugamos»: «le salió» only says what was measured.
      await page.waitForTimeout(2500);
      await page.getByTestId("terminar").click();
      await expect(page.getByTestId("celebracion")).toBeVisible();
      await expect
        .poll(() => page.evaluate(() => (window as unknown as { __sono: string[] }).__sono))
        .toContain(`celebracion${sufijo}:le-salio`);
      const sonaron = await page.evaluate(() => (window as unknown as { __sono: string[] }).__sono);
      expect(sonaron).not.toContain(`celebracion${sufijo}:casi`);
    });

    test("la sorpresa también sale en un juego de voz, a su tercer turno medido", async ({ page }) => {
      test.setTimeout(120_000);
      await page.clock.setFixedTime(new Date("2026-03-04T10:00:00"));
      await page.goto("/jugar/globo");
      await page.getByTestId("empezar-juego").click();
      await expect(page.getByTestId("franja-apuntador")).toBeVisible({ timeout: 20_000 });
      await expect(page.getByTestId("sorpresa")).toHaveCount(0);
      const sorpresa = page.getByTestId("sorpresa");
      for (let vuelta = 0; vuelta < 6 && (await sorpresa.count()) === 0; vuelta++) {
        // Un turno suyo con voz medida, luego el del adulto, y otra vez el suyo.
        await expect(page.getByTestId("juego")).toHaveAttribute("data-fase", /jugando|esperando-voz/, { timeout: 20_000 });
        await page.waitForTimeout(2500);
        await page.getByTestId("cambiar-turno").click();
        await page.getByTestId("cambiar-turno").click();
      }
      await expect(sorpresa).toBeVisible({ timeout: 15_000 });
      // Su hueco es la región viva (existe desde el primer pintado; así se anuncia la tarjeta que entra).
      await expect(page.getByTestId("hueco-sorpresa")).toHaveAttribute("role", "status");
    });
  });
}

test("videoteca: el tope cuenta el clip y el aviso espera a que termine", async ({ page }) => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  const hoy = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  await page.addInitScript(
    ({ fecha, ms }) =>
      window.localStorage.setItem("habla:v1:pantalla", JSON.stringify({ fecha, ms, avisado: false })),
    { fecha: hoy, ms: 10 * 60_000 - 2000 },
  );
  await page.goto("/estudio/videos");
  const b64 = await page.evaluate(async () => {
    const lienzo = document.createElement("canvas");
    lienzo.width = 64;
    lienzo.height = 48;
    const ctx = lienzo.getContext("2d")!;
    const grabador = new MediaRecorder(lienzo.captureStream(10), { mimeType: "video/webm" });
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
  await page.getByTestId("conducta-jugar").check();
  await page.getByTestId("clip-quien").fill("la abuela");
  await page.getByTestId("clip-archivo").setInputFiles({
    name: "clip.webm",
    mimeType: "video/webm",
    buffer: Buffer.from(b64, "base64"),
  });
  await expect(page.getByTestId("clips-lista").locator("li")).toHaveCount(1);
  await page.locator('[data-testid^="clip-ver-"]').click();
  await expect(page.getByTestId("clip-video")).toBeVisible();
  // Mientras se ve no hay aviso; el clip llega a su fin y entonces UN aviso al adulto.
  await expect(page.getByTestId("aviso-tope")).toBeVisible({ timeout: 20_000 });
  await expect(page.getByTestId("aviso-tope")).toHaveAttribute("role", "status");
});
