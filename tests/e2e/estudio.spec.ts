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

  // Se puede escuchar cómo quedó y aceptarla (o regrabar). Al escuchar, la barrita de avance
  // aparece (gate S4, J3): la señal visible de que el clip SUENA.
  await expect(page.getByTestId("escuchar-captura")).toBeVisible();
  await page.getByTestId("escuchar-captura").click(); // reproduce la voz familiar (local)
  await expect(page.getByTestId("progreso-escucha")).toBeVisible();
  await page.getByTestId("aceptar").click();

  // Aceptar avanza el lote: el resultado observable (regla 8) es el progreso que sube.
  await expect(page.getByTestId("progreso-lote")).toContainText("2 de");

  // La salida del lote va ARRIBA y vuelve AL BANCO — la pantalla anterior, no Ajustes de un
  // salto (gate S4): la gestión muestra lo grabado en "lo que ya grabaste" de inmediato.
  await page.getByTestId("volver-al-banco").click();
  await expect(page.getByTestId("lista-grabados")).toContainText(textoGrabado);

  // Y desde el banco, la salida estándar sí vuelve a Ajustes. Al re-entrar al estudio, lo
  // grabado sigue ahí — el banco vive en IndexedDB y persiste entre visitas.
  await page.getByTestId("volver-a-ajustes").click();
  await expect(page).toHaveURL(/\/ajustes/);
  await page.goto("/estudio");
  const lista = page.getByTestId("lista-grabados");
  await expect(lista).toContainText(textoGrabado);

  // "Escuchar" desde la lista también muestra su barrita de avance, EN la fila que suena.
  await lista.getByRole("button", { name: "Escuchar" }).first().click();
  await expect(page.getByTestId("progreso-escucha")).toBeVisible();

  // Borrar pide un segundo toque (gate S4, J5): "¿Seguro?" primero; al confirmar, la fila se
  // despide, la lista queda vacía y la cobertura de palabras vuelve a cero.
  const borrar = lista.getByRole("button", { name: "Borrar" }).first();
  await borrar.click();
  await expect(lista.getByRole("button", { name: "¿Seguro?" })).toBeVisible();
  await lista.getByRole("button", { name: "¿Seguro?" }).click();
  await expect(page.getByTestId("lista-grabados")).toHaveCount(0);
  await expect(page.getByTestId("cobertura-palabra")).toHaveText(/^0\//);
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
