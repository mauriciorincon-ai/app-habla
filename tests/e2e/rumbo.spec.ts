import { expect, test, type Page } from "@playwright/test";

// EL RUMBO (Outcome 1) — progreso HONESTO. El patrón anti-"comportamiento sin experiencia"
// (frase-vs-métrica) aplica DIRECTO aquí: la pantalla no puede mostrar una frase bonita fija —
// tiene que reflejar el NÚMERO que de verdad se registró. Se prueba inyectando sesiones con
// números distintivos y verificando que aparecen; y jugando POR LA UI para probar que el intento
// queda registrado de punta a punta.

/** La fecha local de HOY, como la calcula la app (para que caiga en "Esta semana"). */
async function hoy(page: Page): Promise<string> {
  return page.evaluate(() => {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${m}-${dd}`;
  });
}

/** Inyecta un registro de sesiones en localStorage, como si ya hubieran jugado. */
async function inyectarSesiones(
  page: Page,
  sesiones: unknown[],
): Promise<void> {
  await page.evaluate((ss) => {
    localStorage.setItem("habla:v1:sesiones", JSON.stringify({ sesiones: ss }));
  }, sesiones);
}

test("sin datos, el Rumbo muestra su vacío honesto (sin puntajes ni notas)", async ({
  page,
}) => {
  await page.goto("/rumbo");
  await expect(page.getByTestId("rumbo-vacio")).toBeVisible();
  await expect(page.getByTestId("rumbo-contenido")).toHaveCount(0);
});

test("el Rumbo refleja el NÚMERO que de verdad se registró (frase-vs-métrica)", async ({
  page,
}) => {
  await page.goto("/");
  const fecha = await hoy(page);
  await inyectarSesiones(page, [
    {
      juego: "palabras",
      fecha,
      encendidos: 7,
      reconocidas: 1,
      palabras: ["perro", "gato", "sol"],
    },
    { juego: "globo", fecha, vozMs: 8000, rachaMs: 5200 },
  ]);

  await page.goto("/rumbo");
  await expect(page.getByTestId("rumbo-contenido")).toBeVisible();

  const contenido = page.getByTestId("rumbo-contenido");
  // El número viene del DATO, no de una frase fija: 7 dibujos, 3 palabras distintas.
  await expect(contenido).toContainText("7");
  await expect(contenido).toContainText("dibujos que encendió con su voz");
  await expect(contenido).toContainText("3");
  await expect(contenido).toContainText("palabras distintas");

  // Hitos derivados de lo medido/marcado.
  const hitos = page.getByTestId("rumbo-hitos");
  await expect(hitos).toContainText("La primera palabra que TÚ le oíste");
  await expect(hitos).toContainText("Su voz sonó más de 5 segundos seguidos");

  // Y JAMÁS lenguaje clínico (anti-claims §D).
  const texto = await page.locator("main").innerText();
  expect(texto).not.toMatch(/puntaje|diagnóstic|retraso|percentil|%/i);
});

test("jugar por la UI queda registrado y el Rumbo lo muestra (write-path de punta a punta)", async ({
  page,
}) => {
  // Antes de jugar, el Rumbo está vacío.
  await page.goto("/rumbo");
  await expect(page.getByTestId("rumbo-vacio")).toBeVisible();

  // Juega palabra↔objeto y llega a la celebración (ahí se registra la sesión).
  await page.goto("/jugar/palabras");
  await page.getByTestId("empezar-juego").click();
  await expect(page.getByTestId("juego")).toHaveAttribute(
    "data-fase",
    "jugando",
    {
      timeout: 20_000,
    },
  );
  await page.getByTestId("terminar").click();
  await expect(page.getByTestId("celebracion")).toBeVisible();

  // Ahora el Rumbo YA tiene contenido: el intento quedó registrado (aunque no hubiera voz).
  await page.goto("/rumbo");
  await expect(page.getByTestId("rumbo-contenido")).toBeVisible();
  await expect(page.getByTestId("rumbo-semana")).toContainText(
    "practicaron juntos",
  );
});
