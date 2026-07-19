import { describe, expect, it } from "vitest";
import { construirSesion } from "@/lib/rumbo/sesion";
import { tendenciasPorSemana } from "@/lib/rumbo/tendencias";
import { hitosAlcanzados } from "@/lib/rumbo/hitos";
import { claveFechaLocal, lunesDeLaSemana } from "@/lib/fecha";
import type { Sesion } from "@/lib/storage/schemas";

/** Un lunes real y los días de SU semana, para agrupar sin depender del calendario. */
const LUNES = lunesDeLaSemana("2026-07-15");
function diaDeLaSemana(offset: number): string {
  const [a, m, d] = LUNES.split("-").map(Number);
  const dt = new Date(a, m - 1, d);
  dt.setDate(dt.getDate() + offset);
  return claveFechaLocal(dt);
}
const OTRA_SEMANA = diaDeLaSemana(9); // ya cae en la semana siguiente

describe("construirSesion: Metrica → Sesion (solo números, jamás audio)", () => {
  it("mapea cada juego a su forma y nunca inventa campos de audio", () => {
    expect(
      construirSesion(
        { tipo: "sostenido", ms: 4200, rachaMs: 1500 },
        "2026-07-15",
      ),
    ).toEqual({
      juego: "globo",
      fecha: "2026-07-15",
      vozMs: 4200,
      rachaMs: 1500,
    });

    expect(
      construirSesion({ tipo: "inversiones", veces: 5 }, "2026-07-15"),
    ).toEqual({ juego: "cohete", fecha: "2026-07-15", inversiones: 5 });

    expect(
      construirSesion(
        { tipo: "activaciones", veces: 3, reconocidas: 1 },
        "2026-07-15",
        ["perro", "gato", "perro"],
      ),
    ).toEqual({
      juego: "palabras",
      fecha: "2026-07-15",
      encendidos: 3,
      reconocidas: 1,
      palabras: ["perro", "gato"], // dedup
    });

    expect(
      construirSesion(
        { tipo: "gemelas", rondas: 6, participadas: 4 },
        "2026-07-15",
      ),
    ).toEqual({
      juego: "gemelas",
      fecha: "2026-07-15",
      rondas: 6,
      participadas: 4,
    });
  });
});

describe("tendenciasPorSemana: agrega lo medido, sin culpa", () => {
  const sesiones: Sesion[] = [
    { juego: "globo", fecha: diaDeLaSemana(0), vozMs: 3000, rachaMs: 1200 },
    { juego: "globo", fecha: diaDeLaSemana(0), vozMs: 5000, rachaMs: 2600 },
    { juego: "cohete", fecha: diaDeLaSemana(1), inversiones: 4 },
    {
      juego: "palabras",
      fecha: diaDeLaSemana(1),
      encendidos: 3,
      reconocidas: 2,
      palabras: ["perro", "gato"],
    },
    {
      juego: "palabras",
      fecha: diaDeLaSemana(2),
      encendidos: 2,
      reconocidas: 0,
      palabras: ["gato", "sol"],
    },
    { juego: "gemelas", fecha: OTRA_SEMANA, rondas: 6, participadas: 5 },
  ];

  it("agrupa por semana, la más reciente primero", () => {
    const t = tendenciasPorSemana(sesiones);
    expect(t).toHaveLength(2);
    expect(t[0].semana > t[1].semana).toBe(true); // reciente primero
    expect(t[1].semana).toBe(LUNES);
  });

  it("cuenta días distintos, sesiones, y los números medidos de la semana", () => {
    const semana = tendenciasPorSemana(sesiones).find(
      (s) => s.semana === LUNES,
    )!;
    expect(semana.diasConPractica).toBe(3); // offsets 0,1,2
    expect(semana.sesionesDeVoz).toBe(5);
    expect(semana.palabrasDistintas).toBe(3); // perro, gato, sol (gato no se cuenta dos veces)
    expect(semana.dibujosEncendidos).toBe(5);
    expect(semana.subidasYBajadas).toBe(4);
    expect(semana.vozMsMax).toBe(2600); // la racha más larga del globo
    expect(semana.marcadasPorTi).toBe(2); // reconocidas de palabras
  });

  it("los días de cápsula (sin juego) cuentan para la constancia", () => {
    const t = tendenciasPorSemana(
      [{ juego: "cohete", fecha: diaDeLaSemana(0), inversiones: 1 }],
      [{ fecha: diaDeLaSemana(3) }, { fecha: diaDeLaSemana(0) }],
    );
    const semana = t.find((s) => s.semana === LUNES)!;
    // offset 0 (juego + cápsula) y offset 3 (solo cápsula) = 2 días con práctica.
    expect(semana.diasConPractica).toBe(2);
    expect(semana.sesionesDeVoz).toBe(1);
  });

  it("sin nada, no inventa filas (cero culpa: no hay semana 'mala')", () => {
    expect(tendenciasPorSemana([])).toEqual([]);
  });
});

describe("hitosAlcanzados: logros funcionales, jamás clínicos", () => {
  it("sin datos, no hay hitos (la pantalla mostrará su vacío honesto)", () => {
    expect(hitosAlcanzados([])).toEqual([]);
  });

  it("marca el primer día, la primera palabra que TÚ oíste y la voz larga", () => {
    const sesiones: Sesion[] = [
      { juego: "globo", fecha: diaDeLaSemana(0), vozMs: 1000, rachaMs: 800 },
      {
        juego: "palabras",
        fecha: diaDeLaSemana(1),
        encendidos: 2,
        reconocidas: 1,
        palabras: ["perro"],
      },
      { juego: "globo", fecha: diaDeLaSemana(2), vozMs: 6000, rachaMs: 5200 },
    ];
    const ids = hitosAlcanzados(sesiones).map((h) => h.id);
    expect(ids).toContain("primer-dia");
    expect(ids).toContain("primera-oida");
    expect(ids).toContain("voz-larga");
  });

  it("no marca 'primera-oída' ni 'voz-larga' si no ocurrieron", () => {
    const sesiones: Sesion[] = [
      {
        juego: "palabras",
        fecha: diaDeLaSemana(0),
        encendidos: 2,
        reconocidas: 0,
        palabras: ["perro"],
      },
      { juego: "globo", fecha: diaDeLaSemana(1), vozMs: 900, rachaMs: 400 },
    ];
    const ids = hitosAlcanzados(sesiones).map((h) => h.id);
    expect(ids).toContain("primer-dia");
    expect(ids).not.toContain("primera-oida");
    expect(ids).not.toContain("voz-larga");
  });

  it("cuenta palabras distintas acumuladas para el hito de 10", () => {
    const diez = Array.from({ length: 10 }, (_, i) => `palabra${i}`);
    const sesiones: Sesion[] = [
      {
        juego: "palabras",
        fecha: diaDeLaSemana(0),
        encendidos: 10,
        reconocidas: 0,
        palabras: diez,
      },
    ];
    const ids = hitosAlcanzados(sesiones).map((h) => h.id);
    expect(ids).toContain("palabras-10");
    expect(ids).not.toContain("palabras-25");
  });

  it("da el hito de constancia cuando una semana llega a 3 días", () => {
    const sesiones: Sesion[] = [0, 1, 2].map((o) => ({
      juego: "cohete" as const,
      fecha: diaDeLaSemana(o),
      inversiones: 1,
    }));
    const ids = hitosAlcanzados(sesiones).map((h) => h.id);
    expect(ids).toContain("constancia-3");
    expect(ids).not.toContain("constancia-5");
  });

  it("los hitos salen como línea de tiempo: más antiguo primero (orden EXACTO)", () => {
    // Auditoría de cierre: el orden prometido ("línea de tiempo") no se aseveraba — una
    // regresión en el sort final pasaba verde. Fechas distintas fuerzan un orden único.
    const sesiones: Sesion[] = [
      { juego: "globo", fecha: diaDeLaSemana(2), vozMs: 6000, rachaMs: 5200 },
      {
        juego: "palabras",
        fecha: diaDeLaSemana(1),
        encendidos: 1,
        reconocidas: 1,
        palabras: ["perro"],
      },
      { juego: "cohete", fecha: diaDeLaSemana(0), inversiones: 2 },
    ];
    const ids = hitosAlcanzados(sesiones).map((h) => h.id);
    expect(ids).toEqual([
      "primer-dia", // día 0 (cohete)
      "constancia-3", // el lunes de la semana que llegó a 3 días
      "primera-oida", // día 1 (la palabra que TÚ oíste)
      "voz-larga", // día 2 (racha ≥ 5 s)
    ]);
  });
});
