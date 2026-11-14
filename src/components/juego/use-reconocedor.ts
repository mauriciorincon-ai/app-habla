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

export type EstadoReconocedor =
  | "apagado"
  | "cargando"
  | "escuchando"
  | "sin-modelo"
  | "error";

export type Reconocedor = {
  estado: EstadoReconocedor;
  /** The best word of the grammar heard in this round, or null. */
  oido: Oido | null;
  /** Connects to the mic session (call once the mic is open). No-op when the recognizer is off. */
  conectar: (mic: MicSession) => Promise<void>;
  /** The round is closing: the recognizer says what it still has. */
  cerrarFrase: () => void;
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
  const estadoRef = useRef<EstadoReconocedor>("apagado");

  const poner = useCallback((e: EstadoReconocedor) => {
    estadoRef.current = e;
    setEstado(e);
  }, []);

  const desconectar = useCallback(() => {
    cierreRef.current?.();
    cierreRef.current = null;
    escuchaRef.current?.terminar();
    escuchaRef.current = null;
    soltarRef.current?.();
    soltarRef.current = null;
    mejorRef.current = null;
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
      try {
        const archivos = await cargar(idioma);
        if (!archivos) {
          poner("sin-modelo");
          return;
        }
        const motor = abrirMotor(idioma, archivos);
        soltarRef.current = motor.soltar;
        const tasa = mic.getContextInfo()?.sampleRate ?? TASA_MODELO;
        const escucha = crearEscucha({
          motor: motor.worker,
          modelUrl: motor.modelUrl,
          wasmUrl: motor.wasmUrl,
          gramatica: gramaticaDelJuego(juego, idioma),
          sampleRate: TASA_MODELO,
          tasaEntrada: tasa,
          alOir: (h) => {
            const mejor = mejorRef.current;
            if (!mejor || h.conf > mejor.conf) {
              mejorRef.current = h;
              setOido(h);
            }
          },
        });
        escuchaRef.current = escucha;
        await escucha.lista;
        cierreRef.current = await mic.abrirTapPcm(escucha.oir);
        poner("escuchando");
      } catch {
        desconectar();
        poner("error");
      }
    },
    [activo, idioma, juego, poner, desconectar],
  );

  const cerrarFrase = useCallback(() => escuchaRef.current?.cerrarFrase(), []);
  const nuevaRonda = useCallback(() => {
    mejorRef.current = null;
    setOido(null);
  }, []);
  const contar = useCallback((coincidio: boolean, adultoSi: boolean) => {
    if (estadoRef.current === "escuchando") registrarRonda(coincidio, adultoSi);
  }, []);

  return { estado, oido, conectar, cerrarFrase, nuevaRonda, contar, desconectar };
}
