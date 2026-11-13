import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CAPSULAS } from "@content/capsulas";
import { CAPSULAS_CONTACTO_VISUAL } from "@content/contacto-visual";
import { CAEN_DEL_DOCUMENTO, FICHAS } from "@content/fichas";
import {
  BibliotecaFichasSchema,
  FichaSchema,
  GRUPOS,
  GRUPOS_PRIORITARIOS,
  NOMBRE_GRUPO,
  PROGRESIONES,
  type Ficha,
  type Grupo,
} from "@content/schema";

// LA PIRÁMIDE (S6): las garantías de la ficha de actividad y de la biblioteca viven en el schema,
// y este test las demuestra UNA a una con fixtures — cada constraint se vio en rojo.

const RAIZ = join(__dirname, "..", "..");
const leer = (ruta: string) => readFileSync(join(RAIZ, ruta), "utf8");

/** El mapa aprobado en G-Investigación se hizo sobre estas cápsulas: las 24 del S5 + las 50 de la app. */
const CAPSULAS_DEL_MAPA = 74;

/** El mismo escape que usa el generador (scripts/lib/catalogo-comun.mjs). */
const esc = (t: string) =>
  t.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

const dos = (es: string, en: string = es) => ({ es, en });

const base: Ficha = {
  id: "x",
  grupo: "imitacion",
  prioridad: "alta",
  tecnica: "lo-copio",
  titulo: dos("Título", "Title"),
  tenALaMano: [dos("Dos carros iguales.", "Two matching cars.")],
  haz: [dos("Uno.", "One."), dos("Dos.", "Two."), dos("Tres.", "Three.")],
  tuLinea: dos("«Igual que tú.»", "“Same as you.”"),
  esperaVer: dos("Que te mire.", "That they look at you."),
  funcionoSi: dos("te mira mientras lo copias.", "they look at you while you copy them."),
  siNoPasa: dos("Más cerca, más grande.", "Closer, bigger."),
  duracion: "3–5 min",
  momentos: ["juego"],
  conQuien: "mama",
  origen: { de: "nueva", refs: ["anexo:B-A1"] },
  fuente: "Halle, 1981, J Appl Behav Anal",
};

const valida = (f: Partial<Ficha>) =>
  FichaSchema.safeParse({ ...base, ...f }).success;

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
    expect(valida({ haz: [dos("Uno."), dos("Dos.")] })).toBe(false);
    expect(
      valida({ haz: ["1", "2", "3", "4", "5", "6"].map((n) => dos(`Paso ${n}.`, `Step ${n}.`)) }),
    ).toBe(false);
  });
  it("siempre hay algo que tener a la mano, y la línea cabe en una frase", () => {
    expect(valida({ tenALaMano: [] })).toBe(false);
    expect(valida({ tuLinea: dos("a".repeat(141)) })).toBe(false);
  });
  it("«Funcionó si» describe lo que se ve, sin números", () => {
    expect(valida({ funcionoSi: dos("te mira 3 veces.", "they look at you.") })).toBe(false);
    expect(valida({ funcionoSi: dos("lo logra en 2 semanas.", "they get it.") })).toBe(false);
    // También en inglés: el número en la cara inglesa tampoco pasa.
    expect(valida({ funcionoSi: dos("te mira.", "they look at you 3 times.") })).toBe(false);
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
      valida({
        grupo: "intencion-comunicativa",
        prioridad: "normal",
        progresion: "N2",
      }),
    ).toBe(false);
    // Las claves del prototipo de un objeto no son pasos, en ningún grupo.
    for (const clave of [
      "constructor",
      "toString",
      "__proto__",
      "hasOwnProperty",
    ]) {
      expect(valida({ progresion: clave }), clave).toBe(false);
      expect(
        valida({
          grupo: "intencion-comunicativa",
          prioridad: "normal",
          progresion: clave,
        }),
        clave,
      ).toBe(false);
    }
  });
  it("una ficha con el hermano dice qué hace él", () => {
    expect(valida({ conQuien: "hermano" })).toBe(false);
    expect(
      valida({
        conQuien: "hermano",
        tuLinea: dos("Al hermano: «Igualito que yo».", "To the sibling: “Just like me.”"),
      }),
    ).toBe(true);
    // El hermano tiene que aparecer en las DOS caras.
    expect(
      valida({
        conQuien: "hermano",
        tuLinea: dos("Al hermano: «Igualito que yo».", "“Just like me.”"),
      }),
    ).toBe(false);
  });
  it("el origen es trazable y cuadra con su tipo", () => {
    expect(
      valida({
        origen: {
          de: "mirada",
          refs: ["mirada:dos-juguetes-iguales", "anexo:B-A1"],
        },
      }),
    ).toBe(true);
    expect(valida({ origen: { de: "mirada", refs: ["anexo:B-A1"] } })).toBe(
      false,
    );
    expect(valida({ origen: { de: "nueva", refs: ["habla:x"] } })).toBe(false);
    expect(valida({ origen: { de: "fusion", refs: ["habla:x"] } })).toBe(false);
    expect(
      valida({ origen: { de: "fusion", refs: ["habla:x", "habla:y"] } }),
    ).toBe(true);
    expect(valida({ origen: { de: "nueva", refs: ["anexo:Z-A1"] } })).toBe(
      false,
    );
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
    expect(
      BibliotecaFichasSchema.safeParse(biblioteca(REPARTO_VALIDO)).success,
    ).toBe(true);
  });
  it("menos de veinte fichas no alcanza (calidad sobre cantidad, pero con piso)", () => {
    expect(
      BibliotecaFichasSchema.safeParse(
        biblioteca({ ...REPARTO_VALIDO, imitacion: 4 }),
      ).success,
    ).toBe(false);
  });
  it("los seis grupos se trabajan a la vez: ninguno se queda sin fichas", () => {
    expect(
      BibliotecaFichasSchema.safeParse(
        biblioteca({ ...REPARTO_VALIDO, senalar: 0, juego: 7 }),
      ).success,
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
      expect(
        r.success,
        `ficha ${f.id}: ${r.success ? "" : JSON.stringify(r.error.issues)}`,
      ).toBe(true);
    }
    expect(new Set(FICHAS.map((f) => f.id)).size).toBe(FICHAS.length);
  });

  it("cada origen apunta a una cápsula que existe (las 24 del S5 o las 50 de la app)", () => {
    const mirada = new Set(CAPSULAS_CONTACTO_VISUAL.map((c) => c.id));
    const habla = new Set(CAPSULAS.map((c) => c.id));
    for (const f of FICHAS) {
      for (const r of f.origen.refs) {
        if (r.startsWith("mirada:"))
          expect(mirada.has(r.slice(7)), `${f.id} → ${r}`).toBe(true);
        if (r.startsWith("habla:"))
          expect(habla.has(r.slice(6)), `${f.id} → ${r}`).toBe(true);
      }
    }
    for (const c of CAEN_DEL_DOCUMENTO) {
      expect(mirada.has(c.id) || habla.has(c.id), `cae ${c.id}`).toBe(true);
    }
  });

  it("la biblioteca completa cumple la pirámide, y ya no queda ninguna ficha de prueba", () => {
    const r = BibliotecaFichasSchema.safeParse(FICHAS);
    expect(r.success, r.success ? "" : JSON.stringify(r.error.issues)).toBe(
      true,
    );
    expect(FICHAS.filter((f) => f.id.startsWith("prueba-"))).toEqual([]);
  });

  it("el mapa quedó ejecutado: cada una de las 74 aparece exactamente una vez (en una ficha o en las que caen)", () => {
    const todas = [
      ...CAPSULAS_CONTACTO_VISUAL.map((c) => `mirada:${c.id}`),
      ...CAPSULAS.map((c) => `habla:${c.id}`),
    ];
    const mirada = new Set(CAPSULAS_CONTACTO_VISUAL.map((c) => c.id));
    const usos = [
      ...FICHAS.flatMap((f) =>
        f.origen.refs.filter((r) => !r.startsWith("anexo:")),
      ),
      ...CAEN_DEL_DOCUMENTO.map((c) =>
        mirada.has(c.id) ? `mirada:${c.id}` : `habla:${c.id}`,
      ),
    ];
    expect(todas).toHaveLength(CAPSULAS_DEL_MAPA);
    expect([...usos].sort()).toEqual([...todas].sort());
  });
});

describe("el documento y los textos no se quedan atrás de la biblioteca", () => {
  it("docs/LA-PIRAMIDE.html está regenerado: cada ficha, con su id y su «Funcionó si», y ninguna de más", () => {
    const html = leer("docs/LA-PIRAMIDE.html");
    expect(html.split('<article class="ficha"').length - 1).toBe(FICHAS.length);
    for (const f of FICHAS) {
      expect(html, `falta la ficha ${f.id} (¿se corrió pnpm gen:piramide?)`).toContain(`id="${f.id}"`);
      expect(html, `la ficha ${f.id} cambió y el documento no (¿pnpm gen:piramide?)`).toContain(esc(f.funcionoSi.es));
    }
  });

  it("el manual y la guía dicen cuántas fichas hay, y el reparto por grupo, como la biblioteca", () => {
    const manual = leer("docs/MANUAL-DE-USO.md").replace(/\s+/g, " ");
    expect(manual).toContain(`**${FICHAS.length} fichas de actividad**`);
    for (const g of GRUPOS) {
      const n = FICHAS.filter((f) => f.grupo === g).length;
      expect(manual, `reparto de ${g} en el manual`).toContain(`${NOMBRE_GRUPO[g].toLowerCase()} ${n}`);
    }
    const guia = leer("docs/GUIA-DE-PRUEBA.html").replace(/\s+/g, " ");
    expect(guia).toContain(`las ${FICHAS.length} fichas`);
  });
});

describe("las fichas en los dos idiomas (S8)", () => {
  it("cada ficha trae sus dos caras: mismos pasos, en inglés distinto del español y sin huérfanas", async () => {
    const { FICHAS_EN } = await import("@content/fichas-en/index.ts");
    const ids = new Set(FICHAS.map((f) => f.id));
    for (const id of Object.keys(FICHAS_EN)) expect(ids.has(id), `ficha huérfana en fichas-en: ${id}`).toBe(true);
    expect(Object.keys(FICHAS_EN)).toHaveLength(FICHAS.length);
    for (const f of FICHAS) {
      const en = FICHAS_EN[f.id];
      expect(en?.haz.length, `${f.id}: pasos`).toBe(f.haz.length);
      expect(en?.tenALaMano.length, `${f.id}: a la mano`).toBe(f.tenALaMano.length);
      expect(f.titulo.en, f.id).not.toBe(f.titulo.es);
      expect(f.tuLinea.en, f.id).not.toBe(f.tuLinea.es);
      for (const campo of ["titulo", "tuLinea", "esperaVer", "funcionoSi", "siNoPasa"] as const) {
        expect(f[campo].en, `${f.id}.${campo}`).not.toMatch(/\n/);
        // En inglés no queda español de relleno: ni «él», ni «tú», ni signos de apertura.
        expect(f[campo].en, `${f.id}.${campo}`).not.toMatch(/[¿¡«»]|\b(él|tú|mamá)\b/i);
      }
    }
  });

  it("el inglés habla del niño en neutro y del hermano como «sibling»", async () => {
    for (const f of FICHAS) {
      const todo = [f.titulo.en, ...f.tenALaMano.map((t) => t.en), ...f.haz.map((t) => t.en), f.tuLinea.en, f.esperaVer.en, f.funcionoSi.en, f.siNoPasa.en].join(" ");
      expect(todo, f.id).not.toMatch(/\b(kid|kids|toddler|baby|patient|brother|sister)\b/i);
    }
  });

  it("los rótulos en inglés tienen exactamente las mismas claves que los de español", async () => {
    const en = await import("@content/chrome-documentos-en.ts");
    const { DESCRIPCION_ETAPA, NOMBRE_ETAPA, NOMBRE_MOMENTO, NOMBRE_TECNICA, NOMBRE_TECNICA_FICHA, DESCRIPCION_GRUPO } = await import("@content/schema");
    const claves = (o: object) => Object.keys(o).sort();
    expect(claves(en.NOMBRE_GRUPO_EN)).toEqual(claves(NOMBRE_GRUPO));
    expect(claves(en.DESCRIPCION_GRUPO_EN)).toEqual(claves(DESCRIPCION_GRUPO));
    expect(claves(en.NOMBRE_MOMENTO_EN)).toEqual(claves(NOMBRE_MOMENTO));
    expect(claves(en.NOMBRE_TECNICA_FICHA_EN)).toEqual(claves(NOMBRE_TECNICA_FICHA));
    expect(claves(en.NOMBRE_ETAPA_EN)).toEqual(claves(NOMBRE_ETAPA));
    expect(claves(en.DESCRIPCION_ETAPA_EN)).toEqual(claves(DESCRIPCION_ETAPA));
    expect(claves(en.NOMBRE_TECNICA_EN)).toEqual(claves(NOMBRE_TECNICA));
    for (const g of GRUPOS) expect(claves(en.PROGRESIONES_EN[g]), `pasos de ${g}`).toEqual(claves(PROGRESIONES[g]));
  });

  it("las cápsulas de contacto visual traen sus dos caras y ninguna huérfana", async () => {
    const { CONTACTO_VISUAL_EN } = await import("@content/contacto-visual-en/index.ts");
    const ids = new Set(CAPSULAS_CONTACTO_VISUAL.map((c) => c.id));
    for (const id of Object.keys(CONTACTO_VISUAL_EN)) expect(ids.has(id), `huérfana: ${id}`).toBe(true);
    for (const c of CAPSULAS_CONTACTO_VISUAL) {
      expect(c.titulo.en, c.id).not.toBe(c.titulo.es);
      expect(c.explicacion.en, c.id).not.toBe(c.explicacion.es);
      expect(c.guion.en, c.id).not.toMatch(/\n|[¿¡«»]/);
      expect(c.queNoHacer.en, c.id).not.toMatch(/[¿¡«»]/);
    }
  });

  it("los documentos salen en los dos idiomas con paridad: cada texto en español tiene su hermano en inglés", () => {
    for (const ruta of ["docs/LA-PIRAMIDE.html", "docs/CATALOGO-CAPSULAS.html"]) {
      const html = leer(ruta);
      // Solo el cuerpo (el CSS menciona los selectores data-l).
      const cuerpo = html.slice(html.indexOf("<body>"));
      const orden = [...cuerpo.matchAll(/data-l="(es|en)"/g)].map((m) => m[1]);
      expect(orden.length, ruta).toBeGreaterThan(100);
      orden.forEach((l, i) => expect(l, `${ruta}: desfase de idiomas en el texto nº ${i}`).toBe(i % 2 === 0 ? "es" : "en"));
      expect(html, ruta).toContain('<button type="button" data-idioma="en"');
      expect(html, ruta).toContain("habla:v1:ajustes");
    }
  });

  it("/mirada sirve el documento bilingüe (el que copia copiar-documentos.mjs)", () => {
    const mirada = leer("docs/LA-PIRAMIDE.html");
    expect(mirada).toContain("The pyramid, at home");
    expect(mirada).toContain("La pirámide, en casa");
  });
});
