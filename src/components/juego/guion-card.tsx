"use client";

// La carta del padre ANTES del juego: la app orquesta al adulto, no lo reemplaza.
// Esta pantalla es del padre (paleta operador), no del niño.

import type { Capsula } from "@content/schema";
import { NOMBRE_TECNICA } from "@content/schema";

type Props = {
  capsula: Capsula;
  onEmpezar: () => void;
  listo: boolean;
};

export function GuionCard({ capsula, onEmpezar, listo }: Props) {
  return (
    <section className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <div className="bg-superficie shadow-tarjeta rounded-2xl p-6">
        <p className="text-tinta-suave font-mono text-[11px] tracking-[0.08em] uppercase">
          Antes de jugar · {NOMBRE_TECNICA[capsula.tecnica]}
        </p>

        <h2 className="mt-3 text-xl font-medium">Tu línea de hoy</h2>

        {/* La voz humana: lo único que el padre necesita leer para dirigir el juego. */}
        <blockquote className="font-display border-acento mt-4 border-l-4 pl-4 text-2xl italic">
          {capsula.guion}
        </blockquote>

        <p className="text-tinta-suave mt-5 text-sm">
          Muéstrale cómo suena tú primero. Si hoy prefiere solo mirar, también
          está bien.
        </p>
      </div>

      <button
        type="button"
        onClick={onEmpezar}
        disabled={!listo}
        className="bg-acento text-sobre-acento min-h-14 rounded-xl px-6 text-lg font-medium disabled:opacity-50"
        data-testid="empezar-juego"
      >
        Estamos listos
      </button>
    </section>
  );
}
