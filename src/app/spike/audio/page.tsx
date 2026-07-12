"use client";

// Página TEMPORAL del spike de audio (riesgo #1) — se elimina antes del merge final.
// Objetivo: validar en la tablet Android real: latencia percibida, estabilidad del worklet,
// constraints reales del track (getSettings) y piso de ruido de la casa. Resultado → ADR 003.

import { useEffect, useRef, useState } from "react";
import { useHidratado } from "@/components/use-hidratado";
import { AnalyserSource } from "@/lib/voice/analyser-source";
import { MicSession } from "@/lib/voice/mic-session";
import type { MeterFrame, MeterSource } from "@/lib/voice/types";

type Motor = "worklet" | "analyser";

type Stats = {
  rms: number;
  piso: number;
  framesPorSegundo: number;
  totalFrames: number;
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
  const rafRef = useRef<number>(0);

  useEffect(() => {
    // Barra a 60 fps: muta el DOM directamente desde el último frame (sin re-render).
    const pintar = () => {
      const frame = frameRef.current;
      if (frame && barRef.current) {
        const escala = Math.min(1, frame.rms * 8);
        barRef.current.style.transform = `scaleX(${escala})`;
      }
      rafRef.current = requestAnimationFrame(pintar);
    };
    rafRef.current = requestAnimationFrame(pintar);

    // Números a 4 fps (legibles).
    const intervalo = setInterval(() => {
      const frame = frameRef.current;
      setStats({
        rms: frame?.rms ?? 0,
        piso: pisoRef.current === 1 ? 0 : pisoRef.current,
        framesPorSegundo: ventanaRef.current * 4,
        totalFrames: totalRef.current,
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
  };

  async function empezar() {
    setError(null);
    setInfo(null);
    pisoRef.current = 1;
    totalRef.current = 0;

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
    setEstado("inactivo");
    setMotor(null);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-6 p-6">
      <h1 className="font-display text-3xl">Spike de audio</h1>
      <p className="text-tinta-suave text-sm">
        Página temporal para validar el medidor en la tablet real. Nada se graba
        ni sale del dispositivo: solo se calcula un número (RMS) en vivo.
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
