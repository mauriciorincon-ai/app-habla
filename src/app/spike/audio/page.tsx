"use client";

// Página de diagnóstico del audio — sobrevive hasta cerrar el ADR 003 (gate de tablet).
// Objetivo S1 (riesgo #1): latencia percibida, estabilidad del worklet, constraints reales del
// track (getSettings) y piso de ruido de la casa.
// Objetivo S2 (riesgo #1 del sprint, ADR 007): ¿el PITCH es estable con voz real? La página
// muestra F0 en vivo + el rango medido — es el dato que decide si el cohete va por tono o
// degrada honesto a energía. Nada se graba: RMS y F0 son escalares que mueren en pantalla.

import { useEffect, useRef, useState } from "react";
import { useHidratado } from "@/components/use-hidratado";
import { AnalyserSource } from "@/lib/voice/analyser-source";
import { MicSession } from "@/lib/voice/mic-session";
import {
  PITCH_MAX_HZ,
  PITCH_MIN_HZ,
  crearPitchTracker,
  type PitchTracker,
} from "@/lib/voice/pitch-tracker";
import type { MeterFrame, MeterSource } from "@/lib/voice/types";

type Motor = "worklet" | "analyser";

type Stats = {
  rms: number;
  piso: number;
  framesPorSegundo: number;
  totalFrames: number;
  /** F0 crudo del worklet (lo que YIN vio) y F0 suavizado (lo que el cohete usaría). */
  pitchCrudo: number | null;
  pitchSuave: number | null;
  pitchMin: number | null;
  pitchMax: number | null;
  /** % de frames CON voz que trajeron un pitch confiable: la medida de estabilidad del ADR 007. */
  cobertura: number;
  inversiones: number;
};

export default function SpikeAudioPage() {
  const [estado, setEstado] = useState<"inactivo" | "activo" | "error">(
    "inactivo",
  );
  const [motor, setMotor] = useState<Motor | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats>({
    rms: 0,
    piso: 1,
    framesPorSegundo: 0,
    totalFrames: 0,
    pitchCrudo: null,
    pitchSuave: null,
    pitchMin: null,
    pitchMax: null,
    cobertura: 0,
    inversiones: 0,
  });

  // El botón nace deshabilitado hasta que React hidrata: un clic pre-hidratación se perdería
  // en silencio (y Playwright espera solo a botones habilitados).
  const listo = useHidratado();

  const sourceRef = useRef<MeterSource | null>(null);
  const frameRef = useRef<MeterFrame | null>(null);
  const pisoRef = useRef(1);
  const totalRef = useRef(0);
  const ventanaRef = useRef(0);
  const barRef = useRef<HTMLDivElement | null>(null);
  const barPitchRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number>(0);

  // Pitch (ADR 007): el tracker puro corre aquí igual que correría en el juego.
  const trackerRef = useRef<PitchTracker | null>(null);
  const pitchMinRef = useRef<number | null>(null);
  const pitchMaxRef = useRef<number | null>(null);
  const framesConVozRef = useRef(0);
  const framesConPitchRef = useRef(0);

  /** Umbral simple de "hay voz" para el spike (el juego usa el piso calibrado de verdad). */
  const RMS_VOZ = 0.02;

  useEffect(() => {
    // Barras a 60 fps: mutan el DOM directamente desde el último frame (sin re-render).
    const pintar = () => {
      const frame = frameRef.current;
      if (frame && barRef.current) {
        const escala = Math.min(1, frame.rms * 8);
        barRef.current.style.transform = `scaleX(${escala})`;
      }
      if (barPitchRef.current) {
        const altura = trackerRef.current?.estado().altura ?? 0;
        barPitchRef.current.style.transform = `scaleX(${altura})`;
      }
      rafRef.current = requestAnimationFrame(pintar);
    };
    rafRef.current = requestAnimationFrame(pintar);

    // Números a 4 fps (legibles).
    const intervalo = setInterval(() => {
      const frame = frameRef.current;
      const pitch = trackerRef.current?.estado();
      const conVoz = framesConVozRef.current;
      setStats({
        rms: frame?.rms ?? 0,
        piso: pisoRef.current === 1 ? 0 : pisoRef.current,
        framesPorSegundo: ventanaRef.current * 4,
        totalFrames: totalRef.current,
        pitchCrudo: frame?.pitchHz ?? null,
        pitchSuave: pitch?.pitchHz ?? null,
        pitchMin: pitchMinRef.current,
        pitchMax: pitchMaxRef.current,
        cobertura:
          conVoz === 0
            ? 0
            : Math.round((framesConPitchRef.current / conVoz) * 100),
        inversiones: pitch?.inversiones ?? 0,
      });
      ventanaRef.current = 0;
    }, 250);

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearInterval(intervalo);
      sourceRef.current?.stop();
    };
  }, []);

  const onFrame = (frame: MeterFrame) => {
    frameRef.current = frame;
    totalRef.current += 1;
    ventanaRef.current += 1;
    if (frame.rms > 0 && frame.rms < pisoRef.current) {
      pisoRef.current = frame.rms;
    }

    // Pitch: mismo camino que en el juego (gating por energía → tracker puro).
    const hayVoz = frame.rms >= RMS_VOZ;
    if (hayVoz) {
      framesConVozRef.current += 1;
      if (frame.pitchHz !== null) framesConPitchRef.current += 1;
    }
    const estado = trackerRef.current?.empujar(frame, hayVoz);
    if (estado?.pitchHz != null) {
      const hz = estado.pitchHz;
      if (pitchMinRef.current === null || hz < pitchMinRef.current) {
        pitchMinRef.current = hz;
      }
      if (pitchMaxRef.current === null || hz > pitchMaxRef.current) {
        pitchMaxRef.current = hz;
      }
    }
  };

  async function empezar() {
    setError(null);
    setInfo(null);
    pisoRef.current = 1;
    totalRef.current = 0;
    trackerRef.current = crearPitchTracker();
    pitchMinRef.current = null;
    pitchMaxRef.current = null;
    framesConVozRef.current = 0;
    framesConPitchRef.current = 0;

    const mic = new MicSession();
    mic.subscribe(onFrame);
    try {
      await mic.start();
      sourceRef.current = mic;
      setMotor("worklet");
      setEstado("activo");
      const settings = mic.getTrackSettings();
      const ctx = mic.getContextInfo();
      setInfo(JSON.stringify({ ...ctx, settings }, null, 2));
      return;
    } catch (e) {
      // Fallback documentado: AnalyserNode + rAF (ADR 003).
      setInfo(
        `Worklet falló (${e instanceof Error ? e.message : "?"}); probando fallback…`,
      );
    }

    const analyser = new AnalyserSource();
    analyser.subscribe(onFrame);
    try {
      await analyser.start();
      sourceRef.current = analyser;
      setMotor("analyser");
      setEstado("activo");
    } catch (e) {
      setEstado("error");
      setError(
        e instanceof Error ? `${e.name}: ${e.message}` : "Error desconocido",
      );
    }
  }

  function detener() {
    sourceRef.current?.stop();
    sourceRef.current = null;
    frameRef.current = null;
    trackerRef.current = null;
    setEstado("inactivo");
    setMotor(null);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-6 p-6">
      <h1 className="font-display text-3xl">Spike de audio</h1>
      <p className="text-tinta-suave text-sm">
        Página de diagnóstico: valida el medidor (RMS) y el seguidor de tono
        (F0) con un micrófono real. Nada se graba ni sale del dispositivo: son
        dos números que se calculan en vivo y mueren en pantalla.
      </p>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={estado === "activo" ? detener : empezar}
          disabled={!listo}
          className="bg-acento text-sobre-acento min-h-11 rounded-xl px-6 font-medium disabled:opacity-50"
          data-testid="spike-toggle"
        >
          {estado === "activo" ? "Detener" : "Empezar"}
        </button>
      </div>

      <section
        className="bg-superficie rounded-2xl p-4 shadow-tarjeta"
        aria-live="polite"
      >
        <div
          className="mb-2 flex justify-between font-mono text-xs"
          data-testid="spike-estado"
        >
          <span>estado: {estado}</span>
          <span data-testid="spike-motor">motor: {motor ?? "—"}</span>
        </div>
        <div className="bg-acento-suave h-6 overflow-hidden rounded-full">
          <div
            ref={barRef}
            className="bg-acento h-full w-full origin-left rounded-full"
            style={{ transform: "scaleX(0)" }}
          />
        </div>
        <dl
          className="mt-3 grid grid-cols-2 gap-1 font-mono text-xs"
          data-testid="spike-stats"
        >
          <dt>rms</dt>
          <dd data-testid="spike-rms">{stats.rms.toFixed(4)}</dd>
          <dt>piso (mín. sesión)</dt>
          <dd>{stats.piso.toFixed(4)}</dd>
          <dt>frames/s</dt>
          <dd data-testid="spike-fps">{stats.framesPorSegundo}</dd>
          <dt>frames totales</dt>
          <dd>{stats.totalFrames}</dd>
        </dl>
      </section>

      {/* Panel de PITCH (ADR 007): lo que decide si el cohete va por tono. */}
      <section
        className="bg-superficie shadow-tarjeta rounded-2xl p-4"
        aria-live="polite"
        data-testid="spike-pitch"
      >
        <p className="mb-2 font-mono text-xs">
          tono (F0) · rango del juego: {PITCH_MIN_HZ}–{PITCH_MAX_HZ} Hz
        </p>
        <div className="bg-acento-suave h-6 overflow-hidden rounded-full">
          <div
            ref={barPitchRef}
            className="bg-celebracion h-full w-full origin-left rounded-full"
            style={{ transform: "scaleX(0)" }}
          />
        </div>
        <dl className="mt-3 grid grid-cols-2 gap-1 font-mono text-xs">
          <dt>F0 crudo (YIN)</dt>
          <dd data-testid="spike-pitch-crudo">
            {stats.pitchCrudo === null
              ? "—"
              : `${stats.pitchCrudo.toFixed(1)} Hz`}
          </dd>
          <dt>F0 suavizado</dt>
          <dd data-testid="spike-pitch-suave">
            {stats.pitchSuave === null
              ? "—"
              : `${stats.pitchSuave.toFixed(1)} Hz`}
          </dd>
          <dt>rango medido</dt>
          <dd>
            {stats.pitchMin === null || stats.pitchMax === null
              ? "—"
              : `${stats.pitchMin.toFixed(0)}–${stats.pitchMax.toFixed(0)} Hz`}
          </dd>
          <dt>cobertura (frames con voz)</dt>
          <dd data-testid="spike-cobertura">{stats.cobertura}%</dd>
          <dt>inversiones (subió y bajó)</dt>
          <dd data-testid="spike-inversiones">{stats.inversiones}</dd>
        </dl>
        <p className="text-tinta-suave mt-3 text-xs">
          Prueba a decir “aaaah” subiendo y bajando la voz como una sirena: la
          barra de tono debe seguirte, y las inversiones deben contar cada vez
          que cambias de sentido. Con ruido de fondo (sin hablar), el F0 debe
          quedarse en “—”.
        </p>
      </section>

      {info ? (
        <pre className="bg-superficie overflow-x-auto rounded-2xl p-4 font-mono text-xs">
          {info}
        </pre>
      ) : null}
      {error ? (
        <p className="text-peligro font-mono text-sm" data-testid="spike-error">
          {error}
        </p>
      ) : null}
    </main>
  );
}
