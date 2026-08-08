// La estrella ⭐⭐⭐: la cápsula de HOY. Motor PURO y determinista.
//
// Garantías (bajo unit test):
//   - Ningún día se queda sin respuesta.
//   - La cápsula del día es ESTABLE: no cambia al recargar, ni al completarla, ni al volver más
//     tarde. Solo cambia cuando cambia el día — o cuando el padre cambia de etapa (ADR 006).
//   - Solo sirve cápsulas de la ETAPA ACTIVA; no repite una hasta agotar la etapa; al agotarla
//     empieza un ciclo nuevo DE ESA ETAPA (las otras etapas y el historial quedan intactos).
//   - Cambiar de etapa y volver el mismo día devuelve LA MISMA cápsula (determinismo por
//     fecha+etapa+ciclo, no por orden de eventos).

import type { Capsula, Etapa } from "@content/schema";
import { ETAPA_VACIA, type Progreso } from "@/lib/storage/schemas";
import { claveFechaLocal } from "@/lib/fecha";

// `claveFechaLocal` vive en `@/lib/fecha` (dedup del remate S4). Se re-exporta aquí porque el
// motor de cápsulas y sus tests la piden como parte de la API de daily.
export { claveFechaLocal };

/** FNV-1a: hash estable y sin dependencias — la misma fecha da siempre la misma cápsula.
 *  Lo comparte gemelas (S4): semilla del día para variar los pares SIN azar. */
export function fnv1a(texto: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < texto.length; i++) {
    hash ^= texto.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export type SeleccionDiaria = {
  capsula: Capsula;
  progreso: Progreso;
  /** true si esta cápsula ya se completó (la pantalla "Hoy" muestra el estado sobrio). */
  completada: boolean;
};

/**
 * `coincide` = predicado del objetivo de la semana (S4): ¿esta cápsula sirve al objetivo que el
 * padre escribió? Es OPCIONAL — sin objetivo el motor se comporta EXACTAMENTE igual que antes
 * (el orden por defecto no cambia, unit de identidad). Con objetivo, entre las pendientes se
 * prefiere una que coincida; si ninguna coincide, se elige como siempre (sin saltarse la etapa,
 * ADR-005 — el objetivo alinea DENTRO de la etapa, jamás fuerza contenido de otra).
 */
export function seleccionarCapsula(
  fecha: string,
  progreso: Progreso,
  biblioteca: readonly Capsula[],
  etapa: Etapa,
  coincide?: (c: Capsula) => boolean,
): SeleccionDiaria {
  const deEtapa = biblioteca.filter((c) => c.etapa === etapa);
  if (deEtapa.length === 0) {
    throw new Error(
      `La biblioteca no tiene cápsulas de la etapa "${etapa}": ningún día puede quedarse sin respuesta.`,
    );
  }

  const estadoEtapa = progreso.porEtapa[etapa] ?? ETAPA_VACIA;

  // 1. Esta etapa ya tiene cápsula asignada para hoy: es intocable (aunque esté completada, y
  //    aunque el padre se haya ido a otra etapa y haya vuelto — su trabajo del día no se pierde).
  const asignada = estadoEtapa.asignacionHoy;
  if (asignada?.fecha === fecha) {
    const capsula = deEtapa.find((c) => c.id === asignada.capsulaId);
    if (capsula) {
      return {
        capsula,
        progreso,
        completada: estadoEtapa.cicloCompletadas.includes(capsula.id),
      };
    }
    // La cápsula asignada ya no existe (se editó la biblioteca): se reasigna abajo.
  }

  // 2. Candidatas: las que faltan del ciclo actual de la etapa.
  let ciclo = estadoEtapa.ciclo;
  let cicloCompletadas = estadoEtapa.cicloCompletadas;
  let pendientes = deEtapa.filter((c) => !cicloCompletadas.includes(c.id));

  // 3. Etapa agotada: vuelta nueva de ESTA etapa (historial y otras etapas intactos).
  if (pendientes.length === 0) {
    ciclo += 1;
    cicloCompletadas = [];
    pendientes = [...deEtapa];
  }

  // Evita repetir la de ayer de ESTA etapa cuando quedó sin completar (habiendo alternativas).
  const idAyer = estadoEtapa.asignacionAyer?.capsulaId;
  if (pendientes.length > 1 && idAyer) {
    const sinAyer = pendientes.filter((c) => c.id !== idAyer);
    if (sinAyer.length > 0) pendientes = sinAyer;
  }

  // Objetivo de la semana (S4): entre las pendientes, prefiere las que coinciden. Sin objetivo (o
  // sin coincidencias) el conjunto no cambia → el índice determinista escoge la misma de siempre.
  const pool =
    coincide && pendientes.some(coincide)
      ? pendientes.filter(coincide)
      : pendientes;

  const capsula = pool[fnv1a(`${fecha}:${etapa}:${ciclo}`) % pool.length];

  return {
    capsula,
    completada: false,
    progreso: {
      ...progreso,
      porEtapa: {
        ...progreso.porEtapa,
        [etapa]: {
          ciclo,
          cicloCompletadas,
          asignacionAyer: estadoEtapa.asignacionHoy,
          asignacionHoy: { fecha, capsulaId: capsula.id },
        },
      },
    },
  };
}

/**
 * Re-alinea la cápsula de HOY cuando el padre escribe o borra el objetivo de la semana (S4, R4).
 * Regla dura: la asignación del día está CONGELADA (invariante del S2). Esta acción es la ÚNICA
 * excepción, y solo en un caso — que la cápsula de hoy NO esté completada. El trabajo ya hecho es
 * intocable: si el padre ya marcó "ya lo hicimos", el objetivo aplica desde MAÑANA, nunca le
 * borra el logro del día. Si la cápsula actual ya coincide (o no había ninguna asignada), no hay
 * cambio. Es explícita (se llama al cambiar el objetivo), no un efecto de cada render.
 */
export function realinearObjetivo(
  fecha: string,
  progreso: Progreso,
  biblioteca: readonly Capsula[],
  etapa: Etapa,
  coincide: (c: Capsula) => boolean,
): Progreso {
  const estadoEtapa = progreso.porEtapa[etapa] ?? ETAPA_VACIA;
  const asignada = estadoEtapa.asignacionHoy;

  // Sin asignación de hoy: no hay nada congelado que re-evaluar; la próxima selección ya usará
  // el objetivo.
  if (asignada?.fecha !== fecha) return progreso;
  // Completada: intocable. El objetivo aplica desde mañana.
  if (estadoEtapa.cicloCompletadas.includes(asignada.capsulaId))
    return progreso;

  // Suelta la asignación de hoy y deja que el selector escoja de nuevo con el objetivo activo.
  const sinHoy: Progreso = {
    ...progreso,
    porEtapa: {
      ...progreso.porEtapa,
      [etapa]: { ...estadoEtapa, asignacionHoy: estadoEtapa.asignacionAyer },
    },
  };
  return seleccionarCapsula(fecha, sinHoy, biblioteca, etapa, coincide)
    .progreso;
}

/** Marcar completada es idempotente: dos toques no ensucian el historial.
 *
 *  Y marcar SELLA la asignación del día marcado. Sin esto, una pestaña que cruza la
 *  medianoche abierta marca sobre una selección efímera (la asignación guardada quedó en
 *  ayer): el selector excluye la recién completada, sirve OTRA cápsula con el botón otra
 *  vez virgen, y cada toque suma un «día» — defecto real del 2026-08-08, cazado grabando
 *  un video pasada la medianoche. La marca es un acto del padre: manda sobre el congelado
 *  viejo. */
export function marcarCompletada(
  fecha: string,
  capsulaId: string,
  etapa: Etapa,
  progreso: Progreso,
): Progreso {
  const yaCompletada = progreso.historial.some(
    (h) => h.fecha === fecha && h.capsulaId === capsulaId,
  );
  if (yaCompletada) return progreso;

  const estadoEtapa = progreso.porEtapa[etapa] ?? ETAPA_VACIA;
  const asignada = estadoEtapa.asignacionHoy;
  const sellada = asignada?.fecha === fecha && asignada.capsulaId === capsulaId;

  return {
    ...progreso,
    porEtapa: {
      ...progreso.porEtapa,
      [etapa]: {
        ...estadoEtapa,
        asignacionHoy: sellada ? asignada : { fecha, capsulaId },
        // La asignación vieja rota a "ayer" (mismo giro que hace el selector), para que
        // mañana no se repita la que quedó atrás sin completar.
        asignacionAyer: sellada
          ? estadoEtapa.asignacionAyer
          : (asignada ?? estadoEtapa.asignacionAyer),
        cicloCompletadas: estadoEtapa.cicloCompletadas.includes(capsulaId)
          ? estadoEtapa.cicloCompletadas
          : [...estadoEtapa.cicloCompletadas, capsulaId],
      },
    },
    historial: [...progreso.historial, { capsulaId, fecha }],
  };
}

/** Días únicos practicados: dos cápsulas marcadas el mismo día son UN día. Es lo que el
 *  contador de "Hoy" afirma («han practicado juntos N días»), así que se cuenta por fecha
 *  — contar entradas del historial inflaba el número cuando un día marcaba dos etapas. */
export function diasPracticados(historial: Progreso["historial"]): number {
  return new Set(historial.map((h) => h.fecha)).size;
}
