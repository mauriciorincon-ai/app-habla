import { describe, expect, it } from "vitest";
import { crearCalibracion, PISO_RUIDO_ALTO } from "@/lib/voice/calibration";
import { CONFIG_METER_DEFECTO, crearMeter } from "@/lib/voice/meter";
import type { MeterFrame } from "@/lib/voice/types";

// Señales sintéticas: cada frame es un bloque de ~32 ms (lo que emite el AudioWorklet).
const MS_POR_FRAME = 32;

/** Genera frames con un RMS dado (con jitter opcional para imitar una señal real). */
function señal(
  rms: number,
  duracionMs: number,
  desdeMs = 0,
  jitter = 0,
): MeterFrame[] {
  const frames: MeterFrame[] = [];
  const n = Math.round(duracionMs / MS_POR_FRAME);
  for (let i = 0; i < n; i++) {
    const variacion = jitter === 0 ? 0 : Math.sin(i / 2) * jitter;
    frames.push({
      rms: Math.max(0, rms + variacion),
      // El pitch no interviene en el medidor de energía (ADR 007): estos motores solo leen rms.
      pitchHz: null,
      tMs: desdeMs + i * MS_POR_FRAME,
    });
  }
  return frames;
}

const PISO_CASA = 0.01; // ruido de fondo típico ya calibrado

function meterCalibrado() {
  return crearMeter({ pisoRuido: PISO_CASA, ...CONFIG_METER_DEFECTO });
}

describe("voice-meter: la garantía del juego", () => {
  it("la voz sostenida hace avanzar al personaje y acumula el tiempo real", () => {
    const meter = meterCalibrado();
    let estado = meter.estado();

    // Voz cómoda (muy por encima del umbral de entrada), 2 segundos.
    for (const frame of señal(0.2, 2000)) {
      estado = meter.empujar(frame);
    }

    expect(estado.vozActiva).toBe(true);
    // ~2 s medidos (el primer frame no aporta delta).
    expect(estado.sostenidoMs).toBeGreaterThan(1900);
    expect(estado.sostenidoMs).toBeLessThanOrEqual(2000);
  });

  it("el ruido estable de la casa NO mueve al personaje", () => {
    const meter = meterCalibrado();
    let estado = meter.estado();

    // Ruido al nivel del piso calibrado (con fluctuación), 5 segundos.
    for (const frame of señal(PISO_CASA, 5000, 0, PISO_CASA * 0.5)) {
      estado = meter.empujar(frame);
    }

    expect(estado.vozActiva).toBe(false);
    expect(estado.sostenidoMs).toBe(0);
  });

  it("al callar se detiene, y no vuelve a arrancar solo", () => {
    const meter = meterCalibrado();

    for (const frame of señal(0.2, 1000)) meter.empujar(frame);
    expect(meter.estado().vozActiva).toBe(true);

    let estado = meter.estado();
    for (const frame of señal(PISO_CASA, 1000, 1000)) {
      estado = meter.empujar(frame);
    }

    expect(estado.vozActiva).toBe(false);
    // El tiempo sostenido no se pierde: es lo que el niño de verdad sostuvo.
    expect(estado.sostenidoMs).toBeGreaterThan(900);
  });

  it("la histéresis sobrevive el micro-silencio de 150 ms sin parpadear", () => {
    const meter = meterCalibrado();
    const transiciones: boolean[] = [];
    const registrar = (frame: MeterFrame) =>
      transiciones.push(meter.empujar(frame).vozActiva);

    // Voz — micro-pausa de 150 ms (respirar) — voz. El personaje NO debe apagarse.
    señal(0.2, 800).forEach(registrar);
    señal(PISO_CASA, 150, 800).forEach(registrar);
    señal(0.2, 800, 950).forEach(registrar);

    const apagones = transiciones.filter((activa) => !activa).length;
    expect(apagones).toBe(0);
    expect(meter.estado().vozActiva).toBe(true);
  });

  it("una voz que fluctúa cerca del umbral no produce parpadeo (una sola activación)", () => {
    const meter = meterCalibrado();
    const umbrales = meter.umbrales();
    let cambios = 0;
    let anterior = false;

    // Voz débil oscilando alrededor del umbral de entrada, 3 segundos.
    for (const frame of señal(
      umbrales.entrada,
      3000,
      0,
      umbrales.entrada * 0.4,
    )) {
      const { vozActiva } = meter.empujar(frame);
      if (vozActiva !== anterior) cambios += 1;
      anterior = vozActiva;
    }

    expect(cambios).toBe(1); // se enciende una vez y se queda encendida
  });

  it("un piso de ruido degenerado (silencio digital) no vuelve hipersensible al medidor", () => {
    const meter = crearMeter({ pisoRuido: 0, ...CONFIG_METER_DEFECTO });
    let estado = meter.estado();

    // Ruido bajísimo pero real (dither): no debe activar la voz.
    for (const frame of señal(0.002, 2000)) estado = meter.empujar(frame);

    expect(estado.vozActiva).toBe(false);
  });

  it("reiniciar deja el intento en cero (recalibrar es un derecho, no un castigo)", () => {
    const meter = meterCalibrado();
    for (const frame of señal(0.2, 1000)) meter.empujar(frame);

    meter.reiniciar();

    expect(meter.estado()).toEqual({
      vozActiva: false,
      sostenidoMs: 0,
      nivel: 0,
    });
  });
});

describe("calibración: el piso de ruido de la casa real", () => {
  it("mide el piso tras 2 segundos y habilita el juego", () => {
    const calibracion = crearCalibracion();
    let estado = calibracion.estado();

    for (const frame of señal(0.012, 2100, 0, 0.004)) {
      estado = calibracion.empujar(frame);
    }

    expect(estado.listo).toBe(true);
    expect(estado.pisoRuido).toBeGreaterThan(0.008);
    expect(estado.pisoRuido).toBeLessThan(0.02);
    expect(estado.ruidoAlto).toBe(false);
  });

  it("no está listo antes de los 2 segundos", () => {
    const calibracion = crearCalibracion();
    let estado = calibracion.estado();
    for (const frame of señal(0.01, 1000)) estado = calibracion.empujar(frame);

    expect(estado.listo).toBe(false);
    expect(estado.msTranscurridos).toBeLessThan(2000);
  });

  it("avisa honestamente cuando la casa está demasiado ruidosa", () => {
    const calibracion = crearCalibracion();
    let estado = calibracion.estado();

    for (const frame of señal(PISO_RUIDO_ALTO * 2, 2100)) {
      estado = calibracion.empujar(frame);
    }

    expect(estado.listo).toBe(true);
    expect(estado.ruidoAlto).toBe(true);
  });

  it("un ruido puntual (una tos) no infla el piso: manda el ruido estable", () => {
    const calibracion = crearCalibracion();
    const frames = señal(0.01, 2100);
    frames[10] = { rms: 0.9, pitchHz: null, tMs: frames[10].tMs }; // portazo
    frames[11] = { rms: 0.8, pitchHz: null, tMs: frames[11].tMs };

    let estado = calibracion.estado();
    for (const frame of frames) estado = calibracion.empujar(frame);

    expect(estado.pisoRuido).toBeLessThan(0.02);
  });

  it("el piso calibrado en una casa ruidosa hace que ESE ruido no mueva al personaje", () => {
    // Cadena completa: calibro en ruido alto → el umbral sube → el mismo ruido no activa.
    const calibracion = crearCalibracion();
    const ruido = señal(0.03, 2100, 0, 0.01);
    let cal = calibracion.estado();
    for (const frame of ruido) cal = calibracion.empujar(frame);

    const meter = crearMeter({
      pisoRuido: cal.pisoRuido,
      ...CONFIG_METER_DEFECTO,
    });
    let estado = meter.estado();
    for (const frame of señal(0.03, 3000, 2100, 0.01))
      estado = meter.empujar(frame);

    expect(estado.vozActiva).toBe(false);
  });
});
