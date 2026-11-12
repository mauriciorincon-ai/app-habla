import type { Texto } from "../index";

// Los nombres de las cinco técnicas y de los temas de interés, en los dos idiomas. Las claves son
// las de content/schema.ts (TECNICAS) y src/lib/storage/temas.ts; el español es idéntico al de allí.
export const nombreTecnica: Record<string, Texto> = {
  modelado: { es: "Modelar", en: "Modeling" },
  "expansion-recast": { es: "Expandir lo que dijo", en: "Building on what they said" },
  "espera-estructurada": { es: "Esperar en silencio", en: "Waiting in silence" },
  "seguir-interes": { es: "Seguir su interés", en: "Following their interest" },
  "estimulacion-focalizada": { es: "Repetir una palabra clave", en: "Repeating a key word" },
};

export const nombreTema: Record<string, Texto> = {
  animales: { es: "Animales", en: "Animals" },
  carros: { es: "Transporte", en: "Vehicles" },
  espacio: { es: "El espacio", en: "Space" },
  dinosaurios: { es: "Dinosaurios", en: "Dinosaurs" },
  musica: { es: "Música", en: "Music" },
  mar: { es: "El mar", en: "The sea" },
};
