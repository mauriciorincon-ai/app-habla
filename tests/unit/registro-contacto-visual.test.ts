import { describe, expect, it } from "vitest";
import {
  EntradaRegistroSchema,
  REGISTRO_VERSION,
  RegistroExportSchema,
  type EntradaRegistro,
} from "@content/registro-contacto-visual";

// El contrato del archivo que «Guardar registro» descarga (S5). Lo que se prueba aquí es la
// FORMA; que el documento real produzca esta forma lo prueba el e2e que descarga el archivo.

const entrada: EntradaRegistro = {
  id: "e1",
  fecha: "2026-09-06",
  hora: "17:30",
  capsulaId: "prueba-cosquillas-con-pausa",
  a: {
    alturaYDeFrente: "lo-hice",
    seguiLoQueEligioYEspere: "a-medias",
    pausaOImitacionSinPedirNada: "lo-hice",
  },
  b: {
    miroDeMiAlJugueteYDeVuelta: true,
    meBuscoParaQueSiguiera: false,
    meMostroOSenaloAlgo: false,
    loHizoConOtraPersona: false,
    ejemplo: "hoy abrió los brazos en la pausa",
  },
  c: { comoEstuvo: "a-gusto", paramos: false },
};

describe("registro de contacto visual — formato", () => {
  it("una entrada completa valida", () => {
    expect(EntradaRegistroSchema.safeParse(entrada).success).toBe(true);
  });

  it("no hay puntaje del niño: el bloque B es marcar, no contar", () => {
    const r = EntradaRegistroSchema.safeParse({
      ...entrada,
      b: { ...entrada.b, miroDeMiAlJugueteYDeVuelta: 3 },
    });
    expect(r.success).toBe(false);
  });

  it("la fecha es local y con forma AAAA-MM-DD; la hora HH:MM", () => {
    expect(
      EntradaRegistroSchema.safeParse({ ...entrada, fecha: "6/9/2026" }).success,
    ).toBe(false);
    expect(
      EntradaRegistroSchema.safeParse({ ...entrada, hora: "5pm" }).success,
    ).toBe(false);
  });

  it("el export lleva versión, fecha de generación y las entradas", () => {
    expect(
      RegistroExportSchema.safeParse({
        version: REGISTRO_VERSION,
        generado: "2026-09-06T22:30:00.000Z",
        entradas: [entrada],
      }).success,
    ).toBe(true);
    expect(
      RegistroExportSchema.safeParse({
        version: 2,
        generado: "2026-09-06T22:30:00.000Z",
        entradas: [],
      }).success,
    ).toBe(false);
  });
});
