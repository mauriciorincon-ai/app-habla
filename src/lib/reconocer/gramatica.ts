// Closed vocabulary for the recognizer (S11, ADR-023). The recognizer can only answer with one of the
// game's words or "[unk]" (anything else): it never transcribes free speech. PURE.

/** Lower-case, trimmed, no duplicates, in a stable order, plus "[unk]" at the end. */
export function gramatica(palabras: readonly string[]): string[] {
  const vistas = new Set<string>();
  for (const p of palabras) {
    const n = normalizar(p);
    if (n) vistas.add(n);
  }
  return [...[...vistas].sort(), "[unk]"];
}

/** The form the recognizer and the round compare: lower case, NFC, single spaces. */
export function normalizar(palabra: string): string {
  return palabra.normalize("NFC").trim().toLowerCase().replace(/\s+/g, " ");
}
