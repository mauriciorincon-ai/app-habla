// El motor del cohete: sigue el TONO de la voz (ADR 007). Motor PURO — sin Web Audio, sin
// storage, sin red (regla dura 2: el pitch es dato derivado de la voz del niño).
//
// Garantías (bajo unit test con señales sintéticas):
//   - Una voz que sube de tono sube el cohete; una que baja, lo baja.
//   - El ruido de la casa NO lo mueve: los frames sin voz llegan con pitchHz null y el cohete
//     se queda donde está (jamás cae por silencio — no hay castigo).
//   - Los saltos de octava (el error clásico de YIN) se rechazan: 220 Hz → 440 Hz de un frame
//     al otro no es un niño cantando, es el detector equivocándose.
//   - Las inversiones (subió-y-bajó) solo cuentan cuando el cambio es MUSICALMENTE real
//     (≥ 50 cents desde el último extremo), no cuando el tono tiembla.

import type { MeterFrame } from "./types";

/** Rango de producto para voz infantil (§B.1: F0 de 4–6 años ≈ 250–400 Hz, con margen). */
export const PITCH_MIN_HZ = 200;
export const PITCH_MAX_HZ = 450;

/** Un salto mayor a esto respecto del tono suavizado se considera error de octava y se ignora. */
const SALTO_MAXIMO = 0.45;

/** Suavizado exponencial: alto = responde rápido pero tiembla; bajo = suave pero perezoso. */
const ALFA_EMA = 0.35;

/** Cambio mínimo (en cents) desde el último extremo para reconocer un cambio de dirección. */
const CENTS_HISTERESIS = 50;

/** Sin pitch por más tiempo que esto, el seguimiento se reinicia (la frase terminó). */
const MS_PARA_OLVIDAR = 600;

export type Direccion = "sube" | "baja" | "quieto";

export type EstadoPitch = {
  /** Tono suavizado en Hz, o null si no hay voz confiable ahora mismo. */
  pitchHz: number | null;
  /** 0..1 — posición del cohete dentro del rango de la voz infantil (escala musical). */
  altura: number;
  direccion: Direccion;
  /** Cuántas veces la voz cambió de dirección de verdad: la métrica HONESTA del cohete. */
  inversiones: number;
};

export type PitchTracker = {
  empujar(frame: MeterFrame, vozActiva: boolean): EstadoPitch;
  estado(): EstadoPitch;
  reiniciar(): void;
};

/** Distancia musical entre dos frecuencias (100 cents = 1 semitono). */
function cents(a: number, b: number): number {
  return Math.abs(1200 * Math.log2(a / b));
}

/** Mediana de 3: mata el frame suelto disparatado sin retrasar la señal como haría un promedio. */
function mediana3(a: number, b: number, c: number): number {
  return Math.max(Math.min(a, b), Math.min(Math.max(a, b), c));
}

const ESTADO_INICIAL: EstadoPitch = {
  pitchHz: null,
  altura: 0,
  direccion: "quieto",
  inversiones: 0,
};

export function crearPitchTracker(): PitchTracker {
  let suavizado: number | null = null;
  let ultimos: number[] = [];
  let direccion: Direccion = "quieto";
  /** El tono desde el que se mide el próximo cambio de dirección (el último pico o valle). */
  let extremo: number | null = null;
  let inversiones = 0;
  let altura = 0;
  let ultimoConVozMs: number | null = null;

  function instantanea(): EstadoPitch {
    return { pitchHz: suavizado, altura, direccion, inversiones };
  }

  return {
    empujar(frame, vozActiva) {
      const crudo = frame.pitchHz;

      // Sin voz (o pitch no confiable): el cohete se queda donde está. Jamás cae por silencio.
      if (!vozActiva || crudo === null) {
        if (
          ultimoConVozMs !== null &&
          frame.tMs - ultimoConVozMs > MS_PARA_OLVIDAR
        ) {
          suavizado = null;
          ultimos = [];
          direccion = "quieto";
          extremo = null;
        }
        return instantanea();
      }
      ultimoConVozMs = frame.tMs;

      // Fuera del rango de una voz infantil: no es su voz (o es un armónico). Se ignora.
      if (crudo < PITCH_MIN_HZ || crudo > PITCH_MAX_HZ) return instantanea();

      // Salto de octava: el error clásico de YIN. Un niño no duplica su tono en 32 ms.
      if (suavizado !== null) {
        const salto = Math.abs(crudo - suavizado) / suavizado;
        if (salto > SALTO_MAXIMO) return instantanea();
      }

      // Mediana de 3 + EMA: la señal queda limpia sin volverse perezosa.
      ultimos = [...ultimos, crudo].slice(-3);
      const filtrado =
        ultimos.length === 3
          ? mediana3(ultimos[0], ultimos[1], ultimos[2])
          : crudo;

      suavizado =
        suavizado === null
          ? filtrado
          : suavizado + ALFA_EMA * (filtrado - suavizado);

      // Altura en escala MUSICAL (log): así una octava se ve igual de grande en toda la pantalla.
      const proporcion =
        Math.log2(suavizado / PITCH_MIN_HZ) /
        Math.log2(PITCH_MAX_HZ / PITCH_MIN_HZ);
      altura = Math.min(1, Math.max(0, proporcion));

      // Histéresis direccional: la dirección solo cambia si la voz se movió de verdad.
      if (extremo === null) {
        extremo = suavizado;
      } else if (cents(suavizado, extremo) >= CENTS_HISTERESIS) {
        const nueva: Direccion = suavizado > extremo ? "sube" : "baja";
        if (nueva !== direccion) {
          // La primera dirección no es una inversión: no hay de qué invertirse todavía.
          if (direccion !== "quieto") inversiones += 1;
          direccion = nueva;
        }
        extremo = suavizado;
      } else if (
        (direccion === "sube" && suavizado > extremo) ||
        (direccion === "baja" && suavizado < extremo)
      ) {
        // Sigue en la misma dirección: el extremo avanza con ella (así el rebote se mide
        // desde el pico real, no desde donde empezó a subir).
        extremo = suavizado;
      }

      return instantanea();
    },

    estado: instantanea,

    reiniciar() {
      suavizado = null;
      ultimos = [];
      direccion = ESTADO_INICIAL.direccion;
      extremo = null;
      inversiones = 0;
      altura = 0;
      ultimoConVozMs = null;
    },
  };
}
