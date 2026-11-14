import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// «Cuentos de casa» (S9, ADR-019): ni red, ni cámara, ni voz sintética. La IA corre fuera del runtime
// (con `/bandeja` en Claude Code); la app solo descarga el pedido y lee el lote que el adulto elige.

const RAIZ = join(__dirname, "../..");
const de = (dir: string) => readdirSync(join(RAIZ, dir)).filter((f) => /\.tsx?$/.test(f)).map((f) => `${dir}/${f}`);
const ARCHIVOS = [
  ...de("src/lib/cuentos"),
  ...de("src/lib/bandeja"),
  ...de("src/components/cuentos"),
  "src/app/cuentos/page.tsx",
  "src/app/estudio/cuentos/page.tsx",
  "content/cuentos.ts",
];

const PROHIBIDO: Array<{ patron: RegExp; que: string }> = [
  { patron: /\bfetch\s*\(/, que: "fetch (red)" },
  { patron: /\bXMLHttpRequest\b|\bWebSocket\b|\bEventSource\b|\bsendBeacon\b/, que: "red" },
  { patron: /@sentry|@anthropic-ai|openai/i, que: "SDK o telemetría" },
  { patron: /speechSynthesis|SpeechSynthesisUtterance/, que: "voz sintética" },
  { patron: /\bvideo\s*:\s*true|\bcapture=|getDisplayMedia/, que: "cámara o pantalla" },
  { patron: /\beslint-disable\b/, que: "eslint-disable" },
];

const sinComentarios = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");

describe("cuentos: sin red, sin cámara, sin voz sintética", () => {
  it("cubre los archivos de la feature", () => {
    expect(ARCHIVOS.length).toBeGreaterThanOrEqual(9);
  });

  it.each(ARCHIVOS)("%s", (rel) => {
    const codigo = sinComentarios(readFileSync(join(RAIZ, rel), "utf8"));
    for (const { patron, que } of PROHIBIDO) expect(patron.test(codigo), `${rel} usa ${que}`).toBe(false);
  });

  it("el lote se elige de un archivo JSON, nunca de la cámara", () => {
    const ui = readFileSync(join(RAIZ, "src/components/cuentos/cuentos-adulto.tsx"), "utf8");
    expect(ui).toMatch(/type="file"/);
    expect(ui).toMatch(/accept="application\/json,\.json"/);
  });
});
