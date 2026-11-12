import { readFileSync } from "node:fs";
import { join } from "node:path";
import vm from "node:vm";
import { describe, expect, it } from "vitest";
import { IDIOMAS, detectarIdioma, esTexto, t, textosDe, type Catalogo } from "../../src/lib/idioma";
import { ajustes as textosAjustes } from "../../src/lib/idioma/textos/ajustes";
import { nombreTecnica, nombreTema } from "../../src/lib/idioma/textos/nombres";
import { TECNICAS } from "../../content/schema";
import { TEMAS } from "../../src/lib/storage/temas";
import { AjustesSchema, AJUSTES_DEFECTO } from "../../src/lib/storage/schemas";

// PARIDAD ES/EN (S7, regla 20). Cada texto nace como { es, en } y ninguno puede tener una sola cara:
// vacío, igual en los dos idiomas (calcado sin redactar) o con marcadores {n} distintos.
// Demostrado en rojo antes de darlo por bueno (ver el cierre).

const RAIZ = join(__dirname, "..", "..");

/** Textos que son iguales en los dos idiomas a propósito (nombres propios, símbolos). */
const IGUALES_A_PROPOSITO = new Set<string>(["Hablemos San"]);

const MODULOS = import.meta.glob<Record<string, unknown>>("../../src/lib/idioma/textos/*.ts", { eager: true });

async function catalogos(): Promise<Record<string, Catalogo>> {
  const out: Record<string, Catalogo> = {};
  for (const [ruta, mod] of Object.entries(MODULOS)) {
    for (const [nombre, valor] of Object.entries(mod)) {
      if (typeof valor === "object" && valor !== null) out[`${ruta.split("/").pop()}:${nombre}`] = valor as Catalogo;
    }
  }
  return out;
}

const marcadores = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

describe("capa de idioma", () => {
  it("t elige la cara y llena los marcadores; deja intacto el que no tiene dato", () => {
    const x = { es: "hola {n} {z}", en: "hi {n} {z}" };
    expect(t(x, "es", { n: 3 })).toBe("hola 3 {z}");
    expect(t(x, "en", { n: 3, z: "x" })).toBe("hi 3 x");
  });
  it("detectarIdioma: gana la primera preferencia en español o inglés; el resto cae al defecto", () => {
    expect(detectarIdioma(["en-US", "es-CO"])).toBe("en");
    expect(detectarIdioma(["fr-FR", "es-419"])).toBe("es");
    expect(detectarIdioma(["fr-FR"])).toBe("es");
    expect(detectarIdioma([])).toBe("es");
  });
  it("el script previo a la pintura de layout.tsx decide igual que detectarIdioma", () => {
    const fuente = readFileSync(join(RAIZ, "src", "app", "layout.tsx"), "utf8");
    const guion = /const APLICAR_IDIOMA = `([^`]+)`/.exec(fuente)?.[1];
    expect(guion, "no encuentro el script APLICAR_IDIOMA en layout.tsx").toBeTruthy();
    const correr = (guardado: string | null, langs: string[]) => {
      const doc = { documentElement: { lang: "" } };
      const ctx = {
        document: doc,
        localStorage: { getItem: () => guardado },
        navigator: { languages: langs, language: langs[0] },
      };
      vm.runInNewContext(guion!, ctx);
      return doc.documentElement.lang;
    };
    for (const langs of [["en-US", "es-CO"], ["fr-FR", "es-419"], ["fr-FR"], ["es-CO"], ["en"]]) {
      const esperado = detectarIdioma(langs) === "en" ? "en" : "es-CO";
      expect(correr(null, langs), langs.join()).toBe(esperado);
    }
    // La elección guardada manda sobre el navegador.
    expect(correr(JSON.stringify({ idioma: "en" }), ["es-CO"])).toBe("en");
    expect(correr(JSON.stringify({ idioma: "es" }), ["en-US"])).toBe("es-CO");
    expect(correr(JSON.stringify({ idioma: null }), ["en-US"])).toBe("en");
  });
});

describe("paridad de los catálogos de src/lib/idioma/textos", () => {
  it("hay catálogos, y cada texto tiene sus dos caras redactadas", async () => {
    const todos = await catalogos();
    expect(Object.keys(todos).length).toBeGreaterThan(3);
    const problemas: string[] = [];
    let total = 0;
    for (const [nombre, cat] of Object.entries(todos)) {
      for (const [ruta, texto] of textosDe(cat)) {
        total++;
        for (const i of IDIOMAS) {
          if (!texto[i] || texto[i].trim() === "") problemas.push(`${nombre} ${ruta}: «${i}» vacío`);
        }
        if (texto.es === texto.en && !IGUALES_A_PROPOSITO.has(texto.es) && texto.es.length > 3) {
          problemas.push(`${nombre} ${ruta}: es y en idénticos (¿sin redactar?)`);
        }
        if (marcadores(texto.es).join() !== marcadores(texto.en).join()) {
          problemas.push(`${nombre} ${ruta}: marcadores distintos`);
        }
      }
    }
    expect(total).toBeGreaterThan(50);
    expect(problemas).toEqual([]);
  });

  it("textosDe distingue un Texto de un catálogo y encuentra las caras sueltas", () => {
    expect(esTexto({ es: "a", en: "b" })).toBe(true);
    expect(esTexto({ es: "a" })).toBe(false);
    const roto = { a: { es: "x", en: "" }, b: [{ es: "y", en: "z" }] };
    expect([...textosDe(roto as Catalogo)].map(([r]) => r)).toEqual(["a", "b[0]"]);
  });
});

describe("ajuste de idioma", () => {
  it("el defecto sigue al navegador (null) y un valor inválido vuelve a null", () => {
    expect(AJUSTES_DEFECTO.idioma).toBeNull();
    expect(AjustesSchema.parse({}).idioma).toBeNull();
    expect(AjustesSchema.parse({ idioma: "fr" }).idioma).toBeNull();
    expect(AjustesSchema.parse({ idioma: "en" }).idioma).toBe("en");
  });
  it("los ajustes guardados antes del S7 (sin el campo) migran solos", () => {
    const viejo = { modoCalma: true, reducirAnimaciones: false, etapa: "palabras-sueltas", apariencia: "claro", vozFamiliar: true };
    expect(AjustesSchema.parse(viejo)).toMatchObject({ ...viejo, idioma: null });
  });
});

describe("cápsulas del día en los dos idiomas", () => {
  it("cada cápsula trae sus dos caras, dentro de los límites del esquema", async () => {
    const { CAPSULAS } = await import("../../content/capsulas");
    const { CAPSULAS_EN } = await import("../../content/capsulas-en");
    const { BibliotecaSchema } = await import("../../content/schema");
    expect(() => BibliotecaSchema.parse(CAPSULAS)).not.toThrow();
    // Ni una cápsula en inglés huérfana (id que ya no existe en español).
    const ids = new Set(CAPSULAS.map((c) => c.id));
    for (const id of Object.keys(CAPSULAS_EN)) expect(ids.has(id), `id huérfano en capsulas-en: ${id}`).toBe(true);
    for (const c of CAPSULAS) {
      expect(c.guion.en, c.id).not.toContain("\n");
      expect(c.titulo.en, c.id).not.toBe(c.titulo.es);
      expect(c.explicacion.en, c.id).not.toBe(c.explicacion.es);
    }
  });

  it("la cápsula del día es la MISMA id en los dos idiomas (la selección no depende del texto)", async () => {
    const { CAPSULAS } = await import("../../content/capsulas");
    const { seleccionarCapsula } = await import("../../src/lib/coach/daily");
    const { PROGRESO_INICIAL } = await import("../../src/lib/storage/schemas");
    // La misma biblioteca con el inglés cambiado por completo: si la selección mirara el texto, cambiaría.
    const otra = CAPSULAS.map((c) => ({ ...c, titulo: { ...c.titulo, en: "x" }, guion: { ...c.guion, en: "y" } }));
    for (const fecha of ["2026-11-11", "2026-12-24", "2027-02-03"]) {
      for (const etapa of ["sonidos-e-intentos", "palabras-sueltas", "primeras-frases"] as const) {
        const a = seleccionarCapsula(fecha, PROGRESO_INICIAL, CAPSULAS, etapa).capsula.id;
        const b = seleccionarCapsula(fecha, PROGRESO_INICIAL, otra, etapa).capsula.id;
        expect(b, `${fecha} ${etapa}`).toBe(a);
      }
    }
  });
});

describe("lo que el adulto lee en Ajustes y en los nombres", () => {
  it("«Sí mide» nombra el tono del cohete, en los dos idiomas (devolución 026, punto 6)", () => {
    const texto = textosAjustes.mide.si.texto;
    expect(texto.es).toMatch(/tono/i);
    expect(texto.en).toMatch(/pitch/i);
  });

  it("cada técnica y cada tema tiene su nombre en los dos idiomas", () => {
    for (const k of TECNICAS) {
      expect(nombreTecnica[k].es.length, k).toBeGreaterThan(0);
      expect(nombreTecnica[k].en.length, k).toBeGreaterThan(0);
    }
    for (const k of TEMAS) {
      expect(nombreTema[k].es.length, k).toBeGreaterThan(0);
      expect(nombreTema[k].en.length, k).toBeGreaterThan(0);
    }
  });
});
