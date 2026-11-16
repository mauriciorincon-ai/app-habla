import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "./base";

// LO QUE FALTABA (S15, ADR-027): lo que quedó a medias del H-2, por la UI y con el micrófono falso. Cubre, en
// español y en inglés: gemelas dentro del marco común (turno, calma, apuntador), la celebración «casi» con la
// voz de la familia, el pictograma sin grabar con la voz del aparato (solo si es local), «Sonidos de la app»,
// el tope en un cuento (el aviso espera al fin de la página), la sorpresa al tercer turno con la fecha fija y
// axe en claro, oscuro y «suave».

const WCAG = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

async function axeLimpio(page: Page, etiqueta: string) {
  for (const esquema of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme: esquema });
    const { violations } = await new AxeBuilder({ page })
      .withTags(WCAG)
      .analyze();
    expect(
      violations,
      `${etiqueta} (${esquema})\n${JSON.stringify(violations, null, 2)}`,
    ).toEqual([]);
  }
}

/**
 * Simula la voz del aparato REEMPLAZANDO el objeto entero (un objeto plano en `utterance.voice` lanza en el
 * Chrome real). Una voz local y una de red por idioma; lo dicho queda en `window.__dichas`.
 */
async function simularVoces(
  page: Page,
  voces: { name: string; lang: string; localService: boolean }[],
) {
  await page.addInitScript((lista) => {
    const w = window as unknown as {
      __dichas: { texto: string; voz: string | null; volumen: number }[];
    };
    w.__dichas = [];
    class Frase {
      voice: { name: string } | null = null;
      lang = "";
      volume = 1;
      rate = 1;
      constructor(public text: string) {}
      addEventListener() {}
    }
    const sintesis = {
      getVoices: () => lista,
      speak: (f: Frase) =>
        w.__dichas.push({
          texto: f.text,
          voz: f.voice?.name ?? null,
          volumen: f.volume,
        }),
      cancel: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    };
    Object.defineProperty(window, "speechSynthesis", {
      value: sintesis,
      configurable: true,
    });
    Object.defineProperty(window, "SpeechSynthesisUtterance", {
      value: Frase,
      configurable: true,
    });
  }, voces);
}

const dichas = (page: Page) =>
  page.evaluate(
    () =>
      (
        window as unknown as {
          __dichas: { texto: string; voz: string | null; volumen: number }[];
        }
      ).__dichas,
  );

/** Pasa la bienvenida de Hoy (sin cuentas): un nombre inventado y listo. */
async function conPerfil(page: Page) {
  await page.goto("/");
  await page.getByRole("textbox").first().fill("Peque");
  await page.getByTestId("terminar-onboarding").click();
  await expect(page.getByTestId("capsula")).toBeVisible();
}

const TEXTOS = {
  es: {
    gemelas: "Mira los dos dibujos. Di el que quieras.",
    fin: "Hoy solo",
    locale: "es-ES",
  },
  en: {
    gemelas: "Look at the two pictures. Say the one you like.",
    fin: "Today",
    locale: "en-US",
  },
} as const;

for (const idioma of ["es", "en"] as const) {
  test.describe(`idioma ${idioma}`, () => {
    test.use({ locale: TEXTOS[idioma].locale });

    test("gemelas corre dentro del marco común: turno, calma, apuntador y consigna", async ({
      page,
    }) => {
      await page.goto("/jugar/gemelas");
      await page.getByTestId("empezar-juego").click();
      await expect(page.getByTestId("gemelas-ronda")).toBeVisible();

      // La franja del apuntador con el botón de turno (el adulto decide; la app no adivina de quién es la voz).
      const franja = page.getByTestId("franja-apuntador");
      await expect(franja).toHaveAttribute("data-turno", "nino");
      await page.getByTestId("cambiar-turno").click();
      await expect(franja).toHaveAttribute("data-turno", "adulto");
      await page.getByTestId("cambiar-turno").click();
      await expect(franja).toHaveAttribute("data-turno", "nino");

      // La consigna sale del mismo catálogo que se graba.
      await expect(page.getByTestId("consigna-gemelas")).toContainText(
        TEXTOS[idioma].gemelas,
      );

      // Modo calma de un toque, dentro del marco, y queda en axe.
      const calma = page.getByTestId("modo-calma");
      await expect(calma).toHaveAttribute("aria-pressed", "false");
      await calma.click();
      await expect(calma).toHaveAttribute("aria-pressed", "true");
      await axeLimpio(page, "gemelas en calma");
      await calma.click();
      await expect(calma).toHaveAttribute("aria-pressed", "false");
      await axeLimpio(page, "gemelas en el marco");
    });

    test("la sorpresa llega al tercer turno de él, con la fecha fija, y no es un premio", async ({
      page,
    }) => {
      await page.clock.setFixedTime(new Date("2026-03-04T10:00:00"));
      await page.goto("/jugar/gemelas");
      await page.getByTestId("empezar-juego").click();
      await expect(page.getByTestId("gemelas-ronda")).toBeVisible();

      for (let turno = 1; turno <= 3; turno++) {
        // Antes del tercer turno no hay sorpresa: no se gana acertando.
        await expect(page.getByTestId("sorpresa")).toHaveCount(0);
        await page.getByTestId("marcar-a").click();
        await page.getByTestId("siguiente-pareja").click();
      }
      const sorpresa = page.getByTestId("sorpresa");
      await expect(sorpresa).toBeVisible();
      await expect(sorpresa).toHaveAttribute("role", "status");
      // S16: vive en su hueco reservado, dentro del flujo: no tapa la tarjeta ni ningún botón del juego.
      const caja = (await sorpresa.boundingBox())!;
      const hueco = (await page.getByTestId("hueco-sorpresa").boundingBox())!;
      expect(caja.y).toBeGreaterThanOrEqual(hueco.y - 1);
      expect(caja.y + caja.height).toBeLessThanOrEqual(hueco.y + hueco.height + 1);
      const tapa = (b: { x: number; y: number; width: number; height: number }) =>
        b.x < caja.x + caja.width && caja.x < b.x + b.width && b.y < caja.y + caja.height && caja.y < b.y + b.height;
      const otros = [page.getByTestId("gemelas-ronda"), ...(await page.getByTestId("juego").getByRole("button").all())];
      for (const o of otros) {
        const b = await o.boundingBox();
        if (b) expect(tapa(b), "la sorpresa tapa un control o la tarjeta").toBe(false);
      }
      const texto = (await sorpresa.innerText()).trim();
      expect(texto.length).toBeGreaterThan(8);
      // Ni «no» ni aplauso ni contador: solo una escena.
      expect(texto).not.toMatch(
        /\b(no|nope|wrong)\b|¡?muy bien|well done|good job|punt|coin|moneda|ficha/i,
      );
      await axeLimpio(page, "sorpresa congelada");

      // Misma fecha, misma sorpresa: la fecha es la perilla (regla 23).
      await page.reload();
      await page.getByTestId("empezar-juego").click();
      for (let turno = 1; turno <= 3; turno++) {
        await page.getByTestId("marcar-a").click();
        await page.getByTestId("siguiente-pareja").click();
      }
      await expect(page.getByTestId("sorpresa")).toHaveText(texto);
    });

    test("«Sonidos de la app»: con la voz del aparato suena en normal, a la mitad en suave y calla en apagado", async ({
      page,
    }) => {
      await simularVoces(page, [
        {
          name: "Voz de red",
          lang: idioma === "es" ? "es-US" : "en-GB",
          localService: false,
        },
        {
          name: "Voz local",
          lang: idioma === "es" ? "es-ES" : "en-US",
          localService: true,
        },
      ]);
      const abrir = async () => {
        await page.goto("/jugar/palabras");
        await page.getByTestId("empezar-juego").click();
        await expect(page.getByTestId("juego")).toHaveAttribute(
          "data-fase",
          "jugando",
          { timeout: 20_000 },
        );
        await expect(page.getByTestId("altavoz-palabra")).toHaveAttribute(
          "data-fuente-voz",
          "aparato",
        );
      };
      await abrir();
      // Sin grabación, el dibujo suena con la voz LOCAL del aparato, jamás con la de red.
      await expect
        .poll(async () => (await dichas(page)).length)
        .toBeGreaterThan(0);
      const normal = await dichas(page);
      expect(normal.every((d) => d.voz === "Voz local")).toBe(true);
      expect(normal[0].volumen).toBe(1);

      await page.goto("/ajustes");
      await page.getByTestId("sonidos-suave").click();
      await expect(page.getByTestId("sonidos-suave")).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      await abrir();
      await expect
        .poll(async () => (await dichas(page)).length)
        .toBeGreaterThan(0);
      expect((await dichas(page))[0].volumen).toBe(0.5);

      await page.goto("/ajustes");
      await page.getByTestId("sonidos-apagado").click();
      await expect(page.getByTestId("sonidos-apagado")).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      await page.goto("/jugar/palabras");
      await page.getByTestId("empezar-juego").click();
      await expect(page.getByTestId("juego")).toHaveAttribute(
        "data-fase",
        "jugando",
        { timeout: 20_000 },
      );
      await page.waitForTimeout(1500);
      expect(await dichas(page)).toEqual([]);
      await expect(page.getByTestId("altavoz-palabra")).toHaveCount(0);
    });

    test("solo voces de red: el pictograma queda mudo, sin intentar hablar", async ({
      page,
    }) => {
      await simularVoces(page, [
        {
          name: "Voz de red",
          lang: idioma === "es" ? "es-US" : "en-US",
          localService: false,
        },
      ]);
      await page.goto("/jugar/palabras");
      await page.getByTestId("empezar-juego").click();
      await expect(page.getByTestId("juego")).toHaveAttribute(
        "data-fase",
        "jugando",
        { timeout: 20_000 },
      );
      await page.waitForTimeout(1500);
      expect(await dichas(page)).toEqual([]);
      await expect(page.getByTestId("altavoz-palabra")).toHaveCount(0);
    });

    test("el tope cuenta el cuento y el aviso espera al fin de la página", async ({
      page,
    }) => {
      const hoy = (() => {
        const d = new Date();
        const p = (n: number) => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
      })();
      await page.addInitScript(
        ({ fecha, ms }) =>
          window.localStorage.setItem(
            "habla:v1:pantalla",
            JSON.stringify({ fecha, ms, avisado: false }),
          ),
        { fecha: hoy, ms: 10 * 60_000 - 2000 },
      );
      await page.goto("/cuentos");
      await page
        .locator('[data-testid="cuento-tarjeta"][data-cuento-id="el-paseo"]')
        .click();
      await expect(page.getByTestId("cuento-lector")).toBeVisible();
      // El tope llega mientras mira la página: no se corta ni se avisa a media página.
      await page.waitForTimeout(4000);
      await expect(page.getByTestId("cuento-lector")).toBeVisible();
      await expect(page.getByTestId("aviso-tope")).toHaveCount(0);
      // Al pasar la página, el cuento se cierra con calma, como «Salir».
      await page.getByTestId("cuento-siguiente").click();
      await expect(page.getByTestId("cuento-lector")).toHaveCount(0);
      // UN aviso al adulto, en estado de lectura.
      const aviso = page.getByTestId("aviso-tope");
      await expect(aviso).toBeVisible();
      await expect(aviso).toHaveAttribute("role", "status");
      await expect(aviso).not.toContainText(
        /se acab|over|prohibid|bloquead|castig|punish/i,
      );
      await axeLimpio(page, "aviso de tope en cuentos");
    });

    test("el tope pendiente no se pierde si sale del cuento con «volver»", async ({
      page,
    }) => {
      const d = new Date();
      const p = (n: number) => String(n).padStart(2, "0");
      const hoy = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
      await page.addInitScript(
        ({ fecha, ms }) =>
          window.localStorage.setItem(
            "habla:v1:pantalla",
            JSON.stringify({ fecha, ms, avisado: false }),
          ),
        { fecha: hoy, ms: 10 * 60_000 - 2000 },
      );
      await page.goto("/cuentos");
      await page
        .locator('[data-testid="cuento-tarjeta"][data-cuento-id="el-paseo"]')
        .click();
      await page.waitForTimeout(4000);
      await expect(page.getByTestId("aviso-tope")).toHaveCount(0);
      await page.getByRole("button", { name: /los cuentos|the stories/i }).first().click();
      await expect(page.getByTestId("cuento-lector")).toHaveCount(0);
      await expect(page.getByTestId("aviso-tope")).toBeVisible();
    });
  });
}

test("«Intensidad de colores» en suave: se aplica y pasa axe en claro y oscuro (Hoy, Ajustes, juego)", async ({
  page,
}) => {
  await page.goto("/ajustes");
  await page.getByTestId("intensidad-suave").click();
  await expect(page.getByTestId("intensidad-suave")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.locator("html")).toHaveAttribute(
    "data-intensidad",
    "suave",
  );
  await axeLimpio(page, "ajustes en suave");

  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute(
    "data-intensidad",
    "suave",
  );
  await axeLimpio(page, "hoy en suave");

  await page.goto("/jugar/gemelas");
  await page.getByTestId("empezar-juego").click();
  await expect(page.getByTestId("gemelas-ronda")).toBeVisible();
  await axeLimpio(page, "gemelas en suave");

  await page.goto("/jugar/globo");
  await page.getByTestId("empezar-juego").click();
  await expect(page.getByTestId("juego")).toHaveAttribute(
    "data-fase",
    "jugando",
    { timeout: 20_000 },
  );
  await axeLimpio(page, "globo en suave");
});

test("el modo calma de un toque también vive en Hoy y se guarda", async ({
  page,
}) => {
  await conPerfil(page);
  const calma = page.getByTestId("modo-calma-hoy");
  await expect(calma).toBeVisible();
  await expect(calma).toHaveAttribute("aria-pressed", "false");
  await calma.click();
  await expect(calma).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await expect(page.getByTestId("modo-calma-hoy")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await axeLimpio(page, "hoy en calma");
});
