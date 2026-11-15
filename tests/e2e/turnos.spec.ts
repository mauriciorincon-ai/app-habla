import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "./base";

// TURNOS Y APUNTADOR (S13, ADR-025). Corre con el micrófono falso del globo (silencio y luego voz, en
// móvil y escritorio). Lo que garantiza, POR LA UI: el adulto marca el turno con un toque en su franja;
// en «tu turno» el dibujo se mueve pero NADA se le cuenta al niño (la fase no avanza con la voz del
// adulto); en «su turno» lo que su voz hace cuenta y la celebración dice «N turnos de él»; la franja
// y el indicador, congelados, pasan axe en claro y oscuro; el modo calma y el ajuste apagan la línea.

const CAPTURAS = "test-results/capturas-s13";
const LINEAS_TURNO_ADULTO =
  /modelaDespacio|sonidoClaro|loQueMira|muestraSinPedir/;
const LINEAS_CIERRE = /nombraJuntos|cuentaLaHistoria/;

async function axeEnAmbos(page: Page) {
  for (const esquema of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme: esquema });
    const { violations } = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
  }
}

async function capturar(
  page: Page,
  nombre: string,
  testInfo: { project: { name: string } },
) {
  for (const esquema of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme: esquema });
    await page.screenshot({
      path: `${CAPTURAS}/${nombre}-${testInfo.project.name}-${esquema}.png`,
      fullPage: true,
    });
  }
}

async function hastaLaFranja(page: Page) {
  await page.goto("/jugar/globo");
  await page.getByTestId("empezar-juego").click();
  await expect(page.getByTestId("franja-apuntador")).toBeVisible({
    timeout: 20_000,
  });
}

test("el turno lo marca el adulto: en «tu turno» nada se cuenta; en «su turno» sí, y se celebra", async ({
  page,
}, testInfo) => {
  await hastaLaFranja(page);
  const juego = page.getByTestId("juego");
  const franja = page.getByTestId("franja-apuntador");

  // Arranca en su turno (sin tocar la franja, el juego cuenta como siempre).
  await expect(franja).toHaveAttribute("data-turno", "nino");
  await expect(page.getByTestId("indicador-turno")).toHaveAttribute(
    "data-turno",
    "nino",
  );
  // El botón de turno es del adulto: ≥ 44 px.
  const caja = await page.getByTestId("cambiar-turno").boundingBox();
  expect(caja!.height).toBeGreaterThanOrEqual(44);

  // Tu turno: un toque en la franja, y la línea de modelar aparece (con texto).
  await page.getByTestId("cambiar-turno").click();
  await expect(franja).toHaveAttribute("data-turno", "adulto");
  await expect(page.getByTestId("indicador-turno")).toHaveAttribute(
    "data-turno",
    "adulto",
  );
  const linea = page.getByTestId("linea-apuntador");
  await expect(linea).toHaveAttribute("data-linea", LINEAS_TURNO_ADULTO);
  await expect(linea).not.toBeEmpty();

  // Mientras es tu turno, la voz del micrófono NO lo cuenta: la fase no sale de «esperando voz»
  // aunque el WAV entre en su ventana de voz.
  await page.waitForTimeout(6_000);
  await expect(juego).toHaveAttribute("data-fase", "esperando-voz");

  // La franja y el indicador, congelados, pasan axe; y se leen como imagen (claro y oscuro).
  await axeEnAmbos(page);
  await capturar(page, "turno-adulto", testInfo);

  // Su turno: lo que su voz hace cuenta.
  await page.getByTestId("cambiar-turno").click();
  await expect(franja).toHaveAttribute("data-turno", "nino");
  await expect(juego).toHaveAttribute("data-fase", "jugando", {
    timeout: 20_000,
  });
  await axeEnAmbos(page);
  await capturar(page, "turno-nino", testInfo);

  // Jamás un «no» ni un game-over a la vista.
  await expect(juego).not.toContainText(
    /incorrecto|equivocad|perdiste|se acab/i,
  );

  await page.getByTestId("terminar").click();
  await expect(page.getByTestId("celebracion")).toBeVisible();
  // La celebración dice «N turnos de él» (aquí, uno: solo el suyo, no el tuyo).
  await expect(page.getByTestId("celebracion-turnos")).toHaveText(
    "1 turno de él",
  );
  // El cierre: «nombra lo que hicieron juntos».
  await expect(page.getByTestId("linea-apuntador")).toHaveAttribute(
    "data-linea",
    LINEAS_CIERRE,
  );
  await axeEnAmbos(page);
  await capturar(page, "cierre", testInfo);

  // Lo guardado son contadores: los turnos de él, nada de quién habló.
  await expect
    .poll(() =>
      page.evaluate(() => window.localStorage.getItem("habla:v1:sesiones")),
    )
    .not.toBeNull();
  const guardado = await page.evaluate(() =>
    window.localStorage.getItem("habla:v1:sesiones"),
  );
  const ultima = (
    JSON.parse(guardado!).sesiones as Array<Record<string, unknown>>
  ).at(-1)!;
  expect(ultima.turnosNino).toBe(1);
  expect(Object.keys(ultima).sort()).toEqual([
    "fecha",
    "juego",
    "rachaMs",
    "turnosNino",
    "vozMs",
  ]);
});

test("el modo calma apaga la línea del apuntador, y la franja deja el botón de turno", async ({
  page,
}) => {
  await hastaLaFranja(page);
  await page.getByTestId("modo-calma").click();
  await page.getByTestId("cambiar-turno").click();
  await expect(page.getByTestId("franja-apuntador")).toHaveAttribute(
    "data-turno",
    "adulto",
  );
  await page.waitForTimeout(1_000);
  await expect(page.getByTestId("linea-apuntador")).toHaveAttribute(
    "data-linea",
    "",
  );
  await expect(page.getByTestId("linea-apuntador")).toBeEmpty();
});

test("«Tu apuntador» se apaga en Ajustes: sin línea, y el juego sigue", async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "habla:v1:ajustes",
      JSON.stringify({ apuntador: false }),
    );
  });
  await hastaLaFranja(page);
  await page.getByTestId("cambiar-turno").click();
  await page.waitForTimeout(1_000);
  await expect(page.getByTestId("linea-apuntador")).toHaveAttribute(
    "data-linea",
    "",
  );
  // El interruptor existe en Ajustes y refleja lo guardado.
  await page.goto("/ajustes");
  await expect(page.getByTestId("apuntador")).toHaveAttribute(
    "aria-checked",
    "false",
  );
});

test("la línea aparece unos segundos y se va sola, y no se repite en la sesión", async ({
  page,
}) => {
  await hastaLaFranja(page);
  const linea = page.getByTestId("linea-apuntador");
  await page.getByTestId("cambiar-turno").click();
  await expect(linea).not.toHaveAttribute("data-linea", "");
  const primera = await linea.getAttribute("data-linea");
  // Se va sola (≈ 7 s).
  await expect(linea).toHaveAttribute("data-linea", "", { timeout: 12_000 });
  // Otro turno tuyo, pasado el respiro: si hay línea, es otra.
  await page.getByTestId("cambiar-turno").click();
  await page.waitForTimeout(12_500);
  await page.getByTestId("cambiar-turno").click();
  const segunda = await linea.getAttribute("data-linea");
  if (segunda) expect(segunda).not.toBe(primera);
});

test("in English: the strip, the indicator and “N turns of theirs” are written for English, and pass axe", async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "habla:v1:ajustes",
      JSON.stringify({ idioma: "en" }),
    );
  });
  await hastaLaFranja(page);
  await expect(page.getByTestId("turno-actual")).toHaveText("It's their turn");
  await page.getByTestId("cambiar-turno").click();
  await expect(page.getByTestId("cambiar-turno")).toHaveText(
    "Hand the turn over",
  );
  await expect(page.getByTestId("indicador-turno")).toHaveAttribute(
    "aria-label",
    "Now it is time to watch and listen",
  );
  await expect(page.getByTestId("linea-apuntador")).not.toBeEmpty();
  await axeEnAmbos(page);
  await page.getByTestId("cambiar-turno").click();
  await expect(page.getByTestId("juego")).toHaveAttribute(
    "data-fase",
    "jugando",
    { timeout: 20_000 },
  );
  await page.getByTestId("terminar").click();
  await expect(page.getByTestId("celebracion-turnos")).toHaveText(
    "1 turn of theirs",
  );
  await axeEnAmbos(page);
});
