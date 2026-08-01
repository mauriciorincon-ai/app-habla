"use client";

// EL COHETE DEL TONO (Outcome 2 del Sprint 2): el cohete sube cuando la voz del niño sube de
// tono y baja cuando baja. Es exploración vocal pura — NO exige ninguna palabra (ADR 005): una
// vocal estirada como una sirena es exactamente lo que el juego quiere.
//
// Celebración honesta: cuenta las veces REALES que su voz cambió de dirección (inversiones).
// Si el tono no fue confiable, el cohete no se mueve y la app lo dice sin drama.

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import {
  ajustesActuales,
  guardarAjustesEnStore,
  useAjustes,
} from "@/components/estado-local";
import { useHidratado } from "@/components/use-hidratado";
import {
  META_INVERSIONES_DEFECTO,
  invitacionAmable,
  muestraMedidor,
  type Metrica,
} from "@/lib/session-flow";
import { AltavozConsigna } from "./altavoz-consigna";
import { CelebracionHonesta } from "./celebracion-honesta";
import { EscenarioCohete } from "./escenario-cohete";
import { GuionCard } from "./guion-card";
import { useVozFamiliar } from "./use-voz-familiar";
import { MarcoJuego } from "./marco-juego";
import { useVoiceSession, type MedidasVivas } from "./use-voice-session";

export function CoheteTono() {
  const hidratado = useHidratado();
  const ajustes = useAjustes();

  if (!hidratado || !ajustes) {
    return <div className="min-h-[28rem]" aria-hidden="true" />;
  }

  return <JuegoListo modoCalmaInicial={ajustes.modoCalma} />;
}

function JuegoListo({ modoCalmaInicial }: { modoCalmaInicial: boolean }) {
  const router = useRouter();

  // Lo que mide el cohete: cuántas veces la voz subió y bajó DE VERDAD.
  const metricaActual = useCallback(
    (medidas: MedidasVivas): Metrica => ({
      tipo: "inversiones",
      veces: medidas.inversiones(),
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
    tipoMetrica: "inversiones",
    meta: META_INVERSIONES_DEFECTO,
    metricaActual,
  });

  // La consigna del cohete puede sonar en la voz de la familia; la guarda del bucle pausa el
  // medidor mientras suena (regla dura 3 — el cohete mide el micrófono en vivo).
  const voz = useVozFamiliar({ alSonar: silenciar });

  const { actual, ajustes } = sesion;
  const modoCalma = ajustes.modoCalma;

  function alternarCalma() {
    const activo = !modoCalma;
    cambiarCalma(activo);
    guardarAjustesEnStore({ ...ajustesActuales(), modoCalma: activo });
  }

  // En calma no hay meta: el cohete solo flota con la voz, sin carrera y sin llegada.
  const meta = modoCalma ? null : META_INVERSIONES_DEFECTO;

  return (
    <MarcoJuego
      sesion={sesion}
      medidas={medidas}
      nombre="cohete"
      onAlternarCalma={alternarCalma}
      onReintentarMic={reintentarMic}
      onRecalibrar={recalibrar}
      onContinuarConRuido={continuarConRuido}
      onSalir={volverAlGuion}
    >
      {actual.fase === "guion" ? (
        <GuionCard
          etiqueta="El cohete del tono"
          guion="“Haz la voz como una sirena: aaaAAAaaa… ¡mira cómo sube el cohete!”"
          nota="Hazlo tú primero, exagerado y riéndote: sube la voz y bájala. El cohete responde al TONO, no a las palabras — cualquier sonido estirado sirve. Si hoy solo quiere mirar, también está bien."
          onEmpezar={empezar}
          listo
        />
      ) : null}

      {actual.fase === "esperando-voz" || actual.fase === "jugando" ? (
        <section className="flex flex-col gap-5">
          <h2 className="font-display text-center text-3xl sm:text-4xl">
            {actual.fase === "jugando"
              ? "¡El cohete está volando!"
              : "Haz la voz de sirena: aaaAAAaaa"}
          </h2>

          {/* La invitación, en la voz de la familia (si está grabada). El niño puede tocarlo. */}
          <AltavozConsigna
            voz={voz}
            id="consigna:sirena"
            etiqueta="Oír “Haz la voz de sirena: aaaAAAaaa”"
          />

          <EscenarioCohete
            medidas={medidas}
            meta={meta}
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
          onTerminar={() => router.push("/jugar")}
          etiquetaTerminar="Elegir otro juego"
        />
      ) : null}
    </MarcoJuego>
  );
}
