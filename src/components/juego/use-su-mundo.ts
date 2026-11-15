"use client";

// Su mundo, REACTIVO (S14, ADR-026): los temas del perfil y la meta de la semana, leídos con sus hooks
// de siempre (`usePerfil`, `useObjetivo`), así que si el adulto cambia la meta, cada pantalla que use
// esto se entera sin recargar. La fecha se lee una vez por montaje: el protagonista no cambia a mitad de
// un juego aunque pase la medianoche.

import { useMemo, useState } from "react";
import { useObjetivo, usePerfil } from "@/components/estado-local";
import { fechaHoy } from "@/lib/fecha";
import { useIdioma } from "@/lib/idioma/estado";
import { suMundo, type JuegoSuMundo, type SuMundo } from "@/lib/su-mundo/su-mundo";

export function useSuMundo(juego: JuegoSuMundo): SuMundo {
  const perfil = usePerfil();
  const objetivo = useObjetivo();
  const idioma = useIdioma();
  const [fecha] = useState(fechaHoy);
  const temas = perfil?.temas;
  const texto = objetivo?.texto ?? null;
  return useMemo(
    () => suMundo({ temas: temas ?? [], objetivo: texto, idioma, fecha }, juego),
    [temas, texto, idioma, fecha, juego],
  );
}
