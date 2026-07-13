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

/** Fecha LOCAL del dispositivo como YYYY-MM-DD (con UTC, en Colombia el día cambiaría a las 7 p. m.). */
export function claveFechaLocal(fecha: Date): string {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

/** FNV-1a: hash estable y sin dependencias — la misma fecha da siempre la misma cápsula. */
function fnv1a(texto: string): number {
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

export function seleccionarCapsula(
  fecha: string,
  progreso: Progreso,
  biblioteca: readonly Capsula[],
  etapa: Etapa,
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

  const capsula =
    pendientes[fnv1a(`${fecha}:${etapa}:${ciclo}`) % pendientes.length];

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

/** Marcar completada es idempotente: dos toques no ensucian el historial. */
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

  return {
    ...progreso,
    porEtapa: {
      ...progreso.porEtapa,
      [etapa]: {
        ...estadoEtapa,
        cicloCompletadas: estadoEtapa.cicloCompletadas.includes(capsulaId)
          ? estadoEtapa.cicloCompletadas
          : [...estadoEtapa.cicloCompletadas, capsulaId],
      },
    },
    historial: [...progreso.historial, { capsulaId, fecha }],
  };
}
