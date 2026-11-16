"use client";

// El MARCO que comparten los juegos de voz: la cáscara (paleta del niño, salir, modo calma)
// y las fases que no dependen del juego (pedir micrófono, mic denegado, calibrar, ruido alto).
// Cada juego solo aporta su guion, su escenario y su celebración.
//
// Regla del design-system: la vista del niño es SOBERANA — en cuanto el juego pasa del guion, el
// texto dirigido al padre se retira de la pantalla. ÚNICA excepción (S13, ADR-025): la franja fina del
// apuntador, arriba, en la paleta del adulto, quieta y fuera de la zona de toque del niño.

import Link from "next/link";
import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { useAjustes } from "@/components/estado-local";
import { topeValido } from "@/lib/pantalla/tope";
import { AvisoTope, LineaHoy } from "./aviso-tope";
import { hayLineaHoy, minutosDeHoy, useTopePantalla } from "./use-tope-pantalla";
import {
  IconoMicrofono,
  IconoMicrofonoApagado,
  IconoRuido,
} from "@/components/iconos";
import { useT } from "@/lib/idioma/estado";
import { juegos } from "@/lib/idioma/textos/juegos";
import type { Sesion, Turno } from "@/lib/session-flow";
import { CalibracionStep } from "./calibracion-step";
import {
  HISTORIAL_VACIO,
  type HistorialApuntador,
} from "@/lib/coach/apuntador";
import { FranjaApuntador } from "./franja-apuntador";
import { IndicadorTurno } from "./indicador-turno";
import { Sorpresa } from "./sorpresa";
import type { MedidasVivas } from "./use-voice-session";

type PropsComun = {
  sesion: Sesion;
  /** Identifica el juego en los tests y en los estilos. */
  nombre:
    | "globo"
    | "soplar"
    | "fuerte-suave"
    | "cohete"
    | "palabras"
    | "vocales"
    | "gemelas";
  onAlternarCalma: () => void;
  /** "Salir" dentro del juego: de vuelta al GUION (gate S4) — el hook apaga el micrófono. */
  onSalir: () => void;
  /** El adulto marca el turno con un toque en su franja (S13, ADR-025). */
  onCambiarTurno: (turno: Turno) => void;
  /** El contenido propio del juego (guion, escenario, celebración). */
  children: ReactNode;
};

type Props = Omit<PropsComun, "children"> & {
  medidas: MedidasVivas;
  onReintentarMic: () => void;
  onRecalibrar: () => void;
  onContinuarConRuido: () => void;
  children: ReactNode;
};

/**
 * El marco COMÚN a los siete juegos (S15): la cáscara del niño, salir, el modo calma de un toque, el
 * botón de turno con su apuntador, el tope de pantalla y el indicador. No sabe de micrófono: las
 * palabras gemelas lo montan solas, y `MarcoJuego` le suma las fases del micrófono.
 */
export function MarcoComun({
  sesion,
  nombre,
  onAlternarCalma,
  onSalir,
  onCambiarTurno,
  children,
}: PropsComun) {
  const tx = useT();
  const { actual, ajustes } = sesion;
  const modoCalma = ajustes.modoCalma;

  // Sesiones cortas (S12): mientras se juega corre el contador de hoy; al tope, aviso al adulto y el
  // juego se cierra con calma, igual que «Salir» (que apaga el micrófono y vuelve al guion).
  const ajustesGuardados = useAjustes();
  const topeMinutos = topeValido(ajustesGuardados?.topeMinutos);
  const { avisoMinutos } = useTopePantalla({
    jugando: actual.fase === "esperando-voz" || actual.fase === "jugando",
    topeMinutos,
    alAlcanzar: onSalir,
  });

  // El guion es del padre (paleta operador). El juego es del niño (paleta clara, siempre).
  const esPantallaDelNino = actual.fase !== "guion";

  // La vista del niño es soberana: mientras el juego corre, el texto dirigido al padre se retira
  // de la pantalla (el CSS lo esconde con este atributo).
  useEffect(() => {
    document.documentElement.dataset.enJuego = String(esPantallaDelNino);
    return () => {
      delete document.documentElement.dataset.enJuego;
    };
  }, [esPantallaDelNino]);

  // Lo que el apuntador ya dijo en esta partida (sobrevive a «Otra vez» y a recalibrar: no se repite).
  const historialApuntador = useRef<HistorialApuntador>(HISTORIAL_VACIO);
  const historial = useMemo(
    () => ({
      leer: () => historialApuntador.current,
      escribir: (h: HistorialApuntador) => {
        historialApuntador.current = h;
      },
    }),
    [],
  );
  const enPartida =
    actual.fase === "esperando-voz" ||
    actual.fase === "jugando" ||
    actual.fase === "celebracion";

  return (
    <>
      {enPartida ? (
        <FranjaApuntador
          sesion={sesion}
          historial={historial}
          onCambiarTurno={onCambiarTurno}
          juego={nombre}
        />
      ) : null}
    <div
      className={[
        "flex min-h-[28rem] flex-col gap-6 rounded-3xl p-4 sm:p-6",
        esPantallaDelNino ? "tema-nino" : "",
        esPantallaDelNino && modoCalma ? "tema-nino--calma" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-testid="juego"
      data-juego={nombre}
      data-fase={actual.fase}
      data-calma={modoCalma}
    >
      {esPantallaDelNino ? (
        <div className="flex items-center justify-between gap-3">
          {/* Salir vuelve al GUION, no al selector (gate S4): el padre puede releer su línea sin
              perder la pantalla. El guion tiene su propio "← Juegos" hacia el selector. */}
          <button
            type="button"
            onClick={onSalir}
            className="text-tinta-suave min-h-11 rounded-xl px-3 py-2 text-sm underline-offset-4 hover:underline"
            data-testid="salir-al-guion"
          >
            {tx(juegos.comun.salir)}
          </button>
          {enPartida && actual.fase !== "celebracion" ? (
            <IndicadorTurno turno={sesion.turno} />
          ) : null}
          <button
            type="button"
            onClick={onAlternarCalma}
            aria-pressed={modoCalma}
            className="border-borde text-tinta min-h-11 rounded-full border px-4 text-sm"
            data-testid="modo-calma"
          >
            {modoCalma
              ? tx(juegos.comun.modoCalmaActivado)
              : tx(juegos.comun.modoCalma)}
          </button>
        </div>
      ) : null}

      {actual.fase === "guion" && avisoMinutos !== null ? (
        <AvisoTope minutos={avisoMinutos} />
      ) : null}
      {actual.fase === "guion" &&
      avisoMinutos === null &&
      hayLineaHoy(topeMinutos) ? (
        <LineaHoy minutos={minutosDeHoy()} />
      ) : null}

      {children}
      <Sorpresa juego={nombre} turnosNino={sesion.turnosNino} />
    </div>
    </>
  );
}

export function MarcoJuego({
  medidas,
  onReintentarMic,
  onRecalibrar,
  onContinuarConRuido,
  children,
  ...comun
}: Props) {
  const tx = useT();
  const { actual } = comun.sesion;
  return (
    <MarcoComun {...comun}>
      {actual.fase === "pidiendo-mic" ? (
        <section
          className="mx-auto flex max-w-md flex-col items-center gap-4 text-center"
          data-testid="pidiendo-mic"
        >
          <IconoMicrofono className="text-acento h-16 w-16" />
          <h2 className="font-display text-3xl">{tx(juegos.marco.pidiendoMic.titulo)}</h2>
          <p className="text-tinta-suave">
            {tx(juegos.marco.pidiendoMic.antes)}{" "}
            <strong>{tx(juegos.marco.pidiendoMic.enfasis)}</strong>
          </p>
        </section>
      ) : null}

      {actual.fase === "mic-denegado" ? (
        <section
          className="mx-auto flex max-w-md flex-col items-center gap-4 text-center"
          data-testid="mic-denegado"
        >
          <IconoMicrofonoApagado className="text-tinta-suave h-16 w-16" />
          <h2 className="font-display text-3xl">{tx(juegos.marco.micDenegado.titulo)}</h2>
          <div className="text-tinta-suave space-y-2 text-left text-sm">
            <p>{tx(juegos.marco.micDenegado.intro)}</p>
            <ol className="list-decimal space-y-1 pl-5">
              <li>{tx(juegos.marco.micDenegado.paso1)}</li>
              <li>{tx(juegos.marco.micDenegado.paso2)}</li>
              <li>{tx(juegos.marco.micDenegado.paso3)}</li>
            </ol>
            <p>{tx(juegos.marco.micDenegado.sinMic)}</p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onReintentarMic}
              className="bg-acento text-sobre-acento min-h-14 flex-1 rounded-xl px-6 font-medium"
              data-testid="reintentar-mic"
            >
              {tx(juegos.marco.micDenegado.reintentar)}
            </button>
            <Link
              href="/"
              prefetch={false}
              className="border-borde text-tinta flex min-h-14 flex-1 items-center justify-center rounded-xl border px-6 font-medium"
            >
              {tx(juegos.marco.micDenegado.volverAHoy)}
            </Link>
          </div>
        </section>
      ) : null}

      {actual.fase === "calibrando" ? (
        <CalibracionStep medidas={medidas} />
      ) : null}

      {actual.fase === "ruido-alto" ? (
        <section
          className="mx-auto flex max-w-md flex-col items-center gap-4 text-center"
          data-testid="ruido-alto"
        >
          <IconoRuido className="text-aviso h-16 w-16" />
          <h2 className="font-display text-3xl">{tx(juegos.marco.ruidoAlto.titulo)}</h2>
          <p className="text-tinta-suave">
            {tx(juegos.marco.ruidoAlto.cuerpo)}
          </p>
          <div className="flex w-full flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onRecalibrar}
              className="bg-acento text-sobre-acento min-h-16 flex-1 rounded-2xl px-6 text-lg font-medium"
              data-testid="recalibrar"
            >
              {tx(juegos.marco.ruidoAlto.volverAMedir)}
            </button>
            <button
              type="button"
              onClick={onContinuarConRuido}
              className="border-borde text-tinta min-h-16 flex-1 rounded-2xl border px-6 text-lg font-medium"
              data-testid="continuar-asi"
            >
              {tx(juegos.marco.ruidoAlto.jugarAsi)}
            </button>
          </div>
        </section>
      ) : null}

      {children}
    </MarcoComun>
  );
}
