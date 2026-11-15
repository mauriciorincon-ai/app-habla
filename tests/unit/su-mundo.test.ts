import { describe, expect, it } from "vitest";
import { PARES_GEMELOS, PARES_GEMELOS_EN } from "@content/pares-gemelos";
import {
  PICTOGRAMAS,
  PICTOGRAMAS_DE_ETIQUETA,
  PictogramaDeEtiquetaSchema,
} from "@content/pictogramas";
import { CAPSULAS } from "@content/capsulas";
import { ETIQUETAS_CAPSULA } from "@content/schema";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { alinear } from "@/lib/objetivo/alinear";
import { TEMAS, type Tema } from "@/lib/storage/temas";
import {
  dibujosDeLaMeta,
  etiquetaCercanaDe,
  JUEGOS_SU_MUNDO,
  MAX_PALABRAS_A_MODELAR,
  palabrasDeLaMeta,
  paresPreferidosDe,
  protagonistaDe,
  suMundo,
  temasDelPar,
} from "@/lib/su-mundo/su-mundo";

// SU MUNDO EN TODO (S14, ADR-026): el selector puro que viste los juegos con SUS temas y orienta al
// adulto con la meta de la semana. Perfiles inventados; la fecha es una perilla (regla 23).

const HOY = "2026-11-16";

describe("el protagonista: uno de SUS temas, rotando por fecha y por juego", () => {
  it("los siete juegos × los seis temas dan un protagonista, y siempre es uno de sus temas", () => {
    for (const juego of JUEGOS_SU_MUNDO) {
      for (const tema of TEMAS) {
        expect(protagonistaDe([tema], juego, HOY)).toBe(tema);
      }
      const tres: Tema[] = ["dinosaurios", "mar", "espacio"];
      expect(tres).toContain(protagonistaDe(tres, juego, HOY));
    }
  });

  it("es determinista para la misma fecha y rota con los días", () => {
    const temas: Tema[] = ["animales", "carros"];
    expect(protagonistaDe(temas, "globo", HOY)).toBe(
      protagonistaDe(temas, "globo", HOY),
    );
    const semana = ["2026-11-16", "2026-11-17", "2026-11-18", "2026-11-19"].map(
      (f) => protagonistaDe(temas, "globo", f),
    );
    expect(new Set(semana)).toEqual(new Set(temas));
  });

  it("dos juegos del mismo día no llevan siempre el mismo (desfase por juego)", () => {
    const temas: Tema[] = ["animales", "carros", "mar"];
    const delDia = JUEGOS_SU_MUNDO.map((j) => protagonistaDe(temas, j, HOY));
    expect(new Set(delDia).size).toBe(3);
  });

  it("sin temas no hay protagonista: la escena es la de siempre", () => {
    expect(protagonistaDe([], "cohete", HOY)).toBeNull();
    expect(
      suMundo({ temas: [], objetivo: null, idioma: "es", fecha: HOY }, "cohete")
        .protagonista,
    ).toBeNull();
  });
});

describe("las palabras a modelar: la meta de la terapia, en el idioma de la pantalla", () => {
  it("«colores» da los colores, en español y en inglés", () => {
    expect(palabrasDeLaMeta("colores", "es")).toEqual([
      "rojo",
      "azul",
      "amarillo",
      "verde",
    ]);
    expect(palabrasDeLaMeta("colors", "en")).toEqual([
      "red",
      "blue",
      "yellow",
      "green",
    ]);
    // Escrita en un idioma, la pantalla en el otro: igual alinea.
    expect(palabrasDeLaMeta("colores", "en")).toEqual([
      "red",
      "blue",
      "yellow",
      "green",
    ]);
  });

  it("«verbos de acción» y «action verbs» dan acciones (singular y plural cuentan igual)", () => {
    const es = palabrasDeLaMeta("verbos de acción", "es");
    expect(es.length).toBe(MAX_PALABRAS_A_MODELAR);
    expect(es).toContain("comer");
    const en = palabrasDeLaMeta("action verbs", "en");
    expect(en).toContain("eat");
  });

  it("una meta por tema da palabras del tema; una palabra suelta da esa palabra", () => {
    expect(palabrasDeLaMeta("dinosaurios", "es").length).toBeGreaterThan(0);
    expect(palabrasDeLaMeta("agua", "es")[0]).toBe("tomar");
    expect(palabrasDeLaMeta("agua", "es")).toContain("agua");
    expect(palabrasDeLaMeta("rojo", "es")).toEqual(["rojo"]);
  });

  it("nunca más de cuatro, y sin meta ninguna", () => {
    for (const meta of [
      "animales",
      "el baño",
      "acciones",
      "colores y animales",
    ]) {
      expect(palabrasDeLaMeta(meta, "es").length).toBeLessThanOrEqual(
        MAX_PALABRAS_A_MODELAR,
      );
    }
    expect(palabrasDeLaMeta(null, "es")).toEqual([]);
    expect(palabrasDeLaMeta("", "es")).toEqual([]);
  });

  it("los dibujos de la meta (colores, acciones) entran al mazo solo si la meta los pide", () => {
    expect(dibujosDeLaMeta("colores").map((p) => p.palabra)).toEqual([
      "rojo",
      "azul",
      "amarillo",
      "verde",
    ]);
    expect(dibujosDeLaMeta(null)).toEqual([]);
    expect(dibujosDeLaMeta("animales")).toEqual([]);
  });
});

describe("los pares de gemelas: los de su meta primero, luego los de sus temas", () => {
  it("el tema de un par sale de sus dibujos", () => {
    const patoGato = PARES_GEMELOS.find((p) => p.id === "pato-gato")!;
    expect(temasDelPar(patoGato)).toEqual(["animales"]);
  });

  it("con temas y sin meta, prefiere los pares de sus temas", () => {
    const ids = paresPreferidosDe(["animales"], null, "es");
    expect(ids).toContain("pato-gato");
    expect(ids).not.toContain("casa-taza");
  });

  it("la meta «acciones» trae los pares de acción, en cada idioma los suyos", () => {
    expect(paresPreferidosDe([], "acciones", "es").slice(0, 2)).toEqual([
      "come-tome",
      "toca-boca",
    ]);
    expect(paresPreferidosDe([], "actions", "en").slice(0, 2)).toEqual([
      "run-sun",
      "dig-pig",
    ]);
    expect(paresPreferidosDe(["animales"], "acciones", "es")[0]).toBe(
      "come-tome",
    );
  });
});

describe("el caso honesto: una meta sin contenido no finge alinear", () => {
  it("«números» no da palabras ni pares de la meta, y no se parece a ninguna etiqueta", () => {
    const m = suMundo(
      { temas: ["mar"], objetivo: "números", idioma: "es", fecha: HOY },
      "globo",
    );
    expect(m.palabrasAModelar).toEqual([]);
    expect(m.etiquetaCercana).toBeNull();
    // Sus temas siguen vistiendo la escena: la meta vacía no le quita su mundo.
    expect(m.protagonista).toBe("mar");
  });

  it("una meta mal escrita sugiere la etiqueta real más parecida («colres» → colores)", () => {
    expect(etiquetaCercanaDe("colres")).toBe("colores");
    const m = suMundo(
      { temas: ["mar"], objetivo: "colres", idioma: "es", fecha: HOY },
      "globo",
    );
    expect(m.etiquetaCercana).toBe("colores");
  });

  it("una meta que alinea cápsulas (aunque no dibujos) no se trata como vacía", () => {
    const m = suMundo(
      { temas: ["mar"], objetivo: "espera", idioma: "es", fecha: HOY },
      "globo",
    );
    expect(m.etiquetaCercana).toBeNull();
  });
});

describe("el tema «musica» y la etiqueta «música»: el acento no los separa", () => {
  it("una meta «música» alinea el tema musica y sus dibujos; «musica» sin tilde, también", () => {
    expect(alinear("música").coincideTema("musica")).toBe(true);
    expect(alinear("musica").coincideEtiquetas(["música"])).toBe(true);
    expect(palabrasDeLaMeta("música", "es").length).toBeGreaterThan(0);
  });
});

describe("el contenido nuevo del S14 cumple su contrato", () => {
  it("los dibujos de etiqueta cumplen su esquema, existen en el repo y no tienen tema", () => {
    for (const p of PICTOGRAMAS_DE_ETIQUETA) {
      expect(() => PictogramaDeEtiquetaSchema.parse(p)).not.toThrow();
      expect(
        existsSync(resolve(process.cwd(), "public/pictogramas", p.archivo)),
        p.archivo,
      ).toBe(true);
      expect(p.palabra).not.toBe(p.en);
    }
    const ids = [...PICTOGRAMAS, ...PICTOGRAMAS_DE_ETIQUETA].map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("`colores` llega a cápsulas y dibujos; `acciones`, a dibujos y pares, en los dos idiomas", () => {
    expect(ETIQUETAS_CAPSULA).toContain("colores");
    expect(CAPSULAS.some((c) => c.etiquetas.includes("colores"))).toBe(true);
    expect(
      PICTOGRAMAS_DE_ETIQUETA.filter((p) => p.etiquetas.includes("colores"))
        .length,
    ).toBe(4);
    expect(
      PICTOGRAMAS_DE_ETIQUETA.filter((p) => p.etiquetas.includes("acciones"))
        .length,
    ).toBeGreaterThanOrEqual(6);
    expect(
      PARES_GEMELOS.filter((p) => p.etiquetas?.includes("acciones")).length,
    ).toBe(2);
    expect(
      PARES_GEMELOS_EN.filter((p) => p.etiquetas?.includes("acciones")).length,
    ).toBe(2);
  });

  it("hay al menos 8 cápsulas del baño y 4 de colores, cada una con su técnica y su fuente", () => {
    const bano = CAPSULAS.filter((c) => c.etiquetas.includes("baño"));
    const colores = CAPSULAS.filter((c) => c.etiquetas.includes("colores"));
    expect(bano.length).toBeGreaterThanOrEqual(8);
    expect(colores.length).toBeGreaterThanOrEqual(4);
    for (const c of [...bano, ...colores]) {
      expect(c.fuente.length).toBeGreaterThan(10);
      expect(c.guion.es).not.toBe(c.guion.en);
    }
  });
});
