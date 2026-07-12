// Orquestación de la sesión de juego: guion → permiso → calibración → juego → celebración.
// Reducer PURO (sin efectos, sin audio, sin DOM): la UI despacha eventos y pinta el estado.
//
// Reglas del producto codificadas aquí (COGA):
//   - No hay game-over, ni límite de tiempo, ni estado terminal "malo": mic denegado, ruido alto
//     y silencio largo tienen salida amable.
//   - "Sin voz por un rato" NO es un estado: es un selector derivado (invitacionAmable). Así la
//     invitación aparece y desaparece sin transiciones-trampa de las que haya que salir.
//   - En modo calma no hay meta ni celebración automática: se cierra suave cuando el padre quiera.

export type Ajustes = {
  modoCalma: boolean;
};

export type Fase =
  | { fase: "guion" }
  | { fase: "pidiendo-mic" }
  | { fase: "mic-denegado" }
  | { fase: "calibrando"; msTranscurridos: number }
  | { fase: "ruido-alto"; pisoRuido: number }
  | { fase: "esperando-voz"; pisoRuido: number; msSinVoz: number }
  | { fase: "jugando"; pisoRuido: number; sostenidoMs: number; metaMs: number }
  | { fase: "celebracion"; sostenidoMs: number };

export type Sesion = {
  ajustes: Ajustes;
  actual: Fase;
};

export type Evento =
  | { tipo: "EMPEZAR" }
  | { tipo: "MIC_OK" }
  | { tipo: "MIC_DENEGADO" }
  | { tipo: "REINTENTAR_MIC" }
  | { tipo: "CALIBRACION_PROGRESO"; msTranscurridos: number }
  | { tipo: "CALIBRACION_OK"; pisoRuido: number }
  | { tipo: "CALIBRACION_RUIDOSA"; pisoRuido: number }
  | { tipo: "CONTINUAR_ASI" }
  | { tipo: "RECALIBRAR" }
  | { tipo: "TICK"; deltaMs: number; vozActiva: boolean; sostenidoMs: number }
  | { tipo: "TERMINAR" }
  | { tipo: "OTRA_VEZ" }
  | { tipo: "CAMBIAR_CALMA"; activo: boolean };

/** Meta del juego: sostener la voz este tiempo. Sin castigo si no se llega — solo se sigue. */
export const META_MS_DEFECTO = 3000;

/** Tras este silencio en "esperando-voz", la UI invita amablemente (jamás regaña). */
export const MS_PARA_INVITAR = 20_000;

export function sesionInicial(ajustes: Ajustes = { modoCalma: false }): Sesion {
  return { ajustes, actual: { fase: "guion" } };
}

export function reducir(sesion: Sesion, evento: Evento): Sesion {
  // El modo calma se puede cambiar en cualquier fase (1 toque) sin perder el progreso.
  if (evento.tipo === "CAMBIAR_CALMA") {
    return {
      ...sesion,
      ajustes: { ...sesion.ajustes, modoCalma: evento.activo },
    };
  }

  // Recalibrar es un derecho permanente: en 1 toque, desde donde sea (menos antes del permiso).
  if (evento.tipo === "RECALIBRAR") {
    const fase = sesion.actual.fase;
    if (
      fase === "ruido-alto" ||
      fase === "esperando-voz" ||
      fase === "jugando"
    ) {
      return { ...sesion, actual: { fase: "calibrando", msTranscurridos: 0 } };
    }
    return sesion;
  }

  const actual = sesion.actual;

  switch (actual.fase) {
    case "guion":
      return evento.tipo === "EMPEZAR"
        ? avanzar(sesion, { fase: "pidiendo-mic" })
        : sesion;

    case "pidiendo-mic":
      if (evento.tipo === "MIC_OK") {
        return avanzar(sesion, { fase: "calibrando", msTranscurridos: 0 });
      }
      if (evento.tipo === "MIC_DENEGADO") {
        return avanzar(sesion, { fase: "mic-denegado" });
      }
      return sesion;

    case "mic-denegado":
      return evento.tipo === "REINTENTAR_MIC"
        ? avanzar(sesion, { fase: "pidiendo-mic" })
        : sesion;

    case "calibrando":
      if (evento.tipo === "CALIBRACION_PROGRESO") {
        return avanzar(sesion, {
          fase: "calibrando",
          msTranscurridos: evento.msTranscurridos,
        });
      }
      if (evento.tipo === "CALIBRACION_OK") {
        return avanzar(sesion, {
          fase: "esperando-voz",
          pisoRuido: evento.pisoRuido,
          msSinVoz: 0,
        });
      }
      if (evento.tipo === "CALIBRACION_RUIDOSA") {
        return avanzar(sesion, {
          fase: "ruido-alto",
          pisoRuido: evento.pisoRuido,
        });
      }
      return sesion;

    case "ruido-alto":
      // Seguir con ruido alto es decisión del padre — la app avisó, no bloquea.
      return evento.tipo === "CONTINUAR_ASI"
        ? avanzar(sesion, {
            fase: "esperando-voz",
            pisoRuido: actual.pisoRuido,
            msSinVoz: 0,
          })
        : sesion;

    case "esperando-voz":
      if (evento.tipo === "TICK") {
        if (evento.vozActiva) {
          return avanzar(sesion, {
            fase: "jugando",
            pisoRuido: actual.pisoRuido,
            sostenidoMs: evento.sostenidoMs,
            metaMs: META_MS_DEFECTO,
          });
        }
        return avanzar(sesion, {
          fase: "esperando-voz",
          pisoRuido: actual.pisoRuido,
          msSinVoz: actual.msSinVoz + evento.deltaMs,
        });
      }
      if (evento.tipo === "TERMINAR") {
        return avanzar(sesion, { fase: "celebracion", sostenidoMs: 0 });
      }
      return sesion;

    case "jugando":
      if (evento.tipo === "TICK") {
        const sostenidoMs = evento.sostenidoMs;
        // La meta cierra el intento solo fuera del modo calma (en calma no hay meta).
        if (!sesion.ajustes.modoCalma && sostenidoMs >= actual.metaMs) {
          return avanzar(sesion, { fase: "celebracion", sostenidoMs });
        }
        if (!evento.vozActiva) {
          // Se calló: vuelve a esperar, sin castigo y sin perder lo sostenido del intento.
          return avanzar(sesion, {
            fase: "esperando-voz",
            pisoRuido: actual.pisoRuido,
            msSinVoz: 0,
          });
        }
        return avanzar(sesion, { ...actual, sostenidoMs });
      }
      if (evento.tipo === "TERMINAR") {
        return avanzar(sesion, {
          fase: "celebracion",
          sostenidoMs: actual.sostenidoMs,
        });
      }
      return sesion;

    case "celebracion":
      // Volver a jugar no re-pide permiso: el mic sigue abierto, pero el piso se remide.
      return evento.tipo === "OTRA_VEZ"
        ? avanzar(sesion, { fase: "calibrando", msTranscurridos: 0 })
        : sesion;

    default: {
      const exhaustivo: never = actual;
      return exhaustivo;
    }
  }
}

function avanzar(sesion: Sesion, actual: Fase): Sesion {
  return { ...sesion, actual };
}

/** ¿Toca invitar amablemente a hablar? (nunca es un error ni un castigo: solo una invitación) */
export function invitacionAmable(sesion: Sesion): boolean {
  return (
    sesion.actual.fase === "esperando-voz" &&
    sesion.actual.msSinVoz >= MS_PARA_INVITAR
  );
}

/** El medidor y la meta se ocultan en modo calma (carga sensorial: §C de la investigación). */
export function muestraMedidor(sesion: Sesion): boolean {
  return !sesion.ajustes.modoCalma;
}
