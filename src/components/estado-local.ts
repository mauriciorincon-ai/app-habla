"use client";

// Puente entre el almacenamiento local y React.
//
// Se usa useSyncExternalStore (no useState + useEffect) por dos razones:
//   1. El servidor no tiene localStorage: el snapshot del servidor es `null`, así que la primera
//      pintura muestra el esqueleto y NO hay mismatch de hidratación.
//   2. Leer del store no es "sincronizar estado en un efecto" — es exactamente el caso de uso
//      para el que existe este hook.

import { useSyncExternalStore } from "react";
import { CAPSULAS } from "@content/capsulas";
import {
  claveFechaLocal,
  marcarCompletada,
  seleccionarCapsula,
} from "@/lib/coach/daily";
import {
  guardarAjustes,
  guardarPerfil,
  guardarProgreso,
  leerAjustes,
  leerPerfil,
  leerProgreso,
} from "@/lib/storage/local";
import type { AjustesGuardados, Perfil, Progreso } from "@/lib/storage/schemas";

type Store<T> = {
  subscribe: (oyente: () => void) => () => void;
  snapshot: () => T;
  set: (valor: T) => void;
};

function crearStore<T>(leer: () => T, guardar: (valor: T) => void): Store<T> {
  let cache: T;
  let cargado = false;
  const oyentes = new Set<() => void>();

  return {
    subscribe(oyente) {
      oyentes.add(oyente);
      return () => {
        oyentes.delete(oyente);
      };
    },
    // La referencia debe ser estable entre renders o React entra en bucle.
    snapshot() {
      if (!cargado) {
        cache = leer();
        cargado = true;
      }
      return cache;
    },
    set(valor) {
      cache = valor;
      cargado = true;
      guardar(valor);
      oyentes.forEach((oyente) => oyente());
    },
  };
}

const storeProgreso = crearStore<Progreso>(leerProgreso, guardarProgreso);
const storeAjustes = crearStore<AjustesGuardados>(leerAjustes, guardarAjustes);
const storePerfil = crearStore<Perfil | null>(leerPerfil, (perfil) => {
  if (perfil) guardarPerfil(perfil);
});

const sinDatosEnServidor = () => null;

/** `null` hasta que hidrata (el servidor no puede saber qué guardó este dispositivo). */
export function useProgreso(): Progreso | null {
  return useSyncExternalStore(
    storeProgreso.subscribe,
    storeProgreso.snapshot,
    sinDatosEnServidor,
  );
}

export function useAjustes(): AjustesGuardados | null {
  return useSyncExternalStore(
    storeAjustes.subscribe,
    storeAjustes.snapshot,
    sinDatosEnServidor,
  );
}

export function usePerfil(): Perfil | null {
  return useSyncExternalStore(
    storePerfil.subscribe,
    storePerfil.snapshot,
    sinDatosEnServidor,
  );
}

export function guardarAjustesEnStore(ajustes: AjustesGuardados): void {
  storeAjustes.set(ajustes);
}

export function guardarPerfilEnStore(perfil: Perfil): void {
  storePerfil.set(perfil);
}

/** Los ajustes ya guardados, disponibles fuera de React (p. ej. al iniciar el juego). */
export function ajustesActuales(): AjustesGuardados {
  return storeAjustes.snapshot();
}

/**
 * La cápsula de hoy — función PURA, apta para usarse en el render (no escribe nada).
 * Es determinista: con el mismo progreso y la misma fecha devuelve siempre la misma cápsula.
 */
export function capsulaDeHoy(progreso: Progreso) {
  const fecha = claveFechaLocal(new Date());
  return { ...seleccionarCapsula(fecha, progreso, CAPSULAS), fecha };
}

/**
 * Fija la asignación del día en el almacenamiento (efecto, nunca en el render). A partir de aquí
 * la cápsula de hoy no cambia: ni al recargar, ni al completarla, ni al volver por la noche.
 */
export function asegurarAsignacionDeHoy(): void {
  const progreso = storeProgreso.snapshot();
  const { progreso: siguiente } = capsulaDeHoy(progreso);
  if (siguiente !== progreso) {
    storeProgreso.set(siguiente);
  }
}

export function marcarCapsulaHecha(fecha: string, capsulaId: string): void {
  storeProgreso.set(
    marcarCompletada(fecha, capsulaId, storeProgreso.snapshot()),
  );
}

export function borrarTodoYRecargar(): void {
  // borrarTodo() vive en lib/storage; recargar deja la app en su estado de primera vez.
  void import("@/lib/storage/local").then(({ borrarTodo }) => {
    borrarTodo();
    window.location.href = "/";
  });
}
