// El gate de sensibilidad del repo, en versión que corre en el navegador y en Node (Web Crypto): la
// misma normalización y los mismos n-gramas de 1 a 5 que `scripts/lib/sensibilidad.ts`, contra las
// huellas SHA-256 de `tests/fixtures/sensibilidad-hashes.json`. Corre sobre cada lote de cuentos antes
// de que entre (ADR-019). Jamás devuelve el texto que coincidió: solo si hubo coincidencia.

export const N_MAX = 5;

export function normalizar(texto: string): string[] {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);
}

async function sha256(s: string): Promise<string> {
  const bytes = await globalThis.crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(s),
  );
  return Array.from(new Uint8Array(bytes), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
}

/** ¿Algún n-grama del texto está en el conjunto de huellas? */
export async function tocaLaLista(
  texto: string,
  huellas: ReadonlySet<string>,
): Promise<boolean> {
  if (huellas.size === 0) return false;
  const palabras = normalizar(texto);
  for (let a = 0; a < palabras.length; a++) {
    for (let n = 1; n <= N_MAX && a + n <= palabras.length; n++) {
      if (huellas.has(await sha256(palabras.slice(a, a + n).join(" "))))
        return true;
    }
  }
  return false;
}
