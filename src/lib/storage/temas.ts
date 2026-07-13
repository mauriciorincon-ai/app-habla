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

export const NOMBRE_TEMA: Record<Tema, string> = {
  animales: "Animales",
  carros: "Carros",
  espacio: "El espacio",
  dinosaurios: "Dinosaurios",
  musica: "Música",
  mar: "El mar",
};
