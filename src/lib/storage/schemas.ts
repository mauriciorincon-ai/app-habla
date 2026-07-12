import { z } from "zod";

// Lo ÚNICO que esta app guarda: progreso de cápsulas, ajustes y el onboarding local.
// Jamás audio del niño, jamás nada que lo identifique más allá del apodo que el padre elija
// (opcional, local, borrable en un toque) — ADR 002.

export const TEMAS = [
  "animales",
  "carros",
  "espacio",
  "dinosaurios",
  "musica",
  "mar",
] as const;
export type Tema = (typeof TEMAS)[number];

export const NOMBRE_TEMA: Record<Tema, string> = {
  animales: "Animales",
  carros: "Carros",
  espacio: "El espacio",
  dinosaurios: "Dinosaurios",
  musica: "Música",
  mar: "El mar",
};

export const PerfilSchema = z.object({
  /** Como el niño quiere que le digan. Opcional a propósito: la app funciona igual sin él. */
  apodo: z.string().trim().max(30).optional(),
  temas: z.array(z.enum(TEMAS)).min(1).max(3),
});
export type Perfil = z.infer<typeof PerfilSchema>;

export const AjustesSchema = z.object({
  modoCalma: z.boolean().catch(false),
  reducirAnimaciones: z.boolean().catch(false),
});
export type AjustesGuardados = z.infer<typeof AjustesSchema>;

export const AJUSTES_DEFECTO: AjustesGuardados = {
  modoCalma: false,
  reducirAnimaciones: false,
};

/** Fecha local en formato YYYY-MM-DD (nunca UTC: en Colombia el día cambiaría a las 7 p. m.). */
const FechaSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const AsignacionSchema = z.object({
  fecha: FechaSchema,
  capsulaId: z.string().min(1),
});

export const ProgresoSchema = z.object({
  /** Vuelta a la biblioteca: sube cuando se agotan las cápsulas y se vuelve a empezar. */
  ciclo: z.number().int().min(0),
  /** Ids completadas en el ciclo actual (se vacía al empezar un ciclo nuevo). */
  cicloCompletadas: z.array(z.string()),
  /** Registro completo, nunca se borra: es el "historial simple" (sin rachas punitivas). */
  historial: z.array(
    z.object({ capsulaId: z.string().min(1), fecha: FechaSchema }),
  ),
  asignacionHoy: AsignacionSchema.nullable(),
  asignacionAyer: AsignacionSchema.nullable(),
});
export type Progreso = z.infer<typeof ProgresoSchema>;

export const PROGRESO_INICIAL: Progreso = {
  ciclo: 0,
  cicloCompletadas: [],
  historial: [],
  asignacionHoy: null,
  asignacionAyer: null,
};
