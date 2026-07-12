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
    guardarAjustes({ modoCalma: true, reducirAnimaciones: true });
    guardarProgreso({ ...PROGRESO_INICIAL, ciclo: 2 });
    window.localStorage.setItem("otra-app:algo", "no es mío");

    borrarTodo();

    expect(leerPerfil()).toBeNull();
    expect(leerAjustes()).toEqual(AJUSTES_DEFECTO);
    expect(leerProgreso()).toEqual(PROGRESO_INICIAL);
    expect(window.localStorage.getItem("otra-app:algo")).toBe("no es mío");
  });

  it("las claves están versionadas (para migrar sin romper al niño)", () => {
    expect(CLAVES.perfil).toMatch(/^habla:v1:/);
    expect(CLAVES.ajustes).toMatch(/^habla:v1:/);
    expect(CLAVES.progreso).toMatch(/^habla:v1:/);
  });
});
