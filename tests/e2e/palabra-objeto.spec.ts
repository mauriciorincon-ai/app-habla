import { expect, test } from "@playwright/test";

// PALABRA↔OBJETO (Outcome 3). Usa el micrófono falso COMPARTIDO: una voz sostenida genérica
// (un tono, ninguna palabra).
//
// LA GARANTÍA QUE ESTE TEST BLINDA (ADR 005): el dibujo se enciende con esa voz genérica —
// **el juego JAMÁS exige que el niño diga la palabra**. Si algún día alguien metiera un
// reconocimiento de palabras como condición para avanzar, este test se cae.

test("cualquier vocalización enciende el dibujo — la palabra NO se exige (ADR 005)", async ({
  page,
}) => {
  await page.goto("/jugar/palabras");

  // Guion del padre primero (co-uso): él nombra el dibujo, la app no lo dice por él.
  await expect(page.getByTestId("empezar-juego")).toBeEnabled();
  await page.getByTestId("empezar-juego").click();

  await expect(page.getByTestId("calibrando")).toBeVisible();

  const juego = page.getByTestId("juego");
  await expect(juego).toHaveAttribute("data-fase", "jugando", {
    timeout: 20_000,
  });

  // Hay un dibujo con su palabra escrita (la asociación palabra↔objeto).
  await expect(page.getByTestId("picto")).toBeVisible();
  const palabra = await page.getByTestId("palabra-del-picto").innerText();
  expect(palabra.trim().length).toBeGreaterThan(0);

  // El WAV NO dice ninguna palabra: es un tono sostenido. Y aun así, el dibujo se enciende.
  await expect(page.getByTestId("escenario")).toHaveAttribute(
    "data-encendido",
    "true",
    { timeout: 20_000 },
  );
  await expect(page.getByTestId("contador-activaciones")).toContainText("1");

  // Celebración honesta: cuenta los dibujos que su VOZ encendió. Nunca afirma qué dijo.
  await page.getByTestId("terminar").click();
  await expect(page.getByTestId("celebracion")).toBeVisible();
  await expect(page.getByTestId("metrica-real")).toContainText("1 dibujo");
});

test("el guion del padre no se filtra a la vista del niño (la vista del niño es soberana)", async ({
  page,
}) => {
  await page.goto("/jugar/palabras");

  // Antes de empezar, la intro del padre está visible (es el LCP de la página).
  const intro = page.locator("[data-intro-padre]");
  await expect(intro).toBeVisible();

  await page.getByTestId("empezar-juego").click();
  await expect(page.getByTestId("juego")).toHaveAttribute(
    "data-fase",
    "jugando",
    { timeout: 20_000 },
  );

  // En cuanto el juego arranca, el texto dirigido al padre desaparece de la pantalla.
  await expect(intro).toBeHidden();
});

test("el padre puede pasar al siguiente dibujo cuando quiera (sin meta, sin carrera)", async ({
  page,
}) => {
  await page.goto("/jugar/palabras");
  await page.getByTestId("empezar-juego").click();
  await expect(page.getByTestId("juego")).toHaveAttribute(
    "data-fase",
    "jugando",
    { timeout: 20_000 },
  );

  const primera = await page.getByTestId("palabra-del-picto").innerText();
  await page.getByTestId("siguiente-picto").click();
  await expect(page.getByTestId("palabra-del-picto")).not.toHaveText(primera);

  // El toque del niño es grande (≥64 px): COGA.
  const caja = await page.getByTestId("siguiente-picto").boundingBox();
  expect(caja?.height ?? 0).toBeGreaterThanOrEqual(64);
});

// EL JUEZ ES EL PADRE (petición del usuario en el gate, 2026-07-12; regla dura 3).
// La app NO reconoce palabras y no va a fingir que sí: "dijo la palabra" solo puede encenderlo un
// toque del padre. Este test se cae si alguien mete un reconocedor automático — que además sacaría
// el audio del dispositivo (regla dura 2) o castigaría al niño con un falso "no".
test("“dijo la palabra” lo decide el PADRE: la app jamás lo enciende sola", async ({
  page,
}) => {
  await page.goto("/jugar/palabras");
  await page.getByTestId("empezar-juego").click();

  const juego = page.getByTestId("juego");
  await expect(juego).toHaveAttribute("data-fase", "jugando", {
    timeout: 20_000,
  });

  // El micrófono falso lleva rato "hablando" (voz genérica, ninguna palabra) y el dibujo YA se
  // encendió por su voz. Aun así, la app NO se atreve a decir que dijo la palabra.
  await expect(page.getByTestId("escenario")).toHaveAttribute(
    "data-encendido",
    "true",
  );
  await expect(page.getByTestId("picto")).toHaveAttribute(
    "data-reconocida",
    "false",
  );

  // Solo el toque del padre lo enciende — y es un control de adulto (≥44 px), no del niño.
  const boton = page.getByTestId("dijo-la-palabra");
  const caja = await boton.boundingBox();
  expect(caja?.height ?? 0).toBeGreaterThanOrEqual(44);
  await boton.click();
  await expect(page.getByTestId("picto")).toHaveAttribute(
    "data-reconocida",
    "true",
  );

  // Y la celebración se lo atribuye a ÉL, no a la app.
  await page.getByTestId("terminar").click();
  await expect(page.getByTestId("reconocidas")).toContainText("tú oíste");
});
