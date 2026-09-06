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

// ─────────────────────────────────────────────────────────────────────────────
// DOMINIO «CONTACTO VISUAL» (Sprint 005 — documento primero, app después).
//
// Un segundo dominio de cápsulas, para la mamá y sin pantallas. Las 50 cápsulas de habla de
// arriba NO cambian: el dominio del habla se declara a nivel de biblioteca (BIBLIOTECAS) y las
// cápsulas de contacto visual llevan `dominio` literal como discriminante. Todo lo que se lee
// aquí es COMPORTAMIENTO OBSERVABLE — lo que una mamá ve en su casa — jamás una etiqueta.
//
// Las seis técnicas y los seis niveles son los valores aprobados en la investigación del
// sprint (planeadora, G-Investigación 2026-09-06). Cada técnica lleva la fuerza de su evidencia
// a la vista, y cada cápsula cita su fuente como autor · año · revista.
// ─────────────────────────────────────────────────────────────────────────────

export const DOMINIOS = ["habla", "contacto-visual"] as const;

export type Dominio = (typeof DOMINIOS)[number];

export const NOMBRE_DOMINIO: Record<Dominio, string> = {
  habla: "Habla",
  "contacto-visual": "Contacto visual",
};

/** Las seis técnicas con evidencia del dominio. El nombre es el que lee la mamá. */
export const TECNICAS_CONTACTO_VISUAL = [
  "hago-lo-que-el-hace",
  "pausa-antes-de-lo-mejor",
  "un-turno-tu-un-turno-yo",
  "espero-en-silencio",
  "canto-a-su-ritmo",
  "misma-rutina-otra-persona",
] as const;

export type TecnicaContactoVisual = (typeof TECNICAS_CONTACTO_VISUAL)[number];

export const NOMBRE_TECNICA_CONTACTO_VISUAL: Record<
  TecnicaContactoVisual,
  string
> = {
  "hago-lo-que-el-hace": "Hago lo que él hace",
  "pausa-antes-de-lo-mejor": "La pausa antes de lo mejor",
  "un-turno-tu-un-turno-yo": "Un turno tú, un turno yo",
  "espero-en-silencio": "Espero en silencio",
  "canto-a-su-ritmo": "Canto a su ritmo",
  "misma-rutina-otra-persona": "La misma rutina con otra persona",
};

/** Qué es cada técnica, en una frase que se entiende sin leer nada más. */
export const DESCRIPCION_TECNICA_CONTACTO_VISUAL: Record<
  TecnicaContactoVisual,
  string
> = {
  "hago-lo-que-el-hace":
    "Copias en el momento lo que él hace con un juguete igual al suyo, sus movimientos y sus sonidos. Sin pedirle nada.",
  "pausa-antes-de-lo-mejor":
    "Un juego cara a cara que se repite —cosquillas, avión, cucú, una canción— y se detiene justo antes de lo mejor. Ese hueco lo llena él.",
  "un-turno-tu-un-turno-yo":
    "Un juego corto alrededor de lo que él eligió, en turnos cortos y parejos. Aquí nace la mirada que va del juguete a tu cara y vuelve.",
  "espero-en-silencio":
    "Con el juguete o la continuación a la vista, esperas con cara de «¿y ahora?» antes de ayudar o repetir. La espera se alarga de a poquito.",
  "canto-a-su-ritmo":
    "Cantas o tamborileas siguiendo su ritmo y sus sonidos, y luego paras. Canciones con gestos, una estrofa más cada semana.",
  "misma-rutina-otra-persona":
    "Exactamente la misma rutina, con las mismas palabras y la misma pausa, ahora con el hermano (o quien viva en la casa) — y en más momentos del día.",
};

/** Fuerza de la evidencia de cada técnica, a la vista (graduación de la investigación). */
export const FUERZAS_EVIDENCIA = ["fuerte", "moderada"] as const;

export type FuerzaEvidencia = (typeof FUERZAS_EVIDENCIA)[number];

export const NOMBRE_FUERZA: Record<FuerzaEvidencia, string> = {
  fuerte: "Evidencia fuerte",
  moderada: "Evidencia moderada",
};

export const FUERZA_TECNICA_CONTACTO_VISUAL: Record<
  TecnicaContactoVisual,
  FuerzaEvidencia
> = {
  "hago-lo-que-el-hace": "fuerte",
  "pausa-antes-de-lo-mejor": "moderada",
  "un-turno-tu-un-turno-yo": "fuerte",
  "espero-en-silencio": "moderada",
  "canto-a-su-ritmo": "moderada",
  "misma-rutina-otra-persona": "moderada",
};

/**
 * La progresión: seis niveles descritos por lo que la mamá VE. No tienen plazo. Se avanza
 * cuando el nivel anterior pasa la mayoría de las veces con ella; con un juguete que lo absorbe
 * se entra por el nivel 3 (turnos con ese juguete), con poco interés por el 2 (juego físico o
 * canción).
 */
export const NIVELES_CONTACTO_VISUAL = [
  "n1",
  "n2",
  "n3",
  "n4",
  "n5",
  "n6",
] as const;

export type NivelContactoVisual = (typeof NIVELES_CONTACTO_VISUAL)[number];

export const NOMBRE_NIVEL_CONTACTO_VISUAL: Record<NivelContactoVisual, string> =
  {
    n1: "Mira cuando le interesa, con quien confía",
    n2: "Anticipa y pide que siga",
    n3: "Mira dentro del turno",
    n4: "Él arranca el juego",
    n5: "Con más personas",
    n6: "En más momentos del día",
  };

export const DESCRIPCION_NIVEL_CONTACTO_VISUAL: Record<
  NivelContactoVisual,
  string
> = {
  n1: "Gira y te mira cuando lo imitas o le hablas; se acerca. Contigo esto ya pasa.",
  n2: "En la pausa del juego te mira, abre los brazos o la boca, o hace un sonido para que sigas. Con las cosquillas y algunas canciones ya asoma: aquí empieza.",
  n3: "Al pasar el turno, su mirada va del juguete a tu cara y vuelve al juguete; cada vez la sostiene un poquito más. Es el corazón de todo esto.",
  n4: "Trae las manos o el juguete, dice «otra», te muestra o señala algo para arrancar el juego él.",
  n5: "Lo de los niveles 2 a 4, pero con el hermano, con quien viva en la casa — o con alguien que conoce menos.",
  n6: "Lo mismo, en el baño, en la mesa, en la calle, sin haberlo preparado.",
};

/** Momentos del día donde cabe una cápsula: la dosis son momentos cortos, no sesiones. */
export const MOMENTOS_DEL_DIA = [
  "juego",
  "baño",
  "comida",
  "vestirse",
  "calle",
  "dormir",
  "transiciones",
] as const;

export type MomentoDelDia = (typeof MOMENTOS_DEL_DIA)[number];

export const NOMBRE_MOMENTO: Record<MomentoDelDia, string> = {
  juego: "jugando",
  baño: "en el baño",
  comida: "en la mesa",
  vestirse: "al vestirse",
  calle: "en la calle",
  dormir: "al acostarlo",
  transiciones: "entre una cosa y otra",
};

/** Con quién se hace la cápsula. «otra-persona» es la esencia del nivel 5. */
export const CON_QUIEN = ["mama", "otra-persona"] as const;

export type ConQuien = (typeof CON_QUIEN)[number];

/**
 * Cita pública: «Autor, año, Revista» (varias separadas por « · »). Sin título a propósito —
 * la referencia completa vive en la investigación de la planeadora. Y cuando el nombre de la
 * revista describe a quién se estudió, se cita solo «Autor, año»: el gate de sensibilidad
 * también corre sobre las citas (hallazgo de la fase 0). Una fuente con título no entra.
 */
const FUENTE_PUBLICA = /^[^;]+?, (19|20)\d{2}(, [^;]+)?$/;

export const CapsulaContactoVisualSchema = z.object({
  id: z.string().min(1),
  dominio: z.literal("contacto-visual"),
  tecnica: z.enum(TECNICAS_CONTACTO_VISUAL),
  nivel: z.enum(NIVELES_CONTACTO_VISUAL),
  /** Titular corto y cálido, en es-CO. */
  titulo: z.string().min(1).max(70),
  /** La técnica y por qué funciona, para leerse en ~30 segundos. */
  explicacion: z.string().min(1),
  /** UNA línea que la mamá puede decir tal cual, hoy. */
  guion: z.string().min(1).max(140),
  actividad: z.object({
    texto: z.string().min(1),
    /** Cuánto dura un momento de esta cápsula («3–5 min»). Momentos cortos, no sesiones. */
    duracion: z.string().regex(/^\d+(–\d+)? min$/),
    momentos: z.array(z.enum(MOMENTOS_DEL_DIA)).min(1),
    /** Este dominio es cero pantalla por diseño: el literal lo garantiza. */
    conPantalla: z.literal(false),
  }),
  conQuien: z.enum(CON_QUIEN),
  /** Lo que NO se hace en esta cápsula, en una línea y en observable. */
  queNoHacer: z.string().min(1).max(200),
  /** Cita corta y verificable: autor · año · revista. Obligatoria. */
  fuente: z
    .string()
    .max(220)
    .refine((f) => f.split(" · ").every((s) => FUENTE_PUBLICA.test(s)), {
      message:
        "La fuente va como «Autor, año, Revista» —o «Autor, año» si la revista describe a quién se estudió—, sin título.",
    }),
});

export type CapsulaContactoVisual = z.infer<typeof CapsulaContactoVisualSchema>;

/** Cualquier cápsula de cualquier dominio (el segundo paso —la app— lo consumirá). */
export type CapsulaDeDominio =
  | (Capsula & { dominio: "habla" })
  | CapsulaContactoVisual;

/**
 * La biblioteca de contacto visual: entre 18 y 24 cápsulas (lo que la evidencia justifica),
 * 3–4 por técnica, cada una en un nivel distinto dentro de su técnica, y los seis niveles
 * cubiertos — así ninguna técnica se queda sin su escalera y ningún nivel sin cápsula.
 */
export const MIN_POR_TECNICA_CONTACTO_VISUAL = 3;
export const MAX_POR_TECNICA_CONTACTO_VISUAL = 4;

export const BibliotecaContactoVisualSchema = z
  .array(CapsulaContactoVisualSchema)
  .min(18)
  .max(24)
  .refine((cs) => new Set(cs.map((c) => c.id)).size === cs.length, {
    message: "Los ids de las cápsulas deben ser únicos.",
  })
  .refine(
    (cs) =>
      TECNICAS_CONTACTO_VISUAL.every((t) => {
        const n = cs.filter((c) => c.tecnica === t).length;
        return (
          n >= MIN_POR_TECNICA_CONTACTO_VISUAL &&
          n <= MAX_POR_TECNICA_CONTACTO_VISUAL
        );
      }),
    { message: "Cada técnica necesita entre 3 y 4 cápsulas: su escalera completa." },
  )
  .refine(
    (cs) =>
      TECNICAS_CONTACTO_VISUAL.every((t) => {
        const niveles = cs.filter((c) => c.tecnica === t).map((c) => c.nivel);
        return new Set(niveles).size === niveles.length;
      }),
    {
      message:
        "Dentro de una técnica, cada cápsula va en un nivel distinto: son peldaños, no variaciones.",
    },
  )
  .refine(
    (cs) => NIVELES_CONTACTO_VISUAL.every((n) => cs.some((c) => c.nivel === n)),
    { message: "Los seis niveles necesitan al menos una cápsula." },
  )
  .refine(
    (cs) => cs.every((c) => c.nivel !== "n5" || c.conQuien === "otra-persona"),
    { message: "El nivel 5 es con otra persona: es su esencia." },
  );
