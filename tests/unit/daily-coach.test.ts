import { describe, expect, it } from "vitest";
import { CAPSULAS } from "@content/capsulas";
import { BibliotecaSchema, TECNICAS } from "@content/schema";
import {
  claveFechaLocal,
  marcarCompletada,
  seleccionarCapsula,
} from "@/lib/coach/daily";
import { PROGRESO_INICIAL, type Progreso } from "@/lib/storage/schemas";

describe("biblioteca de cápsulas: la estrella", () => {
  it("tiene al menos 14 cápsulas y todas cumplen el esquema", () => {
    const parsed = BibliotecaSchema.safeParse(CAPSULAS);
    expect(parsed.success).toBe(true);
    expect(CAPSULAS.length).toBeGreaterThanOrEqual(14);
  });

  it("no repite ids", () => {
    const ids = CAPSULAS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("cubre las cinco técnicas con evidencia", () => {
    const usadas = new Set(CAPSULAS.map((c) => c.tecnica));
    for (const tecnica of TECNICAS) {
      expect(usadas).toContain(tecnica);
    }
  });

  it("cada cápsula cita su fuente y trae un guion accionable de una línea", () => {
    for (const capsula of CAPSULAS) {
      expect(capsula.fuente.length).toBeGreaterThan(20);
      expect(capsula.guion.trim().length).toBeGreaterThan(0);
      expect(capsula.guion).not.toContain("\n");
    }
  });

  it("el microcopy respeta los anti-claims (§D): nada de terapia, diagnóstico ni plazos", () => {
    // La app es práctica de estimulación en casa, jamás terapia — y jamás promete plazos.
    const prohibidos = [
      /\bterapia\b/i,
      /\bdiagnóstic/i,
      /\bcura\b/i,
      /\ben \d+ semanas\b/i,
      /\bresultados garantizados\b/i,
    ];
    for (const capsula of CAPSULAS) {
      const texto = `${capsula.titulo} ${capsula.explicacion} ${capsula.guion} ${capsula.actividad.texto}`;
      for (const patron of prohibidos) {
        expect(texto).not.toMatch(patron);
      }
    }
  });
});

describe("daily-coach: la cápsula de hoy", () => {
  const HOY = "2026-07-11";
  const MAÑANA = "2026-07-12";

  it("usa la fecha LOCAL, no UTC (en Colombia el día no cambia a las 7 p. m.)", () => {
    // 2026-07-11 a las 20:00 hora local sigue siendo el 11, aunque en UTC ya sea el 12.
    const nocheEnColombia = new Date(2026, 6, 11, 20, 0, 0);
    expect(claveFechaLocal(nocheEnColombia)).toBe("2026-07-11");
  });

  it("la misma fecha siempre da la misma cápsula (determinista)", () => {
    const a = seleccionarCapsula(HOY, PROGRESO_INICIAL, CAPSULAS);
    const b = seleccionarCapsula(HOY, PROGRESO_INICIAL, CAPSULAS);
    expect(a.capsula.id).toBe(b.capsula.id);
  });

  it("ningún día se queda sin respuesta", () => {
    let progreso: Progreso = PROGRESO_INICIAL;
    for (let dia = 1; dia <= 60; dia++) {
      const fecha = claveFechaLocal(new Date(2026, 6, dia));
      const seleccion = seleccionarCapsula(fecha, progreso, CAPSULAS);
      expect(seleccion.capsula).toBeDefined();
      progreso = seleccion.progreso;
    }
  });

  it("la cápsula del día no cambia al recargar ni al completarla", () => {
    const primera = seleccionarCapsula(HOY, PROGRESO_INICIAL, CAPSULAS);

    // Recarga: se vuelve a seleccionar con el progreso ya guardado.
    const recarga = seleccionarCapsula(HOY, primera.progreso, CAPSULAS);
    expect(recarga.capsula.id).toBe(primera.capsula.id);

    // Se completa y se vuelve a entrar el mismo día.
    const completado = marcarCompletada(
      HOY,
      primera.capsula.id,
      primera.progreso,
    );
    const despues = seleccionarCapsula(HOY, completado, CAPSULAS);
    expect(despues.capsula.id).toBe(primera.capsula.id);
    expect(despues.completada).toBe(true);
  });

  it("no repite cápsulas hasta agotar la biblioteca", () => {
    let progreso: Progreso = PROGRESO_INICIAL;
    const vistas: string[] = [];

    for (let dia = 0; dia < CAPSULAS.length; dia++) {
      const fecha = claveFechaLocal(new Date(2026, 6, 11 + dia));
      const seleccion = seleccionarCapsula(fecha, progreso, CAPSULAS);
      vistas.push(seleccion.capsula.id);
      progreso = marcarCompletada(
        fecha,
        seleccion.capsula.id,
        seleccion.progreso,
      );
    }

    expect(new Set(vistas).size).toBe(CAPSULAS.length);
  });

  it("al agotar la biblioteca empieza un ciclo nuevo sin borrar el historial", () => {
    let progreso: Progreso = PROGRESO_INICIAL;
    for (let dia = 0; dia < CAPSULAS.length; dia++) {
      const fecha = claveFechaLocal(new Date(2026, 6, 11 + dia));
      const seleccion = seleccionarCapsula(fecha, progreso, CAPSULAS);
      progreso = marcarCompletada(
        fecha,
        seleccion.capsula.id,
        seleccion.progreso,
      );
    }
    expect(progreso.ciclo).toBe(0);
    expect(progreso.historial).toHaveLength(CAPSULAS.length);

    const fechaSiguiente = claveFechaLocal(
      new Date(2026, 6, 11 + CAPSULAS.length),
    );
    const nueva = seleccionarCapsula(fechaSiguiente, progreso, CAPSULAS);

    expect(nueva.progreso.ciclo).toBe(1);
    expect(nueva.progreso.cicloCompletadas).toHaveLength(0);
    expect(nueva.progreso.historial).toHaveLength(CAPSULAS.length); // el historial NO se borra
    expect(nueva.completada).toBe(false);
  });

  it("no repite mañana la cápsula que hoy quedó sin completar", () => {
    const hoy = seleccionarCapsula(HOY, PROGRESO_INICIAL, CAPSULAS);
    // No se completa: al día siguiente debería proponer otra cosa.
    const mañana = seleccionarCapsula(MAÑANA, hoy.progreso, CAPSULAS);
    expect(mañana.capsula.id).not.toBe(hoy.capsula.id);
  });

  it("completar es idempotente (dos toques no ensucian el historial)", () => {
    const seleccion = seleccionarCapsula(HOY, PROGRESO_INICIAL, CAPSULAS);
    const unaVez = marcarCompletada(
      HOY,
      seleccion.capsula.id,
      seleccion.progreso,
    );
    const dosVeces = marcarCompletada(HOY, seleccion.capsula.id, unaVez);

    expect(dosVeces.historial).toHaveLength(1);
    expect(dosVeces.cicloCompletadas).toHaveLength(1);
  });

  it("si la cápsula asignada desaparece de la biblioteca, reasigna sin romperse", () => {
    const progreso: Progreso = {
      ...PROGRESO_INICIAL,
      asignacionHoy: { fecha: HOY, capsulaId: "cápsula-que-ya-no-existe" },
    };
    const seleccion = seleccionarCapsula(HOY, progreso, CAPSULAS);
    expect(CAPSULAS.map((c) => c.id)).toContain(seleccion.capsula.id);
  });

  it("una biblioteca vacía es un error de programación, no una pantalla rota", () => {
    expect(() => seleccionarCapsula(HOY, PROGRESO_INICIAL, [])).toThrow(
      /vacía/,
    );
  });
});
