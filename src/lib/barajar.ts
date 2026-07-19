// Baraja DETERMINISTA por semilla (LCG + Fisher-Yates). Motor puro: sin Math.random, así el orden
// es estable entre renders y TESTEABLE (una semilla → un orden). Lo comparten los juegos que
// necesitan un orden variado pero reproducible (palabra↔objeto, palabras gemelas).

export function barajar<T>(items: readonly T[], semilla: number): T[] {
  const copia = [...items];
  let estado = semilla || 1;
  for (let i = copia.length - 1; i > 0; i--) {
    estado = (estado * 1103515245 + 12345) & 0x7fffffff;
    const j = estado % (i + 1);
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}
