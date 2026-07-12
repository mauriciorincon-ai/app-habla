import path from "node:path";
import { defineConfig } from "vitest/config";

// Config que el ci.yml del kit ya asume (job quality: "pnpm test").
// Patrón validado en app-nutri-kids S1 y app-ds S1. Cada app ajusta `coverage.include` a sus
// motores puros y puede subir los umbrales.
// ⚠ K7 (ds S1): los umbrales SOLO se aplican si el script `test` pasa `--coverage`. El estampado
// lo omite a propósito (CI verde día 0 sin tests); al escribir los PRIMEROS tests del S1, añade
// `--coverage` al script `test` de package.json — es parte del setup del sprint, no una sorpresa.
export default defineConfig({
  resolve: {
    alias: {
      "@content": path.resolve(__dirname, "content"),
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      // Solo *.ts: un include de directorio hace que v8 intente parsear .gitkeep y truene
      // con PARSE_ERROR (K8, ds S1).
      // K-habla-1: el kit traía src/engine/** pero esta app usa src/lib/** (CLAUDE.md).
      include: ["src/lib/**/*.ts"],
      exclude: [
        // Cableado del kit (inerte sin DSN), no motor de esta app.
        "src/lib/observability.ts",
        // Adaptadores de Web Audio: no son unit-testeables en jsdom (no hay AudioContext ni
        // getUserMedia). Se cubren con e2e de micrófono falso (tests/e2e/spike-audio.spec.ts y
        // el happy path), y su privacidad la vigila tests/unit/privacidad-voice.test.ts.
        "src/lib/voice/mic-session.ts",
        "src/lib/voice/analyser-source.ts",
        // Solo tipos y constantes.
        "src/lib/voice/types.ts",
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
        // Los motores puros exigen más (regla 2 del CLAUDE.md; K6, ds S1):
        "src/lib/voice/**/*.ts": {
          lines: 80,
          functions: 80,
          branches: 80,
          statements: 80,
        },
        "src/lib/coach/**/*.ts": {
          lines: 80,
          functions: 80,
          branches: 80,
          statements: 80,
        },
        "src/lib/session-flow.ts": {
          lines: 80,
          functions: 80,
          branches: 80,
          statements: 80,
        },
      },
    },
  },
});
