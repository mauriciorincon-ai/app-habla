import { beforeEach, describe, expect, it } from "vitest";
import {
  acuerdo,
  CONTEO_VACIO,
  leerConteo,
  MINIMO_PARA_DECIR,
  registrarRonda,
  rondaGemelas,
} from "@/lib/reconocer/conteo";
import { remuestrear } from "@/lib/voice/escucha";
import { borrarTodo, CLAVES } from "@/lib/storage/local";

describe("el conteo 2×2 del reconocedor (S11)", () => {
  beforeEach(() => window.localStorage.clear());

  it("son cuatro números locales y nada más", () => {
    expect(leerConteo()).toEqual(CONTEO_VACIO);
    registrarRonda(true, true);
    registrarRonda(true, false);
    registrarRonda(false, true);
    registrarRonda(false, false);
    registrarRonda(false, false);
    expect(leerConteo()).toEqual({ siSi: 1, siNo: 1, noSi: 1, noNo: 2 });
    const guardado = JSON.parse(window.localStorage.getItem(CLAVES.coincidencias)!);
    expect(Object.keys(guardado).sort()).toEqual(["noNo", "noSi", "siNo", "siSi"]);
  });

  it("un valor corrupto vuelve a cero, no rompe", () => {
    window.localStorage.setItem(CLAVES.coincidencias, "{mal");
    expect(leerConteo()).toEqual(CONTEO_VACIO);
  });

  it("con menos de 20 rondas no se puede decir; con 20 da el acuerdo", () => {
    expect(acuerdo({ siSi: 5, siNo: 0, noSi: 0, noNo: 5 })).toBeNull();
    expect(MINIMO_PARA_DECIR).toBe(20);
    expect(acuerdo({ siSi: 10, siNo: 5, noSi: 0, noNo: 5 })).toBe(0.75);
  });

  it('«Borrar mis datos» lo borra', async () => {
    registrarRonda(true, true);
    await borrarTodo();
    expect(window.localStorage.getItem(CLAVES.coincidencias)).toBeNull();
  });
});

describe("remuestrear (de la tasa del aparato a la del modelo)", () => {
  it("la misma tasa devuelve el mismo arreglo", () => {
    const x = new Float32Array([0.1, 0.2]);
    expect(remuestrear(x, 16000, 16000)).toBe(x);
  });
  it("48 kHz → 16 kHz deja un tercio de las muestras y conserva una rampa", () => {
    const x = Float32Array.from({ length: 480 }, (_, i) => i / 480);
    const y = remuestrear(x, 48000, 16000);
    expect(y.length).toBe(160);
    expect(y[80]).toBeCloseTo(240 / 480, 3);
  });
});

describe("la ronda de gemelas en el 2×2 (S11)", () => {
  it("nada pasó: no se cuenta", () => {
    expect(rondaGemelas(null, null)).toBeNull();
  });
  it("el «quizás» era el lado que el adulto marcó: coincidió y juzgó que sí", () => {
    expect(rondaGemelas("a", "a")).toEqual({ coincidio: true, adultoSi: true });
  });
  it("el «quizás» era un lado y el adulto marcó el OTRO: coincidió el aviso, el adulto no lo confirmó", () => {
    expect(rondaGemelas("a", "b")).toEqual({ coincidio: true, adultoSi: false });
  });
  it("el «quizás» salió y el adulto no marcó nada", () => {
    expect(rondaGemelas("b", null)).toEqual({ coincidio: true, adultoSi: false });
  });
  it("no hubo «quizás» pero el adulto marcó un lado", () => {
    expect(rondaGemelas(null, "a")).toEqual({ coincidio: false, adultoSi: true });
  });
});
