import type { Texto } from "../index";

// Lo que el navegador y el sistema leen ANTES de que la app sepa el idioma elegido (la descripción
// de la ficha y el manifest de la PWA son estáticos): por eso viajan los dos idiomas juntos.
export const metadatos = {
  descripcionFicha: {
    es: "Su voz mueve el mundo. Práctica diaria de estimulación del habla en casa, para jugar juntos — complementaria y no sustitutiva de las terapias integrales del lenguaje.",
    en: "Their voice moves the world. Daily speech-stimulation practice at home, to play together — a complement to, never a replacement for, speech and language therapy.",
  },
  descripcionManifest: {
    es: "Su voz mueve el mundo. Práctica diaria de estimulación del habla, para jugar juntos en casa.",
    en: "Their voice moves the world. Daily speech-stimulation practice, to play together at home.",
  },
} satisfies Record<string, Texto>;

export const juntos = (x: Texto): string => `${x.es} · ${x.en}`;
