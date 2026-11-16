import { describe, expect, it } from "vitest";
import { SORPRESAS, SorpresasSchema } from "@content/sorpresas";
import {
  abreSorpresa,
  sorpresaDelDia,
  TURNOS_PARA_SORPRESA,
} from "@/lib/su-mundo/sorpresa";
import { TEMAS } from "@/lib/storage/temas";

// SORPRESAS (S15): con los turnos del niño, nunca premio, distintas cada día, sin monedas ni colección.

describe("sorpresa del día", () => {
  it("es determinista con la fecha y el juego", () => {
    const a = sorpresaDelDia("mar", "2026-11-15", "globo", "es");
    expect(sorpresaDelDia("mar", "2026-11-15", "globo", "es")).toEqual(a);
    expect(a.tema).toBe("mar");
  });

  it("cambia de un día a otro (y entre juegos)", () => {
    const dias = Array.from({ length: 10 }, (_, i) =>
      sorpresaDelDia("espacio", `2026-11-${10 + i}`, "cohete", "es").texto,
    );
    expect(new Set(dias).size).toBeGreaterThan(1);
    const juegos = ["globo", "soplar", "cohete", "vocales", "palabras", "gemelas"].map(
      (j) => sorpresaDelDia("animales", "2026-11-15", j, "es").texto,
    );
    expect(new Set(juegos).size).toBeGreaterThan(1);
  });

  it("sin perfil elige un tema por fecha, y en inglés da la frase en inglés", () => {
    const s = sorpresaDelDia(null, "2026-11-15", "gemelas", "en");
    expect(TEMAS).toContain(s.tema);
    expect(SORPRESAS[s.tema].map((f) => f.en)).toContain(s.texto);
  });

  it("se abre una sola vez: al ALCANZAR su tercer turno", () => {
    expect(TURNOS_PARA_SORPRESA).toBe(3);
    expect(abreSorpresa(2, 3)).toBe(true);
    expect(abreSorpresa(3, 4)).toBe(false);
    expect(abreSorpresa(0, 1)).toBe(false);
  });
});

describe("contenido de las sorpresas", () => {
  it("valida con su esquema y cubre los seis temas con al menos 3 frases en los dos idiomas", () => {
    expect(() => SorpresasSchema.parse(SORPRESAS)).not.toThrow();
    for (const t of TEMAS) expect(SORPRESAS[t].length).toBeGreaterThanOrEqual(3);
  });

  it("es y en redactados (distintos), sin «no», sin felicitar y sin puntajes", () => {
    for (const t of TEMAS)
      for (const f of SORPRESAS[t]) {
        expect(f.es).not.toBe(f.en);
        expect(f.es).not.toMatch(/\b(no|nada)\b|muy bien|bravo|premio|punto|moneda|ficha|colecci/i);
        expect(f.en).not.toMatch(/\b(no|not)\b|well done|great job|prize|point|coin|token|collect/i);
      }
  });
});
