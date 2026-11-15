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
} satisfies Catalogo;
