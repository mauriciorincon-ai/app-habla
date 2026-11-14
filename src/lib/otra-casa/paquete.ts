// «Pasar a la otra casa» (S10, ADR-020) — QUÉ viaja. Solo el objetivo, el progreso y los logros (el
// registro de sesiones y de palabras gemelas), y el banco de voz del adulto SOLO si lo marca. Jamás la
// voz del niño (no existe guardada: regla dura 2), ni la videoteca, ni el perfil (el apodo puede
// identificarlo), ni los ajustes de este aparato, ni los cuentos. El esquema es `.strict()`: un campo
// de más hace que el archivo entero se rechace.

import { z } from "zod";
import {
  ObjetivoSchema,
  ProgresoSchema,
  RegistroGemelasSchema,
  RegistroSesionesSchema,
} from "@/lib/storage/schemas";

export const ESQUEMA_PAQUETE = 1;
/** Tope de grabaciones que viajan (el banco guiado más los cuentos caben con holgura). */
export const MAX_GRABACIONES = 400;
/** ≈ 2 MB por grabación en base64: una palabra o una página leída duran segundos. */
const MAX_B64_GRABACION = 2_800_000;
/** Tope de todo el banco en base64 (≈ 60 MB): un teléfono tiene que poder abrir el archivo entero. */
export const MAX_BANCO_BYTES = 60_000_000;

const FECHA = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const GrabacionPaqueteSchema = z
  .object({
    id: z
      .string()
      .min(1)
      .max(160)
      .regex(/^[A-Za-z0-9][A-Za-z0-9:_.-]*$/),
    mimeType: z
      .string()
      .min(1)
      .max(80)
      .regex(/^audio\/[a-z0-9.+-]+(;\s*codecs=[a-z0-9.,"\s-]+)?$/i),
    duracionMs: z.number().int().min(0).max(600_000),
    fecha: FECHA,
    datos: z.string().min(1).max(MAX_B64_GRABACION),
  })
  .strict();
export type GrabacionPaquete = z.infer<typeof GrabacionPaqueteSchema>;

export const PaqueteSchema = z
  .object({
    app: z.literal("habla"),
    esquema: z.literal(ESQUEMA_PAQUETE),
    creado: FECHA,
    objetivo: ObjetivoSchema.nullable(),
    progreso: ProgresoSchema,
    sesiones: RegistroSesionesSchema,
    gemelas: RegistroGemelasSchema,
    /** null = el adulto no marcó «incluir mi voz grabada». */
    banco: z
      .array(GrabacionPaqueteSchema)
      .max(MAX_GRABACIONES)
      .refine(
        (b) => b.reduce((n, g) => n + g.datos.length, 0) <= MAX_BANCO_BYTES,
        "banco-demasiado-grande",
      )
      .nullable(),
  })
  .strict();
export type Paquete = z.infer<typeof PaqueteSchema>;

/** Los campos que el paquete PUEDE llevar: el test de privacidad falla si alguien suma otro. */
export const CAMPOS_DEL_PAQUETE = Object.keys(PaqueteSchema.shape).sort();

export function leerPaquete(texto: string): Paquete | null {
  try {
    const r = PaqueteSchema.safeParse(JSON.parse(texto));
    return r.success ? r.data : null;
  } catch {
    return null;
  }
}

/** Nombre del archivo: la fecha y nada más (ni nombre ni apodo). */
export const nombreArchivo = (fecha: string): string =>
  `habla-otra-casa-${fecha}.habla`;
