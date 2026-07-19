# Hablemos San (`app-habla`)

> _"Su voz mueve el mundo."_

App web (PWA) que ayuda a **estimular el habla de un niño de 4–6 años** mediante práctica diaria
en casa, **dirigida por el padre**. Complementaria — jamás sustituta — de la fonoaudiología real
del niño.

**Para el usuario final, el manual es [`docs/MANUAL-DE-USO.md`](docs/MANUAL-DE-USO.md).**
Este README es para quien toca el código.

## Las tres reglas que mandan sobre todo lo demás

1. **El audio del niño jamás se persiste ni sale del dispositivo.** Vive en el buffer de análisis y
   muere ahí: ni storage, ni red, ni logs, ni Sentry. La cámara no se usa. Esto no es una promesa
   de documentación — es un gate: hay una regla de ESLint que sella `src/lib/voice/` y
   `src/worklets/`, un test que escanea esas carpetas (y prohíbe el `eslint-disable`), y un e2e que
   verifica cero peticiones de red durante el juego.
2. **Determinista primero.** El núcleo es DSP local + lógica pura + contenido estructurado. **No
   hay IA en la app** (ni SDK instalado).
3. **Honestidad como mecánica.** La app solo afirma lo que su medidor midió de verdad (hubo voz,
   duró N segundos). El acierto de la palabra lo juzga el padre, nunca la app.

Detalle completo en [`CLAUDE.md`](CLAUDE.md) y en [`decisions/`](decisions/).

## Arranque

```bash
pnpm install          # instala y activa el hook de gitleaks (script `prepare`)
pnpm dev              # compila el AudioWorklet y levanta el server en :3000
```

El micrófono requiere contexto seguro: `localhost` sirve, y en la tablet se prueba con la preview
de Vercel (HTTPS).

## Comandos

| Comando                        | Qué hace                                                         |
| ------------------------------ | ---------------------------------------------------------------- |
| `pnpm dev` / `pnpm build`      | Compilan primero el worklet (`build:worklet`) y luego Next       |
| `pnpm build:worklet`           | `src/worklets/*.ts` → `public/worklets/` (artefacto, gitignored) |
| `pnpm test`                    | Vitest con cobertura (motores puros ≥80 %)                       |
| `pnpm test:e2e`                | Playwright: happy path con **micrófono falso**, cero-red y axe   |
| `pnpm typecheck` · `pnpm lint` | TS strict · ESLint (incluye la guardia de privacidad)            |

Regenerar fixtures (rara vez): `node scripts/gen-voz-sintetica.mjs` (el WAV que "habla" en los
e2e) y `node scripts/gen-iconos.mjs` (iconos de la PWA).

## Cómo está armado

```
src/lib/voice/     meter.ts (histéresis) · calibration.ts (piso de ruido)   ← motores PUROS
src/lib/coach/     daily.ts — la cápsula del día, determinista por fecha     ← motor PURO
src/lib/session-flow.ts   guion → mic → calibración → juego → celebración    ← reducer PURO
src/lib/storage/   localStorage validado con zod (jamás audio)
src/worklets/      rms-processor.ts — corre en el hilo de audio, sin imports
content/capsulas.ts  las 14 cápsulas (técnica + guion + actividad + fuente)
src/components/    UI sin lógica de negocio
```

Los motores no saben qué es un navegador: consumen `MeterFrame {rms, tMs}` y devuelven estado. Por
eso se testean con señales sintéticas (voz sostenida, silencio, ruido) sin abrir un micrófono.

## Detalles que muerden

- **El AudioWorklet se compila aparte** (`tsconfig.worklet.json` → `public/worklets/`) porque
  Turbopack no soporta el patrón `new URL(...)` para worklets. Si cambias `rms-processor.ts`,
  **sube el sufijo `?v=N`** en `src/lib/voice/mic-session.ts` (el archivo se cachea por URL).
  Ver [ADR 004](decisions/004-carga-audioworklet-next16-turbopack.md).
- **Nada de emojis como iconografía** (anti-patrón del pipeline): los iconos viven en
  `src/components/iconos.tsx`.
- **Los botones que abren el micrófono nacen `disabled`** hasta hidratar (`useHidratado`): un clic
  antes de la hidratación se pierde en silencio.
- **El estado local entra por `useSyncExternalStore`**, no por `useState` + `useEffect` (evita el
  mismatch de hidratación y el lint de React 19).
- **Repo público:** aquí no entra jamás nada personal del niño ni de la familia — solo código y
  contenido genérico. **Esto incluye el banco de voz familiar (S3): las grabaciones viven SOLO en
  el storage local del navegador — nunca al repo, nunca a la red.**
- **La auditoría Lighthouse de CI cubre SOLO páginas públicas** (kit v1.7.2): las privadas /
  `noindex` / hidratadas en cliente se EXCLUYEN documentadamente (Lighthouse las mide en un estado
  que ningún usuario ve) y su LCP real se valida en el gate ⭐ en dispositivo. `budgetsFile` NO
  permite umbral por-path. Hoy **todas las rutas de `lighthouse-urls.json` son públicas** (incluidas
  las nuevas `/estudio` y `/jugar/gemelas`), así que no se excluye ninguna; si alguna futura ruta
  fuese privada/hidratada, se saca de la lista con esta nota.

## Flujo de trabajo

Rama `sprint-NNN/<tema>`, PR con CI verde (quality + e2e + lighthouse), **nunca push directo a
`main`**. Cada sprint cierra con su bitácora y su summary en [`sprints/`](sprints/), y el manual de
uso al día.
