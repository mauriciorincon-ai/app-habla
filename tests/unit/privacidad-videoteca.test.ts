import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

// REGLA DURA 2 (S8): la app NO abre la cámara. La videoteca de la familia recibe clips que la
// familia elige de su galería (<input type="file" accept="video/*">, SIN `capture`), los guarda
// solo en el dispositivo y no los envía a ningún sitio. Este candado vigila los dos caminos:
//   · la cámara (getUserMedia, el atributo `capture`, MediaRecorder de video);
//   · la salida (red, Sentry, exportación) — además del candado de privacidad-banco.test.ts.
// Si falla, NO lo relajes.

const RAIZ = resolve(__dirname, "../..");
const ARCHIVOS = [
  ...ts("src/lib/videoteca"),
  "src/components/estudio/videoteca-cliente.tsx",
  "src/app/estudio/videos/page.tsx",
];

function ts(carpeta: string): string[] {
  const abs = join(RAIZ, carpeta);
  return readdirSync(abs).flatMap((e) => {
    const r = join(carpeta, e);
    return statSync(join(RAIZ, r)).isDirectory() ? ts(r) : e.endsWith(".ts") ? [r] : [];
  });
}

const sinComentarios = (f: string) => f.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");

const CAMARA: Array<{ patron: RegExp; que: string }> = [
  { patron: /getUserMedia/, que: "getUserMedia (abre cámara o micrófono)" },
  { patron: /\bcapture\s*=/, que: "el atributo capture (abre la cámara)" },
  { patron: /\bcapture:/, que: "capture (abre la cámara)" },
  { patron: /MediaRecorder/, que: "MediaRecorder (graba)" },
  { patron: /\bmediaDevices\b/, que: "mediaDevices" },
];
const SALIDA: Array<{ patron: RegExp; que: string }> = [
  { patron: /\bfetch\s*\(/, que: "fetch" },
  { patron: /\bXMLHttpRequest\b/, que: "XMLHttpRequest" },
  { patron: /\bsendBeacon\b/, que: "sendBeacon" },
  { patron: /@sentry/, que: "Sentry" },
  { patron: /navigator\.share\b/, que: "navigator.share (sacaría el clip del dispositivo)" },
  { patron: /\bdownload\b\s*=|\.download\b/, que: "descarga del clip" },
];

describe("videoteca: sin cámara y sin salida", () => {
  it("existen los archivos vigilados", () => {
    expect(ARCHIVOS.length).toBeGreaterThanOrEqual(5);
  });
  it.each(ARCHIVOS)("%s no abre la cámara ni saca el video", (rel) => {
    const codigo = sinComentarios(readFileSync(join(RAIZ, rel), "utf8"));
    for (const { patron, que } of [...CAMARA, ...SALIDA]) {
      expect(patron.test(codigo), `${rel} usa ${que}`).toBe(false);
    }
  });
  it("el selector de archivos pide video y no declara `capture`", () => {
    const c = readFileSync(join(RAIZ, "src/components/estudio/videoteca-cliente.tsx"), "utf8");
    expect(c).toMatch(/type="file"/);
    expect(c).toMatch(/accept="video\/\*"/);
  });
  it("el <video> no ofrece descargar, ni enviar a otra pantalla, ni imagen en imagen", () => {
    const c = readFileSync(join(RAIZ, "src/components/estudio/videoteca-cliente.tsx"), "utf8");
    expect(c).toMatch(/controlsList="nodownload noremoteplayback"/);
    expect(c).toMatch(/disablePictureInPicture/);
  });
});
