import { writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test, type Page } from "./base";

// «CASI» (S15, ADR-027): la celebración solo afirma lo medido EN SU TURNO. Con un micrófono que no oye voz, la
// familia oye «casi» —nunca «le salió»—. Va aparte porque el micrófono falso es de todo el archivo.

const LOCALE = { es: "es-ES", en: "en-US" } as const;

/** Mete una grabación en el banco local (como si el adulto la hubiera grabado). */
async function inyectarGrabacion(page: Page, id: string) {
  await page.evaluate(async (clave) => {
    await new Promise<void>((resolve, reject) => {
      const req = indexedDB.open("habla-banco-voz", 1);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains("grabaciones"))
          req.result.createObjectStore("grabaciones");
      };
      req.onsuccess = () => {
        const tx = req.result.transaction("grabaciones", "readwrite");
        tx.objectStore("grabaciones").put(
          {
            datos: new ArrayBuffer(64),
            mimeType: "audio/webm",
            duracionMs: 500,
            fecha: "2026-07-18",
          },
          clave,
        );
        tx.oncomplete = () => {
          req.result.close();
          resolve();
        };
        tx.onerror = () => reject(tx.error);
      };
      req.onerror = () => reject(req.error);
    });
  }, id);
}

// «Casi» necesita un micrófono que no oiga voz: el WAV de las demás pruebas SÍ la trae (y entonces la
// celebración dice «le salió», que es lo medido). Aquí el micrófono falso toca un segundo de silencio.
const SILENCIO = join(tmpdir(), "habla-e2e-silencio.wav");
{
  const rate = 16000;
  const n = rate;
  const wav = Buffer.alloc(44 + n * 2);
  wav.write("RIFF", 0);
  wav.writeUInt32LE(36 + n * 2, 4);
  wav.write("WAVEfmt ", 8);
  wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(rate, 24);
  wav.writeUInt32LE(rate * 2, 28);
  wav.writeUInt16LE(2, 32);
  wav.writeUInt16LE(16, 34);
  wav.write("data", 36);
  wav.writeUInt32LE(n * 2, 40);
  writeFileSync(SILENCIO, wav);
}

test.use({
  launchOptions: {
    args: [
      "--use-fake-ui-for-media-stream",
      "--use-fake-device-for-media-stream",
      `--use-file-for-fake-audio-capture=${SILENCIO}`,
    ],
  },
});

for (const idioma of ["es", "en"] as const) {
  test.describe(`casi, idioma ${idioma}`, () => {
    test.use({ locale: LOCALE[idioma] });

    test("«casi» suena con la voz de la familia, y solo «casi» (no se afirma lo que no se midió)", async ({
      page,
    }) => {
      await page.addInitScript(() => {
        (window as unknown as { __sono: string[] }).__sono = [];
        window.addEventListener("voz-familiar:sono", (e) =>
          (window as unknown as { __sono: string[] }).__sono.push(
            (e as CustomEvent<{ id: string }>).detail.id,
          ),
        );
      });
      await page.goto("/jugar/palabras");
      const sufijo = idioma === "es" ? "" : "-en";
      await inyectarGrabacion(page, `celebracion${sufijo}:casi`);
      await inyectarGrabacion(page, `celebracion${sufijo}:le-salio`);

      await page.goto("/jugar/palabras");
      await page.getByTestId("empezar-juego").click();
      await expect(page.getByTestId("juego")).toHaveAttribute(
        "data-fase",
        /esperando-voz|jugando/,
        { timeout: 20_000 },
      );
      // «Ya jugamos» sin que su voz se haya medido: la celebración dice «casi», no «le salió».
      await page.getByTestId("terminar").click();
      await expect(page.getByTestId("celebracion")).toBeVisible();
      await expect
        .poll(() =>
          page.evaluate(
            () => (window as unknown as { __sono: string[] }).__sono,
          ),
        )
        .toContain(`celebracion${sufijo}:casi`);
      const sonaron = await page.evaluate(
        () => (window as unknown as { __sono: string[] }).__sono,
      );
      expect(sonaron).not.toContain(`celebracion${sufijo}:le-salio`);
    });
  });
}
