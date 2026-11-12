"use client";

// «Palabra y dibujo» y «gemelas» se juegan con palabras en español (regla dura 7 y 20): en inglés
// no se juegan todavía. Este envoltorio decide con el idioma: en español monta el juego tal cual;
// en inglés muestra una tarjeta honesta y NO monta nada (ni el micrófono se abre).

import Link from "next/link";
import type { ReactNode } from "react";
import { useIdioma, useT } from "@/lib/idioma/estado";
import { juegos } from "@/lib/idioma/textos/juegos";

export function SoloEnEspanol({ children }: { children: ReactNode }) {
  const idioma = useIdioma();
  const tx = useT();

  if (idioma !== "en") return <>{children}</>;

  return (
    <section
      className="bg-superficie shadow-tarjeta mx-auto flex w-full max-w-xl flex-col items-start gap-4 rounded-2xl p-6"
      data-testid="solo-en-espanol"
    >
      <Link
        href="/jugar"
        prefetch={false}
        className="text-tinta-suave border-borde inline-flex min-h-11 items-center gap-2 rounded-xl border px-3 text-sm"
        data-testid="volver-a-juegos"
      >
        {tx(juegos.soloEspanol.volver)}
      </Link>
      <h1 className="font-display text-3xl">{tx(juegos.soloEspanol.titulo)}</h1>
      <p className="text-tinta-suave">{tx(juegos.soloEspanol.mensaje)}</p>
    </section>
  );
}
