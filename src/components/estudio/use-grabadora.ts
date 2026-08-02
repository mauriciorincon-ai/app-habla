"use client";

// Hook de grabación del estudio (Outcome 1). Envuelve MediaRecorder + getUserMedia con una máquina
// de estados clara para la UI. Graba SOLO al adulto (el copy lo deja explícito) y entrega un Blob
// que el estudio guarda en el banco LOCAL — nunca hay una llamada de red aquí (e2e cero-red lo
// vigila). La grabación real del micrófono se probó viable en el spike de F0.

import { useCallback, useRef, useState } from "react";

export type EstadoGrabadora =
  "inactivo" | "pidiendo-permiso" | "grabando" | "denegado" | "error";

export type Captura = { blob: Blob; mimeType: string; duracionMs: number };

/** El mejor contenedor que soporte el dispositivo (spike F0: Chrome/Android → webm/opus). */
function mejorMime(): string {
  if (typeof MediaRecorder === "undefined") return "";
  for (const m of ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"]) {
    if (MediaRecorder.isTypeSupported(m)) return m;
  }
  return "";
}

export function useGrabadora() {
  const [estado, setEstado] = useState<EstadoGrabadora>("inactivo");
  const recRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const trozosRef = useRef<Blob[]>([]);
  const inicioRef = useRef<number>(0);
  // Medidor en vivo (gate S4, stopper J2): un AnalyserNode SOLO para MIRAR el nivel mientras se
  // graba ("¿ya empezó? ¿me está oyendo?"). Análisis en memoria y nada más: no se conecta a la
  // salida (no suena), no persiste, y muere con la grabación.
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analizadorRef = useRef<AnalyserNode | null>(null);
  const muestrasRef = useRef<Float32Array<ArrayBuffer> | null>(null);

  const cerrarAnalisis = useCallback(() => {
    void audioCtxRef.current?.close().catch(() => undefined);
    audioCtxRef.current = null;
    analizadorRef.current = null;
    muestrasRef.current = null;
  }, []);

  /**
   * Nivel de voz instantáneo 0..1 para la barra (RMS normalizado: hablar normal la mueve bien).
   * Getter para leer en un rAF — no dispara renders.
   */
  const nivel = useCallback(() => {
    const analizador = analizadorRef.current;
    const muestras = muestrasRef.current;
    if (!analizador || !muestras) return 0;
    analizador.getFloatTimeDomainData(muestras);
    let suma = 0;
    for (let i = 0; i < muestras.length; i++) suma += muestras[i] * muestras[i];
    const rms = Math.sqrt(suma / muestras.length);
    return Math.min(1, rms * 8);
  }, []);

  const empezar = useCallback(async () => {
    setEstado("pidiendo-permiso");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = mejorMime();
      const rec = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined,
      );
      trozosRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) trozosRef.current.push(e.data);
      };
      recRef.current = rec;
      inicioRef.current = performance.now();
      rec.start();
      // El medidor mira el MISMO stream que ya se está grabando: cero permisos extra.
      const ctx = new AudioContext();
      const analizador = ctx.createAnalyser();
      analizador.fftSize = 2048;
      ctx.createMediaStreamSource(stream).connect(analizador);
      audioCtxRef.current = ctx;
      analizadorRef.current = analizador;
      muestrasRef.current = new Float32Array(analizador.fftSize);
      setEstado("grabando");
    } catch (e) {
      // Permiso negado vs. cualquier otro fallo (sin micrófono, hardware ocupado).
      setEstado(
        e instanceof DOMException && e.name === "NotAllowedError"
          ? "denegado"
          : "error",
      );
    }
  }, []);

  /** Detiene y entrega la captura (o null si algo salió mal). Libera el micrófono siempre. */
  const detener = useCallback((): Promise<Captura | null> => {
    const rec = recRef.current;
    if (!rec || estado !== "grabando") return Promise.resolve(null);
    return new Promise((res) => {
      rec.onstop = () => {
        const duracionMs = Math.round(performance.now() - inicioRef.current);
        const mimeType = rec.mimeType || "audio/webm";
        const blob = new Blob(trozosRef.current, { type: mimeType });
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        recRef.current = null;
        cerrarAnalisis();
        setEstado("inactivo");
        res(blob.size > 0 ? { blob, mimeType, duracionMs } : null);
      };
      rec.stop();
    });
  }, [estado, cerrarAnalisis]);

  /** Cancela sin entregar nada (p. ej. al salir de la pantalla). Libera el micrófono. */
  const cancelar = useCallback(() => {
    try {
      recRef.current?.stop();
    } catch {
      // ya estaba detenido
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    recRef.current = null;
    cerrarAnalisis();
    setEstado("inactivo");
  }, [cerrarAnalisis]);

  return { estado, empezar, detener, cancelar, nivel };
}
