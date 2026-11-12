import type { Catalogo } from "../index";

// El rumbo: lo que de verdad pasó, sin puntajes ni plazos. Cada dato lleva su singular y su plural.
// Los hitos (src/lib/rumbo/hitos.ts) traen su propio título como `Texto` y viven allí, junto a su lógica.
export const rumbo = {
  titulo: { es: "El rumbo", en: "The route" },
  intro: {
    es: "Cómo van, contado con lo que de verdad pasó: los días que jugaron, las palabras que practicaron, lo que su voz hizo. Sin comparar con nadie y sin apuros: aquí nada se pierde por saltarse un día.",
    en: "How it's going, told with what really happened: the days you played, the words you practiced, what their voice did. No comparing with anyone and no rush: nothing is lost by skipping a day.",
  },
  semana: {
    esta: { es: "Esta semana", en: "This week" },
    del: { es: "Semana del {fecha}", en: "Week of {fecha}" },
  },
  datos: {
    dias: {
      uno: { es: "día que practicaron juntos", en: "day you practiced together" },
      otro: { es: "días que practicaron juntos", en: "days you practiced together" },
    },
    capsulas: {
      uno: { es: "cápsula del día completada", en: "daily capsule completed" },
      otro: { es: "cápsulas del día completadas", en: "daily capsules completed" },
    },
    palabras: {
      uno: { es: "palabra distinta que practicaron", en: "different word you practiced" },
      otro: { es: "palabras distintas que practicaron", en: "different words you practiced" },
    },
    dibujos: {
      uno: { es: "dibujo que encendió con su voz", en: "picture they lit up with their voice" },
      otro: { es: "dibujos que encendió con su voz", en: "pictures they lit up with their voice" },
    },
    vueltas: {
      uno: { es: "vuelta completa dio el globo con su voz", en: "full lap the balloon made with their voice" },
      otro: { es: "vueltas completas dio el globo con su voz", en: "full laps the balloon made with their voice" },
    },
    inversiones: {
      uno: { es: "vez que su voz subió y bajó", en: "time their voice went up and down" },
      otro: { es: "veces que su voz subió y bajó", en: "times their voice went up and down" },
    },
    rondas: {
      uno: { es: "ronda de gemelas", en: "round of twin words" },
      otro: { es: "rondas de gemelas", en: "rounds of twin words" },
    },
    marcadas: {
      uno: { es: "palabra que TÚ le oíste", en: "word YOU heard them say" },
      otro: { es: "palabras que TÚ le oíste", en: "words YOU heard them say" },
    },
    vozTotal: {
      es: "segundos sonó su voz en el globo, sumando todos los ratos",
      en: "seconds their voice sounded in the balloon, adding up every play time",
    },
    vozMax: {
      es: "segundos fue su voz más larga sin cortarse",
      en: "seconds was their longest stretch of voice without a break",
    },
  },
  vacio: {
    titulo: { es: "Todavía no hay nada que contar", en: "Nothing to tell yet" },
    texto: {
      es: "Jueguen unos días —el globo, el cohete, los dibujos— o marquen la cápsula de hoy, y aquí va a aparecer cómo van: solo lo que de verdad pasó, sin comparar con nadie.",
      en: "Play for a few days — the balloon, the rocket, the pictures — or mark today's capsule, and here is where you'll see how it's going: only what really happened, with no comparing.",
    },
    ir: { es: "Ir a los juegos", en: "Go to the games" },
  },
  hitos: {
    titulo: { es: "Lo que ya lograron", en: "What you've already done" },
    desde: { es: "desde el {fecha}", en: "since {fecha}" },
  },
  semanaASemana: { es: "Semana a semana", en: "Week by week" },
  cierre: {
    es: "Es el registro de lo que hicieron juntos: lo que mueve el habla es volver, sin prisa.",
    en: "This is a record of what you did together: what moves speech along is coming back, with no hurry.",
  },
} satisfies Catalogo;
