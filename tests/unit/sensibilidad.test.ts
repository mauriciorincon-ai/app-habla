import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  ALCANCE_GATE,
  archivoDe,
  buscarCoincidencias,
  hashDeTermino,
  normalizar,
  recortar,
} from "../../scripts/lib/sensibilidad";

// EL GATE DE SENSIBILIDAD (S5). Este repo es público y la app es sobre un niño real: lo que se
// publica del sprint no puede contener ninguno de los términos de la lista privada de la
// planeadora. Aquí solo viven sus hashes (tests/fixtures/sensibilidad-hashes.json). Si hay una
// coincidencia, el fallo dice archivo, línea y tamaño del n-grama — jamás el término.
//
// Demostrado en rojo con el término de prueba de la lista (ver la bitácora del sprint).

const RAIZ = join(__dirname, "..", "..");
const FIXTURE = JSON.parse(
  readFileSync(join(RAIZ, "tests", "fixtures", "sensibilidad-hashes.json"), "utf8"),
) as { hashes: string[]; terminos: number };
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

  for (const alcance of ALCANCE_GATE) {
    const archivo = archivoDe(alcance);
    it(`${archivo}`, () => {
      const ruta = join(RAIZ, archivo);
      if (!existsSync(ruta)) return; // aún no existe (p. ej. el summary antes del cierre)
      const texto = recortar(readFileSync(ruta, "utf8"), alcance);
      const c = buscarCoincidencias(texto, HASHES);
      const detalle = c.map((x) => `línea ${x.linea} (n-grama de ${x.n})`).join(" · ");
      expect(c, `término sensible en ${archivo}: ${detalle}`).toEqual([]);
    });
  }
});
