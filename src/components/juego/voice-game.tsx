"use client";

// El juego de voz completo: guion del padre → permiso → calibración → jugar → celebración.
// Co-uso siempre: no existe "modo niño solo". El padre dirige; la pantalla es utilería.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { Capsula } from "@content/schema";
import { invitacionAmable, muestraMedidor } from "@/lib/session-flow";
import {
  ajustesActuales,
  asegurarAsignacionDeHoy,
  capsulaDeHoy,
  guardarAjustesEnStore,
  marcarCapsulaHecha,
  useAjustes,
  useProgreso,
} from "@/components/estado-local";
import { useHidratado } from "@/components/use-hidratado";
import { CalibracionStep } from "./calibracion-step";
import { CelebracionHonesta } from "./celebracion-honesta";
import { Escenario } from "./escenario";
import { GuionCard } from "./guion-card";
import { useVoiceSession } from "./use-voice-session";

export function VoiceGame() {
  const hidratado = useHidratado();
  const progreso = useProgreso();
  const ajustes = useAjustes();

  useEffect(() => {
    asegurarAsignacionDeHoy();
  }, []);

  if (!hidratado || !progreso || !ajustes) {
    // Esqueleto con la misma altura: sin salto de layout al hidratar.
    return <div className="min-h-[28rem]" aria-hidden="true" />;
  }

  const { capsula, fecha } = capsulaDeHoy(progreso);
  return (
    <JuegoListo
      capsula={capsula}
      fecha={fecha}
      modoCalmaInicial={ajustes.modoCalma}
    />
  );
}

function JuegoListo({
  capsula,
  fecha,
  modoCalmaInicial,
}: {
  capsula: Capsula;
  fecha: string;
  modoCalmaInicial: boolean;
}) {
  const router = useRouter();
  const {
    sesion,
    medidas,
    empezar,
    reintentarMic,
    recalibrar,
    continuarConRuido,
    terminar,
    otraVez,
    cambiarCalma,
  } = useVoiceSession(modoCalmaInicial);

  const { actual, ajustes } = sesion;
  const modoCalma = ajustes.modoCalma;

  function alternarCalma() {
    const activo = !modoCalma;
    cambiarCalma(activo);
    // El modo calma es un ajuste del niño: se recuerda para la próxima sesión.
    guardarAjustesEnStore({ ...ajustesActuales(), modoCalma: activo });
  }

  function terminarYMarcar() {
    marcarCapsulaHecha(fecha, capsula.id);
    router.push("/");
  }

  // El guion es del padre (paleta operador). El juego es del niño (paleta clara, siempre).
  const esPantallaDelNino = actual.fase !== "guion";

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
      data-fase={actual.fase}
      data-calma={modoCalma}
    >
      {esPantallaDelNino ? (
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/"
            prefetch={false}
            className="text-tinta-suave min-h-11 rounded-xl px-3 py-2 text-sm underline-offset-4 hover:underline"
          >
            Salir
          </Link>
          <button
            type="button"
            onClick={alternarCalma}
            aria-pressed={modoCalma}
            className="border-borde text-tinta min-h-11 rounded-full border px-4 text-sm"
            data-testid="modo-calma"
          >
            {modoCalma ? "Modo calma activado" : "Modo calma"}
          </button>
        </div>
      ) : null}

      {actual.fase === "guion" ? (
        <GuionCard capsula={capsula} onEmpezar={empezar} listo />
      ) : null}

      {actual.fase === "pidiendo-mic" ? (
        <section
          className="mx-auto flex max-w-md flex-col items-center gap-4 text-center"
          data-testid="pidiendo-mic"
        >
          <p className="text-6xl" aria-hidden="true">
            🎤
          </p>
          <h2 className="font-display text-3xl">Necesito escuchar su voz</h2>
          <p className="text-tinta-suave">
            El navegador va a preguntar si puede usar el micrófono. El sonido se
            analiza aquí mismo, en este dispositivo, para saber si hay voz y
            cuánto dura.{" "}
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
          <p className="text-6xl" aria-hidden="true">
            🔇
          </p>
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
              onClick={reintentarMic}
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
          <p className="text-6xl" aria-hidden="true">
            📢
          </p>
          <h2 className="font-display text-3xl">Hay bastante ruido por ahí</h2>
          <p className="text-tinta-suave">
            Con este ruido de fondo me cuesta distinguir su voz. Si pueden,
            apaguen la tele o acérquense un poco al dispositivo. Igual podemos
            jugar así: solo tendrá que hablar más fuerte.
          </p>
          <div className="flex w-full flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={recalibrar}
              className="bg-acento text-sobre-acento min-h-16 flex-1 rounded-2xl px-6 text-lg font-medium"
              data-testid="recalibrar"
            >
              Volver a medir
            </button>
            <button
              type="button"
              onClick={continuarConRuido}
              className="border-borde text-tinta min-h-16 flex-1 rounded-2xl border px-6 text-lg font-medium"
              data-testid="continuar-asi"
            >
              Jugar así
            </button>
          </div>
        </section>
      ) : null}

      {actual.fase === "esperando-voz" || actual.fase === "jugando" ? (
        <section className="flex flex-col gap-5">
          <h2 className="font-display text-center text-3xl sm:text-4xl">
            {actual.fase === "jugando"
              ? "¡El globo está volando!"
              : "Haz sonar tu voz: aaaaah"}
          </h2>

          <Escenario
            medidas={medidas}
            metaMs={actual.fase === "jugando" ? actual.metaMs : 3000}
            modoCalma={!muestraMedidor(sesion)}
            invitando={invitacionAmable(sesion)}
          />

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={terminar}
              className="bg-acento text-sobre-acento min-h-16 flex-1 rounded-2xl px-6 text-lg font-medium"
              data-testid="terminar"
            >
              Ya jugamos
            </button>
            <button
              type="button"
              onClick={recalibrar}
              className="border-borde text-tinta min-h-16 rounded-2xl border px-6 text-lg font-medium"
              data-testid="recalibrar"
            >
              Volver a medir el ruido
            </button>
          </div>
        </section>
      ) : null}

      {actual.fase === "celebracion" ? (
        <CelebracionHonesta
          sostenidoMs={actual.sostenidoMs}
          onOtraVez={otraVez}
          onTerminar={terminarYMarcar}
          etiquetaTerminar="Marcar el día como hecho"
        />
      ) : null}
    </div>
  );
}
