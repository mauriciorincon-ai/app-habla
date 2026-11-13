// REGLAS de la videoteca de la familia (S8) — lógica PURA, sin IndexedDB ni DOM: se prueba sola.
//
// La videoteca guarda clips que la familia ELIGE de su propia galería. La app NO abre la cámara
// (regla dura 2): el único camino de entrada es <input type="file" accept="video/*"> sin `capture`.
// Todo vive SOLO en este dispositivo (`habla-videoteca`, IndexedDB); jamás a la red ni al repo.

/** Un clip corto, no una película: es utilería de juego, y el almacenamiento del dispositivo es finito. */
export const MAX_DURACION_S = 60;
/** Tope de tamaño por clip (50 MB). */
export const MAX_BYTES = 50 * 1024 * 1024;
/** Tope de clips guardados. */
export const MAX_CLIPS = 12;

/** Lo que el adulto quiere que el clip modele. Cada uno es una conducta observable, no un juicio. */
export const CONDUCTAS = ["pedir", "saludar", "jugar"] as const;
export type Conducta = (typeof CONDUCTAS)[number];

export function esConducta(v: unknown): v is Conducta {
  return typeof v === "string" && (CONDUCTAS as readonly string[]).includes(v);
}

export type MotivoRechazo = "no-es-video" | "demasiado-grande" | "demasiado-largo" | "sin-lugar";

export type Veredicto = { ok: true } | { ok: false; motivo: MotivoRechazo };

/** ¿Este archivo entra a la videoteca? `duracionS` es null si el navegador no pudo leerla. */
export function revisarClip(
  archivo: { size: number; type: string },
  duracionS: number | null,
  guardados: number,
): Veredicto {
  if (!archivo.type.startsWith("video/")) return { ok: false, motivo: "no-es-video" };
  if (guardados >= MAX_CLIPS) return { ok: false, motivo: "sin-lugar" };
  if (archivo.size > MAX_BYTES) return { ok: false, motivo: "demasiado-grande" };
  if (duracionS !== null && duracionS > MAX_DURACION_S) return { ok: false, motivo: "demasiado-largo" };
  return { ok: true };
}

/** El texto libre de «quién aparece»: recortado, sin saltos de línea, y corto. Vive solo en local. */
export const MAX_QUIEN = 40;
export function limpiarQuien(texto: string): string {
  return texto.replace(/\s+/g, " ").trim().slice(0, MAX_QUIEN);
}
