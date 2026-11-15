"use client";

// La franja del adulto (S13, ADR-025): una banda fina arriba, en la paleta del adulto, QUIETA, fuera de la
// zona de toque del niño. Lleva el botón con el que el adulto marca el turno (nada adivina de quién es
// una voz) y, unos segundos, la línea del apuntador en el momento justo; luego se va sola.
//
// Es el ÚNICO texto para el adulto que la vista del niño admite (design-system.md). El modo calma y el
// ajuste «Tu apuntador» apagan la LÍNEA; el botón de turno se queda, porque el indicador del niño lo usa.
// Sin sonido (los juegos de micrófono no emiten: el eco volvería por el micrófono).

import { useEffect, useRef, useState } from "react";
import { useAjustes, useProgreso } from "@/components/estado-local";
import { capsulaDeHoy } from "@/components/estado-capsulas";
import { useT } from "@/lib/idioma/estado";
import { apuntador as textos } from "@/lib/idioma/textos/apuntador";
import { suMundo as textosSuMundo } from "@/lib/idioma/textos/su-mundo";
import type { JuegoSuMundo } from "@/lib/su-mundo/su-mundo";
import { useSuMundo } from "./use-su-mundo";
import {
  elegirLinea,
  momentoDeTransicion,
  MS_LINEA_VISIBLE,
  registrarLinea,
  type HistorialApuntador,
  type LineaApuntador,
} from "@/lib/coach/apuntador";
import type { Sesion, Turno } from "@/lib/session-flow";

type Props = {
  sesion: Sesion;
  /** Lo que ya se dijo en ESTA partida: vive en el marco para sobrevivir a «Otra vez» y a recalibrar. */
  historial: {
    leer: () => HistorialApuntador;
    escribir: (h: HistorialApuntador) => void;
  };
  onCambiarTurno: (turno: Turno) => void;
  /** Su mundo (S14): en el turno del adulto, la franja le propone una palabra de la meta de la semana. */
  juego?: JuegoSuMundo;
};

/** En tu turno: «Puedes decir: rojo · azul». Solo para el adulto; jamás una orden al niño. */
function PalabrasParaTuTurno({ juego }: { juego: JuegoSuMundo }) {
  const tx = useT();
  const { palabrasAModelar } = useSuMundo(juego);
  if (palabrasAModelar.length === 0) return null;
  return (
    <p className="text-tinta basis-full text-sm" data-testid="apuntador-palabras">
      <span className="font-medium">{tx(textosSuMundo.apuntadorPalabra)}</span>{" "}
      {palabrasAModelar.join(" · ")}
    </p>
  );
}

export function FranjaApuntador({
  sesion,
  historial,
  onCambiarTurno,
  juego,
}: Props) {
  const tx = useT();
  const ajustes = useAjustes();
  const progreso = useProgreso();
  const { turno } = sesion;
  const modoCalma = sesion.ajustes.modoCalma;
  const lineaActiva = (ajustes?.apuntador ?? true) && !modoCalma;

  const tecnicaDelDia =
    progreso && ajustes
      ? capsulaDeHoy(progreso, ajustes.etapa).capsula.tecnica
      : undefined;

  const [linea, setLinea] = useState<LineaApuntador | null>(null);
  const antes = useRef<Sesion>(sesion);

  // Qué pasó en el juego → ¿hay línea? (la memoria de «ya se dijo» vive solo en esta sesión).
  useEffect(() => {
    const previa = antes.current;
    antes.current = sesion;
    if (!lineaActiva) return;
    const momento = momentoDeTransicion(previa, sesion);
    if (!momento) return;
    const ahora = Date.now();
    const elegida = elegirLinea(
      momento,
      historial.leer(),
      ahora,
      tecnicaDelDia,
    );
    if (!elegida) return;
    historial.escribir(registrarLinea(historial.leer(), elegida, ahora));
    setLinea(elegida);
  }, [sesion, lineaActiva, tecnicaDelDia, historial]);

  // La línea aparece unos segundos y se va.
  useEffect(() => {
    if (!linea) return;
    const id = window.setTimeout(() => setLinea(null), MS_LINEA_VISIBLE);
    return () => window.clearTimeout(id);
  }, [linea]);

  // Apagar el apuntador (calma o ajuste) retira la línea que estuviera a medias.
  const visible = lineaActiva ? linea : null;

  const alTurnoDeEl = turno === "adulto";
  // En el cierre ya no hay turnos que marcar: queda solo la línea.
  const enCierre = sesion.actual.fase === "celebracion";
  return (
    <div
      className="bg-superficie border-borde text-tinta flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border px-3 py-2"
      data-testid="franja-apuntador"
      data-turno={turno}
    >
      {enCierre ? null : (
        <>
          <button
            type="button"
            onClick={() => onCambiarTurno(alTurnoDeEl ? "nino" : "adulto")}
            className="bg-acento text-sobre-acento min-h-11 shrink-0 rounded-xl px-4 text-sm font-medium"
            data-testid="cambiar-turno"
          >
            {tx(
              alTurnoDeEl
                ? textos.franja.pasarleElTurno
                : textos.franja.tomarElTurno,
            )}
          </button>
          <p className="text-tinta-suave text-sm" data-testid="turno-actual">
            {tx(
              alTurnoDeEl ? textos.franja.turnoTuyo : textos.franja.turnoDeEl,
            )}
          </p>
        </>
      )}
      <p
        aria-live="polite"
        className="text-tinta min-w-0 flex-1 text-sm"
        data-testid="linea-apuntador"
        data-linea={visible?.id ?? ""}
      >
        {visible ? tx(visible.texto) : null}
      </p>
      {juego && alTurnoDeEl && !enCierre ? (
        <PalabrasParaTuTurno juego={juego} />
      ) : null}
    </div>
  );
}
