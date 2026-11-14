import path from "node:path";
import { defineConfig, devices } from "@playwright/test";

const fixture = (nombre: string) =>
  path.resolve(__dirname, "tests/e2e/fixtures", nombre);

/** Flags del micrófono falso de Chromium con el WAV que le toca a cada proyecto. */
const fakeMic = (wav: string) => ({
  args: [
    "--use-fake-ui-for-media-stream",
    "--use-fake-device-for-media-stream",
    `--use-file-for-fake-audio-capture=${fixture(wav)}`,
  ],
});

// Config que el ci.yml del kit ya asume (job e2e: "pnpm test:e2e").
// Patrón validado en app-nutri-kids S1. Móvil primero: las apps del pipeline son mobile-first.
// Puerto del servidor de los e2e. Por defecto 3500, el de Habla (3000 y 3100 son de otras apps); el servidor escucha
// solo en 127.0.0.1, nunca en todas las interfaces. E2E_PORT lo mueve en local.
const PUERTO = process.env.E2E_PORT ?? "3500";
const BASE = `http://127.0.0.1:${PUERTO}`;

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: BASE,
    // S7: la app sigue al navegador, y Playwright corre en en-US por defecto. Los e2e de este sprint
    // van en español (regla 20: UN idioma por sprint); el inglés se prueba en tests/e2e/idioma.spec.ts.
    locale: "es-CO",
    trace: "on-first-retry",
    // Micrófono falso para los e2e del juego de voz: Chromium "captura" el WAV sintético
    // (silencio → voz sostenida → silencio; ver scripts/gen-voz-sintetica.mjs) y lo loopea.
    permissions: ["microphone"],
    launchOptions: fakeMic("voz-sintetica.wav"),
  },
  projects: [
    {
      name: "mobile-chromium",
      use: { ...devices["Pixel 7"] },
      testIgnore: /(cohete|spike-pitch|vocales)\.spec\.ts/,
    },
    {
      name: "desktop-chromium",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: /(cohete|spike-pitch|vocales)\.spec\.ts/,
    },
    {
      // El cohete necesita una voz que CANTE (barrido de tono), no una voz plana: proyecto
      // aparte con su propio WAV. Así el fixture compartido (y los 32 e2e del S1) no se tocan.
      name: "desktop-chromium-tono",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: fakeMic("barrido-tono.wav"),
      },
      testMatch: /(cohete|spike-pitch)\.spec\.ts/,
    },
    {
      // El mapa de las vocales (S10): vocales sintéticas de voz infantil (a·e·i·o·u), no un barrido.
      name: "desktop-chromium-vocales",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: fakeMic("vocales-nino.wav"),
      },
      testMatch: /vocales\.spec\.ts/,
    },
  ],
  webServer: {
    // El job e2e del CI no hace build previo → en CI se construye aquí; local usa dev server.
    command: process.env.CI
      ? `pnpm build && pnpm start -H 127.0.0.1 --port ${PUERTO}`
      : `pnpm dev -H 127.0.0.1 --port ${PUERTO}`,
    url: BASE,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
