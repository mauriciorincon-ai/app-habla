import { CAPSULAS_ES } from "./capsulas-es.ts";
import { CAPSULAS_EN_TODAS } from "./capsulas-en-todas.ts";
import type { Capsula } from "./schema";

/**
 * Biblioteca de "Hoy" — la respuesta diaria al padre. 60 cápsulas organizadas por
 * **etapa del habla** (ADR 006), que el padre elige en Ajustes:
 *
 *   - `sonidos-e-intentos` (9): todavía explora. Sonidos, gestos y miradas YA son comunicación.
 *   - `palabras-sueltas` (44): **el DEFAULT PERMANENTE de esta app** (ADR 005, ratificado por el
 *     padre 2026-07-12). El niño dice palabras de a una; el objetivo es despertar la ASOCIACIÓN
 *     palabra↔objeto/actividad. Ninguna cápsula asume que arma frases.
 *   - `primeras-frases` (7): **OPT-IN**. Jamás se activa sola — el padre la elige cuando su hijo
 *     ya junta dos palabras. Aun aquí, la palabra suelta sigue valiendo.
 *
 * Ningún juego de la app exige palabras (miden voz, no vocabulario). Un sonido, un intento o un
 * gesto cuentan como comunicación — y se responden nombrando.
 *
 * Cada cápsula: una técnica con evidencia (§A.3), explicada en ~30 segundos, con UN guion que
 * se puede decir tal cual hoy, una actividad concreta y su fuente citada. La novedad viene de
 * las RUTINAS reales (carro, mercado, parque, calle, vestirse, dormir), los turnos con sonidos,
 * las canciones con pausa y los mini-retos sin pantalla — no de rellenar con variaciones.
 *
 * Tono: cálido, directo, es-CO. Prohibido (§D anti-claims): "terapia", plazos
 * ("en X semanas"), puntajes clínicos, elogios desacoplados de lo medido. Esto es práctica de
 * estimulación en casa — complementaria, nunca sustituta, de las terapias integrales del
 * lenguaje del niño.
 *
 * Las ETIQUETAS del objetivo de la semana (S4) viven en el mapa `ETIQUETAS_POR_CAPSULA` al final,
 * no inline: así la curaduría se lee de un vistazo y se ajusta sin tocar 50 objetos. `CAPSULAS`
 * es `BASE` con sus etiquetas ya adjuntas.
 */

/** La cápsula completa, con sus dos caras (pruebas, objetivo y todo lo que no es "Hoy"). Si a alguna
 *  le faltara la cara inglesa o la etiqueta, el schema y el unit lo cazan — nunca llega sin curar. */
export const CAPSULAS: Capsula[] = CAPSULAS_ES.map((c): Capsula => {
  const en = CAPSULAS_EN_TODAS[c.id];
  if (!en)
    throw new Error(
      `Falta la cápsula en inglés: ${c.id} (content/capsulas-en/)`,
    );
  return {
    ...c,
    titulo: { es: c.titulo, en: en.titulo },
    explicacion: { es: c.explicacion, en: en.explicacion },
    guion: { es: c.guion, en: en.guion },
    actividad: {
      texto: { es: c.actividad.texto, en: en.actividad },
      conPantalla: c.actividad.conPantalla,
    },
  };
});
