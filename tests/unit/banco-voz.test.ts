import "fake-indexeddb/auto";
import { describe, expect, it, beforeEach } from "vitest";
import {
  catalogoGrabable,
  idPalabra,
  type ItemGrabable,
} from "@/lib/banco-voz/catalogo";
import { calcularCobertura } from "@/lib/banco-voz/cobertura";
import { siguienteLote } from "@/lib/banco-voz/lotes";
import {
  borrarGrabacion,
  guardarGrabacion,
  listarIds,
  obtenerGrabacion,
  vaciarBanco,
  type Grabacion,
} from "@/lib/banco-voz/almacen";
import { resolverFuente } from "@/lib/audio/resolver";

describe("banco-voz: el catálogo grabable", () => {
  const catalogo = catalogoGrabable();

  it("tiene palabras, consignas y celebraciones, con ids únicos", () => {
    const ids = catalogo.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const cat of ["palabra", "consigna", "celebracion"] as const) {
      expect(catalogo.some((i) => i.categoria === cat)).toBe(true);
    }
  });

  it("deduplica las palabras que están en pictos Y en gemelas (pato/gato/luna una vez)", () => {
    const patos = catalogo.filter((i) => i.id === idPalabra("pato"));
    expect(patos).toHaveLength(1);
  });

  it("el id de una palabra ignora tildes (la clave no cambia por un acento)", () => {
    expect(idPalabra("camión")).toBe(idPalabra("camion"));
    expect(idPalabra("pájaro")).toBe("palabra:pajaro");
  });

  it("NO incluye celebraciones con números (esas no se pueden grabar)", () => {
    const celebra = catalogo.filter((i) => i.categoria === "celebracion");
    for (const c of celebra) expect(c.texto).not.toMatch(/\d/);
  });
});

describe("banco-voz: la cobertura", () => {
  it("cuenta grabados por categoría y en total", () => {
    const catalogo: ItemGrabable[] = [
      { id: "palabra:a", categoria: "palabra", texto: "a" },
      { id: "palabra:b", categoria: "palabra", texto: "b" },
      { id: "consigna:x", categoria: "consigna", texto: "x" },
    ];
    const cob = calcularCobertura(new Set(["palabra:a"]), catalogo);
    expect(cob.total).toBe(3);
    expect(cob.grabados).toBe(1);
    const palabras = cob.porCategoria.find((c) => c.categoria === "palabra");
    expect(palabras).toEqual({ categoria: "palabra", grabados: 1, total: 2 });
  });
});

describe("banco-voz: el lote guiado", () => {
  it("pone primero las palabras de los temas elegidos y salta lo ya grabado", () => {
    const lote = siguienteLote({
      temas: ["mar"],
      grabados: new Set(),
      tamano: 5,
    });
    expect(lote.length).toBe(5);
    // El primero debe ser una palabra del tema elegido.
    expect(lote[0].categoria).toBe("palabra");
    expect(lote[0].tema).toBe("mar");
  });

  it("es determinista y respeta el tope", () => {
    const a = siguienteLote({ temas: ["animales"], grabados: new Set() });
    const b = siguienteLote({ temas: ["animales"], grabados: new Set() });
    expect(a.map((i) => i.id)).toEqual(b.map((i) => i.id));
    expect(a.length).toBeLessThanOrEqual(20);
  });

  it("un ítem ya grabado no vuelve a proponerse", () => {
    const primero = siguienteLote({ temas: [], grabados: new Set() })[0];
    const despues = siguienteLote({
      temas: [],
      grabados: new Set([primero.id]),
    });
    expect(despues.map((i) => i.id)).not.toContain(primero.id);
  });
});

describe("banco-voz: el resolver de audio (Outcome 2)", () => {
  it("usa la voz familiar solo si el toggle está activo Y hay grabación", () => {
    expect(
      resolverFuente({ tieneGrabacion: true, vozFamiliarActiva: true }),
    ).toBe("familiar");
    expect(
      resolverFuente({ tieneGrabacion: false, vozFamiliarActiva: true }),
    ).toBe("ninguna");
    expect(
      resolverFuente({ tieneGrabacion: true, vozFamiliarActiva: false }),
    ).toBe("ninguna");
  });
});

describe("banco-voz: el almacén IndexedDB (ADR-010)", () => {
  beforeEach(async () => {
    await vaciarBanco();
  });

  const grabacion = (): Grabacion => ({
    blob: new Blob([new Uint8Array([1, 2, 3, 4])], { type: "audio/webm" }),
    mimeType: "audio/webm;codecs=opus",
    duracionMs: 800,
    fecha: "2026-07-18",
  });

  it("guarda y recupera una grabación byte a byte", async () => {
    await guardarGrabacion("palabra:perro", grabacion());
    const leida = await obtenerGrabacion("palabra:perro");
    expect(leida?.blob.size).toBe(4);
    expect(leida?.mimeType).toBe("audio/webm;codecs=opus");
  });

  it("lista los ids grabados y los borra", async () => {
    await guardarGrabacion("palabra:perro", grabacion());
    await guardarGrabacion("palabra:gato", grabacion());
    expect((await listarIds()).sort()).toEqual([
      "palabra:gato",
      "palabra:perro",
    ]);
    await borrarGrabacion("palabra:gato");
    expect(await listarIds()).toEqual(["palabra:perro"]);
  });

  it("un ítem sin grabar devuelve null (fallback limpio)", async () => {
    expect(await obtenerGrabacion("palabra:no-existe")).toBeNull();
  });
});
