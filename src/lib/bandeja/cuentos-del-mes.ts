// El tipo de trabajo `cuentos-del-mes` (S9, ADR-019): qué lleva el PEDIDO que arma la app, qué forma
// tiene el LOTE que devuelve `/bandeja`, y el validador que decide qué cuentos entran. Motor puro y sin
// alias `@/`: lo usan el navegador (importar el lote) y `scripts/validar-lote-cuentos.mjs` (Node).
//
// Decisión del dueño «1a»: el pedido lleva SOLO los intereses en palabras genéricas y las palabras meta.
// Nunca un nombre, una edad, la voz ni nada de una condición: esos campos no existen en el tipo y el
// esquema es `.strict()`, así que cualquier campo de más lo rechaza. Los intereses no aceptan cifras.

import { z } from "zod";
import { CuentoSchema, type Cuento } from "../../../content/schema.ts";
import {
  CONTRATO,
  crearRegistro,
  dirigidoAAgente,
  tomarTrabajo,
  type Toma,
} from "./contrato.ts";
import { tocaLaLista } from "./sensibilidad.ts";

export const TIPO_CUENTOS = "cuentos-del-mes";
export const DIAS_DE_VIGENCIA = 30;
export const MAX_INTERESES = 5;
export const MAX_PALABRAS_META = 8;
export const MAX_CUENTOS_POR_LOTE = 12;

export const TIPO_CUENTOS_DEL_MES = {
  id: TIPO_CUENTOS,
  origen: "archivo",
  destino: "privado/bandeja/",
  revision:
    "el adulto lee cada cuento en la app y lo aprueba o lo rechaza antes de que llegue al niño",
} as const;

export const REGISTRO_HABLA = crearRegistro([TIPO_CUENTOS_DEL_MES]);

const FECHA = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

/** Algo que le gusta, en palabras genéricas: de una a tres palabras, solo letras. */
export const InteresSchema = z
  .string()
  .trim()
  .min(2)
  .max(24)
  .regex(/^\p{L}+(?:[ '-]\p{L}+){0,2}$/u);

/** Una palabra que están practicando: una sola, solo letras. */
export const PalabraMetaSchema = z
  .string()
  .trim()
  .min(1)
  .max(20)
  .regex(/^\p{L}+$/u);

/** Lo ÚNICO que viaja sobre el niño (decisión «1a»). */
export const EntradaCuentosSchema = z
  .object({
    intereses: z.array(InteresSchema).min(1).max(MAX_INTERESES),
    palabrasMeta: z.array(PalabraMetaSchema).max(MAX_PALABRAS_META),
  })
  .strict();
export type EntradaCuentos = z.infer<typeof EntradaCuentosSchema>;

export const PedidoCuentosSchema = z
  .object({
    contrato: z.literal(CONTRATO),
    id: z.string().regex(/^pedido-\d{4}-\d{2}-\d{2}$/),
    tipo: z.literal(TIPO_CUENTOS),
    origen: z.literal("archivo"),
    pedido_por: z.literal("usuario"),
    creado: FECHA,
    vence: FECHA,
    entrada: EntradaCuentosSchema,
  })
  .strict();
export type PedidoCuentos = z.infer<typeof PedidoCuentosSchema>;

function sumarDias(fecha: string, dias: number): string {
  const d = new Date(`${fecha}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

/** Separa lo que escribió el adulto («dinosaurios, carros») en una lista limpia, sin repetidos. */
export function separarLista(texto: string): string[] {
  const vistos = new Set<string>();
  const out: string[] = [];
  for (const crudo of texto.split(/[,;\n]+/)) {
    const v = crudo.trim().replace(/\s+/g, " ");
    const clave = v.toLowerCase();
    if (v && !vistos.has(clave)) {
      vistos.add(clave);
      out.push(v);
    }
  }
  return out;
}

/** Arma el pedido del día. Devuelve null si la entrada no pasa (p. ej. un interés con cifras). */
export function armarPedido(
  entrada: EntradaCuentos,
  hoy: string,
): PedidoCuentos | null {
  const r = PedidoCuentosSchema.safeParse({
    contrato: CONTRATO,
    id: `pedido-${hoy}`,
    tipo: TIPO_CUENTOS,
    origen: "archivo",
    pedido_por: "usuario",
    creado: hoy,
    vence: sumarDias(hoy, DIAS_DE_VIGENCIA),
    entrada,
  });
  return r.success ? r.data : null;
}

/** ¿Puede `/bandeja` tomar este pedido hoy? (C01, C03, C04 del contrato.) */
export function tomarPedido(
  crudo: unknown,
  hoy: string,
):
  | Toma
  | { estado: "rechazado"; motivo: "pedido-invalido"; anotaciones: string[] } {
  if (crudo && typeof crudo === "object") {
    const c = crudo as Record<string, unknown>;
    // C01 va primero: un pedido de un tercero se rechaza sin mirar más.
    if (c.pedido_por !== "usuario") {
      return tomarTrabajo(
        {
          tipo: String(c.tipo),
          pedido_por: String(c.pedido_por),
          vence: String(c.vence),
          entrada: c.entrada,
        },
        REGISTRO_HABLA,
        hoy,
      );
    }
  }
  const r = PedidoCuentosSchema.safeParse(crudo);
  if (!r.success)
    return { estado: "rechazado", motivo: "pedido-invalido", anotaciones: [] };
  return tomarTrabajo(r.data, REGISTRO_HABLA, hoy);
}

// ── El lote ──────────────────────────────────────────────────────────────────────────────────────

export const LoteCuentosSchema = z
  .object({
    contrato: z.literal(CONTRATO),
    tipo: z.literal(TIPO_CUENTOS),
    id: z.string().regex(/^lote-\d{4}-\d{2}-\d{2}(-[a-z0-9]+)?$/),
    pedido: z.string().regex(/^pedido-\d{4}-\d{2}-\d{2}$/),
    creado: FECHA,
    registro: z
      .object({
        modelo: z.string().min(1).max(60),
        fecha: FECHA,
        anotaciones: z.array(z.string().max(200)).max(20),
      })
      .strict(),
    cuentos: z.array(z.unknown()).min(1).max(MAX_CUENTOS_POR_LOTE),
  })
  .strict();

export type MotivoCuento =
  "esquema" | "plazo-o-puntaje" | "texto-a-agente" | "sensible" | "id-repetido";

export type ResultadoLote =
  | { ok: false; motivo: "lote-invalido" }
  | {
      ok: true;
      lote: string;
      aceptados: Cuento[];
      rechazados: { indice: number; id: string | null; motivo: MotivoCuento }[];
    };

/** Plazos y puntajes (regla dura 4), en los dos idiomas. Las cifras ya las rechaza el esquema. */
const PLAZO_O_PUNTAJE =
  /\b(semanas?|meses|plazo|resultados?|puntaje|calificaci[oó]n|weeks?|months?|deadline|results?|porcentaje|score|scores|grades?|rating|percent(age)?)\b/i;

const textosDe = (c: Cuento): string[] => [
  c.titulo.es,
  c.titulo.en,
  ...c.paginas.flatMap((p) => [
    p.texto.es,
    p.texto.en,
    p.palabra.es,
    p.palabra.en,
  ]),
];

/**
 * El validador del lote (G3: la IA produce y el código decide). Si el sobre no cumple, no entra nada
 * (C02). Si cumple, cada cuento se juzga solo: el que falla se rechaza con su motivo y el resto entra.
 * El gate de sensibilidad corre sobre cada cuento con las huellas que se le pasan.
 */
export async function validarLote(
  crudo: unknown,
  opciones: { huellas: ReadonlySet<string>; idsReservados?: Iterable<string> },
): Promise<ResultadoLote> {
  const sobre = LoteCuentosSchema.safeParse(crudo);
  if (!sobre.success) return { ok: false, motivo: "lote-invalido" };
  // Sin huellas el gate no vería nada: un lote no entra con la puerta apagada.
  if (opciones.huellas.size === 0) return { ok: false, motivo: "lote-invalido" };
  const usados = new Set(opciones.idsReservados ?? []);
  const aceptados: Cuento[] = [];
  const rechazados: {
    indice: number;
    id: string | null;
    motivo: MotivoCuento;
  }[] = [];

  for (const [indice, bruto] of sobre.data.cuentos.entries()) {
    const r = CuentoSchema.safeParse(bruto);
    if (!r.success) {
      const id =
        bruto &&
        typeof bruto === "object" &&
        typeof (bruto as { id?: unknown }).id === "string"
          ? (bruto as { id: string }).id
          : null;
      rechazados.push({ indice, id, motivo: "esquema" });
      continue;
    }
    const cuento = r.data;
    const todos = textosDe(cuento);
    let motivo: MotivoCuento | null = null;
    if (usados.has(cuento.id)) motivo = "id-repetido";
    else if (todos.some((t) => PLAZO_O_PUNTAJE.test(t)))
      motivo = "plazo-o-puntaje";
    else if (todos.some(dirigidoAAgente)) motivo = "texto-a-agente";
    else if (await tocaLaLista(todos.join("\n"), opciones.huellas))
      motivo = "sensible";
    if (motivo) {
      rechazados.push({ indice, id: cuento.id, motivo });
      continue;
    }
    usados.add(cuento.id);
    aceptados.push(cuento);
  }
  return { ok: true, lote: sobre.data.id, aceptados, rechazados };
}
