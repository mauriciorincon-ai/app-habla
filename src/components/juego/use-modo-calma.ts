"use client";

// EL MODO CALMA DE UN TOQUE (S15, regla dura 6): un solo sitio que guarda el ajuste. Antes lo repetían
// el cohete y palabra↔objeto; ahora lo usan el marco común, gemelas y Hoy. Lo que se fija aquí es el
// ajuste de la familia (persiste); el juego de voz además lo refleja en su sesión con `alCambiar`.

import { useCallback } from "react";
import {
  ajustesActuales,
  guardarAjustesEnStore,
  useAjustes,
} from "@/components/estado-local";

/** Fija el modo calma de la familia (el ajuste que Ajustes también muestra). */
export function fijarModoCalma(activo: boolean): void {
  guardarAjustesEnStore({ ...ajustesActuales(), modoCalma: activo });
}

export function useModoCalma(alCambiar?: (activo: boolean) => void): {
  activo: boolean;
  alternar: () => void;
} {
  const ajustes = useAjustes();
  const activo = ajustes?.modoCalma ?? false;
  const alternar = useCallback(() => {
    const nuevo = !ajustesActuales().modoCalma;
    alCambiar?.(nuevo);
    fijarModoCalma(nuevo);
  }, [alCambiar]);
  return { activo, alternar };
}
