// LOTE GUIADO del estudio de grabación — PURO. Decide qué proponerle grabar al padre a
// continuación, en un orden con sentido: primero las palabras de los TEMAS que eligió para su hijo
// (las que el niño verá de verdad), luego el resto de palabras, luego consignas y celebraciones.
// Salta lo ya grabado. Determinista: mismo estado → mismo lote.

import { catalogoGrabable, type ItemGrabable } from "./catalogo";
import type { Tema } from "@/lib/storage/temas";

const PRIORIDAD_CATEGORIA: Record<ItemGrabable["categoria"], number> = {
  palabra: 0,
  consigna: 1,
  celebracion: 2,
};

/**
 * @param temas     los intereses elegidos en el onboarding (las palabras de esos temas van primero).
 * @param grabados  ids ya presentes en el banco (se saltan).
 * @param tamano    tope del lote (~20 → grabable en <10 min).
 */
export function siguienteLote(opts: {
  temas: readonly Tema[];
  grabados: ReadonlySet<string>;
  tamano?: number;
  catalogo?: readonly ItemGrabable[];
}): ItemGrabable[] {
  const { temas, grabados, tamano = 20, catalogo = catalogoGrabable() } = opts;
  const elegidos = new Set(temas);

  const rango = (i: ItemGrabable): number => {
    // Palabra de un tema elegido: lo más arriba. Luego por categoría, manteniendo el orden del
    // catálogo dentro de cada grupo (índice como desempate → determinista).
    if (i.categoria === "palabra" && i.tema && elegidos.has(i.tema)) return -1;
    return PRIORIDAD_CATEGORIA[i.categoria];
  };

  return catalogo
    .map((item, indice) => ({ item, indice }))
    .filter(({ item }) => !grabados.has(item.id))
    .sort((a, b) => rango(a.item) - rango(b.item) || a.indice - b.indice)
    .slice(0, Math.max(0, tamano))
    .map(({ item }) => item);
}
