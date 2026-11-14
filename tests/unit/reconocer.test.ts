import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";
import { describe, expect, it, vi } from "vitest";
import {
  quizasDijo,
  quizasLado,
  UMBRAL_QUIZAS,
} from "@/lib/reconocer/coincidencia";
import { gramatica, normalizar } from "@/lib/reconocer/gramatica";
import { archivosDe, direccionModelo, sha256Hex } from "@/lib/reconocer/modelo";
import { preludio } from "@/lib/reconocer/preludio";
import {
  gramaticaDelJuego,
  palabrasDelJuego,
} from "@/lib/reconocer/vocabulario";
import { crearEscucha, type PuertoMotor } from "@/lib/voice/escucha";
import {
  esCargaVosk,
  esErrorVosk,
  esResultadoVosk,
} from "@/lib/voice/protocolo-vosk";
import manifiesto from "../../scripts/modelos.json";

// «¿Dijo la palabra?» (S11, ADR-023): the pure parts and the contract with the recognizer Worker.

describe("gramática cerrada", () => {
  it("minúsculas, sin duplicados, ordenada y con [unk] al final", () => {
    expect(gramatica(["Gato", "pato", " gato ", "", "árbol"])).toEqual([
      "gato",
      "pato",
      "árbol",
      "[unk]",
    ]);
  });
  it("normaliza a NFC", () => {
    expect(normalizar("árbol")).toBe("árbol");
  });
  it("cada juego, cada idioma: solo palabras del juego", () => {
    for (const idioma of ["es", "en"] as const) {
      for (const juego of ["palabras", "gemelas"] as const) {
        const g = gramaticaDelJuego(juego, idioma);
        expect(g.at(-1)).toBe("[unk]");
        expect(g.length).toBeGreaterThan(5);
        expect(new Set(g).size).toBe(g.length);
      }
    }
    expect(palabrasDelJuego("palabras", "en")).toContain("dog");
    expect(palabrasDelJuego("palabras", "es")).toContain("perro");
  });
});

describe("el «quizás» (regla dura 3)", () => {
  it("solo la palabra de la ronda con confianza suficiente", () => {
    expect(quizasDijo({ palabra: "perro", conf: 0.9 }, "Perro")).toBe(true);
    expect(
      quizasDijo({ palabra: "perro", conf: UMBRAL_QUIZAS - 0.01 }, "perro"),
    ).toBe(false);
    expect(quizasDijo({ palabra: "gato", conf: 0.99 }, "perro")).toBe(false);
    expect(quizasDijo(null, "perro")).toBe(false);
    expect(quizasDijo({ palabra: "perro", conf: Number.NaN }, "perro")).toBe(
      false,
    );
  });
  it("en gemelas, el lado que quizás oyó o nada", () => {
    expect(
      quizasLado({ palabra: "gato", conf: 0.8 }, { a: "pato", b: "gato" }),
    ).toBe("b");
    expect(
      quizasLado({ palabra: "mano", conf: 0.8 }, { a: "pato", b: "gato" }),
    ).toBeNull();
  });
});

describe("contrato con el Worker (regla 19)", () => {
  it("las guardias aceptan solo la forma esperada", () => {
    expect(
      esResultadoVosk({
        event: "result",
        recognizerId: "x",
        result: { result: [{ word: "a", conf: 1 }] },
      }),
    ).toBe(true);
    expect(
      esResultadoVosk({
        event: "result",
        recognizerId: "x",
        result: { result: [{ word: 3, conf: 1 }] },
      }),
    ).toBe(false);
    expect(
      esResultadoVosk({
        event: "partialresult",
        recognizerId: "x",
        result: { partial_result: [] },
      }),
    ).toBe(false);
    expect(esCargaVosk({ event: "load", result: true })).toBe(true);
    expect(esErrorVosk({ event: "error", error: "x" })).toBe(true);
    expect(esErrorVosk("error")).toBe(false);
  });
});

function motorFalso() {
  const enviados: unknown[] = [];
  const motor: PuertoMotor & { decir(m: unknown): void } = {
    onmessage: null,
    postMessage: (m) => enviados.push(m),
    terminate: vi.fn(),
    decir(m) {
      this.onmessage?.({ data: m } as MessageEvent);
    },
  };
  return { motor, enviados };
}

describe("la escucha devuelve solo palabra y confianza (regla dura 2)", () => {
  it("carga, crea con la gramática y entrega {palabra, conf} y nada más", async () => {
    const { motor, enviados } = motorFalso();
    const oidos: unknown[] = [];
    const e = crearEscucha({
      motor,
      modelUrl: "/modelos/es.zip?v=1",
      wasmUrl: "blob:w",
      gramatica: ["perro", "[unk]"],
      sampleRate: 48000,
      alOir: (o) => oidos.push(o),
    });
    expect(enviados[0]).toEqual({
      action: "load",
      modelUrl: "/modelos/es.zip?v=1",
      wasmUrl: "blob:w",
    });
    e.oir(new Float32Array(4)); // antes de cargar: se descarta
    expect(enviados).toHaveLength(1);
    motor.decir({ event: "load", result: true });
    await e.lista;
    expect(enviados[1]).toMatchObject({
      action: "create",
      grammar: '["perro","[unk]"]',
      sampleRate: 48000,
    });
    e.oir(new Float32Array(4));
    expect(enviados.at(-1)).toMatchObject({
      action: "audioChunk",
      sampleRate: 48000,
    });
    motor.decir({
      event: "result",
      recognizerId: "habla",
      result: {
        result: [
          { word: "perro", conf: 0.8, start: 0, end: 1 },
          { word: "[unk]", conf: 1, start: 1, end: 2 },
        ],
        text: "perro",
      },
    });
    motor.decir({
      event: "partialresult",
      recognizerId: "habla",
      result: { partial_result: [], partial: "pe" },
    });
    expect(oidos).toEqual([{ palabra: "perro", conf: 0.8 }]);
    expect(Object.keys(oidos[0] as object).sort()).toEqual(["conf", "palabra"]);
    e.terminar();
    expect(motor.terminate).toHaveBeenCalled();
    motor.decir({
      event: "result",
      recognizerId: "habla",
      result: { result: [{ word: "perro", conf: 1 }] },
    });
    expect(oidos).toHaveLength(1);
  });

  it("si el modelo no carga, la promesa falla y no se escucha", async () => {
    const { motor } = motorFalso();
    const e = crearEscucha({
      motor,
      modelUrl: "m",
      wasmUrl: "w",
      gramatica: ["[unk]"],
      sampleRate: 16000,
      alOir: () => undefined,
    });
    motor.decir({ event: "error", error: "boom" });
    await expect(e.lista).rejects.toThrow("reconocedor-error");
  });
});

describe("el preludio le quita la red al Worker", () => {
  function correr(mapa: Record<string, string>) {
    const pedidas: string[] = [];
    const self: Record<string, unknown> = {
      location: { href: "blob:http://127.0.0.1:3500/uuid" },
      fetch: (u: string) => {
        pedidas.push(u);
        return Promise.resolve("ok");
      },
      XMLHttpRequest: class {},
      WebSocket: class {},
      EventSource: class {},
      navigator: { sendBeacon: () => true },
    };
    vm.runInNewContext(preludio(mapa), {
      self,
      URL,
      Set,
      Object,
      Promise,
      TypeError,
      String,
      JSON,
    });
    return { self, pedidas };
  }

  it("solo responde las direcciones del mapa, con su blob verificado", async () => {
    const { self, pedidas } = correr({
      "/modelos/es.zip?v=abc": "blob:modelo",
      "blob:wasm": "blob:wasm",
    });
    const f = self.fetch as (u: string) => Promise<unknown>;
    await f("http://127.0.0.1:3500/modelos/es.zip?v=abc");
    await f("blob:wasm");
    expect(pedidas).toEqual(["blob:modelo", "blob:wasm"]);
    await expect(f("https://example.com/x")).rejects.toThrow("no network");
    await expect(f("/otra")).rejects.toThrow("no network");
    expect(pedidas).toHaveLength(2);
  });

  it("quita XMLHttpRequest, WebSocket, EventSource, importScripts y sendBeacon", () => {
    const { self } = correr({});
    expect(self.XMLHttpRequest).toBeUndefined();
    expect(self.WebSocket).toBeUndefined();
    expect(self.EventSource).toBeUndefined();
    expect(() => (self.importScripts as () => void)()).toThrow();
    expect((self.navigator as { sendBeacon: () => boolean }).sendBeacon()).toBe(
      false,
    );
  });
});

describe("huellas fijas", () => {
  it("cada archivo del reconocedor tiene su SHA-256 de 64 hex, y la dirección cambia con el modelo", () => {
    for (const idioma of ["es", "en"] as const) {
      const a = archivosDe(idioma);
      expect(a).toHaveLength(3);
      for (const x of a) expect(x.sha256).toMatch(/^[0-9a-f]{64}$/);
      expect(direccionModelo(idioma)).toBe(
        `/modelos/${idioma}.zip?v=${manifiesto.modelos[idioma].sha256.slice(0, 12)}`,
      );
      expect(manifiesto.modelos[idioma].licencia).toBe("Apache-2.0");
    }
  });

  it("sha256Hex coincide con node:crypto", async () => {
    const datos = new TextEncoder().encode("habla");
    const esperado = createHash("sha256").update(datos).digest("hex");
    expect(await sha256Hex(datos.buffer as ArrayBuffer)).toBe(esperado);
  });

  it("el motor del paquete instalado coincide con su huella", () => {
    const dist = resolve(
      __dirname,
      "../../node_modules/@lichess-org/vosk-browser/dist",
    );
    for (const [archivo, sha] of Object.entries(manifiesto.motor.archivos)) {
      const real = createHash("sha256")
        .update(readFileSync(resolve(dist, archivo)))
        .digest("hex");
      expect(real, archivo).toBe(sha);
    }
  });
});

describe("modelo: descargar, verificar, cargar y borrar (sin red durante el juego)", () => {
  // Small fake files whose pinned hashes we fake by patching the manifest values in memory.
  const contenido: Record<string, Uint8Array> = {
    "/vosk/vosk.worker.js": new TextEncoder().encode("worker"),
    "/vosk/vosk.wasm": new TextEncoder().encode("wasm"),
    "/modelos/es.zip": new TextEncoder().encode("modelo-es"),
  };
  const huella = (b: Uint8Array) => createHash("sha256").update(b).digest("hex");

  function cachesFalsas() {
    const tiendas = new Map<string, Map<string, Response>>();
    return {
      tiendas,
      open: async (n: string) => {
        if (!tiendas.has(n)) tiendas.set(n, new Map());
        const t = tiendas.get(n)!;
        return {
          match: async (k: string) => t.get(k)?.clone(),
          put: async (k: string, r: Response) => void t.set(k, r),
        };
      },
      delete: async (n: string) => tiendas.delete(n),
    };
  }

  async function conManifiestoFalso<T>(f: () => Promise<T>): Promise<T> {
    const m = manifiesto as unknown as {
      motor: { archivos: Record<string, string> };
      modelos: Record<string, { sha256: string }>;
    };
    const antes = { w: m.motor.archivos["vosk.worker.js"], a: m.motor.archivos["vosk.wasm"], e: m.modelos.es.sha256 };
    m.motor.archivos["vosk.worker.js"] = huella(contenido["/vosk/vosk.worker.js"]);
    m.motor.archivos["vosk.wasm"] = huella(contenido["/vosk/vosk.wasm"]);
    m.modelos.es.sha256 = huella(contenido["/modelos/es.zip"]);
    try {
      return await f();
    } finally {
      m.motor.archivos["vosk.worker.js"] = antes.w;
      m.motor.archivos["vosk.wasm"] = antes.a;
      m.modelos.es.sha256 = antes.e;
    }
  }

  it("descarga con progreso, guarda solo lo verificado y lo vuelve a entregar sin red", async () => {
    const c = cachesFalsas();
    const pedidas: string[] = [];
    vi.stubGlobal("caches", c);
    vi.stubGlobal("fetch", async (u: string) => {
      pedidas.push(u);
      return new Response(contenido[u] as BodyInit);
    });
    const m = await import("@/lib/reconocer/modelo");
    await conManifiestoFalso(async () => {
      expect(await m.estaDescargado("es")).toBe(false);
      const progreso: number[] = [];
      await m.descargar("es", (p) => progreso.push(p.bytes));
      expect(pedidas).toEqual(["/vosk/vosk.worker.js", "/vosk/vosk.wasm", "/modelos/es.zip"]);
      expect(progreso.length).toBeGreaterThan(0);
      expect(await m.estaDescargado("es")).toBe(true);
      pedidas.length = 0;
      const a = await m.cargar("es");
      expect(pedidas).toEqual([]); // cargar no usa la red
      expect(a && (await a.modelo.text())).toBe("modelo-es");
      await m.descargar("es"); // ya está: nada que bajar
      expect(pedidas).toEqual([]);
    });
    vi.unstubAllGlobals();
  });

  it("un archivo que no coincide con su huella no se guarda", async () => {
    const c = cachesFalsas();
    vi.stubGlobal("caches", c);
    vi.stubGlobal("fetch", async () => new Response("alterado"));
    const m = await import("@/lib/reconocer/modelo");
    await conManifiestoFalso(async () => {
      await expect(m.descargar("es")).rejects.toThrow("reconocedor-huella");
      expect(await m.estaDescargado("es")).toBe(false);
      expect(await m.cargar("es")).toBeNull();
    });
    vi.unstubAllGlobals();
  });

  it("un archivo guardado que cambió no se carga", async () => {
    const c = cachesFalsas();
    vi.stubGlobal("caches", c);
    const m = await import("@/lib/reconocer/modelo");
    await conManifiestoFalso(async () => {
      const t = await c.open(m.CACHE_RECONOCEDOR);
      await t.put("/vosk/vosk.worker.js", new Response("worker"));
      await t.put("/vosk/vosk.wasm", new Response("otro"));
      await t.put("/modelos/es.zip", new Response("modelo-es"));
      expect(await m.cargar("es")).toBeNull();
    });
    vi.unstubAllGlobals();
  });

  it("abre el Worker como módulo, con el preludio delante, y suelta las URLs", async () => {
    const creadas: Blob[] = [];
    const revocadas: string[] = [];
    let opciones: unknown = null;
    vi.stubGlobal("Worker", class {
      constructor(_u: string, o: unknown) {
        opciones = o;
      }
    });
    const crear = vi.spyOn(URL, "createObjectURL").mockImplementation((b) => {
      creadas.push(b as Blob);
      return `blob:${creadas.length}`;
    });
    const revocar = vi.spyOn(URL, "revokeObjectURL").mockImplementation((u) => void revocadas.push(u));
    const m = await import("@/lib/reconocer/modelo");
    const abierto = m.abrirMotor("es", {
      worker: new Blob(["VOSK"]),
      wasm: new Blob(["w"]),
      modelo: new Blob(["m"]),
    });
    expect(opciones).toEqual({ type: "module" });
    const fuente = await creadas[2].text();
    expect(fuente.indexOf("has no network")).toBeLessThan(fuente.indexOf("VOSK"));
    expect(abierto.modelUrl).toBe(m.direccionModelo("es"));
    abierto.soltar();
    expect(revocadas).toHaveLength(3);
    crear.mockRestore();
    revocar.mockRestore();
    vi.unstubAllGlobals();
  });

  it("borrar quita la caché y la base del motor", async () => {
    const c = cachesFalsas();
    await c.open("habla-reconocedor-v1");
    const borradas: string[] = [];
    vi.stubGlobal("caches", c);
    vi.stubGlobal("indexedDB", {
      deleteDatabase: (n: string) => {
        borradas.push(n);
        const r: { onsuccess?: () => void } = {};
        setTimeout(() => r.onsuccess?.(), 0);
        return r;
      },
    });
    const m = await import("@/lib/reconocer/modelo");
    await m.borrar();
    expect(c.tiendas.has("habla-reconocedor-v1")).toBe(false);
    expect(borradas).toEqual(["/vosk"]);
    expect(m.bytesDe("es")).toBeGreaterThan(39_000_000);
    vi.unstubAllGlobals();
  });
});
