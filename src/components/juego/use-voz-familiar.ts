"use client";

// VOZ FAMILIAR (Outcome 2) — el puente entre el banco de voz y los juegos. Decide, con el resolver
// PURO, si un ítem suena con la voz grabada de la familia y lo reproduce, avisando ANTES al medidor
// para que su eco por los parlantes NO cuente como voz del niño (la guarda del bucle, ADR-010).
//
// El fallback es silencioso y SIEMPRE seguro: si no hay grabación, o el padre apagó la voz familiar,
// `disponible` es false (el altavoz no se muestra) y `reproducir` es un no-op — nunca un error ni un
// silencio roto: es la app como sonaba antes (texto sin voz).

import { useCallback, useEffect, useRef, useState } from "react";
import { useAjustes } from "@/components/estado-local";
import { listarIds, obtenerGrabacion } from "@/lib/banco-voz/almacen";
import { resolverFuente } from "@/lib/audio/resolver";

export type VozFamiliar = {
  /** ¿Este ítem tiene grabación Y el padre dejó activa la voz familiar? (decide si mostrar el altavoz). */
  disponible: (id: string) => boolean;
  /** Reproduce la grabación del ítem (no-op seguro si no aplica). Devuelve si de verdad sonó. */
  reproducir: (id: string) => Promise<boolean>;
};

export function useVozFamiliar(opts?: {
  /**
   * Se llama con la duración (ms) ANTES de sonar. El juego con micrófono pasa aquí su `silenciar`:
   * pausa el medidor ese rato para que el eco de la voz familiar no cuente como voz del niño
   * (regla dura 3). Gemelas no tiene micrófono → no pasa nada y no hay guarda que hacer.
   */
  alSonar?: (duracionMs: number) => void;
}): VozFamiliar {
  const ajustes = useAjustes();
  // Default true: si el padre grabó su voz, que se oiga (coherente con AjustesSchema.vozFamiliar).
  const vozFamiliarActiva = ajustes?.vozFamiliar ?? true;

  // Qué ítems tienen grabación. Se carga una vez al montar el juego; el banco no cambia a mitad
  // de una sesión de juego (grabar es otra pantalla).
  const [ids, setIds] = useState<Set<string>>(new Set());
  useEffect(() => {
    let vivo = true;
    void listarIds().then((lista) => {
      if (vivo) setIds(new Set(lista));
    });
    return () => {
      vivo = false;
    };
  }, []);

  const alSonarRef = useRef(opts?.alSonar);
  useEffect(() => {
    alSonarRef.current = opts?.alSonar;
  });

  const disponible = useCallback(
    (id: string): boolean =>
      resolverFuente({ tieneGrabacion: ids.has(id), vozFamiliarActiva }) ===
      "familiar",
    [ids, vozFamiliarActiva],
  );

  const reproducir = useCallback(
    async (id: string): Promise<boolean> => {
      if (!disponible(id)) return false;
      const grabacion = await obtenerGrabacion(id);
      if (!grabacion) return false;

      // Avisar al medidor ANTES de sonar: su eco por los parlantes no debe contar como voz del
      // niño (regla dura 3, guarda del bucle — ADR-010).
      alSonarRef.current?.(grabacion.duracionMs);

      const url = URL.createObjectURL(grabacion.blob);
      const audio = new Audio(url);
      audio.addEventListener("ended", () => URL.revokeObjectURL(url));

      // Señal observable para el e2e (y sondas de depuración): sonó la voz familiar de este ítem.
      // NO lleva audio ni contenido: solo el id del ítem (regla dura 2 — nada del niño sale de aquí).
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("voz-familiar:sono", { detail: { id } }),
        );
      }

      try {
        await audio.play();
        return true;
      } catch {
        // Autoplay bloqueado o sin permiso de audio: fallback silencioso, jamás un error visible.
        URL.revokeObjectURL(url);
        return false;
      }
    },
    [disponible],
  );

  return { disponible, reproducir };
}
