// Baraja DETERMINISTA por semilla (mulberry32 + Fisher-Yates). Motor puro: sin Math.random, así
// el orden es estable entre renders y TESTEABLE (una semilla → un orden). Lo comparten los juegos
// que necesitan un orden variado pero reproducible (palabra↔objeto, palabras gemelas).
//
// Historia (gate S4, bloque L): el LCG original tenía un sesgo aritmético grave — su
// multiplicador ≡ 9 (mod 12), así que los primeros saltos solo caían en {0, 3, 6, 9} y el
// PRIMER elemento de la lista quedaba desterrado a las últimas posiciones en el 99,8 % de las
// semillas (con 12 pares y sesiones de 6, "pato-gato" no salía JAMÁS). mulberry32 mezcla el
// estado completo en cada paso y reparte parejo; sigue siendo puro y reproducible.

export function barajar<T>(items: readonly T[], semilla: number): T[] {
  const copia = [...items];
  let estado = semilla >>> 0 || 1;
  const azar = () => {
    estado = (estado + 0x6d2b79f5) >>> 0;
    let t = estado;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(azar() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}
