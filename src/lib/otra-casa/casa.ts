// «Pasar a la otra casa» (S10, ADR-020) — el puente con el almacenamiento de ESTE aparato. Arma el
// archivo cifrado con lo que el paquete permite, y al abrir uno: descifra, valida, calcula el plan y,
// solo cuando el adulto confirma, escribe. Sin red: la descarga y la carga del archivo son acciones
// del adulto en su propio aparato.

import {
  guardarGrabacion,
  listarIds,
  obtenerGrabacion,
} from "@/lib/banco-voz/almacen";
import {
  CLAVES,
  guardar,
  borrarObjetivo,
  leerObjetivo,
  leerProgreso,
  leerRegistroGemelas,
  leerSesiones,
} from "@/lib/storage/local";
import {
  ObjetivoSchema,
  ProgresoSchema,
  RegistroGemelasSchema,
  RegistroSesionesSchema,
} from "@/lib/storage/schemas";
import { aBase64, cifrar, deBase64, descifrar } from "./cifrado";
import { fusionar, type Fusion, type Local, type Plan } from "./fusion";
import {
  ESQUEMA_PAQUETE,
  MAX_BANCO_BYTES,
  MAX_GRABACIONES,
  leerPaquete,
  type GrabacionPaquete,
  type Paquete,
} from "./paquete";

export async function leerLocal(): Promise<Local> {
  return {
    objetivo: leerObjetivo(),
    progreso: leerProgreso(),
    sesiones: leerSesiones(),
    gemelas: leerRegistroGemelas(),
    bancoIds: await listarIds(),
  };
}

async function bancoParaViajar(): Promise<GrabacionPaquete[]> {
  const ids = (await listarIds()).slice(0, MAX_GRABACIONES);
  const out: GrabacionPaquete[] = [];
  let bytes = 0;
  for (const id of ids) {
    const g = await obtenerGrabacion(id);
    if (!g) continue;
    // Tope del archivo: lo que no cabe se queda en este aparato (el adulto lo ve en el aviso).
    bytes += Math.ceil((g.blob.size * 4) / 3);
    if (bytes > MAX_BANCO_BYTES) break;
    out.push({
      id,
      mimeType: g.mimeType,
      duracionMs: Math.round(g.duracionMs),
      fecha: g.fecha,
      datos: aBase64(new Uint8Array(await g.blob.arrayBuffer())),
    });
  }
  return out;
}

/** Arma el paquete con lo de este aparato (el banco solo si el adulto lo marcó). */
export async function armarPaquete(
  incluirBanco: boolean,
  hoy: string,
): Promise<Paquete> {
  const local = await leerLocal();
  return {
    app: "habla",
    esquema: ESQUEMA_PAQUETE,
    creado: hoy,
    objetivo: local.objetivo,
    progreso: local.progreso,
    sesiones: local.sesiones,
    gemelas: local.gemelas,
    banco: incluirBanco ? await bancoParaViajar() : null,
  };
}

/** El texto del archivo `.habla`: el sobre cifrado, en JSON. */
export async function crearArchivo(
  incluirBanco: boolean,
  frase: string,
  hoy: string,
  iteraciones?: number,
): Promise<string> {
  const paquete = await armarPaquete(incluirBanco, hoy);
  const sobre = await cifrar(JSON.stringify(paquete), frase, iteraciones);
  return `${JSON.stringify(sobre)}\n`;
}

export type Apertura =
  | { ok: true; plan: Plan; fusion: Fusion }
  | { ok: false; motivo: "formato" | "frase" | "contenido" | "navegador" | "inesperado" };

/** Descifra y calcula el plan. NO escribe nada: eso lo hace `aplicar`, tras el «sí» del adulto. */
export async function abrirArchivo(
  texto: string,
  frase: string,
  puedeSonar: (mime: string) => boolean,
): Promise<Apertura> {
  let sobre: unknown;
  try {
    sobre = JSON.parse(texto);
  } catch {
    return { ok: false, motivo: "formato" };
  }
  let d;
  try {
    d = await descifrar(sobre, frase);
  } catch {
    return { ok: false, motivo: "navegador" };
  }
  if (!d.ok) return d;
  const paquete = leerPaquete(d.texto);
  if (!paquete) return { ok: false, motivo: "contenido" };
  const { fusion, plan } = fusionar(await leerLocal(), paquete, puedeSonar);
  return { ok: true, plan, fusion };
}

/** Escribe la fusión. Solo suma: lo de este aparato que no está en el archivo se queda. */
export async function aplicar(fusion: Fusion): Promise<void> {
  // Primero lo que puede fallar a medias (grabaciones, una a una; cuota o códec): si algo lanza, el
  // almacenamiento de texto aún no cambió. Lo último y más corto es localStorage.
  for (const g of fusion.grabaciones) {
    const bytes = deBase64(g.datos);
    if (!bytes) continue;
    await guardarGrabacion(g.id, {
      blob: new Blob([bytes], { type: g.mimeType }),
      mimeType: g.mimeType,
      duracionMs: g.duracionMs,
      fecha: g.fecha,
    });
  }
  if (fusion.objetivo)
    guardar(CLAVES.objetivo, ObjetivoSchema, fusion.objetivo);
  else borrarObjetivo();
  guardar(CLAVES.progreso, ProgresoSchema, fusion.progreso);
  guardar(CLAVES.sesiones, RegistroSesionesSchema, fusion.sesiones);
  guardar(CLAVES.gemelas, RegistroGemelasSchema, fusion.gemelas);
}

/** ¿Este navegador reproduce ese formato? (ADR-011 § «Cuándo reabrir» (a)). */
export function puedeSonarAqui(mime: string): boolean {
  if (typeof document === "undefined") return false;
  return document.createElement("audio").canPlayType(mime) !== "";
}
