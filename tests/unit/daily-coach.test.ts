import { describe, expect, it } from "vitest";
import { CAPSULAS } from "@content/capsulas";
import {
  BibliotecaSchema,
  ETAPAS,
  TECNICAS,
  type Capsula,
  type Etapa,
} from "@content/schema";
import {
  claveFechaLocal,
  marcarCompletada,
  seleccionarCapsula,
} from "@/lib/coach/daily";
import { PROGRESO_INICIAL, type Progreso } from "@/lib/storage/schemas";

// La biblioteca real por etapa (el motor solo sirve cápsulas de la etapa activa — ADR 006).
const PS: Etapa = "palabras-sueltas";
const capsulasDe = (etapa: Etapa) => CAPSULAS.filter((c) => c.etapa === etapa);

describe("biblioteca de cápsulas: la estrella", () => {
  it("cumple el esquema completo", () => {
    const parsed = BibliotecaSchema.safeParse(CAPSULAS);
    expect(parsed.success).toBe(true);
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

describe("daily-coach: la cápsula de hoy (dentro de la etapa activa)", () => {
  const HOY = "2026-07-11";
  const MAÑANA = "2026-07-12";

  it("usa la fecha LOCAL, no UTC (en Colombia el día no cambia a las 7 p. m.)", () => {
    // 2026-07-11 a las 20:00 hora local sigue siendo el 11, aunque en UTC ya sea el 12.
    const nocheEnColombia = new Date(2026, 6, 11, 20, 0, 0);
    expect(claveFechaLocal(nocheEnColombia)).toBe("2026-07-11");
  });

  it("la misma fecha siempre da la misma cápsula (determinista)", () => {
    const a = seleccionarCapsula(HOY, PROGRESO_INICIAL, CAPSULAS, PS);
    const b = seleccionarCapsula(HOY, PROGRESO_INICIAL, CAPSULAS, PS);
    expect(a.capsula.id).toBe(b.capsula.id);
  });

  it("solo sirve cápsulas de la etapa activa", () => {
    for (const etapa of ETAPAS) {
      if (capsulasDe(etapa).length === 0) continue;
      const seleccion = seleccionarCapsula(
        HOY,
        PROGRESO_INICIAL,
        CAPSULAS,
        etapa,
      );
      expect(seleccion.capsula.etapa).toBe(etapa);
    }
  });

  it("ningún día se queda sin respuesta", () => {
    let progreso: Progreso = PROGRESO_INICIAL;
    for (let dia = 1; dia <= 60; dia++) {
      const fecha = claveFechaLocal(new Date(2026, 6, dia));
      const seleccion = seleccionarCapsula(fecha, progreso, CAPSULAS, PS);
      expect(seleccion.capsula).toBeDefined();
      progreso = seleccion.progreso;
    }
  });

  it("la cápsula del día no cambia al recargar ni al completarla", () => {
    const primera = seleccionarCapsula(HOY, PROGRESO_INICIAL, CAPSULAS, PS);

    // Recarga: se vuelve a seleccionar con el progreso ya guardado.
    const recarga = seleccionarCapsula(HOY, primera.progreso, CAPSULAS, PS);
    expect(recarga.capsula.id).toBe(primera.capsula.id);

    // Se completa y se vuelve a entrar el mismo día.
    const completado = marcarCompletada(
      HOY,
      primera.capsula.id,
      PS,
      primera.progreso,
    );
    const despues = seleccionarCapsula(HOY, completado, CAPSULAS, PS);
    expect(despues.capsula.id).toBe(primera.capsula.id);
    expect(despues.completada).toBe(true);
  });

  it("no repite cápsulas hasta agotar la etapa", () => {
    const deEtapa = capsulasDe(PS);
    let progreso: Progreso = PROGRESO_INICIAL;
    const vistas: string[] = [];

    for (let dia = 0; dia < deEtapa.length; dia++) {
      const fecha = claveFechaLocal(new Date(2026, 6, 11 + dia));
      const seleccion = seleccionarCapsula(fecha, progreso, CAPSULAS, PS);
      vistas.push(seleccion.capsula.id);
      progreso = marcarCompletada(
        fecha,
        seleccion.capsula.id,
        PS,
        seleccion.progreso,
      );
    }

    expect(new Set(vistas).size).toBe(deEtapa.length);
  });

  it("al agotar la etapa empieza un ciclo nuevo DE ESA etapa, sin borrar el historial", () => {
    const deEtapa = capsulasDe(PS);
    let progreso: Progreso = PROGRESO_INICIAL;
    for (let dia = 0; dia < deEtapa.length; dia++) {
      const fecha = claveFechaLocal(new Date(2026, 6, 11 + dia));
      const seleccion = seleccionarCapsula(fecha, progreso, CAPSULAS, PS);
      progreso = marcarCompletada(
        fecha,
        seleccion.capsula.id,
        PS,
        seleccion.progreso,
      );
    }
    expect(progreso.porEtapa[PS]?.ciclo).toBe(0);
    expect(progreso.historial).toHaveLength(deEtapa.length);

    const fechaSiguiente = claveFechaLocal(
      new Date(2026, 6, 11 + deEtapa.length),
    );
    const nueva = seleccionarCapsula(fechaSiguiente, progreso, CAPSULAS, PS);

    expect(nueva.progreso.porEtapa[PS]?.ciclo).toBe(1);
    expect(nueva.progreso.porEtapa[PS]?.cicloCompletadas).toHaveLength(0);
    expect(nueva.progreso.historial).toHaveLength(deEtapa.length); // el historial NO se borra
    expect(nueva.completada).toBe(false);
    // Las otras etapas ni se enteraron.
    expect(nueva.progreso.porEtapa["sonidos-e-intentos"]?.ciclo).toBe(0);
  });

  it("no repite mañana la cápsula que hoy quedó sin completar", () => {
    const hoy = seleccionarCapsula(HOY, PROGRESO_INICIAL, CAPSULAS, PS);
    // No se completa: al día siguiente debería proponer otra cosa.
    const mañana = seleccionarCapsula(MAÑANA, hoy.progreso, CAPSULAS, PS);
    expect(mañana.capsula.id).not.toBe(hoy.capsula.id);
  });

  it("completar es idempotente (dos toques no ensucian el historial)", () => {
    const seleccion = seleccionarCapsula(HOY, PROGRESO_INICIAL, CAPSULAS, PS);
    const unaVez = marcarCompletada(
      HOY,
      seleccion.capsula.id,
      PS,
      seleccion.progreso,
    );
    const dosVeces = marcarCompletada(HOY, seleccion.capsula.id, PS, unaVez);

    expect(dosVeces.historial).toHaveLength(1);
    expect(dosVeces.porEtapa[PS]?.cicloCompletadas).toHaveLength(1);
  });

  it("si la cápsula asignada desaparece de la biblioteca, reasigna sin romperse", () => {
    const progreso: Progreso = {
      ...PROGRESO_INICIAL,
      asignacionHoy: {
        fecha: HOY,
        capsulaId: "cápsula-que-ya-no-existe",
        etapa: PS,
      },
    };
    const seleccion = seleccionarCapsula(HOY, progreso, CAPSULAS, PS);
    expect(CAPSULAS.map((c) => c.id)).toContain(seleccion.capsula.id);
  });

  it("una etapa sin cápsulas es un error de programación, no una pantalla rota", () => {
    expect(() => seleccionarCapsula(HOY, PROGRESO_INICIAL, [], PS)).toThrow(
      /etapa/,
    );
  });
});

describe("etapas como motor (ADR 006)", () => {
  const HOY = "2026-07-11";

  // Biblioteca sintética con las tres etapas — el motor no depende del contenido real.
  const capsula = (id: string, etapa: Etapa): Capsula => ({
    id,
    etapa,
    tecnica: "modelado",
    titulo: `Cápsula ${id}`,
    explicacion: "Explicación de prueba con el largo suficiente.",
    guion: "Guion de prueba.",
    actividad: { texto: "Actividad de prueba.", conPantalla: false },
    fuente: "Fuente sintética de prueba (unit).",
  });
  const BIBLIOTECA: Capsula[] = [
    capsula("s1", "sonidos-e-intentos"),
    capsula("s2", "sonidos-e-intentos"),
    capsula("p1", "palabras-sueltas"),
    capsula("p2", "palabras-sueltas"),
    capsula("p3", "palabras-sueltas"),
    capsula("f1", "primeras-frases"),
    capsula("f2", "primeras-frases"),
  ];

  it("cambiar de etapa re-hace la cápsula de hoy en la etapa nueva", () => {
    const enPalabras = seleccionarCapsula(
      HOY,
      PROGRESO_INICIAL,
      BIBLIOTECA,
      PS,
    );
    expect(enPalabras.capsula.etapa).toBe(PS);

    const enSonidos = seleccionarCapsula(
      HOY,
      enPalabras.progreso,
      BIBLIOTECA,
      "sonidos-e-intentos",
    );
    expect(enSonidos.capsula.etapa).toBe("sonidos-e-intentos");
  });

  it("volver a la etapa original EL MISMO DÍA devuelve la misma cápsula", () => {
    const primera = seleccionarCapsula(HOY, PROGRESO_INICIAL, BIBLIOTECA, PS);
    const enOtra = seleccionarCapsula(
      HOY,
      primera.progreso,
      BIBLIOTECA,
      "primeras-frases",
    );
    const deVuelta = seleccionarCapsula(HOY, enOtra.progreso, BIBLIOTECA, PS);
    expect(deVuelta.capsula.id).toBe(primera.capsula.id);
  });

  it("el historial y lo completado sobreviven al cambio de etapa", () => {
    const primera = seleccionarCapsula(HOY, PROGRESO_INICIAL, BIBLIOTECA, PS);
    const completado = marcarCompletada(
      HOY,
      primera.capsula.id,
      PS,
      primera.progreso,
    );

    const enOtra = seleccionarCapsula(
      HOY,
      completado,
      BIBLIOTECA,
      "sonidos-e-intentos",
    );
    expect(enOtra.progreso.historial).toHaveLength(1);
    expect(enOtra.progreso.porEtapa[PS]?.cicloCompletadas).toContain(
      primera.capsula.id,
    );
  });

  it("agotar una etapa no resetea el ciclo de las otras", () => {
    let progreso: Progreso = PROGRESO_INICIAL;
    // Agota las 2 de sonidos-e-intentos.
    for (let dia = 0; dia < 3; dia++) {
      const fecha = claveFechaLocal(new Date(2026, 6, 11 + dia));
      const s = seleccionarCapsula(
        fecha,
        progreso,
        BIBLIOTECA,
        "sonidos-e-intentos",
      );
      progreso = marcarCompletada(
        fecha,
        s.capsula.id,
        "sonidos-e-intentos",
        s.progreso,
      );
    }
    expect(progreso.porEtapa["sonidos-e-intentos"]?.ciclo).toBe(1);
    expect(progreso.porEtapa[PS]?.ciclo).toBe(0);
    expect(progreso.porEtapa["primeras-frases"]?.ciclo).toBe(0);
  });
});
