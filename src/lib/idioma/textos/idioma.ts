import type { Texto } from "../index";

// El conmutador de idioma (Ajustes). Cada idioma se nombra en su propio idioma, sin banderas: una
// bandera es un país, no un idioma, y el color nunca va solo.
export const idioma = {
  titulo: { es: "Idioma de la app", en: "App language" },
  ayuda: {
    es: "Cambia al instante todo lo que lee el adulto. En inglés se practica en inglés: las palabras de los juegos de palabras llegan pronto.",
    en: "Changes everything the adult reads, right away. In English you practice in English: the word games will follow soon.",
  },
  seguirNavegador: { es: "Usar el idioma del dispositivo", en: "Use the device language" },
  activo: { es: "Elegido", en: "Selected" },
} satisfies Record<string, Texto>;
