"use client";

// The adult's line of «¿Dijo la palabra?» (S11, ADR-023): «Maybe they said X» — icon + text, never color
// alone, never a «no». With nothing to suggest it shows nothing (only a quiet status when the recognizer
// could not start). The child's screen never carries this text; the adult's button still decides.

import { useT } from "@/lib/idioma/estado";
import { reconocedor as txr } from "@/lib/idioma/textos/reconocedor";
import type { EstadoReconocedor } from "./use-reconocedor";

export function QuizasDijo({
  palabra,
  estado,
}: {
  /** The round's word when the recognizer thinks it heard it; null otherwise. */
  palabra: string | null;
  estado: EstadoReconocedor;
}) {
  const tx = useT();
  const nota =
    estado === "sin-modelo"
      ? txr.juego.sinModelo
      : estado === "error"
        ? txr.juego.noArranco
        : null;
  return (
    <div
      className="text-tinta-suave min-h-6 text-center text-sm"
      aria-live="polite"
      data-testid="quizas-region"
    >
      {palabra ? (
        <p data-testid="quizas-dijo" className="inline-flex items-center gap-2">
          <span
            aria-hidden="true"
            className="border-acento text-acento flex h-5 w-5 items-center justify-center rounded-full border text-xs font-semibold"
          >
            ?
          </span>
          {tx(txr.juego.quizas, { palabra })}
        </p>
      ) : nota ? (
        <p data-testid="reconocedor-nota">{tx(nota)}</p>
      ) : estado === "escuchando" ? (
        <p data-testid="reconocedor-escuchando" className="opacity-70">
          {tx(txr.juego.escuchando)}
        </p>
      ) : null}
    </div>
  );
}
