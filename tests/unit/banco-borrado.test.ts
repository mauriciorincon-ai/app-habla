import "fake-indexeddb/auto";
import { describe, expect, it, vi } from "vitest";
import {
  guardarGrabacion,
  listarIds,
  pedirPersistencia,
} from "@/lib/banco-voz/almacen";
import { borrarTodo } from "@/lib/storage/local";

// AUDITORÍA S3 (A-3 + M-1): la promesa "Borrar mis datos" incluye el banco de voz, y el almacén
// no se envenena por un fallo transitorio de IndexedDB. Archivo aparte de banco-voz.test.ts a
// propósito: estos tests manipulan el estado de la CONEXIÓN del módulo y su orden importa.

describe("almacén: un fallo al abrir NO envenena la sesión (M-1)", () => {
  // Este test corre PRIMERO en el archivo: necesita que el módulo aún no tenga conexión cacheada.
  it("si indexedDB.open truena, la operación falla… y el siguiente intento REABRE", async () => {
    const roto = {
      open() {
        throw new Error("idb roto (simulado)");
      },
    };
    vi.stubGlobal("indexedDB", roto);
    await expect(listarIds()).rejects.toThrow("idb roto");
    vi.unstubAllGlobals();

    // Sin el arreglo, la promesa rechazada quedaba cacheada y TODO fallaba para siempre.
    await expect(listarIds()).resolves.toEqual([]);
  });
});

describe('"Borrar mis datos" borra TAMBIÉN el banco de voz (A-3, regla dura 2-bis)', () => {
  it("guardar → borrarTodo() esperado → el banco reabre VACÍO", async () => {
    await guardarGrabacion("palabra:perro", {
      blob: new Blob([new Uint8Array([1, 2, 3])], { type: "audio/webm" }),
      mimeType: "audio/webm",
      duracionMs: 500,
      fecha: "2026-07-19",
    });
    expect(await listarIds()).toEqual(["palabra:perro"]);
    window.localStorage.setItem("habla:v1:perfil", '{"temas":["mar"]}');

    // La promesa DEBE esperarse (por eso borrarTodo es async): quien navega antes de que
    // resuelva podría dejar la voz de la familia atrás — el botón mentiría.
    await borrarTodo();

    expect(await listarIds()).toEqual([]);
    expect(window.localStorage.getItem("habla:v1:perfil")).toBeNull();
  });
});

describe("pedirPersistencia: sin la API, responde false sin romperse", () => {
  it("en un entorno sin navigator.storage devuelve false", async () => {
    expect(await pedirPersistencia()).toBe(false);
  });
});
