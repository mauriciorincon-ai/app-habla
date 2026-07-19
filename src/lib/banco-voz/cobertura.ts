// COBERTURA del banco de voz — PURO. Cuántos ítems del catálogo ya tienen la voz de la familia,
// por categoría y en total. Es lo que la pantalla "Mi banco de voz" muestra ("palabras: 18/50").

import {
  catalogoGrabable,
  type CategoriaGrabable,
  type ItemGrabable,
} from "./catalogo";

export type CoberturaCategoria = {
  categoria: CategoriaGrabable;
  grabados: number;
  total: number;
};

export type Cobertura = {
  porCategoria: CoberturaCategoria[];
  grabados: number;
  total: number;
};

/**
 * @param grabados  ids de los ítems que ya tienen grabación (los que devuelve el almacén).
 * @param catalogo  por defecto el catálogo real; inyectable para tests.
 */
export function calcularCobertura(
  grabados: ReadonlySet<string>,
  catalogo: readonly ItemGrabable[] = catalogoGrabable(),
): Cobertura {
  const categorias: CategoriaGrabable[] = [
    "palabra",
    "consigna",
    "celebracion",
  ];
  const porCategoria = categorias.map((categoria) => {
    const items = catalogo.filter((i) => i.categoria === categoria);
    return {
      categoria,
      total: items.length,
      grabados: items.filter((i) => grabados.has(i.id)).length,
    };
  });
  return {
    porCategoria,
    total: catalogo.length,
    grabados: catalogo.filter((i) => grabados.has(i.id)).length,
  };
}
