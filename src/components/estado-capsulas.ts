"use client";

// La cápsula del día, del lado del cliente. Vive APARTE de `estado-local` a propósito: importar
// este módulo arrastra la biblioteca entera (50 cápsulas ≈ 65 KB de JS), y solo dos pantallas la
// necesitan —"Hoy" y el juego del globo, que marca el día como hecho—. El cohete y palabra↔objeto
// solo necesitan los ajustes, así que no la cargan.
//
// (Lo destapó el gate de performance del S2: los tres juegos descargaban la biblioteca completa
// aunque dos de ellos no muestren ni una cápsula.)

import { CAPSULAS } from "@content/capsulas";
import type { Etapa } from "@content/schema";
import {
  claveFechaLocal,
  marcarCompletada,
  seleccionarCapsula,
} from "@/lib/coach/daily";
import type { Progreso } from "@/lib/storage/schemas";
import {
  ajustesActuales,
  guardarProgresoEnStore,
  progresoActual,
} from "./estado-local";

/**
 * La cápsula de hoy — función PURA, apta para usarse en el render (no escribe nada).
 * Es determinista: con el mismo progreso, la misma fecha y la misma etapa devuelve siempre
 * la misma cápsula (ADR 006: el selector filtra por la etapa activa).
 */
export function capsulaDeHoy(progreso: Progreso, etapa: Etapa) {
  const fecha = claveFechaLocal(new Date());
  return { ...seleccionarCapsula(fecha, progreso, CAPSULAS, etapa), fecha };
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

export function marcarCapsulaHecha(
  fecha: string,
  capsulaId: string,
  etapa: Etapa,
): void {
  guardarProgresoEnStore(
    marcarCompletada(fecha, capsulaId, etapa, progresoActual()),
  );
}
