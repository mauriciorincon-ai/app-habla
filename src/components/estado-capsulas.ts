"use client";

// La cápsula del día, del lado del cliente. Vive APARTE de `estado-local` a propósito: importar
// este módulo arrastra la biblioteca entera (50 cápsulas ≈ 65 KB de JS), y solo dos pantallas la
// necesitan —"Hoy" y el juego del globo, que marca el día como hecho—. El cohete y palabra↔objeto
// solo necesitan los ajustes, así que no la cargan.
//
// (Lo destapó el gate de performance del S2: los tres juegos descargaban la biblioteca completa
// aunque dos de ellos no muestren ni una cápsula.)

import { CAPSULAS } from "@content/capsulas";
import type { Capsula, Etapa } from "@content/schema";
import {
  claveFechaLocal,
  marcarCompletada,
  realinearObjetivo,
  seleccionarCapsula,
} from "@/lib/coach/daily";
import { alinear } from "@/lib/objetivo/alinear";
import { leerObjetivo } from "@/lib/storage/local";
import type { Progreso } from "@/lib/storage/schemas";
import {
  ajustesActuales,
  guardarProgresoEnStore,
  progresoActual,
} from "./estado-local";

/** El predicado del objetivo de la semana ACTIVO: ¿esta cápsula sirve al objetivo escrito? */
function coincideConObjetivo(): (c: Capsula) => boolean {
  const objetivo = alinear(leerObjetivo()?.texto);
  return (c) => objetivo.coincideEtiquetas(c.etiquetas);
}

/**
 * La cápsula de hoy — apta para el render (no escribe nada). Determinista: con el mismo progreso,
 * fecha y etapa devuelve siempre la misma (ADR 006). Con un objetivo de la semana activo, una
 * asignación NUEVA del día prefiere una cápsula que le sirva (una ya congelada no se toca aquí).
 */
export function capsulaDeHoy(progreso: Progreso, etapa: Etapa) {
  const fecha = claveFechaLocal(new Date());
  return {
    ...seleccionarCapsula(
      fecha,
      progreso,
      CAPSULAS,
      etapa,
      coincideConObjetivo(),
    ),
    fecha,
  };
}

/**
 * Fija la asignación del día en el almacenamiento (efecto, nunca en el render). A partir de aquí
 * la cápsula de hoy no cambia: ni al recargar, ni al completarla, ni al volver por la noche.
 * (Sí cambia si el padre cambia de etapa — y vuelve si regresa a la etapa el mismo día.)
 */
export function asegurarAsignacionDeHoy(): void {
  const progreso = progresoActual();
  const { progreso: siguiente } = capsulaDeHoy(
    progreso,
    ajustesActuales().etapa,
  );
  if (siguiente !== progreso) {
    guardarProgresoEnStore(siguiente);
  }
}

/**
 * Aplica el objetivo de la semana a la cápsula de HOY — se llama al escribir o borrar el objetivo.
 * Es la ÚNICA vía que re-evalúa una asignación ya congelada, y solo si NO está completada (el
 * trabajo hecho es intocable, R4). Si no cambia nada, no toca el store.
 */
export function aplicarObjetivoAHoy(): void {
  const fecha = claveFechaLocal(new Date());
  const progreso = progresoActual();
  const etapa = ajustesActuales().etapa;
  const siguiente = realinearObjetivo(
    fecha,
    progreso,
    CAPSULAS,
    etapa,
    coincideConObjetivo(),
  );
  if (siguiente !== progreso) {
    guardarProgresoEnStore(siguiente);
  }
}

export function marcarCapsulaHecha(
  fecha: string,
  capsulaId: string,
  etapa: Etapa,
): void {
  guardarProgresoEnStore(
    marcarCompletada(fecha, capsulaId, etapa, progresoActual()),
  );
}
