"use client";

// FUERTE Y SUAVE (S12, ADR-024): la columna sube con la voz fuerte y baja con la suave, medidas contra el
// piso de ruido de ESTE cuarto (src/lib/voice/intensidad.ts). Celebra los CAMBIOS entre suave y fuerte,
// nunca un volumen «correcto»: no hay meta, zona verde ni tiempo, y un grito sostenido no suma. Sirve
// cualquier sonido de voz, sin palabras (regla 7). Cierra el adulto con «Ya jugamos».

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import {
  ajustesActuales,
  guardarAjustesEnStore,
  useAjustes,
} from "@/components/estado-local";
import { useHidratado } from "@/components/use-hidratado";
import {
  invitacionAmable,
  muestraMedidor,
  type Metrica,
} from "@/lib/session-flow";
import { useIdioma, useT } from "@/lib/idioma/estado";
import { idConsigna } from "@/lib/banco-voz/catalogo";
import { juegos } from "@/lib/idioma/textos/juegos";
import { fuerteSuave as textos } from "@/lib/idioma/textos/voz-juegos";
import { AltavozConsigna } from "./altavoz-consigna";
import { CelebracionHonesta } from "./celebracion-honesta";
import { EscenarioBarra } from "./escenario-barra";
import { GuionCard } from "./guion-card";
import { MarcoJuego } from "./marco-juego";
import { useVozFamiliar } from "./use-voz-familiar";
import { useVoiceSession, type MedidasVivas } from "./use-voice-session";

export function FuerteSuave() {
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
  const idioma = useIdioma();

  const metricaActual = useCallback(
    (medidas: MedidasVivas): Metrica => ({
      tipo: "intensidad",
      cambios: medidas.cambiosVoz(),
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
    tipoMetrica: "intensidad",
    meta: null,
    metricaActual,
  });

  // La consigna puede sonar en la voz de la familia; la guarda del bucle pausa el medidor mientras suena.
  const voz = useVozFamiliar({ alSonar: silenciar });

  const { actual, ajustes } = sesion;
  const modoCalma = ajustes.modoCalma;
  const jugando = actual.fase === "esperando-voz" || actual.fase === "jugando";
  // Este componente re-renderiza con cada TICK (~10/s): leer los lectores aquí es seguro.
  const cambios = jugando ? medidas.cambiosVoz() : 0;

  function alternarCalma() {
    const activo = !modoCalma;
    cambiarCalma(activo);
    guardarAjustesEnStore({ ...ajustesActuales(), modoCalma: activo });
  }

  return (
    <MarcoJuego
      sesion={sesion}
      medidas={medidas}
      nombre="fuerte-suave"
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
          juego="fuerte-suave"
        />
      ) : null}

      {jugando ? (
        <section className="flex flex-col gap-5">
          <h2 className="font-display text-center text-3xl sm:text-4xl">
            {actual.fase === "jugando"
              ? tx(textos.escuchando)
              : tx(textos.invitacion)}
          </h2>

          {/* El logro medido, en vivo: el MISMO número de la celebración. Cero presión antes del primer cambio. */}
          {cambios > 0 && !modoCalma ? (
            <p
              className="text-center text-lg font-medium"
              data-testid="cambios-voz"
              aria-live="polite"
            >
              {tx(textos.conteoAntes)}{" "}
              <span className="text-celebracion-texto font-sans font-semibold tabular-nums">
                {tx(cambios === 1 ? textos.cambio : textos.cambios, { n: cambios })}
              </span>
            </p>
          ) : null}

          <AltavozConsigna
            voz={voz}
            id={idConsigna("fuerte-suave", idioma)}
            etiqueta={tx(textos.oir)}
          />

          <EscenarioBarra
            medidas={medidas}
            hito={cambios}
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
