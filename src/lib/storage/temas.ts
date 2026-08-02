// Los temas de interés del niño (onboarding). Viven en su propio módulo porque los consumen dos
// mundos: el almacenamiento local (perfil) y el contenido (la curaduría de pictogramas).
// Desde el Sprint 2 los temas HACEN algo: filtran los pictogramas del juego palabra↔objeto.

export const TEMAS = [
  "animales",
  "carros",
  "espacio",
  "dinosaurios",
  "musica",
  "mar",
] as const;

export type Tema = (typeof TEMAS)[number];

// La clave interna sigue siendo "carros" (compatibilidad con perfiles ya guardados); solo el
// nombre visible dice la verdad del grupo: carro, camión, bus, moto, tren, avión y bici
// (hallazgo G6 del gate S4 — "escojo carros y no son solo carros").
export const NOMBRE_TEMA: Record<Tema, string> = {
  animales: "Animales",
  carros: "Transporte",
  espacio: "El espacio",
  dinosaurios: "Dinosaurios",
  musica: "Música",
  mar: "El mar",
};
