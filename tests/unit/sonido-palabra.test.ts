import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  duracionEstimadaMs,
  sonidoDePalabra,
  volumenDe,
  vozLocalPara,
  type VozAparato,
} from "@/lib/audio/sonido-palabra";
import { alCambiarVoces, decirConVozDelAparato, vocesDelAparato } from "@/lib/audio/voz-aparato";

// EL PICTOGRAMA SIEMPRE SUENA (S15, ADR-027, G-Plan «1 a»): la grabación de la familia gana; sin ella,
// la voz del aparato SOLO si corre en el aparato; sin ninguna, nada. Jamás una voz de red.

const LOCAL_ES: VozAparato = {
  name: "Local ES",
  lang: "es-ES",
  localService: true,
};
const RED_ES: VozAparato = {
  name: "Red ES",
  lang: "es-US",
  localService: false,
};
const LOCAL_EN: VozAparato = {
  name: "Local EN",
  lang: "en_US",
  localService: true,
};

const base = {
  tieneGrabacion: false,
  vozFamiliarActiva: true,
  voces: [RED_ES, LOCAL_ES, LOCAL_EN],
  idioma: "es" as const,
  sonidos: "normal" as const,
};

describe("con qué suena una palabra", () => {
  it("la grabación de la familia siempre gana", () => {
    expect(sonidoDePalabra({ ...base, tieneGrabacion: true })).toBe(
      "grabacion",
    );
    // …aunque los sonidos de la app estén apagados: la voz de la familia va aparte.
    expect(
      sonidoDePalabra({ ...base, tieneGrabacion: true, sonidos: "apagado" }),
    ).toBe("grabacion");
  });

  it("sin grabación, la voz local del aparato en el idioma de la pantalla", () => {
    expect(sonidoDePalabra(base)).toBe("base");
    expect(vozLocalPara(base.voces, "es")).toEqual(LOCAL_ES);
    expect(vozLocalPara(base.voces, "en")).toEqual(LOCAL_EN);
  });

  it("una voz de red jamás cuenta: si solo hay de red, queda mudo", () => {
    expect(vozLocalPara([RED_ES], "es")).toBeNull();
    expect(sonidoDePalabra({ ...base, voces: [RED_ES] })).toBe("nada");
    expect(sonidoDePalabra({ ...base, voces: [] })).toBe("nada");
  });

  it("con la voz familiar apagada, la grabación no suena y entra la voz del aparato", () => {
    expect(
      sonidoDePalabra({
        ...base,
        tieneGrabacion: true,
        vozFamiliarActiva: false,
      }),
    ).toBe("base");
  });

  it("«Sonidos de la app»: normal, suave a la mitad, apagado calla la voz del aparato", () => {
    expect(volumenDe("normal")).toBe(1);
    expect(volumenDe("suave")).toBe(0.5);
    expect(volumenDe("apagado")).toBe(0);
    expect(sonidoDePalabra({ ...base, sonidos: "apagado" })).toBe("nada");
    expect(duracionEstimadaMs("pato")).toBeGreaterThan(600);
  });
});

describe("el adaptador de la voz del aparato", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function simular(voces: VozAparato[]) {
    const speak = vi.fn();
    const sintesis = {
      getVoices: () => voces,
      speak,
      cancel: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    vi.stubGlobal("speechSynthesis", sintesis);
    class Frase {
      voice: unknown = null;
      lang = "";
      volume = 1;
      rate = 1;
      constructor(public text: string) {}
      addEventListener() {}
    }
    vi.stubGlobal("SpeechSynthesisUtterance", Frase);
    return speak;
  }

  it("elige la voz local y la usa con el volumen de «Sonidos de la app»", () => {
    const speak = simular([RED_ES, LOCAL_ES]);
    const guarda = vi.fn();
    expect(decirConVozDelAparato("pato", "es", 0.5, guarda)).toBe(true);
    const frase = speak.mock.calls[0][0];
    expect(frase.voice.name).toBe("Local ES");
    expect(frase.volume).toBe(0.5);
    expect(guarda).toHaveBeenCalledWith(duracionEstimadaMs("pato"));
  });

  it("lee las voces del sistema y se suscribe a su llegada tardía", () => {
    simular([LOCAL_ES, RED_ES]);
    expect(vocesDelAparato()).toEqual([LOCAL_ES, RED_ES]);
    const s = (globalThis as unknown as { speechSynthesis: { addEventListener: ReturnType<typeof vi.fn>; removeEventListener: ReturnType<typeof vi.fn> } }).speechSynthesis;
    const soltar = alCambiarVoces(() => undefined);
    expect(s.addEventListener).toHaveBeenCalledWith("voiceschanged", expect.any(Function));
    soltar();
    expect(s.removeEventListener).toHaveBeenCalled();
  });

  it("un navegador sin síntesis: sin voces, sin suscripción y sin sonar", () => {
    const original = Object.getOwnPropertyDescriptor(window, "speechSynthesis");
    // @ts-expect-error -- simulating a browser without the API
    delete window.speechSynthesis;
    expect(vocesDelAparato()).toEqual([]);
    expect(alCambiarVoces(() => undefined)).toBeTypeOf("function");
    expect(decirConVozDelAparato("pato", "es", 1)).toBe(false);
    if (original) Object.defineProperty(window, "speechSynthesis", original);
  });

  it("el final de una frase cancelada no levanta la guarda de la que la reemplaza", () => {
    const frases: { addEventListener: (t: string, f: () => void) => void; fin?: () => void }[] = [];
    const speak = vi.fn();
    vi.stubGlobal("speechSynthesis", {
      getVoices: () => [LOCAL_ES],
      speak,
      cancel: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    class Frase {
      voice: unknown = null;
      lang = "";
      volume = 1;
      rate = 1;
      fin?: () => void;
      constructor(public text: string) {
        frases.push(this);
      }
      addEventListener(tipo: string, f: () => void) {
        if (tipo === "end") this.fin = f;
      }
    }
    vi.stubGlobal("SpeechSynthesisUtterance", Frase);
    const guarda = vi.fn();
    decirConVozDelAparato("pato", "es", 1, guarda);
    decirConVozDelAparato("gato", "es", 1, guarda);
    guarda.mockClear();
    // The first phrase was cancelled by the second: its late `end` must stay silent.
    frases[0].fin?.();
    expect(guarda).not.toHaveBeenCalled();
    // The current phrase ending does lift the guard.
    frases[1].fin?.();
    expect(guarda).toHaveBeenCalledWith(0);
  });

  it("sin voz local, o con volumen 0, no dice nada", () => {
    const speak = simular([RED_ES]);
    expect(decirConVozDelAparato("pato", "es", 1)).toBe(false);
    simular([LOCAL_ES]);
    expect(decirConVozDelAparato("pato", "es", 0)).toBe(false);
    expect(speak).not.toHaveBeenCalled();
  });
});

describe("privacidad: speechSynthesis vive en UN solo archivo", () => {
  const SRC = join(process.cwd(), "src");
  const archivos = (dir: string): string[] =>
    readdirSync(dir).flatMap((f) => {
      const p = join(dir, f);
      return statSync(p).isDirectory()
        ? archivos(p)
        : /\.(ts|tsx)$/.test(f)
          ? [p]
          : [];
    });

  it("solo src/lib/audio/voz-aparato.ts toca speechSynthesis", () => {
    const usan = archivos(SRC)
      .filter((p) =>
        /speechSynthesis|SpeechSynthesisUtterance/.test(
          readFileSync(p, "utf8"),
        ),
      )
      .map((p) => p.slice(SRC.length + 1));
    expect(usan).toEqual(["lib/audio/voz-aparato.ts"]);
  });

  it("el adaptador filtra por localService y no importa nada del micrófono ni de red", () => {
    const codigo = readFileSync(join(SRC, "lib/audio/voz-aparato.ts"), "utf8");
    expect(codigo).toMatch(/localService === true/);
    expect(codigo).not.toMatch(
      /fetch\(|XMLHttpRequest|WebSocket|getUserMedia|lib\/voice|localStorage|indexedDB/,
    );
  });
});
