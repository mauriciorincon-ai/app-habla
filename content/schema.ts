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

export const CapsulaSchema = z.object({
  id: z.string().min(1),
  tecnica: z.enum(TECNICAS),
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
});

export type Capsula = z.infer<typeof CapsulaSchema>;

export const BibliotecaSchema = z.array(CapsulaSchema).min(14);
