import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

// LA PROMESA MÁS SAGRADA DE LA APP (regla dura 2): el audio del niño vive solo en el buffer de
// análisis y muere ahí. Ni storage, ni red, ni logs, ni Sentry.
//
// Este test es el segundo candado. El primero es la regla de ESLint scoped a estas carpetas
// (eslint.config.mjs); este escaneo la respalda porque además prohíbe el `eslint-disable`, que
// sería la única forma de apagarla desde dentro.
//
// Si este test falla, NO lo relajes: mueve el código que necesita storage/red fuera de las
// carpetas del motor de voz.

const RAIZ = resolve(__dirname, "../..");
const CARPETAS_SELLADAS = ["src/lib/voice", "src/worklets"];

const APIS_PROHIBIDAS: Array<{ patron: RegExp; que: string }> = [
  { patron: /\bfetch\s*\(/, que: "fetch (red)" },
  { patron: /\bXMLHttpRequest\b/, que: "XMLHttpRequest (red)" },
  { patron: /\bWebSocket\b/, que: "WebSocket (red)" },
  { patron: /\bEventSource\b/, que: "EventSource (red)" },
  { patron: /\bsendBeacon\b/, que: "navigator.sendBeacon (red)" },
  { patron: /\blocalStorage\b/, que: "localStorage (persistencia)" },
  { patron: /\bsessionStorage\b/, que: "sessionStorage (persistencia)" },
  { patron: /\bindexedDB\b/i, que: "IndexedDB (persistencia)" },
  { patron: /\bcaches\b/, que: "Cache Storage (persistencia)" },
  {
    patron: /\bshowSaveFilePicker\b/,
    que: "File System Access (persistencia)",
  },
  { patron: /\bMediaRecorder\b/, que: "MediaRecorder (grabación de audio)" },
  { patron: /\bconsole\s*\./, que: "console (logs)" },
  { patron: /@sentry/, que: "Sentry (observabilidad)" },
  {
    patron: /\beslint-disable\b/,
    que: "eslint-disable (apagaría la guardia de ESLint)",
  },
];

/** Quita comentarios: una mención en la documentación del módulo no es una violación. */
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

describe("regla dura 2: el audio del niño jamás se persiste ni sale del dispositivo", () => {
  const archivos = CARPETAS_SELLADAS.flatMap(archivosTs);

  it("las carpetas del motor de voz existen y están cubiertas", () => {
    expect(archivos.length).toBeGreaterThan(0);
  });

  it.each(archivos)("%s no toca storage, red ni logs", (relativa) => {
    const codigo = sinComentarios(readFileSync(join(RAIZ, relativa), "utf8"));

    for (const { patron, que } of APIS_PROHIBIDAS) {
      expect(patron.test(codigo), `${relativa} usa ${que}`).toBe(false);
    }
  });

  it.each(archivos)(
    "%s no importa nada que pueda persistir o transmitir",
    (relativa) => {
      const codigo = sinComentarios(readFileSync(join(RAIZ, relativa), "utf8"));
      const imports = [...codigo.matchAll(/from\s+["']([^"']+)["']/g)].map(
        (m) => m[1],
      );

      for (const modulo of imports) {
        // Solo se permite importar dentro del propio motor de voz (tipos, utilidades puras).
        const permitido =
          modulo.startsWith(".") || modulo === "@/lib/voice/types";
        expect(permitido, `${relativa} importa "${modulo}"`).toBe(true);
      }
    },
  );
});
