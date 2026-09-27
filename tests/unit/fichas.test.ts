import { describe, expect, it } from "vitest";
import { CAPSULAS } from "@content/capsulas";
import { CAPSULAS_CONTACTO_VISUAL } from "@content/contacto-visual";
import { CAEN_DEL_DOCUMENTO, FICHAS } from "@content/fichas";
import {
  BibliotecaFichasSchema,
  FichaSchema,
  GRUPOS,
  GRUPOS_PRIORITARIOS,
  PROGRESIONES,
  type Ficha,
  type Grupo,
} from "@content/schema";

// LA PIRÁMIDE (S6): las garantías de la ficha de actividad y de la biblioteca viven en el schema,
// y este test las demuestra UNA a una con fixtures — cada constraint se vio en rojo.

const base: Ficha = {
  id: "x",
  grupo: "imitacion",
  prioridad: "alta",
  tecnica: "lo-copio",
  titulo: "Título",
  tenALaMano: ["Dos carros iguales."],
  haz: ["Uno.", "Dos.", "Tres."],
  tuLinea: "«Igual que tú.»",
  esperaVer: "Que te mire.",
  funcionoSi: "te mira mientras lo copias.",
  siNoPasa: "Más cerca, más grande.",
  duracion: "3–5 min",
  momentos: ["juego"],
  conQuien: "mama",
  origen: { de: "nueva", refs: ["anexo:B-A1"] },
  fuente: "Halle, 1981, J Appl Behav Anal",
};

const valida = (f: Partial<Ficha>) => FichaSchema.safeParse({ ...base, ...f }).success;

/** Una biblioteca válida de n fichas: los prioritarios juntos pesan más que el resto. */
function biblioteca(reparto: Partial<Record<Grupo, number>>): Ficha[] {
  const out: Ficha[] = [];
  for (const g of GRUPOS) {
    for (let k = 0; k < (reparto[g] ?? 0); k++) {
      out.push({
        ...base,
        id: `${g}-${k}`,
        grupo: g,
        prioridad: GRUPOS_PRIORITARIOS.includes(g) ? "alta" : "normal",
      });
    }
  }
  return out;
}
const REPARTO_VALIDO = {
  imitacion: 5,
  "atencion-conjunta": 4,
  juego: 5,
  senalar: 2,
  "intencion-comunicativa": 2,
  comprender: 2,
} as const;

describe("FichaSchema — la ficha de actividad", () => {
  it("una ficha completa y bien hecha pasa", () => {
    expect(valida({})).toBe(true);
  });
  it("el id es kebab-case estricto", () => {
    for (const malo of ["Con Mayus", 'con"comillas', "doble--guion", "-x"]) {
      expect(valida({ id: malo }), malo).toBe(false);
    }
  });
  it("los pasos son entre tres y cinco, uno por acción", () => {
    expect(valida({ haz: ["Uno.", "Dos."] })).toBe(false);
    expect(valida({ haz: ["1", "2", "3", "4", "5", "6"].map((n) => `Paso ${n}.`) })).toBe(false);
  });
  it("siempre hay algo que tener a la mano, y la línea cabe en una frase", () => {
    expect(valida({ tenALaMano: [] })).toBe(false);
    expect(valida({ tuLinea: "a".repeat(141) })).toBe(false);
  });
  it("«Funcionó si» describe lo que se ve, sin números", () => {
    expect(valida({ funcionoSi: "te mira 3 veces." })).toBe(false);
    expect(valida({ funcionoSi: "lo logra en 2 semanas." })).toBe(false);
  });
  it("la prioridad alta es solo de imitación, atención conjunta y juego", () => {
    expect(valida({ grupo: "comprender", prioridad: "alta" })).toBe(false);
    expect(valida({ grupo: "imitacion", prioridad: "normal" })).toBe(false);
    expect(valida({ grupo: "comprender", prioridad: "normal" })).toBe(true);
  });
  it("la progresión es un paso aprobado de SU grupo; intención comunicativa no tiene pasos", () => {
    expect(valida({ progresion: "I3" })).toBe(true);
    expect(valida({ progresion: "S3" })).toBe(false);
    expect(valida({ progresion: "I9" })).toBe(false);
    expect(Object.keys(PROGRESIONES["intencion-comunicativa"])).toEqual([]);
    expect(
      valida({ grupo: "intencion-comunicativa", prioridad: "normal", progresion: "N2" }),
    ).toBe(false);
  });
  it("una ficha con el hermano dice qué hace él", () => {
    expect(valida({ conQuien: "hermano" })).toBe(false);
    expect(valida({ conQuien: "hermano", tuLinea: "Al hermano: «Igualito que yo»." })).toBe(true);
  });
  it("el origen es trazable y cuadra con su tipo", () => {
    expect(valida({ origen: { de: "mirada", refs: ["mirada:dos-juguetes-iguales", "anexo:B-A1"] } })).toBe(true);
    expect(valida({ origen: { de: "mirada", refs: ["anexo:B-A1"] } })).toBe(false);
    expect(valida({ origen: { de: "nueva", refs: ["habla:x"] } })).toBe(false);
    expect(valida({ origen: { de: "fusion", refs: ["habla:x"] } })).toBe(false);
    expect(valida({ origen: { de: "fusion", refs: ["habla:x", "habla:y"] } })).toBe(true);
    expect(valida({ origen: { de: "nueva", refs: ["anexo:Z-A1"] } })).toBe(false);
    expect(valida({ origen: { de: "nueva", refs: [] } })).toBe(false);
  });
  it("la fuente va como autor · año · revista (o autor · año), sin título; la duración en minutos", () => {
    expect(valida({ fuente: "Halle, 1981" })).toBe(true);
    expect(valida({ fuente: "Halle 1981" })).toBe(false);
    expect(valida({ fuente: "Halle, 1981; un título largo" })).toBe(false);
    expect(valida({ duracion: "un ratico" })).toBe(false);
  });
});

describe("BibliotecaFichasSchema — la pirámide completa", () => {
  it("un reparto válido pasa", () => {
    expect(BibliotecaFichasSchema.safeParse(biblioteca(REPARTO_VALIDO)).success).toBe(true);
  });
  it("menos de veinte fichas no alcanza (calidad sobre cantidad, pero con piso)", () => {
    expect(BibliotecaFichasSchema.safeParse(biblioteca({ ...REPARTO_VALIDO, imitacion: 4 })).success).toBe(false);
  });
  it("los seis grupos se trabajan a la vez: ninguno se queda sin fichas", () => {
    expect(
      BibliotecaFichasSchema.safeParse(biblioteca({ ...REPARTO_VALIDO, senalar: 0, juego: 7 })).success,
    ).toBe(false);
  });
  it("los tres prioritarios, juntos, llevan más fichas que los otros tres juntos", () => {
    const b = biblioteca({
      imitacion: 3,
      "atencion-conjunta": 3,
      juego: 3,
      senalar: 4,
      "intencion-comunicativa": 4,
      comprender: 4,
    });
    expect(BibliotecaFichasSchema.safeParse(b).success).toBe(false);
  });
  it("los ids no se repiten", () => {
    const b = biblioteca(REPARTO_VALIDO);
    b[1] = { ...b[1], id: b[0].id };
    expect(BibliotecaFichasSchema.safeParse(b).success).toBe(false);
  });
});

describe("la biblioteca real del repo", () => {
  it("cada ficha que existe hoy cumple el schema, y sus ids son únicos", () => {
    for (const f of FICHAS) {
      const r = FichaSchema.safeParse(f);
      expect(r.success, `ficha ${f.id}: ${r.success ? "" : JSON.stringify(r.error.issues)}`).toBe(true);
    }
    expect(new Set(FICHAS.map((f) => f.id)).size).toBe(FICHAS.length);
  });

  it("cada origen apunta a una cápsula que existe (las 24 del S5 o las 50 de la app)", () => {
    const mirada = new Set(CAPSULAS_CONTACTO_VISUAL.map((c) => c.id));
    const habla = new Set(CAPSULAS.map((c) => c.id));
    for (const f of FICHAS) {
      for (const r of f.origen.refs) {
        if (r.startsWith("mirada:")) expect(mirada.has(r.slice(7)), `${f.id} → ${r}`).toBe(true);
        if (r.startsWith("habla:")) expect(habla.has(r.slice(6)), `${f.id} → ${r}`).toBe(true);
      }
    }
    for (const c of CAEN_DEL_DOCUMENTO) {
      expect(mirada.has(c.id) || habla.has(c.id), `cae ${c.id}`).toBe(true);
    }
  });
});
