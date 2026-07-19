import { z } from "zod";
import { ETAPA_DEFECTO, ETAPAS } from "@content/schema";
import { TEMAS } from "./temas";

// Lo ÚNICO que esta app guarda: progreso de cápsulas, ajustes y el onboarding local.
// Jamás audio del niño, jamás nada que lo identifique más allá del apodo que el padre elija
// (opcional, local, borrable en un toque) — ADR 002.

// Los temas viven en ./temas (los comparten el perfil y la curaduría de pictogramas).
export { NOMBRE_TEMA, TEMAS, type Tema } from "./temas";

export const PerfilSchema = z.object({
  /** Como el niño quiere que le digan. Opcional a propósito: la app funciona igual sin él. */
  apodo: z.string().trim().max(30).optional(),
  temas: z.array(z.enum(TEMAS)).min(1).max(3),
});
export type Perfil = z.infer<typeof PerfilSchema>;

export const AjustesSchema = z.object({
  modoCalma: z.boolean().catch(false),
  reducirAnimaciones: z.boolean().catch(false),
  /**
   * Etapa del habla activa (ADR 006). El `.catch` hace dos cosas: los ajustes guardados en S1
   * (sin este campo) migran solos al leerse, y el default "palabras-sueltas" es PERMANENTE
   * (ADR 005) — "primeras-frases" solo existe aquí si el padre la eligió explícitamente.
   */
  etapa: z.enum(ETAPAS).catch(ETAPA_DEFECTO),
  /**
   * Claro u oscuro en la pantalla del PADRE. Se llama "apariencia" y no "tema" porque en esta app
   * `tema` ya es otra cosa: los temas de interés del niño (animales, carros…). "sistema" (default)
   * sigue al sistema operativo; el padre puede forzarlo sin tener que cambiarle el tema a todo el
   * computador (hallazgo del gate, 2026-07-12). La pantalla del NIÑO es clara SIEMPRE, elija lo
   * que elija: no depende de esto.
   */
  apariencia: z.enum(["sistema", "claro", "oscuro"]).catch("sistema"),
  /**
   * "Usar la voz de la familia" (S3). Cuando hay grabaciones y esto está activo, los juegos suenan
   * con la voz grabada; si no, el fallback silencioso de siempre. Default `true`: si el padre se
   * tomó el trabajo de grabar, que se oiga. Se puede apagar sin borrar el banco.
   */
  vozFamiliar: z.boolean().catch(true),
});
export type AjustesGuardados = z.infer<typeof AjustesSchema>;
export type Apariencia = AjustesGuardados["apariencia"];

export const AJUSTES_DEFECTO: AjustesGuardados = {
  modoCalma: false,
  reducirAnimaciones: false,
  etapa: ETAPA_DEFECTO,
  apariencia: "sistema",
  vozFamiliar: true,
};

/** Fecha local en formato YYYY-MM-DD (nunca UTC: en Colombia el día cambiaría a las 7 p. m.). */
const FechaSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const AsignacionSchema = z.object({
  fecha: FechaSchema,
  capsulaId: z.string().min(1),
});

/**
 * El progreso de UNA etapa. La asignación del día vive AQUÍ, no fuera: cada etapa tiene su
 * cápsula de hoy. Así, si el padre cambia de etapa y vuelve el mismo día, se reencuentra con la
 * cápsula que ya tenía (completada o no) — su trabajo del día no desaparece. (Este defecto lo
 * cazó el e2e de etapas: la asignación global se perdía al cambiar y volver.)
 */
const ProgresoDeEtapaSchema = z.object({
  /** Vuelta a la etapa: sube cuando se agotan sus cápsulas y se vuelve a empezar. */
  ciclo: z.number().int().min(0),
  /** Ids completadas en el ciclo actual DE ESTA ETAPA (agotar una etapa no toca las otras). */
  cicloCompletadas: z.array(z.string()),
  asignacionHoy: AsignacionSchema.nullable(),
  asignacionAyer: AsignacionSchema.nullable(),
});
export type ProgresoDeEtapa = z.infer<typeof ProgresoDeEtapaSchema>;

/** Progreso v2 (ADR 006): ciclos y asignación POR ETAPA. El historial global jamás se borra. */
export const ProgresoSchema = z.object({
  porEtapa: z.record(z.enum(ETAPAS), ProgresoDeEtapaSchema),
  /** Registro completo, nunca se borra: es el "historial simple" (sin rachas punitivas). */
  historial: z.array(
    z.object({ capsulaId: z.string().min(1), fecha: FechaSchema }),
  ),
});
export type Progreso = z.infer<typeof ProgresoSchema>;

export const ETAPA_VACIA: ProgresoDeEtapa = {
  ciclo: 0,
  cicloCompletadas: [],
  asignacionHoy: null,
  asignacionAyer: null,
};

export const PROGRESO_INICIAL: Progreso = {
  porEtapa: {
    "sonidos-e-intentos": { ...ETAPA_VACIA },
    "palabras-sueltas": { ...ETAPA_VACIA },
    "primeras-frases": { ...ETAPA_VACIA },
  },
  historial: [],
};

// --- Migración v1 → v2 -------------------------------------------------------------------
// El dispositivo del usuario tiene progreso REAL guardado con la forma del S1. Esa clave no se
// descarta jamás sin intentar migrarla: todo lo completado en v1 pertenece a la etapa
// "palabras-sueltas" (la única que existía — ADR 005).

const AsignacionV1Schema = z.object({
  fecha: FechaSchema,
  capsulaId: z.string().min(1),
});

/** La forma exacta del progreso del Sprint 1 — existe SOLO para migrar. */
export const ProgresoV1Schema = z.object({
  ciclo: z.number().int().min(0),
  cicloCompletadas: z.array(z.string()),
  historial: z.array(
    z.object({ capsulaId: z.string().min(1), fecha: FechaSchema }),
  ),
  asignacionHoy: AsignacionV1Schema.nullable(),
  asignacionAyer: AsignacionV1Schema.nullable(),
});
export type ProgresoV1 = z.infer<typeof ProgresoV1Schema>;

export function migrarProgresoV1(v1: ProgresoV1): Progreso {
  return {
    porEtapa: {
      "sonidos-e-intentos": { ...ETAPA_VACIA },
      // Todo lo que existía en el S1 era de esta etapa (era la única — ADR 005).
      "palabras-sueltas": {
        ciclo: v1.ciclo,
        cicloCompletadas: v1.cicloCompletadas,
        asignacionHoy: v1.asignacionHoy,
        asignacionAyer: v1.asignacionAyer,
      },
      "primeras-frases": { ...ETAPA_VACIA },
    },
    historial: v1.historial,
  };
}

// ─── Palabras gemelas (S3) ────────────────────────────────────────────────────────────────────
// Registro LOCAL de lo que el padre marcó, ronda a ronda. Insumo del progreso honesto del S4.
// No hay "acierto": solo qué palabra del par oyó el padre. Se acota para no crecer sin límite.

export const JuicioGemeloSchema = z.object({
  fecha: FechaSchema,
  /** El par jugado (id de content/pares-gemelos). */
  parId: z.string().min(1),
  /** Qué palabra marcó el padre haber oído: "a" | "b", o "saltada" si el niño no intentó. */
  marca: z.enum(["a", "b", "saltada"]),
});
export type JuicioGemelo = z.infer<typeof JuicioGemeloSchema>;

/** Los últimos N juicios (cap 500: suficiente para el progreso, nunca crece sin fin). */
export const RegistroGemelasSchema = z.object({
  juicios: z.array(JuicioGemeloSchema).max(500),
});
export type RegistroGemelas = z.infer<typeof RegistroGemelasSchema>;

export const REGISTRO_GEMELAS_VACIO: RegistroGemelas = { juicios: [] };
