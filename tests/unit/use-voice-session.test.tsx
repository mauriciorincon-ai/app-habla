// TEST DE INTEGRACIÓN del puente mic→juego (auditoría S3, A-2): verifica que la GUARDA DEL BUCLE
// está CABLEADA en use-voice-session — no solo que el motor puro funciona. Si alguien borra la
// línea que descarta frames mientras suena la voz familiar, ESTE test se cae (antes del remate,
// ningún test lo hacía: 139 unit + 103 e2e quedaban verdes con la guarda rota).
//
// El micrófono se reemplaza por una fuente manejada a mano (frames sintéticos, como todos los
// motores de voz) y performance.now se controla con un reloj falso: cero tiempo real, cero flake.

import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { MeterFrame } from "@/lib/voice/types";
import {
  useVoiceSession,
  type MedidasVivas,
} from "@/components/juego/use-voice-session";
import type { Metrica } from "@/lib/session-flow";

const { fuente } = vi.hoisted(() => ({
  fuente: { cb: null as null | ((f: MeterFrame) => void) },
}));

// La fuente real (AudioWorklet) no existe en jsdom: se inyecta una manejable desde el test.
vi.mock("@/lib/voice/mic-session", () => ({
  MicSession: class {
    subscribe(cb: (f: MeterFrame) => void) {
      fuente.cb = cb;
      return () => {
        fuente.cb = null;
      };
    }
    async start() {}
    stop() {}
  },
}));

const metricaActual = (m: MedidasVivas): Metrica => ({
  tipo: "sostenido",
  ms: m.sostenidoMs(),
  rachaMs: m.mejorRachaMs(),
});

/** Reloj falso para performance.now (la guarda y silenciar lo leen). */
let ahora = 0;

function frame(tMs: number, rms: number): MeterFrame {
  return { rms, pitchHz: null, tMs };
}

/** Empuja frames cada 50 ms de reloj de audio (como el worklet real). */
function empujar(desdeTMs: number, hastaTMs: number, rms: number) {
  act(() => {
    for (let t = desdeTMs; t <= hastaTMs; t += 50) fuente.cb?.(frame(t, rms));
  });
}

async function montarYCalibrar() {
  const render = renderHook(() =>
    useVoiceSession({
      modoCalmaInicial: false,
      tipoMetrica: "sostenido",
      meta: null,
      metricaActual,
    }),
  );
  await act(async () => {
    await render.result.current.empezar();
  });
  expect(render.result.current.sesion.actual.fase).toBe("calibrando");
  // 2 s de "silencio" (rms bajito): la calibración cierra y el juego queda esperando voz.
  empujar(0, 2000, 0.01);
  expect(render.result.current.sesion.actual.fase).toBe("esperando-voz");
  return render;
}

describe("use-voice-session: la guarda del bucle está cableada (ADR-010, regla dura 3)", () => {
  beforeEach(() => {
    ahora = 0;
    // Timers falsos: el reloj de TICKs (setInterval) no dispara fuera de act.
    vi.useFakeTimers();
    vi.spyOn(performance, "now").mockImplementation(() => ahora);
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("mientras suena la voz familiar, los frames de voz NO cuentan; al expirar, vuelven a contar", async () => {
    const { result } = await montarYCalibrar();

    // Voz real: el contador crece (control del test — el medidor sí oye).
    empujar(2050, 3050, 0.5);
    const antes = result.current.medidas.sostenidoMs();
    expect(antes).toBeGreaterThanOrEqual(900);

    // Suena la voz familiar (clip de 400 ms a t=0 del reloj): guarda hasta 400+cola.
    act(() => result.current.silenciar(400));
    empujar(3100, 3600, 0.5); // "eco" por el micrófono mientras suena
    expect(result.current.medidas.sostenidoMs()).toBe(antes); // NI UN ms de mentira

    // La guarda expiró: la voz del niño vuelve a contar de inmediato.
    ahora = 800;
    empujar(3650, 4150, 0.5);
    expect(result.current.medidas.sostenidoMs()).toBeGreaterThan(antes);
  });

  it("silenciar(0) cancela la guarda: un play() fallido no deja al juego sordo", async () => {
    const { result } = await montarYCalibrar();

    // El autoplay "iba" a sonar 5 s… pero play() falló: se cancela.
    act(() => result.current.silenciar(5000));
    act(() => result.current.silenciar(0));

    // La voz del niño cuenta YA, sin esperar los 5 s de un clip que nunca sonó.
    empujar(2050, 2550, 0.5);
    expect(result.current.medidas.sostenidoMs()).toBeGreaterThanOrEqual(400);
  });
});

// S12 (ADR-024): los dos detectores nuevos están CABLEADOS a la sesión. Si alguien quita la línea que los
// alimenta, o el reinicio entre intentos, este test se cae.
describe("use-voice-session: soplo e intensidad están cableados (S12)", () => {
  beforeEach(() => {
    ahora = 0;
    vi.useFakeTimers();
    vi.spyOn(performance, "now").mockImplementation(() => ahora);
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  /** A blow frame: energy, no pitch, few zero crossings (the worklet's zcr). */
  const frameSoplo = (tMs: number): MeterFrame => ({ rms: 0.08, pitchHz: null, tMs, zcr: 0.03 });
  const frameVoz = (tMs: number, rms: number): MeterFrame => ({ rms, pitchHz: 300, tMs, zcr: 0.012 });

  function empujarFrames(desde: number, hasta: number, hacer: (t: number) => MeterFrame) {
    act(() => {
      for (let t = desde; t <= hasta; t += 50) fuente.cb?.(hacer(t));
    });
  }

  it("un soplo sostenido se cuenta una vez; una vocal no; el eco de la voz familiar no", async () => {
    const { result } = await montarYCalibrar();
    expect(result.current.medidas.soplos()).toBe(0);

    // Una vocal (con tono): no es un soplo.
    empujarFrames(2050, 2850, (t) => frameVoz(t, 0.08));
    expect(result.current.medidas.soplos()).toBe(0);

    // Suena la voz familiar: ni un soplo falso por el eco.
    act(() => result.current.silenciar(2000));
    empujarFrames(2900, 3500, frameSoplo);
    expect(result.current.medidas.soplos()).toBe(0);
    act(() => result.current.silenciar(0));

    // Un soplo de verdad: sin tono y con pocos cruces, más de lo que tarda en confirmarse.
    empujarFrames(3550, 4300, frameSoplo);
    expect(result.current.medidas.soplando()).toBe(true);
    expect(result.current.medidas.soplos()).toBe(1);

    // Otra vez (reinicio del intento): vuelve a cero.
    act(() => result.current.recalibrar());
    expect(result.current.medidas.soplos()).toBe(0);
  });

  it("la voz suave y la fuerte se leen contra el piso del cuarto, y cada cambio se cuenta", async () => {
    const { result } = await montarYCalibrar(); // piso ≈ 0.01
    const piso = 0.01;
    empujarFrames(2050, 2650, (t) => frameVoz(t, piso * 5));
    expect(result.current.medidas.nivelVoz()).toBe("suave");
    empujarFrames(2700, 3300, (t) => frameVoz(t, piso * 40));
    expect(result.current.medidas.nivelVoz()).toBe("fuerte");
    empujarFrames(3350, 3950, (t) => frameVoz(t, piso * 5));
    expect(result.current.medidas.nivelVoz()).toBe("suave");
    expect(result.current.medidas.cambiosVoz()).toBe(2);
    expect(result.current.medidas.alturaVoz()).toBeGreaterThan(0);
  });
});

describe("use-voice-session: los turnos están cableados (S13, ADR-025)", () => {
  beforeEach(() => {
    ahora = 0;
    vi.useFakeTimers();
    vi.spyOn(performance, "now").mockImplementation(() => ahora);
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("en «tu turno» el dibujo se mueve con tu voz pero nada se le cuenta a él; en su turno, sí", async () => {
    const { result } = await montarYCalibrar();
    act(() => result.current.cambiarTurno("adulto"));
    expect(result.current.sesion.turno).toBe("adulto");

    empujar(2050, 3500, 0.2);
    expect(result.current.medidas.nivel()).toBeGreaterThan(0.5);
    expect(result.current.medidas.vozActiva()).toBe(true);
    expect(result.current.medidas.sostenidoMs()).toBe(0);
    expect(result.current.medidas.mejorRachaMs()).toBe(0);

    act(() => result.current.cambiarTurno("nino"));
    empujar(3550, 5000, 0.2);
    expect(result.current.medidas.sostenidoMs()).toBeGreaterThan(1000);
    // El reloj de ticks ve la voz de su turno y la cuenta como UN turno de él.
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current.sesion.turnosNino).toBe(1);
  });
});
