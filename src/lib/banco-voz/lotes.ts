// LOTE GUIADO del estudio de grabación — PURO. Decide qué proponerle grabar al padre a
// continuación, en un orden con sentido. Salta lo ya grabado. Determinista: mismo estado → mismo lote.
//
// Prioridad (S4, paga la deuda "lote-por-etapa" DENTRO del objetivo de la semana):
//   1. Palabras del OBJETIVO de la semana (lo que la fonoaudióloga pidió trabajar) — lo primero.
//   2. Palabras de los TEMAS que eligió para su hijo (las que el niño verá de verdad).
//   3. El resto de palabras, luego consignas, luego celebraciones.
// Y por ETAPA: en "sonidos-e-intentos" las palabras que SOLO viven en gemelas (aún no jugable ahí)
// bajan al final — no tiene sentido pedirle grabar algo que el niño todavía no va a oír.

import { catalogoGrabable, type ItemGrabable } from "./catalogo";
import type { Tema } from "@/lib/storage/temas";
import type { Etapa } from "@content/schema";
import type { Alineacion } from "@/lib/objetivo/alinear";

const PRIORIDAD_CATEGORIA: Record<ItemGrabable["categoria"], number> = {
  palabra: 0,
  consigna: 1,
  celebracion: 2,
};

/** Palabra que solo existe en las gemelas (no es picto de ningún tema): sin `tema`. */
function soloDeGemelas(i: ItemGrabable): boolean {
  return i.categoria === "palabra" && !i.tema;
}

/**
 * ¿Este ítem grabable sirve al objetivo de la semana? Es EL predicado del lote (rango -2) y lo
 * comparte el preview de /objetivo (auditoría de cierre S4): así lo que el preview promete del
 * estudio y lo que el lote hace de verdad no pueden divergir.
 */
export function coincideConObjetivo(
  objetivo: Alineacion | undefined,
  i: ItemGrabable,
): boolean {
  return (
    !!objetivo?.activo &&
    (objetivo.coincidePalabra(i.texto) ||
      (i.tema ? objetivo.coincideTema(i.tema) : false))
  );
}

/**
 * @param temas     los intereses elegidos en el onboarding (sus palabras van arriba).
 * @param grabados  ids ya presentes en el banco (se saltan).
 * @param objetivo  la alineación del objetivo de la semana (S4). Sin objetivo activo, no cambia nada.
 * @param etapa     la etapa activa (S4). Solo "sonidos-e-intentos" reordena (baja las de gemelas).
 * @param tamano    tope del lote (~20 → grabable en <10 min).
 */
export function siguienteLote(opts: {
  temas: readonly Tema[];
  grabados: ReadonlySet<string>;
  objetivo?: Alineacion;
  etapa?: Etapa;
  tamano?: number;
  catalogo?: readonly ItemGrabable[];
}): ItemGrabable[] {
  const {
    temas,
    grabados,
    objetivo,
    etapa = "palabras-sueltas",
    tamano = 20,
    catalogo = catalogoGrabable(),
  } = opts;
  const elegidos = new Set(temas);

  const rango = (i: ItemGrabable): number => {
    if (coincideConObjetivo(objetivo, i)) return -2; // el objetivo de la semana, lo primero
    if (i.categoria === "palabra" && i.tema && elegidos.has(i.tema)) return -1;
    return PRIORIDAD_CATEGORIA[i.categoria];
  };

  // Solo en la etapa de sonidos las palabras exclusivas de gemelas bajan al final (aún no jugables).
  const penaEtapa = (i: ItemGrabable): number =>
    etapa === "sonidos-e-intentos" && soloDeGemelas(i) ? 100 : 0;

  return catalogo
    .map((item, indice) => ({ item, indice }))
    .filter(({ item }) => !grabados.has(item.id))
    .sort(
      (a, b) =>
        rango(a.item) +
          penaEtapa(a.item) -
          (rango(b.item) + penaEtapa(b.item)) || a.indice - b.indice,
    )
    .slice(0, Math.max(0, tamano))
    .map(({ item }) => item);
}
