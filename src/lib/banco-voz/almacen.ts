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

/**
 * ¿La base ya existe? Preguntar por el banco NO debe crearlo (remate S3): los juegos consultan
 * `listarIds` al montar, y `indexedDB.open` crea la base solo por abrirla — el e2e de privacidad
 * del S1 ("cero rastro en el almacenamiento durante el juego") lo cazó. Solo `guardarGrabacion`
 * tiene derecho a crearla. Sin la API `databases()` (Safari viejo), se abre igual: crear una base
 * vacía es el costo de saber, y el candado de CI corre en Chromium donde la API existe.
 */
async function bancoExiste(): Promise<boolean> {
  if (conexion) return true;
  if (typeof indexedDB.databases !== "function") return true;
  try {
    const bases = await indexedDB.databases();
    return bases.some((b) => b.name === DB);
  } catch {
    return true;
  }
}

// Una sola conexión viva por sesión: abrir/cerrar en cada operación carrea con las transacciones.
let conexion: Promise<IDBDatabase> | null = null;

function abrir(): Promise<IDBDatabase> {
  if (conexion) return conexion;
  const intento = new Promise<IDBDatabase>((res, rej) => {
    const req = indexedDB.open(DB, VERSION);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) {
        req.result.createObjectStore(STORE);
      }
    };
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });
  conexion = intento;
  // Un fallo al abrir NO se cachea: si fue transitorio, el próximo intento reabre en vez de
  // quedarse envenenado toda la sesión (hallazgo de la auditoría S3, M-1).
  intento.catch(() => {
    if (conexion === intento) conexion = null;
  });
  return intento;
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
  if (!(await bancoExiste())) return null;
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
  if (!(await bancoExiste())) return;
  await conStore("readwrite", (s) => s.delete(id));
}

export async function listarIds(): Promise<string[]> {
  if (!disponible()) return [];
  if (!(await bancoExiste())) return [];
  const claves = await conStore<IDBValidKey[]>("readonly", (s) =>
    s.getAllKeys(),
  );
  return claves.map(String);
}

/** Borra TODO el banco (lo usa "borrar el banco" de Ajustes). */
export async function vaciarBanco(): Promise<void> {
  if (!disponible()) return;
  if (!(await bancoExiste())) return;
  await conStore("readwrite", (s) => s.clear());
}

/**
 * Elimina la base ENTERA (lo usa "Borrar mis datos"). AWAITABLE (auditoría S3, A-3): antes era
 * fire-and-forget y la navegación inmediata podía ganarle la carrera al borrado — "Borrar mis
 * datos" habría dejado la voz de la familia atrás. Ahora: (1) se espera el cierre real de la
 * conexión viva, (2) se espera la resolución del deleteDatabase. `onblocked` también resuelve
 * (el borrado queda encolado por el navegador y esto jamás debe colgar el botón).
 */
export async function eliminarBanco(): Promise<void> {
  if (!disponible()) return;
  // Cerrar la conexión viva primero, o el deleteDatabase queda bloqueado.
  const viva = conexion;
  conexion = null;
  if (viva) {
    await viva.then(
      (db) => db.close(),
      () => undefined, // una conexión que nunca abrió no bloquea nada
    );
  }
  await new Promise<void>((res) => {
    try {
      const req = indexedDB.deleteDatabase(DB);
      req.onsuccess = () => res();
      req.onerror = () => res(); // best-effort: jamás romper el "borrar mis datos"
      req.onblocked = () => res();
    } catch {
      res();
    }
  });
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
