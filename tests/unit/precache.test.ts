import { describe, expect, it } from "vitest";
import {
  admisible,
  listaPrecache,
  RUTAS_SIN_RED,
  scriptPrecache,
} from "../../scripts/precache.mjs";

// EL PRECACHE GENERADO (S15, ADR-027): lo que el service worker instala sale del build, con la
// versión del build y jamás con audio ni con el reconocedor.

const html = (chunks: string[]) =>
  `<html>${chunks.map((c) => `<script src="/_next/static/chunks/${c}"></script>`).join("")}</html>`;

describe("la lista del precache", () => {
  const base = {
    version: "B1",
    htmlDeRuta: () => html(["a.js", "estilo.css"]),
    leerChunk: (u: string) =>
      u.endsWith("/a.js")
        ? 'x(["static/chunks/b.js"])'
        : u.endsWith("/b.js")
          ? '"static/chunks/c.js"'
          : "",
    extras: ["/worklets/rms-processor.js?v=4", "/pictogramas/pato.png"],
  };

  it("lleva las rutas sin red, sus chunks y los que esos chunks cargan después", () => {
    const { version, urls } = listaPrecache(base);
    expect(version).toBe("B1");
    for (const r of RUTAS_SIN_RED) expect(urls).toContain(r);
    for (const c of ["a.js", "b.js", "c.js", "estilo.css"]) {
      expect(urls).toContain(`/_next/static/chunks/${c}`);
    }
    expect(urls).toContain("/worklets/rms-processor.js?v=4");
  });

  it("los siete juegos, Hoy, Cuentos y Ajustes están en las rutas", () => {
    for (const j of [
      "globo",
      "cohete",
      "palabras",
      "gemelas",
      "soplar",
      "fuerte-suave",
      "vocales",
    ]) {
      expect(RUTAS_SIN_RED).toContain(`/jugar/${j}`);
    }
    expect(RUTAS_SIN_RED).toEqual(
      expect.arrayContaining(["/", "/cuentos", "/ajustes"]),
    );
  });

  it("jamás audio, modelos ni el motor del reconocedor", () => {
    const { urls } = listaPrecache({
      ...base,
      extras: [
        "/modelos/es.tar.gz",
        "/vosk/vosk.wasm",
        "/x/voz.wav",
        "/y.webm",
        "//otro.example/a.js",
      ],
    });
    expect(urls.some((u) => /modelos|vosk|\.wav|\.webm|\/\/otro/.test(u))).toBe(
      false,
    );
    expect(admisible("/pictogramas/pato.png")).toBe(true);
    expect(admisible("/modelos/en.tar.gz")).toBe(false);
  });

  it("sin versión o sin el HTML de una ruta, el build falla en vez de instalar a medias", () => {
    expect(() => listaPrecache({ ...base, version: "" })).toThrow(/versión/);
    expect(() => listaPrecache({ ...base, htmlDeRuta: () => null })).toThrow(
      /no tiene HTML/,
    );
  });

  it("el script que importa el worker declara la lista", () => {
    const s = scriptPrecache({ version: "B1", urls: ["/"] });
    expect(s).toContain('self.HABLA_PRECACHE = {"version":"B1","urls":["/"]}');
  });
});
