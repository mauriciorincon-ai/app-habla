// El contacto visual de HOY (S9): UNA actividad por día, junto a la cápsula del habla. Motor PURO y
// determinista (regla 23): la fecha es un parámetro, nunca el reloj.
//
// Las 24 cápsulas de contacto visual no tienen etapa del habla: tienen un NIVEL (n1–n6, la escalera de
// «La pirámide»). Por eso no entran en `seleccionarCapsula`: este selector es propio.
//
// Garantías (bajo unit test):
//   - Cada día tiene su actividad, y es ESTABLE: la misma fecha y el mismo nivel dan siempre la misma.
//   - No se repite dentro de la semana (lunes a domingo): el grupo de la semana tiene al menos
//     `MINIMO_DEL_GRUPO` (7) actividades y el día de la semana indica la posición en el orden de esa semana.
//   - Calibrada al nivel que el adulto eligió: el grupo parte de las del nivel elegido y, solo si no
//     alcanzan para siete días, suma las de los niveles vecinos (primero los más cercanos, nunca un salto).

import type { CapsulaContactoVisual, NivelContactoVisual } from "@content/schema";
import { NIVELES_CONTACTO_VISUAL } from "@content/schema";
import { lunesDeLaSemana } from "@/lib/fecha";
import { fnv1a } from "./daily";

export const MINIMO_DEL_GRUPO = 7;

const POSICION: Record<NivelContactoVisual, number> = Object.fromEntries(
  NIVELES_CONTACTO_VISUAL.map((n, i) => [n, i]),
) as Record<NivelContactoVisual, number>;

/** Las actividades que sirven al nivel: las de ese nivel y, si no alcanzan para una semana, las más cercanas. */
export function grupoDelNivel(
  nivel: NivelContactoVisual,
  biblioteca: readonly CapsulaContactoVisual[],
): CapsulaContactoVisual[] {
  const base = POSICION[nivel];
  const porCercania = [...biblioteca].sort(
    (a, b) =>
      Math.abs(POSICION[a.nivel] - base) - Math.abs(POSICION[b.nivel] - base) ||
      POSICION[a.nivel] - POSICION[b.nivel] ||
      a.id.localeCompare(b.id),
  );
  // Se toman niveles completos (a igual distancia, los dos lados) hasta tener la semana cubierta.
  const grupo: CapsulaContactoVisual[] = [];
  let radio = 0;
  while (grupo.length < MINIMO_DEL_GRUPO && radio <= NIVELES_CONTACTO_VISUAL.length) {
    grupo.splice(0, grupo.length, ...porCercania.filter((c) => Math.abs(POSICION[c.nivel] - base) <= radio));
    radio++;
  }
  return grupo;
}

/** Día de la semana, lunes = 0 … domingo = 6, de una fecha local YYYY-MM-DD. */
export function indiceDeLaSemana(fecha: string): number {
  const [anio, mes, dia] = fecha.split("-").map(Number);
  return (new Date(anio, mes - 1, dia).getDay() + 6) % 7;
}

/**
 * La actividad de contacto visual de `fecha` para el `nivel` del adulto. `null` solo si la biblioteca
 * está vacía. El orden del grupo cambia cada semana (hash de lunes + id), y el día de la semana elige
 * la posición: siete días, siete actividades distintas.
 */
export function contactoVisualDeHoy(
  fecha: string,
  nivel: NivelContactoVisual,
  biblioteca: readonly CapsulaContactoVisual[],
): CapsulaContactoVisual | null {
  const grupo = grupoDelNivel(nivel, biblioteca);
  if (grupo.length === 0) return null;
  const lunes = lunesDeLaSemana(fecha);
  const orden = [...grupo].sort(
    (a, b) => fnv1a(`${lunes}:${nivel}:${a.id}`) - fnv1a(`${lunes}:${nivel}:${b.id}`) || a.id.localeCompare(b.id),
  );
  return orden[indiceDeLaSemana(fecha) % orden.length];
}
