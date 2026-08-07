import { z } from "zod";

/**
 * Las cinco técnicas con evidencia que sostienen la biblioteca (§A.3 de la investigación).
 * Ninguna cápsula existe sin una de ellas: nada de consejos genéricos sin respaldo.
 */
export const TECNICAS = [
  "modelado",
  "expansion-recast",
  "espera-estructurada",
  "seguir-interes",
  "estimulacion-focalizada",
] as const;

export type Tecnica = (typeof TECNICAS)[number];

export const NOMBRE_TECNICA: Record<Tecnica, string> = {
  modelado: "Modelar",
  "expansion-recast": "Expandir lo que dijo",
  "espera-estructurada": "Esperar en silencio",
  "seguir-interes": "Seguir su interés",
  "estimulacion-focalizada": "Repetir una palabra clave",
};

/**
 * Etapas del habla (ADR 006, extiende ADR 005). Descritas por comportamiento observable,
 * jamás por jerga clínica. "palabras-sueltas" es el DEFAULT PERMANENTE de esta app;
 * "primeras-frases" solo se activa por elección explícita del padre.
 */
export const ETAPAS = [
  "sonidos-e-intentos",
  "palabras-sueltas",
  "primeras-frases",
] as const;

export type Etapa = (typeof ETAPAS)[number];

export const ETAPA_DEFECTO: Etapa = "palabras-sueltas";

export const NOMBRE_ETAPA: Record<Etapa, string> = {
  "sonidos-e-intentos": "Sonidos e intentos",
  "palabras-sueltas": "Palabras sueltas",
  "primeras-frases": "Primeras frases",
};

/** Cómo se ve cada etapa en la vida real — es lo que el padre reconoce, no un diagnóstico. */
export const DESCRIPCION_ETAPA: Record<Etapa, string> = {
  "sonidos-e-intentos":
    "Todavía explora: hace sonidos, señala, lleva de la mano. Los intentos y los gestos son su forma de hablar.",
  "palabras-sueltas":
    "Dice palabras de a una: “agua”, “mamá”, “carro”. Todavía no las junta — y no hace falta apurarlo.",
  "primeras-frases":
    "A veces junta dos palabras: “más agua”, “carro grande”. Sigue diciendo mucho de a una, y está bien.",
};

/**
 * Vocabulario CONTROLADO de etiquetas del objetivo de la semana (S4). El padre escribe un objetivo
 * libre ("animales", "el baño") y el motor lo alinea contra estas etiquetas (ver lib/objetivo). Es
 * un enum a propósito: sin typos, sin etiquetas huérfanas, y —clave para la honestidad— NO existe
 * ninguna palabra de color aquí, así que un objetivo como "colores" no coincide con nada y la app
 * lo dice de frente. Cinco coinciden con TEMAS del onboarding: así un objetivo por tema alinea
 * también las cápsulas, no solo los pictogramas. (El sexto tema, "dinosaurios", no rotula ninguna
 * cápsula —no hay contenido de dinosaurios en la biblioteca— pero un objetivo así igual alinea sus
 * pictogramas por tema; se excluye del enum para no dejar una etiqueta huérfana.)
 *
 * Ortografía REAL, no normalizada («baño», «música»): desde el gate S4 estas palabras llegan a
 * los ojos del padre (sugerencias en vivo de /objetivo). La alineación compara normalizado
 * (lib/objetivo/alinear), así que el tema "musica" del onboarding sigue coincidiendo con «música».
 */
export const ETIQUETAS_CAPSULA = [
  // Temas de interés (subconjunto de TEMAS del onboarding con contenido de cápsula).
  "animales",
  "carros",
  "espacio",
  "música",
  "mar",
  // Rutinas de la casa y la calle.
  "comida",
  "baño",
  "dormir",
  "vestirse",
  "calle",
  "mercado",
  "parque",
  // Focos de comunicación.
  "sonidos",
  "canciones",
  "turnos",
  "espera",
  "pedir",
  "acciones",
  "emociones",
  "elegir",
  "imitación",
  "agua",
  "juego",
] as const;

export type EtiquetaCapsula = (typeof ETIQUETAS_CAPSULA)[number];

export const CapsulaSchema = z.object({
  id: z.string().min(1),
  tecnica: z.enum(TECNICAS),
  /** Etapa del habla a la que sirve la cápsula (ADR 006). */
  etapa: z.enum(ETAPAS),
  /** Titular corto y cálido, en es-CO. */
  titulo: z.string().min(1).max(70),
  /** La técnica explicada para leerse en ~30 segundos. */
  explicacion: z.string().min(1),
  /** UNA línea que el padre puede decir tal cual, hoy. */
  guion: z.string().min(1).max(140),
  actividad: z.object({
    texto: z.string().min(1),
    /** true si la actividad usa el juego de voz de la app. */
    conPantalla: z.boolean(),
  }),
  /** Cita corta y verificable a la investigación (§A.3). Obligatoria. */
  fuente: z.string().min(10),
  /** Etiquetas del vocabulario controlado para alinear el objetivo de la semana (S4). ≥1. */
  etiquetas: z.array(z.enum(ETIQUETAS_CAPSULA)).min(1),
});

export type Capsula = z.infer<typeof CapsulaSchema>;

/** Mínimos por etapa (Sprint 002). El motor exige que ninguna etapa se quede sin días. */
export const MINIMOS_POR_ETAPA: Record<Etapa, number> = {
  "sonidos-e-intentos": 8,
  "palabras-sueltas": 30,
  "primeras-frases": 7,
};

export const BibliotecaSchema = z
  .array(CapsulaSchema)
  .min(45)
  .refine(
    (capsulas) =>
      ETAPAS.every(
        (etapa) =>
          capsulas.filter((c) => c.etapa === etapa).length >=
          MINIMOS_POR_ETAPA[etapa],
      ),
    {
      message:
        "Cada etapa necesita su mínimo de cápsulas: ningún día puede quedarse sin respuesta, sea cual sea la etapa activa.",
    },
  );
