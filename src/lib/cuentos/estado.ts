// «CUENTOS DE CASA» (S9, ADR-019): el estado que guarda el aparato (`habla:v1:cuentos`) y sus reglas.
// Motor puro: sin red, sin almacenamiento (eso lo hace `storage/local.ts`).
//
// · Cada cuento de un lote entra `pendiente`. La máquina es `pendiente → aprobado | rechazado`: una
//   decisión no se deshace aquí (un rechazado se queda fuera; uno aprobado se queda dentro).
// · El lado del niño ve SOLO los aprobados, más la biblioteca de respaldo (que ya es de la app).
// · Los intereses y las palabras meta son lo que el adulto escribió; llenan los huecos de la biblioteca
//   y son lo único que viaja en el pedido (decisión «1a»).

import { z } from "zod";
import {
  CuentoSchema,
  type Cuento,
  type PlantillaCuento,
} from "@content/schema";
import {
  InteresSchema,
  MAX_INTERESES,
  MAX_PALABRAS_META,
  PalabraMetaSchema,
} from "@/lib/bandeja/cuentos-del-mes";
import type { Idioma } from "@/lib/idioma";

export const ESTADOS_CUENTO = ["pendiente", "aprobado", "rechazado"] as const;
export type EstadoCuento = (typeof ESTADOS_CUENTO)[number];
export const MAX_CUENTOS_GUARDADOS = 60;

export const CuentoGuardadoSchema = z
  .object({
    cuento: CuentoSchema,
    estado: z.enum(ESTADOS_CUENTO),
    lote: z.string().min(1).max(40),
    importado: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  })
  .strict();
export type CuentoGuardado = z.infer<typeof CuentoGuardadoSchema>;

export const CuentosGuardadosSchema = z
  .object({
    intereses: z.array(InteresSchema).max(MAX_INTERESES),
    palabrasMeta: z.array(PalabraMetaSchema).max(MAX_PALABRAS_META),
    cuentos: z.array(CuentoGuardadoSchema).max(MAX_CUENTOS_GUARDADOS),
  })
  .strict();
export type CuentosGuardados = z.infer<typeof CuentosGuardadosSchema>;

export const CUENTOS_VACIO: CuentosGuardados = {
  intereses: [],
  palabrasMeta: [],
  cuentos: [],
};

/** Mete los cuentos aceptados de un lote, todos `pendiente`. Un id que ya está no se pisa. */
export function importar(
  estado: CuentosGuardados,
  aceptados: readonly Cuento[],
  lote: string,
  fecha: string,
): {
  estado: CuentosGuardados;
  nuevos: number;
  repetidos: number;
  sinLugar: number;
} {
  const ids = new Set(estado.cuentos.map((c) => c.cuento.id));
  const nuevos: CuentoGuardado[] = [];
  let repetidos = 0;
  let sinLugar = 0;
  for (const cuento of aceptados) {
    if (ids.has(cuento.id)) {
      repetidos++;
      continue;
    }
    if (estado.cuentos.length + nuevos.length >= MAX_CUENTOS_GUARDADOS) {
      sinLugar++;
      continue;
    }
    ids.add(cuento.id);
    nuevos.push({ cuento, estado: "pendiente", lote, importado: fecha });
  }
  return {
    estado: { ...estado, cuentos: [...estado.cuentos, ...nuevos] },
    nuevos: nuevos.length,
    repetidos,
    sinLugar,
  };
}

/** El adulto decide sobre un cuento pendiente. Uno ya decidido no cambia. */
export function decidir(
  estado: CuentosGuardados,
  id: string,
  decision: Exclude<EstadoCuento, "pendiente">,
): CuentosGuardados {
  return {
    ...estado,
    cuentos: estado.cuentos.map((c) =>
      c.cuento.id === id && c.estado === "pendiente"
        ? { ...c, estado: decision }
        : c,
    ),
  };
}

/** El adulto retira un cuento que había aprobado: el niño deja de verlo (queda como rechazado). */
export function retirar(estado: CuentosGuardados, id: string): CuentosGuardados {
  return {
    ...estado,
    cuentos: estado.cuentos.map((c) =>
      c.cuento.id === id && c.estado === "aprobado"
        ? { ...c, estado: "rechazado" }
        : c,
    ),
  };
}

/** Borra un cuento rechazado: libera su lugar y deja que ese id pueda volver en otro lote. */
export function quitar(estado: CuentosGuardados, id: string): CuentosGuardados {
  return {
    ...estado,
    cuentos: estado.cuentos.filter(
      (c) => !(c.cuento.id === id && c.estado === "rechazado"),
    ),
  };
}

export const conEstado = (
  estado: CuentosGuardados,
  e: EstadoCuento,
): CuentoGuardado[] => estado.cuentos.filter((c) => c.estado === e);

/** Un cuento listo para leer en un idioma: los huecos ya llenos. */
export type CuentoLeible = {
  id: string;
  origen: "biblioteca" | "lote";
  titulo: string;
  paginas: { texto: string; palabra: string }[];
};

/** Llena `{interes}` y `{palabra}` con lo del adulto (rotando por cuento) o con el relleno propio. */
export function llenar(
  plantilla: PlantillaCuento,
  rellenos: Pick<CuentosGuardados, "intereses" | "palabrasMeta">,
  idioma: Idioma,
  indice: number,
): CuentoLeible {
  const interes = rellenos.intereses.length
    ? rellenos.intereses[indice % rellenos.intereses.length]
    : plantilla.porDefecto.interes[idioma];
  const palabra = rellenos.palabrasMeta.length
    ? rellenos.palabrasMeta[indice % rellenos.palabrasMeta.length]
    : plantilla.porDefecto.palabra[idioma];
  const poner = (s: string) =>
    s.replaceAll("{interes}", interes).replaceAll("{palabra}", palabra);
  return {
    id: plantilla.id,
    origen: "biblioteca",
    titulo: plantilla.titulo[idioma],
    paginas: plantilla.paginas.map((p) => ({
      texto: poner(p.texto[idioma]),
      palabra: poner(p.palabra[idioma]),
    })),
  };
}

const leible = (c: Cuento, idioma: Idioma): CuentoLeible => ({
  id: c.id,
  origen: "lote",
  titulo: c.titulo[idioma],
  paginas: c.paginas.map((p) => ({
    texto: p.texto[idioma],
    palabra: p.palabra[idioma],
  })),
});

/** Lo que ve el niño: la biblioteca (llena) y, después, SOLO los cuentos aprobados. */
export function cuentosDelNino(
  estado: CuentosGuardados,
  biblioteca: readonly PlantillaCuento[],
  idioma: Idioma,
): CuentoLeible[] {
  return [
    ...biblioteca.map((p, i) => llenar(p, estado, idioma, i)),
    ...conEstado(estado, "aprobado").map((c) => leible(c.cuento, idioma)),
  ];
}
