import "fake-indexeddb/auto";
import { describe, expect, it } from "vitest";
import {
  borrarClip,
  guardarClip,
  listarClips,
  obtenerClip,
  type ClipMeta,
} from "@/lib/videoteca/almacen";
import {
  CONDUCTAS,
  MAX_BYTES,
  MAX_CLIPS,
  MAX_DURACION_S,
  MAX_QUIEN,
  limpiarQuien,
  revisarClip,
} from "@/lib/videoteca/reglas";
import { borrarTodo } from "@/lib/storage/local";

// VIDEOTECA DE LA FAMILIA (S8): las reglas puras, el almacén local y la promesa de «borrar todo».
// Los clips se fabrican aquí (bytes sintéticos): jamás hay un video real en el repo.

const clip = (id: string, extra: Partial<ClipMeta> = {}): ClipMeta => ({
  id,
  conducta: "saludar",
  quien: "",
  mimeType: "video/mp4",
  duracionS: 5,
  bytes: 3,
  fecha: "2026-11-12",
  ...extra,
});
const bytes = () => new Blob([new Uint8Array([1, 2, 3])], { type: "video/mp4" });

describe("reglas del clip", () => {
  const ok = { size: 1000, type: "video/mp4" };
  it("acepta un video corto y pequeño", () => {
    expect(revisarClip(ok, 12, 0)).toEqual({ ok: true });
  });
  it("acepta un video cuya duración no se pudo leer (decide el adulto)", () => {
    expect(revisarClip(ok, null, 0)).toEqual({ ok: true });
  });
  it("rechaza lo que no es video", () => {
    expect(revisarClip({ size: 10, type: "image/png" }, 1, 0)).toEqual({ ok: false, motivo: "no-es-video" });
  });
  it("rechaza el clip demasiado largo, con el borde exacto aceptado", () => {
    expect(revisarClip(ok, MAX_DURACION_S, 0).ok).toBe(true);
    expect(revisarClip(ok, MAX_DURACION_S + 0.5, 0)).toEqual({ ok: false, motivo: "demasiado-largo" });
  });
  it("rechaza el clip demasiado grande, con el borde exacto aceptado", () => {
    expect(revisarClip({ size: MAX_BYTES, type: "video/mp4" }, 5, 0).ok).toBe(true);
    expect(revisarClip({ size: MAX_BYTES + 1, type: "video/mp4" }, 5, 0)).toEqual({ ok: false, motivo: "demasiado-grande" });
  });
  it("rechaza cuando la videoteca está llena", () => {
    expect(revisarClip(ok, 5, MAX_CLIPS - 1).ok).toBe(true);
    expect(revisarClip(ok, 5, MAX_CLIPS)).toEqual({ ok: false, motivo: "sin-lugar" });
  });
  it("«quién aparece» se limpia: sin saltos, sin espacios sobrantes, con tope", () => {
    expect(limpiarQuien("  la   abuela \n ")).toBe("la abuela");
    expect(limpiarQuien("x".repeat(200))).toHaveLength(MAX_QUIEN);
  });
  it("las conductas son tres: pedir, saludar, jugar", () => {
    expect([...CONDUCTAS]).toEqual(["pedir", "saludar", "jugar"]);
  });
});

describe("almacén local de la videoteca", () => {
  it("vacío al inicio, y preguntar no crea la base", async () => {
    expect(await listarClips()).toEqual([]);
    expect(await obtenerClip("nada")).toBeNull();
    const bases = await indexedDB.databases();
    expect(bases.some((b) => b.name === "habla-videoteca")).toBe(false);
  });

  it("guardar → listar (lo más nuevo primero) → obtener → borrar UNO", async () => {
    await guardarClip(clip("a", { fecha: "2026-11-10" }), bytes());
    await guardarClip(clip("b", { fecha: "2026-11-12", quien: "la abuela", conducta: "jugar" }), bytes());
    const lista = await listarClips();
    expect(lista.map((c) => c.id)).toEqual(["b", "a"]);
    expect(lista[0]).toMatchObject({ quien: "la abuela", conducta: "jugar" });
    const blob = await obtenerClip("a");
    expect(blob?.type).toBe("video/mp4");
    expect(blob?.size).toBe(3);

    await borrarClip("a");
    expect((await listarClips()).map((c) => c.id)).toEqual(["b"]);
    expect(await obtenerClip("a")).toBeNull();
    await borrarClip("a"); // borrar lo que ya no está no truena
  });

  it("«Borrar mis datos» borra TAMBIÉN la videoteca, y espera el borrado real", async () => {
    await guardarClip(clip("c"), bytes());
    expect((await listarClips()).length).toBeGreaterThan(0);
    await borrarTodo();
    expect(await listarClips()).toEqual([]);
    const bases = await indexedDB.databases();
    expect(bases.some((b) => b.name === "habla-videoteca")).toBe(false);
  });
});
