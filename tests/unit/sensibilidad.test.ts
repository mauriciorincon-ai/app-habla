import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  ALCANCE_GATE,
  EXCLUIDOS_GATE,
  N_MAX,
  buscarCoincidencias,
  hashDeTermino,
  lineasConEdad,
  normalizar,
} from "../../scripts/lib/sensibilidad";

// EL GATE DE SENSIBILIDAD (S5; desde el S16 vigila TODO el repo). Este repo es público y la app es sobre un niño real: lo que se
// publica del sprint no puede contener ninguno de los términos de la lista privada de la
// planeadora. Aquí solo viven sus hashes (tests/fixtures/sensibilidad-hashes.json). Si hay una
// coincidencia, el fallo dice archivo, línea y tamaño del n-grama — jamás el término.
//
// Demostrado en rojo con el término de prueba de la lista (ver la bitácora del sprint).

const RAIZ = join(__dirname, "..", "..");
const FIXTURE = JSON.parse(
  readFileSync(join(RAIZ, "tests", "fixtures", "sensibilidad-hashes.json"), "utf8"),
) as { hashes: string[]; terminos: number; n_max: number };
const HASHES = new Set(FIXTURE.hashes);

describe("normalización (idéntica a la del generador de hashes)", () => {
  it("minúsculas, sin acentos, todo lo no alfanumérico es un espacio", () => {
    expect(normalizar("  Árbol-Grande, ¡Sí!  ")).toEqual(["arbol", "grande", "si"]);
  });
  it("el hash de un término normalizado es estable", () => {
    expect(hashDeTermino(normalizar("Zeta Uno"))).toBe(hashDeTermino(["zeta", "uno"]));
  });
  it("un término de dos palabras se caza dentro de una frase, en cualquier orden de líneas", () => {
    const set = new Set([hashDeTermino(["zeta", "uno"])]);
    expect(buscarCoincidencias("nada\nla ZETA-uno pasó por aquí", set)).toEqual([{ linea: 2, n: 2 }]);
    expect(buscarCoincidencias("zeta dos uno", set)).toEqual([]);
  });
});

describe("gate: el alcance es TODO el repo (S16)", () => {
  const archivos = ALCANCE_GATE;
  it("el universo no se vacía en silencio: cientos de archivos, con sprints, ADR, docs, código y pruebas", () => {
    expect(archivos.length).toBeGreaterThan(400);
    for (const dir of ["sprints/", "decisions/", "docs/", "src/", "content/", "tests/", "scripts/"]) {
      expect(archivos.some((f) => f.startsWith(dir)), `el gate no ve ${dir}`).toBe(true);
    }
    expect(archivos).toContain("README.md");
    // «Todo el repo» incluye lo que no es documento ni TypeScript: estilos, flujos de CI, scripts de shell.
    for (const f of ["src/app/globals.css", ".github/workflows/ci.yml", "scripts/demo-rojo.sh", ".gitignore"]) {
      expect(archivos, `el gate no ve ${f}`).toContain(f);
    }
    expect(archivos.some((f) => /\.(png|wav|ico)$/.test(f))).toBe(false);
  });
  it("cada archivo se vigila entero (sin recortes) y solo quedan fuera los tres excluidos", () => {
    expect([...EXCLUIDOS_GATE].sort()).toEqual(["CLAUDE.md", "pnpm-lock.yaml", "tests/fixtures/sensibilidad-hashes.json"]);
    for (const f of EXCLUIDOS_GATE) expect(archivos).not.toContain(f);
  });
});

describe("gate: cero coincidencias en todo el repo", () => {
  it("el fixture de hashes existe y no está vacío", () => {
    expect(FIXTURE.terminos).toBeGreaterThan(50);
    expect(HASHES.size).toBe(FIXTURE.hashes.length);
  });

  it("el fixture se generó con el mismo tamaño de n-grama que usa el gate", () => {
    expect(FIXTURE.n_max).toBe(N_MAX);
  });

  for (const archivo of ALCANCE_GATE) {
    it(archivo, () => {
      const c = buscarCoincidencias(readFileSync(join(RAIZ, archivo), "utf8"), HASHES);
      const detalle = c.map((x) => `línea ${x.linea} (n-grama de ${x.n})`).join(" · ");
      expect(c, `término sensible en ${archivo}: ${detalle}`).toEqual([]);
    });
  }
});

// Ni nombres, ni edades, ni condiciones. Los términos los caza el gate de hashes; las EDADES no son
// términos, así que esta guardia las busca por forma (`EDAD` en scripts/lib/sensibilidad.ts) en todo el repo.
describe("gate: ninguna edad escrita en todo el repo", () => {
  it("la guardia caza las formas de escribir una edad, y deja pasar los minutos", () => {
    const tieneEdad = (l: string) => lineasConEdad(l).length > 0;
    // Los ejemplos se arman por partes: escritos enteros, esta guardia cazaría su propio archivo.
    const A = "años";
    expect(tieneEdad(`para un niño de 4–5 ${A}`)).toBe(true);
    expect(tieneEdad(["el hermano (", "17) juega"].join(""))).toBe(true);
    expect(tieneEdad(`el hermano tiene 17 ${A}`)).toBe(true);
    expect(tieneEdad("Momentos cortos — de 5 a 30 minutos")).toBe(false);
    expect(tieneEdad("Rowe, 2009, Science")).toBe(false);
    // Inglés (S7): armado por partes por la misma razón.
    const Y = "year";
    expect(tieneEdad(`a child of 4 ${Y}s`)).toBe(true);
    expect(tieneEdad(`a 5-${Y}-old`)).toBe(true);
    expect(tieneEdad("a child aged " + "6")).toBe(true);
    expect(tieneEdad("short moments — 5 to 30 minutes")).toBe(false);
  });

  for (const archivo of ALCANCE_GATE) {
    it(`sin edades: ${archivo}`, () => {
      expect(lineasConEdad(readFileSync(join(RAIZ, archivo), "utf8")), `edad escrita en ${archivo}`).toEqual([]);
    });
  }
});
