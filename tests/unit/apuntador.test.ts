// Tu apuntador (S13, ADR-025): una línea en el momento justo, sin repetirse, con técnica y fuente, en
// positivo y en los dos idiomas.

import { describe, expect, it } from "vitest";
import { TECNICAS } from "@content/schema";
import {
  elegirLinea,
  HISTORIAL_VACIO,
  LINEAS,
  momentoDeTransicion,
  MS_ENTRE_LINEAS,
  MS_SILENCIO_APUNTADOR,
  registrarLinea,
  type HistorialApuntador,
  type MomentoApuntador,
} from "@/lib/coach/apuntador";
import { apuntador } from "@/lib/idioma/textos/apuntador";
import {
  reducir,
  sesionInicial,
  type Evento,
  type Sesion,
} from "@/lib/session-flow";

const MOMENTOS: MomentoApuntador[] = [
  "turno-adulto",
  "voz-nino",
  "silencio",
  "cierre",
];

describe("apuntador: el contenido", () => {
  it("cada momento tiene líneas; cada línea tiene técnica conocida, fuente y sus dos idiomas", () => {
    for (const m of MOMENTOS)
      expect(LINEAS.filter((x) => x.momento === m).length, m).toBeGreaterThan(
        1,
      );
    for (const x of LINEAS) {
      expect(TECNICAS).toContain(x.tecnica);
      expect(x.fuente.length, x.id).toBeGreaterThan(20);
      expect(x.texto.es.trim(), x.id).not.toBe("");
      expect(x.texto.en.trim(), x.id).not.toBe("");
    }
  });

  it("cada texto del catálogo es de una línea, y ninguna línea se repite en el catálogo", () => {
    const ids = LINEAS.map((x) => x.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect([...ids].sort()).toEqual(Object.keys(apuntador.lineas).sort());
  });

  it("habla en positivo: nunca de lo que él «no hizo», ni corrige, ni promete", () => {
    const prohibido =
      /\b(no|nunca|todavía no|aún no|falló|fallo|mal|incorrect\w*|error|didn't|did not|not|never|wrong|failed|yet)\b/i;
    for (const x of LINEAS) {
      expect(prohibido.test(x.texto.es), `${x.id} es: ${x.texto.es}`).toBe(
        false,
      );
      expect(prohibido.test(x.texto.en), `${x.id} en: ${x.texto.en}`).toBe(
        false,
      );
    }
  });
});

describe("apuntador: elegir la línea", () => {
  it("no repite ninguna línea en la sesión, y calla cuando el momento agotó las suyas", () => {
    let h: HistorialApuntador = HISTORIAL_VACIO;
    const vistas: string[] = [];
    let t = 0;
    for (;;) {
      const linea = elegirLinea("voz-nino", h, t);
      if (!linea) break;
      vistas.push(linea.id);
      h = registrarLinea(h, linea, t);
      t += MS_ENTRE_LINEAS;
    }
    expect(vistas.length).toBe(
      LINEAS.filter((x) => x.momento === "voz-nino").length,
    );
    expect(new Set(vistas).size).toBe(vistas.length);
    expect(elegirLinea("voz-nino", h, t + 60_000)).toBeNull();
  });

  it("deja un respiro entre líneas; el cierre no espera", () => {
    const primera = elegirLinea("turno-adulto", HISTORIAL_VACIO, 1000)!;
    const h = registrarLinea(HISTORIAL_VACIO, primera, 1000);
    expect(elegirLinea("voz-nino", h, 1000 + MS_ENTRE_LINEAS - 1)).toBeNull();
    expect(elegirLinea("voz-nino", h, 1000 + MS_ENTRE_LINEAS)).not.toBeNull();
    expect(elegirLinea("cierre", h, 1001)?.momento).toBe("cierre");
  });

  it("la técnica del día va primero cuando el momento tiene una línea suya", () => {
    expect(elegirLinea("voz-nino", HISTORIAL_VACIO, 0)?.tecnica).toBe(
      "expansion-recast",
    );
    expect(
      elegirLinea("voz-nino", HISTORIAL_VACIO, 0, "estimulacion-focalizada")
        ?.id,
    ).toBe("palabraClave");
    expect(
      elegirLinea("turno-adulto", HISTORIAL_VACIO, 0, "seguir-interes")?.id,
    ).toBe("loQueMira");
    // Sin línea de esa técnica en el momento: la primera, sin más.
    expect(elegirLinea("silencio", HISTORIAL_VACIO, 0, "modelado")?.id).toBe(
      "esperaTres",
    );
  });
});

describe("apuntador: qué momento pasó", () => {
  const correr = (s: Sesion, ev: Evento[]) => ev.reduce(reducir, s);
  const tick = (vozActiva: boolean, deltaMs = 100): Evento => ({
    tipo: "TICK",
    deltaMs,
    vozActiva,
    metrica: { tipo: "sostenido", ms: 0, rachaMs: 0 },
  });
  const enJuego = correr(sesionInicial(), [
    { tipo: "EMPEZAR" },
    { tipo: "MIC_OK" },
    { tipo: "CALIBRACION_OK", pisoRuido: 0.01 },
  ]);

  it("él hizo voz en su turno → expandir (una vez por turno)", () => {
    const a = reducir(enJuego, tick(true));
    expect(momentoDeTransicion(enJuego, a)).toBe("voz-nino");
    expect(momentoDeTransicion(a, reducir(a, tick(true)))).toBeNull();
  });

  it("empieza tu turno → modelar", () => {
    const a = reducir(enJuego, { tipo: "CAMBIAR_TURNO", turno: "adulto" });
    expect(momentoDeTransicion(enJuego, a)).toBe("turno-adulto");
  });

  it("lleva rato en silencio en su turno → esperar, una vez al cruzar; en tu turno, nada", () => {
    const antes = reducir(enJuego, tick(false, MS_SILENCIO_APUNTADOR - 100));
    const cruza = reducir(antes, tick(false, 100));
    expect(momentoDeTransicion(antes, cruza)).toBe("silencio");
    expect(
      momentoDeTransicion(cruza, reducir(cruza, tick(false, 100))),
    ).toBeNull();

    const tuyo = reducir(enJuego, { tipo: "CAMBIAR_TURNO", turno: "adulto" });
    const tuyoAntes = reducir(tuyo, tick(false, MS_SILENCIO_APUNTADOR - 100));
    expect(
      momentoDeTransicion(tuyoAntes, reducir(tuyoAntes, tick(false, 100))),
    ).toBeNull();
  });

  it("el cierre → nombrar lo que hicieron juntos; fuera del juego, nada", () => {
    const fin = reducir(enJuego, {
      tipo: "TERMINAR",
      metrica: { tipo: "sostenido", ms: 0, rachaMs: 0 },
    });
    expect(momentoDeTransicion(enJuego, fin)).toBe("cierre");
    expect(
      momentoDeTransicion(
        sesionInicial(),
        reducir(sesionInicial(), { tipo: "EMPEZAR" }),
      ),
    ).toBeNull();
  });
});
