// Reproducir un Blob de audio una sola vez, liberando SIEMPRE su ObjectURL — cuando termina, cuando
// falla, o cuando se cancela (remate S4: dedup de la copia que vivía en el estudio y en la voz
// familiar, + el revoke que faltaba si la navegación corta el clip a la mitad).
//
// La voz FAMILIAR (adultos) suena por aquí; el audio del niño JAMÁS toca este módulo (regla dura 2).

export type Reproduccion = {
  /** Resuelve a `true` si el audio de verdad sonó, `false` si el navegador lo bloqueó. */
  sono: Promise<boolean>;
  /** Para el clip y libera la URL. Idempotente. Llámala al desmontar para no filtrar la URL. */
  cancelar: () => void;
};

export function reproducirBlob(blob: Blob): Reproduccion {
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  let liberado = false;
  const liberar = () => {
    if (liberado) return;
    liberado = true;
    URL.revokeObjectURL(url);
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
    cancelar: () => {
      audio.pause();
      liberar();
    },
  };
}
