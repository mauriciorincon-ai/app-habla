import { useSyncExternalStore } from "react";

const suscribir = () => () => {};

/**
 * `false` en el render del servidor y en el primer render del cliente; `true` tras hidratar.
 * Los botones que abren el micrófono nacen deshabilitados hasta entonces: un clic anterior a la
 * hidratación se perdería en silencio (lección del spike; también rompía el e2e).
 */
export function useHidratado(): boolean {
  return useSyncExternalStore(
    suscribir,
    () => true,
    () => false,
  );
}
