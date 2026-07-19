import { beforeEach, describe, expect, it } from "vitest";
import {
  borrarTodo,
  CLAVES,
  guardarAjustes,
  guardarPerfil,
  guardarProgreso,
  leerAjustes,
  leerPerfil,
  leerProgreso,
} from "@/lib/storage/local";
import { AJUSTES_DEFECTO, PROGRESO_INICIAL } from "@/lib/storage/schemas";

describe("persistencia local (ADR 002)", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("guarda y recupera el perfil del onboarding", () => {
    guardarPerfil({ apodo: "San", temas: ["animales", "espacio"] });
    expect(leerPerfil()).toEqual({
      apodo: "San",
      temas: ["animales", "espacio"],
    });
  });

  it("el apodo es opcional: la app funciona igual sin él", () => {
    guardarPerfil({ temas: ["carros"] });
    expect(leerPerfil()).toEqual({ temas: ["carros"] });
  });

  it("sin datos guardados devuelve los valores por defecto (nunca se rompe)", () => {
    expect(leerPerfil()).toBeNull();
    expect(leerAjustes()).toEqual(AJUSTES_DEFECTO);
    expect(leerProgreso()).toEqual(PROGRESO_INICIAL);
  });

  it("un valor corrupto se elimina y se trata como ausente", () => {
    window.localStorage.setItem(CLAVES.progreso, "{esto no es json}");
    expect(leerProgreso()).toEqual(PROGRESO_INICIAL);
    expect(window.localStorage.getItem(CLAVES.progreso)).toBeNull();
  });

  it("un valor que no cumple el esquema (versión vieja) se descarta", () => {
    window.localStorage.setItem(
      CLAVES.perfil,
      JSON.stringify({ apodo: 42, temas: "todos" }),
    );
    expect(leerPerfil()).toBeNull();
    expect(window.localStorage.getItem(CLAVES.perfil)).toBeNull();
  });

  it("no guarda datos que no cumplen el esquema", () => {
    // @ts-expect-error — probamos la defensa en runtime ante un tema inválido.
    guardarPerfil({ temas: ["politica"] });
    expect(window.localStorage.getItem(CLAVES.perfil)).toBeNull();
  });

  it('"borrar todos mis datos" borra TODO lo de la app y nada más', () => {
    guardarPerfil({ apodo: "San", temas: ["mar"] });
    guardarAjustes({
      modoCalma: true,
      reducirAnimaciones: true,
      etapa: "palabras-sueltas",
      apariencia: "oscuro",
      vozFamiliar: true,
    });
    guardarProgreso({
      ...PROGRESO_INICIAL,
      historial: [{ capsulaId: "x", fecha: "2026-07-11" }],
    });
    window.localStorage.setItem("otra-app:algo", "no es mío");

    borrarTodo();

    expect(leerPerfil()).toBeNull();
    expect(leerAjustes()).toEqual(AJUSTES_DEFECTO);
    expect(leerProgreso()).toEqual(PROGRESO_INICIAL);
    expect(window.localStorage.getItem("otra-app:algo")).toBe("no es mío");
  });

  // Los ajustes guardados en el dispositivo real del usuario NO traen "apariencia" (es del S2):
  // leerlos no puede tirarlos a la basura ni dejar la app sin tema.
  it("unos ajustes viejos (sin apariencia) se leen igual y caen en 'sistema'", () => {
    window.localStorage.setItem(
      CLAVES.ajustes,
      JSON.stringify({
        modoCalma: true,
        reducirAnimaciones: false,
        etapa: "palabras-sueltas",
      }),
    );

    const ajustes = leerAjustes();
    expect(ajustes.apariencia).toBe("sistema");
    // Y lo que el padre ya había elegido sigue intacto.
    expect(ajustes.modoCalma).toBe(true);
  });

  it("las claves están versionadas (para migrar sin romper al niño)", () => {
    expect(CLAVES.perfil).toMatch(/^habla:v1:/);
    expect(CLAVES.ajustes).toMatch(/^habla:v1:/);
    expect(CLAVES.progreso).toMatch(/^habla:v1:/);
  });
});

describe("migración de progreso v1 → v2 (ADR 006): el progreso real jamás se pierde", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  // La forma EXACTA que el Sprint 1 dejó guardada en el dispositivo del usuario.
  const PROGRESO_V1 = {
    ciclo: 0,
    cicloCompletadas: [
      "recast-devuelve-la-palabra",
      "modelado-nombra-su-mundo",
    ],
    historial: [
      { capsulaId: "recast-devuelve-la-palabra", fecha: "2026-07-11" },
      { capsulaId: "modelado-nombra-su-mundo", fecha: "2026-07-12" },
    ],
    asignacionHoy: {
      fecha: "2026-07-12",
      capsulaId: "modelado-nombra-su-mundo",
    },
    asignacionAyer: {
      fecha: "2026-07-11",
      capsulaId: "recast-devuelve-la-palabra",
    },
  };

  it("migra lo completado y el historial a la etapa palabras-sueltas", () => {
    window.localStorage.setItem(CLAVES.progreso, JSON.stringify(PROGRESO_V1));

    const migrado = leerProgreso();

    expect(migrado.historial).toHaveLength(2);
    expect(migrado.porEtapa["palabras-sueltas"]?.cicloCompletadas).toEqual(
      PROGRESO_V1.cicloCompletadas,
    );
    expect(migrado.porEtapa["sonidos-e-intentos"]?.cicloCompletadas).toEqual(
      [],
    );
    // La asignación del día viaja DENTRO de su etapa (la única que existía en el S1).
    expect(migrado.porEtapa["palabras-sueltas"]?.asignacionHoy).toEqual(
      PROGRESO_V1.asignacionHoy,
    );
  });

  it("la migración se persiste: la segunda lectura ya es v2 directa", () => {
    window.localStorage.setItem(CLAVES.progreso, JSON.stringify(PROGRESO_V1));
    const primera = leerProgreso();

    const crudo = window.localStorage.getItem(CLAVES.progreso);
    expect(crudo).not.toBeNull();
    expect(JSON.parse(crudo as string)).toHaveProperty("porEtapa");
    expect(leerProgreso()).toEqual(primera);
  });

  it("lo que no es ni v1 ni v2 sí se descarta (corrupto de verdad)", () => {
    window.localStorage.setItem(
      CLAVES.progreso,
      JSON.stringify({ cualquierCosa: true }),
    );
    expect(leerProgreso()).toEqual(PROGRESO_INICIAL);
    expect(window.localStorage.getItem(CLAVES.progreso)).toBeNull();
  });

  it("los ajustes del S1 (sin etapa) leen con el default permanente palabras-sueltas", () => {
    window.localStorage.setItem(
      CLAVES.ajustes,
      JSON.stringify({ modoCalma: true, reducirAnimaciones: false }),
    );
    const ajustes = leerAjustes();
    expect(ajustes.etapa).toBe("palabras-sueltas");
    expect(ajustes.modoCalma).toBe(true);
  });
});
