import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  LotePictogramasSchema,
  PICTOGRAMAS,
  rutaPictograma,
} from "@content/pictogramas";
import { TEMAS } from "@/lib/storage/temas";

// El lote de pictogramas (ADR 008): dibujos de ARASAAC, palabras nuestras en es-CO.
// Estos tests son el contrato del juego palabra↔objeto: si el lote se rompe, el juego se queda
// sin material — y eso debe fallar aquí, no en la cara del niño.

const CARPETA = resolve(process.cwd(), "public/pictogramas");

describe("lote de pictogramas ARASAAC", () => {
  it("cumple el esquema: ≥40 pictogramas y los 6 temas cubiertos", () => {
    const parsed = LotePictogramasSchema.safeParse(PICTOGRAMAS);
    expect(parsed.success).toBe(true);
  });

  it("cada tema de interés tiene al menos 5 pictogramas (el juego no se queda corto)", () => {
    for (const tema of TEMAS) {
      const delTema = PICTOGRAMAS.filter((p) => p.tema === tema);
      expect(delTema.length).toBeGreaterThanOrEqual(5);
    }
  });

  it("no repite ids", () => {
    const ids = PICTOGRAMAS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("TODOS los archivos existen en el repo (cero llamadas a ARASAAC en runtime)", () => {
    for (const picto of PICTOGRAMAS) {
      expect(
        existsSync(resolve(CARPETA, picto.archivo)),
        `falta el archivo del pictograma "${picto.id}": ${picto.archivo}`,
      ).toBe(true);
    }
  });

  it("la licencia y su atribución viajan CON el lote (CC BY-NC-SA)", () => {
    expect(existsSync(resolve(CARPETA, "LICENCIA.md"))).toBe(true);
  });

  it("las palabras son es-CO y de nivel palabras sueltas (cortas, concretas)", () => {
    for (const picto of PICTOGRAMAS) {
      // Una palabra, sin frases: el nivel es palabras sueltas (ADR 005).
      expect(picto.palabra.trim().split(/\s+/)).toHaveLength(1);
      expect(picto.palabra.length).toBeLessThanOrEqual(12);
    }
    // Nuestro español, no el de la fuente: el dibujo de "coche" se muestra como "carro".
    const palabras = PICTOGRAMAS.map((p) => p.palabra);
    expect(palabras).toContain("carro");
    expect(palabras).not.toContain("coche");
    expect(palabras).toContain("bus");
  });

  it("la ruta pública apunta al archivo del repo, no a una URL externa", () => {
    for (const picto of PICTOGRAMAS) {
      const ruta = rutaPictograma(picto);
      expect(ruta.startsWith("/pictogramas/")).toBe(true);
      expect(ruta).not.toMatch(/^https?:/);
    }
  });
});
