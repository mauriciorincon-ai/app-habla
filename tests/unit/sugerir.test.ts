import { describe, it, expect } from "vitest";
import { sugerir, vocabularioDe } from "@/lib/objetivo/sugerir";

// SUGERENCIAS EN VIVO del objetivo (gate S4, O1): acompañar mientras se escribe — prefijos de
// términos reales primero, errores de ortografía (distancia ≤ 2) después, y NADA cuando lo
// escrito está de verdad lejos (ahí la UI muestra el mensaje honesto de siempre).

const VOCABULARIO = [
  "animales",
  "comida",
  "acciones",
  "perro",
  "pato",
  "carros",
];

describe("sugerir: el acompañante del teclazo", () => {
  it("un prefijo de término real lo sugiere (escribir a medias no es error)", () => {
    const s = sugerir("anim", VOCABULARIO);
    expect(s[0]).toEqual({ termino: "animales", tipo: "prefijo" });
  });

  it("un error de ortografía (≤ 2 letras) sugiere el término parecido", () => {
    const s = sugerir("animles", VOCABULARIO);
    expect(
      s.some((x) => x.termino === "animales" && x.tipo === "parecido"),
    ).toBe(true);
  });

  it("lo completamente lejano no sugiere nada (la UI dirá el mensaje honesto)", () => {
    expect(sugerir("xilófono", VOCABULARIO)).toEqual([]);
  });

  it("lo escrito exacto no se auto-sugiere", () => {
    const s = sugerir("animales", VOCABULARIO);
    expect(s.every((x) => x.termino !== "animales")).toBe(true);
  });

  it("es determinista y respeta el tope: prefijos primero, alfabético", () => {
    const a = sugerir("a", VOCABULARIO, 2);
    const b = sugerir("a", VOCABULARIO, 2);
    expect(a).toEqual(b);
    expect(a.length).toBeLessThanOrEqual(2);
    // "a" no llega a token (≥3 letras): normalizar lo filtra → sin sugerencias.
    expect(a).toEqual([]);
    const c = sugerir("acc", VOCABULARIO, 2);
    expect(c[0].termino).toBe("acciones");
  });

  it("sugiere sobre el ÚLTIMO token: 'más animles' corrige animles, no más", () => {
    const s = sugerir("más animles", VOCABULARIO);
    expect(s.some((x) => x.termino === "animales")).toBe(true);
  });

  // Hallazgo del gate (bloque O): "bañ" sugería «bano» — la forma normalizada, irreconocible — y
  // de paso rana/lana/mano como "parecidos" del token de 3 letras. La comparación normaliza; la
  // FORMA que se muestra conserva eñes y tildes, y con prefijos a la vista no hay parecidos.
  it("«bañ» sugiere «baño» con su eñe, sin ruido de parecidos (rana, lana…)", () => {
    const s = sugerir("bañ", ["el baño", "rana", "lana", "mano"]);
    expect(s).toEqual([{ termino: "baño", tipo: "prefijo" }]);
  });

  it("un parecido también se muestra con su forma real: «banio» → «baño»", () => {
    expect(sugerir("banio", ["el baño"])).toEqual([
      { termino: "baño", tipo: "parecido" },
    ]);
  });

  it("la tilde se conserva y la primera forma gana: «musi» → «música»", () => {
    expect(sugerir("musi", ["música", "musica"])).toEqual([
      { termino: "música", tipo: "prefijo" },
    ]);
  });
});

describe("vocabularioDe: el universo real de términos", () => {
  it("junta etiquetas, palabras, temas y pares, sin repetir", () => {
    const v = vocabularioDe({
      capsulas: [{ etiquetas: ["animales", "comida"] }],
      pictos: [{ palabra: "perro", tema: "animales" }],
      pares: [{ a: { palabra: "pato" }, b: { palabra: "gato" } }],
    });
    expect(v).toContain("animales");
    expect(v).toContain("perro");
    expect(v).toContain("pato");
    expect(v).toContain("gato");
    expect(v.filter((t) => t === "animales")).toHaveLength(1);
  });
});
