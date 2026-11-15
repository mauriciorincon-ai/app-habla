// Turnos dentro del juego (S13, ADR-025): en «tu turno» el personaje se mueve (el niño ve el modelo)
// pero NADA se le cuenta a él; en «su turno», lo que su voz hace cuenta. Motor puro, señales sintéticas.

import { describe, expect, it } from "vitest";
import {
  crearMotores,
  frameEnSilencio,
  type LecturaMotores,
} from "@/lib/voice/motores";
import type { MeterFrame } from "@/lib/voice/types";
import {
  invitacionAmable,
  MS_PARA_INVITAR,
  reducir,
  sesionInicial,
  type Evento,
  type Metrica,
  type Sesion,
} from "@/lib/session-flow";

const PISO = 0.01;
const PASO_MS = 32;

/**
 * Una «jugada» que mueve los SEIS juegos de micrófono a la vez: voz cuyo tono sube y baja (cohete), con
 * dos vocales que se alternan (vocales), suave y fuerte que se alternan (fuerte y suave), voz sostenida
 * (globo y palabras, que se encienden con `sostenidoMs`), y al final un soplo (soplar).
 */
function jugada(desdeMs: number): MeterFrame[] {
  const frames: MeterFrame[] = [];
  for (let dt = 0; dt < 7000; dt += PASO_MS) {
    const tMs = desdeMs + dt;
    if (dt < 4000) {
      const fase = (dt % 1600) / 1600;
      const pitchHz = 250 + 200 * (fase < 0.5 ? fase * 2 : 2 - fase * 2);
      const formantes =
        dt % 2000 < 1000 ? { f1: 1000, f2: 1750 } : { f1: 390, f2: 3000 };
      const rms = Math.floor(dt / 700) % 2 === 0 ? PISO * 5 : PISO * 40;
      frames.push({ rms, pitchHz, tMs, formantes, zcr: 0.012, grave: false });
    } else if (dt < 5000) {
      frames.push({
        rms: PISO,
        pitchHz: null,
        tMs,
        formantes: null,
        zcr: 0.2,
        grave: false,
      });
    } else if (dt < 6000) {
      frames.push({
        rms: 0.08,
        pitchHz: null,
        tMs,
        formantes: null,
        zcr: 0.03,
        grave: false,
      });
    } else {
      frames.push({
        rms: PISO,
        pitchHz: null,
        tMs,
        formantes: null,
        zcr: 0.2,
        grave: false,
      });
    }
  }
  return frames;
}

/** Lo que se cuenta y se celebra (los contadores de los seis juegos). */
const contadores = (l: LecturaMotores) => ({
  sostenidoMs: l.sostenidoMs,
  mejorRachaMs: l.mejorRachaMs,
  inversiones: l.inversiones,
  vocalesZonas: l.vocalesZonas,
  vocalesCambios: l.vocalesCambios,
  soplos: l.soplo.soplos,
  soploMs: l.soplo.soploMs,
  cambiosVoz: l.intensidad.cambios,
});

const CEROS = {
  sostenidoMs: 0,
  mejorRachaMs: 0,
  inversiones: 0,
  vocalesZonas: 0,
  vocalesCambios: 0,
  soplos: 0,
  soploMs: 0,
  cambiosVoz: 0,
};

describe("motores: el paquete del niño solo cuenta su turno", () => {
  it("la jugada mueve los contadores de los seis juegos (si no, el test de abajo no probaría nada)", () => {
    const m = crearMotores(PISO);
    for (const f of jugada(0)) m.empujar(f);
    for (const [clave, valor] of Object.entries(contadores(m.lectura()))) {
      expect(valor, clave).toBeGreaterThan(0);
    }
  });

  it("en «tu turno» el dibujo se mueve, pero ningún contador de él sube", () => {
    const vivo = crearMotores(PISO);
    const nino = crearMotores(PISO);
    let nivelMaximo = 0;
    let sopla = false;
    for (const f of jugada(0)) {
      const l = vivo.empujar(f);
      nivelMaximo = Math.max(nivelMaximo, l.nivel);
      sopla ||= l.soplo.soplando;
      nino.empujar(frameEnSilencio(f));
    }
    expect(nivelMaximo).toBeGreaterThan(0.5);
    expect(sopla).toBe(true);
    expect(contadores(nino.lectura())).toEqual(CEROS);
  });

  it("al volver su turno cuenta solo lo suyo: la voz del adulto no se arrastra a su racha", () => {
    const nino = crearMotores(PISO);
    // Su turno: la jugada completa.
    for (const f of jugada(0)) nino.empujar(f);
    const suyo = contadores(nino.lectura());
    // Tu turno: otra jugada entera que, para él, es silencio.
    for (const f of jugada(7000)) nino.empujar(frameEnSilencio(f));
    expect(contadores(nino.lectura())).toEqual(suyo);
    // Su turno otra vez: la segunda jugada SÍ suma, y la racha sigue siendo una racha suya.
    for (const f of jugada(14000)) nino.empujar(f);
    const despues = contadores(nino.lectura());
    expect(despues.sostenidoMs).toBeGreaterThan(suyo.sostenidoMs);
    expect(despues.soplos).toBe(suyo.soplos * 2);
    expect(despues.mejorRachaMs).toBeLessThanOrEqual(4100);
  });

  it("el silencio de «tu turno» conserva el reloj y la presencia de zcr (el soplo no se queda ciego)", () => {
    const f: MeterFrame = {
      rms: 0.3,
      pitchHz: 300,
      tMs: 1234,
      formantes: { f1: 1, f2: 2 },
      zcr: 0.4,
      grave: true,
    };
    expect(frameEnSilencio(f)).toEqual({
      rms: 0,
      pitchHz: null,
      tMs: 1234,
      formantes: null,
      zcr: 0,
      grave: false,
    });
    expect(frameEnSilencio({ rms: 0.3, pitchHz: null, tMs: 5 })).toEqual({
      rms: 0,
      pitchHz: null,
      tMs: 5,
      formantes: null,
    });
  });
});

const sostenido = (ms: number): Metrica => ({
  tipo: "sostenido",
  ms,
  rachaMs: ms,
});
const tick = (vozActiva: boolean, ms = 0): Evento => ({
  tipo: "TICK",
  deltaMs: 100,
  vozActiva,
  metrica: sostenido(ms),
});
const correr = (s: Sesion, ev: Evento[]) => ev.reduce(reducir, s);
const JUGANDO: Evento[] = [
  { tipo: "EMPEZAR" },
  { tipo: "MIC_OK" },
  { tipo: "CALIBRACION_OK", pisoRuido: PISO },
];

describe("session-flow: el turno y los turnos de él", () => {
  it("empieza en «su turno» (sin tocar la franja, el juego cuenta como siempre)", () => {
    expect(sesionInicial().turno).toBe("nino");
    expect(sesionInicial().turnosNino).toBe(0);
  });

  it("cuenta un turno de él por cada turno con voz, una sola vez; tu turno no cuenta", () => {
    const s = correr(sesionInicial(), [
      ...JUGANDO,
      tick(true, 100),
      tick(true, 200),
      tick(false, 200),
      tick(true, 300),
      { tipo: "CAMBIAR_TURNO", turno: "adulto" },
      tick(true, 300),
      tick(true, 300),
      { tipo: "CAMBIAR_TURNO", turno: "nino" },
      tick(false, 300),
      tick(true, 400),
    ]);
    expect(s.turnosNino).toBe(2);
    expect(s.turno).toBe("nino");
  });

  it("un turno de él sin voz no cuenta, y cambiar de turno no borra lo logrado", () => {
    const s = correr(sesionInicial(), [
      ...JUGANDO,
      tick(true, 500),
      { tipo: "CAMBIAR_TURNO", turno: "adulto" },
      { tipo: "CAMBIAR_TURNO", turno: "nino" },
      tick(false, 500),
    ]);
    expect(s.turnosNino).toBe(1);
    expect(s.actual.fase).toBe("esperando-voz");
    expect(
      correr(s, [{ tipo: "TERMINAR", metrica: sostenido(500) }]).actual,
    ).toEqual({
      fase: "celebracion",
      metrica: sostenido(500),
    });
  });

  it("en «tu turno» no hay a quién invitar: el silencio es del adulto", () => {
    const largo: Evento = {
      tipo: "TICK",
      deltaMs: MS_PARA_INVITAR,
      vozActiva: false,
      metrica: sostenido(0),
    };
    const suyo = correr(sesionInicial(), [...JUGANDO, largo]);
    expect(invitacionAmable(suyo)).toBe(true);
    const tuyo = correr(sesionInicial(), [
      ...JUGANDO,
      { tipo: "CAMBIAR_TURNO", turno: "adulto" },
      largo,
    ]);
    expect(invitacionAmable(tuyo)).toBe(false);
  });

  it("un intento nuevo (otra vez, recalibrar, volver al guion) vuelve a su turno y a cero", () => {
    const base = correr(sesionInicial(), [
      ...JUGANDO,
      tick(true, 100),
      { tipo: "CAMBIAR_TURNO", turno: "adulto" },
    ]);
    for (const ev of [
      { tipo: "RECALIBRAR" },
      { tipo: "VOLVER_AL_GUION" },
    ] as Evento[]) {
      const s = reducir(base, ev);
      expect([s.turno, s.turnosNino, s.vozEnEsteTurno], ev.tipo).toEqual([
        "nino",
        0,
        false,
      ]);
    }
    const celebrada = correr(base, [
      { tipo: "TERMINAR", metrica: sostenido(100) },
    ]);
    expect(celebrada.turnosNino).toBe(1);
    const otra = reducir(celebrada, { tipo: "OTRA_VEZ" });
    expect([otra.turno, otra.turnosNino]).toEqual(["nino", 0]);
  });

  it("pedir el mismo turno no cambia nada", () => {
    const s = correr(sesionInicial(), [...JUGANDO, tick(true, 100)]);
    expect(reducir(s, { tipo: "CAMBIAR_TURNO", turno: "nino" })).toBe(s);
  });
});
