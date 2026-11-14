import "fake-indexeddb/auto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, expect, it } from "vitest";
import { guardarGrabacion, listarIds, obtenerGrabacion, eliminarBanco } from "@/lib/banco-voz/almacen";
import { abrirArchivo, aplicar, crearArchivo } from "@/lib/otra-casa/casa";
import { cifrar, descifrar, fraseValida, FORMATO } from "@/lib/otra-casa/cifrado";
import { fusionar, type Local } from "@/lib/otra-casa/fusion";
import { CAMPOS_DEL_PAQUETE, leerPaquete, nombreArchivo, type Paquete } from "@/lib/otra-casa/paquete";
import {
  CLAVES,
  guardarPerfil,
  guardar,
  leerObjetivo,
  leerSesiones,
  registrarSesion,
} from "@/lib/storage/local";
import { ObjetivoSchema, PROGRESO_INICIAL } from "@/lib/storage/schemas";

// «Pasar a la otra casa» (S10, ADR-020). Decisión «1a»: cifrado con una frase. Perfil inventado.
// En las pruebas, 100 000 iteraciones (el mínimo que un archivo puede pedir) para no tardar.

const FRASE = "el tren azul de los martes";
const IT = 100_000;
const siempre = () => true;
const nunca = () => false;

function instantanea(): Record<string, string | null> {
  return Object.fromEntries(Object.values(CLAVES).map((k) => [k, localStorage.getItem(k)]));
}

describe("el cifrado (decisión «1a»)", () => {
  it("ida y vuelta con la frase; la frase no aparece en el sobre", async () => {
    const sobre = await cifrar("hola casa", FRASE, IT);
    expect(sobre.formato).toBe(FORMATO);
    expect(JSON.stringify(sobre)).not.toContain(FRASE);
    expect(JSON.stringify(sobre)).not.toContain("hola casa");
    expect(await descifrar(sobre, FRASE)).toEqual({ ok: true, texto: "hola casa" });
  });

  it("otra frase: rechazado, sin texto", async () => {
    const sobre = await cifrar("hola casa", FRASE, IT);
    expect(await descifrar(sobre, "otra frase distinta")).toEqual({ ok: false, motivo: "frase" });
  });

  it("un byte cambiado: rechazado (AES-GCM autentica)", async () => {
    const sobre = await cifrar("hola casa", FRASE, IT);
    const datos = sobre.datos;
    const cambiado = { ...sobre, datos: (datos[0] === "A" ? "B" : "A") + datos.slice(1) };
    expect((await descifrar(cambiado, FRASE)).ok).toBe(false);
  });

  it("sal e IV nuevos en cada archivo", async () => {
    const a = await cifrar("x", FRASE, IT);
    const b = await cifrar("x", FRASE, IT);
    expect(a.kdf.sal).not.toBe(b.kdf.sal);
    expect(a.cifrado.iv).not.toBe(b.cifrado.iv);
  });

  it("un sobre ajeno o que pide pocas iteraciones: «formato»", async () => {
    const sobre = await cifrar("x", FRASE, IT);
    expect(await descifrar({ ...sobre, formato: "otra-app" }, FRASE)).toEqual({ ok: false, motivo: "formato" });
    expect(await descifrar({ ...sobre, kdf: { ...sobre.kdf, iteraciones: 1000 } }, FRASE)).toEqual({
      ok: false,
      motivo: "formato",
    });
    expect(await descifrar({ ...sobre, kdf: { ...sobre.kdf, sal: "no es base64!" } }, FRASE)).toEqual({
      ok: false,
      motivo: "formato",
    });
    expect(await descifrar(null, FRASE)).toEqual({ ok: false, motivo: "formato" });
  });

  it("la frase pide al menos diez caracteres", async () => {
    expect(fraseValida("corta")).toBe(false);
    expect(fraseValida(FRASE)).toBe(true);
    await expect(cifrar("x", "corta", IT)).rejects.toThrow("frase-corta");
  });
});

describe("qué viaja y qué no (regla dura 2 y regla 8)", () => {
  it("el paquete tiene SOLO estos campos", () => {
    expect(CAMPOS_DEL_PAQUETE).toEqual(
      ["app", "banco", "creado", "esquema", "gemelas", "objetivo", "progreso", "sesiones"].sort(),
    );
    for (const prohibido of ["perfil", "apodo", "ajustes", "cuentos", "videoteca", "video", "audioNino"]) {
      expect(CAMPOS_DEL_PAQUETE).not.toContain(prohibido);
    }
  });

  it("un paquete con un campo de más se rechaza entero", () => {
    const base: Paquete = {
      app: "habla",
      esquema: 1,
      creado: "2026-11-13",
      objetivo: null,
      progreso: PROGRESO_INICIAL,
      sesiones: { sesiones: [] },
      gemelas: { juicios: [] },
      banco: null,
    };
    expect(leerPaquete(JSON.stringify(base))).not.toBeNull();
    expect(leerPaquete(JSON.stringify({ ...base, perfil: { apodo: "Pipo" } }))).toBeNull();
    expect(leerPaquete(JSON.stringify({ ...base, videoteca: [] }))).toBeNull();
    expect(leerPaquete("no es json")).toBeNull();
  });

  it("el nombre del archivo lleva solo la fecha", () => {
    expect(nombreArchivo("2026-11-13")).toBe("habla-otra-casa-2026-11-13.habla");
  });
});

describe("la ida y vuelta entre dos casas", () => {
  beforeEach(async () => {
    localStorage.clear();
    await eliminarBanco();
  });

  it("A crea el archivo sin el perfil ni el banco si no se marca; B lo abre con su frase", async () => {
    guardarPerfil({ apodo: "Pipo", temas: ["animales"] });
    guardar(CLAVES.objetivo, ObjetivoSchema, { texto: "animales", desde: "2026-11-10" });
    registrarSesion({ juego: "globo", fecha: "2026-11-12", vozMs: 4000, rachaMs: 2000 });
    await guardarGrabacion("palabra:casa", {
      blob: new Blob([new Uint8Array([1, 2, 3])], { type: "audio/webm;codecs=opus" }),
      mimeType: "audio/webm;codecs=opus",
      duracionMs: 900,
      fecha: "2026-11-12",
    });
    const sinBanco = await crearArchivo(false, FRASE, "2026-11-13", IT);
    const conBanco = await crearArchivo(true, FRASE, "2026-11-13", IT);
    expect(sinBanco).not.toContain("Pipo");

    // La otra casa: otro aparato, vacío.
    localStorage.clear();
    await eliminarBanco();
    const antes = instantanea();

    const mala = await abrirArchivo(sinBanco, "esta no es la frase", siempre);
    expect(mala).toEqual({ ok: false, motivo: "frase" });
    expect(instantanea()).toEqual(antes); // la frase equivocada no toca nada

    const r = await abrirArchivo(conBanco, FRASE, siempre);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.plan).toMatchObject({
      objetivo: { antes: null, despues: "animales", cambia: true },
      sesionesNuevas: 1,
      banco: { nuevas: 1, yaEstaban: 0, noSuenanAqui: 0 },
      nadaCambia: false,
    });
    expect(instantanea()).toEqual(antes); // abrir no escribe: solo el «confirmar»
    await aplicar(r.fusion);
    expect(leerObjetivo()?.texto).toBe("animales");
    expect(leerSesiones().sesiones).toHaveLength(1);
    expect(localStorage.getItem(CLAVES.perfil)).toBeNull();
    expect(await listarIds()).toEqual(["palabra:casa"]);
    const g = await obtenerGrabacion("palabra:casa");
    expect(new Uint8Array(await g!.blob.arrayBuffer())).toEqual(new Uint8Array([1, 2, 3]));

    // Volver a abrir el mismo archivo: nada cambia, nada se duplica.
    const otra = await abrirArchivo(conBanco, FRASE, siempre);
    expect(otra.ok && otra.plan.nadaCambia).toBe(true);
    expect(otra.ok && otra.plan.banco?.yaEstaban).toBe(1);
  });

  it("una grabación que este aparato no reproduce no entra, y se dice", async () => {
    await guardarGrabacion("palabra:sol", {
      blob: new Blob([new Uint8Array([9])], { type: "audio/mp4" }),
      mimeType: "audio/mp4",
      duracionMs: 500,
      fecha: "2026-11-12",
    });
    const archivo = await crearArchivo(true, FRASE, "2026-11-13", IT);
    await eliminarBanco();
    const r = await abrirArchivo(archivo, FRASE, nunca);
    expect(r.ok && r.plan.banco).toEqual({ nuevas: 0, yaEstaban: 0, noSuenanAqui: 1 });
  });

  it("un archivo que no es JSON: «formato»", async () => {
    expect(await abrirArchivo("hola", FRASE, siempre)).toEqual({ ok: false, motivo: "formato" });
  });
});

describe("la fusión no borra nada", () => {
  const vacio: Local = {
    objetivo: null,
    progreso: PROGRESO_INICIAL,
    sesiones: { sesiones: [] },
    gemelas: { juicios: [] },
    bancoIds: [],
  };
  const paquete = (p: Partial<Paquete>): Paquete => ({
    app: "habla",
    esquema: 1,
    creado: "2026-11-13",
    objetivo: null,
    progreso: PROGRESO_INICIAL,
    sesiones: { sesiones: [] },
    gemelas: { juicios: [] },
    banco: null,
    ...p,
  });

  it("lo de aquí se queda y lo nuevo se suma, en orden de fecha", () => {
    const aqui: Local = {
      ...vacio,
      sesiones: { sesiones: [{ juego: "cohete", fecha: "2026-11-12", inversiones: 3 }] },
      gemelas: { juicios: [{ fecha: "2026-11-11", parId: "p1", marca: "a" }] },
    };
    const { fusion, plan } = fusionar(
      aqui,
      paquete({
        sesiones: {
          sesiones: [
            { juego: "globo", fecha: "2026-11-10", vozMs: 1000, rachaMs: 500 },
            { juego: "cohete", fecha: "2026-11-12", inversiones: 3 },
          ],
        },
        gemelas: { juicios: [] },
      }),
      siempre,
    );
    expect(plan.sesionesNuevas).toBe(1);
    expect(fusion.sesiones.sesiones.map((s) => s.fecha)).toEqual(["2026-11-10", "2026-11-12"]);
    expect(fusion.gemelas.juicios).toHaveLength(1); // el archivo no traía juicios: no se borran
  });

  it("dos sesiones idénticas en un lado y una en el otro: quedan dos", () => {
    const s = { juego: "cohete" as const, fecha: "2026-11-12", inversiones: 3 };
    const { fusion } = fusionar(
      { ...vacio, sesiones: { sesiones: [s] } },
      paquete({ sesiones: { sesiones: [s, s] } }),
      siempre,
    );
    expect(fusion.sesiones.sesiones).toHaveLength(2);
  });

  it("objetivo: el más reciente gana; un archivo sin objetivo no borra el de aquí", () => {
    const aqui = { ...vacio, objetivo: { texto: "el baño", desde: "2026-11-12" } };
    expect(fusionar(aqui, paquete({}), siempre).fusion.objetivo?.texto).toBe("el baño");
    expect(
      fusionar(aqui, paquete({ objetivo: { texto: "animales", desde: "2026-11-01" } }), siempre).fusion.objetivo
        ?.texto,
    ).toBe("el baño");
    const plan = fusionar(aqui, paquete({ objetivo: { texto: "animales", desde: "2026-11-13" } }), siempre).plan;
    expect(plan.objetivo).toEqual({ antes: "el baño", despues: "animales", cambia: true });
  });

  it("progreso: historial unido; el ciclo más avanzado gana; la cápsula de hoy de aquí se queda", () => {
    const hoyAqui = { fecha: "2026-11-13", capsulaId: "c-aqui" };
    const aqui: Local = {
      ...vacio,
      progreso: {
        porEtapa: {
          ...PROGRESO_INICIAL.porEtapa,
          "palabras-sueltas": { ciclo: 0, cicloCompletadas: ["c1"], asignacionHoy: hoyAqui, asignacionAyer: null },
        },
        historial: [{ capsulaId: "c1", fecha: "2026-11-10" }],
      },
    };
    const llega = paquete({
      progreso: {
        porEtapa: {
          ...PROGRESO_INICIAL.porEtapa,
          "palabras-sueltas": {
            ciclo: 0,
            cicloCompletadas: ["c2"],
            asignacionHoy: { fecha: "2026-11-13", capsulaId: "c-alla" },
            asignacionAyer: null,
          },
          "sonidos-e-intentos": { ciclo: 2, cicloCompletadas: ["s1"], asignacionHoy: null, asignacionAyer: null },
        },
        historial: [
          { capsulaId: "c1", fecha: "2026-11-10" },
          { capsulaId: "c2", fecha: "2026-11-11" },
        ],
      },
    });
    const { fusion, plan } = fusionar(aqui, llega, siempre);
    expect(plan.capsulasNuevas).toBe(1);
    expect(fusion.progreso.historial).toHaveLength(2);
    expect(fusion.progreso.porEtapa["palabras-sueltas"]?.cicloCompletadas).toEqual(["c1", "c2"]);
    expect(fusion.progreso.porEtapa["palabras-sueltas"]?.asignacionHoy).toEqual(hoyAqui);
    expect(fusion.progreso.porEtapa["sonidos-e-intentos"]?.ciclo).toBe(2);
  });

  it("sin cambios: «nada cambia»", () => {
    expect(fusionar(vacio, paquete({}), siempre).plan.nadaCambia).toBe(true);
    expect(fusionar(vacio, paquete({}), siempre).plan.banco).toBeNull();
  });
});

describe("la carpeta del archivo de la otra casa no tiene camino a la red", () => {
  it("está en el candado de privacidad-banco", () => {
    const fuente = readFileSync(join(__dirname, "privacidad-banco.test.ts"), "utf8");
    expect(fuente).toContain('"src/lib/otra-casa"');
  });
});
