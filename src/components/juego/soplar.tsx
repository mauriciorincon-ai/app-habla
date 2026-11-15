"use client";

// SOPLAR (S12, ADR-024): el molino gira con cada soplo. El detector (src/lib/voice/soplo.ts) busca
// energía SIN tono y sin siseo: soplar cuenta, una vocal no, una «sh» no, la tele de fondo no. Sin
// meta ni tiempo: cierra el adulto con «Ya jugamos». No exige palabras (regla 7) ni juzga el soplo:
// un soplo suave cuenta igual que uno fuerte. La celebración dice el mismo número que el contador vivo.

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
import { soplar as textos } from "@/lib/idioma/textos/voz-juegos";
import { AltavozConsigna } from "./altavoz-consigna";
import { CelebracionHonesta } from "./celebracion-honesta";
import { EscenarioMolino } from "./escenario-molino";
import { GuionCard } from "./guion-card";
import { MarcoJuego } from "./marco-juego";
import { useVozFamiliar } from "./use-voz-familiar";
import { useVoiceSession, type MedidasVivas } from "./use-voice-session";

export function Soplar() {
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
      tipo: "soplos",
      soplos: medidas.soplos(),
      soploMs: medidas.soploMs(),
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
    tipoMetrica: "soplos",
    meta: null,
    metricaActual,
  });

  // La consigna puede sonar en la voz de la familia; la guarda del bucle pausa el medidor mientras suena.
  const voz = useVozFamiliar({ alSonar: silenciar });

  const { actual, ajustes } = sesion;
  const modoCalma = ajustes.modoCalma;
  const jugando = actual.fase === "esperando-voz" || actual.fase === "jugando";
  // Este componente re-renderiza con cada TICK (~10/s): leer los lectores aquí es seguro.
  const soplos = jugando ? medidas.soplos() : 0;

  function alternarCalma() {
    const activo = !modoCalma;
    cambiarCalma(activo);
    guardarAjustesEnStore({ ...ajustesActuales(), modoCalma: activo });
  }

  return (
    <MarcoJuego
      sesion={sesion}
      medidas={medidas}
      nombre="soplar"
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
        />
      ) : null}

      {jugando ? (
        <section className="flex flex-col gap-5">
          <h2 className="font-display text-center text-3xl sm:text-4xl">
            {actual.fase === "jugando"
              ? tx(textos.soplando)
              : tx(textos.invitacion)}
          </h2>

          {/* El logro medido, en vivo: el MISMO número de la celebración. Cero presión antes del primero. */}
          {soplos > 0 && !modoCalma ? (
            <p
              className="text-center text-lg font-medium"
              data-testid="soplos"
              aria-live="polite"
            >
              {tx(textos.conteoAntes)}{" "}
              <span className="text-celebracion-texto font-sans font-semibold tabular-nums">
                {tx(soplos === 1 ? textos.soplo : textos.soplos, { n: soplos })}
              </span>
            </p>
          ) : null}

          <AltavozConsigna
            voz={voz}
            id={idConsigna("sopla", idioma)}
            etiqueta={tx(textos.oir)}
          />

          <EscenarioMolino
            medidas={medidas}
            hito={soplos}
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
