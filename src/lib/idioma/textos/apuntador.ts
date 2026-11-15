import type { Catalogo } from "../index";

// Tu apuntador (S13, ADR-025): las líneas que el adulto lee en su franja mientras juegan. Una línea a la
// vez, en positivo, sobre lo que él SÍ hizo o sobre lo que el adulto puede hacer ahora; jamás sobre lo
// que él «no hizo». Redactadas en cada idioma, no traducidas. La técnica y la fuente de cada una viven
// en src/lib/coach/apuntador.ts.
export const apuntador = {
  lineas: {
    // Empieza tu turno — modelar.
    modelaDespacio: {
      es: "Tu turno: modela despacio, una sola vez, y luego pásale el turno.",
      en: "Your turn: model it slowly, just once, then hand the turn back.",
    },
    sonidoClaro: {
      es: "Haz tú el sonido, largo y claro, para que lo vea moverse.",
      en: "Make the sound yourself, long and clear, so they can watch it move.",
    },
    muestraSinPedir: {
      es: "Muéstrale cómo suena, sin pedirle que lo repita.",
      en: "Show how it sounds, and simply let them watch.",
    },
    loQueMira: {
      es: "Modela con lo que él está mirando ahora mismo.",
      en: "Model it around whatever has caught their eye right now.",
    },
    // Él hizo voz en su turno — expandir.
    expandeUnaPalabra: {
      es: "Expande: repite lo que dijo y suma una palabra.",
      en: "Build on it: say back what they said, plus one word.",
    },
    ecoContento: {
      es: "Devuélvele su sonido como un eco contento, con una palabra más.",
      en: "Echo their sound back, warmly, with one more word on the end.",
    },
    poneleNombre: {
      es: "Ponle una palabra a lo que hizo su voz: «¡arriba!», «¡fuerte!».",
      en: "Give what their voice just did a single word: “Up!”, “Loud!”",
    },
    palabraClave: {
      es: "Di otra vez la palabra clave de hoy, despacio y con gusto.",
      en: "Say today's key word again, slowly, and enjoy it.",
    },
    // Lleva rato en silencio en su turno — esperar.
    esperaTres: {
      es: "Espera tres segundos y mírale con cara de expectativa.",
      en: "Wait three seconds and look at them with an expectant face.",
    },
    espacioParaSuVoz: {
      es: "Quédate en silencio un momento: ese espacio es para su voz.",
      en: "Stay quiet for a moment: that space is for their voice.",
    },
    aSuAltura: {
      es: "Ponte a su altura, sonríe y espera.",
      en: "Get down to their level, smile, and wait.",
    },
    // Cierre — nombrar lo que hicieron juntos.
    nombraJuntos: {
      es: "Nombra lo que hicieron juntos, en una frase corta.",
      en: "Name what you did together, in one short sentence.",
    },
    cuentaLaHistoria: {
      es: "Cuéntale lo que pasó: tu turno, su turno y lo que movió su voz.",
      en: "Tell it back: your turn, their turn, and what their voice moved.",
    },
  },
  // La franja y el indicador de turno (S13, ADR-025). La franja es del adulto; el indicador lo ve el niño
  // y se entiende sin leer (figura + símbolo + palabra corta).
  franja: {
    etiqueta: {
      es: "Tu apuntador",
      en: "Your prompter",
    },
    turnoDeEl: {
      es: "Es su turno",
      en: "It's their turn",
    },
    turnoTuyo: {
      es: "Es tu turno",
      en: "It's your turn",
    },
    pasarleElTurno: {
      es: "Pasarle el turno",
      en: "Hand the turn over",
    },
    tomarElTurno: {
      es: "Mi turno",
      en: "My turn",
    },
  },
  // El resumen de la celebración y el Rumbo: solo cuenta SUS turnos (los que su voz midió).
  turnos: {
    uno: { es: "{n} turno de él", en: "{n} turn of theirs" },
    varios: { es: "{n} turnos de él", en: "{n} turns of theirs" },
    juntos: {
      es: "Jugaron por turnos: el tuyo y el suyo.",
      en: "You took turns: yours and theirs.",
    },
  },
  // En el guion del adulto, antes de empezar (S13): cuándo tocar «Mi turno».
  guion: {
    turnos: {
      es: "Cuando vayas a modelar, toca «Mi turno» en la franja de arriba: así tu voz mueve el dibujo pero no se cuenta como suya. Al terminar, «Pasarle el turno».",
      en: "When you model, tap “My turn” on the strip above: your voice moves the drawing but is not counted as theirs. Afterwards, tap “Hand the turn over”.",
    },
  },
  indicador: {
    suTurno: {
      es: "Tu voz",
      en: "Your voice",
    },
    turnoDelAdulto: {
      es: "Mira y escucha",
      en: "Watch and listen",
    },
    etiquetaSuTurno: {
      es: "Ahora suena tu voz",
      en: "Now it is your voice's turn",
    },
    etiquetaTurnoDelAdulto: {
      es: "Ahora te toca mirar y escuchar",
      en: "Now it is time to watch and listen",
    },
  },
} satisfies Catalogo;
