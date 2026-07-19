// Persistencia local-first (ADR 002): localStorage, validado con zod, versionado en la clave.
// NO se importa desde lib/voice ni desde los worklets — el audio del niño nunca llega aquí
// (regla dura 2, vigilada por ESLint y por tests/unit/privacidad-voice.test.ts).

import type { z } from "zod";
import { eliminarBanco } from "@/lib/banco-voz/almacen";
import {
  AJUSTES_DEFECTO,
  AjustesSchema,
  PROGRESO_INICIAL,
  PerfilSchema,
  ProgresoSchema,
  ProgresoV1Schema,
  REGISTRO_GEMELAS_VACIO,
  RegistroGemelasSchema,
  migrarProgresoV1,
  type AjustesGuardados,
  type JuicioGemelo,
  type Perfil,
  type Progreso,
  type RegistroGemelas,
} from "./schemas";

const PREFIJO = "habla:";

export const CLAVES = {
  perfil: `${PREFIJO}v1:perfil`,
  ajustes: `${PREFIJO}v1:ajustes`,
  progreso: `${PREFIJO}v1:progreso`,
  gemelas: `${PREFIJO}v1:gemelas`,
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

/**
 * El progreso es la ÚNICA clave con migración (ADR 006): antes de descartar un valor que no
 * pasa el schema v2, se intenta la forma exacta del S1 y se transforma — el progreso real del
 * dispositivo no se pierde por actualizar la app. Solo si tampoco es v1 se trata como corrupto.
 */
export const leerProgreso = (): Progreso => {
  if (!disponible()) return PROGRESO_INICIAL;
  const crudo = window.localStorage.getItem(CLAVES.progreso);
  if (crudo === null) return PROGRESO_INICIAL;
  try {
    const json: unknown = JSON.parse(crudo);
    const v2 = ProgresoSchema.safeParse(json);
    if (v2.success) return v2.data;
    const v1 = ProgresoV1Schema.safeParse(json);
    if (v1.success) {
      const migrado = migrarProgresoV1(v1.data);
      guardar(CLAVES.progreso, ProgresoSchema, migrado);
      return migrado;
    }
  } catch {
    // JSON inválido: mismo tratamiento que un valor que no pasa ningún esquema.
  }
  window.localStorage.removeItem(CLAVES.progreso);
  return PROGRESO_INICIAL;
};
export const guardarProgreso = (progreso: Progreso): void =>
  guardar(CLAVES.progreso, ProgresoSchema, progreso);

export const leerRegistroGemelas = (): RegistroGemelas =>
  leer(CLAVES.gemelas, RegistroGemelasSchema) ?? REGISTRO_GEMELAS_VACIO;

/** Añade los juicios de una sesión, conservando solo los últimos 500 (insumo del S4). */
export const agregarJuiciosGemelas = (nuevos: JuicioGemelo[]): void => {
  const previo = leerRegistroGemelas();
  const juicios = [...previo.juicios, ...nuevos].slice(-500);
  guardar(CLAVES.gemelas, RegistroGemelasSchema, { juicios });
};

/**
 * "Borrar todos mis datos" del panel de ajustes: total y honesto. Quita todo lo de la app y,
 * de paso, el caché del shell (que solo contiene archivos públicos, pero el botón promete todo).
 * ASYNC (auditoría S3, A-3): quien navega después DEBE esperar esta promesa — si no, la
 * recarga puede ganarle la carrera al borrado del banco de voz y el botón mentiría.
 */
export async function borrarTodo(): Promise<void> {
  if (!disponible()) return;
  const aBorrar: string[] = [];
  for (let i = 0; i < window.localStorage.length; i++) {
    const clave = window.localStorage.key(i);
    if (clave?.startsWith(PREFIJO)) aBorrar.push(clave);
  }
  aBorrar.forEach((clave) => window.localStorage.removeItem(clave));

  // El banco de voz familiar vive en IndexedDB, no en localStorage: sin esto, "borrar mis datos"
  // dejaría atrás las grabaciones y el botón mentiría (S3). Se ESPERA su resolución real.
  await eliminarBanco();

  if (typeof caches !== "undefined") {
    await caches
      .keys()
      .then((claves) => Promise.all(claves.map((c) => caches.delete(c))))
      .catch(() => undefined); // el caché es best-effort: no bloquea el borrado prometido
  }
}
