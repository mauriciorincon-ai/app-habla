// RUMBO — tendencias por semana (Outcome 1) — motor PURO.
//
// Agrega las sesiones de juego (y los días de cápsula del historial) por SEMANA local. SOLO cuenta
// lo que DE VERDAD se midió (voz, duración, inversiones, dibujos) o lo que el padre MARCÓ (palabras
// oídas, participación). CERO puntajes clínicos, CERO %, CERO plazos. Y CERO culpa: una semana
// floja es un número pequeño SIN adjetivo — no hay rachas que se rompan ni semanas "malas".

import { lunesDeLaSemana } from "@/lib/fecha";
import type { Sesion } from "@/lib/storage/schemas";

/** Los días de cápsula del historial (fecha+id) — el otro insumo del Rumbo (lo que el padre marcó). */
export type DiaCapsula = { fecha: string };

export type ResumenSemana = {
  /** Lunes de la semana, YYYY-MM-DD (clave y etiqueta). */
  semana: string;
  /** Días con CUALQUIER práctica (cápsula hecha o juego) — la constancia, sin castigo. */
  diasConPractica: number;
  /** Intentos de juego de voz esa semana. */
  sesionesDeVoz: number;
  /** Palabras distintas que su voz encendió en palabra↔objeto (medido). */
  palabrasDistintas: number;
  /** Dibujos encendidos con su voz (medido). */
  dibujosEncendidos: number;
  /** Veces que su voz subió y bajó en el cohete (medido). */
  subidasYBajadas: number;
  /** La racha de voz más larga del globo esa semana, en ms (medido). */
  vozMsMax: number;
  /** Rondas de gemelas jugadas. */
  rondasGemelas: number;
  /** Lo que el PADRE marcó haber oído (palabras reconocidas + participación en gemelas). */
  marcadasPorTi: number;
};

function resumirSemana(
  semana: string,
  sesiones: Sesion[],
  diasCapsula: Set<string>,
): ResumenSemana {
  const dias = new Set<string>(diasCapsula);
  const palabras = new Set<string>();
  let dibujos = 0;
  let inversiones = 0;
  let vozMax = 0;
  let rondas = 0;
  let marcadas = 0;

  for (const s of sesiones) {
    dias.add(s.fecha);
    switch (s.juego) {
      case "palabras":
        dibujos += s.encendidos;
        marcadas += s.reconocidas;
        for (const p of s.palabras) palabras.add(p);
        break;
      case "cohete":
        inversiones += s.inversiones;
        break;
      case "globo":
        vozMax = Math.max(vozMax, s.rachaMs);
        break;
      case "gemelas":
        rondas += s.rondas;
        marcadas += s.participadas;
        break;
    }
  }

  return {
    semana,
    diasConPractica: dias.size,
    sesionesDeVoz: sesiones.length,
    palabrasDistintas: palabras.size,
    dibujosEncendidos: dibujos,
    subidasYBajadas: inversiones,
    vozMsMax: vozMax,
    rondasGemelas: rondas,
    marcadasPorTi: marcadas,
  };
}

/**
 * Las semanas con actividad, la más reciente primero. Combina sesiones de juego con los días de
 * cápsula (para que la constancia cuente también los días que solo hicieron la cápsula, sin juego).
 * Una semana sin nada simplemente no aparece — no se inventa una fila de ceros para regañar.
 */
export function tendenciasPorSemana(
  sesiones: readonly Sesion[],
  historial: readonly DiaCapsula[] = [],
): ResumenSemana[] {
  const sesPorSemana = new Map<string, Sesion[]>();
  for (const s of sesiones) {
    const k = lunesDeLaSemana(s.fecha);
    const lista = sesPorSemana.get(k);
    if (lista) lista.push(s);
    else sesPorSemana.set(k, [s]);
  }

  const capPorSemana = new Map<string, Set<string>>();
  for (const h of historial) {
    const k = lunesDeLaSemana(h.fecha);
    const set = capPorSemana.get(k) ?? new Set<string>();
    set.add(h.fecha);
    capPorSemana.set(k, set);
  }

  const semanas = new Set<string>([
    ...sesPorSemana.keys(),
    ...capPorSemana.keys(),
  ]);
  return [...semanas]
    .map((semana) =>
      resumirSemana(
        semana,
        sesPorSemana.get(semana) ?? [],
        capPorSemana.get(semana) ?? new Set(),
      ),
    )
    .sort((a, b) => (a.semana < b.semana ? 1 : a.semana > b.semana ? -1 : 0));
}
