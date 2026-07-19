# Hablemos San (app-habla) — constitución de la app (Claude Code)

> Auto-cargado en cada sesión de este repo. Esta app pertenece al pipeline **AI-APPs**; su plan
> vive en la casa planeadora. Estampada desde kit-app v1.4.0 el 2026-07-11 (Sprint 001).
> **Es la app más importante del portafolio: de ella depende el desarrollo del habla de un niño real.**

## Las dos casas (regla dura)

| Casa           | Path                           | Escritor único   | Qué vive ahí                                                                     |
| -------------- | ------------------------------ | ---------------- | -------------------------------------------------------------------------------- |
| **Planeadora** | `~/Code/hr01-develop-ai-apps/` | su propia sesión | brief, VISION, sprints (plan+retro), órdenes de construcción, método, estándares |
| **Esta app**   | este repo                      | **tú**           | código, tests, ADRs de implementación, bitácora y summary del sprint             |

- ✅ Puedes **leer** la planeadora (agregada como `additionalDirectories`, o por path absoluto).
- ❌ **Nunca escribes** en la planeadora. Si el plan necesita cambio, lo anotas en tu
  `sprints/SPRINT_NNN-implementation-log.md` bajo `## Desviación del plan` y avisas al usuario.
- El avance de implementación vive **solo aquí** — la planeadora te lee, tú no le reportas a mano.

## Qué es esta app

**Hablemos San** — _"Su voz mueve el mundo."_ App web (PWA) que ayuda a **estimular el habla de un
niño de 4–6 años** (hispanohablante, perfil de neurodivergencia) mediante **práctica diaria
estructurada en casa, dirigida por el padre**. Complementaria — **jamás sustituta** — de la
fonoaudiología real del niño. Contrato de alcance: `portafolio/habla/VISION.md` (planeadora,
aprobada 2026-07-11). Sprint 001: "Hoy hablamos" (la respuesta diaria + el primer juego de voz).

**La tesis del producto:** la app **orquesta al padre, no lo reemplaza** — la evidencia dice que
el motor del desarrollo del habla es la interacción adulto-niño (parent-implemented g=0.42). La
pantalla es utilería del juego compartido, nunca la niñera.

## ⚠️ Reglas duras de esta app (producto, no estilo)

1. **Determinista primero.** El núcleo es **buen código local** (DSP en el navegador, lógica,
   contenido estructurado). La IA generativa es **acento opcional con fallback determinista
   completo** — jamás la columna vertebral. Runtime IA **≤ US$10/mes** (techo INAMOVIBLE, decisión
   de producto: la app no debe depender de la IA). **En el Sprint 1 no hay NADA de LLM.**
2. **El audio y el video del niño JAMÁS se persisten ni salen del dispositivo.** El audio vive solo
   en el buffer de análisis en memoria y muere ahí — ni storage (localStorage/IndexedDB/OPFS), ni
   red, ni logs, ni Sentry. **La cámara NO se usa** en absoluto. Esta es la promesa más sagrada de
   la app (menor + Ley 1581); se blinda con test unit + e2e de tráfico + revisión.
3. **Honestidad como mecánica, no como promesa.** La app solo afirma lo que su DSP **de verdad
   midió** (hubo voz, duró N segundos, subió de tono); el **acierto de la palabra lo juzga el
   padre** (co-uso), nunca un elogio automático vacío. Prohibido el "¡muy bien!" que felicita diga
   lo que diga el niño (es el error de la competencia). Cualquier reconocimiento de voz futuro se
   muestra como "quizás", jamás como veredicto.
4. **No es terapia; no promete plazos.** Posicionamiento: _práctica/estimulación complementaria_.
   Prohibido en el microcopy: "terapia", "diagnóstico", "resultados en X semanas", puntajes
   clínicos. Sin biometría, sin deepfakes, sin clonación de voz.
5. **Co-uso siempre.** No existe "modo niño solo" en el MVP. Cada actividad se diseña para
   adulto+niño; el guion del padre precede al juego.
6. **Diseño para 4–6 años neurodivergentes.** Sin límite de tiempo, sin game-over, sin castigo por
   error; carga sensorial ajustable; **modo calma** de un toque; touch del niño ≥64 px. COGA W3C.
7. **Palabras sueltas PRIMERO (ADR 005, ratificada por el usuario 2026-07-12).** El niño real
   dice palabras de a una: TODO contenido y feature nace calibrado a esa etapa — asociación
   palabra↔objeto, palabras sueltas, intentos y gestos que cuentan. Ningún juego exige palabras
   (miden voz, no vocabulario). Un nivel "frases" futuro será opt-in en ajustes, jamás el
   default: **"palabras sueltas" es el nivel por defecto permanente de esta app.**

## Stack

- **Frontend:** Next.js (kit v1.4.0) + TypeScript strict + Tailwind. **PWA instalable**
  (tablet/teléfono), mobile-first con **tablet Android como target primario**.
- **Motor de voz:** **Web Audio API + AudioWorklet** (RMS/energía, duración sostenida, pitch por
  YIN cuando aplique) en el hilo de audio; el juego consume el meter a 60 fps. Fallback
  `AnalyserNode`+rAF documentado por ADR (spike primero en la tablet real).
- **Backend/BD/Auth:** **NINGUNO.** Todo client-side; sin server routes, sin cuentas, sin Supabase.
  Persistencia **local-first** (localStorage/IndexedDB) SOLO para: progreso de cápsulas, ajustes,
  apodo/temas del onboarding. **Nunca audio del niño.**
- **IA embebida:** **NINGUNA en el Sprint 1.** Desde el sprint del "cuentero" (posterior): adapter
  multi-proveedor **conmutable por env** (skill `ia-embebida`), **solo por LOTES** (generación de
  contenido offline, verificada + revisión parental antes de llegar al niño), ≤US$10/mes, con
  fallback a biblioteca de plantillas. **NO instalar SDK de ningún proveedor antes de su ADR.**
- **Idioma:** **SOLO español (es-CO)** — desviación consciente del default bilingüe del método
  (app personal para un niño hispanohablante; ratificada en G-Plan, registrar ADR). **No montar
  i18n bilingüe**; microcopy es-CO directo, cálido, sin jerga ni culpa.
- **Tests:** Vitest (unit) + Playwright (e2e con **micrófono falso**:
  `--use-fake-device-for-media-stream` + `--use-file-for-fake-audio-capture` con WAV sintético) +
  Testing Library + @axe-core/playwright.
- **Deploy:** Vercel (preview por PR, prod desde `main`). **Observabilidad:** Sentry client-only
  metadata-only INERTE sin DSN — **jamás** audio ni contenido, solo `kind` + conteos.

## Estructura

```
src/
├─ app/            (App Router: pantalla "Hoy" + juego + ajustes; manifest PWA)
├─ components/     (UI sin lógica: HoyScreen · VoiceGame · GuionCard · CalibracionStep · CelebracionHonesta · AjustesSesion)
├─ lib/
│  ├─ voice/       (meter.ts: RMS/histéresis/duración · calibration.ts: piso de ruido — motores PUROS, unit-tested)
│  ├─ coach/       (daily.ts: cápsula determinista por fecha + completadas)
│  └─ session-flow.ts (orquestación guion→calibración→juego→celebración)
├─ worklets/       (rms-processor.ts — AudioWorkletProcessor: RMS por frame → postMessage throttled)
content/           (capsulas.ts — ≥14 cápsulas es-CO: técnica citada + guion + actividad + fuente)
tests/{unit,e2e}/  (unit con señales sintéticas · e2e fake-mic + e2e cero-red · fixtures WAV)
design-system.md   (fuente de verdad visual — se crea en el S1; referencia: tokens del prototipo legado)
docs/MANUAL-DE-USO.md
sprints/SPRINT_NNN-implementation-log.md · SPRINT_NNN-summary.md
decisions/NNN-titulo.md   (ADRs de implementación)
```

## Reglas de desarrollo

1. **TypeScript strict.** Sin `any` ni `@ts-ignore` sin justificación en comentario.
2. **Motor separado de UI.** `lib/voice/`, `lib/coach/`, `session-flow` son **puros y
   unit-testeados con señales sintéticas** (voz sostenida, silencio, ruido estable); los
   componentes no llevan lógica de negocio. El AudioWorklet expone un meter tipado; la UI no habla
   Web Audio crudo.
3. **Tests con cada feature.** Motores puros con cobertura alta (el umbral/histéresis, la
   calibración y el selector diario tienen unit que FALLA si se rompe la garantía); ≥1 e2e por
   feature core; **e2e de tráfico que verifica cero red durante el juego** (la promesa de privacidad).
4. **A11y desde el inicio:** touch del niño ≥64 px (adulto ≥44 px), sin límite de tiempo, sin
   game-over, `prefers-reduced-motion` + modo calma, axe limpio. Nada comunica solo con color.
5. **Commits convencionales**; branch `sprint-NNN/<tema>`; **jamás push directo a `main`** (hook lo
   bloquea); PR con CI verde + preview probada **en la tablet real**.
6. **Secrets solo en `.env.local` (gitignored) y Vercel env vars.** Doble protección gitleaks (hook
   PreToolUse + `githooks/pre-commit` **100755 y activo** — kit v1.3.1). **Carnada canónica
   verificada (kit v1.6.3):** el secreto de prueba para comprobar que el gate está vivo es
   `AWS_ACCESS_KEY_ID` seguido de `AKIA` + `Q7RTZ4PXKM2WNB3S` (dispara la regla `aws-access-token`;
   verificado contra gitleaks 8.30.1 el 2026-07-18). **No improvises la carnada:** las reglas
   modernas exigen alfabeto base32 real tras `AKIA` y entropía, y una carnada floja pasa en silencio
   dando falsa tranquilidad. Si gitleaks sube de versión mayor, re-verificar en sandbox. En esta app
   el gate de privacidad es **triple** (S3): secrets · **el audio del niño** (regla dura 2 — nunca a
   storage, red o logs) · **el banco de voz familiar** (regla dura 2-bis — vive SOLO en storage
   local, nunca a red ni al repo).
7. **Presupuesto de esfuerzo:** ~12 pasos por pantalla; si lo excedes, detente y simplifica.
8. **Manual de uso vivo (`docs/MANUAL-DE-USO.md`, obligatorio).** Español llano, para el padre:
   cómo usar "Hoy", cómo dirigir el juego (su rol), qué mide y qué NO mide la app, la privacidad
   (qué jamás sale del dispositivo), el modo calma. Toda feature que llega a `main` se documenta
   en el mismo sprint.
9. **Diseño con gate (`design-system.md` + skill `diseno-ui`).** El **Sprint 1 CREA** el
   `design-system.md` tomando como **referencia VISUAL** los tokens del prototipo legado
   `referencias-ui/habla/Habla Santy/design-system.md` (paleta dual operador/niño "Clínica cálida"
   sage/cream) — pero **sus 9 pantallas funcionales están ANULADAS** (concepto viejo): no heredes
   flujos ni features de ahí. Cada sprint con UI cierra con checklist `diseno-ui` + aprobación
   visual del usuario sobre la preview (idealmente con el niño observando). **Claude Design es BAJO
   DEMANDA durante el ciclo** (el default validado es `design-system.md` + aprobación sobre la
   preview); **PERO al CERRAR el ciclo (método v1.8.0) el design system consolidado SE PUBLICA en
   Claude Design (`/design-sync`)** como activo estable — actividad de cierre junto al blueprint (en
   habla: S4).
10. **Guía de prueba viva y ACUMULATIVA (`docs/GUIA-DE-PRUEBA.html`, obligatoria — regla del
    usuario 2026-07-12, ampliada por él el 2026-07-12).** HTML visual y AUTOCONTENIDO (cero CDNs,
    checkboxes con localStorage): qué probar, cómo y qué esperar como resultado correcto, por
    bloques. **Regla de la bola de nieve:** la última versión contiene **TODAS las pruebas vigentes
    de la app**, no solo las del sprint nuevo — el sprint N no resume ni comprime las pruebas del
    N-1, las **hereda enteras**. Cada prueba lleva su **origen visible** en la línea: `Nuevo · SN`
    (nació en este sprint) · `Mejorado en SN` (venía de antes y este sprint la cambió) · `SN`
    (heredada sin cambios ⇒ es regresión). El filtro por origen y el historial del pie son parte
    del entregable. Una prueba **solo se elimina** cuando la feature que probaba dejó de existir, y
    se declara en el historial. **Tres preguntas por prueba:** qué probar, cómo probarlo y **qué
    esperar** — el resultado correcto explícito (con el microcopy LITERAL de la app, no una
    paráfrasis) y la señal de defecto ("Mal") cuando exista una forma clara de fallar. **Gate
    mínimo (⭐):** la guía marca el camino crítico — lo que ninguna automatización puede verificar
    (voz y micrófono reales, juicio del usuario sobre el contenido, aprobación visual) — para
    cuando el tiempo no alcanza; el resto queda respaldado por la CI. Sirve para el gate del
    usuario y como entregable a usuarios finales.
11. **PROHIBIDO entregar por artifacts de Claude o cualquier plataforma externa** (regla del
    usuario, re-ratificada 2026-07-12). Todo entregable —guías, reportes, documentos visuales—
    es un ARCHIVO DEL REPO (HTML autocontenido o Markdown) que el usuario pueda abrir, versionar
    y llevarse. Sin excepciones, ni "para verlo rápido".

## Estándares (los 6+1, gates en CI)

Testing · CI/CD · Observabilidad · Seguridad · Performance (contra `perf-budget.json`) · UX+A11y ·
**IA embebida responsable** (aplica solo cuando llegue el cuentero por lotes; **N/A en S1**).
Detalle canónico: `estandares/estandares.md` de la planeadora (read-only). Ítem rojo ⇒ deuda
técnica explícita en el summary o el sprint no cierra.

## Workflow de un sprint

**Apertura** — el usuario trae la **orden de construcción**
(`portafolio/habla/ordenes/SPRINT_NNN-orden.md` de la planeadora). Léela entera + sus referencias
(SPRINT_NNN.md, VISION.md, brief v2, investigación científica — §A.3 técnicas, §B.1 DSP, §C HCI,
§D anti-claims). **Plan mode primero, siempre.** **La aprobación del plan NO arranca la
construcción** (gate de arranque, kit v1.6.2): tras aprobarse el plan, emite el **bloque de
arranque** — tu recomendación de **modelo y esfuerzo** para el sprint (por fase si difiere; tú
recomiendas, el usuario los fija con `/model`) + espacio para sus ajustes — y **espera su
«construye» explícito antes de tocar cualquier archivo**. Si responde con ajustes, incorpóralos y
vuelve a esperar. Branch `sprint-NNN/<tema>`.

**Durante** — construye por fases (setup → spike de audio en la tablet real → motores puros → UI →
e2e). Mantén viva la bitácora `sprints/SPRINT_NNN-implementation-log.md`. ADRs en `decisions/` para
decisiones no anticipadas. ⭐ Sprint 1: eres el **primer estampado del kit v1.4.0** — verifica
temprano que los hooks están **ejecutables y activos** (K12) y registra toda fricción del kit en la
bitácora, SEPARADA del trabajo del producto.

**Cierre — summary OBLIGATORIO.** Con la DoD completa: `/deploy-check` → genera
`sprints/SPRINT_NNN-summary.md` (misma plantilla que las otras apps del pipeline) → PR → merge con
CI verde. **Sin summary el sprint NO está cerrado** (es lo que la planeadora lee para la retro).

**Cierre de CICLO (método v1.8.0 — cuando este sprint es el ÚLTIMO de un ciclo H1/fase/MVP; la
orden lo declara):** además de la DoD, el sprint entrega (1) **`docs/BLUEPRINT.html`** — as-built
de TODA la infraestructura que soporta la app (HTML autocontenido con diagrama SVG embebido —
jamás mermaid ni CDNs — + tabla por pieza + costo real + punto único de falla), vivo y acumulativo
entre ciclos; y (2) el **design system publicado en Claude Design** (`/design-sync`). Todo ciclo
tiene MÍNIMO 3 sprints (regla dura). **En habla esto llega en el S4** (cierre del ciclo H1); el S3
deja el bloque listo pero NO produce blueprint ni design-sync.

## Patrones de dominio de esta app

- **Voice-meter con histéresis:** el personaje avanza mientras la energía supera un umbral
  **relativo al piso de ruido calibrado**; dos umbrales (entrada/salida) evitan el parpadeo cuando
  la voz fluctúa cerca del límite. Unit test con señal sintética: voz sostenida avanza, silencio
  detiene sin parpadeo, ruido estable NO mueve.
- **Calibración por sesión:** 2 s de silencio miden el piso de ruido de la casa real; el umbral es
  relativo. Recalibrable en 1 toque; si el ruido es alto, la UI lo dice honesto.
- **Cápsula diaria determinista:** `coach/daily.ts` selecciona la cápsula del día por fecha sobre
  la biblioteca (`content/capsulas.ts`), determinista y sin repetir hasta agotar; cada cápsula cita
  su técnica base (§A.3 de la investigación) — nunca contenido genérico sin respaldo.
- **Celebración honesta:** reporta la métrica real ("¡la sostuviste 3 segundos!"); jamás un elogio
  desacoplado del desempeño medido.
- **Audio efímero por construcción:** el módulo de voz no importa ninguna API de persistencia; un
  test/lint verifica que `lib/voice/` no toca storage ni red.

## Idioma

Español en conversación, bitácoras Y en la interfaz de la app (es-CO — esta app NO es bilingüe, por
ADR). Inglés solo en código, commits, nombres de símbolos y ADRs.
