// LA CELEBRACIÓN CON LA VOZ DE LA FAMILIA (S15, ADR-027) — PURO. Qué frase grabada del catálogo dice en
// voz alta la celebración final, derivada SOLO de lo medido en su turno (regla dura 3):
//
//   - «casi»          cuando el medidor no alcanzó a escuchar nada que contar;
//   - «dijo-palabra»  cuando el ADULTO marcó que oyó la palabra (él juzga, nunca la app);
//   - «le-salio»      cuando hubo voz medida;
//   - nada            en gemelas sin marcas: no hay voz medida que afirmar.

import { valorDeMetrica, type Metrica } from "@/lib/session-flow";

export type ClaveCelebracion = "le-salio" | "dijo-palabra" | "casi";

/** ¿El medidor alcanzó a escuchar algo de verdad? Es lo único que decide qué se puede afirmar. */
export function huboAlgoQueContar(metrica: Metrica): boolean {
  if (metrica.tipo === "sostenido") return metrica.ms >= 300;
  // Gemelas no tiene micrófono: "hubo algo" es que se jugó al menos una ronda.
  if (metrica.tipo === "gemelas") return metrica.rondas >= 1;
  return valorDeMetrica(metrica) >= 1;
}

export function claveCelebracion(metrica: Metrica): ClaveCelebracion | null {
  if (!huboAlgoQueContar(metrica)) return "casi";
  if (metrica.tipo === "activaciones" && metrica.reconocidas > 0) return "dijo-palabra";
  if (metrica.tipo === "gemelas") return metrica.participadas > 0 ? "dijo-palabra" : null;
  return "le-salio";
}
