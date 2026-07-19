import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

// REGLA DURA 2-bis (S3): el banco de voz FAMILIAR vive SOLO en storage local. La voz de mamá y
// papá se graba con su consentimiento y se queda en el dispositivo — jamás a la red, jamás al repo.
//
// A diferencia del motor de voz (que sella TODO), aquí storage SÍ se permite: es la razón de ser
// del banco. Lo que este candado prohíbe es la RED. Segundo candado tras la regla de ESLint
// (eslint.config.mjs); además prohíbe el `eslint-disable`, que sería la única forma de apagarla.
//
// Si este test falla, NO lo relajes: ninguna grabación de la familia puede tener un camino a la red.

const RAIZ = resolve(__dirname, "../..");
const CARPETAS = ["src/lib/banco-voz", "src/lib/audio"];

const RED_PROHIBIDA: Array<{ patron: RegExp; que: string }> = [
  { patron: /\bfetch\s*\(/, que: "fetch (red)" },
  { patron: /\bXMLHttpRequest\b/, que: "XMLHttpRequest (red)" },
  { patron: /\bWebSocket\b/, que: "WebSocket (red)" },
  { patron: /\bEventSource\b/, que: "EventSource (red)" },
  { patron: /\bsendBeacon\b/, que: "navigator.sendBeacon (red)" },
  { patron: /@sentry/, que: "Sentry (podría transmitir)" },
  {
    patron: /\beslint-disable\b/,
    que: "eslint-disable (apagaría la guardia de ESLint)",
  },
];

function sinComentarios(fuente: string): string {
  return fuente
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
}

function archivosTs(carpeta: string): string[] {
  const absoluta = join(RAIZ, carpeta);
  return readdirSync(absoluta).flatMap((entrada) => {
    const ruta = join(absoluta, entrada);
    if (statSync(ruta).isDirectory()) return archivosTs(join(carpeta, entrada));
    return entrada.endsWith(".ts") ? [join(carpeta, entrada)] : [];
  });
}

describe("regla dura 2-bis: el banco de voz familiar nunca sale del dispositivo", () => {
  const archivos = CARPETAS.flatMap(archivosTs);

  it("las carpetas del banco existen y están cubiertas", () => {
    expect(archivos.length).toBeGreaterThan(0);
  });

  it.each(archivos)("%s no tiene ningún camino a la red", (relativa) => {
    const codigo = sinComentarios(readFileSync(join(RAIZ, relativa), "utf8"));
    for (const { patron, que } of RED_PROHIBIDA) {
      expect(patron.test(codigo), `${relativa} usa ${que}`).toBe(false);
    }
  });
});
