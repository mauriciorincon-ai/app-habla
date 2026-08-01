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

/**
 * Lo que el juego MIDIÓ de verdad (Sprint 2: el flujo es compartido por los tres juegos, y lo
 * único que cambia entre ellos es la métrica). La celebración solo puede afirmar esto — jamás
 * un elogio desacoplado de lo medido (regla dura 3).
 */
export type Metrica =
  /**
   * Globo. Dos números que NO son lo mismo (hallazgo del gate, 2026-07-12):
   *   - `ms`: total de voz en el intento (lo que hizo volar al globo).
   *   - `rachaMs`: la vez más larga sin cortarse — lo único que autoriza a decir "la sostuviste".
   */
  | { tipo: "sostenido"; ms: number; rachaMs: number }
  /** Cohete: veces que la voz cambió de dirección (subió y bajó). */
  | { tipo: "inversiones"; veces: number }
  /**
   * Palabra↔objeto. Dos números con DOS DUEÑOS, y no se mezclan:
   *   - `veces`: dibujos que su voz activó (lo midió la app; cualquier vocalización cuenta, ADR 005).
   *   - `reconocidas`: palabras que el PADRE dijo haber oído (lo juzgó él; la app no oye palabras).
   */
  | { tipo: "activaciones"; veces: number; reconocidas: number }
  /**
   * Palabras gemelas (sin micrófono — el niño dice, el PADRE marca; ADR-009). No hay
   * "correcto/incorrecto" para el niño: solo se cuenta la participación.
   *   - `rondas`: pares que se jugaron.
   *   - `participadas`: rondas donde el padre marcó lo que oyó (el niño intentó una palabra).
   */
  | { tipo: "gemelas"; rondas: number; participadas: number };

/** El número que la métrica lleva dentro — con eso se compara contra la meta. */
export function valorDeMetrica(metrica: Metrica): number {
  switch (metrica.tipo) {
    case "sostenido":
      return metrica.ms;
    case "gemelas":
      return metrica.participadas;
    default:
      return metrica.veces;
  }
}

export const METRICA_CERO: Record<Metrica["tipo"], Metrica> = {
  sostenido: { tipo: "sostenido", ms: 0, rachaMs: 0 },
  inversiones: { tipo: "inversiones", veces: 0 },
  activaciones: { tipo: "activaciones", veces: 0, reconocidas: 0 },
  gemelas: { tipo: "gemelas", rondas: 0, participadas: 0 },
};

export type Fase =
  | { fase: "guion" }
  | { fase: "pidiendo-mic" }
  | { fase: "mic-denegado" }
  | { fase: "calibrando"; msTranscurridos: number }
  | { fase: "ruido-alto"; pisoRuido: number }
  | { fase: "esperando-voz"; pisoRuido: number; msSinVoz: number }
  | { fase: "jugando"; pisoRuido: number; metrica: Metrica }
  | { fase: "celebracion"; metrica: Metrica };

export type Sesion = {
  ajustes: Ajustes;
  /**
   * El valor de métrica que cierra el intento con celebración (3 inversiones del cohete).
   * `null` = sin meta: el juego dura lo que el padre quiera (el GLOBO desde el gate S4 —sus
   * vueltas son infinitas—, palabra↔objeto, y cualquier juego en modo calma). Nunca hay castigo
   * por no llegar.
   */
  meta: number | null;
  /** Qué mide este juego. Fija el tipo de métrica de toda la sesión. */
  tipoMetrica: Metrica["tipo"];
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
  | { tipo: "TICK"; deltaMs: number; vozActiva: boolean; metrica: Metrica }
  /**
   * "Ya jugamos" (lo toca el padre). Lleva la métrica REAL del intento: terminar desde el
   * silencio no puede borrar lo que el niño ya logró — la celebración cuenta la verdad.
   */
  | { tipo: "TERMINAR"; metrica: Metrica }
  | { tipo: "OTRA_VEZ" }
  /**
   * "Salir" dentro del juego (gate S4): vuelve al GUION, no al selector — así el padre puede
   * releer su línea sin perder la pantalla. La UI que lo despacha DEBE apagar el micrófono
   * (el guion es pantalla del padre; el audio no la sobrevive).
   */
  | { tipo: "VOLVER_AL_GUION" }
  | { tipo: "CAMBIAR_CALMA"; activo: boolean };

/**
 * El HITO del globo: cada 3000 ms de voz acumulada es UNA VUELTA. Desde el gate S4 el globo ya
 * NO se cierra solo (pasa `meta: null`): las vueltas son infinitas y el intento termina cuando
 * el padre toca "Ya jugamos" — el fin automático a los 3 s cortaba el juego justo mientras le
 * enseñaba al niño (hallazgo E6 del gate). El reducer conserva la mecánica de meta: el cohete
 * la sigue usando.
 */
export const HITO_VUELTA_MS = 3000;

/** Meta del cohete: subir y bajar la voz estas veces (§B.1: exploración vocal, no palabras). */
export const META_INVERSIONES_DEFECTO = 3;

/** Tras este silencio en "esperando-voz", la UI invita amablemente (jamás regaña). */
export const MS_PARA_INVITAR = 20_000;

export function sesionInicial(
  ajustes: Ajustes = { modoCalma: false },
  tipoMetrica: Metrica["tipo"] = "sostenido",
  meta: number | null = HITO_VUELTA_MS,
): Sesion {
  return { ajustes, meta, tipoMetrica, actual: { fase: "guion" } };
}

export function reducir(sesion: Sesion, evento: Evento): Sesion {
  // El modo calma se puede cambiar en cualquier fase (1 toque) sin perder el progreso.
  if (evento.tipo === "CAMBIAR_CALMA") {
    return {
      ...sesion,
      ajustes: { ...sesion.ajustes, modoCalma: evento.activo },
    };
  }

  // Salir → guion, desde cualquier fase posterior (gate S4). Nada se castiga: si había métrica,
  // simplemente no se celebró — igual que salir de la pantalla, pero sin perder el guion.
  if (evento.tipo === "VOLVER_AL_GUION") {
    return sesion.actual.fase === "guion"
      ? sesion
      : { ...sesion, actual: { fase: "guion" } };
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
            metrica: evento.metrica,
          });
        }
        return avanzar(sesion, {
          fase: "esperando-voz",
          pisoRuido: actual.pisoRuido,
          msSinVoz: actual.msSinVoz + evento.deltaMs,
        });
      }
      if (evento.tipo === "TERMINAR") {
        return avanzar(sesion, {
          fase: "celebracion",
          metrica: evento.metrica,
        });
      }
      return sesion;

    case "jugando":
      if (evento.tipo === "TICK") {
        const metrica = evento.metrica;
        // La meta cierra el intento solo si existe y fuera del modo calma (en calma no hay meta).
        if (
          !sesion.ajustes.modoCalma &&
          sesion.meta !== null &&
          valorDeMetrica(metrica) >= sesion.meta
        ) {
          return avanzar(sesion, { fase: "celebracion", metrica });
        }
        if (!evento.vozActiva) {
          // Se calló: vuelve a esperar, sin castigo y sin perder lo logrado del intento.
          return avanzar(sesion, {
            fase: "esperando-voz",
            pisoRuido: actual.pisoRuido,
            msSinVoz: 0,
          });
        }
        return avanzar(sesion, { ...actual, metrica });
      }
      if (evento.tipo === "TERMINAR") {
        return avanzar(sesion, {
          fase: "celebracion",
          metrica: evento.metrica,
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
