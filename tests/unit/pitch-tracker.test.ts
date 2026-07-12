import { describe, expect, it } from "vitest";
import {
  PITCH_MAX_HZ,
  PITCH_MIN_HZ,
  crearPitchTracker,
} from "@/lib/voice/pitch-tracker";
import type { MeterFrame } from "@/lib/voice/types";

// Señales sintéticas: el motor del cohete se prueba SIN navegador ni micrófono (ADR 007).
// Cada frame llega como llegaría del worklet: ~32 ms, con su RMS y su F0 (o null).

const MS_POR_FRAME = 32;

function frame(pitchHz: number | null, indice: number, rms = 0.08): MeterFrame {
  return { rms, pitchHz, tMs: indice * MS_POR_FRAME };
}

/** Un barrido de tono: de `desdeHz` a `hastaHz` en `frames` pasos. */
function barrido(desdeHz: number, hastaHz: number, frames: number): number[] {
  return Array.from({ length: frames }, (_, i) =>
    frames === 1 ? desdeHz : desdeHz + ((hastaHz - desdeHz) * i) / (frames - 1),
  );
}

function correr(
  pitches: (number | null)[],
  opciones: { vozActiva?: boolean; desde?: number } = {},
) {
  const tracker = crearPitchTracker();
  const desde = opciones.desde ?? 0;
  let estado = tracker.estado();
  pitches.forEach((hz, i) => {
    estado = tracker.empujar(
      frame(hz, desde + i, hz === null ? 0.002 : 0.08),
      opciones.vozActiva ?? hz !== null,
    );
  });
  return { tracker, estado };
}

describe("pitch-tracker: el cohete sigue el TONO de la voz", () => {
  it("una voz que sube de tono sube el cohete", () => {
    const { estado } = correr(barrido(220, 420, 30));
    expect(estado.direccion).toBe("sube");
    expect(estado.altura).toBeGreaterThan(0.7);
  });

  it("una voz que baja de tono baja el cohete", () => {
    const { estado } = correr([
      ...barrido(220, 420, 20),
      ...barrido(420, 220, 20),
    ]);
    expect(estado.direccion).toBe("baja");
    expect(estado.altura).toBeLessThan(0.3);
  });

  it("la altura es 0..1 y usa escala musical dentro del rango infantil", () => {
    const grave = correr(Array(12).fill(PITCH_MIN_HZ)).estado;
    const agudo = correr(Array(12).fill(PITCH_MAX_HZ)).estado;
    expect(grave.altura).toBeCloseTo(0, 1);
    expect(agudo.altura).toBeCloseTo(1, 1);
  });

  it("cuenta las inversiones REALES: subir y bajar tres veces son tres inversiones", () => {
    const subeBaja = [
      ...barrido(230, 400, 12),
      ...barrido(400, 230, 12),
      ...barrido(230, 400, 12),
      ...barrido(400, 230, 12),
    ];
    const { estado } = correr(subeBaja);
    expect(estado.inversiones).toBe(3);
  });

  it("un tono PLANO no cuenta inversiones (la app no felicita por nada)", () => {
    const { estado } = correr(Array(40).fill(300));
    expect(estado.inversiones).toBe(0);
    expect(estado.direccion).toBe("quieto");
  });

  it("un temblor pequeño alrededor de un tono no cuenta como inversión (histéresis)", () => {
    // ±3 Hz sobre 300 Hz ≈ 17 cents: muy por debajo del umbral de 50 cents.
    const tembloroso = Array.from({ length: 60 }, (_, i) =>
      i % 2 === 0 ? 297 : 303,
    );
    const { estado } = correr(tembloroso);
    expect(estado.inversiones).toBe(0);
  });
});

describe("pitch-tracker: lo que NO debe mover el cohete", () => {
  it("el ruido de la casa (frames sin pitch) no lo mueve ni lo hace caer", () => {
    const tracker = crearPitchTracker();
    // Primero hay voz: el cohete sube.
    barrido(220, 400, 20).forEach((hz, i) => {
      tracker.empujar(frame(hz, i), true);
    });
    const conVoz = tracker.estado();
    expect(conVoz.altura).toBeGreaterThan(0.6);

    // Después solo ruido: pitchHz null y vozActiva false. El cohete se queda donde estaba.
    for (let i = 20; i < 30; i++) {
      tracker.empujar(frame(null, i, 0.004), false);
    }
    const conRuido = tracker.estado();
    expect(conRuido.altura).toBeCloseTo(conVoz.altura, 5);
    expect(conRuido.inversiones).toBe(conVoz.inversiones);
  });

  it("un frame con pitch pero sin voz activa (energía bajo el piso) se ignora", () => {
    const tracker = crearPitchTracker();
    // El detector podría equivocarse con un ruido tonal; el gate de energía manda.
    for (let i = 0; i < 20; i++) {
      tracker.empujar(frame(350, i, 0.003), false);
    }
    expect(tracker.estado().pitchHz).toBeNull();
    expect(tracker.estado().altura).toBe(0);
  });

  it("rechaza el salto de octava (el error clásico de YIN)", () => {
    const tracker = crearPitchTracker();
    Array(10)
      .fill(240)
      .forEach((hz, i) => tracker.empujar(frame(hz, i), true));
    const antes = tracker.estado().pitchHz as number;

    // 240 → 480 Hz de un frame al otro: eso no lo hace un niño, lo hace el detector.
    tracker.empujar(frame(480, 10), true);
    const despues = tracker.estado().pitchHz as number;

    expect(Math.abs(despues - antes)).toBeLessThan(20);
  });

  it("un pitch fuera del rango de una voz infantil se ignora", () => {
    const tracker = crearPitchTracker();
    Array(10)
      .fill(300)
      .forEach((hz, i) => tracker.empujar(frame(hz, i), true));
    const antes = tracker.estado().pitchHz as number;

    tracker.empujar(frame(90, 10), true); // voz adulta grave / zumbido
    expect(tracker.estado().pitchHz).toBeCloseTo(antes, 5);
  });
});

describe("pitch-tracker: la sesión", () => {
  it("tras un silencio largo olvida el tono anterior (empieza frase nueva sin arrastres)", () => {
    const tracker = crearPitchTracker();
    Array(10)
      .fill(400)
      .forEach((hz, i) => tracker.empujar(frame(hz, i), true));
    expect(tracker.estado().pitchHz).not.toBeNull();

    // 25 frames de silencio ≈ 800 ms > MS_PARA_OLVIDAR.
    for (let i = 10; i < 35; i++) {
      tracker.empujar(frame(null, i, 0.002), false);
    }
    expect(tracker.estado().pitchHz).toBeNull();
    expect(tracker.estado().direccion).toBe("quieto");
  });

  it("reiniciar deja el intento en cero (otra vez, sin herencias)", () => {
    const { tracker } = correr([
      ...barrido(230, 400, 12),
      ...barrido(400, 230, 12),
    ]);
    expect(tracker.estado().inversiones).toBeGreaterThan(0);

    tracker.reiniciar();
    expect(tracker.estado()).toEqual({
      pitchHz: null,
      altura: 0,
      direccion: "quieto",
      inversiones: 0,
    });
  });
});
