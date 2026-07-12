"use client";

// PALABRA↔OBJETO (Outcome 3 del Sprint 2): el andamio visual que invita a la voz.
//
// LA REGLA MÁS IMPORTANTE DE ESTA PANTALLA (ADR 005): el juego **JAMÁS exige la palabra**.
// Aparece el dibujo con su nombre escrito; el PADRE lo nombra (su guion está en su vista) y
// **cualquier vocalización del niño lo enciende** — un intento, un sonido, un "aba". La app no
// sabe qué dijo, y no va a fingir que sí: si dijo la palabra o se acercó, el que lo juzga es el
// padre. Lo único que la app afirma es lo que midió: su voz sonó.
//
// Los pictogramas son de ARASAAC (CC BY-NC-SA — atribución en Ajustes → Acerca de) y se sirven
// desde el repo: cero llamadas de red durante el juego (ADR 008).

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useRef, useState } from "react";
import { PICTOGRAMAS } from "@content/pictogramas";
import {
  ajustesActuales,
  guardarAjustesEnStore,
  useAjustes,
  usePerfil,
} from "@/components/estado-local";
import { useHidratado } from "@/components/use-hidratado";
import { invitacionAmable, type Metrica } from "@/lib/session-flow";
import type { Tema } from "@/lib/storage/temas";
import { CelebracionHonesta } from "./celebracion-honesta";
import { GuionCard } from "./guion-card";
import { MarcoJuego } from "./marco-juego";
import { useVoiceSession } from "./use-voice-session";
import { EscenarioPalabra } from "./escenario-palabra";

/** Baraja determinista por semilla: sin Math.random en el render (y estable entre renders). */
function barajar<T>(items: readonly T[], semilla: number): T[] {
  const copia = [...items];
  let estado = semilla || 1;
  for (let i = copia.length - 1; i > 0; i--) {
    estado = (estado * 1103515245 + 12345) & 0x7fffffff;
    const j = estado % (i + 1);
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

export function PalabraObjeto() {
  const hidratado = useHidratado();
  const ajustes = useAjustes();
  const perfil = usePerfil();

  if (!hidratado || !ajustes) {
    return <div className="min-h-[28rem]" aria-hidden="true" />;
  }

  return (
    <JuegoListo
      modoCalmaInicial={ajustes.modoCalma}
      temas={perfil?.temas ?? null}
    />
  );
}

function JuegoListo({
  modoCalmaInicial,
  temas,
}: {
  modoCalmaInicial: boolean;
  /** Los temas que el padre eligió en el onboarding: por fin HACEN algo (S2). */
  temas: Tema[] | null;
}) {
  const router = useRouter();

  // La baraja del día: los pictos de SUS temas, en orden estable durante toda la sesión.
  const mazo = useMemo(() => {
    const candidatos = temas
      ? PICTOGRAMAS.filter((p) => temas.includes(p.tema))
      : PICTOGRAMAS;
    const base = candidatos.length > 0 ? candidatos : PICTOGRAMAS;
    // Semilla estable por sesión: el orden no cambia al re-renderizar.
    return barajar(base, base.length * 7919);
  }, [temas]);

  const [indice, setIndice] = useState(0);
  const [encendido, setEncendido] = useState(false);
  const activacionesRef = useRef(0);
  const [activaciones, setActivaciones] = useState(0);
  /** Evita que una misma vocalización encienda el mismo dibujo dos veces. */
  const yaContadoRef = useRef(false);

  const picto = mazo[indice % mazo.length];

  // Lo que mide este juego: cuántos dibujos encendió su voz. Nada más.
  const metricaActual = useCallback(
    (): Metrica => ({
      tipo: "activaciones",
      veces: activacionesRef.current,
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
    tipoMetrica: "activaciones",
    // Sin meta: el juego dura lo que el padre quiera. Nunca hay carrera ni llegada.
    meta: null,
    metricaActual,
  });

  const { actual, ajustes } = sesion;
  const modoCalma = ajustes.modoCalma;

  function alternarCalma() {
    const activo = !modoCalma;
    cambiarCalma(activo);
    guardarAjustesEnStore({ ...ajustesActuales(), modoCalma: activo });
  }

  /**
   * CUALQUIER vocalización enciende el dibujo (la llama el escenario cuando el medidor confirma
   * voz real sostenida ~250 ms). No se compara con nada: la app no evalúa la palabra.
   */
  const alVocalizar = useCallback(() => {
    if (yaContadoRef.current) return;
    yaContadoRef.current = true;
    activacionesRef.current += 1;
    setActivaciones(activacionesRef.current);
    setEncendido(true);
  }, []);

  function siguiente() {
    yaContadoRef.current = false;
    setEncendido(false);
    setIndice((i) => (i + 1) % mazo.length);
  }

  function reiniciarSesion() {
    activacionesRef.current = 0;
    setActivaciones(0);
    yaContadoRef.current = false;
    setEncendido(false);
    setIndice(0);
    otraVez();
  }

  return (
    <MarcoJuego
      sesion={sesion}
      medidas={medidas}
      nombre="palabras"
      onAlternarCalma={alternarCalma}
      onReintentarMic={reintentarMic}
      onRecalibrar={recalibrar}
      onContinuarConRuido={continuarConRuido}
    >
      {actual.fase === "guion" ? (
        <GuionCard
          etiqueta="Palabra y dibujo"
          guion="Señala el dibujo, nómbralo UNA vez —“¡perro!”— y espera tres segundos en silencio."
          nota="El dibujo se enciende con CUALQUIER sonido que él haga: no tiene que decir la palabra ni pronunciarla bien. Si dijo algo parecido, el que lo sabe eres tú — la app no lo juzga."
          onEmpezar={empezar}
          listo
        />
      ) : null}

      {actual.fase === "esperando-voz" || actual.fase === "jugando" ? (
        <section className="flex flex-col gap-5">
          <EscenarioPalabra
            picto={picto}
            medidas={medidas}
            encendido={encendido}
            invitando={invitacionAmable(sesion)}
            onVocalizar={alVocalizar}
          />

          {!modoCalma ? (
            <p
              className="text-tinta-suave text-center text-sm"
              data-testid="contador-activaciones"
              aria-live="polite"
            >
              Dibujos encendidos con su voz:{" "}
              <span className="font-sans font-semibold tabular-nums">
                {activaciones}
              </span>
            </p>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={siguiente}
              className="bg-acento text-sobre-acento min-h-16 flex-1 rounded-2xl px-6 text-lg font-medium"
              data-testid="siguiente-picto"
            >
              Otro dibujo
            </button>
            <button
              type="button"
              onClick={terminar}
              className="border-borde text-tinta min-h-16 flex-1 rounded-2xl border px-6 text-lg font-medium"
              data-testid="terminar"
            >
              Ya jugamos
            </button>
          </div>
        </section>
      ) : null}

      {actual.fase === "celebracion" ? (
        <CelebracionHonesta
          metrica={actual.metrica}
          onOtraVez={reiniciarSesion}
          onTerminar={() => router.push("/jugar")}
          etiquetaTerminar="Elegir otro juego"
        />
      ) : null}
    </MarcoJuego>
  );
}
