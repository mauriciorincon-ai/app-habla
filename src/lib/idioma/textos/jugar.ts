import type { Catalogo } from "../index";

// El selector de juegos (/jugar): siempre en el mismo orden; el texto pequeño es para el adulto.
export const jugar = {
  tituloPestana: { es: "A jugar con tu voz · Hablemos San", en: "Play with your voice · Hablemos San" },
  titulo: { es: "¿A qué jugamos hoy?", en: "What shall we play today?" },
  intro: {
    antes: { es: "Todos se juegan", en: "Every game is played" },
    enfasis: { es: "juntos", en: "together" },
    despues: {
      es: ": usted dirige, la pantalla es la utilería. Ninguno le exige palabras al niño — y nada de lo que él diga se graba ni sale de este dispositivo.",
      en: ": you lead, the screen is just a prop. None of them asks the child for words — and nothing they say is recorded or leaves this device.",
    },
  },
  globo: {
    nombre: { es: "El globo", en: "The balloon" },
    que: { es: "Vuela mientras él sostiene la voz.", en: "It floats up while they hold their voice." },
    mide: { es: "Mide cuánto dura su voz.", en: "Measures how long their voice lasts." },
  },
  cohete: {
    nombre: { es: "El cohete", en: "The rocket" },
    que: { es: "Sube cuando su voz sube de tono.", en: "It rises when their voice goes higher." },
    mide: { es: "Mide el tono de su voz.", en: "Measures the pitch of their voice." },
  },
  palabras: {
    nombre: { es: "Palabra y dibujo", en: "Word and picture" },
    que: { es: "Cualquier sonido enciende el dibujo.", en: "Any sound lights up the picture." },
    mide: {
      es: "Mide que hubo voz — nunca qué palabra dijo.",
      en: "Measures that there was voice — never which word they said.",
    },
  },
  gemelas: {
    nombre: { es: "Palabras gemelas", en: "Twin words" },
    que: {
      es: "Dos dibujos que suenan casi igual: él dice, tú marcas.",
      en: "Two pictures that sound almost alike: they say it, you mark it.",
    },
    mide: {
      es: "No usa micrófono — el que oye la palabra eres tú.",
      en: "No microphone — you are the one who hears the word.",
    },
  },
} satisfies Catalogo;
