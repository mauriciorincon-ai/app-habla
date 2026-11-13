import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, expect, it } from "vitest";
import { CUENTOS } from "@content/cuentos";
import {
  contarPalabras,
  CuentoSchema,
  MAX_PALABRAS_PAGINA,
  palabraEnTexto,
  PlantillaCuentoSchema,
} from "@content/schema";
import { esDeCuento, idCuento } from "@/lib/banco-voz/catalogo";
import {
  conEstado,
  CUENTOS_VACIO,
  cuentosDelNino,
  decidir,
  importar,
  llenar,
  type CuentosGuardados,
} from "@/lib/cuentos/estado";
import { borrarTodo, CLAVES, guardarCuentos, leerCuentos } from "@/lib/storage/local";

// «Cuentos de casa» (S9, ADR-019): la biblioteca de respaldo, la máquina pendiente → aprobado | rechazado
// y lo que ve el niño (nunca un pendiente). Perfil inventado.

const LOTE = JSON.parse(readFileSync(join(__dirname, "../fixtures/lote-cuentos-prueba.json"), "utf8"));
const DEL_LOTE = LOTE.cuentos.slice(0, 2).map((c: unknown) => CuentoSchema.parse(c));

describe("la biblioteca de respaldo", () => {
  it("son seis cuentos que cumplen el esquema de plantilla", () => {
    expect(CUENTOS).toHaveLength(6);
    for (const c of CUENTOS) {
      const r = PlantillaCuentoSchema.safeParse(c);
      expect(r.success, `${c.id}: ${r.success ? "" : JSON.stringify(r.error.issues[0])}`).toBe(true);
    }
  });

  it("ids únicos, kebab-case", () => {
    const ids = CUENTOS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("cada página: corta y con su palabra, en los dos idiomas (también ya llena)", () => {
    for (const idioma of ["es", "en"] as const) {
      for (const [i, p] of CUENTOS.entries()) {
        const leido = llenar(p, CUENTOS_VACIO, idioma, i);
        for (const pg of leido.paginas) {
          expect(contarPalabras(pg.texto)).toBeLessThanOrEqual(MAX_PALABRAS_PAGINA);
          expect(pg.texto, `${p.id}/${idioma}`).not.toMatch(/[{}\d]/);
          expect(palabraEnTexto(pg.palabra, pg.texto), `${p.id}/${idioma}: ${pg.palabra}`).toBe(true);
        }
      }
    }
  });

  it("los huecos se llenan con lo del adulto, rotando por cuento", () => {
    const rellenos = { intereses: ["trenes", "nubes"], palabrasMeta: ["sube"] };
    const a = llenar(CUENTOS[0], rellenos, "es", 0);
    const b = llenar(CUENTOS[1], rellenos, "es", 1);
    expect(a.paginas.map((p) => p.texto).join(" ")).toContain("trenes");
    expect(b.paginas.map((p) => p.texto).join(" ")).toContain("nubes");
    expect(a.paginas.some((p) => p.palabra === "sube")).toBe(true);
    expect(a.origen).toBe("biblioteca");
  });
});

describe("la máquina de estados", () => {
  const base = (): CuentosGuardados => importar(CUENTOS_VACIO, DEL_LOTE, "lote-2026-11-12", "2026-11-12").estado;

  it("lo importado entra pendiente", () => {
    const r = importar(CUENTOS_VACIO, DEL_LOTE, "lote-2026-11-12", "2026-11-12");
    expect(r.nuevos).toBe(2);
    expect(r.estado.cuentos.every((c) => c.estado === "pendiente")).toBe(true);
  });

  it("un id repetido no se pisa ni se duplica", () => {
    const r = importar(base(), DEL_LOTE, "lote-2026-12-12", "2026-12-12");
    expect(r.nuevos).toBe(0);
    expect(r.repetidos).toBe(2);
    expect(r.estado.cuentos).toHaveLength(2);
  });

  it("pendiente → aprobado | rechazado, y una decisión no se deshace", () => {
    let e = decidir(base(), "el-tren-de-las-nubes", "aprobado");
    e = decidir(e, "la-gata-y-el-sombrero", "rechazado");
    expect(conEstado(e, "aprobado").map((c) => c.cuento.id)).toEqual(["el-tren-de-las-nubes"]);
    expect(conEstado(e, "rechazado").map((c) => c.cuento.id)).toEqual(["la-gata-y-el-sombrero"]);
    const otra = decidir(e, "la-gata-y-el-sombrero", "aprobado");
    expect(conEstado(otra, "aprobado")).toHaveLength(1);
  });

  it("el niño NUNCA ve un pendiente ni un rechazado: solo la biblioteca y lo aprobado", () => {
    const pend = cuentosDelNino(base(), CUENTOS, "es");
    expect(pend.map((c) => c.id)).toEqual(CUENTOS.map((c) => c.id));
    let e = decidir(base(), "el-tren-de-las-nubes", "aprobado");
    e = decidir(e, "la-gata-y-el-sombrero", "rechazado");
    const ve = cuentosDelNino(e, CUENTOS, "en");
    expect(ve.map((c) => c.id)).toEqual([...CUENTOS.map((c) => c.id), "el-tren-de-las-nubes"]);
    expect(ve.at(-1)).toMatchObject({ origen: "lote", titulo: "The cloud train" });
  });
});

describe("persistencia local y la voz del adulto", () => {
  beforeEach(() => localStorage.clear());

  it("habla:v1:cuentos ida y vuelta, y un valor corrupto vuelve al vacío", () => {
    expect(CLAVES.cuentos).toBe("habla:v1:cuentos");
    expect(leerCuentos()).toEqual(CUENTOS_VACIO);
    const e = { ...importar(CUENTOS_VACIO, DEL_LOTE, "lote-2026-11-12", "2026-11-12").estado, intereses: ["trenes"] };
    guardarCuentos(e);
    expect(leerCuentos()).toEqual(e);
    localStorage.setItem(CLAVES.cuentos, JSON.stringify({ ...e, nombre: "x" }));
    expect(leerCuentos()).toEqual(CUENTOS_VACIO);
    expect(localStorage.getItem(CLAVES.cuentos)).toBeNull();
  });

  it("«borrar todos mis datos» se lleva los cuentos", async () => {
    guardarCuentos({ ...CUENTOS_VACIO, intereses: ["trenes"] });
    expect(localStorage.getItem(CLAVES.cuentos)).not.toBeNull();
    await borrarTodo();
    expect(localStorage.getItem(CLAVES.cuentos)).toBeNull();
  });

  it("no guarda un interés con cifras", () => {
    guardarCuentos({ ...CUENTOS_VACIO, intereses: ["trenes 4"] });
    expect(localStorage.getItem(CLAVES.cuentos)).toBeNull();
  });

  it("la narración tiene su id por cuento, página e idioma, y no es del catálogo", () => {
    expect(idCuento("el-paseo", 2)).toBe("cuento:el-paseo:2");
    expect(idCuento("el-paseo", 2, "en")).toBe("cuento-en:el-paseo:2");
    expect(esDeCuento("cuento-en:el-paseo:2")).toBe(true);
    expect(esDeCuento("palabra:casa")).toBe(false);
  });
});
