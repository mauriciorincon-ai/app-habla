"use client";

// «¿Dijo la palabra?» in a game (S11, ADR-023): connects the recognizer to a running microphone session
// and keeps the best thing it heard THIS round. It stores no audio and no text: only {word, confidence}
// in memory, and dies with the round. The adult's button stays the only way to a recognized word.

import { useCallback, useEffect, useRef, useState } from "react";
import type { Idioma } from "@/lib/idioma";
import { abrirMotor, cargar } from "@/lib/reconocer/modelo";
import { gramaticaDelJuego } from "@/lib/reconocer/vocabulario";
import { registrarRonda } from "@/lib/reconocer/conteo";
import { crearEscucha, type Escucha, type Oido } from "@/lib/voice/escucha";
import type { MicSession } from "@/lib/voice/mic-session";

const TASA_MODELO = 16_000;
/** The engine must be ready within this time, or the recognizer gives up (the game goes on without it). */
const ESPERA_MAXIMA_MS = 30_000;

/** Rejects if `p` does not settle in `ms` (the timer is always cleared). */
function conLimite<T>(p: Promise<T>, ms: number): Promise<T> {
  let t: ReturnType<typeof setTimeout>;
  const tope = new Promise<never>((_, no) => {
    t = setTimeout(() => no(new Error("tiempo-agotado")), ms);
  });
  return Promise.race([p, tope]).finally(() => clearTimeout(t));
}

export type EstadoReconocedor =
  | "apagado"
  | "cargando"
  | "escuchando"
  | "sin-modelo"
  | "error";

export type Reconocedor = {
  estado: EstadoReconocedor;
  /** The most confident word of the grammar heard in this round, or null. */
  oido: Oido | null;
  /** The best hearing of THIS word in this round (a louder, wrong word does not hide it), or null. */
  oidoDe: (palabra: string) => Oido | null;
  /** Connects to the mic session (call once the mic is open). No-op when the recognizer is off. */
  conectar: (mic: MicSession) => Promise<void>;
  /** Starts a new round: forgets what was heard. */
  nuevaRonda: () => void;
  /** Counts the round in the local 2×2 (only while listening). */
  contar: (coincidio: boolean, adultoSi: boolean) => void;
  desconectar: () => void;
};

export function useReconocedor(o: {
  juego: "palabras" | "gemelas";
  idioma: Idioma;
  activo: boolean;
}): Reconocedor {
  const [estado, setEstado] = useState<EstadoReconocedor>("apagado");
  const [oido, setOido] = useState<Oido | null>(null);
  const escuchaRef = useRef<Escucha | null>(null);
  const cierreRef = useRef<(() => void) | null>(null);
  const soltarRef = useRef<(() => void) | null>(null);
  const mejorRef = useRef<Oido | null>(null);
  const porPalabraRef = useRef<Map<string, Oido>>(new Map());
  // Each connect/disconnect bumps this: an async connect that is no longer current cleans up after itself.
  const generacionRef = useRef(0);
  const estadoRef = useRef<EstadoReconocedor>("apagado");

  const poner = useCallback((e: EstadoReconocedor) => {
    estadoRef.current = e;
    setEstado(e);
  }, []);

  const desconectar = useCallback(() => {
    generacionRef.current += 1;
    cierreRef.current?.();
    cierreRef.current = null;
    escuchaRef.current?.terminar();
    escuchaRef.current = null;
    soltarRef.current?.();
    soltarRef.current = null;
    mejorRef.current = null;
    porPalabraRef.current = new Map();
    setOido(null);
    poner("apagado");
  }, [poner]);

  useEffect(() => desconectar, [desconectar]);

  const { juego, idioma, activo } = o;
  const conectar = useCallback(
    async (mic: MicSession) => {
      if (!activo || escuchaRef.current || estadoRef.current === "cargando")
        return;
      poner("cargando");
      const generacion = (generacionRef.current += 1);
      const vigente = () => generacionRef.current === generacion;
      let soltar: (() => void) | null = null;
      let escucha: Escucha | null = null;
      try {
        const archivos = await cargar(idioma);
        if (!vigente()) return;
        if (!archivos) {
          poner("sin-modelo");
          return;
        }
        const motor = abrirMotor(idioma, archivos);
        soltar = motor.soltar;
        const tasa = mic.getContextInfo()?.sampleRate ?? TASA_MODELO;
        escucha = crearEscucha({
          motor: motor.worker,
          modelUrl: motor.modelUrl,
          wasmUrl: motor.wasmUrl,
          gramatica: gramaticaDelJuego(juego, idioma),
          sampleRate: TASA_MODELO,
          tasaEntrada: tasa,
          alOir: (h) => {
            const previa = porPalabraRef.current.get(h.palabra);
            if (!previa || h.conf > previa.conf) {
              porPalabraRef.current.set(h.palabra, h);
              const mejor = mejorRef.current;
              if (!mejor || h.conf > mejor.conf) mejorRef.current = h;
              setOido(mejorRef.current);
            }
          },
        });
        escuchaRef.current = escucha;
        soltarRef.current = soltar;
        await conLimite(escucha.lista, ESPERA_MAXIMA_MS);
        if (!vigente()) return; // desconectar() already ended the engine
        const cierre = await mic.abrirTapPcm(escucha.oir);
        if (!vigente()) {
          cierre();
          return;
        }
        cierreRef.current = cierre;
        poner("escuchando");
      } catch {
        if (!vigente()) {
          // A newer connect/disconnect owns the refs: end only what THIS call created.
          escucha?.terminar();
          soltar?.();
          return;
        }
        desconectar();
        poner("error");
      }
    },
    [activo, idioma, juego, poner, desconectar],
  );

  const nuevaRonda = useCallback(() => {
    mejorRef.current = null;
    porPalabraRef.current = new Map();
    setOido(null);
  }, []);
  // `oido` changes whenever something new is heard, so a reader of oidoDe() re-renders with it.
  const oidoDe = useCallback(
    (palabra: string) => porPalabraRef.current.get(palabra) ?? null,
    [],
  );
  const contar = useCallback((coincidio: boolean, adultoSi: boolean) => {
    if (estadoRef.current === "escuchando") registrarRonda(coincidio, adultoSi);
  }, []);

  return { estado, oido, oidoDe, conectar, nuevaRonda, contar, desconectar };
}
