// Medidor de voz: motor PURO (sin Web Audio, sin DOM). Consume MeterFrame y decide si el
// personaje avanza. Regla dura 2: aquí no hay storage, red ni logs — solo aritmética.
//
// Dos umbrales relativos al piso de ruido calibrado (histéresis):
//   - entrada: la voz debe superarlo para que el personaje arranque (respuesta inmediata).
//   - salida:  por debajo de él empieza a correr un tiempo de gracia; solo al agotarse se
//     detiene. Sin la gracia, una vocal que fluctúa (o una pausa mínima al respirar) apagaría
//     y encendería el personaje varias veces por segundo — el parpadeo que el sprint prohíbe.
//
// Honestidad de la métrica: el personaje sigue volando durante la gracia, pero el tiempo SOLO
// acumula con energía real por encima del umbral de salida. La app jamás reporta más segundos de
// los que el niño de verdad hizo sonar.
//
// DOS números, porque son dos cosas distintas y confundirlas es mentir (hallazgo del gate del
// usuario, 2026-07-12):
//   - `sostenidoMs`  = TOTAL de voz en el intento, sumando todos los ratos. Es lo que hace avanzar
//     al personaje (nunca se pierde lo ya avanzado: eso sería castigo).
//   - `mejorRachaMs` = la vez MÁS LARGA que la voz sonó sin cortarse. Es lo único que autoriza a
//     decir "la sostuviste N segundos".
// Antes existía solo el primero, y la celebración decía "¡la sostuviste 7,3 segundos!" cuando en
// realidad habían sido tres soplidos separados por silencios largos. Eso es el elogio vacío que
// esta app le reprocha a la competencia.

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
  /** Tiempo TOTAL con voz real en el intento (ms): mueve al personaje, no afirma continuidad. */
  sostenidoMs: number;
  /** La racha continua más larga (ms): lo ÚNICO que autoriza a decir "la sostuviste N segundos". */
  mejorRachaMs: number;
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
  /** La racha que está corriendo ahora mismo (se cierra cuando la voz se corta de verdad). */
  let rachaMs = 0;
  let mejorRachaCerrada = 0;

  const estado = (): MeterEstado => ({
    vozActiva,
    sostenidoMs,
    // La racha en curso también cuenta: si el niño lleva 4 s sonando, ya los sostuvo.
    mejorRachaMs: Math.max(mejorRachaCerrada, rachaMs),
    nivel,
  });

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
          rachaMs += deltaMs;
        }
        return estado();
      }

      if (hayEnergia) {
        silencioMs = 0;
        sostenidoMs += deltaMs;
        rachaMs += deltaMs;
        return estado();
      }

      // Voz activa pero sin energía: corre la gracia (el personaje sigue, el contador no).
      // La pausa de respirar NO parte la racha — respirar no es dejar de sostener.
      silencioMs += deltaMs;
      if (silencioMs >= config.graciaMs) {
        vozActiva = false;
        silencioMs = 0;
        // La voz se cortó de verdad: se cierra la racha y empieza a contarse una nueva.
        mejorRachaCerrada = Math.max(mejorRachaCerrada, rachaMs);
        rachaMs = 0;
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
      rachaMs = 0;
      mejorRachaCerrada = 0;
    },

    umbrales: () => ({ entrada: umbralEntrada, salida: umbralSalida }),
  };
}
