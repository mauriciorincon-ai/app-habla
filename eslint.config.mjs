import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Regla dura 2 de esta app (privacidad de un menor): el audio del niño vive SOLO en el buffer
// de análisis. Las carpetas del motor de voz quedan selladas: sin storage, sin red, sin logs.
// Segundo candado (por si alguien intenta un eslint-disable): tests/unit/privacidad-voice.test.ts
const GLOBALES_PROHIBIDOS = [
  "fetch",
  "localStorage",
  "sessionStorage",
  "indexedDB",
  "caches",
  "XMLHttpRequest",
  "WebSocket",
  "EventSource",
  "MediaRecorder",
];

const MENSAJE_PRIVACIDAD =
  "Regla dura 2: el audio del niño jamás se persiste ni sale del dispositivo. " +
  "Si necesitas storage o red, ese código no va en el motor de voz.";

// Regla dura 2-bis (S3): el banco de voz FAMILIAR vive SOLO en storage local. A diferencia del
// motor de voz, aquí storage SÍ se permite (es su razón de ser) — lo que jamás se permite es la
// RED: ninguna grabación de la familia sale del dispositivo ni entra al repo.
const RED_PROHIBIDA = [
  "fetch",
  "XMLHttpRequest",
  "WebSocket",
  "EventSource",
];

const MENSAJE_BANCO =
  "Regla dura 2-bis: el banco de voz familiar vive SOLO en storage local. " +
  "Nada de red: ninguna grabación sale del dispositivo.";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/lib/voice/**/*.ts", "src/worklets/**/*.ts"],
    rules: {
      "no-restricted-globals": [
        "error",
        ...GLOBALES_PROHIBIDOS.map((name) => ({ name, message: MENSAJE_PRIVACIDAD })),
      ],
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@sentry/*", "pino", "next/*", "node:*", "@/lib/storage/*", "@/lib/observability"],
              message: MENSAJE_PRIVACIDAD,
            },
          ],
        },
      ],
      "no-restricted-syntax": [
        "error",
        {
          selector: "MemberExpression[property.name='sendBeacon']",
          message: MENSAJE_PRIVACIDAD,
        },
        {
          selector:
            "MemberExpression[property.name=/^(fetch|localStorage|sessionStorage|indexedDB|caches)$/]",
          message: MENSAJE_PRIVACIDAD,
        },
        {
          selector: "MemberExpression[object.name='navigator'][property.name='serviceWorker']",
          message: MENSAJE_PRIVACIDAD,
        },
      ],
      "no-console": "error",
    },
  },
  {
    // El banco de voz y el resolver de audio: red PROHIBIDA, storage permitido.
    files: ["src/lib/banco-voz/**/*.ts", "src/lib/audio/**/*.ts"],
    rules: {
      "no-restricted-globals": [
        "error",
        ...RED_PROHIBIDA.map((name) => ({ name, message: MENSAJE_BANCO })),
      ],
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@sentry/*", "pino", "@/lib/observability"],
              message: MENSAJE_BANCO,
            },
          ],
        },
      ],
      "no-restricted-syntax": [
        "error",
        {
          selector: "MemberExpression[property.name='sendBeacon']",
          message: MENSAJE_BANCO,
        },
        {
          selector: "MemberExpression[property.name='fetch']",
          message: MENSAJE_BANCO,
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Artefacto compilado del worklet (la fuente vive en src/worklets/).
    "public/worklets/**",
    // Reportes generados.
    "coverage/**",
    "playwright-report/**",
    "test-results/**",
  ]),
]);

export default eslintConfig;
