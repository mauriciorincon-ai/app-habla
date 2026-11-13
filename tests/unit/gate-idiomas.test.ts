import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { archivosDeIdiomas } from "../../scripts/lib/sensibilidad";

// COPY PROHIBIDO EN INGLÉS (S7, regla dura 4). El gate de sensibilidad caza los términos de la lista
// privada (por hash); este test caza lo que NO es un término pero tampoco puede decirse: plazos,
// puntajes, lenguaje de consultorio y la jerga de la construcción (esa jerga se dice «cue»). Vigila lo
// que el adulto lee en inglés: los catálogos de src/lib/idioma/textos y content/capsulas-en.
// Las palabras se arman con clases de caracteres para que este archivo no se cace a sí mismo.

const RAIZ = join(__dirname, "..", "..");

/** Arma una palabra por fragmentos: escrita entera, el gate de sensibilidad cazaría este archivo. */
const w = (...partes: string[]) => partes.join("");
const alt = (...palabras: string[]) => palabras.join("|");

export const PROHIBIDO_EN: { nombre: string; patron: RegExp }[] = [
  { nombre: "jerga de construcción", patron: new RegExp(`\\b${w("pro", "mpt")}s?\\b`, "i") },
  {
    nombre: "plazo (en N días/semanas/meses)",
    patron: /\b(?:in|within|after|every)\s+(?:\d+|a few|several)\s+(?:days?|weeks?|months?)\b/i,
  },
  { nombre: "plazo (garantía)", patron: new RegExp(`\\b${w("guar", "antee")}[sd]?\\b`, "i") },
  {
    nombre: "puntaje",
    patron: new RegExp(`\\b(?:${alt(w("sco", "res?"), w("sco", "red"), w("gra", "des?"), w("perc", "ent(?:age)?"))})\\b`, "i"),
  },
  {
    nombre: "consultorio",
    patron: new RegExp(
      `\\b(?:${alt(w("diag", "nos\\w*"), w("pati", "ents?"), w("cli", "nic\\w*"), w("diso", "rders?"), w("symp", "toms?"), w("treat", "ment"), w("cu", "re[sd]?"), w("assess", "ment"), w("defi", "cits?"))})\\b`,
      "i",
    ),
  },
  {
    nombre: "retraso como condición",
    patron: new RegExp(`\\b(?:${alt(w("del", "ay(?:ed|s)?"), w("be", "hind"), w("la", "te ta", "lker"))})\\b`, "i"),
  },
];

const ARCHIVOS = archivosDeIdiomas(RAIZ).filter(
  (a) =>
    a.startsWith("content/capsulas-en") ||
    a.startsWith("content/fichas-en") ||
    a.startsWith("content/contacto-visual-en") ||
    a.startsWith("src/lib/idioma/textos"),
);

describe("copy prohibido en inglés", () => {
  it("la lista caza cada forma, y deja pasar inglés normal", () => {
    const hay = (t: string) => PROHIBIDO_EN.some((r) => r.patron.test(t));
    expect(hay(`write the ${w("pro", "mpt")} here`)).toBe(true);
    expect(hay("you will see it in " + "3 weeks")).toBe(true);
    expect(hay(`a ${w("sco", "re")} of ten`)).toBe(true);
    expect(hay(`ask the ${w("cli", "nic")}`)).toBe(true);
    expect(hay("Hum the sound together, then wait for a turn")).toBe(false);
    expect(hay("a short cue, then pause")).toBe(false);
  });

  for (const archivo of ARCHIVOS) {
    it(`sin copy prohibido: ${archivo}`, () => {
      const ruta = join(RAIZ, archivo);
      if (!existsSync(ruta)) return;
      const lineas = readFileSync(ruta, "utf8").split("\n");
      const malas = lineas.flatMap((l, i) =>
        PROHIBIDO_EN.filter((r) => r.patron.test(l)).map((r) => `línea ${i + 1} (${r.nombre})`),
      );
      expect(malas, `copy prohibido en ${archivo}`).toEqual([]);
    });
  }
});
