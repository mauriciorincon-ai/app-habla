import { describe, expect, it } from "vitest";
import { alinear, contarAlineacion, normalizar } from "@/lib/objetivo/alinear";
import { acotarContenido } from "@/lib/objetivo/alcance";
import { priorizarEstable } from "@/lib/objetivo/prioridad";
import { CAPSULAS } from "@content/capsulas";
import { ETIQUETAS_CAPSULA } from "@content/schema";
import { PICTOGRAMAS } from "@content/pictogramas";
import { PARES_GEMELOS } from "@content/pares-gemelos";

const CONTENIDO = {
  capsulas: CAPSULAS,
  pictos: PICTOGRAMAS,
  pares: PARES_GEMELOS,
};

describe("normalizar: el objetivo libre → palabras significativas", () => {
  it("quita tildes, mayúsculas, signos y palabras estructurales", () => {
    expect(normalizar("El Baño de María")).toEqual(["bano", "maria"]);
    expect(normalizar("¡MÁS agua!")).toEqual(["mas", "agua"]);
  });

  it("descarta tokens de menos de 3 letras", () => {
    expect(normalizar("ir a la casa")).toEqual(["casa"]);
  });

  it("un objetivo solo de palabras estructurales queda vacío", () => {
    expect(normalizar("de la el los")).toEqual([]);
  });
});

describe("alinear: objetivo → predicados de coincidencia", () => {
  it("sin objetivo (vacío o solo estructural) NO está activo y no coincide con nada", () => {
    for (const texto of ["", "   ", "de la", null, undefined]) {
      const a = alinear(texto);
      expect(a.activo).toBe(false);
      expect(a.coincidePalabra("perro")).toBe(false);
      expect(a.coincideTema("animales")).toBe(false);
      expect(a.coincideEtiquetas(["animales"])).toBe(false);
    }
  });

  it('"animales" coincide por tema y por etiqueta, no por una palabra suelta ajena', () => {
    const a = alinear("animales");
    expect(a.activo).toBe(true);
    expect(a.coincideTema("animales")).toBe(true);
    expect(a.coincideEtiquetas(["animales", "juego"])).toBe(true);
    expect(a.coincideEtiquetas(["comida"])).toBe(false);
    // "perro" es un animal, pero el objetivo dice "animales", no "perro": no matchea la palabra suelta.
    expect(a.coincidePalabra("perro")).toBe(false);
  });

  it('"perro" coincide con esa palabra pero no con el tema entero', () => {
    const a = alinear("perro");
    expect(a.coincidePalabra("perro")).toBe(true);
    expect(a.coincideTema("animales")).toBe(false);
  });

  // Hallazgo del usuario en el gate (bloque O): en Ajustes el tema se VE "Transporte", pero la
  // clave interna del contenido es "carros" (rename G6). Lo que la pantalla muestra tiene que
  // alinear — la clave es un detalle nuestro, no del padre.
  it('el nombre VISIBLE del tema alinea su clave: «transporte» → "carros"', () => {
    const a = alinear("transporte");
    expect(a.coincideTema("carros")).toBe(true);
    expect(a.coincideEtiquetas(["carros"])).toBe(true);
    // La clave de siempre sigue funcionando tal cual.
    expect(alinear("carros").coincideTema("carros")).toBe(true);
    // Y la expansión no inventa nada: ni con texto lejano ni con el objetivo vacío.
    expect(alinear("colores").coincideTema("carros")).toBe(false);
    expect(alinear("").activo).toBe(false);
  });
});

describe("contarAlineacion: el preview honesto y el caso sin coincidencias", () => {
  it('"animales" alinea cápsulas Y pictogramas (Hoy + mazo se mueven)', () => {
    const resumen = contarAlineacion(alinear("animales"), CONTENIDO);
    expect(resumen.activo).toBe(true);
    expect(resumen.vacio).toBe(false);
    expect(resumen.capsulas).toBeGreaterThan(0);
    expect(resumen.palabras).toBe(8); // los 8 pictos del tema animales
  });

  it('"colores" es el caso HONESTO sin coincidencias (no existe color en el contenido)', () => {
    const resumen = contarAlineacion(alinear("colores"), CONTENIDO);
    expect(resumen.activo).toBe(true);
    expect(resumen.vacio).toBe(true);
    expect(resumen.capsulas).toBe(0);
    expect(resumen.palabras).toBe(0);
    expect(resumen.pares).toBe(0);
  });

  it("sin objetivo, el resumen no está activo ni vacío (no hay nada que alinear)", () => {
    const resumen = contarAlineacion(alinear(""), CONTENIDO);
    expect(resumen.activo).toBe(false);
    expect(resumen.vacio).toBe(false);
  });

  it('"pato" alinea pares de gemelas (el conteo de pares sí funciona en positivo)', () => {
    // Auditoría de cierre: `pares` solo se aseveraba en 0 — un filtro roto que devolviera
    // siempre 0 pasaba verde. "pato" vive en el par pato/gato del contenido real.
    const resumen = contarAlineacion(alinear("pato"), CONTENIDO);
    expect(resumen.pares).toBeGreaterThanOrEqual(1);
  });
});

describe("acotarContenido: el preview cuenta lo que el niño DE VERDAD verá (auditoría de cierre)", () => {
  const capsulas = [
    { id: "c-sue", etapa: "palabras-sueltas" },
    { id: "c-son", etapa: "sonidos-e-intentos" },
    { id: "c-fra", etapa: "primeras-frases" },
  ] as const;
  const pictos = [
    { palabra: "perro", tema: "animales" },
    { palabra: "carro", tema: "carros" },
    { palabra: "luna", tema: "espacio" },
  ] as const;
  const pares = [{ id: "p1" }, { id: "p2" }] as const;

  it("cápsulas: solo las de la etapa activa (el objetivo jamás salta de etapa, ADR-005)", () => {
    const r = acotarContenido(
      { capsulas, pictos, pares },
      { etapa: "palabras-sueltas", temas: null, parJugable: () => true },
    );
    expect(r.capsulas.map((c) => c.id)).toEqual(["c-sue"]);
  });

  it("pictos: espeja el mazo real — con temas filtra, sin perfil baraja completa", () => {
    const conTemas = acotarContenido(
      { capsulas, pictos, pares },
      {
        etapa: "palabras-sueltas",
        temas: ["animales"],
        parJugable: () => true,
      },
    );
    expect(conTemas.pictos.map((p) => p.palabra)).toEqual(["perro"]);

    const sinPerfil = acotarContenido(
      { capsulas, pictos, pares },
      { etapa: "palabras-sueltas", temas: null, parJugable: () => true },
    );
    expect(sinPerfil.pictos).toHaveLength(3);
  });

  it("pictos: si los temas elegidos dejan el mazo vacío, cae a la baraja completa (como el juego)", () => {
    const r = acotarContenido(
      { capsulas, pictos, pares },
      {
        etapa: "palabras-sueltas",
        temas: ["dinosaurios"],
        parJugable: () => true,
      },
    );
    expect(r.pictos).toHaveLength(3);
  });

  it("pares: solo los jugables en la etapa (predicado inyectado)", () => {
    const r = acotarContenido(
      { capsulas, pictos, pares },
      {
        etapa: "sonidos-e-intentos",
        temas: null,
        parJugable: (p) => p.id === "p2",
      },
    );
    expect(r.pares.map((p) => p.id)).toEqual(["p2"]);
  });

  it("el caso de la auditoría: existe en la app, pero fuera de su alcance → alcance vacío, global no", () => {
    // Pictos de un tema NO elegido y cápsulas de otra etapa: global cuenta, el alcance no.
    const soloOtraEtapa = [{ id: "c-fra", etapa: "primeras-frases" }] as const;
    const alineacion = alinear("espacio");
    const global = contarAlineacion(alineacion, {
      capsulas: [],
      pictos,
      pares: [],
    });
    expect(global.vacio).toBe(false); // "luna" es del tema espacio

    const acotado = acotarContenido(
      { capsulas: soloOtraEtapa, pictos, pares: [] },
      {
        etapa: "palabras-sueltas",
        temas: ["animales", "carros"],
        parJugable: () => true,
      },
    );
    const alcance = contarAlineacion(alineacion, {
      capsulas: acotado.capsulas.map(() => ({ etiquetas: [] })),
      pictos: acotado.pictos,
      pares: acotado.pares,
    });
    expect(alcance.vacio).toBe(true);
  });
});

describe("priorizarEstable: los que coinciden primero, orden estable", () => {
  it("sin coincidencias, el orden es IDÉNTICO (identidad — clava los mazos por semilla del S3)", () => {
    const items = [1, 2, 3, 4, 5];
    expect(priorizarEstable(items, () => false)).toEqual(items);
  });

  it("mueve al frente los que coinciden, conservando el orden relativo de cada grupo", () => {
    const items = ["a1", "b1", "a2", "b2", "a3"];
    const r = priorizarEstable(items, (s) => s.startsWith("a"));
    expect(r).toEqual(["a1", "a2", "a3", "b1", "b2"]);
  });
});

describe("etiquetas del contenido (R8): curaduría completa y honesta", () => {
  it("cada cápsula tiene ≥1 etiqueta del vocabulario controlado", () => {
    for (const c of CAPSULAS) {
      expect(c.etiquetas.length).toBeGreaterThanOrEqual(1);
      for (const e of c.etiquetas) {
        expect(ETIQUETAS_CAPSULA).toContain(e);
      }
    }
  });

  it("toda etiqueta del vocabulario la usa al menos una cápsula (sin huérfanas)", () => {
    const usadas = new Set(CAPSULAS.flatMap((c) => c.etiquetas));
    for (const e of ETIQUETAS_CAPSULA) {
      expect(usadas).toContain(e);
    }
  });

  it("el vocabulario NO contiene ninguna palabra de color (por eso «colores» es honesto)", () => {
    const colores = [
      "rojo",
      "azul",
      "verde",
      "amarillo",
      "colores",
      "color",
      "negro",
      "blanco",
    ];
    for (const c of colores) {
      expect(ETIQUETAS_CAPSULA as readonly string[]).not.toContain(c);
    }
  });
});
