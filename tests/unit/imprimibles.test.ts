import { describe, expect, it } from "vitest";
import {
  TARJETAS_POR_HOJA,
  elegirPictogramas,
  paginar,
  palabraDe,
} from "@/lib/imprimibles/hojas";

describe("hojas imprimibles: qué dibujos salen", () => {
  it("encuentra el dibujo de las palabras meta y de los intereses, sin acentos ni mayúsculas", () => {
    const { pictos } = elegirPictogramas(["Perro"], ["gatos y gato"], "es");
    const palabras = pictos.map((p) => palabraDe(p, "es"));
    expect(palabras).toContain("perro");
    expect(palabras).toContain("gato");
  });

  it("en inglés busca la palabra inglesa del dibujo", () => {
    const { pictos } = elegirPictogramas(["dog"], [], "en");
    expect(pictos.map((p) => palabraDe(p, "en"))).toContain("dog");
  });

  it("sin coincidencias la hoja no sale vacía: completa con el lote base, en orden fijo", () => {
    const a = elegirPictogramas([], [], "es");
    const b = elegirPictogramas([], [], "es");
    expect(a.pictos).toHaveLength(TARJETAS_POR_HOJA);
    expect(a.delLoteBase).toBe(TARJETAS_POR_HOJA);
    expect(a.pictos.map((p) => p.id)).toEqual(b.pictos.map((p) => p.id));
  });

  it("el texto de la familia nunca viaja en el resultado: solo pictogramas del lote", () => {
    const { pictos } = elegirPictogramas(["zzzzqq"], ["nombrepropio"], "es");
    const serial = JSON.stringify(pictos);
    expect(serial).not.toContain("zzzzqq");
    expect(serial).not.toContain("nombrepropio");
  });

  it("pagina en hojas de ocho", () => {
    expect(paginar(Array.from({ length: 19 }, (_, i) => i)).map((h) => h.length)).toEqual([8, 8, 3]);
  });
});

describe("la meta de la semana llega a las hojas (S14, ADR-026)", () => {
  it("«colores» pone los cuatro dibujos de color primero, en español y en inglés", () => {
    const es = elegirPictogramas([], [], "es", undefined, "colores").pictos;
    expect(es.slice(0, 4).map((p) => p.palabra)).toEqual(["rojo", "azul", "amarillo", "verde"]);
    const en = elegirPictogramas([], [], "en", undefined, "colors").pictos;
    expect(en.slice(0, 4).map((p) => p.en)).toEqual(["red", "blue", "yellow", "green"]);
  });

  it("sin meta la lista es la de siempre, y una meta sin dibujos no la altera", () => {
    const base = elegirPictogramas([], [], "es").pictos.map((p) => p.id);
    expect(elegirPictogramas([], [], "es", undefined, null).pictos.map((p) => p.id)).toEqual(base);
    expect(elegirPictogramas([], [], "es", undefined, "números").pictos.map((p) => p.id)).toEqual(base);
  });

  it("sin repetir dibujos y sin pasar del tope", () => {
    const { pictos } = elegirPictogramas(["rojo"], ["mar"], "es", 10, "colores y acciones");
    expect(new Set(pictos.map((p) => p.id)).size).toBe(pictos.length);
    expect(pictos.length).toBeLessThanOrEqual(10);
  });
});
