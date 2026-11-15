import { beforeEach, describe, expect, it } from "vitest";
import { capsulaDeHoy } from "@/components/estado-capsulas";
import { alinear } from "@/lib/objetivo/alinear";
import { ETAPAS } from "@content/schema";
import { PROGRESO_INICIAL } from "@/lib/storage/schemas";
import { CLAVES } from "@/lib/storage/local";

// Sin meta de la semana, su mundo (S14) inclina la cápsula NUEVA del día hacia sus temas y hacia «otras cosas
// que le encantan», sin salirse de la etapa. Sin nada suyo, el motor es el de siempre. Perfiles inventados.

const sembrarPerfil = (perfil: object | null) => {
  if (perfil) localStorage.setItem(CLAVES.perfil, JSON.stringify(perfil));
};

describe("la cápsula del día con su mundo (sin meta de la semana)", () => {
  beforeEach(() => localStorage.clear());

  it("con «baño» entre otras cosas, la cápsula nueva lleva esa etiqueta (en cada etapa que la tenga)", () => {
    sembrarPerfil({ temas: ["mar"], otrasCosas: ["baño"] });
    const a = alinear("baño");
    let vistas = 0;
    for (const etapa of ETAPAS) {
      const { capsula } = capsulaDeHoy(PROGRESO_INICIAL, etapa);
      if (a.coincideEtiquetas(capsula.etiquetas)) vistas++;
    }
    expect(vistas).toBeGreaterThan(0);
  });

  it("nunca sirve una cápsula de otra etapa", () => {
    sembrarPerfil({ temas: ["mar"], otrasCosas: ["baño"] });
    for (const etapa of ETAPAS) {
      expect(capsulaDeHoy(PROGRESO_INICIAL, etapa).capsula.etapa).toBe(etapa);
    }
  });

  it("sin perfil el motor es el de siempre: determinista para la misma fecha y etapa", () => {
    for (const etapa of ETAPAS) {
      expect(capsulaDeHoy(PROGRESO_INICIAL, etapa).capsula.id).toBe(
        capsulaDeHoy(PROGRESO_INICIAL, etapa).capsula.id,
      );
    }
  });
});
