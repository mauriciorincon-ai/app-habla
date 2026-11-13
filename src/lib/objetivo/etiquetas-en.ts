// Las etiquetas del objetivo de la semana, dichas en inglés (S8). Las cápsulas se etiquetan con el
// vocabulario CONTROLADO de `ETIQUETAS_CAPSULA` (en español, porque es la clave del contenido); un padre
// que escribe su objetivo en inglés escribe «feelings» o «bath», y esta tabla dice a qué etiqueta
// corresponde. Redactada para el inglés (no traducida palabra a palabra): cada etiqueta lleva las
// palabras con que un adulto la nombraría. Ninguna es una palabra de color (un objetivo como «colors» no
// coincide con nada, y la app lo dice de frente: regla dura 3).

import type { EtiquetaCapsula } from "@content/schema";

export const ETIQUETA_EN: Record<EtiquetaCapsula, readonly string[]> = {
  animales: ["animals", "pets"],
  carros: ["cars", "vehicles", "transport"],
  espacio: ["space"],
  música: ["music"],
  mar: ["sea", "ocean"],
  comida: ["food", "meals", "eating"],
  baño: ["bath", "bathroom", "toilet", "potty"],
  dormir: ["sleep", "bedtime", "naps"],
  vestirse: ["dressing", "clothes"],
  calle: ["street", "outside", "walks"],
  mercado: ["market", "shopping", "shop"],
  parque: ["park", "playground"],
  sonidos: ["sounds", "noises"],
  canciones: ["songs", "singing"],
  turnos: ["turns", "turn-taking"],
  espera: ["waiting", "pausing"],
  pedir: ["asking", "requests", "requesting"],
  acciones: ["actions", "verbs"],
  emociones: ["feelings", "emotions"],
  elegir: ["choosing", "choices"],
  imitación: ["imitation", "copying"],
  agua: ["water"],
  juego: ["play", "games"],
};
