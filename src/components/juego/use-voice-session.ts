"use client";

// Puente entre el micrófono (Web Audio) y la máquina de estados pura. Lo comparten los SEIS
// juegos de micrófono: el flujo (guion → permiso → calibración → jugar → celebración) es el mismo; lo único
// que cambia es qué mide cada uno (la métrica) y cuándo se cierra el intento (la meta).
//
// Los frames del medidor (~31/s) NO pasan por React: viven en refs y el juego los pinta a 60 fps
// mutando `transform` directamente. Solo las transiciones de fase (empezar a jugar, celebrar)
// disparan un render — así el juego se mantiene fluido en la tablet.

import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { crearCalibracion, type Calibracion } from "@/lib/voice/calibration";
import { AnalyserSource } from "@/lib/voice/analyser-source";
import { crearGuardaBucle } from "@/lib/voice/guarda-bucle";
import type { EstadoIntensidad } from "@/lib/voice/intensidad";
import { MicSession } from "@/lib/voice/mic-session";
import {
  crearMotores,
  frameEnSilencio,
  LECTURA_CERO,
  type LecturaMotores,
  type Motores,
} from "@/lib/voice/motores";
import type { Direccion } from "@/lib/voice/pitch-tracker";
import type { MeterFrame, MeterSource } from "@/lib/voice/types";
import type { Vocal } from "@/lib/voice/vocales";
import { DURACION_CALIBRACION_MS } from "@/lib/voice/calibration";
import {
  reducir,
  sesionInicial,
  type Metrica,
  type Sesion,
  type Turno,
} from "@/lib/session-flow";

/** Cadencia de las transiciones de fase. 100 ms es imperceptible y evita renders inútiles. */
const MS_POR_TICK = 100;

/**
 * Lo que el juego lee del micrófono. Dos dueños (S13, ADR-025): lo que MUEVE el dibujo sale del paquete
 * EN VIVO (todas las voces: el modelo del adulto se ve); los CONTADORES —lo que se cuenta, se muestra
 * como logro y se celebra— salen del paquete DEL NIÑO, que en «tu turno» solo oye silencio.
 */
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
  /** Mapa de las vocales (S10, experimental): la vocal estable de ahora y lo que ya se midió. */
  vocalActual: () => Vocal | null;
  vocalesZonas: () => number;
  vocalesCambios: () => number;
  /** Soplar (S12): ¿sopla ahora? (energía sin tono, sin siseo). */
  soplando: () => boolean;
  /** Soplos contados en el intento. */
  soplos: () => number;
  /** ms totales de soplo. */
  soploMs: () => number;
  /** 0..1 — fuerza del aire sobre el piso, para el dibujo (no se guarda). */
  fuerzaSoplo: () => number;
  /** Fuerte y suave (S12): suave, fuerte o silencio, medido contra el piso del cuarto. */
  nivelVoz: () => EstadoIntensidad["nivel"];
  /** 0..1 — altura de la barra. */
  alturaVoz: () => number;
  /** Cambios entre suave y fuerte. */
  cambiosVoz: () => number;
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
  /** El adulto pasa el turno con un toque en su franja (S13): nada adivina de quién es una voz. */
  cambiarTurno: (turno: Turno) => void;
  /**
   * Silencia el medidor por `ms` (+ cola): mientras la app REPRODUCE la voz familiar por los
   * parlantes, sus frames no deben contar como voz del niño (regla dura 3 — el juego mentiría).
   * `ms <= 0` cancela la guarda (el play falló: no sonó nada). Motor puro en
   * lib/voice/guarda-bucle (ADR-010), unit-tested.
   */
  silenciar: (ms: number) => void;
  /** The live meter source (the recognizer taps the real microphone session; null before it opens). */
  fuente: () => MeterSource | null;
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
  const calibracionRef = useRef<Calibracion | null>(null);
  // Dos paquetes de motores (S13): el en vivo mueve el dibujo, el del niño cuenta.
  const vivoRef = useRef<Motores | null>(null);
  const ninoRef = useRef<Motores | null>(null);
  // Lo último que leyeron (escalares: nada de audio, regla dura 2). La UI los pinta a 60 fps sin re-render.
  const vivoLecturaRef = useRef<LecturaMotores>(LECTURA_CERO);
  const ninoLecturaRef = useRef<LecturaMotores>(LECTURA_CERO);
  const progresoCalibracionRef = useRef(0);
  // El turno de ahora, legible desde el callback de audio sin re-suscribir nada.
  const turnoRef = useRef<Turno>(sesion.turno);
  useEffect(() => {
    turnoRef.current = sesion.turno;
  }, [sesion.turno]);
  // La fase actual, legible desde el callback de audio sin re-suscribir nada.
  const faseRef = useRef(sesion.actual.fase);
  useEffect(() => {
    faseRef.current = sesion.actual.fase;
  }, [sesion.actual.fase]);

  // Objeto estable de "lectores": las funciones leen los refs cuando se las llama (en el rAF del
  // escenario o en el reloj de ticks), nunca durante el render.
  const medidas: MedidasVivas = useMemo(() => {
    const vivo = () => vivoLecturaRef.current;
    const nino = () => ninoLecturaRef.current;
    return {
      // Lo que se mueve: todas las voces.
      nivel: () => vivo().nivel,
      vozActiva: () => vivo().vozActiva,
      alturaPitch: () => vivo().alturaPitch,
      direccionPitch: (): Direccion => vivo().direccionPitch,
      vocalActual: (): Vocal | null => vivo().vocalActual,
      soplando: () => vivo().soplo.soplando,
      fuerzaSoplo: () => vivo().soplo.fuerza,
      nivelVoz: (): EstadoIntensidad["nivel"] => vivo().intensidad.nivel,
      alturaVoz: () => vivo().intensidad.altura,
      progresoCalibracion: () => progresoCalibracionRef.current,
      // Lo que se cuenta: solo su turno.
      sostenidoMs: () => nino().sostenidoMs,
      mejorRachaMs: () => nino().mejorRachaMs,
      inversiones: () => nino().inversiones,
      vocalesZonas: () => nino().vocalesZonas,
      vocalesCambios: () => nino().vocalesCambios,
      soplos: () => nino().soplo.soplos,
      soploMs: () => nino().soplo.soploMs,
      cambiosVoz: () => nino().intensidad.cambios,
    };
  }, []);

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
        vivoRef.current = crearMotores(estado.pisoRuido);
        ninoRef.current = crearMotores(estado.pisoRuido);
        vivoLecturaRef.current = LECTURA_CERO;
        ninoLecturaRef.current = LECTURA_CERO;
        despachar(
          estado.ruidoAlto
            ? { tipo: "CALIBRACION_RUIDOSA", pisoRuido: estado.pisoRuido }
            : { tipo: "CALIBRACION_OK", pisoRuido: estado.pisoRuido },
        );
      }
      return;
    }

    if (fase === "esperando-voz" || fase === "jugando") {
      const vivo = vivoRef.current;
      const nino = ninoRef.current;
      if (!vivo || !nino) return;
      // Suena la voz familiar: se ignoran los frames para que su eco no cuente como voz del niño.
      if (guardaRef.current.activa(performance.now())) return;
      vivoLecturaRef.current = vivo.empujar(frame);
      // En «tu turno», para el paquete del niño el cuarto calla: nada de lo que suena se le cuenta.
      ninoLecturaRef.current = nino.empujar(
        turnoRef.current === "nino" ? frame : frameEnSilencio(frame),
      );
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
        // La fase y los turnos de él avanzan solo con SU voz: en «tu turno» lee el paquete del niño (que
        // oye silencio), así la cola de gracia del medidor en vivo no cuenta la voz del adulto como suya.
        vozActiva:
          turnoRef.current === "nino"
            ? ninoLecturaRef.current.vozActiva
            : vivoLecturaRef.current.vozActiva,
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
    vivoRef.current?.reiniciar();
    ninoRef.current?.reiniciar();
    vivoLecturaRef.current = LECTURA_CERO;
    ninoLecturaRef.current = LECTURA_CERO;
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
    fuente: () => fuenteRef.current,
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
    cambiarTurno: useCallback(
      (turno: Turno) => despachar({ tipo: "CAMBIAR_TURNO", turno }),
      [],
    ),
    silenciar,
  };
}
