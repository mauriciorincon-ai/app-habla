import type { Catalogo } from "../index";

// «¿Dijo la palabra?» (S11, ADR-023): the on-device recognizer, in Ajustes and in the games.
// Written in both languages, not translated. It always says «maybe»; it never says «no» to the child.
export const reconocedor = {
  ajustes: {
    titulo: { es: "¿Dijo la palabra?", en: "Did they say the word?" },
    descripcion: {
      es: "Un reconocedor que escucha en este aparato y le sugiere a usted, en voz baja, «quizás dijo…». Usted sigue siendo quien juzga. Viene apagado.",
      en: "A recognizer that listens on this device and quietly suggests to you, «maybe they said…». You are still the one who judges. It comes turned off.",
    },
    aviso: {
      es: "Al encenderlo se descarga el modelo de voz del idioma actual: unos 40 MB, una sola vez, desde esta misma app. El sonido no se guarda ni sale de aquí: el reconocedor lo oye en memoria y solo devuelve una palabra y qué tan seguro está.",
      en: "Turning it on downloads the voice model for the current language: about 40 MB, once, from this very app. Sound is never saved and never leaves this device: the recognizer hears it in memory and only returns a word and how sure it is.",
    },
    descargando: {
      es: "Descargando el modelo… {pct} %",
      en: "Downloading the model… {pct}%",
    },
    listo: {
      es: "Listo en este idioma. Sin conexión al jugar.",
      en: "Ready in this language. No connection while playing.",
    },
    error: {
      es: "No se pudo descargar. Revise la conexión e intente de nuevo.",
      en: "The download failed. Check your connection and try again.",
    },
    otroIdioma: {
      es: "Descargar también el modelo en {idioma} (unos 40 MB)",
      en: "Also download the model in {idioma} (about 40 MB)",
    },
    idiomaNombre: {
      es: { es: "español", en: "Spanish" },
      en: { es: "inglés", en: "English" },
    },
    borrar: { es: "Borrar el reconocedor", en: "Delete the recognizer" },
    borrado: {
      es: "Reconocedor borrado de este aparato.",
      en: "Recognizer deleted from this device.",
    },
    animacion: {
      titulo: {
        es: "Mostrarle al niño una luz suave",
        en: "Show the child a soft glow",
      },
      descripcion: {
        es: "Cuando el reconocedor cree que oyó la palabra, el dibujo brilla apenas. Sin texto, sin «bien» ni «mal», no cuenta nada y puede equivocarse. Viene apagada.",
        en: "When the recognizer thinks it heard the word, the picture glows a little. No text, no «right» or «wrong», it counts nothing and it can be wrong. It comes turned off.",
      },
    },
    conteo: {
      titulo: {
        es: "Cómo le va al reconocedor",
        en: "How the recognizer is doing",
      },
      intro: {
        es: "Cuatro números de este aparato: lo que el reconocedor creyó contra lo que usted juzgó.",
        en: "Four numbers on this device: what the recognizer thought against what you judged.",
      },
      siSi: {
        es: "Creyó que sí · usted también",
        en: "Thought yes · you agreed",
      },
      siNo: {
        es: "Creyó que sí · usted no",
        en: "Thought yes · you did not",
      },
      noSi: {
        es: "No dijo nada · usted sí",
        en: "Said nothing · you said yes",
      },
      noNo: {
        es: "No dijo nada · usted tampoco",
        en: "Said nothing · you did not either",
      },
      pocos: {
        es: "Todavía no se puede decir: hacen falta unas {n} rondas más.",
        en: "It is too early to say: about {n} more rounds are needed.",
      },
      acuerdo: {
        es: "Coincidieron en {pct} % de las rondas.",
        en: "They agreed in {pct}% of the rounds.",
      },
    },
  },
  juego: {
    quizas: { es: "Quizás dijo «{palabra}»", en: "Maybe they said «{palabra}»" },
    escuchar: { es: "Escuchar con el reconocedor", en: "Listen with the recognizer" },
    escuchando: { es: "Escuchando en este aparato", en: "Listening on this device" },
    sinModelo: {
      es: "El reconocedor no está descargado: se enciende en Ajustes.",
      en: "The recognizer is not downloaded: turn it on in Settings.",
    },
    noArranco: {
      es: "El reconocedor no pudo arrancar. El juego sigue igual.",
      en: "The recognizer could not start. The game goes on as usual.",
    },
  },
} satisfies Catalogo;
