// GUARDA DEL BUCLE parlante→micrófono (ADR-010) — motor PURO. Mientras la app reproduce la voz
// familiar por los parlantes, el medidor debe IGNORAR los frames del micrófono: si no, el eco de
// esa voz contaría como voz del niño y el juego mentiría (regla dura 3).
//
// Es aritmética de reloj y nada más: quien la consume (use-voice-session) le pasa su "ahora"
// (performance.now()). Así el motor queda unit-testeable con relojes falsos, como todos los de
// lib/voice — sin storage, sin red, sin DOM.

/**
 * Cola tras el final del clip: el eco/reverberación del cuarto no muere exactamente con el
 * archivo, y los últimos frames del pipeline de audio llegan con retraso.
 */
export const COLA_ECO_MS = 300;

export type GuardaBucle = {
  /**
   * Silencia el medidor durante `ms` + la cola. Silencios superpuestos se ACUMULAN al más largo
   * (nunca se acorta una guarda viva por un clip corto posterior). `ms <= 0` CANCELA la guarda:
   * es el camino de "el play() falló y no sonó nada" — sin él, un autoplay bloqueado dejaría al
   * juego sordo a la voz real del niño sin que ningún sonido lo justifique.
   */
  silenciar(ms: number, ahora: number): void;
  /** ¿Deben ignorarse los frames en este instante? */
  activa(ahora: number): boolean;
};

export function crearGuardaBucle(): GuardaBucle {
  let hastaMs = 0;

  return {
    silenciar(ms, ahora) {
      hastaMs = ms <= 0 ? 0 : Math.max(hastaMs, ahora + ms + COLA_ECO_MS);
    },
    activa(ahora) {
      return ahora < hastaMs;
    },
  };
}
