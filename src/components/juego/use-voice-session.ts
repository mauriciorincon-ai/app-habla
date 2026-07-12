"use client";

// Puente entre el micrófono (Web Audio) y la máquina de estados pura.
//
// Los frames del medidor (~31/s) NO pasan por React: viven en refs y el juego los pinta a 60 fps
// mutando `transform` directamente. Solo las transiciones de fase (empezar a jugar, celebrar)
// disparan un render — así el juego se mantiene fluido en la tablet.

import { useCallback, useEffect, useReducer, useRef } from "react";
import { crearCalibracion, type Calibracion } from "@/lib/voice/calibration";
import {
  CONFIG_METER_DEFECTO,
  crearMeter,
  type Meter,
} from "@/lib/voice/meter";
import { AnalyserSource } from "@/lib/voice/analyser-source";
import { MicSession } from "@/lib/voice/mic-session";
import type { MeterFrame, MeterSource } from "@/lib/voice/types";
import { DURACION_CALIBRACION_MS } from "@/lib/voice/calibration";
import { reducir, sesionInicial, type Sesion } from "@/lib/session-flow";

/** Cadencia de las transiciones de fase. 100 ms es imperceptible y evita renders inútiles. */
const MS_POR_TICK = 100;

export type MedidasVivas = {
  /** 0..1 — para la barra del medidor. */
  nivel: () => number;
  /** ms de voz REAL sostenida en el intento actual. */
  sostenidoMs: () => number;
  /** 0..1 — avance de la calibración. */
  progresoCalibracion: () => number;
};

export type VoiceSession = {
  sesion: Sesion;
  medidas: MedidasVivas;
  /** Abre el micrófono (debe llamarse desde el gesto del usuario). */
  empezar: () => Promise<void>;
  reintentarMic: () => Promise<void>;
  recalibrar: () => void;
  continuarConRuido: () => void;
  terminar: () => void;
  otraVez: () => void;
  cambiarCalma: (activo: boolean) => void;
};

export function useVoiceSession(modoCalmaInicial: boolean): VoiceSession {
  const [sesion, despachar] = useReducer(reducir, modoCalmaInicial, (calma) =>
    sesionInicial({ modoCalma: calma }),
  );

  const fuenteRef = useRef<MeterSource | null>(null);
  const meterRef = useRef<Meter | null>(null);
  const calibracionRef = useRef<Calibracion | null>(null);

  // Valores vivos que la UI pinta a 60 fps sin re-render.
  const nivelRef = useRef(0);
  const sostenidoRef = useRef(0);
  const vozActivaRef = useRef(false);
  const progresoCalibracionRef = useRef(0);
  // La fase actual, legible desde el callback de audio sin re-suscribir nada.
  const faseRef = useRef(sesion.actual.fase);
  useEffect(() => {
    faseRef.current = sesion.actual.fase;
  }, [sesion.actual.fase]);

  const alRecibirFrame = useCallback((frame: MeterFrame) => {
    const fase = faseRef.current;

    if (fase === "calibrando") {
      const calibracion = calibracionRef.current;
      if (!calibracion) return;
      const estado = calibracion.empujar(frame);
      progresoCalibracionRef.current = Math.min(
        1,
        estado.msTranscurridos / DURACION_CALIBRACION_MS,
      );

      if (estado.listo) {
        // Se descarta la calibración: los frames que lleguen mientras React procesa el cambio de
        // fase no deben volver a medir el piso ni re-despachar la transición.
        calibracionRef.current = null;
        meterRef.current = crearMeter({
          pisoRuido: estado.pisoRuido,
          ...CONFIG_METER_DEFECTO,
        });
        sostenidoRef.current = 0;
        vozActivaRef.current = false;
        despachar(
          estado.ruidoAlto
            ? { tipo: "CALIBRACION_RUIDOSA", pisoRuido: estado.pisoRuido }
            : { tipo: "CALIBRACION_OK", pisoRuido: estado.pisoRuido },
        );
      }
      return;
    }

    if (fase === "esperando-voz" || fase === "jugando") {
      const meter = meterRef.current;
      if (!meter) return;
      const estado = meter.empujar(frame);
      nivelRef.current = estado.nivel;
      sostenidoRef.current = estado.sostenidoMs;
      vozActivaRef.current = estado.vozActiva;
    }
  }, []);

  // Reloj de las transiciones de fase: lee los refs y despacha TICK.
  useEffect(() => {
    const intervalo = setInterval(() => {
      const fase = faseRef.current;
      if (fase !== "esperando-voz" && fase !== "jugando") return;
      despachar({
        tipo: "TICK",
        deltaMs: MS_POR_TICK,
        vozActiva: vozActivaRef.current,
        sostenidoMs: sostenidoRef.current,
      });
    }, MS_POR_TICK);
    return () => clearInterval(intervalo);
  }, []);

  // El micrófono se cierra al salir del juego: el audio no sobrevive a la pantalla.
  useEffect(() => {
    return () => {
      fuenteRef.current?.stop();
      fuenteRef.current = null;
    };
  }, []);

  const abrirMicrofono = useCallback(async () => {
    fuenteRef.current?.stop();

    const iniciar = async (fuente: MeterSource) => {
      fuente.subscribe(alRecibirFrame);
      await fuente.start();
      fuenteRef.current = fuente;
      calibracionRef.current = crearCalibracion();
      progresoCalibracionRef.current = 0;
      despachar({ tipo: "MIC_OK" });
    };

    try {
      await iniciar(new MicSession());
      return;
    } catch (error) {
      // Permiso denegado: no hay fallback posible — la pantalla honesta explica cómo darlo.
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        despachar({ tipo: "MIC_DENEGADO" });
        return;
      }
      // El worklet no cargó (o el dispositivo no lo soporta): fallback documentado (ADR 003).
    }

    try {
      await iniciar(new AnalyserSource());
    } catch {
      despachar({ tipo: "MIC_DENEGADO" });
    }
  }, [alRecibirFrame]);

  const empezar = useCallback(async () => {
    despachar({ tipo: "EMPEZAR" });
    await abrirMicrofono();
  }, [abrirMicrofono]);

  const reintentarMic = useCallback(async () => {
    despachar({ tipo: "REINTENTAR_MIC" });
    await abrirMicrofono();
  }, [abrirMicrofono]);

  const recalibrar = useCallback(() => {
    calibracionRef.current = crearCalibracion();
    progresoCalibracionRef.current = 0;
    meterRef.current?.reiniciar();
    sostenidoRef.current = 0;
    vozActivaRef.current = false;
    nivelRef.current = 0;
    despachar({ tipo: "RECALIBRAR" });
  }, []);

  const otraVez = useCallback(() => {
    calibracionRef.current = crearCalibracion();
    progresoCalibracionRef.current = 0;
    meterRef.current?.reiniciar();
    sostenidoRef.current = 0;
    vozActivaRef.current = false;
    nivelRef.current = 0;
    despachar({ tipo: "OTRA_VEZ" });
  }, []);

  return {
    sesion,
    medidas: {
      nivel: () => nivelRef.current,
      sostenidoMs: () => sostenidoRef.current,
      progresoCalibracion: () => progresoCalibracionRef.current,
    },
    empezar,
    reintentarMic,
    recalibrar,
    continuarConRuido: useCallback(
      () => despachar({ tipo: "CONTINUAR_ASI" }),
      [],
    ),
    terminar: useCallback(() => despachar({ tipo: "TERMINAR" }), []),
    otraVez,
    cambiarCalma: useCallback(
      (activo: boolean) => despachar({ tipo: "CAMBIAR_CALMA", activo }),
      [],
    ),
  };
}
