import type { Catalogo } from "../index";

// El objetivo de la semana: lo que el adulto quiere trabajar. La app lo alinea de forma
// determinista con su contenido (las coincidencias se buscan en el vocabulario de la app, que hoy
// es el español). Los fragmentos con enlace se parten en trozos: el DOM es el mismo en los dos idiomas.
export const objetivo = {
  tituloPestana: {
    es: "Objetivo de la semana · Hablemos San",
    en: "This week's goal · Hablemos San",
  },
  titulo: { es: "Objetivo de la semana", en: "This week's goal" },
  intro: {
    es: "¿Qué te pidieron trabajar en las terapias de tu hijo esta semana? Escríbelo aquí y la app pone eso primero: en la cápsula de hoy, en los dibujos del juego y en lo que te toca grabar. Es opcional — sin objetivo, todo sigue igual que siempre.",
    en: "What did you agree to work on in your child's speech and language therapy this week? Write it here and the app puts it first: in today's capsule, in the game pictures and in what you record. It is optional — without a goal, everything stays just as it always was.",
  },
  sugerencias: {
    grupo: { es: "Sugerencias", en: "Suggestions" },
    animales: { es: "animales", en: "animals" },
    comida: { es: "la comida", en: "food" },
    bano: { es: "el baño", en: "bath time" },
    acciones: { es: "acciones", en: "actions" },
    pedir: { es: "pedir cosas", en: "asking for things" },
    sonidos: { es: "los sonidos", en: "sounds" },
  },
  chips: {
    estanEnLaApp: {
      es: "Están en la app — se ponen primero en lo que él ve:",
      en: "These are in the app — they go first in what your child sees:",
    },
    bienEscritas: {
      es: "Bien escritas, aunque aún no están en la app:",
      en: "Spelled right, though not in the app yet:",
    },
    quisisteDecir: { es: "¿Quisiste decir «{termino}»?", en: "Did you mean “{termino}”?" },
  },
  activo: {
    etiqueta: { es: "Objetivo activo", en: "Active goal" },
    desde: {
      es: "Activo desde el {fecha}. Se queda hasta que lo cambies o lo quites.",
      en: "Active since {fecha}. It stays until you change or remove it.",
    },
    alineando: { es: "Alineando ahora:", en: "Lining up right now:" },
    sinJuegos: {
      a: {
        es: "La cápsula de hoy sí se alinea, pero los dibujos de los juegos no cambian: ese tema no está entre los elegidos.",
        en: "Today's capsule does line up, but the game pictures don't change: that topic isn't among the chosen ones.",
      },
      estudio: {
        es: " En el estudio sí se pone primero al grabar.",
        en: " In the studio it does go first when recording.",
      },
      b: {
        es: "Si quieres que los juegos lo traigan, ",
        en: "If you want the games to bring it, ",
      },
      enlace: { es: "revisa sus temas en Ajustes", en: "check the topics in Settings" },
    },
    sinContenido: {
      es: "Priorizado, pero la app aún no tiene contenido de esto: por ahora la cápsula y los juegos no cambian.",
      en: "Prioritized, but the app doesn't have content for this yet: for now the capsule and the games don't change.",
    },
    fuera: {
      a: {
        es: "Está en la app, pero no en lo que él ve hoy (su etapa y sus temas): la cápsula y los juegos no cambian.",
        en: "It is in the app, but not in what your child sees today (the stage and topics you chose): the capsule and the games don't change.",
      },
    },
    quitar: { es: "Quitar el objetivo", en: "Remove the goal" },
  },
  unidades: {
    capsulaUna: { es: "cápsula", en: "capsule" },
    capsulaVarias: { es: "cápsulas", en: "capsules" },
    dibujoUno: { es: "dibujo", en: "picture" },
    dibujoVarios: { es: "dibujos", en: "pictures" },
    parUno: { es: "par de gemelas", en: "twin pair" },
    parVarios: { es: "pares de gemelas", en: "twin pairs" },
  },
  editor: {
    cambiarlo: { es: "¿Cambiarlo? Escribe uno nuevo:", en: "Change it? Write a new one:" },
    queTrabajar: {
      es: "¿Qué quieren trabajar esta semana?",
      en: "What do you want to work on this week?",
    },
    placeholder: { es: "animales, la comida, el baño…", en: "animals, food, bath time…" },
  },
  preview: {
    vacio: {
      es: "Escribe una palabra o dos. La app buscará eso en las cápsulas, en los dibujos y en las gemelas, y lo pondrá primero.",
      en: "Write a word or two. The app will look for it in the capsules, the pictures and the twins, and put it first.",
    },
    vasHacia: {
      es: "¿Vas hacia alguna de estas? Tócala y listo:",
      en: "Heading toward one of these? Tap it and you're done:",
    },
    sinMatches: {
      es: "«{limpio}» todavía no está en el contenido de la app, así que no hay nada que priorizar. No pasa nada: puedes guardarlo igual y no cambia nada, o probar con otra palabra (animales, la comida, acciones…).",
      en: "“{limpio}” isn't in the app's content yet, so there is nothing to put first. That's fine: you can save it anyway and nothing changes, or try another word (animals, food, actions…).",
    },
    fuera: {
      es: "«{limpio}» sí está en la app, pero no en lo que él ve hoy (su etapa y sus temas), así que la cápsula y los juegos no cambian.",
      en: "“{limpio}” is in the app, but not in what your child sees today (the stage and topics you chose), so the capsule and the games don't change.",
    },
    fueraEstudio: {
      es: " En el estudio de grabación sí se pone primero al grabar.",
      en: " In the recording studio it does go first when recording.",
    },
    conPonePrimero: {
      es: "Con «{limpio}», la app pone primero ",
      en: "With “{limpio}”, the app puts first ",
    },
  },
  confirmar: {
    pregunta: { es: "¿Quisiste decir «{candidata}»?", en: "Did you mean “{candidata}”?" },
    si: { es: "Sí, guardar «{candidata}»", en: "Yes, save “{candidata}”" },
    no: { es: "No, guardar «{limpio}» tal cual", en: "No, save “{limpio}” as it is" },
  },
  guardar: {
    vacio: { es: "Guardar el objetivo", en: "Save the goal" },
    con: { es: "Guardar «{texto}»", en: "Save “{texto}”" },
    listo: {
      es: " Listo. La cápsula de hoy y los juegos ya lo tienen en cuenta.",
      en: " Done. Today's capsule and the games already take it into account.",
    },
  },
} satisfies Catalogo;
