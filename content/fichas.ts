import type { Ficha } from "./schema";

/**
 * LA PIRÁMIDE (Sprint 006) — las fichas de actividad del documento de la mamá (/mirada).
 *
 * ⚠️ FASE 0: estas fichas son DE PRUEBA. Existen solo para probar el schema, el generador y la
 * ruta. Se reemplazan ENTERAS en la fase 2 por la biblioteca que ejecuta el mapa de las 74.
 *
 * (Solo `import type` desde ./schema: el generador corre con Node quitando tipos y un import de
 * valor sin extensión no resuelve ahí.)
 */
export const FICHAS: Ficha[] = [
  {
    id: "prueba-dos-iguales",
    grupo: "imitacion",
    prioridad: "alta",
    tecnica: "lo-copio",
    titulo: "Prueba: dos carros iguales",
    tenALaMano: ["Dos carros iguales."],
    haz: [
      "Siéntate frente a él, a su altura.",
      "Dale un carro y quédate con el otro.",
      "Copia todo lo que él haga con el suyo.",
    ],
    tuLinea: "«¡Igual que tú!»",
    esperaVer: "Que voltee a mirarte cuando lo copias.",
    funcionoSi: "te mira mientras lo copias, sin que se lo pidas.",
    siNoPasa: "Copia más grande y más cerca de su cara. Mañana otra vez.",
    duracion: "3–5 min",
    momentos: ["juego"],
    conQuien: "mama",
    progresion: "I1",
    origen: { de: "mirada", refs: ["mirada:dos-juguetes-iguales"] },
    fuente: "Field, 2001 · Sanefuji, 2013, Infant Ment Health J",
  },
  {
    id: "prueba-con-el-hermano",
    grupo: "juego",
    prioridad: "alta",
    tecnica: "misma-rutina-otra-persona",
    titulo: "Prueba: la misma rutina con el hermano",
    tenALaMano: ["La rutina que mejor le funciona contigo."],
    haz: [
      "Haz tú la rutina una vez, con el hermano al lado.",
      "El hermano la repite igual, con tus mismas palabras.",
      "Tú te quedas cerca, sin intervenir.",
    ],
    tuLinea: "Al hermano: «Igualito que yo».",
    esperaVer: "Que acepte la rutina con el hermano.",
    funcionoSi: "sigue jugando cuando el hermano toma tu lugar.",
    siNoPasa: "Vuelve a hacerla tú y deja que el hermano solo mire. Otro día.",
    duracion: "3–5 min",
    momentos: ["juego"],
    conQuien: "hermano",
    progresion: "T7",
    origen: {
      de: "fusion",
      refs: ["mirada:el-hermano-lo-copia", "mirada:las-mismas-cosquillas-con-el-hermano"],
    },
    fuente: "Stokes, 1977, J Appl Behav Anal",
  },
  {
    id: "prueba-dos-cosas",
    grupo: "intencion-comunicativa",
    prioridad: "normal",
    tecnica: "le-doy-a-elegir",
    titulo: "Prueba: dos cosas, una elección",
    tenALaMano: ["Dos cosas que le gusten, una en cada mano."],
    haz: [
      "Muéstrale las dos a la altura de tu cara.",
      "Nombra cada una mientras la levantas.",
      "Espera a que elija con la mano, la mirada o la voz.",
    ],
    tuLinea: "«¿Esta o esta?»",
    esperaVer: "Que estire la mano hacia una.",
    funcionoSi: "elige una con la mano, la mirada o un sonido.",
    siNoPasa: "Dale la que miró más. La próxima vez, dos cosas más distintas.",
    duracion: "1–2 min",
    momentos: ["comida", "juego"],
    conQuien: "mama",
    origen: { de: "nueva", refs: ["anexo:E-A4"] },
    fuente: "Halle, 1981, J Appl Behav Anal",
  },
];

/**
 * Las cápsulas de la app que el mapa deja FUERA del documento (siguen intactas en la app).
 * FASE 0: vacío; se llena en la fase 2.
 */
export const CAEN_DEL_DOCUMENTO: {
  id: string;
  razon: "necesita-la-app" | "etapa-siguiente" | "va-a-que-no-hacer";
}[] = [];
