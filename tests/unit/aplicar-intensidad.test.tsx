import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

let valor: { intensidad: "normal" | "suave" } | null = null;
vi.mock("@/components/estado-local", () => ({ useAjustes: () => valor }));

import { AplicarIntensidad } from "@/components/aplicar-intensidad";

afterEach(() => {
  delete document.documentElement.dataset.intensidad;
});

describe("AplicarIntensidad", () => {
  it("before the settings load it leaves what the inline script set", () => {
    document.documentElement.dataset.intensidad = "suave";
    valor = null;
    render(<AplicarIntensidad />);
    expect(document.documentElement.dataset.intensidad).toBe("suave");
  });

  it("once loaded it follows the setting", () => {
    valor = { intensidad: "suave" };
    const { rerender } = render(<AplicarIntensidad />);
    expect(document.documentElement.dataset.intensidad).toBe("suave");
    valor = { intensidad: "normal" };
    rerender(<AplicarIntensidad />);
    expect(document.documentElement.dataset.intensidad).toBeUndefined();
  });
});
