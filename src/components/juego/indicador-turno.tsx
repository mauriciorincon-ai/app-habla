"use client";

// El indicador de turno (S13, ADR-025): lo ve el niño y se entiende SIN LEER — una figura distinta por
// turno (redonda con ondas = suena tu voz; cuadro dentro de un ojo = mira y escucha), una palabra corta
// y su nombre accesible. El color nunca va solo. Quieto: no parpadea ni se anima.

import { IconoSuTurno, IconoTurnoDelAdulto } from "@/components/iconos";
import { useT } from "@/lib/idioma/estado";
import { apuntador } from "@/lib/idioma/textos/apuntador";
import type { Turno } from "@/lib/session-flow";

export function IndicadorTurno({ turno }: { turno: Turno }) {
  const tx = useT();
  const suyo = turno === "nino";
  const Icono = suyo ? IconoSuTurno : IconoTurnoDelAdulto;
  return (
    <div
      role="img"
      aria-label={tx(
        suyo
          ? apuntador.indicador.etiquetaSuTurno
          : apuntador.indicador.etiquetaTurnoDelAdulto,
      )}
      data-testid="indicador-turno"
      data-turno={turno}
      className={[
        "text-tinta flex min-h-11 items-center gap-2 border-2 px-3 text-base font-medium",
        suyo ? "bg-acento-suave rounded-full" : "bg-superficie rounded-lg",
        suyo ? "border-acento" : "border-borde",
      ].join(" ")}
    >
      <Icono className="h-7 w-7" />
      <span aria-hidden="true">
        {tx(
          suyo
            ? apuntador.indicador.suTurno
            : apuntador.indicador.turnoDelAdulto,
        )}
      </span>
    </div>
  );
}
