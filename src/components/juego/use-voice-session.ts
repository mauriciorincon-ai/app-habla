"use client";

// Puente entre el micrófono (Web Audio) y la máquina de estados pura. Lo comparten los TRES
// juegos: el flujo (guion → permiso → calibración → jugar → celebración) es el mismo; lo único
// que cambia es qué mide cada uno (la métrica) y cuándo se cierra el intento (la meta).
//
// Los frames del medidor (~31/s) NO pasan por React: viven en refs y el juego los pinta a 60 fps
// mutando `transform` directamente. Solo las transiciones de fase (empezar a jugar, celebrar)
// disparan un render — así el juego se mantiene fluido en la tablet.

import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { crearCalibracion, type Calibracion } from "@/lib/voice/calibration";
import {
  CONFIG_METER_DEFECTO,
  crearMeter,
  type Meter,
} from "@/lib/voice/meter";
import { AnalyserSource } from "@/lib/voice/analyser-source";
import { crearGuardaBucle } from "@/lib/voice/guarda-bucle";
import { MicSession } from "@/lib/voice/mic-session";
import {
  crearPitchTracker,
  type Direccion,
  type PitchTracker,
} from "@/lib/voice/pitch-tracker";
import type { MeterFrame, MeterSource } from "@/lib/voice/types";
import { DURACION_CALIBRACION_MS } from "@/lib/voice/calibration";
import {
  reducir,
  sesionInicial,
  type Metrica,
  type Sesion,
} from "@/lib/session-flow";

/** Cadencia de las transiciones de fase. 100 ms es imperceptible y evita renders inútiles. */
const MS_POR_TICK = 100;

export type MedidasVivas = {
  /** 0..1 — para la barra del medidor. */
  nivel: () => number;
  /** ms TOTALES de voz real en el intento (mueven al globo). */
  sostenidoMs: () => number;
  /** ms de la racha continua más larga: lo único que autoriza a decir "la sostuviste". */
  mejorRachaMs: () => number;
  /** El veredicto del meter (histéresis + gracia): hay voz por encima del piso calibrado. */
  vozActiva: () => boolean;
  /** 0..1 — altura del cohete según el TONO de la voz (null-safe: sin voz, no se mueve). */
  alturaPitch: () => number;
  direccionPitch: () => Direccion;
  /** Veces que la voz subió y bajó: la métrica honesta del cohete. */
  inversiones: () => number;
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
  /**
   * "Salir" dentro del juego → de vuelta al GUION (gate S4). Apaga el micrófono: el guion es
   * pantalla del padre y el audio no la sobrevive (regla dura 2). Tocar "Estamos listos" vuelve
   * a pedirlo (el navegador recuerda el permiso: es instantáneo).
   */
  volverAlGuion: () => void;
  cambiarCalma: (activo: boolean) => void;
  /**
   * Silencia el medidor por `ms` (+ cola): mientras la app REPRODUCE la voz familiar por los
   * parlantes, sus frames no deben contar como voz del niño (regla dura 3 — el juego mentiría).
   * `ms <= 0` cancela la guarda (el play falló: no sonó nada). Motor puro en
   * lib/voice/guarda-bucle (ADR-010), unit-tested.
   */
  silenciar: (ms: number) => void;
};

export type OpcionesSesion = {
  modoCalmaInicial: boolean;
  /** Qué mide este juego. */
  tipoMetrica: Metrica["tipo"];
  /** Valor que cierra el intento con celebración; null = sin meta (el padre decide cuándo). */
  meta: number | null;
  /** La métrica REAL de este instante, leída de los refs del juego. Debe ser estable (useCallback). */
  metricaActual: (medidas: MedidasVivas) => Metrica;
};

export function useVoiceSession({
  modoCalmaInicial,
  tipoMetrica,
  meta,
  metricaActual,
}: OpcionesSesion): VoiceSession {
  const [sesion, despachar] = useReducer(
    reducir,
    { modoCalmaInicial, tipoMetrica, meta },
    (init) =>
      sesionInicial(
        { modoCalma: init.modoCalmaInicial },
        init.tipoMetrica,
        init.meta,
      ),
  );

  const fuenteRef = useRef<MeterSource | null>(null);
  const meterRef = useRef<Meter | null>(null);
  const pitchRef = useRef<PitchTracker | null>(null);
  const calibracionRef = useRef<Calibracion | null>(null);

  // Valores vivos que la UI pinta a 60 fps sin re-render.
  const nivelRef = useRef(0);
  const sostenidoRef = useRef(0);
  const mejorRachaRef = useRef(0);
  const vozActivaRef = useRef(false);
  const alturaPitchRef = useRef(0);
  const direccionRef = useRef<Direccion>("quieto");
  const inversionesRef = useRef(0);
  const progresoCalibracionRef = useRef(0);
  // La fase actual, legible desde el callback de audio sin re-suscribir nada.
  const faseRef = useRef(sesion.actual.fase);
  useEffect(() => {
    faseRef.current = sesion.actual.fase;
  }, [sesion.actual.fase]);

  // Objeto estable de "lectores": las funciones leen los refs cuando se las llama (en el rAF del
  // escenario o en el reloj de ticks), nunca durante el render.
  const medidas: MedidasVivas = useMemo(
    () => ({
      nivel: () => nivelRef.current,
      sostenidoMs: () => sostenidoRef.current,
      mejorRachaMs: () => mejorRachaRef.current,
      vozActiva: () => vozActivaRef.current,
      alturaPitch: () => alturaPitchRef.current,
      direccionPitch: () => direccionRef.current,
      inversiones: () => inversionesRef.current,
      progresoCalibracion: () => progresoCalibracionRef.current,
    }),
    [],
  );

  // Guarda del bucle (motor puro): mientras esté activa, el medidor ignora los frames — porque
  // está sonando la voz familiar por los parlantes y no es el niño.
  const guardaRef = useRef(crearGuardaBucle());
  const silenciar = useCallback((ms: number) => {
    guardaRef.current.silenciar(ms, performance.now());
  }, []);

  // La métrica actual, siempre fresca, sin re-suscribir el reloj de ticks.
  const metricaRef = useRef(metricaActual);
  useEffect(() => {
    metricaRef.current = metricaActual;
  }, [metricaActual]);

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
        pitchRef.current = crearPitchTracker();
        sostenidoRef.current = 0;
        vozActivaRef.current = false;
        alturaPitchRef.current = 0;
        direccionRef.current = "quieto";
        inversionesRef.current = 0;
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
      // Suena la voz familiar: se ignoran los frames para que su eco no cuente como voz del niño.
      if (guardaRef.current.activa(performance.now())) return;
      const estado = meter.empujar(frame);
      nivelRef.current = estado.nivel;
      sostenidoRef.current = estado.sostenidoMs;
      mejorRachaRef.current = estado.mejorRachaMs;
      vozActivaRef.current = estado.vozActiva;

      // El pitch se alimenta del MISMO frame y del veredicto de energía del meter: el ruido de
      // la casa no produce tono fantasma (ADR 007).
      const pitch = pitchRef.current?.empujar(frame, estado.vozActiva);
      if (pitch) {
        alturaPitchRef.current = pitch.altura;
        direccionRef.current = pitch.direccion;
        inversionesRef.current = pitch.inversiones;
      }
    }
  }, []);

  // Reloj de las transiciones de fase: lee los refs y despacha TICK con la métrica real.
  useEffect(() => {
    const intervalo = setInterval(() => {
      const fase = faseRef.current;
      if (fase !== "esperando-voz" && fase !== "jugando") return;
      despachar({
        tipo: "TICK",
        deltaMs: MS_POR_TICK,
        vozActiva: vozActivaRef.current,
        metrica: metricaRef.current(medidas),
      });
    }, MS_POR_TICK);
    return () => clearInterval(intervalo);
  }, [medidas]);

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
      // Ojo: el fallback no calcula pitch (ADR 007) — el cohete se queda quieto y es honesto.
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

  /** Vuelve a medir el piso de ruido y limpia el intento (sin re-pedir permiso). */
  const remedir = useCallback(() => {
    calibracionRef.current = crearCalibracion();
    progresoCalibracionRef.current = 0;
    meterRef.current?.reiniciar();
    pitchRef.current?.reiniciar();
    sostenidoRef.current = 0;
    vozActivaRef.current = false;
    nivelRef.current = 0;
    alturaPitchRef.current = 0;
    direccionRef.current = "quieto";
    inversionesRef.current = 0;
  }, []);

  const recalibrar = useCallback(() => {
    remedir();
    despachar({ tipo: "RECALIBRAR" });
  }, [remedir]);

  const otraVez = useCallback(() => {
    remedir();
    despachar({ tipo: "OTRA_VEZ" });
  }, [remedir]);

  const terminar = useCallback(() => {
    // Terminar reporta la métrica REAL del intento: el silencio no borra lo ya logrado.
    despachar({ tipo: "TERMINAR", metrica: metricaRef.current(medidas) });
  }, [medidas]);

  const volverAlGuion = useCallback(() => {
    // El micrófono se APAGA antes de pisar el guion (pantalla del padre, regla dura 2).
    fuenteRef.current?.stop();
    fuenteRef.current = null;
    remedir();
    despachar({ tipo: "VOLVER_AL_GUION" });
  }, [remedir]);

  return {
    sesion,
    medidas,
    empezar,
    reintentarMic,
    recalibrar,
    continuarConRuido: useCallback(
      () => despachar({ tipo: "CONTINUAR_ASI" }),
      [],
    ),
    terminar,
    otraVez,
    volverAlGuion,
    cambiarCalma: useCallback(
      (activo: boolean) => despachar({ tipo: "CAMBIAR_CALMA", activo }),
      [],
    ),
    silenciar,
  };
}
