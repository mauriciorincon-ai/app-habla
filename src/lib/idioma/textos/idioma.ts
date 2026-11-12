import type { Texto } from "../index";

// El conmutador de idioma (Ajustes). Cada idioma se nombra en su propio idioma, sin banderas: una
// bandera es un país, no un idioma, y el color nunca va solo.
export const idioma = {
  titulo: { es: "Idioma de la app", en: "App language" },
  ayuda: {
    es: "Cambia al instante todo lo que lee el adulto. Los juegos de palabras practican palabras en español; el globo y el cohete juegan igual en los dos idiomas.",
    en: "Changes everything the adult reads, right away. The word games practise Spanish words; the balloon and rocket play the same in both languages.",
  },
  seguirNavegador: { es: "Usar el idioma del dispositivo", en: "Use the device language" },
} satisfies Record<string, Texto>;
