"use client";

// El modo calma de un toque, también en Hoy (S15, regla dura 6): el adulto lo prende ANTES de abrir un
// juego, sin ir a Ajustes. Es el mismo ajuste que ve Ajustes y que lleva el marco de los juegos
// (`useModoCalma`). El estado va con símbolo + texto + borde, nunca solo por color.

import { IconoHecho, IconoPorHacer } from "@/components/iconos";
import { useModoCalma } from "@/components/juego/use-modo-calma";
import { useT } from "@/lib/idioma/estado";
import { juegos } from "@/lib/idioma/textos/juegos";

export function CalmaHoy() {
  const tx = useT();
  const { activo, alternar } = useModoCalma();
  const Icono = activo ? IconoHecho : IconoPorHacer;
  return (
    <button
      type="button"
      onClick={alternar}
      aria-pressed={activo}
      data-testid="modo-calma-hoy"
      className={[
        "text-tinta bg-superficie flex min-h-11 items-center justify-center gap-2 self-start rounded-full border-2 px-4 text-sm",
        activo ? "border-acento" : "border-borde",
      ].join(" ")}
    >
      <Icono className="h-5 w-5" />
      {activo ? tx(juegos.comun.modoCalmaActivado) : tx(juegos.comun.modoCalma)}
    </button>
  );
}
