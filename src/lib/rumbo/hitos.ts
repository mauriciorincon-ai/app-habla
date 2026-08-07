// RUMBO — hitos funcionales (Outcome 1) — motor PURO.
//
// Un hito es un logro CONCRETO y celebrable, derivado de lo medido o marcado — nunca un puntaje
// clínico ni un "nivel". Se alcanzan una vez y se quedan (no se pierden por una semana floja). Son
// la cara amable del progreso: "la primera palabra que TÚ le oíste", no "percentil 40".

import { lunesDeLaSemana } from "@/lib/fecha";
import { HITO_VUELTA_MS } from "@/lib/session-flow";
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

/** Días de práctica ACUMULADOS (total histórico — el número que nunca baja). */
const UMBRALES_DIAS_TOTALES = [
  { d: 10, id: "dias-10", titulo: "10 días de práctica en total" },
  { d: 25, id: "dias-25", titulo: "25 días de práctica en total" },
];

/** Dibujos encendidos ACUMULADOS (cuentan las repeticiones: cada encendido fue voz real). */
const UMBRALES_DIBUJOS = [
  { n: 50, id: "dibujos-50", titulo: "50 dibujos encendidos con su voz" },
];

/** Palabras que el PADRE marcó haber oído, acumuladas (reconocidas + participación gemelas). */
const UMBRALES_OIDAS = [
  { n: 10, id: "oidas-10", titulo: "10 palabras que TÚ le oíste" },
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

  // Su voz sostenida 5 segundos seguidos (racha del globo). El título dice "5 segundos", no
  // "más de 5": en el borde exacto (5000 ms) el "más de" sería mentira (auditoría de cierre).
  const vozLarga = orden.find((s) => s.juego === "globo" && s.rachaMs >= 5000);
  if (vozLarga) {
    hitos.push({
      id: "voz-larga",
      titulo: "Su voz sonó 5 segundos seguidos",
      fecha: vozLarga.fecha,
    });
  }
  const vozMuyLarga = orden.find(
    (s) => s.juego === "globo" && s.rachaMs >= 10000,
  );
  if (vozMuyLarga) {
    hitos.push({
      id: "voz-larga-10",
      titulo: "Su voz sonó 10 segundos seguidos",
      fecha: vozMuyLarga.fecha,
    });
  }

  // Primeras veces de cada juego (gate S4, N3): logros concretos, celebrables, con fecha.
  const primerEncendido = orden.find(
    (s) => s.juego === "palabras" && s.encendidos > 0,
  );
  if (primerEncendido) {
    hitos.push({
      id: "primer-encendido",
      titulo: "El primer dibujo que su voz encendió",
      fecha: primerEncendido.fecha,
    });
  }
  const primeraVuelta = orden.find(
    (s) => s.juego === "globo" && s.vozMs >= HITO_VUELTA_MS,
  );
  if (primeraVuelta) {
    hitos.push({
      id: "primera-vuelta",
      titulo: "La primera vuelta completa del globo",
      fecha: primeraVuelta.fecha,
    });
  }
  const primeraSirena = orden.find(
    (s) => s.juego === "cohete" && s.inversiones > 0,
  );
  if (primeraSirena) {
    hitos.push({
      id: "primera-sirena",
      titulo: "La primera sirena: su voz subió y bajó",
      fecha: primeraSirena.fecha,
    });
  }
  const primeraGemela = orden.find(
    (s) => s.juego === "gemelas" && s.rondas > 0,
  );
  if (primeraGemela) {
    hitos.push({
      id: "primera-gemela",
      titulo: "Su primera ronda de palabras gemelas",
      fecha: primeraGemela.fecha,
    });
  }

  // Acumulados que nunca bajan (dibujos encendidos, palabras oídas): en orden cronológico.
  let dibujosAcum = 0;
  let oidasAcum = 0;
  let idxDibujos = 0;
  let idxOidas = 0;
  for (const s of orden) {
    if (s.juego === "palabras") {
      dibujosAcum += s.encendidos;
      oidasAcum += s.reconocidas;
    }
    if (s.juego === "gemelas") oidasAcum += s.participadas;
    while (
      idxDibujos < UMBRALES_DIBUJOS.length &&
      dibujosAcum >= UMBRALES_DIBUJOS[idxDibujos].n
    ) {
      hitos.push({
        id: UMBRALES_DIBUJOS[idxDibujos].id,
        titulo: UMBRALES_DIBUJOS[idxDibujos].titulo,
        fecha: s.fecha,
      });
      idxDibujos++;
    }
    while (
      idxOidas < UMBRALES_OIDAS.length &&
      oidasAcum >= UMBRALES_OIDAS[idxOidas].n
    ) {
      hitos.push({
        id: UMBRALES_OIDAS[idxOidas].id,
        titulo: UMBRALES_OIDAS[idxOidas].titulo,
        fecha: s.fecha,
      });
      idxOidas++;
    }
  }

  // Días de práctica acumulados (cualquier práctica: juego o cápsula), día a día.
  const diasUnicos = [...new Set(fechas)].sort();
  for (const u of UMBRALES_DIAS_TOTALES) {
    if (diasUnicos.length >= u.d) {
      hitos.push({ id: u.id, titulo: u.titulo, fecha: diasUnicos[u.d - 1] });
    }
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
