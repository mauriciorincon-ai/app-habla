// «Pasar a la otra casa» (S10, ADR-020) — el cifrado. Decisión del dueño «1a»: el archivo va cifrado
// con una frase que el adulto escribe al crearlo y al abrirlo. Web Crypto del navegador, sin
// dependencias: PBKDF2-SHA-256 (sal aleatoria) deriva la llave y AES-GCM-256 cifra y AUTENTICA. Con
// otra frase, o con un byte cambiado, el descifrado falla y no se lee nada. La frase no se guarda en
// ningún lado ni viaja en el archivo. Sin red (el candado de privacidad-banco cubre esta carpeta).

export const FORMATO = "habla-otra-casa";
export const VERSION_SOBRE = 1;
export const ITERACIONES = 600_000;
export const FRASE_MINIMA = 10;
/** Un archivo ajeno no puede pedir menos trabajo (llave débil) ni muchísimo más (colgar la app). */
const ITERACIONES_ACEPTADAS = { min: 100_000, max: 2_000_000 };

export type Sobre = {
  formato: typeof FORMATO;
  version: typeof VERSION_SOBRE;
  kdf: { nombre: "PBKDF2-SHA-256"; iteraciones: number; sal: string };
  cifrado: { nombre: "AES-GCM-256"; iv: string };
  datos: string;
};

export type Descifrado =
  { ok: true; texto: string } | { ok: false; motivo: "formato" | "frase" };

export function fraseValida(frase: string): boolean {
  return frase.trim().length >= FRASE_MINIMA;
}

function sutil(): SubtleCrypto {
  const c = globalThis.crypto;
  if (!c?.subtle) throw new Error("web-crypto-no-disponible");
  return c.subtle;
}

const B64 = /^[A-Za-z0-9+/]*={0,2}$/;

export function aBase64(bytes: Uint8Array): string {
  let s = "";
  const TROZO = 0x8000;
  for (let i = 0; i < bytes.length; i += TROZO) {
    s += String.fromCharCode(...bytes.subarray(i, i + TROZO));
  }
  return btoa(s);
}

export function deBase64(b64: string): Uint8Array<ArrayBuffer> | null {
  if (b64.length % 4 !== 0 || !B64.test(b64)) return null;
  try {
    const s = atob(b64);
    const out = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
    return out;
  } catch {
    return null;
  }
}

async function derivarLlave(
  frase: string,
  sal: Uint8Array<ArrayBuffer>,
  iteraciones: number,
): Promise<CryptoKey> {
  const s = sutil();
  const base = await s.importKey(
    "raw",
    new TextEncoder().encode(frase.trim().normalize("NFC")),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return s.deriveKey(
    { name: "PBKDF2", hash: "SHA-256", salt: sal, iterations: iteraciones },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

/** Cifra el texto con la frase. La sal y el IV son nuevos en cada archivo. */
export async function cifrar(
  texto: string,
  frase: string,
  iteraciones: number = ITERACIONES,
): Promise<Sobre> {
  if (!fraseValida(frase)) throw new Error("frase-corta");
  const sal = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const llave = await derivarLlave(frase, sal, iteraciones);
  const cifrado = await sutil().encrypt(
    { name: "AES-GCM", iv },
    llave,
    new TextEncoder().encode(texto),
  );
  return {
    formato: FORMATO,
    version: VERSION_SOBRE,
    kdf: { nombre: "PBKDF2-SHA-256", iteraciones, sal: aBase64(sal) },
    cifrado: { nombre: "AES-GCM-256", iv: aBase64(iv) },
    datos: aBase64(new Uint8Array(cifrado)),
  };
}

function leerSobre(
  crudo: unknown,
): {
  sal: Uint8Array<ArrayBuffer>;
  iv: Uint8Array<ArrayBuffer>;
  datos: Uint8Array<ArrayBuffer>;
  iteraciones: number;
} | null {
  if (!crudo || typeof crudo !== "object") return null;
  const s = crudo as Record<string, unknown>;
  if (s.formato !== FORMATO || s.version !== VERSION_SOBRE) return null;
  const kdf = s.kdf as Record<string, unknown> | undefined;
  const cif = s.cifrado as Record<string, unknown> | undefined;
  if (
    !kdf ||
    kdf.nombre !== "PBKDF2-SHA-256" ||
    !cif ||
    cif.nombre !== "AES-GCM-256"
  )
    return null;
  const it = kdf.iteraciones;
  if (
    typeof it !== "number" ||
    !Number.isInteger(it) ||
    it < ITERACIONES_ACEPTADAS.min ||
    it > ITERACIONES_ACEPTADAS.max
  )
    return null;
  if (
    typeof kdf.sal !== "string" ||
    typeof cif.iv !== "string" ||
    typeof s.datos !== "string"
  )
    return null;
  const sal = deBase64(kdf.sal);
  const iv = deBase64(cif.iv);
  const datos = deBase64(s.datos);
  if (
    !sal ||
    sal.length !== 16 ||
    !iv ||
    iv.length !== 12 ||
    !datos ||
    datos.length < 17
  )
    return null;
  return { sal, iv, datos, iteraciones: it };
}

/**
 * Descifra. Un sobre que no es de esta app → «formato»; la frase equivocada (o un archivo alterado,
 * que AES-GCM detecta igual) → «frase». En ningún caso se devuelve algo a medio leer.
 */
export async function descifrar(
  crudo: unknown,
  frase: string,
): Promise<Descifrado> {
  const sobre = leerSobre(crudo);
  if (!sobre) return { ok: false, motivo: "formato" };
  sutil(); // sin Web Crypto no es una frase mala: se avisa aparte (lanza web-crypto-no-disponible)
  try {
    const llave = await derivarLlave(frase, sobre.sal, sobre.iteraciones);
    const claro = await sutil().decrypt(
      { name: "AES-GCM", iv: sobre.iv },
      llave,
      sobre.datos,
    );
    return { ok: true, texto: new TextDecoder().decode(claro) };
  } catch {
    return { ok: false, motivo: "frase" };
  }
}
