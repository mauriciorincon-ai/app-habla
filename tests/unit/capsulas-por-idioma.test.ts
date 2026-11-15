import { describe, expect, it } from "vitest";
import { CAPSULAS } from "@content/capsulas";
import { CAPSULAS_EN_TODAS } from "@content/capsulas-en-todas";
import { CAPSULAS_ES } from "@content/capsulas-es";

// La biblioteca se parte por idioma para que "Hoy" no cargue el inglés (presupuesto de Lighthouse):
// la partida no puede perder ni desordenar nada.
describe("la biblioteca partida por idioma", () => {
  it("la ligera (es) y la completa tienen las mismas cápsulas, en el mismo orden", () => {
    expect(CAPSULAS_ES.map((c) => c.id)).toEqual(CAPSULAS.map((c) => c.id));
    expect(CAPSULAS_ES).toHaveLength(60);
  });

  it("cada cápsula tiene su cara inglesa en el módulo que se carga bajo demanda", () => {
    for (const c of CAPSULAS_ES)
      expect(CAPSULAS_EN_TODAS[c.id], c.id).toBeDefined();
    expect(Object.keys(CAPSULAS_EN_TODAS)).toHaveLength(60);
  });

  it("la completa junta cada cara con la suya", () => {
    for (const [i, c] of CAPSULAS.entries()) {
      expect(c.titulo.es).toBe(CAPSULAS_ES[i]!.titulo);
      expect(c.titulo.en).toBe(CAPSULAS_EN_TODAS[c.id]!.titulo);
    }
  });
});
