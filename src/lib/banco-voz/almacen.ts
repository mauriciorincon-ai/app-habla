// ALMACÉN del banco de voz (ADR-010) — IndexedDB con Blobs. Es el ÚNICO sitio de la app que
// persiste audio, y lo hace SOLO en el dispositivo: aquí no hay una sola llamada de red (regla
// dura 2-bis; el candado ESLint de banco-voz/** lo vigila, y el e2e cero-red lo confirma).
//
// Guardado por disponibilidad (como localStorage): en SSR o sin IndexedDB, las operaciones son
// no-ops seguras y la app cae al fallback sin romperse.

const DB = "habla-banco-voz";
const STORE = "grabaciones";
const VERSION = 1;

export type Grabacion = {
  blob: Blob;
  /** El contenedor/códec con que se grabó (p. ej. "audio/webm;codecs=opus"). */
  mimeType: string;
  duracionMs: number;
  /** YYYY-MM-DD local de la grabación. */
  fecha: string;
};

// Se guarda el audio como ArrayBuffer, NO como Blob: el Blob no sobrevive el structured-clone de
// forma portable entre entornos (jsdom/tests). El ArrayBuffer sí, siempre. El Blob se reconstruye
// al leer, con su mimeType.
type GrabacionAlmacenada = {
  datos: ArrayBuffer;
  mimeType: string;
  duracionMs: number;
  fecha: string;
};

function disponible(): boolean {
  return typeof indexedDB !== "undefined";
}

// Una sola conexión viva por sesión: abrir/cerrar en cada operación carrea con las transacciones.
let conexion: Promise<IDBDatabase> | null = null;

function abrir(): Promise<IDBDatabase> {
  if (conexion) return conexion;
  conexion = new Promise((res, rej) => {
    const req = indexedDB.open(DB, VERSION);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) {
        req.result.createObjectStore(STORE);
      }
    };
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });
  return conexion;
}

function conStore<T>(
  modo: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return abrir().then(
    (db) =>
      new Promise<T>((res, rej) => {
        const tx = db.transaction(STORE, modo);
        const req = fn(tx.objectStore(STORE));
        tx.oncomplete = () => res(req.result);
        tx.onabort = () => rej(tx.error);
        req.onerror = () => rej(req.error);
      }),
  );
}

export async function guardarGrabacion(
  id: string,
  grabacion: Grabacion,
): Promise<void> {
  if (!disponible()) return;
  const almacenada: GrabacionAlmacenada = {
    datos: await grabacion.blob.arrayBuffer(),
    mimeType: grabacion.mimeType,
    duracionMs: grabacion.duracionMs,
    fecha: grabacion.fecha,
  };
  await conStore("readwrite", (s) => s.put(almacenada, id));
}

export async function obtenerGrabacion(id: string): Promise<Grabacion | null> {
  if (!disponible()) return null;
  const r = await conStore<GrabacionAlmacenada | undefined>("readonly", (s) =>
    s.get(id),
  );
  if (!r) return null;
  return {
    blob: new Blob([r.datos], { type: r.mimeType }),
    mimeType: r.mimeType,
    duracionMs: r.duracionMs,
    fecha: r.fecha,
  };
}

export async function borrarGrabacion(id: string): Promise<void> {
  if (!disponible()) return;
  await conStore("readwrite", (s) => s.delete(id));
}

export async function listarIds(): Promise<string[]> {
  if (!disponible()) return [];
  const claves = await conStore<IDBValidKey[]>("readonly", (s) =>
    s.getAllKeys(),
  );
  return claves.map(String);
}

/** Borra TODO el banco (lo usa "borrar el banco" de Ajustes). */
export async function vaciarBanco(): Promise<void> {
  if (!disponible()) return;
  await conStore("readwrite", (s) => s.clear());
}

/**
 * Elimina la base ENTERA (lo usa "Borrar mis datos"). Fire-and-forget: si algo la tiene abierta,
 * el borrado queda encolado. Sin esto, "borrar mis datos" dejaría la voz de la familia atrás.
 */
export function eliminarBanco(): void {
  if (!disponible()) return;
  try {
    // Cerrar la conexión viva primero, o el deleteDatabase queda bloqueado.
    if (conexion) {
      void conexion.then((db) => db.close());
      conexion = null;
    }
    indexedDB.deleteDatabase(DB);
  } catch {
    // El desalojo del banco es best-effort; nunca debe romper el "borrar mis datos".
  }
}

/**
 * Pide al navegador que NO desaloje este almacenamiento (las grabaciones son caras de rehacer).
 * Devuelve si quedó persistente. Puede negarse (headless, sin engagement) — no es un error.
 */
export async function pedirPersistencia(): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.storage?.persist)
    return false;
  try {
    return await navigator.storage.persist();
  } catch {
    return false;
  }
}
