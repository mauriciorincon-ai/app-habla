"use client";

// EL MAPA DE LAS VOCALES (S10, ADR-021) — EXPERIMENTAL. Cinco zonas (letra + dibujo + color); al
// estirar una vocal, la zona que SE PARECE se enciende. Es exploración vocal: no exige palabras
// (ADR 005), no tiene meta ni tiempo (el padre cierra con «Ya jugamos») y no juzga: dice «quizás
// suena como», con el margen de error a la vista (regla dura 3). Lo único que cuenta son zonas que
// de verdad sonaron estables y cambios de una a otra. F1/F2 mueren en un ref (regla dura 2).

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import {
  useAjustes,
} from "@/components/estado-local";
import { useHidratado } from "@/components/use-hidratado";
import { useIdioma, useT } from "@/lib/idioma/estado";
import { idConsigna, textoConsigna } from "@/lib/banco-voz/catalogo";
import { AltavozConsigna } from "./altavoz-consigna";
import { useVozFamiliar } from "./use-voz-familiar";
import { useModoCalma } from "./use-modo-calma";
import { juegos } from "@/lib/idioma/textos/juegos";
import { vocales as textos } from "@/lib/idioma/textos/vocales";
import type { Metrica } from "@/lib/session-flow";
import { VOCALES, type Vocal } from "@/lib/voice/vocales";
import { CelebracionHonesta } from "./celebracion-honesta";
import { FormaVocal } from "./forma-vocal";
import { GuionCard } from "./guion-card";
import { MarcoJuego } from "./marco-juego";
import { Protagonista } from "./protagonista";
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
    cambiarTurno,
    cambiarCalma,
    silenciar,
  } = useVoiceSession({
    modoCalmaInicial,
    tipoMetrica: "vocales",
    meta: null,
    metricaActual,
  });

  // La consigna puede sonar en la voz de la familia; la guarda del bucle pausa el medidor (ADR-010).
  const voz = useVozFamiliar({ alSonar: silenciar });
  const idioma = useIdioma();
  const { actual, ajustes } = sesion;
  const modoCalma = ajustes.modoCalma;
  const jugando = actual.fase === "esperando-voz" || actual.fase === "jugando";
  // Este componente re-renderiza con cada TICK (~10/s): leer los lectores aquí es seguro.
  const ahora: Vocal | null = jugando ? medidas.vocalActual() : null;
  const zonas = jugando ? medidas.vocalesZonas() : 0;
  const cambios = jugando ? medidas.vocalesCambios() : 0;

  const { alternar: alternarCalma } = useModoCalma(cambiarCalma);

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
      onCambiarTurno={cambiarTurno}
    >
      {actual.fase === "guion" ? (
        <GuionCard
          etiqueta={tx(textos.etiqueta)}
          guion={tx(textos.guion)}
          nota={tx(textos.nota)}
          onEmpezar={empezar}
          listo
          porTurnos
          juego="vocales"
        />
      ) : null}

      {jugando ? (
        <section className="flex flex-col gap-5">
          <div className="flex items-center justify-center gap-3">
            <Protagonista juego="vocales" className="size-12 shrink-0 sm:size-14" />
            <h2 className="font-display text-center text-3xl sm:text-4xl">
              {tx(ahora ? textos.escuchando : textos.invitacion)}
            </h2>
          </div>
          <div className="flex items-center justify-center gap-3">
            <p className="text-tinta-suave text-center text-sm" data-testid="consigna-vocales">
              {textoConsigna("vocales", idioma)}
            </p>
            <AltavozConsigna
              voz={voz}
              id={idConsigna("vocales", idioma)}
              etiqueta={textoConsigna("vocales", idioma)}
            />
          </div>

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
          turnosNino={sesion.turnosNino}
          onOtraVez={otraVez}
          onTerminar={() => router.push("/jugar")}
          etiquetaTerminar={tx(juegos.comun.elegirOtroJuego)}
        />
      ) : null}
    </MarcoJuego>
  );
}
