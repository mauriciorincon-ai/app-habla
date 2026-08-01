"use client";

// La estrella ⭐⭐⭐: la respuesta de HOY a "¿y hoy qué puedo hacer por mi hijo?".
// Una técnica con evidencia, explicada en 30 segundos, con el guion y la actividad de hoy.
// Sin rachas que castiguen: el historial acompaña, no vigila.

import Link from "next/link";
import { useEffect } from "react";
import { NOMBRE_ETAPA, NOMBRE_TECNICA } from "@content/schema";
import {
  Cohete,
  Globo,
  IconoBurbuja,
  IconoCita,
  IconoDiana,
  IconoGemelas,
  IconoHecho,
  IconoJuntos,
  IconoPictograma,
  IconoPorHacer,
} from "@/components/iconos";
import {
  useAjustes,
  useObjetivo,
  usePerfil,
  useProgreso,
} from "@/components/estado-local";
import {
  asegurarAsignacionDeHoy,
  capsulaDeHoy,
  marcarCapsulaHecha,
} from "@/components/estado-capsulas";
import { useHidratado } from "@/components/use-hidratado";
import { Onboarding } from "./onboarding";

export function HoyCliente() {
  const hidratado = useHidratado();
  const progreso = useProgreso();
  const perfil = usePerfil();
  const ajustes = useAjustes();
  const objetivo = useObjetivo();
  const etapa = ajustes?.etapa;

  // Corre también cuando el padre cambia de etapa en Ajustes (la cápsula de hoy se re-hace).
  useEffect(() => {
    asegurarAsignacionDeHoy();
  }, [etapa]);

  // Altura reservada: el contenido llega tras hidratar, pero el layout no salta (CLS).
  if (!hidratado || !progreso || !ajustes) {
    return <div className="min-h-[22rem]" aria-hidden="true" />;
  }

  if (!perfil) {
    return (
      <div className="min-h-[22rem]">
        <Onboarding />
      </div>
    );
  }

  const { capsula, completada, fecha } = capsulaDeHoy(progreso, ajustes.etapa);
  const diasAcompañados = progreso.historial.length;

  return (
    <div className="flex min-h-[22rem] flex-col gap-6">
      {objetivo ? (
        <Link
          href="/objetivo"
          className="text-tinta-suave bg-superficie shadow-tarjeta flex items-center gap-2 rounded-xl px-4 py-3 text-sm"
          data-testid="objetivo-activo-hoy"
        >
          <IconoDiana className="text-acento h-4 w-4 shrink-0" />
          <span>
            Objetivo de la semana:{" "}
            <strong className="text-tinta">«{objetivo.texto}»</strong>
          </span>
        </Link>
      ) : null}
      <article
        className="bg-superficie shadow-tarjeta rounded-2xl p-6"
        data-testid="capsula"
        data-completada={completada}
      >
        {/* Nombra cada cosa por lo que es (gate S4): antes iba "Hoy practicamos · X · Y" y el
            padre no sabía cuál de los dos era la técnica y cuál la etapa. */}
        <p
          className="text-tinta-suave font-mono text-[11px] tracking-[0.08em] uppercase"
          data-testid="etiqueta-capsula"
        >
          Técnica: {NOMBRE_TECNICA[capsula.tecnica]} · Etapa:{" "}
          <span data-testid="etiqueta-etapa">
            {NOMBRE_ETAPA[capsula.etapa]}
          </span>
        </p>

        <h2 className="mt-3 text-2xl font-medium" data-testid="capsula-titulo">
          {capsula.titulo}
        </h2>

        <p className="mt-4 leading-relaxed">{capsula.explicacion}</p>

        {/* El guion y la actividad son las DOS cosas que el padre va a hacer hoy: se ven como
            pareja (misma caja, mismo peso, cada una con su icono). Antes la actividad era texto
            suelto al pie y se leía como una introducción — hallazgo del gate S4. */}
        {/* El icono va al tamaño de los del juego (32 px) y abarca el bloque entero, no la
            etiquetita: a 16 px junto a un rótulo mono de 11 px no se leía como señal (gate S4). */}
        <div className="border-acento bg-acento-suave/40 mt-6 flex gap-3 rounded-xl border-l-4 p-4">
          <IconoBurbuja className="text-acento mt-0.5 h-8 w-8 shrink-0" />
          <div>
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
        </div>

        <div className="border-acento bg-acento-suave/40 mt-4 flex gap-3 rounded-xl border-l-4 p-4">
          <IconoJuntos className="text-acento mt-0.5 h-8 w-8 shrink-0" />
          <div>
            <p className="text-tinta-suave font-mono text-[11px] tracking-[0.08em] uppercase">
              La actividad de hoy
            </p>
            <p className="mt-2 text-lg leading-relaxed">
              {capsula.actividad.texto}
            </p>
          </div>
        </div>

        <details className="mt-6">
          <summary className="text-tinta-suave flex cursor-pointer items-center gap-2 text-sm">
            <IconoCita className="h-4 w-4 shrink-0" />
            ¿De dónde sale esto?
          </summary>
          <p className="text-tinta-suave mt-2 text-sm italic">
            {capsula.fuente}
          </p>
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
              onClick={() =>
                marcarCapsulaHecha(fecha, capsula.id, capsula.etapa)
              }
              className="border-borde text-tinta flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border px-6 font-medium"
              data-testid="marcar-hecha"
            >
              <IconoPorHacer className="text-tinta-suave h-5 w-5 shrink-0" />
              Ya lo hicimos
            </button>
          )}
        </div>

        {/* El contador vive DENTRO de la tarjeta, pegado al estado del día (gate S4): al pie de
            la página se leía como una nota al margen. La cifra va en sans tabular, no en mono:
            una cifra dentro de una frase se lee mal monoespaciada (design-system). */}
        {diasAcompañados > 0 ? (
          <p
            className="text-tinta-suave border-borde mt-5 border-t pt-4 text-sm"
            data-testid="historial"
          >
            Han practicado juntos{" "}
            <span className="text-acento font-sans text-2xl font-semibold tabular-nums">
              {diasAcompañados}
            </span>{" "}
            {diasAcompañados === 1 ? "día" : "días"}. Sin prisa: lo que cuenta
            es volver, no la racha.
          </p>
        ) : null}
      </article>

      {/* El juego SIEMPRE está a un toque, sea cual sea la cápsula del día. Hallazgo del primer
          uso real (2026-07-12): la entrada al juego solo existía los días de actividad con
          pantalla — el resto de días era invisible. La predictibilidad importa (COGA): la misma
          puerta, en el mismo lugar, todos los días. */}
      <Link
        href="/jugar"
        className="bg-superficie shadow-tarjeta flex min-h-16 items-center gap-4 rounded-2xl p-5"
        data-testid="ir-al-juego"
      >
        {/* Los CUATRO juegos, y a la IZQUIERDA: los iconos acompañan al texto por delante en
            toda la app (regla del design system, gate S4). Las gemelas llegaron en el S3 y esta
            tarjeta seguía anunciando tres. */}
        <span className="flex shrink-0 items-center gap-1">
          <Globo className="h-12 w-8" />
          <Cohete className="h-12 w-8" />
          <IconoPictograma className="text-acento h-8 w-8" />
          <IconoGemelas className="text-acento h-8 w-9" />
        </span>
        <span>
          <span className="block font-medium">Los juegos de voz</span>
          <span className="text-tinta-suave block text-sm">
            El globo, el cohete, los dibujos y las gemelas. Para jugar juntos —
            hoy o cualquier día.
          </span>
        </span>
      </Link>
    </div>
  );
}
