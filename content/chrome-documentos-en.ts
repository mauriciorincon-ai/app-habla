// La cara inglesa de los rótulos de los documentos impresos (S8): «La pirámide, en casa» (/mirada) y
// el catálogo de cápsulas. Los rótulos en español viven en content/schema.ts; aquí van los mismos,
// con las MISMAS claves, redactados en inglés (no traducidos). tests/unit/fichas.test.ts exige que
// no falte ni sobre una clave. Solo `import type`: los generadores corren con Node quitando tipos.

import type { Etapa, Grupo, MomentoDelDia, Tecnica, TecnicaFicha } from "./schema";

export const NOMBRE_GRUPO_EN: Record<Grupo, string> = {
  senalar: "Pointing",
  imitacion: "Imitation",
  comprender: "Understanding",
  "atencion-conjunta": "Joint attention",
  "intencion-comunicativa": "Reasons to communicate",
  juego: "Play",
};

export const DESCRIPCION_GRUPO_EN: Record<Grupo, string> = {
  senalar:
    "Using the hand and finger to say “look at this.” Your child already follows your finger; what comes next is showing you something just to share it.",
  imitacion:
    "Copying what the other person does. Your child already copies your body when you march together; what comes next is copying what you do with an object, and the sounds you make.",
  comprender:
    "Understanding the word by itself, without the gesture or the routine that announces it. It grows by talking about what your child is looking at, never by quizzing.",
  "atencion-conjunta":
    "Looking at the same thing as someone else and knowing they are looking too. Your child already looks for you to keep a game going; what comes next is looking for you to show you something.",
  "intencion-comunicativa":
    "Having something to communicate for: asking, refusing, choosing, greeting, telling. Your child already asks and greets; what comes next is choosing, saying no, and sharing.",
  juego:
    "A game for two that lasts: you, them, you, them. Your child already asks for more and already swaps roles in tickles; what comes next is a back-and-forth that lasts several turns.",
};

export const NOMBRE_MOMENTO_EN: Record<MomentoDelDia, string> = {
  juego: "playing",
  baño: "in the bath",
  comida: "at the table",
  vestirse: "getting dressed",
  calle: "out and about",
  dormir: "at bedtime",
  transiciones: "between one thing and the next",
};

export const NOMBRE_TECNICA_FICHA_EN: Record<TecnicaFicha, string> = {
  "lo-copio": "I copy them",
  "ahora-yo-ahora-tu": "My turn, your turn",
  "pausa-antes-de-lo-mejor": "The pause before the best part",
  "un-turno-cada-uno": "One turn each",
  "espero-en-silencio": "I wait in silence",
  "canto-a-su-ritmo": "I sing at their pace",
  "nombro-lo-que-mira": "I name what they look at",
  "su-palabra-mas-una": "Their word, plus one",
  "la-respuesta-completa": "The full answer",
  "algo-que-mostrar": "Something worth showing",
  "le-doy-a-elegir": "I let them choose",
  "misma-rutina-otra-persona": "The same routine with someone else",
};

/** Las etiquetas de progresión; mismas claves que PROGRESIONES de content/schema.ts. */
export const PROGRESIONES_EN: Record<Grupo, Record<string, string>> = {
  senalar: {
    S1: "Follows your finger",
    S2: "Asks with the hand",
    S3: "Shows or gives",
    S4: "Points to share",
    S5: "The back-and-forth keeps going after the gesture",
    S6: "With another person, unprepared",
  },
  imitacion: {
    I1: "Notices you are copying",
    I2: "Copies with help",
    I3: "Copies when you show them",
    I4: "Copies without being shown",
    I5: "A back-and-forth that lasts",
    I6: "With another person, and the next day",
  },
  comprender: {
    P1: "Responds to the routine with the gesture",
    P2: "Responds to the word alone, inside the routine",
    P3: "Responds to the word outside the routine or with another person",
    P4: "The word comes back as their own",
  },
  "atencion-conjunta": {
    N1: "Looks when interested, with someone they trust",
    N2: "Anticipates and asks for more",
    N3: "Looks within the turn",
    N4a: "Starts the game to ask or to keep it going",
    N4b: "Shows you or points something out to share it",
    N5: "With more people",
    N6: "At more moments of the day",
  },
  "intencion-comunicativa": {},
  juego: {
    O1: "With objects: grabs, lets go, taps, puts in and takes out",
    O2: "With objects: gathers, stacks, fits together",
    T1: "One turn with a pause",
    T2: "Two or three matching turns",
    T3: "The turns hold up through a small change",
    T4: "Your child suggests the change",
    T5: "Roles reversed, twice in a row",
    T6: "Roles reversed, with an object",
    T7: "The same with the sibling",
  },
};

export const NOMBRE_ETAPA_EN: Record<Etapa, string> = {
  "sonidos-e-intentos": "Sounds and attempts",
  "palabras-sueltas": "Single words",
  "primeras-frases": "First phrases",
};

export const DESCRIPCION_ETAPA_EN: Record<Etapa, string> = {
  "sonidos-e-intentos":
    "Still exploring: makes sounds, points, leads you by the hand. Attempts and gestures are their way of talking.",
  "palabras-sueltas":
    "Says words one at a time: “water”, “mom”, “car”. Does not put them together yet, and there is no need to hurry.",
  "primeras-frases":
    "Sometimes joins two words: “more water”, “big car”. Still says a lot one word at a time, and that is fine.",
};

export const NOMBRE_TECNICA_EN: Record<Tecnica, string> = {
  modelado: "Modeling",
  "expansion-recast": "Building on what they said",
  "espera-estructurada": "Waiting in silence",
  "seguir-interes": "Following their interest",
  "estimulacion-focalizada": "Repeating a key word",
};
