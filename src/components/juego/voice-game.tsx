"use client";

// EL GLOBO — el primer juego (Sprint 1, aprobado por el usuario): el globo avanza SOLO mientras
// el niño sostiene la voz. Co-uso siempre: el padre dirige; la pantalla es utilería.
//
// El flujo (permiso, calibración, ruido, calma, salir) vive en MarcoJuego, compartido con los
// otros dos juegos. Aquí queda lo que es del globo: su guion, su escenario y su meta.

import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
import { NOMBRE_TECNICA, type Capsula } from "@content/schema";
import {
  ajustesActuales,
  guardarAjustesEnStore,
  useAjustes,
  useProgreso,
} from "@/components/estado-local";
import {
  asegurarAsignacionDeHoy,
  capsulaDeHoy,
  marcarCapsulaHecha,
} from "@/components/estado-capsulas";
import { useHidratado } from "@/components/use-hidratado";
import {
  META_MS_DEFECTO,
  invitacionAmable,
  muestraMedidor,
  type Metrica,
} from "@/lib/session-flow";
import { CelebracionHonesta } from "./celebracion-honesta";
import { Escenario } from "./escenario";
import { GuionCard } from "./guion-card";
import { MarcoJuego } from "./marco-juego";
import { useVoiceSession, type MedidasVivas } from "./use-voice-session";

export function VoiceGame() {
  const hidratado = useHidratado();
  const progreso = useProgreso();
  const ajustes = useAjustes();
  const etapa = ajustes?.etapa;

  useEffect(() => {
    asegurarAsignacionDeHoy();
  }, [etapa]);

  if (!hidratado || !progreso || !ajustes) {
    // Esqueleto con la misma altura: sin salto de layout al hidratar.
    return <div className="min-h-[28rem]" aria-hidden="true" />;
  }

  const { capsula, fecha } = capsulaDeHoy(progreso, ajustes.etapa);
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

  // Lo que mide el globo: milisegundos de voz REALMENTE sostenida.
  const metricaActual = useCallback(
    (medidas: MedidasVivas): Metrica => ({
      tipo: "sostenido",
      ms: medidas.sostenidoMs(),
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
    cambiarCalma,
  } = useVoiceSession({
    modoCalmaInicial,
    tipoMetrica: "sostenido",
    meta: META_MS_DEFECTO,
    metricaActual,
  });

  const { actual, ajustes } = sesion;
  const modoCalma = ajustes.modoCalma;

  function alternarCalma() {
    const activo = !modoCalma;
    cambiarCalma(activo);
    // El modo calma es un ajuste del niño: se recuerda para la próxima sesión.
    guardarAjustesEnStore({ ...ajustesActuales(), modoCalma: activo });
  }

  function terminarYMarcar() {
    marcarCapsulaHecha(fecha, capsula.id, capsula.etapa);
    router.push("/");
  }

  return (
    <MarcoJuego
      sesion={sesion}
      medidas={medidas}
      nombre="globo"
      onAlternarCalma={alternarCalma}
      onReintentarMic={reintentarMic}
      onRecalibrar={recalibrar}
      onContinuarConRuido={continuarConRuido}
    >
      {actual.fase === "guion" ? (
        <GuionCard
          etiqueta={NOMBRE_TECNICA[capsula.tecnica]}
          guion={capsula.guion}
          nota="Muéstrale cómo suena tú primero. Si hoy prefiere solo mirar, también está bien."
          onEmpezar={empezar}
          listo
        />
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
            metaMs={META_MS_DEFECTO}
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
          metrica={actual.metrica}
          onOtraVez={otraVez}
          onTerminar={terminarYMarcar}
          etiquetaTerminar="Marcar el día como hecho"
        />
      ) : null}
    </MarcoJuego>
  );
}
