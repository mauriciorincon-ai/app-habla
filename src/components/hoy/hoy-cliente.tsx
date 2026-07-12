"use client";

// La estrella ⭐⭐⭐: la respuesta de HOY a "¿y hoy qué puedo hacer por mi hijo?".
// Una técnica con evidencia, explicada en 30 segundos, con el guion y la actividad de hoy.
// Sin rachas que castiguen: el historial acompaña, no vigila.

import Link from "next/link";
import { useEffect } from "react";
import { NOMBRE_TECNICA } from "@content/schema";
import { Globo, IconoHecho } from "@/components/iconos";
import {
  asegurarAsignacionDeHoy,
  capsulaDeHoy,
  marcarCapsulaHecha,
  usePerfil,
  useProgreso,
} from "@/components/estado-local";
import { useHidratado } from "@/components/use-hidratado";
import { Onboarding } from "./onboarding";

export function HoyCliente() {
  const hidratado = useHidratado();
  const progreso = useProgreso();
  const perfil = usePerfil();

  useEffect(() => {
    asegurarAsignacionDeHoy();
  }, []);

  // Altura reservada: el contenido llega tras hidratar, pero el layout no salta (CLS).
  if (!hidratado || !progreso) {
    return <div className="min-h-[22rem]" aria-hidden="true" />;
  }

  if (!perfil) {
    return (
      <div className="min-h-[22rem]">
        <Onboarding />
      </div>
    );
  }

  const { capsula, completada, fecha } = capsulaDeHoy(progreso);
  const diasAcompañados = progreso.historial.length;

  return (
    <div className="flex min-h-[22rem] flex-col gap-6">
      <article
        className="bg-superficie shadow-tarjeta rounded-2xl p-6"
        data-testid="capsula"
        data-completada={completada}
      >
        <p className="text-tinta-suave font-mono text-[11px] tracking-[0.08em] uppercase">
          Hoy practicamos · {NOMBRE_TECNICA[capsula.tecnica]}
        </p>

        <h2 className="mt-3 text-2xl font-medium" data-testid="capsula-titulo">
          {capsula.titulo}
        </h2>

        <p className="mt-4 leading-relaxed">{capsula.explicacion}</p>

        <div className="border-acento bg-acento-suave/40 mt-6 rounded-xl border-l-4 p-4">
          <p className="text-tinta-suave font-mono text-[11px] tracking-[0.08em] uppercase">
            Tu línea de hoy
          </p>
          <p
            className="font-display mt-2 text-xl italic"
            data-testid="capsula-guion"
          >
            {capsula.guion}
          </p>
        </div>

        <div className="mt-6">
          <p className="text-tinta-suave font-mono text-[11px] tracking-[0.08em] uppercase">
            La actividad de hoy
          </p>
          <p className="mt-2">{capsula.actividad.texto}</p>
        </div>

        <details className="mt-6">
          <summary className="text-tinta-suave cursor-pointer text-sm">
            ¿De dónde sale esto?
          </summary>
          <p className="text-tinta-suave mt-2 text-sm">{capsula.fuente}</p>
        </details>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          {capsula.actividad.conPantalla ? (
            <Link
              href="/jugar"
              className="bg-acento text-sobre-acento flex min-h-12 flex-1 items-center justify-center rounded-xl px-6 font-medium"
              data-testid="ir-a-jugar"
            >
              Jugar ahora, juntos
            </Link>
          ) : null}

          {completada ? (
            <p
              className="text-exito flex min-h-12 flex-1 items-center justify-center gap-2 text-sm font-medium"
              data-testid="capsula-completada"
            >
              <IconoHecho className="h-5 w-5 shrink-0" /> Hecho hoy. Mañana hay
              otra.
            </p>
          ) : (
            <button
              type="button"
              onClick={() => marcarCapsulaHecha(fecha, capsula.id)}
              className="border-borde text-tinta min-h-12 flex-1 rounded-xl border px-6 font-medium"
              data-testid="marcar-hecha"
            >
              Ya lo hicimos
            </button>
          )}
        </div>
      </article>

      {/* El juego SIEMPRE está a un toque, sea cual sea la cápsula del día. Hallazgo del primer
          uso real (2026-07-12): la entrada al juego solo existía los días de actividad con
          pantalla — el resto de días era invisible. La predictibilidad importa (COGA): la misma
          puerta, en el mismo lugar, todos los días. */}
      <Link
        href="/jugar"
        className="bg-superficie shadow-tarjeta flex min-h-16 items-center justify-between gap-4 rounded-2xl p-5"
        data-testid="ir-al-juego"
      >
        <span>
          <span className="block font-medium">El juego de voz</span>
          <span className="text-tinta-suave block text-sm">
            Su voz mueve el globo. Para jugar juntos — hoy o cualquier día.
          </span>
        </span>
        <Globo className="h-14 w-9 shrink-0" />
      </Link>

      {diasAcompañados > 0 ? (
        <p
          className="text-tinta-suave text-center text-sm"
          data-testid="historial"
        >
          Han practicado juntos{" "}
          <span className="font-mono">
            {diasAcompañados} {diasAcompañados === 1 ? "día" : "días"}
          </span>
          . Sin prisa: lo que cuenta es volver, no la racha.
        </p>
      ) : null}
    </div>
  );
}
