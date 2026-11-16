// EL RECORDATORIO DE LOS CUENTOS DEL MES (S14, ADR-026, decisión «1a») — motor PURO.
//
// Una tarjeta del ADULTO en Hoy, con un botón para pedir el lote. Sin notificaciones ni permisos, y jamás
// a la vista del niño como alarma. Aparece si nunca se importó un lote, o si el último tiene 30 días o
// más (la misma vigencia del pedido, `DIAS_DE_VIGENCIA`). «Ahora no» la esconde 7 días (`DIAS_DE_POSPUESTO`);
// el interruptor de Ajustes la apaga del todo.
// La fecha es una perilla (regla 23): nada aquí lee el reloj.

import { DIAS_DE_VIGENCIA } from "./intereses-base";
import type { CuentosGuardados } from "@/lib/cuentos/estado";

/** Cuántos días esconde «Ahora no» la tarjeta (decisión «1a» del dueño, 2026-11-15). */
export const DIAS_DE_POSPUESTO = 7;

export type Recordatorio = { motivo: "nunca" } | { motivo: "vencido"; dias: number };

/** Días entre dos fechas YYYY-MM-DD (b − a), por calendario. */
export function diasEntre(a: string, b: string): number {
  const dia = (f: string) => {
    const [y, m, d] = f.split("-").map(Number);
    return Date.UTC(y, (m ?? 1) - 1, d ?? 1) / 86_400_000;
  };
  return Math.round(dia(b) - dia(a));
}

/** El último lote importado (la fecha más reciente), o null si nunca se importó ninguno. */
export function ultimoLote(cuentos: CuentosGuardados): string | null {
  let ultimo: string | null = null;
  for (const c of cuentos.cuentos) if (!ultimo || c.importado > ultimo) ultimo = c.importado;
  return ultimo;
}

/**
 * ¿Toca la tarjeta hoy? `pospuesto` es el día en que el adulto tocó «Ahora no»: no aparece mientras pasen
 * menos de `DIAS_DE_POSPUESTO` días desde entonces (día 0 a 6; el 7 vuelve). `activo` es el interruptor de
 * Ajustes: apagado, nunca aparece. Una fecha pospuesta futura (reloj corrido) no esconde nada.
 */
export function recordatorioCuentos(
  hoy: string,
  cuentos: CuentosGuardados,
  pospuesto: string | null = null,
  activo = true,
): Recordatorio | null {
  if (!activo) return null;
  if (pospuesto) {
    const desde = diasEntre(pospuesto, hoy);
    if (desde >= 0 && desde < DIAS_DE_POSPUESTO) return null;
  }
  const ultimo = ultimoLote(cuentos);
  if (!ultimo) return { motivo: "nunca" };
  const dias = diasEntre(ultimo, hoy);
  return dias >= DIAS_DE_VIGENCIA ? { motivo: "vencido", dias } : null;
}
