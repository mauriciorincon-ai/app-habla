// «Fuerte y suave» (S12, ADR-024): the loudness of the voice, RELATIVE to the calibrated floor.
//
// Pure engine. It reports the level in dB over the voice threshold, a height with a CEILING (shouting
// does not take the character higher than a firm voice), and counts CHANGES between soft and loud with
// hysteresis and a minimum stay. A shout held for ten seconds is zero changes: the game celebrates
// going up and coming down, never a «right» volume and never the maximum.
// Hard rule 2: no storage, no network, no logs (tests/unit/privacidad-voice.test.ts).

import { CONFIG_METER_DEFECTO, PISO_MINIMO } from "./meter";
import type { MeterFrame } from "./types";

export type ConfigIntensidad = {
  pisoRuido: number;
  /** Multiple of the floor that counts as voice (the same threshold as the balloon). */
  factorVoz: number;
  /** dB over the voice threshold to enter «loud». */
  fuerteDb: number;
  /** dB over the voice threshold to return to «soft» (< fuerteDb: the hysteresis band). */
  suaveDb: number;
  /** A state must last this long before a change counts (ms). */
  permanenciaMs: number;
  /** dB at which the drawing reaches its ceiling. */
  techoDb: number;
};

export const CONFIG_INTENSIDAD_DEFECTO: Omit<ConfigIntensidad, "pisoRuido"> = {
  factorVoz: CONFIG_METER_DEFECTO.factorEntrada,
  fuerteDb: 14,
  suaveDb: 9,
  permanenciaMs: 200,
  techoDb: 24,
};

export type Nivel = "silencio" | "suave" | "fuerte";

export type EstadoIntensidad = {
  nivel: Nivel;
  /** dB over the voice threshold (0 in silence). */
  db: number;
  /** 0..1 height of the character, capped at the ceiling. */
  altura: number;
  /** Changes between soft and loud, both ways, each after a confirmed stay. */
  cambios: number;
};

const DELTA_MAX_MS = 100;

export type LectorIntensidad = {
  procesar(frame: MeterFrame): EstadoIntensidad;
  estado(): EstadoIntensidad;
  reiniciar(): void;
};

export function crearLectorIntensidad(
  config: Partial<ConfigIntensidad> & { pisoRuido: number },
): LectorIntensidad {
  const c: ConfigIntensidad = { ...CONFIG_INTENSIDAD_DEFECTO, ...config };
  const umbralVoz = Math.max(c.pisoRuido, PISO_MINIMO) * c.factorVoz;

  let nivel: Nivel = "silencio";
  let db = 0;
  let altura = 0;
  let cambios = 0;
  /** The last confirmed voiced level (silence in between does not erase it). */
  let confirmado: "suave" | "fuerte" | null = null;
  let candidato: "suave" | "fuerte" | null = null;
  let candidatoMs = 0;
  let ultimoT: number | null = null;

  const foto = (): EstadoIntensidad => ({ nivel, db, altura, cambios });

  return {
    procesar(f) {
      const dt =
        ultimoT === null
          ? 0
          : Math.min(Math.max(f.tMs - ultimoT, 0), DELTA_MAX_MS);
      ultimoT = f.tMs;
      if (f.rms < umbralVoz) {
        nivel = "silencio";
        db = 0;
        altura = 0;
        candidato = null;
        candidatoMs = 0;
        return foto();
      }
      db = 20 * Math.log10(f.rms / umbralVoz);
      altura = Math.min(1, Math.max(0.05, db / c.techoDb));
      // Hysteresis: from loud you return to soft only under suaveDb; from soft you go loud over fuerteDb.
      const referencia = candidato ?? confirmado ?? "suave";
      const ahora: "suave" | "fuerte" =
        referencia === "fuerte"
          ? db <= c.suaveDb
            ? "suave"
            : "fuerte"
          : db >= c.fuerteDb
            ? "fuerte"
            : "suave";
      nivel = ahora;
      if (ahora === confirmado) {
        candidato = null;
        candidatoMs = 0;
        return foto();
      }
      if (ahora !== candidato) {
        candidato = ahora;
        candidatoMs = 0;
      }
      candidatoMs += dt;
      if (candidatoMs >= c.permanenciaMs) {
        if (confirmado !== null) cambios += 1;
        confirmado = ahora;
        candidato = null;
        candidatoMs = 0;
      }
      return foto();
    },
    estado: foto,
    reiniciar() {
      nivel = "silencio";
      db = 0;
      altura = 0;
      cambios = 0;
      confirmado = null;
      candidato = null;
      candidatoMs = 0;
      ultimoT = null;
    },
  };
}
