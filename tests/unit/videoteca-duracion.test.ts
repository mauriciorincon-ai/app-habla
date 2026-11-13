import { afterEach, describe, expect, it, vi } from "vitest";
import "fake-indexeddb/auto";
import { guardarClip, listarClips, obtenerClip, type ClipMeta } from "@/lib/videoteca/almacen";
import { leerDuracion } from "@/lib/videoteca/duracion";

// Adaptador DOM de la videoteca (S8): lee la duración del clip desde su metadato, en el dispositivo.
// El <video> de jsdom no decodifica nada: se dispara a mano lo que el navegador dispararía.

function conVideo() {
  const url = vi.fn(() => "blob:local");
  const revocar = vi.fn();
  Object.assign(URL, { createObjectURL: url, revokeObjectURL: revocar });
  vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => undefined);
  let video!: HTMLVideoElement;
  const crear = document.createElement.bind(document);
  vi.spyOn(document, "createElement").mockImplementation(((tag: string) => {
    const el = crear(tag);
    if (tag === "video") video = el as HTMLVideoElement;
    return el;
  }) as typeof document.createElement);
  return { revocar, video: () => video };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("leerDuracion", () => {
  it("devuelve la duración cuando el navegador lee el metadato, y suelta el blob:", async () => {
    const { video, revocar } = conVideo();
    const p = leerDuracion(new Blob(["x"]));
    Object.defineProperty(video(), "duration", { value: 12.4, configurable: true });
    video().onloadedmetadata?.(new Event("loadedmetadata"));
    await expect(p).resolves.toBe(12.4);
    expect(revocar).toHaveBeenCalledWith("blob:local");
  });

  it("una duración infinita (clips sin metadato) cuenta como ilegible: null", async () => {
    const { video } = conVideo();
    const p = leerDuracion(new Blob(["x"]));
    Object.defineProperty(video(), "duration", { value: Infinity, configurable: true });
    video().onloadedmetadata?.(new Event("loadedmetadata"));
    await expect(p).resolves.toBeNull();
  });

  it("si el códec no se entiende (error) devuelve null", async () => {
    const { video } = conVideo();
    const p = leerDuracion(new Blob(["x"]));
    video().onerror?.(new Event("error"));
    await expect(p).resolves.toBeNull();
  });

  it("si el navegador no responde, se rinde a tiempo con null", async () => {
    conVideo();
    await expect(leerDuracion(new Blob(["x"]), 10)).resolves.toBeNull();
  });
});

describe("almacén: los caminos de fallo son honestos", () => {
  const meta: ClipMeta = {
    id: "clip-x",
    conducta: "jugar",
    quien: "",
    mimeType: "video/mp4",
    duracionS: 3,
    bytes: 1,
    fecha: "2026-11-12",
  };

  it("sin IndexedDB, guardar rechaza, y listar y obtener devuelven vacío", async () => {
    vi.stubGlobal("indexedDB", undefined);
    await expect(guardarClip(meta, new Blob(["x"]))).rejects.toThrow();
    await expect(listarClips()).resolves.toEqual([]);
    await expect(obtenerClip("clip-x")).resolves.toBeNull();
  });

  it("si la escritura falla, rechaza y no deja nada a medias", async () => {
    const roto = { ...meta, id: "clip-roto", borrame: () => 1 } as unknown as ClipMeta;
    await expect(guardarClip(roto, new Blob(["x"]))).rejects.toThrow();
    expect((await listarClips()).some((c) => c.id === "clip-roto")).toBe(false);
  });
});
