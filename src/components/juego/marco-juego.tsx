"use client";

// El MARCO que comparten los tres juegos de voz: la cáscara (paleta del niño, salir, modo calma)
// y las fases que no dependen del juego (pedir micrófono, mic denegado, calibrar, ruido alto).
// Cada juego solo aporta su guion, su escenario y su celebración.
//
// Regla del design-system: la vista del niño es SOBERANA — en cuanto el juego pasa del guion, el
// texto dirigido al padre se retira de la pantalla.

import Link from "next/link";
import { useEffect, type ReactNode } from "react";
import {
  IconoMicrofono,
  IconoMicrofonoApagado,
  IconoRuido,
} from "@/components/iconos";
import type { Sesion } from "@/lib/session-flow";
import { CalibracionStep } from "./calibracion-step";
import type { MedidasVivas } from "./use-voice-session";

type Props = {
  sesion: Sesion;
  medidas: MedidasVivas;
  /** Identifica el juego en los tests y en los estilos. */
  nombre: "globo" | "cohete" | "palabras";
  onAlternarCalma: () => void;
  onReintentarMic: () => void;
  onRecalibrar: () => void;
  onContinuarConRuido: () => void;
  /** "Salir" dentro del juego: de vuelta al GUION (gate S4) — el hook apaga el micrófono. */
  onSalir: () => void;
  /** El contenido propio del juego (guion, escenario, celebración). */
  children: ReactNode;
};

export function MarcoJuego({
  sesion,
  medidas,
  nombre,
  onAlternarCalma,
  onReintentarMic,
  onRecalibrar,
  onContinuarConRuido,
  onSalir,
  children,
}: Props) {
  const { actual, ajustes } = sesion;
  const modoCalma = ajustes.modoCalma;

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

  return (
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
            Salir
          </button>
          <button
            type="button"
            onClick={onAlternarCalma}
            aria-pressed={modoCalma}
            className="border-borde text-tinta min-h-11 rounded-full border px-4 text-sm"
            data-testid="modo-calma"
          >
            {modoCalma ? "Modo calma activado" : "Modo calma"}
          </button>
        </div>
      ) : null}

      {actual.fase === "pidiendo-mic" ? (
        <section
          className="mx-auto flex max-w-md flex-col items-center gap-4 text-center"
          data-testid="pidiendo-mic"
        >
          <IconoMicrofono className="text-acento h-16 w-16" />
          <h2 className="font-display text-3xl">Necesito escuchar su voz</h2>
          <p className="text-tinta-suave">
            El navegador va a preguntar si puede usar el micrófono. El sonido se
            analiza aquí mismo, en este dispositivo, para saber si hay voz y
            cómo suena.{" "}
            <strong>
              No se graba nada, no se guarda nada y nada sale de aquí.
            </strong>
          </p>
        </section>
      ) : null}

      {actual.fase === "mic-denegado" ? (
        <section
          className="mx-auto flex max-w-md flex-col items-center gap-4 text-center"
          data-testid="mic-denegado"
        >
          <IconoMicrofonoApagado className="text-tinta-suave h-16 w-16" />
          <h2 className="font-display text-3xl">No pude abrir el micrófono</h2>
          <div className="text-tinta-suave space-y-2 text-left text-sm">
            <p>
              Sin micrófono, este juego no puede escuchar su voz. Para
              habilitarlo:
            </p>
            <ol className="list-decimal space-y-1 pl-5">
              <li>
                Toca el candado (o el ícono de la izquierda) en la barra de
                direcciones.
              </li>
              <li>Busca “Micrófono” y elige “Permitir”.</li>
              <li>Vuelve aquí y toca “Intentar de nuevo”.</li>
            </ol>
            <p>
              Si prefieres no dar el micrófono, no pasa nada: la actividad de
              hoy también se puede hacer sin pantalla.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onReintentarMic}
              className="bg-acento text-sobre-acento min-h-14 flex-1 rounded-xl px-6 font-medium"
              data-testid="reintentar-mic"
            >
              Intentar de nuevo
            </button>
            <Link
              href="/"
              prefetch={false}
              className="border-borde text-tinta flex min-h-14 flex-1 items-center justify-center rounded-xl border px-6 font-medium"
            >
              Volver a Hoy
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
          <h2 className="font-display text-3xl">Hay bastante ruido por ahí</h2>
          <p className="text-tinta-suave">
            Con este ruido de fondo me cuesta distinguir su voz. Si pueden,
            apaguen la tele o acérquense un poco al dispositivo. Igual podemos
            jugar así: solo tendrá que hablar más fuerte.
          </p>
          <div className="flex w-full flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onRecalibrar}
              className="bg-acento text-sobre-acento min-h-16 flex-1 rounded-2xl px-6 text-lg font-medium"
              data-testid="recalibrar"
            >
              Volver a medir
            </button>
            <button
              type="button"
              onClick={onContinuarConRuido}
              className="border-borde text-tinta min-h-16 flex-1 rounded-2xl border px-6 text-lg font-medium"
              data-testid="continuar-asi"
            >
              Jugar así
            </button>
          </div>
        </section>
      ) : null}

      {children}
    </div>
  );
}
