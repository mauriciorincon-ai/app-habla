import { expect, test } from "@playwright/test";

// Spike de PITCH en CI (riesgo #1 del S2, ADR 007): valida el pipeline completo del tono
// (getUserMedia → AudioWorklet con YIN → pitch-tracker → pantalla) con un micrófono falso que
// CANTA. Corre solo en el proyecto `desktop-chromium-tono`, cuyo WAV es un barrido continuo:
// 0–2.8 s piso de ruido → 2.8–10 s tono 230↔420 Hz (sube·baja·sube·baja = 3 inversiones).
//
// Si esto es estable, el cohete va por tono. Si no, el ADR 007 activa el fallback honesto por
// energía — la mecánica no se cae, pero la decisión se toma con datos, no con fe.

test("el fake-mic que canta alimenta el detector de tono (YIN en el worklet)", async ({
  page,
}) => {
  await page.goto("/spike/audio");
  await page.getByTestId("spike-toggle").click();

  await expect(page.getByTestId("spike-motor")).toContainText("motor: worklet");

  // 1. Hay F0: en la ventana de canto del WAV, el tono suavizado cae dentro del rango infantil.
  await expect
    .poll(
      async () => {
        const texto = await page.getByTestId("spike-pitch-suave").innerText();
        const hz = parseFloat(texto);
        return Number.isNaN(hz) ? 0 : hz;
      },
      { timeout: 20_000 },
    )
    .toBeGreaterThan(200);

  await expect
    .poll(async () => {
      const texto = await page.getByTestId("spike-pitch-suave").innerText();
      const hz = parseFloat(texto);
      return Number.isNaN(hz) ? 999 : hz;
    })
    .toBeLessThan(450);

  // 2. El tono es ESTABLE, no un parpadeo: la mayoría de los frames con voz traen F0 confiable.
  //    (Esta es la medida que decide tono vs fallback — ADR 007.)
  await expect
    .poll(
      async () =>
        parseInt(await page.getByTestId("spike-cobertura").innerText(), 10),
      { timeout: 15_000 },
    )
    .toBeGreaterThan(70);

  // 3. La voz que sube y baja cuenta inversiones REALES (la métrica honesta del cohete).
  await expect
    .poll(
      async () =>
        parseInt(await page.getByTestId("spike-inversiones").innerText(), 10),
      { timeout: 25_000 },
    )
    .toBeGreaterThanOrEqual(2);
});
