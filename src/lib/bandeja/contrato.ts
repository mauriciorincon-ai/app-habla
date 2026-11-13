// LA BANDEJA DE IA (S9, ADR-019): lo que la app consume del contrato `bandeja-ia` v0.1.0 de la planeadora
// (copia fijada en `CONTRATO.lock`, junto a este archivo). Motor puro: sin red, sin almacenamiento, sin
// alias `@/` (lo importa también `scripts/validar-lote-cuentos.mjs`, que corre en Node).
//
// Qué garantiza aquí:
// · G1 / C01 — un trabajo con `pedido_por` distinto de `usuario` se rechaza ANTES de tomarlo.
// · G2 / C03 — la entrada es dato: un texto dirigido a un agente se anota en el registro y no cambia
//   ni el destino ni el esquema de la salida.
// · C04 — un trabajo vencido se dice («vencido») y no se procesa.
// · G4 / C05 — un tipo cuyo destino no es un archivo ignorado (`privado/`) se rechaza al registrarlo.
// · G6 / C06 — un tipo que declara una llave de proveedor se rechaza al registrarlo.

export const VERSION_CONTRATO = "0.1.0";
export const CONTRATO = `bandeja-ia@${VERSION_CONTRATO}`;

export const ESTADOS_TRABAJO = [
  "pendiente",
  "tomado",
  "listo",
  "entregado",
  "rechazado",
  "vencido",
] as const;
export type EstadoTrabajo = (typeof ESTADOS_TRABAJO)[number];

/** La carpeta que el `.gitignore` deja fuera del repo: el único destino que la app acepta. */
export const CARPETA_PRIVADA = "privado/";

export type TipoDeTrabajo = {
  readonly id: string;
  readonly origen: "archivo";
  /** Ruta relativa al repo donde vuelve la salida. Tiene que vivir bajo `privado/`. */
  readonly destino: string;
  /** Qué revisa el adulto antes de que algo llegue al niño. */
  readonly revision: string;
  readonly [otro: string]: unknown;
};

export type RechazoTipo =
  "destino-versionado" | "declara-llave" | "id-invalido";

const LLAVE = /(api[-_ ]?key|llave|token|secret|password|credencial)/i;

/** C05 y C06: un tipo entra al registro solo si su destino es privado y no declara llaves. */
export function revisarTipo(
  tipo: TipoDeTrabajo,
): { ok: true } | { ok: false; motivo: RechazoTipo } {
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(tipo.id))
    return { ok: false, motivo: "id-invalido" };
  const destino = tipo.destino.replace(/^\.\//, "");
  if (!destino.startsWith(CARPETA_PRIVADA) || destino.includes("..")) {
    return { ok: false, motivo: "destino-versionado" };
  }
  for (const [clave, valor] of Object.entries(tipo)) {
    if (LLAVE.test(clave)) return { ok: false, motivo: "declara-llave" };
    if (typeof valor === "string" && /^sk-[A-Za-z0-9_-]{8,}/.test(valor)) {
      return { ok: false, motivo: "declara-llave" };
    }
  }
  return { ok: true };
}

/** Un registro de tipos que se niega a guardar un tipo que rompa el contrato. */
export function crearRegistro(
  tipos: readonly TipoDeTrabajo[],
): ReadonlyMap<string, TipoDeTrabajo> {
  const mapa = new Map<string, TipoDeTrabajo>();
  for (const tipo of tipos) {
    const r = revisarTipo(tipo);
    if (!r.ok) throw new Error(`tipo «${tipo.id}» rechazado: ${r.motivo}`);
    mapa.set(tipo.id, tipo);
  }
  return mapa;
}

/** Lo mínimo de un trabajo que la bandeja mira antes de tomarlo. */
export type CabeceraTrabajo = {
  readonly tipo: string;
  readonly pedido_por: string;
  readonly vence: string;
  readonly entrada: unknown;
};

export type Toma =
  | { estado: "tomado"; anotaciones: string[] }
  | {
      estado: "rechazado";
      motivo: "pedido-por-tercero" | "tipo-desconocido";
      anotaciones: string[];
    }
  | { estado: "vencido"; anotaciones: string[] };

/** Frases que le hablan a un agente en vez de describir el pedido (C03). Se anotan, no se obedecen. */
const DIRIGIDO_A_AGENTE =
  /(ignora|olvida|ignore|forget|disregard)\b.{0,40}\b(instruc|indicac|regla|instruction|rule)|\b(new role|eres un|you are now|act as)\b/i;

function textos(v: unknown, out: string[] = []): string[] {
  if (typeof v === "string") out.push(v);
  else if (Array.isArray(v)) v.forEach((x) => textos(x, out));
  else if (v && typeof v === "object")
    Object.values(v).forEach((x) => textos(x, out));
  return out;
}

/** ¿Puede la bandeja tomar este trabajo hoy (`AAAA-MM-DD`)? */
export function tomarTrabajo(
  trabajo: CabeceraTrabajo,
  registro: ReadonlyMap<string, TipoDeTrabajo>,
  hoy: string,
): Toma {
  const anotaciones = textos(trabajo.entrada)
    .filter((t) => DIRIGIDO_A_AGENTE.test(t))
    .map(() => "entrada-con-texto-dirigido-a-un-agente: ignorado (G2)");
  if (trabajo.pedido_por !== "usuario") {
    return { estado: "rechazado", motivo: "pedido-por-tercero", anotaciones };
  }
  if (!registro.has(trabajo.tipo))
    return { estado: "rechazado", motivo: "tipo-desconocido", anotaciones };
  if (trabajo.vence < hoy) return { estado: "vencido", anotaciones };
  return { estado: "tomado", anotaciones };
}

/** ¿El texto le habla a un agente? Lo usa también el validador del lote. */
export const dirigidoAAgente = (texto: string): boolean =>
  DIRIGIDO_A_AGENTE.test(texto);
