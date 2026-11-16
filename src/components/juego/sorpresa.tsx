"use client";

// LA SORPRESA (S15): una escena pequeña del tema de su mundo que aparece con los TURNOS del niño y se va
// sola. No es un premio: sale al llegar a su tercer turno con voz medida (acierte o no), una vez por
// partida, no se cuenta ni se guarda, y no hay monedas, fichas ni colección. Fija abajo y sin captar
// toques: no tapa nada ni cambia el layout. Con «reducir animaciones» solo cambia la opacidad.

import { useEffect, useRef, useState } from "react";
import { IconoBurbuja } from "@/components/iconos";
import { fechaHoy } from "@/lib/fecha";
import { useIdioma } from "@/lib/idioma/estado";
import {
  abreSorpresa,
  MS_SORPRESA_VISIBLE,
  sorpresaDelDia,
} from "@/lib/su-mundo/sorpresa";
import type { JuegoSuMundo } from "@/lib/su-mundo/su-mundo";
import { Protagonista } from "./protagonista";
import { useSuMundo } from "./use-su-mundo";

export function Sorpresa({
  juego,
  turnosNino,
}: {
  juego: JuegoSuMundo;
  turnosNino: number;
}) {
  const idioma = useIdioma();
  const { protagonista } = useSuMundo(juego);
  const [visible, setVisible] = useState(false);
  const anterior = useRef(turnosNino);

  useEffect(() => {
    const antes = anterior.current;
    anterior.current = turnosNino;
    if (abreSorpresa(antes, turnosNino)) setVisible(true);
  }, [turnosNino]);

  useEffect(() => {
    if (!visible) return;
    const id = window.setTimeout(() => setVisible(false), MS_SORPRESA_VISIBLE);
    return () => window.clearTimeout(id);
  }, [visible]);

  if (!visible) return null;
  const { tema, texto } = sorpresaDelDia(protagonista, fechaHoy(), juego, idioma);
  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="sorpresa"
      data-tema={tema}
      className="bg-superficie border-borde text-tinta pointer-events-none fixed bottom-4 left-1/2 z-10 flex w-[min(92vw,26rem)] -translate-x-1/2 items-center gap-3 rounded-2xl border-2 p-3 shadow-tarjeta"
    >
      {protagonista ? (
        <Protagonista juego={juego} className="size-12 shrink-0" />
      ) : (
        <IconoBurbuja className="text-acento h-8 w-8 shrink-0" />
      )}
      <p className="font-display text-lg">{texto}</p>
    </div>
  );
}
