import { describe, expect, it } from "vitest";
import {
  crearLectorIntensidad,
  type EstadoIntensidad,
} from "@/lib/voice/intensidad";
import { framesDe, pisoDe } from "../fixtures/frames-worklet";
import * as S from "../fixtures/senales-soplo";

function jugar(juego: Float32Array): EstadoIntensidad {
  const piso = pisoDe(framesDe(S.unir([S.silencio(2)])));
  const l = crearLectorIntensidad({ pisoRuido: piso });
  let e = l.estado();
  for (const f of framesDe(juego)) e = l.procesar(f);
  return e;
}

const SUAVE = 0.02;
const FUERTE = 0.25;

describe("loudness relative to the calibration: it counts changes, never the maximum (ADR-024)", () => {
  it("soft, loud, soft, loud, soft = four changes", () => {
    const e = jugar(
      S.unir([
        S.vocal(0.8, 260, SUAVE),
        S.vocal(0.8, 260, FUERTE),
        S.vocal(0.8, 260, SUAVE),
        S.vocal(0.8, 260, FUERTE),
        S.vocal(0.8, 260, SUAVE),
      ]),
    );
    expect(e.cambios).toBe(4);
    expect(e.nivel).toBe("suave");
  });

  it("a shout held for five seconds is zero changes", () => {
    expect(jugar(S.unir([S.vocal(5, 260, FUERTE)])).cambios).toBe(0);
  });

  it("silence between soft and loud does not hide the change, and silence alone is nothing", () => {
    expect(
      jugar(
        S.unir([
          S.vocal(0.8, 260, SUAVE),
          S.silencio(0.6),
          S.vocal(0.8, 260, FUERTE),
        ]),
      ).cambios,
    ).toBe(1);
    const e = jugar(S.unir([S.silencio(3)]));
    expect(e).toMatchObject({ nivel: "silencio", cambios: 0, altura: 0 });
  });

  it("the drawing has a ceiling: a shout is not higher than a firm voice", () => {
    const firme = jugar(S.unir([S.vocal(1, 260, FUERTE)]));
    const grito = jugar(S.unir([S.vocal(1, 260, 0.9)]));
    expect(firme.altura).toBe(1);
    expect(grito.altura).toBe(1);
    const suave = jugar(S.unir([S.vocal(1, 260, SUAVE)]));
    expect(suave.altura).toBeGreaterThan(0);
    expect(suave.altura).toBeLessThan(0.6);
  });

  it("jitter inside the hysteresis band or shorter than the stay is not a change", () => {
    const l = crearLectorIntensidad({ pisoRuido: 0.002 });
    const umbral = 0.002 * 3.5;
    const enDb = (db: number) => umbral * 10 ** (db / 20);
    let e = l.estado();
    let t = 0;
    // settle soft
    for (; t < 600; t += 32)
      e = l.procesar({ rms: enDb(6), pitchHz: 260, tMs: t });
    // oscillate 11–13 dB: never crosses 14
    for (let i = 0; i < 40; i++, t += 32)
      e = l.procesar({ rms: enDb(i % 2 ? 11 : 13), pitchHz: 260, tMs: t });
    expect(e.cambios).toBe(0);
    // a loud spike of 96 ms (< 200 ms stay)
    for (let i = 0; i < 3; i++, t += 32)
      e = l.procesar({ rms: enDb(20), pitchHz: 260, tMs: t });
    for (let i = 0; i < 10; i++, t += 32)
      e = l.procesar({ rms: enDb(6), pitchHz: 260, tMs: t });
    expect(e.cambios).toBe(0);
    l.reiniciar();
    expect(l.estado()).toEqual({
      nivel: "silencio",
      db: 0,
      altura: 0,
      cambios: 0,
    });
  });
});
