// SUS INTERESES, EN UN SOLO LUGAR (S14, ADR-026, decisión «2a») — motor PURO.
//
// Antes había dos: los temas del perfil y el «Le gusta» de Cuentos. Ahora el perfil los reúne (temas +
// «otras cosas que le encantan»), y Cuentos los LEE de ahí. La migración pasa lo que la familia escribió
// en «Le gusta» al perfil sin perder nada, es idempotente y no mueve nada si no hay perfil todavía (en
// ese caso «Le gusta» se queda donde estaba, intacto, hasta que exista).
// Ninguno de los dos viaja a ningún lado nuevo: el perfil no va en el paquete de la otra casa (lo prueba
// `otra-casa.test`), y al pedido de cuentos van, como siempre, solo intereses genéricos.

import { MAX_INTERESES } from "@/lib/bandeja/intereses-base";
import type { CuentosGuardados } from "@/lib/cuentos/estado";
import type { Idioma } from "@/lib/idioma";
import { nombreTema } from "@/lib/idioma/textos/nombres";
import { MAX_OTRAS_COSAS, type Perfil } from "@/lib/storage/schemas";

/** Une dos listas sin repetir (sin distinguir mayúsculas), conservando el orden y la forma de la primera. */
export function unirSinRepetir(a: readonly string[], b: readonly string[]): string[] {
  const out: string[] = [];
  const vistos = new Set<string>();
  for (const v of [...a, ...b]) {
    const clave = v.trim().toLowerCase();
    if (clave && !vistos.has(clave)) {
      vistos.add(clave);
      out.push(v.trim());
    }
  }
  return out;
}

export type Migracion = { perfil: Perfil | null; cuentos: CuentosGuardados; movidos: number };

/**
 * Pasa el «Le gusta» de Cuentos a `perfil.otrasCosas`. Sin pérdida: lo que ya estaba en el perfil va
 * primero y lo de Cuentos se suma sin repetir; si no cabe todo en el perfil, lo que no cabe se queda en
 * Cuentos (no se borra nada que no se haya movido). Idempotente: con «Le gusta» vacío no hace nada.
 */
export function moverIntereses(perfil: Perfil | null, cuentos: CuentosGuardados): Migracion {
  if (!perfil || cuentos.intereses.length === 0) return { perfil, cuentos, movidos: 0 };
  const antes = perfil.otrasCosas ?? [];
  const unidos = unirSinRepetir(antes, cuentos.intereses);
  const caben = unidos.slice(0, MAX_OTRAS_COSAS);
  const enPerfil = new Set(caben.map((v) => v.toLowerCase()));
  const quedan = cuentos.intereses.filter((v) => !enPerfil.has(v.trim().toLowerCase()));
  return {
    perfil: { ...perfil, otrasCosas: caben },
    cuentos: { ...cuentos, intereses: quedan },
    movidos: cuentos.intereses.length - quedan.length,
  };
}

/**
 * Lo que le encanta, para el pedido de cuentos y las hojas: primero las «otras cosas» (lo más suyo),
 * luego el nombre de sus temas en el idioma de la pantalla; sin repetir y con el tope del contrato.
 */
export function interesesDe(
  perfil: Perfil | null,
  idioma: Idioma,
  legado: readonly string[] = [],
): string[] {
  const temas = (perfil?.temas ?? []).map((t) => nombreTema[t][idioma]);
  return unirSinRepetir(unirSinRepetir(perfil?.otrasCosas ?? [], legado), temas).slice(0, MAX_INTERESES);
}

/**
 * Lo que llena los huecos `{interes}` de los cuentos de la biblioteca: solo SUS «otras cosas» (y lo que no
 * cupo al migrar), jamás el nombre de un tema («El mar» no cabe en «le encantan {interes}»). Sin nada,
 * la plantilla usa su propio relleno.
 */
export function interesesParaCuentos(perfil: Perfil | null, legado: readonly string[] = []): string[] {
  return unirSinRepetir(perfil?.otrasCosas ?? [], legado).slice(0, MAX_INTERESES);
}
