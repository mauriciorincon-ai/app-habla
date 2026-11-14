import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { AJUSTES_DEFECTO } from "@/lib/storage/schemas";
import { imprimibles } from "@/lib/idioma/textos/imprimibles";

// CONVENCIONES DE LA FAMILIA (S10, ADR-022). Comprueba lo verificable: versión, las dos lenguas por
// regla, que cada `ruta:línea` señale algo que existe, el modo calma (apagado de fábrica) y el crédito
// de ARASAAC en las hojas. No toca Nutri-Kids.

const RAIZ = join(__dirname, "..", "..");
const DOC = readFileSync(join(RAIZ, "docs/convenciones-familia/README.md"), "utf8");
const REGLAS = ["C1", "C2", "C3", "C4", "C5", "C6"];

/** Lo que cada `ruta:línea` del documento debe seguir diciendo en esa línea. */
const ANCLAS: Record<string, string> = {
  "src/components/juego/forma-vocal.tsx:30": "export function FormaVocal",
  "src/app/globals.css:112": "--exito",
  "src/lib/storage/schemas.ts:20": "modoCalma",
  "src/components/juego/marco-juego.tsx:96": "modo-calma",
  "src/components/juego/mapa-vocales.tsx:172": "min-h-16",
  "src/app/ajustes/page.tsx:104": "ARASAAC",
  "src/components/imprimibles/imprimibles-cliente.tsx:22": "function Pie",
  "tests/unit/gate-idiomas.test.ts:18": "PROHIBIDO_EN",
  "tests/unit/idioma.test.ts:21": "import.meta.glob",
  "tests/unit/privacidad-voice.test.ts:57": "regla dura 2",
  "tests/unit/sensibilidad.test.ts:64": "gate: cero coincidencias",
};

describe("convenciones de la familia v0.1.0", () => {
  it("declara su versión y que es una propuesta", () => {
    expect(DOC).toMatch(/\*\*Versión: 0\.1\.0 — propuesta\.\*\*/);
    expect(DOC).toMatch(/Version 0\.1\.0 — proposal/);
  });

  it("cada convención está en los dos idiomas", () => {
    for (const c of REGLAS) {
      expect(DOC, `${c} en español`).toMatch(new RegExp(`^## ${c} · `, "m"));
      expect(DOC, `${c} en inglés`).toMatch(new RegExp(`^\\*${c} · `, "m"));
    }
  });

  it("cada ruta:línea señala una línea que existe de un archivo que existe", () => {
    const refs = [...DOC.matchAll(/\[(?:src|tests)\/[^\]]+?:(\d+)\]\(\.\.\/\.\.\/([^)]+)\)/g)];
    expect(refs.length).toBeGreaterThanOrEqual(REGLAS.length);
    for (const [, linea, ruta] of refs) {
      const abs = join(RAIZ, ruta);
      expect(existsSync(abs), ruta).toBe(true);
      const lineas = readFileSync(abs, "utf8").split("\n");
      expect(lineas.length, `${ruta}:${linea}`).toBeGreaterThanOrEqual(Number(linea));
      // Y esa línea sigue señalando lo citado: si alguien inserta líneas arriba, esto falla.
      const ancla = ANCLAS[`${ruta}:${linea}`];
      expect(ancla, `${ruta}:${linea} necesita su ancla en ANCLAS`).toBeTruthy();
      expect(lineas[Number(linea) - 1], `${ruta}:${linea}`).toContain(ancla);
    }
  });

  it("C2: el modo calma existe y nace apagado", () => {
    expect(AJUSTES_DEFECTO.modoCalma).toBe(false);
  });

  it("C5: el crédito de ARASAAC está en cada idioma de las hojas", () => {
    for (const idioma of ["es", "en"] as const) {
      expect(imprimibles.credito[idioma]).toMatch(/ARASAAC/);
      expect(imprimibles.credito[idioma]).toMatch(/BY-NC-SA/);
    }
  });

  it("no cita ni escribe en Nutri-Kids: solo lo lee (el ADR lo declara)", () => {
    const adr = readFileSync(join(RAIZ, "decisions/022-shared-conventions-nutri-kids.md"), "utf8");
    expect(adr).toMatch(/Nothing is written in Nutri-Kids/);
  });
});
