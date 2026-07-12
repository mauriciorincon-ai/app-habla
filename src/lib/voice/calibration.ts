// Calibración del piso de ruido: motor PURO. Dos segundos de "shhh…" miden cómo suena ESTA casa
// (hermanos, TV, ventilador) y el umbral del juego se vuelve relativo a eso.
// Regla dura 2: sin storage, sin red, sin logs.

import type { MeterFrame } from "./types";
import { PISO_MINIMO } from "./meter";

export const DURACION_CALIBRACION_MS = 2000;

/**
 * Por encima de este piso, la casa está tan ruidosa que el juego funcionaría a medias: la UI lo
 * dice honesto ("hay mucho ruido, acerquémonos") en vez de fingir que todo está bien.
 */
export const PISO_RUIDO_ALTO = 0.05;

export type CalibracionEstado = {
  listo: boolean;
  msTranscurridos: number;
  /** RMS representativo del ruido de fondo (0 hasta que termina). */
  pisoRuido: number;
  ruidoAlto: boolean;
};

export type Calibracion = {
  empujar(frame: MeterFrame): CalibracionEstado;
  estado(): CalibracionEstado;
  reiniciar(): void;
};

/**
 * Percentil 75 en vez de promedio o máximo: un ruido puntual (una puerta, una tos) no debe
 * inflar el piso —eso volvería sordo el juego—, pero el piso sí debe quedar por encima del
 * grueso del ruido estable para que ese ruido no mueva al personaje.
 */
export function percentil(valores: readonly number[], p: number): number {
  if (valores.length === 0) return 0;
  const ordenados = [...valores].sort((a, b) => a - b);
  const indice = Math.min(
    ordenados.length - 1,
    Math.floor((ordenados.length - 1) * p),
  );
  return ordenados[indice];
}

export function crearCalibracion(
  duracionMs: number = DURACION_CALIBRACION_MS,
): Calibracion {
  let muestras: number[] = [];
  let inicioTMs: number | null = null;
  let msTranscurridos = 0;
  let pisoRuido = 0;
  let listo = false;

  const estado = (): CalibracionEstado => ({
    listo,
    msTranscurridos,
    pisoRuido,
    ruidoAlto: listo && pisoRuido > PISO_RUIDO_ALTO,
  });

  return {
    empujar(frame: MeterFrame): CalibracionEstado {
      if (listo) return estado();

      inicioTMs ??= frame.tMs;
      msTranscurridos = frame.tMs - inicioTMs;
      muestras.push(frame.rms);

      if (msTranscurridos >= duracionMs) {
        pisoRuido = Math.max(percentil(muestras, 0.75), PISO_MINIMO);
        listo = true;
      }
      return estado();
    },

    estado,

    reiniciar(): void {
      muestras = [];
      inicioTMs = null;
      msTranscurridos = 0;
      pisoRuido = 0;
      listo = false;
    },
  };
}
