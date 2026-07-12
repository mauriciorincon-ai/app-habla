// Persistencia local-first (ADR 002): localStorage, validado con zod, versionado en la clave.
// NO se importa desde lib/voice ni desde los worklets — el audio del niño nunca llega aquí
// (regla dura 2, vigilada por ESLint y por tests/unit/privacidad-voice.test.ts).

import type { z } from "zod";
import {
  AJUSTES_DEFECTO,
  AjustesSchema,
  PROGRESO_INICIAL,
  PerfilSchema,
  ProgresoSchema,
  type AjustesGuardados,
  type Perfil,
  type Progreso,
} from "./schemas";

const PREFIJO = "habla:";

export const CLAVES = {
  perfil: `${PREFIJO}v1:perfil`,
  ajustes: `${PREFIJO}v1:ajustes`,
  progreso: `${PREFIJO}v1:progreso`,
} as const;

function disponible(): boolean {
  return (
    typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  );
}

/**
 * Lee y valida. Un valor corrupto o de una versión vieja se ELIMINA y se trata como ausente:
 * la app nunca se rompe por datos viejos — simplemente vuelve a su estado inicial.
 */
export function leer<T>(clave: string, schema: z.ZodType<T>): T | null {
  if (!disponible()) return null;
  const crudo = window.localStorage.getItem(clave);
  if (crudo === null) return null;
  try {
    const parsed = schema.safeParse(JSON.parse(crudo));
    if (parsed.success) return parsed.data;
  } catch {
    // JSON inválido: mismo tratamiento que un valor que no pasa el esquema.
  }
  window.localStorage.removeItem(clave);
  return null;
}

export function guardar<T>(
  clave: string,
  schema: z.ZodType<T>,
  valor: T,
): void {
  if (!disponible()) return;
  const parsed = schema.safeParse(valor);
  if (!parsed.success) return;
  window.localStorage.setItem(clave, JSON.stringify(parsed.data));
}

export const leerPerfil = (): Perfil | null =>
  leer(CLAVES.perfil, PerfilSchema);
export const guardarPerfil = (perfil: Perfil): void =>
  guardar(CLAVES.perfil, PerfilSchema, perfil);

export const leerAjustes = (): AjustesGuardados =>
  leer(CLAVES.ajustes, AjustesSchema) ?? AJUSTES_DEFECTO;
export const guardarAjustes = (ajustes: AjustesGuardados): void =>
  guardar(CLAVES.ajustes, AjustesSchema, ajustes);

export const leerProgreso = (): Progreso =>
  leer(CLAVES.progreso, ProgresoSchema) ?? PROGRESO_INICIAL;
export const guardarProgreso = (progreso: Progreso): void =>
  guardar(CLAVES.progreso, ProgresoSchema, progreso);

/**
 * "Borrar todos mis datos" del panel de ajustes: total y honesto. Quita todo lo de la app y,
 * de paso, el caché del shell (que solo contiene archivos públicos, pero el botón promete todo).
 */
export function borrarTodo(): void {
  if (!disponible()) return;
  const aBorrar: string[] = [];
  for (let i = 0; i < window.localStorage.length; i++) {
    const clave = window.localStorage.key(i);
    if (clave?.startsWith(PREFIJO)) aBorrar.push(clave);
  }
  aBorrar.forEach((clave) => window.localStorage.removeItem(clave));

  if (typeof caches !== "undefined") {
    void caches
      .keys()
      .then((claves) => claves.forEach((c) => void caches.delete(c)));
  }
}
