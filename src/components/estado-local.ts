"use client";

// Puente entre el almacenamiento local y React.
//
// Se usa useSyncExternalStore (no useState + useEffect) por dos razones:
//   1. El servidor no tiene localStorage: el snapshot del servidor es `null`, así que la primera
//      pintura muestra el esqueleto y NO hay mismatch de hidratación.
//   2. Leer del store no es "sincronizar estado en un efecto" — es exactamente el caso de uso
//      para el que existe este hook.

import { useSyncExternalStore } from "react";
import {
  borrarObjetivo,
  guardarAjustes,
  guardarObjetivo,
  guardarPerfil,
  guardarProgreso,
  leerAjustes,
  leerObjetivo,
  leerPerfil,
  leerProgreso,
} from "@/lib/storage/local";
import { fechaHoy } from "@/lib/fecha";
import type {
  AjustesGuardados,
  Objetivo,
  Perfil,
  Progreso,
} from "@/lib/storage/schemas";

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
const storeObjetivo = crearStore<Objetivo | null>(leerObjetivo, (obj) => {
  if (obj) guardarObjetivo(obj.texto);
  else borrarObjetivo();
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

/** El progreso guardado, fuera de React (lo usa el módulo de cápsulas). */
export function progresoActual(): Progreso {
  return storeProgreso.snapshot();
}

export function guardarProgresoEnStore(progreso: Progreso): void {
  storeProgreso.set(progreso);
}

/** El objetivo de la semana, reactivo (S4). `null` hasta hidratar y cuando no hay objetivo. */
export function useObjetivo(): Objetivo | null {
  return useSyncExternalStore(
    storeObjetivo.subscribe,
    storeObjetivo.snapshot,
    sinDatosEnServidor,
  );
}

/** Escribe el objetivo (texto vacío = quitarlo) y notifica a los suscriptores. `desde` = hoy. */
export function guardarObjetivoEnStore(texto: string): void {
  const limpio = texto.trim();
  storeObjetivo.set(limpio ? { texto: limpio, desde: fechaHoy() } : null);
}

export function borrarObjetivoEnStore(): void {
  storeObjetivo.set(null);
}

export function borrarTodoYRecargar(): void {
  // borrarTodo() vive en lib/storage; recargar deja la app en su estado de primera vez.
  // La navegación ESPERA al borrado (el banco de voz vive en IndexedDB y su eliminación es
  // async — auditoría S3, A-3), con un tope de gracia para que el botón jamás se cuelgue.
  void import("@/lib/storage/local").then(async ({ borrarTodo }) => {
    const gracia = new Promise<void>((res) => setTimeout(res, 2000));
    await Promise.race([borrarTodo().catch(() => undefined), gracia]);
    window.location.href = "/";
  });
}
