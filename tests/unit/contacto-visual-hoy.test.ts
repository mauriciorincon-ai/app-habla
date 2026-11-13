import { describe, expect, it } from "vitest";
import { CAPSULAS_CONTACTO_VISUAL } from "@content/contacto-visual";
import { NIVELES_CONTACTO_VISUAL } from "@content/schema";
import {
  MINIMO_DEL_GRUPO,
  contactoVisualDeHoy,
  grupoDelNivel,
  indiceDeLaSemana,
} from "@/lib/coach/contacto-visual-hoy";
import { claveFechaLocal } from "@/lib/coach/daily";
import { AJUSTES_DEFECTO, AjustesSchema } from "@/lib/storage/schemas";

// La fecha es la perilla (regla 23): ninguno de estos tests mira el reloj.
const dias = (desde: string, n: number) => {
  const [a, m, d] = desde.split("-").map(Number);
  return Array.from({ length: n }, (_, i) => claveFechaLocal(new Date(a, m - 1, d + i)));
};

describe("contacto visual de hoy (S9)", () => {
  it("el día de la semana va de lunes (0) a domingo (6)", () => {
    expect(indiceDeLaSemana("2026-11-09")).toBe(0); // lunes
    expect(indiceDeLaSemana("2026-11-15")).toBe(6); // domingo
  });

  it("es estable: la misma fecha y el mismo nivel dan siempre la misma actividad", () => {
    for (const nivel of NIVELES_CONTACTO_VISUAL) {
      const a = contactoVisualDeHoy("2026-11-12", nivel, CAPSULAS_CONTACTO_VISUAL);
      const b = contactoVisualDeHoy("2026-11-12", nivel, CAPSULAS_CONTACTO_VISUAL);
      expect(a?.id).toBe(b?.id);
    }
  });

  it("no repite dentro de la semana, en cada nivel y en varias semanas", () => {
    for (const nivel of NIVELES_CONTACTO_VISUAL) {
      for (const lunes of ["2026-11-09", "2026-11-16", "2026-11-23", "2026-12-28"]) {
        const ids = dias(lunes, 7).map((f) => contactoVisualDeHoy(f, nivel, CAPSULAS_CONTACTO_VISUAL)?.id);
        expect(new Set(ids).size, `${nivel} · semana de ${lunes}`).toBe(7);
      }
    }
  });

  it("el grupo del nivel cubre la semana y parte del nivel elegido", () => {
    for (const nivel of NIVELES_CONTACTO_VISUAL) {
      const grupo = grupoDelNivel(nivel, CAPSULAS_CONTACTO_VISUAL);
      expect(grupo.length).toBeGreaterThanOrEqual(MINIMO_DEL_GRUPO);
      expect(grupo.some((c) => c.nivel === nivel), nivel).toBe(true);
    }
    // n3 tiene cinco propias: las completa con los vecinos, y no hace falta llegar a los extremos.
    const g3 = grupoDelNivel("n3", CAPSULAS_CONTACTO_VISUAL);
    expect(g3.every((c) => ["n2", "n3", "n4"].includes(c.nivel))).toBe(true);
  });

  it("la semana siguiente reordena (no es la misma lista de siete)", () => {
    const sem = (lunes: string) => dias(lunes, 7).map((f) => contactoVisualDeHoy(f, "n2", CAPSULAS_CONTACTO_VISUAL)?.id);
    const distintas = ["2026-11-16", "2026-11-23", "2026-11-30"].filter((l) => sem(l).join() !== sem("2026-11-09").join());
    expect(distintas.length).toBeGreaterThan(0);
  });

  it("una biblioteca vacía no rompe: devuelve null", () => {
    expect(contactoVisualDeHoy("2026-11-12", "n1", [])).toBeNull();
  });

  it("cero pantalla y guion de adulto presente en todas las que puede servir", () => {
    for (const f of dias("2026-11-09", 14)) {
      const c = contactoVisualDeHoy(f, "n1", CAPSULAS_CONTACTO_VISUAL)!;
      expect(c.actividad.conPantalla).toBe(false);
      expect(c.guion.es.length).toBeGreaterThan(0);
      expect(c.guion.en.length).toBeGreaterThan(0);
    }
  });
});

describe("ajuste del nivel de contacto visual (S9)", () => {
  it("el defecto es n1 y un valor inválido vuelve a n1", () => {
    expect(AJUSTES_DEFECTO.nivelMirada).toBe("n1");
    expect(AjustesSchema.parse({ nivelMirada: "n9" }).nivelMirada).toBe("n1");
    expect(AjustesSchema.parse({ nivelMirada: "n4" }).nivelMirada).toBe("n4");
  });
  it("los ajustes guardados antes del S9 (sin el campo) migran solos", () => {
    const viejo = { modoCalma: true, reducirAnimaciones: false, etapa: "palabras-sueltas", apariencia: "claro", vozFamiliar: true, idioma: "en" };
    expect(AjustesSchema.parse(viejo)).toMatchObject({ ...viejo, nivelMirada: "n1" });
  });
});
