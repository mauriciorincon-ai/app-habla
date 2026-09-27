import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  ALCANCE_GATE,
  archivoDe,
  N_MAX,
  nombreDe,
  buscarCoincidencias,
  hashDeTermino,
  normalizar,
  recortar,
  type Alcance,
} from "../../scripts/lib/sensibilidad";

// EL GATE DE SENSIBILIDAD (S5, ampliado en el S6). Este repo es público y la app es sobre un niño real: lo que se
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

/** Lo único del alcance que puede no existir todavía: lo que el sprint escribe al cerrar. */
const PENDIENTES_DEL_CIERRE = ["sprints/SPRINT_006-summary.md"];

/** Los marcadores de los que depende un recorte: si uno desaparece, esa sección saldría del gate. */
function marcadoresDe(alcance: Alcance): string[] {
  if (typeof alcance === "string") return [];
  if ("desde" in alcance) return [alcance.desde];
  if ("excepto" in alcance) return [...alcance.excepto];
  return [...alcance.entre];
}

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
  it("recortar por marcadores devuelve solo lo que está entre ellos", () => {
    expect(recortar("a <!-- s5:inicio --> b <!-- s5:fin --> c", { archivo: "x", entre: ["<!-- s5:inicio -->", "<!-- s5:fin -->"] }).trim()).toBe("b");
    expect(recortar("a MARCA b", { archivo: "x", desde: "MARCA" })).toBe("MARCA b");
  });
  it("recortar con «excepto» devuelve todo MENOS lo que está entre los marcadores", () => {
    const alcance = { archivo: "x", excepto: ["<!-- h:i -->", "<!-- h:f -->"] as [string, string] };
    expect(recortar("a <!-- h:i --> b <!-- h:f --> c", alcance).replace(/\s+/g, " ").trim()).toBe("a c");
    expect(recortar("a <!-- h:i --> b", alcance).trim()).toBe("a");
    expect(recortar("sin marcadores", alcance)).toBe("sin marcadores");
  });
});

describe("gate: cero coincidencias en lo que el sprint publica", () => {
  it("el fixture de hashes existe y no está vacío", () => {
    expect(FIXTURE.terminos).toBeGreaterThan(50);
    expect(HASHES.size).toBe(FIXTURE.hashes.length);
  });

  it("el fixture se generó con el mismo tamaño de n-grama que usa el gate", () => {
    expect(FIXTURE.n_max).toBe(N_MAX);
  });

  for (const alcance of ALCANCE_GATE) {
    const archivo = archivoDe(alcance);
    it(`${nombreDe(alcance)}`, () => {
      const ruta = join(RAIZ, archivo);
      if (!existsSync(ruta)) {
        // Solo lo que el sprint escribe al cierre puede faltar: una ruta mal escrita no pasa en silencio.
        expect(PENDIENTES_DEL_CIERRE, `el gate vigila un archivo que no existe: ${archivo}`).toContain(archivo);
        return;
      }
      const completo = readFileSync(ruta, "utf8");
      for (const marcador of marcadoresDe(alcance)) {
        expect(completo, `falta el marcador «${marcador}» en ${archivo}: el gate no vería esa sección`).toContain(marcador);
      }
      const texto = recortar(completo, alcance);
      const c = buscarCoincidencias(texto, HASHES);
      const detalle = c.map((x) => `línea ${x.linea} (n-grama de ${x.n})`).join(" · ");
      expect(c, `término sensible en ${archivo}: ${detalle}`).toEqual([]);
    });
  }
});

// Condición B de la orden del S6: ni nombres, ni edades, ni condiciones. Los términos los caza el gate
// de hashes; las EDADES no son términos, así que esta guardia las busca por forma («N años», «N–M
// años», «el hermano (N», «tiene N años») en todo lo que el gate vigila.
const EDAD = [
  /\b\d{1,2}\s*(?:[–-]\s*\d{1,2}\s*)?años\b/i,
  /hermano\s*\(\s*\d{1,2}/i,
  /\btiene\s+\d{1,2}\s+años\b/i,
];

describe("gate: ninguna edad escrita en lo que el sprint publica", () => {
  it("la guardia caza las formas de escribir una edad, y deja pasar los minutos", () => {
    const tieneEdad = (l: string) => EDAD.some((r) => r.test(l));
    // Los ejemplos se arman por partes: escritos enteros, esta guardia cazaría su propio archivo.
    const A = "años";
    expect(tieneEdad(`para un niño de 4–5 ${A}`)).toBe(true);
    expect(tieneEdad(["el hermano (", "17) juega"].join(""))).toBe(true);
    expect(tieneEdad(`el hermano tiene 17 ${A}`)).toBe(true);
    expect(tieneEdad("Momentos cortos — de 5 a 30 minutos")).toBe(false);
    expect(tieneEdad("Rowe, 2009, Science")).toBe(false);
  });

  for (const alcance of ALCANCE_GATE) {
    const archivo = archivoDe(alcance);
    it(`sin edades: ${nombreDe(alcance)}`, () => {
      const ruta = join(RAIZ, archivo);
      if (!existsSync(ruta)) return; // el test de arriba ya exige que solo falten los del cierre
      const lineas = recortar(readFileSync(ruta, "utf8"), alcance)
        .split("\n")
        .flatMap((l, i) => (EDAD.some((r) => r.test(l)) ? [i + 1] : []));
      expect(lineas, `edad escrita en ${archivo} (líneas del recorte)`).toEqual([]);
    });
  }
});
