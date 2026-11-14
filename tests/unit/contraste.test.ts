import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * The coral used as TEXT (the child's celebration line, the real-metric numbers) must reach
 * AA (4.5:1) in every theme it can appear on. Fills, borders and the halo keep
 * `--celebracion*`; only text reads `--celebracion-texto` (S11 payment, design-system.md).
 */
const css = readFileSync("src/app/globals.css", "utf8");

const primitivo = (nombre: string): string => {
  const m = css.match(new RegExp(`--${nombre}:\\s*(#[0-9a-fA-F]{6})`));
  if (!m) throw new Error(`primitive ${nombre} not found`);
  return m[1]!;
};

/** Resolves `--celebracion-texto` inside the rule whose selector contains `selector`. */
const textoEn = (selector: string): string => {
  const i = css.indexOf(selector);
  if (i < 0) throw new Error(`selector ${selector} not found`);
  const bloque = css.slice(i, css.indexOf("}", i));
  const m = bloque.match(/--celebracion-texto:\s*var\(--([a-z0-9-]+)\)/);
  if (!m) throw new Error(`no --celebracion-texto in ${selector}`);
  return primitivo(m[1]!);
};

const luz = (hex: string): number => {
  const c = [1, 3, 5]
    .map((k) => parseInt(hex.slice(k, k + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0]! + 0.7152 * c[1]! + 0.0722 * c[2]!;
};
const razon = (a: string, b: string): number => {
  const [x, y] = [luz(a), luz(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};

const CASOS: Array<[string, string, string[]]> = [
  [":root {\n  --fondo", "light", ["color-cream-50", "color-cream-100"]],
  [':root[data-tema="oscuro"]', "dark", ["oscuro-fondo", "oscuro-superficie"]],
  [
    "@media (prefers-color-scheme: dark)",
    "dark (system)",
    ["oscuro-fondo", "oscuro-superficie"],
  ],
  [".tema-nino {", "child", ["color-kid-bg", "color-cream-50"]],
  [
    ".tema-nino--calma {",
    "child · calm",
    ["color-cream-200", "color-cream-100"],
  ],
];

describe("celebration text contrast (AA, both themes)", () => {
  it.each(CASOS)(
    "%s (%s) reaches 4.5:1 on its backgrounds",
    (selector, _tema, fondos) => {
      let texto: string;
      if (selector.startsWith("@media")) {
        const i = css.indexOf(selector);
        const bloque = css.slice(i, css.indexOf("\n}\n", i));
        const m = bloque.match(/--celebracion-texto:\s*var\(--([a-z0-9-]+)\)/);
        texto = primitivo(m![1]!);
      } else {
        texto = textoEn(selector);
      }
      for (const f of fondos) {
        expect(
          razon(texto, primitivo(f)),
          `${selector} on ${f}`,
        ).toBeGreaterThanOrEqual(4.5);
      }
    },
  );

  it("the old text color (coral-500 on the child's cream) is what failed", () => {
    expect(
      razon(primitivo("color-coral-500"), primitivo("color-kid-bg")),
    ).toBeLessThan(3);
  });

  it("no component paints text with the fill token any more", () => {
    const fuentes = [
      "escenario-palabra",
      "cohete-tono",
      "voice-game",
      "celebracion-honesta",
    ].map((f) => readFileSync(`src/components/juego/${f}.tsx`, "utf8"));
    for (const f of fuentes) expect(f).not.toMatch(/text-celebracion-fuerte/);
  });
});
