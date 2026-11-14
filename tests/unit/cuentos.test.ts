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
  quitar,
  retirar,
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

  it("el adulto retira un aprobado (el niño deja de verlo) y quita un rechazado (el id puede volver)", () => {
    const inicial = importar(CUENTOS_VACIO, DEL_LOTE, "lote-2026-11-12", "2026-11-12").estado;
    let e = decidir(inicial, "el-tren-de-las-nubes", "aprobado");
    expect(cuentosDelNino(e, CUENTOS, "es").some((c) => c.id === "el-tren-de-las-nubes")).toBe(true);
    e = retirar(e, "el-tren-de-las-nubes");
    expect(cuentosDelNino(e, CUENTOS, "es").some((c) => c.id === "el-tren-de-las-nubes")).toBe(false);
    expect(retirar(e, "la-gata-y-el-sombrero").cuentos.find((c) => c.cuento.id === "la-gata-y-el-sombrero")?.estado).toBe("pendiente");
    expect(quitar(e, "la-gata-y-el-sombrero").cuentos).toHaveLength(2); // un pendiente no se quita
    e = quitar(e, "el-tren-de-las-nubes");
    expect(e.cuentos).toHaveLength(1);
    expect(importar(e, DEL_LOTE, "lote-2026-12-12", "2026-12-12").nuevos).toBe(1);
  });

  it("con la lista llena, lo que no cabe se cuenta aparte de lo repetido", () => {
    const lleno: CuentosGuardados = {
      ...CUENTOS_VACIO,
      cuentos: Array.from({ length: 60 }, (_, i) => ({
        cuento: { ...DEL_LOTE[0], id: `relleno-${i}` },
        estado: "rechazado" as const,
        lote: "lote-2026-11-12",
        importado: "2026-11-12",
      })),
    };
    const r = importar(lleno, DEL_LOTE, "lote-2026-12-12", "2026-12-12");
    expect(r.nuevos).toBe(0);
    expect(r.sinLugar).toBe(DEL_LOTE.length);
    expect(r.repetidos).toBe(0);
  });

  it("si el texto de la página cambia (otros gustos), la grabación vieja deja de aplicar", () => {
    const plantilla = CUENTOS[0];
    const a = llenar(plantilla, { intereses: ["trenes"], palabrasMeta: ["sube"] }, "es", 0);
    const b = llenar(plantilla, { intereses: ["nubes"], palabrasMeta: ["sube"] }, "es", 0);
    const grabadas = new Set(a.paginas.map((p, i) => idCuento(a.id, i + 1, "es", p.texto)));
    const conVoz = (c: typeof a) => c.paginas.map((p, i) => grabadas.has(idCuento(c.id, i + 1, "es", p.texto)));
    expect(conVoz(a).every(Boolean)).toBe(true);
    // Las páginas cuyo texto cambió pierden la voz vieja; las que no cambiaron la conservan.
    expect(conVoz(b)).toEqual(a.paginas.map((p, i) => p.texto === b.paginas[i].texto));
    expect(conVoz(b).includes(false)).toBe(true);
  });

  it("la narración tiene su id por cuento, página e idioma, y no es del catálogo", () => {
    expect(idCuento("el-paseo", 2, "es", "Hoy")).toMatch(/^cuento:el-paseo:2:[0-9a-f]+$/);
    expect(idCuento("el-paseo", 2, "en", "Today")).toMatch(/^cuento-en:el-paseo:2:[0-9a-f]+$/);
    expect(esDeCuento(idCuento("el-paseo", 2, "en", "Today"))).toBe(true);
    expect(esDeCuento("palabra:casa")).toBe(false);
  });
});
