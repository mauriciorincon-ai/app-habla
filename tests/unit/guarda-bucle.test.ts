import { describe, expect, it } from "vitest";
import { COLA_ECO_MS, crearGuardaBucle } from "@/lib/voice/guarda-bucle";

// LA GUARDA DEL BUCLE parlante→micrófono (ADR-010, regla dura 3): mientras suena la voz familiar,
// el medidor ignora los frames — el eco de esa voz NO puede contar como voz del niño.
// Este unit blinda el motor puro; el cableado en use-voice-session tiene su propio test de
// integración (use-voice-session.test.tsx) y el comportamiento por la UI, su e2e.

describe("guarda del bucle (ADR-010): la voz grabada no cuenta como voz del niño", () => {
  it("silencia durante el clip Y la cola de eco, y después se apaga sola", () => {
    const guarda = crearGuardaBucle();
    expect(guarda.activa(0)).toBe(false); // nace apagada

    guarda.silenciar(1000, 0); // clip de 1 s a t=0
    expect(guarda.activa(0)).toBe(true);
    expect(guarda.activa(999)).toBe(true);
    // La cola importa: el eco del cuarto no muere con el archivo.
    expect(guarda.activa(1000 + COLA_ECO_MS - 1)).toBe(true);
    expect(guarda.activa(1000 + COLA_ECO_MS)).toBe(false);
  });

  it("clips superpuestos ACUMULAN al más largo: uno corto no acorta una guarda viva", () => {
    const guarda = crearGuardaBucle();
    guarda.silenciar(2000, 0); // clip largo hasta 2000+cola
    guarda.silenciar(100, 500); // clip corto que termina antes (600+cola)
    // Si el corto mandara, a t=1500 la guarda estaría apagada y el eco del clip largo contaría
    // como voz del niño — exactamente la mentira que la regla dura 3 prohíbe.
    expect(guarda.activa(1500)).toBe(true);
    expect(guarda.activa(2000 + COLA_ECO_MS)).toBe(false);
  });

  it("silenciar(0) CANCELA: un play() fallido no deja al juego sordo", () => {
    const guarda = crearGuardaBucle();
    guarda.silenciar(3000, 0);
    expect(guarda.activa(100)).toBe(true);
    // El autoplay se bloqueó: no sonó nada → nada que silenciar. El medidor vuelve YA.
    guarda.silenciar(0, 100);
    expect(guarda.activa(101)).toBe(false);
  });

  it("un ms negativo se trata como cancelación (nunca una guarda en el pasado remoto)", () => {
    const guarda = crearGuardaBucle();
    guarda.silenciar(-500, 1000);
    expect(guarda.activa(1000)).toBe(false);
  });
});
