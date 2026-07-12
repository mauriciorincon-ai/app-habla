import { expect, test } from "@playwright/test";

// Spike barato en CI (orden §Tareas 3): valida TEMPRANO que el fake-mic de Chromium alimenta el
// pipeline completo (getUserMedia → AudioWorklet → RMS en pantalla). Si esto es estable, los
// e2e del juego confían en el mic falso; si no, el plan B es ScriptedSource (ADR 003).
// El WAV loopea: 0–2.8 s silencio (rms ≈ 0.002) → 2.8–7 s voz (rms ≈ 0.25) → 7–8 s silencio.

test("el fake-mic alimenta el medidor RMS con el AudioWorklet", async ({
  page,
}) => {
  await page.goto("/spike/audio");
  await page.getByTestId("spike-toggle").click();

  await expect(page.getByTestId("spike-estado")).toContainText(
    "estado: activo",
  );
  // El motor real debe ser el worklet (el fallback aquí sería una regresión del pipeline).
  await expect(page.getByTestId("spike-motor")).toContainText("motor: worklet");

  // El meter fluye: frames/s > 0 sostenido.
  await expect
    .poll(
      async () => parseInt(await page.getByTestId("spike-fps").innerText(), 10),
      {
        timeout: 10_000,
      },
    )
    .toBeGreaterThan(0);

  // En la ventana de voz del WAV el RMS debe superar con holgura el piso de silencio.
  await expect
    .poll(
      async () => parseFloat(await page.getByTestId("spike-rms").innerText()),
      {
        timeout: 15_000,
      },
    )
    .toBeGreaterThan(0.05);
});
