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
  HITO_VUELTA_MS,
  invitacionAmable,
  muestraMedidor,
  type Metrica,
} from "@/lib/session-flow";
import { AltavozConsigna } from "./altavoz-consigna";
import { CelebracionHonesta } from "./celebracion-honesta";
import { Escenario } from "./escenario";
import { GuionCard } from "./guion-card";
import { useVozFamiliar } from "./use-voz-familiar";
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

  // Lo que mide el globo: el total de voz del intento (lo que lo hace volar) y, aparte, la racha
  // continua más larga — el único número con el que la app puede decir "la sostuviste".
  const metricaActual = useCallback(
    (medidas: MedidasVivas): Metrica => ({
      tipo: "sostenido",
      ms: medidas.sostenidoMs(),
      rachaMs: medidas.mejorRachaMs(),
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
    silenciar,
  } = useVoiceSession({
    modoCalmaInicial,
    tipoMetrica: "sostenido",
    // Sin meta (gate S4, hallazgo E6): el globo ya NO se cierra solo. Cada HITO_VUELTA_MS de voz
    // es una vuelta —infinitas— y el intento termina cuando el padre toca "Ya jugamos". El fin
    // automático a los 3 s cortaba el juego justo mientras le enseñaba al niño.
    meta: null,
    metricaActual,
  });

  // La consigna del globo puede sonar en la voz de la familia; la guarda del bucle pausa el
  // medidor mientras suena (regla dura 3 — el globo mide el micrófono en vivo).
  const voz = useVozFamiliar({ alSonar: silenciar });

  const { actual, ajustes } = sesion;
  const modoCalma = ajustes.modoCalma;

  // Vueltas completas del intento (cada HITO_VUELTA_MS de voz acumulada). Leer las medidas aquí
  // es seguro: este componente re-renderiza con cada TICK (~10/s) mientras el juego corre.
  const vueltas =
    actual.fase === "esperando-voz" || actual.fase === "jugando"
      ? Math.floor(medidas.sostenidoMs() / HITO_VUELTA_MS)
      : 0;

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
      onSalir={volverAlGuion}
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

          {/* El logro medido, en vivo (gate S4): cada vuelta completa se celebra sin detener el
              juego. Solo aparece cuando hay al menos una — cero presión antes. */}
          {vueltas > 0 && !modoCalma ? (
            <p
              className="text-center text-lg font-medium"
              data-testid="vueltas"
              aria-live="polite"
            >
              ¡Ya dio{" "}
              <span className="text-celebracion-fuerte font-sans font-semibold tabular-nums">
                {vueltas} {vueltas === 1 ? "vuelta" : "vueltas"}
              </span>
              !
            </p>
          ) : null}

          {/* La invitación, en la voz de la familia (si está grabada). El niño puede tocarlo. */}
          <AltavozConsigna
            voz={voz}
            id="consigna:aaah"
            etiqueta="Oír “Haz sonar tu voz: aaaaah”"
          />

          <Escenario
            medidas={medidas}
            hitoMs={HITO_VUELTA_MS}
            vuelta={vueltas}
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
          // Las vueltas salen del MISMO total medido; en calma van en 0 (allí no hay línea de
          // vuelta y la celebración no afirma lo que el juego no mostró).
          vueltas={
            !modoCalma && actual.metrica.tipo === "sostenido"
              ? Math.floor(actual.metrica.ms / HITO_VUELTA_MS)
              : 0
          }
          onOtraVez={otraVez}
          onTerminar={terminarYMarcar}
          etiquetaTerminar="Marcar el día como hecho"
        />
      ) : null}
    </MarcoJuego>
  );
}
