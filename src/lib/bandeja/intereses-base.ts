// Lo mínimo de los «intereses» que comparten el perfil, el recordatorio y el pedido de cuentos (S14,
// ADR-026). Vive aparte, solo con zod, para que el esquema del perfil —que carga TODA pantalla— no arrastre
// el validador entero de los cuentos (presupuesto de script, 354 KB). Sin alias `@/`: lo usa también Node.

import { z } from "zod";

export const DIAS_DE_VIGENCIA = 30;
export const MAX_INTERESES = 5;

/** Algo que le gusta, en palabras genéricas: de una a tres palabras, solo letras. */
export const InteresSchema = z
  .string()
  .trim()
  .min(2)
  .max(24)
  .regex(/^\p{L}+(?:[ '-]\p{L}+){0,2}$/u);
