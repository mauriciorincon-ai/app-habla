import { z } from "zod";

/**
 * El formato del REGISTRO DIARIO de contacto visual — lo que la mamá anota en su teléfono desde
 * el documento (`docs/CATALOGO-CONTACTO-VISUAL.html`, servido en /mirada).
 *
 * Tres reglas que vienen de la investigación del sprint (planeadora, §5):
 *   - NO se puntúa al niño. Se registra lo que hizo el ADULTO (bloque A), se marcan —sin contar—
 *     las cosas concretas que se vieron en él (bloque B) y cómo estuvo él (bloque C).
 *   - La unidad es UN momento de juego (~10 min), no el día entero. Menos de 2 minutos, menos de
 *     6 toques. Cuando la mamá quiera.
 *   - Vive SOLO en su teléfono (localStorage). Sale de ahí únicamente cuando ella lo envía
 *     («Enviar a papá», ejemplos, no números) o lo guarda («Guardar registro», este JSON).
 *
 * Este schema es el CONTRATO del archivo que «Guardar registro» descarga: versionado para que el
 * segundo paso (la app, tras la observación de noviembre) pueda importarlo. El JS del documento
 * escribe exactamente esta forma; un e2e descarga el archivo y lo valida contra este schema.
 */

export const REGISTRO_VERSION = 1 as const;

/** Clave de localStorage en el documento. Con versión, para poder migrar sin pisar nada. */
export const REGISTRO_CLAVE_STORAGE = "registro-mirada-v1";

/** Bloque A — lo que hice yo. Tres cosas, tres respuestas posibles. */
export const RESPUESTAS_A = ["lo-hice", "a-medias", "hoy-no"] as const;
export type RespuestaA = (typeof RESPUESTAS_A)[number];

export const NOMBRE_RESPUESTA_A: Record<RespuestaA, string> = {
  "lo-hice": "Lo hice",
  "a-medias": "A medias",
  "hoy-no": "Hoy no",
};

export const ITEMS_A = [
  "alturaYDeFrente",
  "seguiLoQueEligioYEspere",
  "pausaOImitacionSinPedirNada",
] as const;
export type ItemA = (typeof ITEMS_A)[number];

export const NOMBRE_ITEM_A: Record<ItemA, string> = {
  alturaYDeFrente: "Me puse a su altura y de frente",
  seguiLoQueEligioYEspere: "Seguí lo que él eligió y esperé",
  pausaOImitacionSinPedirNada: "Hice la pausa o lo imité, sin pedirle nada",
};

/** Bloque B — lo que vi en él. Se marca lo que ocurrió; no se cuenta cuántas veces. */
export const ITEMS_B = [
  "miroDeMiAlJugueteYDeVuelta",
  "meBuscoParaQueSiguiera",
  "meMostroOSenaloAlgo",
  "loHizoConOtraPersona",
] as const;
export type ItemB = (typeof ITEMS_B)[number];

export const NOMBRE_ITEM_B: Record<ItemB, string> = {
  miroDeMiAlJugueteYDeVuelta: "Miró de mí al juguete y de vuelta",
  meBuscoParaQueSiguiera: "Me buscó para que siguiera",
  meMostroOSenaloAlgo: "Me mostró o señaló algo",
  loHizoConOtraPersona: "Lo hizo con otra persona",
};

/** Bloque C — cómo estuvo él. Es la casilla de «¿estaba a gusto?»: si no, se para. */
export const RESPUESTAS_C = ["a-gusto", "neutro", "incomodo"] as const;
export type RespuestaC = (typeof RESPUESTAS_C)[number];

export const NOMBRE_RESPUESTA_C: Record<RespuestaC, string> = {
  "a-gusto": "A gusto",
  neutro: "Neutro",
  incomodo: "Incómodo",
};

const FECHA = /^\d{4}-\d{2}-\d{2}$/;
const HORA = /^\d{2}:\d{2}$/;

export const EntradaRegistroSchema = z.object({
  id: z.string().min(1),
  /** Fecha LOCAL del teléfono (no UTC — la misma lección de la cápsula de medianoche). */
  fecha: z.string().regex(FECHA),
  hora: z.string().regex(HORA),
  /** La cápsula que se hizo en ese momento. */
  capsulaId: z.string().min(1),
  a: z.object({
    alturaYDeFrente: z.enum(RESPUESTAS_A),
    seguiLoQueEligioYEspere: z.enum(RESPUESTAS_A),
    pausaOImitacionSinPedirNada: z.enum(RESPUESTAS_A),
  }),
  b: z.object({
    miroDeMiAlJugueteYDeVuelta: z.boolean(),
    meBuscoParaQueSiguiera: z.boolean(),
    meMostroOSenaloAlgo: z.boolean(),
    loHizoConOtraPersona: z.boolean(),
    /** Un ejemplo concreto, en una línea («hoy señaló el avión»). Opcional. */
    ejemplo: z.string().max(200),
  }),
  c: z.object({
    comoEstuvo: z.enum(RESPUESTAS_C),
    /** Si se paró el juego porque él no estaba a gusto. */
    paramos: z.boolean(),
  }),
});

export type EntradaRegistro = z.infer<typeof EntradaRegistroSchema>;

/** El archivo que descarga «Guardar registro». */
export const RegistroExportSchema = z.object({
  version: z.literal(REGISTRO_VERSION),
  /** Cuándo se generó el archivo (ISO). */
  generado: z.string().min(10),
  entradas: z.array(EntradaRegistroSchema),
});

export type RegistroExport = z.infer<typeof RegistroExportSchema>;
