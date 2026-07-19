// RUMBO — hitos funcionales (Outcome 1) — motor PURO.
//
// Un hito es un logro CONCRETO y celebrable, derivado de lo medido o marcado — nunca un puntaje
// clínico ni un "nivel". Se alcanzan una vez y se quedan (no se pierden por una semana floja). Son
// la cara amable del progreso: "la primera palabra que TÚ le oíste", no "percentil 40".

import { lunesDeLaSemana } from "@/lib/fecha";
import type { Sesion } from "@/lib/storage/schemas";
import type { DiaCapsula } from "./tendencias";

export type Hito = {
  id: string;
  titulo: string;
  /** La fecha (o la semana, para los de constancia) en que se alcanzó — YYYY-MM-DD. */
  fecha: string;
};

const UMBRALES_PALABRAS = [
  { n: 10, id: "palabras-10", titulo: "10 palabras distintas practicadas" },
  { n: 25, id: "palabras-25", titulo: "25 palabras distintas practicadas" },
];

const UMBRALES_CONSTANCIA = [
  { d: 3, id: "constancia-3", titulo: "Una semana de 3 días juntos" },
  { d: 5, id: "constancia-5", titulo: "Una semana de 5 días juntos" },
];

/**
 * Los hitos alcanzados, ordenados como una línea de tiempo (más antiguo primero). Recibe las
 * sesiones de juego y los días de cápsula (historial); si no hay nada, devuelve lista vacía y la
 * pantalla muestra su estado vacío honesto ("jueguen unos días y esto cobra vida").
 */
export function hitosAlcanzados(
  sesiones: readonly Sesion[],
  historial: readonly DiaCapsula[] = [],
): Hito[] {
  const orden = [...sesiones].sort((a, b) =>
    a.fecha < b.fecha ? -1 : a.fecha > b.fecha ? 1 : 0,
  );
  const hitos: Hito[] = [];

  // Primer día juntos: lo más temprano entre juegos y cápsulas.
  const fechas = [
    ...orden.map((s) => s.fecha),
    ...historial.map((h) => h.fecha),
  ].sort();
  if (fechas.length === 0) return hitos;
  hitos.push({
    id: "primer-dia",
    titulo: "Su primer rato de práctica juntos",
    fecha: fechas[0],
  });

  // La primera palabra que TÚ oíste (el padre marcó reconocida o participación).
  const primeraOida = orden.find(
    (s) =>
      (s.juego === "palabras" && s.reconocidas > 0) ||
      (s.juego === "gemelas" && s.participadas > 0),
  );
  if (primeraOida) {
    hitos.push({
      id: "primera-oida",
      titulo: "La primera palabra que TÚ le oíste",
      fecha: primeraOida.fecha,
    });
  }

  // Su voz sostenida más de 5 segundos seguidos (racha del globo).
  const vozLarga = orden.find((s) => s.juego === "globo" && s.rachaMs >= 5000);
  if (vozLarga) {
    hitos.push({
      id: "voz-larga",
      titulo: "Su voz sonó más de 5 segundos seguidos",
      fecha: vozLarga.fecha,
    });
  }

  // Palabras distintas practicadas: se cuentan acumulando en orden cronológico.
  const vistas = new Set<string>();
  let idx = 0;
  for (const s of orden) {
    if (s.juego === "palabras") for (const p of s.palabras) vistas.add(p);
    while (
      idx < UMBRALES_PALABRAS.length &&
      vistas.size >= UMBRALES_PALABRAS[idx].n
    ) {
      hitos.push({
        id: UMBRALES_PALABRAS[idx].id,
        titulo: UMBRALES_PALABRAS[idx].titulo,
        fecha: s.fecha,
      });
      idx++;
    }
  }

  // Constancia: la primera semana que alcanzó N días con práctica (juego o cápsula).
  const diasPorSemana = new Map<string, Set<string>>();
  for (const f of fechas) {
    const k = lunesDeLaSemana(f);
    const set = diasPorSemana.get(k) ?? new Set<string>();
    set.add(f);
    diasPorSemana.set(k, set);
  }
  const semanasOrdenadas = [...diasPorSemana.entries()].sort((a, b) =>
    a[0] < b[0] ? -1 : 1,
  );
  for (const u of UMBRALES_CONSTANCIA) {
    const primera = semanasOrdenadas.find(([, dias]) => dias.size >= u.d);
    if (primera) hitos.push({ id: u.id, titulo: u.titulo, fecha: primera[0] });
  }

  return hitos.sort((a, b) =>
    a.fecha < b.fecha ? -1 : a.fecha > b.fecha ? 1 : 0,
  );
}
