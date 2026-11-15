import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { MAX_INTERESES } from "@/lib/bandeja/cuentos-del-mes";
import { CUENTOS_VACIO, type CuentosGuardados } from "@/lib/cuentos/estado";
import { diasEntre, recordatorioCuentos, ultimoLote } from "@/lib/bandeja/recordatorio";
import { interesesDe, moverIntereses, unirSinRepetir } from "@/lib/su-mundo/intereses";
import {
  CLAVES,
  guardarCuentos,
  guardarPerfil,
  leerCuentos,
  leerPerfil,
  migrarInteresesAlPerfil,
} from "@/lib/storage/local";
import { AjustesSchema, PerfilSchema, type Perfil } from "@/lib/storage/schemas";

// S14 (ADR-026): sus intereses en UN lugar (el perfil), la migración del «Le gusta» de Cuentos sin
// pérdida, el recordatorio de los cuentos del mes (fecha = perilla, regla 23) y la reactividad de su
// mundo cuando el adulto cambia la meta. Perfiles inventados.

const conLeGusta = (intereses: string[]): CuentosGuardados => ({ ...CUENTOS_VACIO, intereses });

describe("intereses en un solo lugar: la migración del «Le gusta»", () => {
  const perfil: Perfil = { temas: ["mar"] };

  it("pasa lo de «Le gusta» al perfil sin perder nada, y deja «Le gusta» vacío", () => {
    const r = moverIntereses(perfil, conLeGusta(["burbujas", "trenes"]));
    expect(r.perfil?.otrasCosas).toEqual(["burbujas", "trenes"]);
    expect(r.cuentos.intereses).toEqual([]);
    expect(r.movidos).toBe(2);
    expect(() => PerfilSchema.parse(r.perfil)).not.toThrow();
  });

  it("lo que ya estaba en el perfil va primero, y no se repite (sin distinguir mayúsculas)", () => {
    const r = moverIntereses({ ...perfil, otrasCosas: ["Burbujas"] }, conLeGusta(["burbujas", "lluvia"]));
    expect(r.perfil?.otrasCosas).toEqual(["Burbujas", "lluvia"]);
    expect(r.cuentos.intereses).toEqual([]);
  });

  it("es idempotente: correrla dos veces da lo mismo que una", () => {
    const una = moverIntereses(perfil, conLeGusta(["burbujas"]));
    const dos = moverIntereses(una.perfil, una.cuentos);
    expect(dos.perfil).toEqual(una.perfil);
    expect(dos.cuentos).toEqual(una.cuentos);
    expect(dos.movidos).toBe(0);
  });

  it("sin perfil no mueve nada: «Le gusta» se queda intacto", () => {
    const r = moverIntereses(null, conLeGusta(["burbujas"]));
    expect(r.perfil).toBeNull();
    expect(r.cuentos.intereses).toEqual(["burbujas"]);
  });

  it("si no cabe todo en el perfil, lo que no cabe se queda en Cuentos (nada se pierde)", () => {
    const ocho = ["a uno", "a dos", "a tres", "a cuatro", "a cinco", "a seis", "a siete", "a ocho"];
    const r = moverIntereses({ ...perfil, otrasCosas: ocho }, conLeGusta(["burbujas"]));
    expect(r.perfil?.otrasCosas).toEqual(ocho);
    expect(r.cuentos.intereses).toEqual(["burbujas"]);
  });

  it("lo que le encanta, para el pedido: primero lo suyo, luego sus temas, con el tope del contrato", () => {
    const p: Perfil = { temas: ["dinosaurios", "mar"], otrasCosas: ["burbujas"] };
    expect(interesesDe(p, "es")).toEqual(["burbujas", "Dinosaurios", "El mar"]);
    expect(interesesDe(p, "en")[0]).toBe("burbujas");
    expect(interesesDe(null, "es")).toEqual([]);
    const muchos: Perfil = { temas: ["mar", "espacio", "carros"], otrasCosas: ["a uno", "a dos", "a tres", "a cuatro"] };
    expect(interesesDe(muchos, "es").length).toBe(MAX_INTERESES);
    expect(unirSinRepetir(["a"], ["A", "b"])).toEqual(["a", "b"]);
  });

  describe("en el almacenamiento del aparato", () => {
    beforeEach(() => window.localStorage.clear());

    it("migrarInteresesAlPerfil mueve el «Le gusta» guardado y es idempotente", () => {
      guardarPerfil({ temas: ["espacio"] });
      guardarCuentos(conLeGusta(["burbujas", "lluvia"]));
      migrarInteresesAlPerfil();
      migrarInteresesAlPerfil();
      expect(leerPerfil()?.otrasCosas).toEqual(["burbujas", "lluvia"]);
      expect(leerCuentos().intereses).toEqual([]);
    });

    it("sin perfil, el «Le gusta» guardado no se toca", () => {
      guardarCuentos(conLeGusta(["burbujas"]));
      migrarInteresesAlPerfil();
      expect(window.localStorage.getItem(CLAVES.perfil)).toBeNull();
      expect(leerCuentos().intereses).toEqual(["burbujas"]);
    });
  });
});

describe("el recordatorio de los cuentos del mes (tarjeta del adulto en Hoy)", () => {
  const lote = (importado: string): CuentosGuardados => ({
    ...CUENTOS_VACIO,
    cuentos: [
      {
        cuento: { id: "c1" } as never,
        estado: "aprobado",
        lote: "lote-1",
        importado,
      },
    ],
  });

  it("si nunca se importó un lote, la tarjeta aparece", () => {
    expect(recordatorioCuentos("2026-11-16", CUENTOS_VACIO)).toEqual({ motivo: "nunca" });
  });

  it("con el último lote de hace 30 días o más, aparece; con menos, no", () => {
    expect(recordatorioCuentos("2026-11-16", lote("2026-10-17"))).toEqual({ motivo: "vencido", dias: 30 });
    expect(recordatorioCuentos("2026-11-16", lote("2026-10-18"))).toBeNull();
  });

  it("«Ahora no» la esconde ese día y vuelve al siguiente", () => {
    expect(recordatorioCuentos("2026-11-16", CUENTOS_VACIO, "2026-11-16")).toBeNull();
    expect(recordatorioCuentos("2026-11-17", CUENTOS_VACIO, "2026-11-16")).toEqual({ motivo: "nunca" });
  });

  it("el último lote es el más reciente, y los días cruzan meses y años bien", () => {
    const dos = lote("2026-09-01");
    dos.cuentos.push({ ...dos.cuentos[0]!, importado: "2026-11-01" });
    expect(ultimoLote(dos)).toBe("2026-11-01");
    expect(diasEntre("2026-12-31", "2027-01-01")).toBe(1);
  });

  it("el día pospuesto vive en Ajustes y los ajustes de antes migran solos (null)", () => {
    expect(AjustesSchema.parse({}).recordatorioPospuesto).toBeNull();
    expect(AjustesSchema.parse({ recordatorioPospuesto: "2026-11-16" }).recordatorioPospuesto).toBe("2026-11-16");
    expect(AjustesSchema.parse({ recordatorioPospuesto: "ayer" }).recordatorioPospuesto).toBeNull();
  });
});

describe("su mundo es reactivo: cambiar la meta cambia lo que propone, sin recargar", () => {
  beforeEach(() => window.localStorage.clear());

  it("useSuMundo sigue a la meta guardada", async () => {
    const { guardarObjetivoEnStore, borrarObjetivoEnStore } = await import("@/components/estado-local");
    const { useSuMundo } = await import("@/components/juego/use-su-mundo");
    const { result } = renderHook(() => useSuMundo("globo"));
    act(() => guardarObjetivoEnStore("colores"));
    expect(result.current.palabrasAModelar).toEqual(["rojo", "azul", "amarillo", "verde"]);
    act(() => guardarObjetivoEnStore("acciones"));
    expect(result.current.palabrasAModelar).toContain("comer");
    act(() => borrarObjetivoEnStore());
    expect(result.current.palabrasAModelar).toEqual([]);
  });
});
