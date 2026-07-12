// La estrella ⭐⭐⭐: la cápsula de HOY. Motor PURO y determinista.
//
// Garantías (bajo unit test):
//   - Ningún día se queda sin respuesta.
//   - La cápsula del día es ESTABLE: no cambia al recargar, ni al completarla, ni al volver más
//     tarde. Solo cambia cuando cambia el día.
//   - No se repite una cápsula hasta agotar la biblioteca; al agotarla empieza un ciclo nuevo
//     (el historial no se borra jamás — es memoria, no una racha que castigue).

import type { Capsula } from "@content/schema";
import type { Progreso } from "@/lib/storage/schemas";

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
): SeleccionDiaria {
  if (biblioteca.length === 0) {
    throw new Error(
      "La biblioteca de cápsulas está vacía: ningún día puede quedarse sin respuesta.",
    );
  }

  // 1. Ya hay cápsula asignada para hoy: es intocable (aunque ya se haya completado).
  const asignada = progreso.asignacionHoy;
  if (asignada?.fecha === fecha) {
    const capsula = biblioteca.find((c) => c.id === asignada.capsulaId);
    if (capsula) {
      return {
        capsula,
        progreso,
        completada: progreso.cicloCompletadas.includes(capsula.id),
      };
    }
    // La cápsula asignada ya no existe (se editó la biblioteca): se reasigna abajo.
  }

  // 2. Candidatas: las que faltan del ciclo actual.
  let ciclo = progreso.ciclo;
  let cicloCompletadas = progreso.cicloCompletadas;
  let pendientes = biblioteca.filter((c) => !cicloCompletadas.includes(c.id));

  // 3. Ciclo agotado: vuelta nueva (el historial queda intacto).
  if (pendientes.length === 0) {
    ciclo += 1;
    cicloCompletadas = [];
    pendientes = [...biblioteca];
  }

  // Evita repetir la de ayer cuando quedó sin completar (habiendo alternativas).
  const idAyer = progreso.asignacionAyer?.capsulaId;
  if (pendientes.length > 1 && idAyer) {
    const sinAyer = pendientes.filter((c) => c.id !== idAyer);
    if (sinAyer.length > 0) pendientes = sinAyer;
  }

  const capsula = pendientes[fnv1a(`${fecha}:${ciclo}`) % pendientes.length];

  return {
    capsula,
    completada: false,
    progreso: {
      ...progreso,
      ciclo,
      cicloCompletadas,
      asignacionAyer: progreso.asignacionHoy,
      asignacionHoy: { fecha, capsulaId: capsula.id },
    },
  };
}

/** Marcar completada es idempotente: dos toques no ensucian el historial. */
export function marcarCompletada(
  fecha: string,
  capsulaId: string,
  progreso: Progreso,
): Progreso {
  const yaCompletada = progreso.historial.some(
    (h) => h.fecha === fecha && h.capsulaId === capsulaId,
  );
  if (yaCompletada) return progreso;

  return {
    ...progreso,
    cicloCompletadas: progreso.cicloCompletadas.includes(capsulaId)
      ? progreso.cicloCompletadas
      : [...progreso.cicloCompletadas, capsulaId],
    historial: [...progreso.historial, { capsulaId, fecha }],
  };
}
