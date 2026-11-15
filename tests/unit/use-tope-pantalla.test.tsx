// The daily cap in the page (S12, ADR-024): the clock runs only while playing and visible, reaching the cap
// closes the game ONCE (the adult's notice), and after that it never cuts again that day.

import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useTopePantalla } from "@/components/juego/use-tope-pantalla";
import { claveFechaLocal } from "@/lib/fecha";
import { guardarPantalla, leerPantalla } from "@/lib/pantalla/almacen";

const HOY = claveFechaLocal(new Date());
const MIN = 60_000;

beforeEach(() => {
  window.localStorage.clear();
  vi.useFakeTimers();
});
afterEach(() => vi.useRealTimers());

function montar(opciones: { jugando: boolean; topeMinutos?: number }) {
  const alAlcanzar = vi.fn();
  const hook = renderHook(
    (p: { jugando: boolean }) =>
      useTopePantalla({ jugando: p.jugando, topeMinutos: opciones.topeMinutos ?? 5, alAlcanzar }),
    { initialProps: { jugando: opciones.jugando } },
  );
  return { alAlcanzar, ...hook };
}

describe("useTopePantalla", () => {
  it("no cuenta mientras no se juega", () => {
    const { alAlcanzar } = montar({ jugando: false });
    act(() => void vi.advanceTimersByTime(30_000));
    expect(leerPantalla().ms).toBe(0);
    expect(alAlcanzar).not.toHaveBeenCalled();
  });

  it("cuenta lo jugado en el contador local de hoy", () => {
    montar({ jugando: true });
    act(() => void vi.advanceTimersByTime(5000));
    expect(leerPantalla().fecha).toBe(HOY);
    expect(leerPantalla().ms).toBeGreaterThanOrEqual(4000);
    expect(leerPantalla().ms).toBeLessThanOrEqual(5000);
  });

  it("al tope cierra el juego UNA vez, avisa al adulto, y no vuelve a cortar ese día", () => {
    guardarPantalla({ fecha: HOY, ms: 5 * MIN - 2500, avisado: false });
    const { alAlcanzar, result } = montar({ jugando: true });
    expect(result.current.avisoMinutos).toBeNull();
    act(() => void vi.advanceTimersByTime(4000));
    expect(alAlcanzar).toHaveBeenCalledTimes(1);
    expect(result.current.avisoMinutos).toBe(5); // el tope de 5 min recién alcanzado (se redondea hacia abajo: nunca de más)
    expect(leerPantalla().avisado).toBe(true);
    // El adulto sigue jugando: ni un segundo más de aviso, por largo que sea.
    act(() => void vi.advanceTimersByTime(3 * MIN));
    expect(alAlcanzar).toHaveBeenCalledTimes(1);
  });

  it("una pestaña oculta no suma", () => {
    montar({ jugando: true });
    Object.defineProperty(document, "visibilityState", { value: "hidden", configurable: true });
    act(() => void vi.advanceTimersByTime(10_000));
    Object.defineProperty(document, "visibilityState", { value: "visible", configurable: true });
    expect(leerPantalla().ms).toBe(0);
  });

  it("el contador de ayer no cuenta hoy", () => {
    guardarPantalla({ fecha: "2000-01-01", ms: 9 * MIN, avisado: true });
    const { alAlcanzar } = montar({ jugando: true });
    act(() => void vi.advanceTimersByTime(3000));
    expect(alAlcanzar).not.toHaveBeenCalled();
    expect(leerPantalla().fecha).toBe(HOY);
    expect(leerPantalla().avisado).toBe(false);
  });
});
