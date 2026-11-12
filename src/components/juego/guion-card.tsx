"use client";

// La carta del padre ANTES del juego: la app orquesta al adulto, no lo reemplaza.
// Esta pantalla es del padre (paleta operador), no del niño — por eso el guion vive aquí y no
// dentro del juego (regla del design-system: la vista del niño es soberana).

import Link from "next/link";
import { useT } from "@/lib/idioma/estado";
import { juegos } from "@/lib/idioma/textos/juegos";

type Props = {
  /** Etiqueta pequeña de contexto (la técnica del día, o el nombre del juego). */
  etiqueta: string;
  /** La línea que el padre puede decir tal cual. */
  guion: string;
  /** La instrucción de co-uso: cómo dirigir este juego concreto. */
  nota: string;
  onEmpezar: () => void;
  listo: boolean;
};

export function GuionCard({ etiqueta, guion, nota, onEmpezar, listo }: Props) {
  const tx = useT();
  return (
    <section className="mx-auto flex w-full max-w-xl flex-col gap-6">
      {/* La salida estándar del guion (gate S4): el chip con la misma forma que el "← Hoy" de
          las pantallas del padre. Desde dentro del juego, "Salir" trae de vuelta AQUÍ. */}
      <Link
        href="/jugar"
        prefetch={false}
        className="text-tinta-suave border-borde inline-flex min-h-11 items-center gap-2 self-start rounded-xl border px-3 text-sm"
        data-testid="volver-a-juegos"
      >
        {tx(juegos.guion.volverAJuegos)}
      </Link>

      <div className="bg-superficie shadow-tarjeta rounded-2xl p-6">
        <p className="text-tinta-suave font-mono text-[11px] tracking-[0.08em] uppercase">
          {tx(juegos.guion.antesDeJugar)} · {etiqueta}
        </p>

        <h2 className="mt-3 text-xl font-medium">
          {tx(juegos.guion.tuLinea)}
        </h2>

        {/* La voz humana: lo único que el padre necesita leer para dirigir el juego. */}
        <blockquote className="font-display border-acento mt-4 border-l-4 pl-4 text-2xl italic">
          {guion}
        </blockquote>

        <p className="text-tinta-suave mt-5 text-sm">{nota}</p>
      </div>

      <button
        type="button"
        onClick={onEmpezar}
        disabled={!listo}
        className="bg-acento text-sobre-acento min-h-14 rounded-xl px-6 text-lg font-medium disabled:opacity-50"
        data-testid="empezar-juego"
      >
        {tx(juegos.guion.listos)}
      </button>
    </section>
  );
}
