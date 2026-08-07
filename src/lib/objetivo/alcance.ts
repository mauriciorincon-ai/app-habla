// ALCANCE del objetivo (S4, auditoría de cierre) — motor PURO.
//
// El preview de /objetivo prometía contar "lo que se pone primero", pero contaba contra los
// bancos COMPLETOS (las 50 cápsulas de las 3 etapas, todos los pictogramas). La priorización
// real está acotada: la cápsula del día sale de la ETAPA ACTIVA (daily.ts), el mazo de
// palabra↔objeto sale de los TEMAS del perfil (palabra-objeto.tsx) y las gemelas de los pares
// JUGABLES en la etapa. Esto acota los bancos a ESO — lo que el niño de verdad verá — para que
// el conteo del preview sea honesto (regla dura 3).
//
// ⚠️ El filtro de pictos REFLEJA el del mazo real (palabra-objeto.tsx): con temas elegidos se
// filtra por tema, y si el filtro deja vacío (o no hay perfil) se usa la baraja completa. Si esa
// lógica cambia allá, cambia aquí — la honestidad del preview depende del espejo.

import type { Etapa } from "@content/schema";

export type BancosAlineables<C, P, R> = {
  capsulas: readonly C[];
  pictos: readonly P[];
  pares: readonly R[];
};

export function acotarContenido<
  C extends { etapa: Etapa },
  P extends { tema: string },
  R,
>(
  bancos: BancosAlineables<C, P, R>,
  alcance: {
    etapa: Etapa;
    /** Los temas del perfil, o `null` si no hay onboarding (= baraja completa, como el juego). */
    temas: readonly string[] | null;
    /** ¿Este par se juega en la etapa activa? (parJugableEn, inyectado para mantener esto puro). */
    parJugable: (par: R) => boolean;
  },
): BancosAlineables<C, P, R> {
  const capsulas = bancos.capsulas.filter((c) => c.etapa === alcance.etapa);

  const temas = alcance.temas;
  const candidatos = temas
    ? bancos.pictos.filter((p) => temas.includes(p.tema))
    : bancos.pictos;
  const pictos = candidatos.length > 0 ? candidatos : bancos.pictos;

  const pares = bancos.pares.filter(alcance.parJugable);

  return { capsulas, pictos, pares };
}
