// «Soplar» (S12, ADR-024): a blow is ENERGY WITHOUT PITCH and with little hiss.
//
// Pure engine, no DOM, no Web Audio: it reads the worklet's scalars (rms, pitchHz, zcr) and decides,
// with hysteresis, whether the child is blowing. Three conditions, all at once and sustained:
//   1. energy over the CALIBRATED floor of the room (a fan or a quiet TV stays under it);
//   2. no pitch from YIN (a vowel, a hum or a voice on the TV has one);
//   3. few zero crossings (a «s» or a «sh» is high hiss with many; air on the microphone is low rumble).
// Hard rule 2: no storage, no network, no logs (tests/unit/privacidad-voice.test.ts).

import { PISO_MINIMO } from "./meter";
import type { MeterFrame } from "./types";

export type ConfigSoplo = {
  /** Room floor measured by the calibration (RMS). */
  pisoRuido: number;
  /** Multiple of the floor to start a blow. */
  factorEntrada: number;
  /** Multiple of the floor to keep it (< factorEntrada). */
  factorSalida: number;
  /** Zero crossings per sample above which the sound is hiss, not air (ADR-024 table). */
  zcrMaximo: number;
  /** Energy without pitch must last this long before it counts as a blow (ms). */
  confirmarMs: number;
  /** Tolerated gap before a blow ends (ms). */
  graciaMs: number;
};

export const CONFIG_SOPLO_DEFECTO: Omit<ConfigSoplo, "pisoRuido"> = {
  factorEntrada: 4,
  factorSalida: 2.5,
  zcrMaximo: 0.1,
  confirmarMs: 150,
  graciaMs: 250,
};

export type EstadoSoplo = {
  /** Is the child blowing right now? */
  soplando: boolean;
  /** Blows counted in this try (one per confirmed onset). */
  soplos: number;
  /** Total time blowing (ms). */
  soploMs: number;
  /** 0..1 for the drawing: how strong the air is over the floor (capped). */
  fuerza: number;
};

/** A late frame (tab in the background) must not inflate the time. */
const DELTA_MAX_MS = 100;

export type DetectorSoplo = {
  procesar(frame: MeterFrame): EstadoSoplo;
  estado(): EstadoSoplo;
  reiniciar(): void;
};

export function crearDetectorSoplo(
  config: Partial<ConfigSoplo> & { pisoRuido: number },
): DetectorSoplo {
  const c: ConfigSoplo = { ...CONFIG_SOPLO_DEFECTO, ...config };
  const piso = Math.max(c.pisoRuido, PISO_MINIMO);
  const entrada = piso * c.factorEntrada;
  const salida = piso * c.factorSalida;

  let soplando = false;
  let soplos = 0;
  let soploMs = 0;
  let candidatoMs = 0;
  let huecoMs = 0;
  let fuerza = 0;
  let ultimoT: number | null = null;

  const foto = (): EstadoSoplo => ({ soplando, soplos, soploMs, fuerza });

  return {
    procesar(f) {
      const dt =
        ultimoT === null
          ? 0
          : Math.min(Math.max(f.tMs - ultimoT, 0), DELTA_MAX_MS);
      ultimoT = f.tMs;
      // Without zero crossings (the fallback source) a voice would look like air: never a blow.
      const esAire =
        f.zcr !== undefined &&
        f.pitchHz === null &&
        f.grave !== true &&
        f.zcr <= c.zcrMaximo &&
        f.rms >= (soplando ? salida : entrada);

      if (esAire) {
        huecoMs = 0;
        if (soplando) {
          soploMs += dt;
        } else {
          candidatoMs += dt;
          if (candidatoMs >= c.confirmarMs) {
            soplando = true;
            soplos += 1;
            soploMs += candidatoMs;
            candidatoMs = 0;
          }
        }
        fuerza = Math.min(
          1,
          Math.max(0, (f.rms / piso - c.factorSalida) / (c.factorEntrada * 4)),
        );
      } else {
        candidatoMs = 0;
        if (soplando) {
          huecoMs += dt;
          if (huecoMs >= c.graciaMs || f.pitchHz !== null || f.grave === true) {
            soplando = false;
            huecoMs = 0;
          }
        }
        if (!soplando) fuerza = 0;
      }
      return foto();
    },
    estado: foto,
    reiniciar() {
      soplando = false;
      soplos = 0;
      soploMs = 0;
      candidatoMs = 0;
      huecoMs = 0;
      fuerza = 0;
      ultimoT = null;
    },
  };
}
