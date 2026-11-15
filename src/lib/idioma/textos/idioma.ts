import type { Texto } from "../index";

// El conmutador de idioma (Ajustes). Cada idioma se nombra en su propio idioma, sin banderas: una
// bandera es un país, no un idioma, y el color nunca va solo.
export const idioma = {
  titulo: { es: "Idioma de la app", en: "App language" },
  ayuda: {
    es: "Cambia al instante todo lo que lee el adulto. Los juegos de palabras practican en el idioma elegido; los juegos de voz (el globo, soplar, fuerte y suave, el cohete y las vocales) juegan igual en los dos idiomas.",
    en: "Changes everything the adult reads, right away. The word games practise in the chosen language; the voice games (the balloon, blowing, loud and soft, the rocket and the vowels) play the same in both languages.",
  },
  seguirNavegador: {
    es: "Usar el idioma del dispositivo",
    en: "Use the device language",
  },
} satisfies Record<string, Texto>;
