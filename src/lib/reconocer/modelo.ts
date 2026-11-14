// The recognizer's files on the device (S11, ADR-023): download (only on the adult's tap in Ajustes),
// check by SHA-256, keep, hand over as blobs, delete. This module never sees audio: it moves the
// engine and the model, nothing of the child (tests/unit/privacidad-voice.test.ts checks it does not
// import the voice engine).
//
// Where things live: the three files in the Cache API (`habla-reconocedor-v1`); the unpacked model in
// the Worker's own IndexedDB database (`/vosk`, vosk-browser's IDBFS). «Borrar el reconocedor» and
// «Borrar mis datos» remove both.

import manifiesto from "../../../scripts/modelos.json";
import { preludio } from "./preludio";

export const IDIOMAS_RECONOCEDOR = ["es", "en"] as const;
export type IdiomaReconocedor = (typeof IDIOMAS_RECONOCEDOR)[number];

export const CACHE_RECONOCEDOR = "habla-reconocedor-v1";
/** The IndexedDB database vosk-browser mounts for its unpacked model (IDBFS at "/vosk"). */
export const BASE_DEL_MOTOR = "/vosk";

type Archivo = { ruta: string; sha256: string; tipo: string };

const RUTA_WORKER = "/vosk/vosk.worker.js";
const RUTA_WASM = "/vosk/vosk.wasm";

export function archivosDe(idioma: IdiomaReconocedor): Archivo[] {
  return [
    {
      ruta: RUTA_WORKER,
      sha256: manifiesto.motor.archivos["vosk.worker.js"],
      tipo: "text/javascript",
    },
    {
      ruta: RUTA_WASM,
      sha256: manifiesto.motor.archivos["vosk.wasm"],
      tipo: "application/wasm",
    },
    {
      ruta: rutaModelo(idioma),
      sha256: manifiesto.modelos[idioma].sha256,
      tipo: "application/zip",
    },
  ];
}

export const rutaModelo = (idioma: IdiomaReconocedor) =>
  `/modelos/${idioma}.zip`;

/** Stable address that names vosk's unpacked copy; the hash in it changes when the model changes. */
export const direccionModelo = (idioma: IdiomaReconocedor) =>
  `${rutaModelo(idioma)}?v=${manifiesto.modelos[idioma].sha256.slice(0, 12)}`;

/** Bytes the adult downloads for one language (the model plus the engine, shared). */
export function bytesDe(idioma: IdiomaReconocedor, conMotor = true): number {
  return manifiesto.modelos[idioma].bytes + (conMotor ? 3_200_000 : 0);
}

export async function sha256Hex(datos: ArrayBuffer): Promise<string> {
  const h = await crypto.subtle.digest("SHA-256", datos);
  return [...new Uint8Array(h)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const cacheDisponible = () => typeof caches !== "undefined";

/** True when the three files of this language are on the device. */
export async function estaDescargado(
  idioma: IdiomaReconocedor,
): Promise<boolean> {
  // `caches.open` would CREATE an empty cache after «Borrar el reconocedor»: ask first.
  if (!cacheDisponible() || !(await caches.has(CACHE_RECONOCEDOR))) return false;
  const c = await caches.open(CACHE_RECONOCEDOR);
  for (const a of archivosDe(idioma))
    if (!(await c.match(a.ruta))) return false;
  return true;
}

export type Progreso = { bytes: number; total: number };

async function leerConProgreso(
  r: Response,
  alAvanzar: (bytes: number) => void,
): Promise<ArrayBuffer> {
  if (!r.body) return r.arrayBuffer();
  const lector = r.body.getReader();
  const partes: Uint8Array[] = [];
  let n = 0;
  for (;;) {
    const { done, value } = await lector.read();
    if (done) break;
    partes.push(value);
    n += value.byteLength;
    alAvanzar(n);
  }
  const todo = new Uint8Array(n);
  let o = 0;
  for (const p of partes) {
    todo.set(p, o);
    o += p.byteLength;
  }
  return todo.buffer;
}

/**
 * Downloads this language's files from the app's own origin (on the adult's tap), checks each one
 * against its pinned hash and keeps it. A file that does not match is not kept, and the whole call fails.
 */
export async function descargar(
  idioma: IdiomaReconocedor,
  alProgreso: (p: Progreso) => void = () => undefined,
): Promise<void> {
  if (!cacheDisponible()) throw new Error("reconocedor-sin-cache");
  const c = await caches.open(CACHE_RECONOCEDOR);
  const pendientes: Archivo[] = [];
  for (const a of archivosDe(idioma))
    if (!(await c.match(a.ruta))) pendientes.push(a);
  const total = pendientes.reduce(
    (s, a) =>
      s +
      (a.ruta === RUTA_WORKER
        ? 200_000
        : a.ruta === RUTA_WASM
          ? 3_000_000
          : manifiesto.modelos[idioma].bytes),
    0,
  );
  let hechos = 0;
  for (const a of pendientes) {
    const r = await fetch(a.ruta, { cache: "no-store" });
    if (!r.ok) throw new Error("reconocedor-descarga");
    const datos = await leerConProgreso(r, (b) =>
      alProgreso({ bytes: hechos + b, total }),
    );
    if ((await sha256Hex(datos)) !== a.sha256)
      throw new Error("reconocedor-huella");
    await c.put(
      a.ruta,
      new Response(datos, {
        headers: {
          "content-type": a.tipo,
          "content-length": String(datos.byteLength),
        },
      }),
    );
    hechos += datos.byteLength;
  }
  alProgreso({ bytes: total, total });
}

export type ArchivosListos = {
  /** Source of the Worker: the network-removing prelude followed by vosk-browser's worker. */
  worker: Blob;
  wasm: Blob;
  modelo: Blob;
};

/** Reads the kept files and checks them again (no network). Null if any is missing or altered. */
export async function cargar(
  idioma: IdiomaReconocedor,
): Promise<ArchivosListos | null> {
  if (!cacheDisponible() || !(await caches.has(CACHE_RECONOCEDOR))) return null;
  const c = await caches.open(CACHE_RECONOCEDOR);
  const blobs: Blob[] = [];
  for (const a of archivosDe(idioma)) {
    const r = await c.match(a.ruta);
    if (!r) return null;
    const datos = await r.arrayBuffer();
    if ((await sha256Hex(datos)) !== a.sha256) return null;
    blobs.push(new Blob([datos], { type: a.tipo }));
  }
  const [worker, wasm, modelo] = blobs;
  return { worker, wasm, modelo };
}

export type MotorAbierto = {
  worker: Worker;
  modelUrl: string;
  wasmUrl: string;
  /** Revokes the blob: URLs. The Worker itself is closed by the listener (src/lib/voice/escucha.ts). */
  soltar(): void;
};

/** Starts the recognizer Worker from verified blobs, with its network taken away by the prelude. */
export function abrirMotor(
  idioma: IdiomaReconocedor,
  a: ArchivosListos,
): MotorAbierto {
  const wasmUrl = URL.createObjectURL(a.wasm);
  const modeloUrl = URL.createObjectURL(a.modelo);
  const modelUrl = direccionModelo(idioma);
  const fuente = new Blob(
    [preludio({ [modelUrl]: modeloUrl, [wasmUrl]: wasmUrl }), "\n", a.worker],
    {
      type: "text/javascript",
    },
  );
  const workerUrl = URL.createObjectURL(fuente);
  // vosk-browser ships its worker as an ES module.
  const worker = new Worker(workerUrl, { type: "module" });
  return {
    worker,
    modelUrl,
    wasmUrl,
    soltar() {
      for (const u of [wasmUrl, modeloUrl, workerUrl]) URL.revokeObjectURL(u);
    },
  };
}

function borrarBase(nombre: string): Promise<void> {
  return new Promise((res) => {
    if (typeof indexedDB === "undefined") return res();
    const r = indexedDB.deleteDatabase(nombre);
    r.onsuccess = r.onerror = r.onblocked = () => res();
  });
}

/** «Borrar el reconocedor»: the kept files and the Worker's unpacked model. */
export async function borrar(): Promise<void> {
  if (cacheDisponible())
    await caches.delete(CACHE_RECONOCEDOR).catch(() => false);
  await borrarBase(BASE_DEL_MOTOR);
}
