import { describe, it, expect } from "vitest";
import {
  conoceElDiccionario,
  indexarDiccionario,
  sugerirOrtografia,
  ultimaClave,
} from "@/lib/objetivo/diccionario";
import { PALABRAS_ES } from "@/lib/objetivo/palabras-es";

// ORTOGRAFÍA GENERAL del objetivo (gate S4, bloque O — pedido del usuario): "medi" debe poder
// sugerir «medio»/«medios» AUNQUE no estén en el contenido de la app, y una palabra bien
// escrita («medios», «colores») se guarda sin pregunta.

// Orden = frecuencia real (el índice es el rango): medio > media > medios en uso.
const LISTA = ["medio", "media", "casa", "medios", "baño", "comer", "música"];
const INDICE = indexarDiccionario(LISTA);
const NADIE = new Set<string>();

describe("sugerirOrtografia: la palabra bien escrita que la app no tiene", () => {
  it("«medi» sugiere por prefijo en orden de FRECUENCIA: medio, media, medios", () => {
    expect(sugerirOrtografia("medi", INDICE, NADIE)).toEqual([
      { termino: "medio", tipo: "prefijo" },
      { termino: "media", tipo: "prefijo" },
      { termino: "medios", tipo: "prefijo" },
    ]);
  });

  it("excluye las claves del vocabulario de la app (esas van en su propio color)", () => {
    const s = sugerirOrtografia("medi", INDICE, new Set(["medio"]));
    expect(s.map((x) => x.termino)).toEqual(["media", "medios"]);
  });

  it("una palabra bien escrita no recibe correcciones, pero SÍ continuaciones", () => {
    // "medio" existe → cero parecidos; «medios» sigue alcanzable tecleando (prefijo).
    expect(sugerirOrtografia("medio", INDICE, NADIE)).toEqual([
      { termino: "medios", tipo: "prefijo" },
    ]);
    // "medios" existe y nada lo continúa: silencio — a lo correcto no se le corrige nada.
    expect(sugerirOrtografia("medios", INDICE, NADIE)).toEqual([]);
  });

  it("un typo trae parecidos por distancia y frecuencia: «mediso» → medio primero", () => {
    const s = sugerirOrtografia("mediso", INDICE, NADIE);
    expect(s.map((x) => x.termino)).toEqual(["medio", "media", "medios"]);
    expect(s.every((x) => x.tipo === "parecido")).toBe(true);
  });

  it("la forma se muestra con eñes y tildes: «banio» → «baño», «musi» → «música»", () => {
    expect(sugerirOrtografia("banio", INDICE, NADIE)).toEqual([
      { termino: "baño", tipo: "parecido" },
    ]);
    expect(sugerirOrtografia("musi", INDICE, NADIE)).toEqual([
      { termino: "música", tipo: "prefijo" },
    ]);
  });

  it("conoceElDiccionario juzga el ÚLTIMO token, normalizado", () => {
    expect(conoceElDiccionario(INDICE, "medios")).toBe(true);
    expect(conoceElDiccionario(INDICE, "ver medios")).toBe(true);
    expect(conoceElDiccionario(INDICE, "Música")).toBe(true);
    expect(conoceElDiccionario(INDICE, "mediso")).toBe(false);
    expect(conoceElDiccionario(INDICE, "")).toBe(false);
  });

  it("ultimaClave normaliza como el resto del motor", () => {
    expect(ultimaClave("El Baño")).toBe("bano");
    expect(ultimaClave("")).toBeNull();
  });
});

describe("palabras-es: el diccionario embebido curado", () => {
  it("trae hasta 10 000 palabras bien formadas, sin duplicados", () => {
    expect(PALABRAS_ES.length).toBeGreaterThanOrEqual(8000);
    expect(PALABRAS_ES.length).toBeLessThanOrEqual(10000);
    expect(new Set(PALABRAS_ES).size).toBe(PALABRAS_ES.length);
    const malFormadas = PALABRAS_ES.filter(
      (p) => !/^[a-záéíóúüñ]{3,16}$/.test(p),
    );
    expect(malFormadas).toEqual([]);
  });

  it("contiene el caso del gate y palabras de la casa", () => {
    for (const p of ["medio", "medios", "baño", "niño", "también", "agua"]) {
      expect(PALABRAS_ES).toContain(p);
    }
  });

  it("la curaduría vetó lo que jamás debe salir como chip en una app familiar", () => {
    for (const p of [
      "mierda",
      "puta",
      "sexo",
      "idiota",
      "estúpido",
      "the",
      "you",
    ]) {
      expect(PALABRAS_ES).not.toContain(p);
    }
  });
});
