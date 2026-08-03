// Reproducir un Blob de audio una sola vez, liberando SIEMPRE su ObjectURL — cuando termina, cuando
// falla, o cuando se cancela (remate S4: dedup de la copia que vivía en el estudio y en la voz
// familiar, + el revoke que faltaba si la navegación corta el clip a la mitad).
//
// La voz FAMILIAR (adultos) suena por aquí; el audio del niño JAMÁS toca este módulo (regla dura 2).

export type OpcionesReproduccion = {
  /** Duración conocida del clip. Red de seguridad del avance: el webm de MediaRecorder llega sin
      duración legible en Chrome (`audio.duration === Infinity`, bug conocido). */
  duracionMs?: number;
  /** Se llama UNA vez cuando el clip deja de sonar — terminó, falló o lo cancelaron. */
  alTerminar?: () => void;
};

export type Reproduccion = {
  /** Resuelve a `true` si el audio de verdad sonó, `false` si el navegador lo bloqueó. */
  sono: Promise<boolean>;
  /** Avance 0..1 del clip — getter para leer en un rAF (gate S4, J3: la señal de que suena). */
  progreso: () => number;
  /** Para el clip y libera la URL. Idempotente. Llámala al desmontar para no filtrar la URL. */
  cancelar: () => void;
};

export function reproducirBlob(
  blob: Blob,
  opciones?: OpcionesReproduccion,
): Reproduccion {
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  let liberado = false;
  const liberar = () => {
    if (liberado) return;
    liberado = true;
    URL.revokeObjectURL(url);
    opciones?.alTerminar?.();
  };
  audio.addEventListener("ended", liberar);

  const sono = audio
    .play()
    .then(() => true)
    .catch(() => {
      liberar();
      return false;
    });

  return {
    sono,
    progreso: () => {
      const durMs =
        Number.isFinite(audio.duration) && audio.duration > 0
          ? audio.duration * 1000
          : (opciones?.duracionMs ?? 0);
      if (!durMs) return 0;
      return Math.min(1, (audio.currentTime * 1000) / durMs);
    },
    cancelar: () => {
      audio.pause();
      liberar();
    },
  };
}
