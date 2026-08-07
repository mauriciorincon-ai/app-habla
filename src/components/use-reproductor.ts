"use client";

// Reproductor de blobs con limpieza automática: corta el clip anterior al empezar uno nuevo y, al
// desmontar el componente, libera la URL del clip en curso (remate S4: revoke al navegar a mitad de
// clip). Lo usa el estudio para "Escuchar" las grabaciones de la familia.
//
// Gate S4 (J3): además de sonar, DICE que suena — expone qué clave está sonando y un getter de
// avance 0..1 para pintar una barrita en un rAF (mismo patrón del medidor de grabación).

import { useCallback, useEffect, useRef, useState } from "react";
import { reproducirBlob } from "@/lib/audio/reproducir";

export type Reproductor = {
  reproducir: (
    blob: Blob,
    opciones?: { clave?: string; duracionMs?: number },
  ) => void;
  /** Clave del clip que suena ahora mismo, o null si hay silencio. */
  sonando: string | null;
  /** Avance 0..1 del clip en curso — getter para leer en un rAF, no dispara renders. */
  progreso: () => number;
};

export function useReproductor(): Reproductor {
  const cancelarRef = useRef<(() => void) | null>(null);
  const progresoRef = useRef<() => number>(() => 0);
  const [sonando, setSonando] = useState<string | null>(null);

  useEffect(() => () => cancelarRef.current?.(), []);

  const reproducir = useCallback(
    (blob: Blob, opciones?: { clave?: string; duracionMs?: number }) => {
      cancelarRef.current?.(); // corta lo que estuviera sonando (su alTerminar limpia su clave)
      const clave = opciones?.clave ?? "clip";
      const r = reproducirBlob(blob, {
        duracionMs: opciones?.duracionMs,
        alTerminar: () => setSonando((s) => (s === clave ? null : s)),
      });
      cancelarRef.current = r.cancelar;
      progresoRef.current = r.progreso;
      setSonando(clave);
    },
    [],
  );

  const progreso = useCallback(() => progresoRef.current(), []);

  return { reproducir, sonando, progreso };
}
