// Medidor de voz: motor PURO (sin Web Audio, sin DOM). Consume MeterFrame y decide si el
// personaje avanza. Regla dura 2: aquí no hay storage, red ni logs — solo aritmética.
//
// Dos umbrales relativos al piso de ruido calibrado (histéresis):
//   - entrada: la voz debe superarlo para que el personaje arranque (respuesta inmediata).
//   - salida:  por debajo de él empieza a correr un tiempo de gracia; solo al agotarse se
//     detiene. Sin la gracia, una vocal que fluctúa (o una pausa mínima al respirar) apagaría
//     y encendería el personaje varias veces por segundo — el parpadeo que el sprint prohíbe.
//
// Honestidad de la métrica: el personaje sigue volando durante la gracia, pero `sostenidoMs`
// SOLO acumula tiempo con energía real por encima del umbral de salida. La app jamás reporta
// más segundos de los que el niño de verdad sostuvo.

import type { MeterFrame } from "./types";

export type MeterConfig = {
  /** RMS del ruido de fondo medido en la calibración. */
  pisoRuido: number;
  /** Múltiplo del piso para ACTIVAR la voz. */
  factorEntrada: number;
  /** Múltiplo del piso para empezar a soltar (< factorEntrada). */
  factorSalida: number;
  /** Silencio tolerado antes de detener al personaje (ms). */
  graciaMs: number;
};

export type MeterEstado = {
  /** ¿El personaje avanza en este instante? */
  vozActiva: boolean;
  /** Tiempo con voz REAL acumulado (ms) — lo que la celebración puede afirmar. */
  sostenidoMs: number;
  /** 0..1 para pintar el medidor (0 = piso, 1 = voz cómoda por encima del umbral). */
  nivel: number;
};

/**
 * Un piso de ruido demasiado bajo (o cero, en una grabación digital limpia) volvería el umbral
 * relativo hipersensible. Este mínimo lo ancla a algo audible de verdad.
 */
export const PISO_MINIMO = 0.002;

export const CONFIG_METER_DEFECTO: Omit<MeterConfig, "pisoRuido"> = {
  factorEntrada: 3.5,
  factorSalida: 2.2,
  graciaMs: 300,
};

/** Un frame tardío (pestaña en segundo plano) no debe inflar el tiempo sostenido. */
const DELTA_MAX_MS = 100;

export type Meter = {
  /** Alimenta un frame y devuelve el estado resultante. */
  empujar(frame: MeterFrame): MeterEstado;
  estado(): MeterEstado;
  /** Vuelve a cero el intento (p. ej. al recalibrar). */
  reiniciar(): void;
  umbrales(): { entrada: number; salida: number };
};

export function crearMeter(config: MeterConfig): Meter {
  const piso = Math.max(config.pisoRuido, PISO_MINIMO);
  const umbralEntrada = piso * config.factorEntrada;
  const umbralSalida = piso * config.factorSalida;

  let vozActiva = false;
  let sostenidoMs = 0;
  let nivel = 0;
  let silencioMs = 0;
  let ultimoTMs: number | null = null;

  const estado = (): MeterEstado => ({ vozActiva, sostenidoMs, nivel });

  return {
    empujar(frame: MeterFrame): MeterEstado {
      const deltaMs =
        ultimoTMs === null
          ? 0
          : Math.min(Math.max(frame.tMs - ultimoTMs, 0), DELTA_MAX_MS);
      ultimoTMs = frame.tMs;

      // Nivel para la UI: el umbral de entrada queda a media barra.
      const rango = umbralEntrada * 2 - piso;
      nivel = Math.min(1, Math.max(0, (frame.rms - piso) / rango));

      const hayEnergia = frame.rms >= umbralSalida;

      if (!vozActiva) {
        // Arranca solo con energía clara (umbral alto): el ruido de la casa no lo enciende.
        if (frame.rms >= umbralEntrada) {
          vozActiva = true;
          silencioMs = 0;
          sostenidoMs += deltaMs;
        }
        return estado();
      }

      if (hayEnergia) {
        silencioMs = 0;
        sostenidoMs += deltaMs;
        return estado();
      }

      // Voz activa pero sin energía: corre la gracia (el personaje sigue, el contador no).
      silencioMs += deltaMs;
      if (silencioMs >= config.graciaMs) {
        vozActiva = false;
        silencioMs = 0;
      }
      return estado();
    },

    estado,

    reiniciar(): void {
      vozActiva = false;
      sostenidoMs = 0;
      nivel = 0;
      silencioMs = 0;
      ultimoTMs = null;
    },

    umbrales: () => ({ entrada: umbralEntrada, salida: umbralSalida }),
  };
}
