import { describe, expect, it } from "vitest";
import {
  invitacionAmable,
  META_MS_DEFECTO,
  MS_PARA_INVITAR,
  muestraMedidor,
  reducir,
  sesionInicial,
  type Evento,
  type Sesion,
} from "@/lib/session-flow";

const correr = (sesion: Sesion, eventos: Evento[]): Sesion =>
  eventos.reduce(reducir, sesion);

const HASTA_JUGANDO: Evento[] = [
  { tipo: "EMPEZAR" },
  { tipo: "MIC_OK" },
  { tipo: "CALIBRACION_OK", pisoRuido: 0.01 },
  { tipo: "TICK", deltaMs: 32, vozActiva: true, sostenidoMs: 32 },
];

describe("session-flow: el camino feliz", () => {
  it("va del guion del padre al juego", () => {
    const sesion = correr(sesionInicial(), HASTA_JUGANDO);
    expect(sesion.actual.fase).toBe("jugando");
  });

  it("celebra al alcanzar la meta, con el tiempo REALMENTE sostenido", () => {
    const sesion = correr(sesionInicial(), [
      ...HASTA_JUGANDO,
      {
        tipo: "TICK",
        deltaMs: 32,
        vozActiva: true,
        sostenidoMs: META_MS_DEFECTO + 120,
      },
    ]);

    expect(sesion.actual).toEqual({
      fase: "celebracion",
      sostenidoMs: META_MS_DEFECTO + 120,
    });
  });

  it("volver a jugar recalibra (la casa pudo cambiar de ruido) sin re-pedir permiso", () => {
    const sesion = correr(sesionInicial(), [
      ...HASTA_JUGANDO,
      {
        tipo: "TICK",
        deltaMs: 32,
        vozActiva: true,
        sostenidoMs: META_MS_DEFECTO,
      },
      { tipo: "OTRA_VEZ" },
    ]);
    expect(sesion.actual).toEqual({ fase: "calibrando", msTranscurridos: 0 });
  });
});

describe("session-flow: ningún camino termina mal (COGA)", () => {
  it("el mic denegado tiene salida: se puede reintentar", () => {
    const denegado = correr(sesionInicial(), [
      { tipo: "EMPEZAR" },
      { tipo: "MIC_DENEGADO" },
    ]);
    expect(denegado.actual.fase).toBe("mic-denegado");

    const reintento = reducir(denegado, { tipo: "REINTENTAR_MIC" });
    expect(reintento.actual.fase).toBe("pidiendo-mic");
  });

  it("con la casa ruidosa avisa, pero deja seguir si el padre quiere", () => {
    const ruidosa = correr(sesionInicial(), [
      { tipo: "EMPEZAR" },
      { tipo: "MIC_OK" },
      { tipo: "CALIBRACION_RUIDOSA", pisoRuido: 0.08 },
    ]);
    expect(ruidosa.actual).toEqual({ fase: "ruido-alto", pisoRuido: 0.08 });

    const siguiendo = reducir(ruidosa, { tipo: "CONTINUAR_ASI" });
    expect(siguiendo.actual).toEqual({
      fase: "esperando-voz",
      pisoRuido: 0.08,
      msSinVoz: 0,
    });
  });

  it("callarse NO es perder: vuelve a esperar voz, sin castigo", () => {
    const sesion = correr(sesionInicial(), [
      ...HASTA_JUGANDO,
      { tipo: "TICK", deltaMs: 32, vozActiva: false, sostenidoMs: 800 },
    ]);
    expect(sesion.actual.fase).toBe("esperando-voz");
  });

  it("el silencio largo solo invita: no cambia de fase ni castiga", () => {
    let sesion = correr(sesionInicial(), [
      { tipo: "EMPEZAR" },
      { tipo: "MIC_OK" },
      { tipo: "CALIBRACION_OK", pisoRuido: 0.01 },
    ]);
    expect(invitacionAmable(sesion)).toBe(false);

    for (let ms = 0; ms < MS_PARA_INVITAR; ms += 100) {
      sesion = reducir(sesion, {
        tipo: "TICK",
        deltaMs: 100,
        vozActiva: false,
        sostenidoMs: 0,
      });
    }

    expect(sesion.actual.fase).toBe("esperando-voz"); // misma fase: no hay estado "fracaso"
    expect(invitacionAmable(sesion)).toBe(true);
  });

  it("el padre puede terminar cuando quiera (sin meta, sin game-over)", () => {
    const sesion = correr(sesionInicial(), [
      ...HASTA_JUGANDO,
      { tipo: "TICK", deltaMs: 32, vozActiva: true, sostenidoMs: 1200 },
      { tipo: "TERMINAR" },
    ]);
    // Celebra lo que hubo: 1.2 s. Ni más, ni un elogio vacío.
    expect(sesion.actual).toEqual({ fase: "celebracion", sostenidoMs: 1200 });
  });
});

describe("session-flow: modo calma y recalibrar", () => {
  it("el modo calma se activa en 1 toque, en cualquier fase, sin perder el progreso", () => {
    const jugando = correr(sesionInicial(), HASTA_JUGANDO);
    const calma = reducir(jugando, { tipo: "CAMBIAR_CALMA", activo: true });

    expect(calma.ajustes.modoCalma).toBe(true);
    expect(calma.actual).toEqual(jugando.actual); // sigue jugando donde iba
    expect(muestraMedidor(calma)).toBe(false); // sin medidor ni meta
  });

  it("en modo calma no hay meta: la voz sostenida no dispara celebración automática", () => {
    const calma = correr(sesionInicial(), [
      { tipo: "CAMBIAR_CALMA", activo: true },
      ...HASTA_JUGANDO,
      {
        tipo: "TICK",
        deltaMs: 32,
        vozActiva: true,
        sostenidoMs: META_MS_DEFECTO * 3,
      },
    ]);
    expect(calma.actual.fase).toBe("jugando");
  });

  it("recalibrar funciona en 1 toque desde el juego y reinicia el intento", () => {
    const jugando = correr(sesionInicial(), HASTA_JUGANDO);
    const recalibrando = reducir(jugando, { tipo: "RECALIBRAR" });
    expect(recalibrando.actual).toEqual({
      fase: "calibrando",
      msTranscurridos: 0,
    });
  });

  it("recalibrar no aplica antes de tener permiso del micrófono", () => {
    const guion = sesionInicial();
    expect(reducir(guion, { tipo: "RECALIBRAR" })).toEqual(guion);
  });
});

describe("session-flow: es un reducer puro", () => {
  it("un evento que no aplica a la fase actual no cambia nada", () => {
    const guion = sesionInicial();
    expect(reducir(guion, { tipo: "MIC_OK" })).toEqual(guion);
    expect(
      reducir(guion, {
        tipo: "TICK",
        deltaMs: 32,
        vozActiva: true,
        sostenidoMs: 100,
      }),
    ).toEqual(guion);
  });

  it("no muta la sesión que recibe", () => {
    const sesion = sesionInicial();
    const copia = structuredClone(sesion);
    reducir(sesion, { tipo: "EMPEZAR" });
    expect(sesion).toEqual(copia);
  });
});
