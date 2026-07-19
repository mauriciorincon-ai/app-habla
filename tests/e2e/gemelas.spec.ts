import { expect, test } from "@playwright/test";

// PALABRAS GEMELAS (Outcome 3) — el juego SIN micrófono (co-uso puro, ADR-009). El niño dice una
// palabra del par y el PADRE marca cuál oyó. La app NO oye ni graba nada: solo cuenta participación.
//
// Lo que este spec blinda: la ronda se completa, el padre marca, la celebración es HONESTA (cuenta
// rondas y lo que ÉL marcó, jamás "acertó"), el registro local persiste (insumo del progreso del
// S4) y — la promesa dura 2 — el juego JAMÁS abre el micrófono.

test("una partida de gemelas: el padre marca, la celebración es honesta y el registro persiste", async ({
  page,
}) => {
  // Sonda: contamos cuántas veces se pidió el micrófono. En gemelas debe ser CERO.
  await page.addInitScript(() => {
    (window as unknown as { __gum: number }).__gum = 0;
    const md = navigator.mediaDevices;
    if (md?.getUserMedia) {
      const orig = md.getUserMedia.bind(md);
      md.getUserMedia = (...args: Parameters<typeof orig>) => {
        (window as unknown as { __gum: number }).__gum++;
        return orig(...args);
      };
    }
  });

  await page.goto("/jugar/gemelas");

  // Guion del padre primero (co-uso): él pide la palabra, la app no la dice por él.
  await page.getByTestId("empezar-juego").click();
  await expect(page.getByTestId("gemelas-ronda")).toBeVisible();
  await expect(page.getByTestId("progreso-rondas")).toContainText("de 6");

  // Jugamos las 6 rondas: el padre marca lo que oyó (aquí siempre el de la izquierda).
  for (let ronda = 1; ronda <= 6; ronda++) {
    await expect(page.getByTestId("progreso-rondas")).toContainText(
      `Ronda ${ronda}`,
    );
    await page.getByTestId("marcar-a").click();
  }

  // Celebración honesta: cuenta las RONDAS jugadas, nunca "acertó".
  await expect(page.getByTestId("celebracion")).toBeVisible();
  await expect(page.getByTestId("metrica-real")).toContainText("6 rondas");

  // El registro local guardó los 6 juicios del padre (insumo del progreso honesto del S4).
  const juicios = await page.evaluate(() => {
    const crudo = localStorage.getItem("habla:v1:gemelas");
    return crudo ? JSON.parse(crudo).juicios.length : 0;
  });
  expect(juicios).toBe(6);

  // La promesa dura 2: gemelas jamás abrió el micrófono.
  const vecesMic = await page.evaluate(
    () => (window as unknown as { __gum: number }).__gum,
  );
  expect(vecesMic).toBe(0);
});

test("el padre puede saltar una ronda sin castigo (COGA: estar juntos ya cuenta)", async ({
  page,
}) => {
  await page.goto("/jugar/gemelas");
  await page.getByTestId("empezar-juego").click();
  await expect(page.getByTestId("gemelas-ronda")).toBeVisible();

  // Saltar las 6 rondas: el niño solo miró. La celebración lo dice sin culpa.
  for (let ronda = 1; ronda <= 6; ronda++) {
    await page.getByTestId("saltar-ronda").click();
  }

  await expect(page.getByTestId("celebracion")).toBeVisible();
  await expect(
    page.getByText("Estar juntos frente al juego ya cuenta."),
  ).toBeVisible();
});
