import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

// The ADR-023 measurement (S11): the real recognizer over the Lingua Libre recordings, per language.
// It prints the table and writes it to tests/e2e/fixtures/palabras/medida-<language>.json; it does NOT pass or fail on accuracy — the owner
// decides what the result means in the rehearsal (default v of the sprint order).

const FIXTURES = path.resolve(__dirname, "fixtures/palabras");
// Wordless controls: the synthetic sounds the other e2e use (scripts/gen-voz-sintetica.mjs and friends).
const CONTROLES = ["voz-sintetica.wav", "barrido-tono.wav", "vocales-nino.wav"];

for (const idioma of ["es", "en"] as const) {
  test(`medida del reconocedor · ${idioma}`, async ({ page }) => {
    await page.route("**/__medida/**", (route) => {
      const relativa = new URL(route.request().url()).pathname.replace(
        "/__medida/",
        "",
      );
      if (relativa === "controles.json") return route.fulfill({ json: CONTROLES });
      const ruta = relativa.startsWith("control/")
        ? path.join(FIXTURES, "..", relativa.replace("control/", ""))
        : path.join(FIXTURES, relativa);
      return route.fulfill({
        body: readFileSync(ruta),
        contentType: ruta.endsWith(".json") ? "application/json" : "audio/wav",
      });
    });
    await page.goto("/spike/reconocer");
    await page
      .getByRole("button", {
        name: idioma === "es" ? "Medir en español" : "Measure in English",
      })
      .click();
    await expect(page.getByTestId("estado-medida")).toHaveText("listo", {
      timeout: 170_000,
    });
    const medida = JSON.parse(
      (await page.getByTestId("medida").textContent()) ?? "{}",
    );
    expect(medida.n).toBeGreaterThan(0);
    // Versioned next to the recordings (not in test-results/, which is wiped on every run): the ADR-023
    // table can be checked against this file. Running the spec again rewrites it.
    const fuera = path.join(FIXTURES);
    mkdirSync(fuera, { recursive: true });
    writeFileSync(
      path.join(fuera, `medida-${idioma}.json`),
      JSON.stringify(medida, null, 1),
    );
    console.log(
      `medida ${idioma}: ${medida.aciertos}/${medida.n} right word · ${medida.quizas}/${medida.n} «maybe» shown · ${medida.controlesConPalabra}/${medida.controles.length} wordless controls answered with a word`,
    );
  });
}
