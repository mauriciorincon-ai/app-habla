import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// The test-guide is ONE route (rule 11, milestone close): every step declares which VISION features it
// covers (`data-cubre`), the 21 features are all covered, and no step is repeated.

const RAIZ = path.resolve(__dirname, "../..");
const html = readFileSync(path.join(RAIZ, "docs/GUIA-DE-PRUEBA.html"), "utf8");
const vision = JSON.parse(
  readFileSync(path.join(RAIZ, "docs/vision-funcionalidades.json"), "utf8"),
) as {
  funcionalidades: { id: string; grupo: string; es: string; en: string }[];
};

// Sections of the route (the deferred tablet list is post-cycle and does not count as coverage).
const secciones = html.match(/<section class="bloque[^"]*">[\s\S]*?<\/section>/g) ?? [];
const vigentes = secciones.filter((s) => !s.includes('class="bloque diferida"'));
const pasos = vigentes.flatMap(
  (s) => s.match(/<li data-origen="[^"]*"[^>]*>[\s\S]*?<\/li>/g) ?? [],
);

const texto = (h: string) =>
  h
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

describe("docs/vision-funcionalidades.json", () => {
  it("lists the 21 features of the VISION (17 MVP + 4 roadmap), each with an id and a name in both languages", () => {
    const f = vision.funcionalidades;
    expect(f).toHaveLength(21);
    expect(f.filter((x) => x.grupo === "mvp")).toHaveLength(17);
    expect(f.filter((x) => x.grupo === "roadmap")).toHaveLength(4);
    expect(new Set(f.map((x) => x.id)).size).toBe(21);
    for (const x of f) {
      expect(x.es.length, x.id).toBeGreaterThan(3);
      expect(x.en.length, x.id).toBeGreaterThan(3);
    }
  });
});

describe("la guía de prueba es UN recorrido con su matriz de cobertura", () => {
  const ids = vision.funcionalidades.map((f) => f.id);

  it("every step of the route declares data-cubre with known ids", () => {
    expect(pasos.length).toBeGreaterThan(80);
    for (const paso of pasos) {
      const id = /id="([^"]+)"/.exec(paso)?.[1];
      const cubre = /data-cubre="([^"]*)"/.exec(paso)?.[1];
      expect(cubre, `step ${id} has no data-cubre`).toBeTruthy();
      for (const c of cubre!.split(/\s+/)) {
        expect(ids, `step ${id} covers an unknown id «${c}»`).toContain(c);
      }
    }
  });

  it("the 21 features are covered by at least one step", () => {
    const cubiertas = new Set(
      pasos.flatMap((p) => (/data-cubre="([^"]*)"/.exec(p)?.[1] ?? "").split(/\s+/)),
    );
    expect(ids.filter((i) => !cubiertas.has(i))).toEqual([]);
  });

  it("no step is repeated: ids and texts are unique", () => {
    const todos = (html.match(/<input type="checkbox" id="([^"]+)"/g) ?? []).map((m) => m);
    expect(new Set(todos).size).toBe(todos.length);
    const etiquetas = pasos.map((p) => texto(/<label[^>]*>([\s\S]*?)<\/label>/.exec(p)?.[1] ?? ""));
    const repetidas = etiquetas.filter((t, i) => etiquetas.indexOf(t) !== i);
    expect(repetidas).toEqual([]);
  });

  it("every step says what to expect, and the blocks are lettered once each", () => {
    for (const paso of pasos) {
      expect(paso, /id="([^"]+)"/.exec(paso)?.[1]).toContain('class="esperar"');
    }
    const letras = secciones.map((s) => /<span class="letra">(.*?)<\/span>/.exec(s)?.[1]);
    expect(new Set(letras).size).toBe(letras.length);
  });

  it("says it is one route and has the block of «¿Dijo la palabra?»", () => {
    expect(html).toContain("UN recorrido");
    expect(vigentes.join("")).toContain("¿Dijo la palabra?");
  });
});
