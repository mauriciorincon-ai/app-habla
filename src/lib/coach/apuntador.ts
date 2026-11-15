// Tu apuntador (S13, ADR-025): una línea para el adulto, en el momento justo, según lo que PASÓ en el
// juego. Motor PURO (sin DOM, sin reloj propio, sin audio): recibe dos fotos de la sesión y la hora, y
// devuelve qué línea mostrar —o ninguna—.
//
// Reglas codificadas aquí:
//   - Cuatro momentos: empieza tu turno (modelar), él hizo voz en su turno (expandir), lleva rato en
//     silencio en su turno (esperar) y el cierre (nombrar lo que hicieron juntos).
//   - Ninguna línea se repite en la sesión; entre dos líneas pasa un mínimo de tiempo (el cierre no
//     espera: es el último momento). Si un momento ya agotó sus líneas, calla: callar nunca es un error.
//   - Cada línea trae su técnica y su fuente (las mismas que sostienen las cápsulas): nada de consejos
//     sin respaldo. Ninguna habla de lo que él «no hizo».
//   - Nada aquí sabe de quién es una voz: el turno lo marcó el adulto (regla dura 4).

import type { Tecnica } from "@content/schema";
import type { Texto } from "@/lib/idioma";
import { apuntador } from "@/lib/idioma/textos/apuntador";
import type { Sesion } from "@/lib/session-flow";

export type MomentoApuntador =
  "turno-adulto" | "voz-nino" | "silencio" | "cierre";

/** Silencio en su turno a partir del cual la franja sugiere esperar (antes de la invitación amable). */
export const MS_SILENCIO_APUNTADOR = 8_000;
/** Mínimo entre dos líneas: una línea es una ayuda, no un locutor. */
export const MS_ENTRE_LINEAS = 12_000;
/** Lo que una línea queda en la franja antes de irse sola. */
export const MS_LINEA_VISIBLE = 7_000;

const FUENTE = {
  modelado:
    "Heidlage et al. 2019 (Early Childhood Research Quarterly): la práctica guiada por los padres dentro del juego (g=0.50).",
  expansion:
    "Cleave et al. 2015 (AJSLP): ampliar lo que el niño dice; densidad recomendada ≥1 por minuto de juego.",
  espera:
    "Espera estructurada en la rutina (ensayo controlado, PubMed 29054980).",
  interes:
    "Enfoques naturales del desarrollo (revisión Crank et al. 2021): seguir el foco de atención del niño.",
  focalizada:
    "Estimulación focalizada (ASHA; revisión sistemática AJSLP 2022): exposición concentrada sin exigir producción.",
} as const;

export type LineaApuntador = {
  id: keyof typeof apuntador.lineas;
  momento: MomentoApuntador;
  tecnica: Tecnica;
  fuente: string;
  texto: Texto;
};

const l = (
  id: LineaApuntador["id"],
  momento: MomentoApuntador,
  tecnica: Tecnica,
  fuente: string,
): LineaApuntador => ({
  id,
  momento,
  tecnica,
  fuente,
  texto: apuntador.lineas[id],
});

/** Todas las líneas, en el orden en que se ofrecen dentro de cada momento. */
export const LINEAS: readonly LineaApuntador[] = [
  l("modelaDespacio", "turno-adulto", "modelado", FUENTE.modelado),
  l("sonidoClaro", "turno-adulto", "modelado", FUENTE.modelado),
  l("loQueMira", "turno-adulto", "seguir-interes", FUENTE.interes),
  l(
    "muestraSinPedir",
    "turno-adulto",
    "estimulacion-focalizada",
    FUENTE.focalizada,
  ),
  l("expandeUnaPalabra", "voz-nino", "expansion-recast", FUENTE.expansion),
  l("ecoContento", "voz-nino", "expansion-recast", FUENTE.expansion),
  l("poneleNombre", "voz-nino", "modelado", FUENTE.modelado),
  l("palabraClave", "voz-nino", "estimulacion-focalizada", FUENTE.focalizada),
  l("esperaTres", "silencio", "espera-estructurada", FUENTE.espera),
  l("espacioParaSuVoz", "silencio", "espera-estructurada", FUENTE.espera),
  l("aSuAltura", "silencio", "espera-estructurada", FUENTE.espera),
  l("nombraJuntos", "cierre", "modelado", FUENTE.modelado),
  l("cuentaLaHistoria", "cierre", "expansion-recast", FUENTE.expansion),
];

/** ¿Qué momento ocurrió entre estas dos fotos de la sesión? (o ninguno). */
export function momentoDeTransicion(
  antes: Sesion,
  despues: Sesion,
): MomentoApuntador | null {
  if (
    despues.actual.fase === "celebracion" &&
    antes.actual.fase !== "celebracion"
  ) {
    return "cierre";
  }
  const enJuego = (s: Sesion) =>
    s.actual.fase === "esperando-voz" || s.actual.fase === "jugando";
  if (!enJuego(despues)) return null;
  if (despues.turno === "adulto" && antes.turno !== "adulto")
    return "turno-adulto";
  if (despues.turno === "nino" && despues.turnosNino > antes.turnosNino)
    return "voz-nino";
  if (
    despues.turno === "nino" &&
    despues.actual.fase === "esperando-voz" &&
    despues.actual.msSinVoz >= MS_SILENCIO_APUNTADOR &&
    (antes.actual.fase !== "esperando-voz" ||
      antes.actual.msSinVoz < MS_SILENCIO_APUNTADOR)
  ) {
    return "silencio";
  }
  return null;
}

/** Lo que el apuntador recuerda de ESTA sesión (vive en memoria; nada se guarda). */
export type HistorialApuntador = {
  usadas: readonly LineaApuntador["id"][];
  ultimaMs: number | null;
};

export const HISTORIAL_VACIO: HistorialApuntador = {
  usadas: [],
  ultimaMs: null,
};

/**
 * La línea para este momento, o null (sin repetir; con su respiro entre líneas). Si la técnica del día
 * tiene una línea en este momento, va primero: el apuntador acompaña la cápsula de hoy.
 */
export function elegirLinea(
  momento: MomentoApuntador,
  historial: HistorialApuntador,
  ahoraMs: number,
  tecnicaDelDia?: Tecnica,
): LineaApuntador | null {
  if (
    momento !== "cierre" &&
    historial.ultimaMs !== null &&
    ahoraMs - historial.ultimaMs < MS_ENTRE_LINEAS
  ) {
    return null;
  }
  const libres = LINEAS.filter(
    (x) => x.momento === momento && !historial.usadas.includes(x.id),
  );
  return libres.find((x) => x.tecnica === tecnicaDelDia) ?? libres[0] ?? null;
}

export function registrarLinea(
  historial: HistorialApuntador,
  linea: LineaApuntador,
  ahoraMs: number,
): HistorialApuntador {
  return { usadas: [...historial.usadas, linea.id], ultimaMs: ahoraMs };
}
