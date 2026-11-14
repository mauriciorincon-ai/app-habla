"use client";

// EL MAPA DE LAS VOCALES (S10, ADR-021) — EXPERIMENTAL. Cinco zonas (letra + dibujo + color); al
// estirar una vocal, la zona que SE PARECE se enciende. Es exploración vocal: no exige palabras
// (ADR 005), no tiene meta ni tiempo (el padre cierra con «Ya jugamos») y no juzga: dice «quizás
// suena como», con el margen de error a la vista (regla dura 3). Lo único que cuenta son zonas que
// de verdad sonaron estables y cambios de una a otra. F1/F2 mueren en un ref (regla dura 2).

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import {
  ajustesActuales,
  guardarAjustesEnStore,
  useAjustes,
} from "@/components/estado-local";
import { useHidratado } from "@/components/use-hidratado";
import { useT } from "@/lib/idioma/estado";
import { juegos } from "@/lib/idioma/textos/juegos";
import { vocales as textos } from "@/lib/idioma/textos/vocales";
import type { Metrica } from "@/lib/session-flow";
import { VOCALES, type Vocal } from "@/lib/voice/vocales";
import { CelebracionHonesta } from "./celebracion-honesta";
import { FormaVocal } from "./forma-vocal";
import { GuionCard } from "./guion-card";
import { MarcoJuego } from "./marco-juego";
import { useVoiceSession, type MedidasVivas } from "./use-voice-session";

export function MapaVocales() {
  const hidratado = useHidratado();
  const ajustes = useAjustes();

  if (!hidratado || !ajustes) {
    return <div className="min-h-[28rem]" aria-hidden="true" />;
  }
  return <JuegoListo modoCalmaInicial={ajustes.modoCalma} />;
}

function JuegoListo({ modoCalmaInicial }: { modoCalmaInicial: boolean }) {
  const router = useRouter();
  const tx = useT();

  const metricaActual = useCallback(
    (medidas: MedidasVivas): Metrica => ({
      tipo: "vocales",
      zonas: medidas.vocalesZonas(),
      cambios: medidas.vocalesCambios(),
    }),
    [],
  );

  const {
    sesion,
    medidas,
    empezar,
    reintentarMic,
    recalibrar,
    continuarConRuido,
    terminar,
    otraVez,
    volverAlGuion,
    cambiarCalma,
  } = useVoiceSession({
    modoCalmaInicial,
    tipoMetrica: "vocales",
    meta: null,
    metricaActual,
  });

  const { actual, ajustes } = sesion;
  const modoCalma = ajustes.modoCalma;
  const jugando = actual.fase === "esperando-voz" || actual.fase === "jugando";
  // Este componente re-renderiza con cada TICK (~10/s): leer los lectores aquí es seguro.
  const ahora: Vocal | null = jugando ? medidas.vocalActual() : null;
  const zonas = jugando ? medidas.vocalesZonas() : 0;
  const cambios = jugando ? medidas.vocalesCambios() : 0;

  function alternarCalma() {
    const activo = !modoCalma;
    cambiarCalma(activo);
    guardarAjustesEnStore({ ...ajustesActuales(), modoCalma: activo });
  }

  const sonido = (v: Vocal) => tx(textos.sonido[v]);

  return (
    <MarcoJuego
      sesion={sesion}
      medidas={medidas}
      nombre="vocales"
      onAlternarCalma={alternarCalma}
      onReintentarMic={reintentarMic}
      onRecalibrar={recalibrar}
      onContinuarConRuido={continuarConRuido}
      onSalir={volverAlGuion}
    >
      {actual.fase === "guion" ? (
        <GuionCard
          etiqueta={tx(textos.etiqueta)}
          guion={tx(textos.guion)}
          nota={tx(textos.nota)}
          onEmpezar={empezar}
          listo
        />
      ) : null}

      {jugando ? (
        <section className="flex flex-col gap-5">
          <h2 className="font-display text-center text-3xl sm:text-4xl">
            {tx(ahora ? textos.escuchando : textos.invitacion)}
          </h2>

          {/* Las cinco zonas: letra + dibujo + color; la que suena queda grande y con su nombre. */}
          <ul
            className="grid grid-cols-5 items-end gap-2 sm:gap-4"
            aria-label={tx(textos.mapaEtiqueta)}
            data-testid="mapa-vocales"
          >
            {VOCALES.map((v) => (
              <li
                key={v}
                className="flex flex-col items-center gap-2 text-center"
                data-testid={`zona-${v}`}
                data-encendida={ahora === v}
              >
                <FormaVocal
                  vocal={v}
                  letra={sonido(v).toUpperCase()}
                  className="size-14 sm:size-20"
                  encendida={ahora === v}
                />
                <span className="text-tinta-suave text-xs sm:text-sm">
                  {tx(textos.forma[v])}
                </span>
                <span
                  className={`text-xs font-medium sm:text-sm ${ahora === v ? "" : "invisible"}`}
                >
                  {tx(textos.encendida)}
                </span>
              </li>
            ))}
          </ul>

          <p
            className="min-h-7 text-center text-lg font-medium"
            data-testid="vocal-actual"
            aria-live="polite"
          >
            {ahora && !modoCalma
              ? `${tx(textos.quizas)} ${sonido(ahora).toUpperCase()}`
              : ""}
          </p>

          {!modoCalma && (zonas > 0 || cambios > 0) ? (
            <p
              className="text-tinta-suave text-center text-sm"
              data-testid="vocales-conteo"
            >
              {tx(textos.vistas)}{" "}
              <span className="font-semibold tabular-nums">{zonas}/5</span>
              {" · "}
              {tx(textos.cambios)}{" "}
              <span className="font-semibold tabular-nums">
                {tx(cambios === 1 ? textos.vez : textos.veces, { n: cambios })}
              </span>
            </p>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={terminar}
              className="bg-acento text-sobre-acento min-h-16 flex-1 rounded-2xl px-6 text-lg font-medium"
              data-testid="terminar"
            >
              {tx(juegos.comun.yaJugamos)}
            </button>
            <button
              type="button"
              onClick={recalibrar}
              className="border-borde text-tinta min-h-16 rounded-2xl border px-6 text-lg font-medium"
              data-testid="recalibrar"
            >
              {tx(juegos.comun.volverAMedir)}
            </button>
          </div>
        </section>
      ) : null}

      {actual.fase === "celebracion" ? (
        <CelebracionHonesta
          metrica={actual.metrica}
          onOtraVez={otraVez}
          onTerminar={() => router.push("/jugar")}
          etiquetaTerminar={tx(juegos.comun.elegirOtroJuego)}
        />
      ) : null}
    </MarcoJuego>
  );
}
