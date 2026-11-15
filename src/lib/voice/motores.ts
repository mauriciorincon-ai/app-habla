// Los cinco motores de voz de un intento, en un solo paquete (S13, ADR-025). Motor PURO: sin Web Audio,
// sin DOM, sin storage, sin red — solo aritmética sobre escalares (regla dura 2).
//
// Por qué hay DOS paquetes en cada juego (turnos dentro del juego):
//   - el EN VIVO recibe todos los frames y mueve el dibujo: cuando el adulto modela, el personaje se
//     mueve y el niño VE el modelo;
//   - el DEL NIÑO recibe los frames solo en «su turno»; en «tu turno» recibe un frame en silencio, así
//     que para él el cuarto calla. De este paquete sale TODO lo que se cuenta y se celebra.
// El silencio (y no «dejar de alimentarlo») cierra bien las rachas: el medidor suelta la voz tras su
// gracia, el soplo termina, el tono se olvida — y al volver su turno nada arrastra la voz del adulto.
// Nadie identifica de quién es una voz: el turno lo marca el adulto con un toque (regla dura 4).

import type { MeterFrame } from "./types";
import { CONFIG_METER_DEFECTO, crearMeter, type Meter } from "./meter";
import {
  crearPitchTracker,
  type Direccion,
  type PitchTracker,
} from "./pitch-tracker";
import {
  crearSeguimientoVocales,
  type SeguimientoVocales,
  type Vocal,
} from "./vocales";
import {
  crearDetectorSoplo,
  type DetectorSoplo,
  type EstadoSoplo,
} from "./soplo";
import {
  crearLectorIntensidad,
  type EstadoIntensidad,
  type LectorIntensidad,
} from "./intensidad";

export type LecturaMotores = {
  nivel: number;
  vozActiva: boolean;
  sostenidoMs: number;
  mejorRachaMs: number;
  alturaPitch: number;
  direccionPitch: Direccion;
  inversiones: number;
  vocalActual: Vocal | null;
  vocalesZonas: number;
  vocalesCambios: number;
  soplo: EstadoSoplo;
  intensidad: EstadoIntensidad;
};

export type Motores = {
  empujar(frame: MeterFrame): LecturaMotores;
  lectura(): LecturaMotores;
  reiniciar(): void;
};

export const SOPLO_CERO: EstadoSoplo = {
  soplando: false,
  soplos: 0,
  soploMs: 0,
  fuerza: 0,
};
export const INTENSIDAD_CERO: EstadoIntensidad = {
  nivel: "silencio",
  db: 0,
  altura: 0,
  cambios: 0,
};

export const LECTURA_CERO: LecturaMotores = {
  nivel: 0,
  vozActiva: false,
  sostenidoMs: 0,
  mejorRachaMs: 0,
  alturaPitch: 0,
  direccionPitch: "quieto",
  inversiones: 0,
  vocalActual: null,
  vocalesZonas: 0,
  vocalesCambios: 0,
  soplo: SOPLO_CERO,
  intensidad: INTENSIDAD_CERO,
};

/**
 * El mismo instante, sin sonido: lo que el paquete del niño recibe en «tu turno». Conserva el reloj
 * (`tMs`) para que ningún motor vea un hueco, y conserva la PRESENCIA de `zcr` (el detector de soplo
 * ignora los frames del respaldo que no la traen) con valor cero.
 */
export function frameEnSilencio(frame: MeterFrame): MeterFrame {
  const silencio: MeterFrame = {
    rms: 0,
    pitchHz: null,
    tMs: frame.tMs,
    formantes: null,
  };
  if (frame.zcr !== undefined) silencio.zcr = 0;
  if (frame.grave !== undefined) silencio.grave = false;
  return silencio;
}

export function crearMotores(pisoRuido: number): Motores {
  const meter: Meter = crearMeter({ pisoRuido, ...CONFIG_METER_DEFECTO });
  const pitch: PitchTracker = crearPitchTracker();
  const vocales: SeguimientoVocales = crearSeguimientoVocales();
  const soplo: DetectorSoplo = crearDetectorSoplo({ pisoRuido });
  const intensidad: LectorIntensidad = crearLectorIntensidad({ pisoRuido });

  const lectura = (): LecturaMotores => {
    const m = meter.estado();
    const p = pitch.estado();
    return {
      nivel: m.nivel,
      vozActiva: m.vozActiva,
      sostenidoMs: m.sostenidoMs,
      mejorRachaMs: m.mejorRachaMs,
      alturaPitch: p.altura,
      direccionPitch: p.direccion,
      inversiones: p.inversiones,
      vocalActual: vocales.actual(),
      vocalesZonas: vocales.zonas(),
      vocalesCambios: vocales.cambios(),
      soplo: soplo.estado(),
      intensidad: intensidad.estado(),
    };
  };

  return {
    empujar(frame) {
      const m = meter.empujar(frame);
      // El tono y las vocales usan el MISMO frame y el veredicto de energía del medidor: el ruido de
      // la casa no produce tono fantasma (ADR 007) ni vocal fantasma (ADR-021).
      pitch.empujar(frame, m.vozActiva);
      vocales.empujar(frame.formantes, frame.pitchHz, m.vozActiva);
      soplo.procesar(frame);
      intensidad.procesar(frame);
      return lectura();
    },
    lectura,
    reiniciar() {
      meter.reiniciar();
      pitch.reiniciar();
      vocales.reiniciar();
      soplo.reiniciar();
      intensidad.reiniciar();
    },
  };
}
