"use client";

// El tope diario de juego, en la página (S12, ADR-024). La lógica es pura (src/lib/pantalla/tope.ts);
// aquí solo corre el reloj mientras se juega y se guarda lo que ya pasó.
//
// Mientras `jugando` y la pestaña esté visible, suma el tiempo de cada segundo al contador local de HOY.
// Al llegar al tope —una sola vez al día— marca el aviso como visto, avisa al adulto y llama a
// `alAlcanzar`, que cierra el juego con calma, igual que «Salir». Después de ese aviso no vuelve a cortar:
// el adulto decide si sigue. Nunca bloquea y jamás le habla al niño.

import { useEffect, useRef, useState } from "react";
import { fechaHoy } from "@/lib/fecha";
import {
  acumular,
  debeAvisar,
  lineaHoyVisible,
  marcarAvisado,
  minutosJugados,
} from "@/lib/pantalla/tope";
import { guardarPantalla, leerPantalla } from "@/lib/storage/local";

const CADA_MS = 1000;

export function useTopePantalla({
  jugando,
  topeMinutos,
  alAlcanzar,
}: {
  jugando: boolean;
  topeMinutos: number;
  alAlcanzar: () => void;
}): { avisoMinutos: number | null } {
  const [avisoMinutos, setAvisoMinutos] = useState<number | null>(null);
  const alAlcanzarRef = useRef(alAlcanzar);
  useEffect(() => {
    alAlcanzarRef.current = alAlcanzar;
  }, [alAlcanzar]);

  useEffect(() => {
    if (!jugando) return;
    let previo = performance.now();
    let primero = true;
    const id = setInterval(() => {
      // Un intento nuevo parte sin aviso (el de antes ya lo leyó el adulto): se limpia en el primer segundo.
      if (primero) {
        primero = false;
        setAvisoMinutos(null);
      }
      const ahora = performance.now();
      const delta = ahora - previo;
      previo = ahora;
      if (document.visibilityState !== "visible") return;
      const hoy = fechaHoy();
      let estado = acumular(leerPantalla(), hoy, delta);
      if (debeAvisar(estado, hoy, topeMinutos)) {
        estado = marcarAvisado(estado, hoy);
        guardarPantalla(estado);
        setAvisoMinutos(minutosJugados(estado, hoy));
        alAlcanzarRef.current();
        return;
      }
      guardarPantalla(estado);
    }, CADA_MS);
    return () => clearInterval(id);
  }, [jugando, topeMinutos]);

  return { avisoMinutos };
}

/** Minutos jugados hoy en este dispositivo (se lee al pintar el guion; el juego ya está hidratado). */
export function minutosDeHoy(): number {
  return minutosJugados(leerPantalla(), fechaHoy());
}

/** ¿Toca la línea «hoy ya jugaron N min» en el guion? (el aviso ya se vio hoy y el tope sigue alcanzado). */
export function hayLineaHoy(topeMinutos: number): boolean {
  return lineaHoyVisible(leerPantalla(), fechaHoy(), topeMinutos);
}
