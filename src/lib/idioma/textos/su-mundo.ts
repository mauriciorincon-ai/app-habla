import type { Texto } from "../index";
import type { Tema } from "@/lib/storage/temas";

// Su mundo en todo (S14, ADR-026): el nombre de cada protagonista dibujado (lo lee el lector de
// pantalla), la línea del adulto con las palabras a modelar y la tarjeta del recordatorio de cuentos.
// Escritos en cada idioma, no traducidos.

/** El protagonista es compañía de la escena: se nombra lo que ES, sin decir que haga nada. */
export const protagonistaNombre: Record<Tema, Texto> = {
  animales: { es: "Un gatito mira el juego", en: "A kitten watches the game" },
  carros: {
    es: "Un carrito mira el juego",
    en: "A little car watches the game",
  },
  espacio: {
    es: "Un planeta con anillo mira el juego",
    en: "A ringed planet watches the game",
  },
  dinosaurios: {
    es: "Un dinosaurio mira el juego",
    en: "A dinosaur watches the game",
  },
  musica: {
    es: "Dos notas musicales miran el juego",
    en: "Two musical notes watch the game",
  },
  mar: { es: "Un pez mira el juego", en: "A fish watches the game" },
};

export const suMundo = {
  /** En la tarjeta de guion y en el apuntador: lo que el ADULTO puede decir en su turno. */
  modele: {
    es: "Modele una palabra de su meta:",
    en: "Model a word from their goal:",
  },
  /** Franja del apuntador, turno del adulto: una palabra para decir, nunca una orden al niño. */
  apuntadorPalabra: {
    es: "Puede decir:",
    en: "You could say:",
  },
  recordatorio: {
    titulo: { es: "Los cuentos del mes", en: "This month's stories" },
    nunca: {
      es: "Aún no ha pedido su primer lote de cuentos. Son cuentos con lo que le encanta, y usted los aprueba antes de que él los vea.",
      en: "You haven't ordered a first batch of stories yet. They are built around what they love, and you approve them before they see them.",
    },
    vencido: {
      es: "Hace {dias} días que llegó el último lote. Puede pedir el de este mes cuando le quede bien.",
      en: "The last batch came {dias} days ago. You can order this month's whenever it suits you.",
    },
    pedir: {
      es: "Pedir los cuentos del mes",
      en: "Order this month's stories",
    },
    ahoraNo: { es: "Ahora no", en: "Not now" },
  },
  /** El perfil: «otras cosas que le encantan» (la única casa de sus intereses). */
  perfil: {
    etiqueta: {
      es: "Otras cosas que le encantan",
      en: "Other things they love",
    },
    ayuda: {
      es: "Una por una, de una a tres palabras. Se queda en este aparato y sirve para los cuentos y las hojas para imprimir.",
      en: "One at a time, from one to three words. It stays on this device and is used for the stories and the printable sheets.",
    },
    anadir: { es: "Añadir", en: "Add" },
    quitar: { es: "Quitar {valor}", en: "Remove {valor}" },
    error: {
      es: "Una a tres palabras, solo letras: «trenes», «burbujas de jabón».",
      en: "One to three words, letters only: “trains”, “soap bubbles”.",
    },
    sensible: {
      es: "Alguna de esas palabras no puede guardarse. Usa palabras generales, sin nombres.",
      en: "One of those words cannot be saved. Use general words, no names.",
    },
    noComprobado: {
      es: "No se pudo comprobar las palabras en este momento. Inténtalo de nuevo.",
      en: "The words could not be checked just now. Please try again.",
    },
    tope: {
      es: "Ya hay ocho: quita una para añadir otra.",
      en: "There are already eight: remove one to add another.",
    },
    marcador: {
      es: "Por ejemplo: trenes, burbujas",
      en: "For example: trains, bubbles",
    },
  },
};
