// Fechas locales, en un solo lugar (dedup del remate S4: `fechaHoy` estaba copiado en gemelas.tsx
// y estudio-cliente.tsx). Motor PURO salvo `fechaHoy`, que lee el reloj.
//
// SIEMPRE hora local, nunca UTC: en Colombia el día cambiaría a las 7 p. m. y "hoy" mentiría.

/** Fecha LOCAL del dispositivo como YYYY-MM-DD. */
export function claveFechaLocal(fecha: Date): string {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

/** Hoy, en local (la única función con efecto: lee `new Date()`). */
export function fechaHoy(): string {
  return claveFechaLocal(new Date());
}

/**
 * El lunes de la semana de una fecha, como clave YYYY-MM-DD. Agrupa las sesiones por semana para
 * el Rumbo. Puro y determinista: misma fecha → mismo lunes. La semana empieza en lunes (es-CO).
 */
export function lunesDeLaSemana(fecha: string): string {
  const [anio, mes, dia] = fecha.split("-").map(Number);
  const dt = new Date(anio, mes - 1, dia);
  const diaSemana = dt.getDay(); // 0=domingo … 6=sábado
  const haciaLunes = (diaSemana + 6) % 7; // domingo→6, lunes→0, martes→1 …
  dt.setDate(dt.getDate() - haciaLunes);
  return claveFechaLocal(dt);
}
