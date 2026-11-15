"use client";

// La tarjeta del ADULTO que recuerda pedir los cuentos del mes (S14, ADR-026, decisión «1a»): una tarjeta
// quieta en Hoy con un botón. Sin notificaciones, sin permisos y sin sonido; jamás se le muestra al niño
// como alarma (Hoy es la pantalla del adulto). «Ahora no» la esconde 7 días y el interruptor de Ajustes la apaga. La regla vive en
// lib/bandeja/recordatorio (pura); la fecha se lee una vez por montaje (regla 23: es una perilla).

import Link from "next/link";
import { useState } from "react";
import {
  ajustesActuales,
  guardarAjustesEnStore,
  useAjustes,
  useCuentos,
} from "@/components/estado-local";
import { IconoCita } from "@/components/iconos";
import { recordatorioCuentos } from "@/lib/bandeja/recordatorio";
import { fechaHoy } from "@/lib/fecha";
import { useT } from "@/lib/idioma/estado";
import { suMundo } from "@/lib/idioma/textos/su-mundo";

export function RecordatorioCuentos() {
  const tx = useT();
  const cuentos = useCuentos();
  const ajustes = useAjustes();
  const [hoy] = useState(fechaHoy);
  if (!cuentos || !ajustes) return null;
  const r = recordatorioCuentos(hoy, cuentos, ajustes.recordatorioPospuesto, ajustes.recordatorioCuentos);
  if (!r) return null;
  const t = suMundo.recordatorio;

  return (
    <section
      className="bg-superficie shadow-tarjeta flex flex-col gap-3 rounded-xl px-4 py-4"
      data-testid="recordatorio-cuentos"
      data-motivo={r.motivo}
      aria-labelledby="recordatorio-cuentos-titulo"
    >
      <h2
        id="recordatorio-cuentos-titulo"
        className="flex items-center gap-2 font-medium"
      >
        <IconoCita className="text-acento h-4 w-4 shrink-0" />
        {tx(t.titulo)}
      </h2>
      <p className="text-tinta-suave text-sm">
        {r.motivo === "nunca"
          ? tx(t.nunca)
          : tx(t.vencido, { dias: r.dias })}
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/cuentos"
          prefetch={false}
          className="bg-acento text-sobre-acento flex min-h-11 items-center rounded-xl px-4 text-sm font-medium"
          data-testid="recordatorio-pedir"
        >
          {tx(t.pedir)}
        </Link>
        <button
          type="button"
          onClick={() =>
            guardarAjustesEnStore({
              ...ajustesActuales(),
              recordatorioPospuesto: hoy,
            })
          }
          className="border-borde text-tinta min-h-11 rounded-xl border px-4 text-sm font-medium"
          data-testid="recordatorio-ahora-no"
        >
          {tx(t.ahoraNo)}
        </button>
      </div>
    </section>
  );
}
