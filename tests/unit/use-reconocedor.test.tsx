// The recognizer hook (S11, ADR-023): connecting is async, so a disconnect (the game left its phase, the
// adult tapped away) while it is still loading must not leave a Worker or a PCM tap behind, a second
// connect must not stack another one, and a louder WRONG word must not hide the right one.

import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MicSession } from "@/lib/voice/mic-session";

const h = vi.hoisted(() => ({
  terminar: vi.fn(),
  soltar: vi.fn(),
  cargarResolve: null as null | ((v: unknown) => void),
  alOir: null as null | ((o: { palabra: string; conf: number }) => void),
  listaResolve: null as null | (() => void),
}));

vi.mock("@/lib/reconocer/modelo", () => ({
  cargar: () => new Promise((res) => (h.cargarResolve = res)),
  abrirMotor: () => ({
    worker: {},
    modelUrl: "blob:m",
    wasmUrl: "blob:w",
    soltar: h.soltar,
  }),
}));
vi.mock("@/lib/voice/escucha", () => ({
  crearEscucha: (o: { alOir: (x: { palabra: string; conf: number }) => void }) => {
    h.alOir = o.alOir;
    return {
      lista: new Promise<void>((res) => (h.listaResolve = res)),
      oir: () => undefined,
      cerrarFrase: () => undefined,
      terminar: h.terminar,
    };
  },
}));
vi.mock("@/lib/reconocer/vocabulario", () => ({
  gramaticaDelJuego: () => ["perro", "gato", "[unk]"],
}));

import { useReconocedor } from "@/components/juego/use-reconocedor";

const cierreTap = vi.fn();
const mic = {
  getContextInfo: () => ({ sampleRate: 48000 }),
  abrirTapPcm: vi.fn(async () => cierreTap),
} as unknown as MicSession;

const tick = () => new Promise((r) => setTimeout(r, 0));

describe("useReconocedor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.cargarResolve = null;
    h.alOir = null;
    h.listaResolve = null;
  });

  it("desconectar durante la carga no deja Worker ni tap abiertos", async () => {
    const { result } = renderHook(() =>
      useReconocedor({ juego: "palabras", idioma: "es", activo: true }),
    );
    let conectando: Promise<void> = Promise.resolve();
    act(() => {
      conectando = result.current.conectar(mic);
    });
    await act(async () => {
      h.cargarResolve?.({ modelo: 1 });
      await tick();
    });
    // The engine exists and is still loading: the round leaves now.
    act(() => result.current.desconectar());
    await act(async () => {
      h.listaResolve?.();
      await conectando;
    });
    expect(h.terminar).toHaveBeenCalledTimes(1);
    expect(h.soltar).toHaveBeenCalledTimes(1);
    expect(mic.abrirTapPcm).not.toHaveBeenCalled();
    expect(result.current.estado).toBe("apagado");
  });

  it("un segundo conectar mientras carga no apila otro motor", async () => {
    const { result } = renderHook(() =>
      useReconocedor({ juego: "palabras", idioma: "es", activo: true }),
    );
    act(() => {
      void result.current.conectar(mic);
      void result.current.conectar(mic);
    });
    expect(h.cargarResolve).not.toBeNull();
    await act(async () => {
      h.cargarResolve?.({ modelo: 1 });
      await tick();
      h.listaResolve?.();
      await tick();
    });
    expect(mic.abrirTapPcm).toHaveBeenCalledTimes(1);
    expect(result.current.estado).toBe("escuchando");
  });

  it("guarda la mejor audición DE CADA palabra: una palabra más fuerte pero equivocada no esconde la buena", async () => {
    const { result } = renderHook(() =>
      useReconocedor({ juego: "palabras", idioma: "es", activo: true }),
    );
    act(() => {
      void result.current.conectar(mic);
    });
    await act(async () => {
      h.cargarResolve?.({ modelo: 1 });
      await tick();
      h.listaResolve?.();
      await tick();
    });
    act(() => {
      h.alOir?.({ palabra: "gato", conf: 0.95 });
      h.alOir?.({ palabra: "perro", conf: 0.7 });
    });
    expect(result.current.oido).toEqual({ palabra: "gato", conf: 0.95 });
    expect(result.current.oidoDe("perro")).toEqual({ palabra: "perro", conf: 0.7 });
    expect(result.current.oidoDe("luna")).toBeNull();
    act(() => result.current.nuevaRonda());
    expect(result.current.oidoDe("perro")).toBeNull();
    expect(result.current.oido).toBeNull();
  });

  it("el eco de la voz de la app no cuenta como lo que oyó del niño (guarda del bucle)", async () => {
    const { result } = renderHook(() =>
      useReconocedor({ juego: "palabras", idioma: "es", activo: true }),
    );
    act(() => {
      void result.current.conectar(mic);
    });
    await act(async () => {
      h.cargarResolve?.({ modelo: 1 });
      await tick();
      h.listaResolve?.();
      await tick();
    });
    // The app's own voice is about to say a word for 5 s: whatever the engine hears meanwhile is the echo.
    act(() => result.current.silenciar(5000));
    act(() => h.alOir?.({ palabra: "gato", conf: 0.99 }));
    expect(result.current.oido).toBeNull();
    expect(result.current.oidoDe("gato")).toBeNull();
    // The voice did not actually sound (blocked autoplay): the guard lifts and the child is heard again.
    act(() => result.current.silenciar(0));
    act(() => h.alOir?.({ palabra: "gato", conf: 0.8 }));
    expect(result.current.oido).toEqual({ palabra: "gato", conf: 0.8 });
  });
});
