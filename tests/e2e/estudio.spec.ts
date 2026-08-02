import { expect, test } from "@playwright/test";

// EL ESTUDIO DE GRABACIÓN (Outcome 1) — se llega POR LA UI (lección S2: nada de "comportamiento
// sin experiencia"). Usa el micrófono falso compartido: MediaRecorder "captura" el WAV sintético.
//
// Lo que este spec blinda: grabar la voz del ADULTO sube la cobertura del banco, y el flujo de 5
// estados (grabar → escuchar → aceptar) funciona. El banco vive en IndexedDB, SOLO local — su
// privacidad la cubre `privacidad-cero-red.spec.ts`. La grabación del micrófono es un dato que
// ninguna CI puede dar del TODO (la voz real del padre) → el gate de escritorio la completa.

test("grabar mi voz sube la cobertura del banco (flujo lote → aceptar)", async ({
  page,
}) => {
  await page.goto("/estudio");

  // El estudio nace con su titular estático (LCP) y la promesa de privacidad, siempre visible.
  await expect(
    page.getByText("La voz de tu hijo nunca se graba."),
  ).toBeVisible();

  // Vista de gestión: la cobertura aparece cuando el banco terminó de leerse.
  await expect(page.getByTestId("cobertura")).toBeVisible();
  await expect(page.getByTestId("lista-grabados")).toHaveCount(0);

  // Entrar al lote guiado y grabar el primer ítem.
  await page.getByTestId("ir-al-lote").click();
  await expect(page.getByTestId("lote")).toBeVisible();
  await expect(page.getByTestId("progreso-lote")).toContainText("1 de");
  const textoGrabado = (
    await page.getByTestId("item-texto").innerText()
  ).trim();

  await page.getByTestId("grabar").click();
  // "Grabando…" (estado grabando): el botón de parar aparece — y el MEDIDOR (gate S4, J2):
  // grabar a ciegas era un stopper real; la barra dice "ya empezó y te está oyendo".
  await expect(page.getByTestId("detener")).toBeVisible();
  await expect(page.getByTestId("medidor-grabacion")).toBeVisible();
  // Ventana de captura real (MediaRecorder es basado en tiempo): dejamos entrar algo de audio.
  await page.waitForTimeout(600);
  await page.getByTestId("detener").click();

  // Se puede escuchar cómo quedó y aceptarla (o regrabar).
  await expect(page.getByTestId("escuchar-captura")).toBeVisible();
  await page.getByTestId("escuchar-captura").click(); // reproduce la voz familiar (local)
  await page.getByTestId("aceptar").click();

  // Aceptar avanza el lote: el resultado observable (regla 8) es el progreso que sube.
  await expect(page.getByTestId("progreso-lote")).toContainText("2 de");

  // La ÚNICA salida del lote es "← Ajustes" (gate S4: sin "Terminar por ahora"). Al volver a
  // entrar al estudio, la gestión muestra lo grabado en "lo que ya grabaste" — el banco persistió.
  await page.getByTestId("volver-a-ajustes").click();
  await expect(page).toHaveURL(/\/ajustes/);
  await page.goto("/estudio");
  await expect(page.getByTestId("lista-grabados")).toContainText(textoGrabado);
});

// Sin permiso de micrófono, el estudio lo dice sin romperse (patrón mic-denegado). Forzamos la
// negación sobrescribiendo getUserMedia — con el mic falso de Chromium no hay diálogo real que
// rechazar, así que este es el único camino honesto a ese estado.
test("sin permiso de micrófono, el estudio lo explica y no se rompe", async ({
  page,
}) => {
  await page.addInitScript(() => {
    navigator.mediaDevices.getUserMedia = () =>
      Promise.reject(
        new DOMException("denegado por el test", "NotAllowedError"),
      );
  });

  await page.goto("/estudio");
  await page.getByTestId("ir-al-lote").click();
  await page.getByTestId("grabar").click();

  const aviso = page.getByTestId("aviso-estudio");
  await expect(aviso).toBeVisible();
  await expect(aviso).toContainText("No pude abrir el micrófono");
});
