"use client";

// El aviso del tope diario (S12, ADR-024) — para el ADULTO, en su pantalla (el guion), nunca en la del
// niño. `role="status"`: se anuncia sin interrumpir. Icono + texto (el color nunca va solo); no dice
// «se acabó», no bloquea y deja la decisión al adulto. Se muestra una vez al día; después, el guion solo
// lleva la línea tranquila «hoy ya jugaron N min».

import { IconoReloj } from "@/components/iconos";
import { useT } from "@/lib/idioma/estado";
import { tope } from "@/lib/idioma/textos/voz-juegos";

export function AvisoTope({ minutos }: { minutos: number }) {
  const tx = useT();
  return (
    <div
      role="status"
      className="bg-superficie border-borde text-tinta mx-auto flex w-full max-w-xl items-start gap-3 rounded-2xl border p-4"
      data-testid="aviso-tope"
    >
      <IconoReloj className="text-acento mt-0.5 size-7 shrink-0" />
      <div className="flex flex-col gap-1">
        <p className="font-medium">{tx(tope.aviso.titulo)}</p>
        <p className="text-tinta-suave text-sm">{tx(tope.aviso.cuerpo, { n: minutos })}</p>
      </div>
    </div>
  );
}

/** La línea tranquila del guion cuando el tope ya se alcanzó hoy y el aviso ya se vio. */
export function LineaHoy({ minutos }: { minutos: number }) {
  const tx = useT();
  return (
    <p
      className="text-tinta-suave mx-auto w-full max-w-xl text-center text-sm"
      data-testid="hoy-jugaron"
    >
      {tx(tope.hoy, { n: minutos })}
    </p>
  );
}
