// «Pasar a la otra casa» (S10, ADR-020) — cómo entra lo que llega SIN pisar lo que hay. Motor puro:
// `planDeCambios` dice qué va a cambiar (lo ve el adulto antes de confirmar) y `fusionar` lo calcula.
// Nunca se borra nada de este aparato:
// - sesiones y juicios de gemelas: se unen; un registro idéntico que ya estaba no se duplica (un
//   archivo que vuelve a la casa de origen no cuenta dos veces);
// - historial de cápsulas: unión por cápsula y fecha; el ciclo de cada etapa toma el más avanzado y
//   la cápsula del día de ESTE aparato se queda como está;
// - objetivo: el que llega reemplaza al de aquí solo si es igual de reciente o más; se muestra antes → después;
// - banco de voz: entran solo las grabaciones que aquí no existen y que este aparato puede reproducir.

import { ETAPAS } from "@content/schema";
import type {
  JuicioGemelo,
  Objetivo,
  Progreso,
  RegistroGemelas,
  RegistroSesiones,
  Sesion,
} from "@/lib/storage/schemas";
import type { GrabacionPaquete, Paquete } from "./paquete";

const MAX_REGISTROS = 500;

export type Local = {
  objetivo: Objetivo | null;
  progreso: Progreso;
  sesiones: RegistroSesiones;
  gemelas: RegistroGemelas;
  bancoIds: readonly string[];
};

export type Plan = {
  objetivo: { antes: string | null; despues: string | null; cambia: boolean };
  sesionesNuevas: number;
  gemelasNuevas: number;
  capsulasNuevas: number;
  /** null = el archivo no trae el banco. */
  banco: { nuevas: number; yaEstaban: number; noSuenanAqui: number } | null;
  nadaCambia: boolean;
};

export type Fusion = {
  objetivo: Objetivo | null;
  progreso: Progreso;
  sesiones: RegistroSesiones;
  gemelas: RegistroGemelas;
  grabaciones: GrabacionPaquete[];
};

/** Clave estable de un registro (orden de claves fijo). */
function clave(v: unknown): string {
  if (v === null || typeof v !== "object") return JSON.stringify(v);
  if (Array.isArray(v)) return `[${v.map(clave).join(",")}]`;
  const o = v as Record<string, unknown>;
  return `{${Object.keys(o)
    .sort()
    .map((k) => `${JSON.stringify(k)}:${clave(o[k])}`)
    .join(",")}}`;
}

/**
 * Unión como multiconjunto: de cada registro idéntico quedan tantas copias como el lado que más
 * tenga. Lo de aquí va primero (su orden no cambia) y lo nuevo se agrega ordenado por fecha.
 */
function unir<T extends { fecha: string }>(
  aqui: readonly T[],
  llega: readonly T[],
): { lista: T[]; nuevos: number } {
  const cuenta = new Map<string, number>();
  for (const r of aqui) cuenta.set(clave(r), (cuenta.get(clave(r)) ?? 0) + 1);
  const nuevos: T[] = [];
  const vistos = new Map<string, number>();
  for (const r of llega) {
    const k = clave(r);
    const n = (vistos.get(k) ?? 0) + 1;
    vistos.set(k, n);
    if (n > (cuenta.get(k) ?? 0)) nuevos.push(r);
  }
  const lista = [...aqui, ...nuevos].sort((a, b) =>
    a.fecha < b.fecha ? -1 : a.fecha > b.fecha ? 1 : 0,
  );
  return { lista: lista.slice(-MAX_REGISTROS), nuevos: nuevos.length };
}

function unirProgreso(
  aqui: Progreso,
  llega: Progreso,
): { progreso: Progreso; nuevas: number } {
  const vistas = new Set(
    aqui.historial.map((h) => `${h.capsulaId}|${h.fecha}`),
  );
  const nuevas = llega.historial.filter(
    (h) => !vistas.has(`${h.capsulaId}|${h.fecha}`),
  );
  const historial = [...aqui.historial, ...nuevas].sort((a, b) =>
    a.fecha < b.fecha ? -1 : a.fecha > b.fecha ? 1 : 0,
  );
  const porEtapa = { ...aqui.porEtapa };
  for (const etapa of ETAPAS) {
    const a = aqui.porEtapa[etapa];
    const b = llega.porEtapa[etapa];
    if (!b) continue;
    if (!a) {
      porEtapa[etapa] = { ...b, asignacionHoy: null, asignacionAyer: null };
    } else if (b.ciclo > a.ciclo) {
      porEtapa[etapa] = {
        ...a,
        ciclo: b.ciclo,
        cicloCompletadas: [...b.cicloCompletadas],
      };
    } else if (b.ciclo === a.ciclo) {
      porEtapa[etapa] = {
        ...a,
        cicloCompletadas: [
          ...new Set([...a.cicloCompletadas, ...b.cicloCompletadas]),
        ],
      };
    }
  }
  return { progreso: { porEtapa, historial }, nuevas: nuevas.length };
}

function objetivoQueda(
  aqui: Objetivo | null,
  llega: Objetivo | null,
): Objetivo | null {
  if (!llega) return aqui;
  if (!aqui) return llega;
  if (llega.texto === aqui.texto) return aqui;
  return llega.desde >= aqui.desde ? llega : aqui;
}

function grabacionesQueEntran(
  local: Local,
  paquete: Paquete,
  puedeSonar: (mime: string) => boolean,
): { entran: GrabacionPaquete[]; yaEstaban: number; noSuenanAqui: number } {
  const hay = new Set(local.bancoIds);
  const entran: GrabacionPaquete[] = [];
  let yaEstaban = 0;
  let noSuenanAqui = 0;
  for (const g of paquete.banco ?? []) {
    if (hay.has(g.id)) yaEstaban++;
    else if (!puedeSonar(g.mimeType)) noSuenanAqui++;
    else entran.push(g);
  }
  return { entran, yaEstaban, noSuenanAqui };
}

export function fusionar(
  local: Local,
  paquete: Paquete,
  puedeSonar: (mime: string) => boolean,
): { fusion: Fusion; plan: Plan } {
  const sesiones = unir<Sesion>(
    local.sesiones.sesiones,
    paquete.sesiones.sesiones,
  );
  const gemelas = unir<JuicioGemelo>(
    local.gemelas.juicios,
    paquete.gemelas.juicios,
  );
  const progreso = unirProgreso(local.progreso, paquete.progreso);
  const objetivo = objetivoQueda(local.objetivo, paquete.objetivo);
  const banco = grabacionesQueEntran(local, paquete, puedeSonar);
  const cambiaObjetivo =
    (objetivo?.texto ?? null) !== (local.objetivo?.texto ?? null);
  const plan: Plan = {
    objetivo: {
      antes: local.objetivo?.texto ?? null,
      despues: objetivo?.texto ?? null,
      cambia: cambiaObjetivo,
    },
    sesionesNuevas: sesiones.nuevos,
    gemelasNuevas: gemelas.nuevos,
    capsulasNuevas: progreso.nuevas,
    banco: paquete.banco
      ? {
          nuevas: banco.entran.length,
          yaEstaban: banco.yaEstaban,
          noSuenanAqui: banco.noSuenanAqui,
        }
      : null,
    nadaCambia:
      !cambiaObjetivo &&
      sesiones.nuevos === 0 &&
      gemelas.nuevos === 0 &&
      progreso.nuevas === 0 &&
      banco.entran.length === 0,
  };
  return {
    fusion: {
      objetivo,
      progreso: progreso.progreso,
      sesiones: { sesiones: sesiones.lista },
      gemelas: { juicios: gemelas.lista },
      grabaciones: banco.entran,
    },
    plan,
  };
}

/** Atajo para la pantalla: solo el plan. */
export const planDeCambios = (
  local: Local,
  paquete: Paquete,
  puedeSonar: (mime: string) => boolean,
): Plan => fusionar(local, paquete, puedeSonar).plan;
