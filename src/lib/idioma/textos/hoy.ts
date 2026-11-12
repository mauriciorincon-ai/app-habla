import type { Catalogo } from "../index";

// La pantalla Hoy: el saludo (servidor) y la tarjeta del día (cliente). Los campos de la cápsula
// (título, explicación, guion, actividad, fuente) vienen de content/capsulas.ts y no están aquí.
export const hoy = {
  pregunta: {
    es: "¿Y hoy qué puedo hacer por mi hijo?",
    en: "So what can I do for my child today?",
  },
  intro: {
    es: "Esto es lo de hoy: una técnica con evidencia, explicada en 30 segundos, con una línea que puedes decirle y una actividad concreta. Práctica en casa para acompañar —nunca reemplazar— las terapias integrales del lenguaje de su hijo.",
    en: "Here is today's: one evidence-based technique, explained in 30 seconds, with a line you can say to them and one concrete activity. Practice at home to go alongside — never replace — your child's speech and language therapies.",
  },
  objetivoDeLaSemana: { es: "Objetivo de la semana:", en: "This week's goal:" },
  etiqueta: {
    tecnica: { es: "Técnica:", en: "Technique:" },
    etapa: { es: "Etapa:", en: "Stage:" },
  },
  tuLinea: { es: "Tu línea de hoy", en: "Your line for today" },
  laActividad: { es: "La actividad de hoy", en: "Today's activity" },
  deDondeSale: { es: "¿De dónde sale esto?", en: "Where does this come from?" },
  preguntaHecha: {
    es: "¿Ya hicieron la actividad de hoy?",
    en: "Did you do today's activity?",
  },
  jugarAhora: { es: "Jugar ahora, juntos", en: "Play now, together" },
  hechoHoy: { es: "Hecho hoy. Mañana hay otra.", en: "Done today. There's a new one tomorrow." },
  siYaLoHicimos: { es: "Sí, ya lo hicimos", en: "Yes, we did it" },
  historial: {
    antes: { es: "Han practicado juntos", en: "You have practiced together for" },
    unDia: { es: "día", en: "day" },
    variosDias: { es: "días", en: "days" },
    despues: {
      es: "en total. Este número nunca baja: si un día no entran, no se pierde nada.",
      en: "in total. This number never goes down: if you skip a day, nothing is lost.",
    },
  },
  juegos: {
    titulo: { es: "Los juegos de voz", en: "The voice games" },
    detalle: {
      es: "El globo, el cohete, los dibujos y las gemelas. Para jugar juntos — hoy o cualquier día.",
      en: "The balloon, the rocket, the pictures and the twin words. To play together — today or any day.",
    },
  },
} satisfies Catalogo;
