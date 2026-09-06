import { describe, expect, it } from "vitest";
import { CAPSULAS_CONTACTO_VISUAL } from "@content/contacto-visual";
import {
  BibliotecaContactoVisualSchema,
  CapsulaContactoVisualSchema,
  NIVELES_CONTACTO_VISUAL,
  TECNICAS_CONTACTO_VISUAL,
  type CapsulaContactoVisual,
} from "@content/schema";

// El dominio «contacto visual» (S5): sus garantías viven en el schema y este test las demuestra
// UNA a una con fixtures — cada constraint se vio en rojo antes de darla por buena.

const base: CapsulaContactoVisual = {
  id: "x",
  dominio: "contacto-visual",
  tecnica: "hago-lo-que-el-hace",
  nivel: "n1",
  titulo: "Título",
  explicacion: "Explicación de prueba.",
  guion: "«Igual que tú.»",
  actividad: {
    texto: "Actividad de prueba.",
    duracion: "3–5 min",
    momentos: ["juego"],
    conPantalla: false,
  },
  conQuien: "mama",
  queNoHacer: "Nada raro.",
  fuente: "Halle, 1981, J Appl Behav Anal",
};

function biblioteca(n: number): CapsulaContactoVisual[] {
  // 4 técnicas × 4 niveles + 2 técnicas × 3 = 22 — reparto válido; se recorta a n.
  const out: CapsulaContactoVisual[] = [];
  TECNICAS_CONTACTO_VISUAL.forEach((tecnica, ti) => {
    const cuantas = ti < 4 ? 4 : 3;
    for (let k = 0; k < cuantas; k++) {
      const nivel = NIVELES_CONTACTO_VISUAL[(ti + k) % 6];
      out.push({
        ...base,
        id: `${tecnica}-${nivel}`,
        tecnica,
        nivel,
        conQuien: nivel === "n5" ? "otra-persona" : "mama",
      });
    }
  });
  return out.slice(0, n);
}

describe("CapsulaContactoVisualSchema — cada cápsula", () => {
  it("acepta una cápsula bien formada", () => {
    expect(CapsulaContactoVisualSchema.safeParse(base).success).toBe(true);
  });

  it("es cero pantalla por construcción: conPantalla solo puede ser false", () => {
    const r = CapsulaContactoVisualSchema.safeParse({
      ...base,
      actividad: { ...base.actividad, conPantalla: true },
    });
    expect(r.success).toBe(false);
  });

  it("la fuente va como autor · año · revista (o autor · año), sin título", () => {
    expect(
      CapsulaContactoVisualSchema.safeParse({
        ...base,
        fuente: "Field, 2001 · Kasari, 2006, J Child Psychol Psychiatry",
      }).success,
    ).toBe(true);
    // Un título colado (sin la forma «autor, año, revista») no entra.
    expect(
      CapsulaContactoVisualSchema.safeParse({
        ...base,
        fuente: "Field et al. (2001). Un título largo que nombra cosas. Revista.",
      }).success,
    ).toBe(false);
  });

  it("la duración es un momento corto escrito como «N min» o «N–M min»", () => {
    expect(
      CapsulaContactoVisualSchema.safeParse({
        ...base,
        actividad: { ...base.actividad, duracion: "media hora" },
      }).success,
    ).toBe(false);
  });

  it("el guion cabe en una línea (≤140) y el título en un titular (≤70)", () => {
    expect(
      CapsulaContactoVisualSchema.safeParse({ ...base, guion: "x".repeat(141) })
        .success,
    ).toBe(false);
    expect(
      CapsulaContactoVisualSchema.safeParse({ ...base, titulo: "x".repeat(71) })
        .success,
    ).toBe(false);
  });
});

describe("BibliotecaContactoVisualSchema — la escalera completa", () => {
  it("acepta 18–24 cápsulas con 3–4 por técnica, niveles distintos y los seis niveles", () => {
    expect(BibliotecaContactoVisualSchema.safeParse(biblioteca(22)).success).toBe(
      true,
    );
  });

  it("menos de 18 no es una biblioteca: técnicas sin escalera", () => {
    expect(BibliotecaContactoVisualSchema.safeParse(biblioteca(17)).success).toBe(
      false,
    );
  });

  it("dos cápsulas de la misma técnica en el mismo nivel son variación, no peldaño", () => {
    const b = biblioteca(22);
    b[1] = { ...b[1], nivel: b[0].nivel, conQuien: b[0].conQuien };
    expect(BibliotecaContactoVisualSchema.safeParse(b).success).toBe(false);
  });

  it("los ids son únicos", () => {
    const b = biblioteca(22);
    b[1] = { ...b[1], id: b[0].id };
    expect(BibliotecaContactoVisualSchema.safeParse(b).success).toBe(false);
  });

  it("el nivel 5 es con otra persona", () => {
    const b = biblioteca(22);
    const i = b.findIndex((c) => c.nivel === "n5");
    b[i] = { ...b[i], conQuien: "mama" };
    expect(BibliotecaContactoVisualSchema.safeParse(b).success).toBe(false);
  });
});

describe("la biblioteca real del repo", () => {
  it("cada cápsula que existe hoy cumple el schema de cápsula", () => {
    for (const c of CAPSULAS_CONTACTO_VISUAL) {
      const r = CapsulaContactoVisualSchema.safeParse(c);
      expect(r.success, `cápsula ${c.id}`).toBe(true);
    }
    expect(new Set(CAPSULAS_CONTACTO_VISUAL.map((c) => c.id)).size).toBe(
      CAPSULAS_CONTACTO_VISUAL.length,
    );
  });
  // FASE 0: la biblioteca es de prueba (3 cápsulas). La garantía de biblioteca completa
  // (BibliotecaContactoVisualSchema sobre CAPSULAS_CONTACTO_VISUAL) se activa en la fase 2.
});
