// ALMACÉN de la videoteca de la familia (S8) — IndexedDB con los clips que la familia eligió de
// su galería. Vive SOLO en el dispositivo: aquí no hay una sola llamada de red (el candado ESLint
// de videoteca/** y tests/unit/privacidad-videoteca.test.ts lo vigilan; el e2e de tráfico cero lo
// confirma). La app NO abre la cámara: los clips entran por <input type="file"> sin `capture`.
//
// Dos stores en una sola base: `meta` (liviano, para listar) y `datos` (el video). Guardado por
// disponibilidad: sin IndexedDB las operaciones son no-ops seguras.

import type { Conducta } from "./reglas";

const DB = "habla-videoteca";
const META = "meta";
const DATOS = "datos";
const VERSION = 1;

export type ClipMeta = {
  id: string;
  conducta: Conducta;
  /** Texto libre, solo local, opcional («quién aparece»). */
  quien: string;
  mimeType: string;
  duracionS: number;
  bytes: number;
  /** YYYY-MM-DD local. */
  fecha: string;
};

function disponible(): boolean {
  return typeof indexedDB !== "undefined";
}

let conexion: Promise<IDBDatabase> | null = null;

/** Preguntar por la videoteca NO debe crearla: solo `guardarClip` tiene derecho a crear la base. */
async function existe(): Promise<boolean> {
  if (conexion) return true;
  if (typeof indexedDB.databases !== "function") return true;
  try {
    return (await indexedDB.databases()).some((b) => b.name === DB);
  } catch {
    return true;
  }
}

function abrir(): Promise<IDBDatabase> {
  if (conexion) return conexion;
  const intento = new Promise<IDBDatabase>((res, rej) => {
    const req = indexedDB.open(DB, VERSION);
    req.onupgradeneeded = () => {
      for (const s of [META, DATOS]) {
        if (!req.result.objectStoreNames.contains(s)) req.result.createObjectStore(s);
      }
    };
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });
  conexion = intento;
  intento.catch(() => {
    if (conexion === intento) conexion = null;
  });
  return intento;
}

/** Una transacción sobre los dos stores; resuelve cuando la transacción completa. */
function transaccion<T>(
  modo: IDBTransactionMode,
  fn: (meta: IDBObjectStore, datos: IDBObjectStore) => IDBRequest<T> | void,
): Promise<T | undefined> {
  return abrir().then(
    (db) =>
      new Promise<T | undefined>((res, rej) => {
        const tx = db.transaction([META, DATOS], modo);
        const req = fn(tx.objectStore(META), tx.objectStore(DATOS));
        tx.oncomplete = () => res(req ? req.result : undefined);
        tx.onabort = () => rej(tx.error);
      }),
  );
}

/** Guarda un clip. Rechaza (y no deja nada a medias) si el almacenamiento falla o está lleno. */
export async function guardarClip(meta: ClipMeta, video: Blob): Promise<void> {
  if (!disponible()) throw new Error("sin-almacenamiento");
  const datos = await video.arrayBuffer();
  await transaccion("readwrite", (m, d) => {
    m.put(meta, meta.id);
    d.put(datos, meta.id);
  });
}

export async function listarClips(): Promise<ClipMeta[]> {
  if (!disponible() || !(await existe())) return [];
  const todos = await transaccion<ClipMeta[]>("readonly", (m) => m.getAll());
  return (todos ?? []).sort((a, b) => (a.fecha < b.fecha ? 1 : a.fecha > b.fecha ? -1 : a.id < b.id ? 1 : -1));
}

export async function obtenerClip(id: string): Promise<Blob | null> {
  if (!disponible() || !(await existe())) return null;
  const meta = await transaccion<ClipMeta | undefined>("readonly", (m) => m.get(id));
  const datos = await transaccion<ArrayBuffer | undefined>("readonly", (_m, d) => d.get(id));
  if (!meta || !datos) return null;
  return new Blob([datos], { type: meta.mimeType });
}

/** Borra UN clip (el borrado de un toque). */
export async function borrarClip(id: string): Promise<void> {
  if (!disponible() || !(await existe())) return;
  await transaccion("readwrite", (m, d) => {
    m.delete(id);
    d.delete(id);
  });
}

/**
 * Elimina la base ENTERA (lo usa «Borrar mis datos»). AWAITABLE: se espera el cierre real de la
 * conexión viva y la resolución del deleteDatabase; `onblocked` también resuelve, para que el
 * botón jamás cuelgue. Misma disciplina que `eliminarBanco` del banco de voz.
 */
export async function eliminarVideoteca(): Promise<void> {
  if (!disponible()) return;
  const viva = conexion;
  conexion = null;
  if (viva) {
    await viva.then(
      (db) => db.close(),
      () => undefined,
    );
  }
  await new Promise<void>((res) => {
    try {
      const req = indexedDB.deleteDatabase(DB);
      req.onsuccess = () => res();
      req.onerror = () => res();
      req.onblocked = () => res();
    } catch {
      res();
    }
  });
}
