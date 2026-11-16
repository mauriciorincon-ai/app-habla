"use client";

// LA SORPRESA (S15): una escena pequeña del tema de su mundo que aparece con los TURNOS del niño y se va
// sola. No es un premio: sale al llegar a su tercer turno con voz medida (acierte o no), una vez por
// partida, no se cuenta ni se guarda, y no hay monedas, fichas ni colección. Sin animación (aparece y
// desaparece, así que «reducir animaciones» no cambia nada) y sin captar toques (`pointer-events-none`).
// S16: vive EN EL FLUJO, dentro de un hueco de altura reservada que el marco pinta siempre en la pantalla
// del niño (`HuecoSorpresa`): no tapa la tarjeta ni los botones, y al aparecer no mueve nada.

import { type ReactNode, useEffect, useRef, useState } from "react";
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

/**
 * El sitio de la sorpresa: siempre presente en la pantalla del niño, con la altura de la tarjeta reservada
 * (también con una frase larga en un móvil estrecho). Es la región viva y existe desde el primer pintado:
 * así un lector de pantalla anuncia la tarjeta cuando entra en ella.
 */
export function HuecoSorpresa({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-28" role="status" aria-live="polite" data-testid="hueco-sorpresa">
      {children}
    </div>
  );
}

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
      data-testid="sorpresa"
      data-tema={tema}
      className="bg-superficie border-borde text-tinta pointer-events-none mx-auto flex w-full max-w-[26rem] items-center gap-3 rounded-2xl border-2 p-3 shadow-tarjeta"
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
