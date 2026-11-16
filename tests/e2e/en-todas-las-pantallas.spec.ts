import { AxeBuilder } from "@axe-core/playwright";
import { PALABRAS_EN } from "../../src/lib/objetivo/palabras-en";
import { PALABRAS_ES } from "../../src/lib/objetivo/palabras-es";
import { expect, test } from "./base";

// EVERY SCREEN IN ENGLISH (S16, rule 20: «bilingual in everything»). The 17 own routes plus the two
// documents (`/conoce`, `/mirada`), with the device in English and a made-up profile. Two guards per screen:
//   1. No Spanish word leaks. A token of 4+ letters fails if it is in the Spanish dictionary and NOT in
//      the English one (words both languages share, like «animal» or «color», never fail), minus a short
//      allowlist of proper names. This is stronger than a hand-made word list: it uses the app's own two
//      dictionaries (`src/lib/objetivo/palabras-{es,en}.ts`).
//   2. axe finds nothing serious or critical (axe is never switched off).
// Red demo (rule 15, a gate is shown failing): `ROJO_ES=1 pnpm test:e2e en-todas-las-pantallas` injects a
// Spanish sentence into each screen and the spec must go red naming the route and the words.

const PERFIL = { apodo: "Luna", temas: ["animales"] };

const PANTALLAS: { ruta: string; documento?: true }[] = [
  { ruta: "/" },
  { ruta: "/jugar" },
  { ruta: "/jugar/globo" },
  { ruta: "/jugar/soplar" },
  { ruta: "/jugar/fuerte-suave" },
  { ruta: "/jugar/cohete" },
  { ruta: "/jugar/palabras" },
  { ruta: "/jugar/gemelas" },
  { ruta: "/jugar/vocales" },
  { ruta: "/estudio" },
  { ruta: "/estudio/videos" },
  { ruta: "/estudio/cuentos" },
  { ruta: "/estudio/imprimibles" },
  { ruta: "/cuentos" },
  { ruta: "/rumbo" },
  { ruta: "/objetivo" },
  { ruta: "/ajustes" },
  { ruta: "/conoce", documento: true },
  { ruta: "/mirada", documento: true },
];

// Proper names and acronyms that are the same in both languages and may be absent from the English list.
const NOMBRES_PROPIOS = new Set([
  // Brands and acronyms.
  "hablemos",
  "arasaac",
  "vosk",
  "lichess",
  "sentry",
  "lighthouse",
  "chromium",
  "android",
  "chrome",
  // The language switch names each language in its own language («Español»); «internet» is a loanword
  // missing from the 16 000-word English list; «Luna» is the made-up profile of this spec; «Halle» is a
  // cited author; privado/bandeja/lote are real folder and file names the adult types (`privado/bandeja/`,
  // `lote-….json`), not interface words.
  "internet",
  "español",
  "luna",
  "halle",
  "privado",
  "bandeja",
  "lote",
]);

const ES = new Set(PALABRAS_ES);
const EN = new Set(PALABRAS_EN);

/** Spanish-only tokens (4+ letters) in a text: in the Spanish dictionary, not in the English one. */
function palabrasEnEspanol(texto: string): string[] {
  const tokens = texto.toLowerCase().match(/\p{L}{4,}/gu) ?? [];
  const salida = new Set<string>();
  for (const t of tokens) {
    if (NOMBRES_PROPIOS.has(t)) continue;
    if (ES.has(t) && !EN.has(t)) salida.add(t);
  }
  return [...salida];
}

test("el detector distingue una frase en español de una en inglés", () => {
  expect(
    palabrasEnEspanol("Aprendemos juntos mañana con tranquilidad"),
  ).not.toEqual([]);
  expect(
    palabrasEnEspanol("We learn together tomorrow, calm and slow"),
  ).toEqual([]);
});

test("las 17 pantallas y los dos documentos, en inglés: sin una palabra en español y sin axe grave", async ({
  browser,
}) => {
  const ctx = await browser.newContext({
    locale: "en-US",
    serviceWorkers: "block",
    // The new context does not inherit the project's fake microphone permission by itself.
    permissions: ["microphone"],
  });
  await ctx.addInitScript((perfil) => {
    if (!localStorage.getItem("habla:v1:perfil"))
      localStorage.setItem("habla:v1:perfil", JSON.stringify(perfil));
  }, PERFIL);
  const page = await ctx.newPage();
  // One pass over every screen, ONE verdict at the end: a leak on /estudio must not hide another on /ajustes.
  const fugasPorRuta: string[] = [];
  const axePorRuta: string[] = [];

  for (const { ruta, documento } of PANTALLAS) {
    await page.goto(ruta);
    const raiz = page.locator(documento ? "body" : "main");
    await expect(raiz.first(), ruta).toBeVisible();
    await expect(page.locator("html"), ruta).toHaveAttribute("lang", /^en/);

    // Red demo: a Spanish sentence in the page must turn the guard red.
    if (process.env.ROJO_ES === "1") {
      await page.evaluate(() => {
        const p = document.createElement("p");
        p.textContent = "Aprendemos juntos mañana con tranquilidad";
        (document.querySelector("main") ?? document.body).appendChild(p);
      });
    }

    const texto = await raiz.first().innerText();
    const fugas = palabrasEnEspanol(texto);
    if (fugas.length) fugasPorRuta.push(`${ruta}: ${fugas.join(", ")}`);

    const r = await new AxeBuilder({ page }).analyze();
    for (const v of r.violations)
      if (v.impact === "serious" || v.impact === "critical")
        axePorRuta.push(`${ruta}: ${v.id}`);
  }
  expect(fugasPorRuta, "Spanish words on an English screen").toEqual([]);
  expect(axePorRuta, "axe: serious or critical").toEqual([]);
  await ctx.close();
});

// The day's surprise (S15, in its reserved slot since S16) in English: it appears at the third turn of the
// child, reads in English and sits clear of the card. The screenshot goes to test-results/en-todas/ (never
// committed) and the builder READS it as an image.
for (const tema of ["claro", "oscuro"] as const) {
  test(`la sorpresa del día, en inglés · tema ${tema}`, async ({ browser }) => {
    const ctx = await browser.newContext({
      locale: "en-US",
      colorScheme: tema === "claro" ? "light" : "dark",
      serviceWorkers: "block",
      permissions: ["microphone"],
    });
    await ctx.addInitScript((perfil) => {
      if (!localStorage.getItem("habla:v1:perfil"))
        localStorage.setItem("habla:v1:perfil", JSON.stringify(perfil));
    }, PERFIL);
    const page = await ctx.newPage();
    await page.clock.setFixedTime(new Date("2026-03-04T10:00:00"));
    await page.goto("/jugar/gemelas");
    await page.getByTestId("empezar-juego").click();
    await expect(page.getByTestId("gemelas-ronda")).toBeVisible();
    for (let turno = 1; turno <= 3; turno++) {
      await page.getByTestId("marcar-a").click();
      await page.getByTestId("siguiente-pareja").click();
    }
    const sorpresa = page.getByTestId("sorpresa");
    await expect(sorpresa).toBeVisible();
    expect(palabrasEnEspanol(await sorpresa.innerText())).toEqual([]);
    const r = await new AxeBuilder({ page }).analyze();
    expect(
      r.violations
        .filter((v) => v.impact === "serious" || v.impact === "critical")
        .map((v) => v.id),
    ).toEqual([]);
    await page.screenshot({
      path: `test-results/en-todas/sorpresa-${tema}-${test.info().project.name}.png`,
      fullPage: true,
    });
    await ctx.close();
  });
}
