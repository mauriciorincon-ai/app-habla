import { describe, expect, it } from "vitest";
import { tasaCruces } from "../../src/worklets/analisis";
import { crearDetectorSoplo, type EstadoSoplo } from "@/lib/voice/soplo";
import type { MeterFrame } from "@/lib/voice/types";
import { framesDe, pisoDe } from "../fixtures/frames-worklet";
import * as S from "../fixtures/senales-soplo";

/** Calibrates on 2 s of the room (as the app does) and runs the rest through the detector. */
function jugar(sala: Float32Array, juego: Float32Array): EstadoSoplo {
  const piso = pisoDe(framesDe(sala));
  const d = crearDetectorSoplo({ pisoRuido: piso });
  let e = d.estado();
  for (const f of framesDe(juego)) e = d.procesar(f);
  return e;
}

const sala = () => S.unir([S.silencio(2)]);

describe("blow detector: energy without pitch and with little hiss (ADR-024)", () => {
  it("a blow counts once, with its time", () => {
    const e = jugar(
      sala(),
      S.unir([S.silencio(0.5), S.soplo(1.2, 0.1), S.silencio(0.8)]),
    );
    expect(e.soplos).toBe(1);
    expect(e.soploMs).toBeGreaterThan(900);
    expect(e.soplando).toBe(false);
  });

  it("three blows with pauses are three", () => {
    const e = jugar(
      sala(),
      S.unir([
        S.soplo(0.6, 0.08, 1),
        S.silencio(0.6),
        S.soplo(0.6, 0.08, 2),
        S.silencio(0.6),
        S.soplo(0.6, 0.08, 3),
        S.silencio(0.6),
      ]),
    );
    expect(e.soplos).toBe(3);
  });

  it("a soft blow over a quiet room still counts", () => {
    expect(
      jugar(sala(), S.unir([S.soplo(1, 0.025), S.silencio(0.5)])).soplos,
    ).toBe(1);
  });

  it.each([
    ["a vowel", () => S.vocal(1.5, 280, 0.12)],
    ["a low hum", () => S.vocal(1.5, 180, 0.1)],
    ["a deep adult voice (110 Hz)", () => S.vocal(1.5, 110, 0.1)],
    ["a very deep adult voice (85 Hz)", () => S.vocal(1.5, 85, 0.1)],
    ["«sh»", () => S.sh(1.5, 0.08)],
    ["«s»", () => S.ese(1.5, 0.06)],
    ["silence", () => S.silencio(1.5)],
    ["a voice on the TV", () => S.tele(1.5, 0.05)],
  ])("%s is never a blow", (_n, senal) => {
    expect(jugar(sala(), S.unir([senal(), S.silencio(0.5)])).soplos).toBe(0);
  });

  it("a fan calibrated as the floor never blows, and a blow over it still counts", () => {
    const fan = () => S.ventilador(2, 0.012);
    expect(jugar(fan(), S.unir([S.ventilador(2, 0.012, 99)])).soplos).toBe(0);
    const sobre = S.unir([S.ventilador(1.5, 0.012, 98)]);
    const aire = S.unir([S.soplo(1.5, 0.12)]);
    for (let i = 0; i < aire.length; i++) sobre[i] += aire[i];
    expect(jugar(fan(), sobre).soplos).toBe(1);
  });

  it("a short puff under the confirmation time does not count", () => {
    expect(
      jugar(sala(), S.unir([S.soplo(0.09, 0.1), S.silencio(0.6)])).soplos,
    ).toBe(0);
  });

  it("a vowel in the middle of a blow ends it: blow, vowel, blow = two", () => {
    const e = jugar(
      sala(),
      S.unir([
        S.soplo(0.8, 0.1),
        S.vocal(0.5, 280, 0.12),
        S.soplo(0.8, 0.1, 5),
        S.silencio(0.6),
      ]),
    );
    expect(e.soplos).toBe(2);
  });

  it("frames without zero crossings (the fallback source, no pitch) are never a blow", () => {
    const d = crearDetectorSoplo({ pisoRuido: 0.002 });
    let e = d.estado();
    for (let t = 0; t < 2000; t += 32)
      e = d.procesar({ rms: 0.2, pitchHz: null, tMs: t });
    expect(e.soplos).toBe(0);
  });

  it("strength is capped at 1 and zero after the blow; a late frame does not inflate the time", () => {
    const d = crearDetectorSoplo({ pisoRuido: 0.002, confirmarMs: 64 });
    const f = (tMs: number, rms: number): MeterFrame => ({
      rms,
      pitchHz: null,
      tMs,
      zcr: 0.03,
    });
    let e = d.procesar(f(0, 0.9));
    for (let t = 32; t <= 320; t += 32) e = d.procesar(f(t, 0.9));
    expect(e.fuerza).toBe(1);
    const antes = e.soploMs;
    e = d.procesar(f(10_000, 0.9));
    expect(e.soploMs - antes).toBeLessThanOrEqual(100);
    for (let t = 10_032; t < 10_600; t += 32) e = d.procesar(f(t, 0.001));
    expect(e.soplando).toBe(false);
    expect(e.fuerza).toBe(0);
    d.reiniciar();
    expect(d.estado()).toEqual({
      soplando: false,
      soplos: 0,
      soploMs: 0,
      fuerza: 0,
    });
  });

  it("zero-crossing rate: a pure tone has two crossings per period, silence none", () => {
    const tono = new Float32Array(4800).map((_, i) =>
      Math.sin((2 * Math.PI * 480 * i) / 48_000 + 0.1),
    );
    expect(tasaCruces(tono)).toBeCloseTo(0.02, 3);
    expect(tasaCruces(new Float32Array(10))).toBe(0);
    expect(tasaCruces(new Float32Array(1))).toBe(0);
  });
});
