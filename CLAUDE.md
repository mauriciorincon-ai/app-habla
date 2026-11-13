# Hablemos San (app-habla) — constitución de la app (núcleo, kit v2.4.0)

> Auto-cargado en cada sesión de este repo. Esta app pertenece al pipeline **AI-APPs**; su plan vive en la casa planeadora.
> Núcleo regenerado por la planeadora el 2026-11-11 (`/nueva-app habla` modo regenerar, método y kit v2.4.0) para el S7, que abre la
> construcción del H-2; sustituye a la constitución v1 de 243 líneas (estampada desde kit v1.4.0 el 2026-07-11), cuyo texto íntegro queda en
> `docs/REGLAS-ANEXO.md` § «Habla», junto a las reglas del kit en detalle; el anexo se lee solo cuando una regla se cita, nunca al abrir la sesión.
> Las reglas duras de producto de Habla están aquí, completas; lo demás de la v1 (tesis, stack y workflow v1, reglas de desarrollo v1) vive en
> ese anexo. Frase centinela de esta adopción: «su voz mueve el mundo, y no sale de aquí». Enmienda del 2026-11-12 (S9): la videoteca
> ya no figura como pendiente del H-2.

## Identidad y las dos casas (regla dura)

- **Planeadora** (`~/Code/hr01-develop-ai-apps/`, privada): brief, `VISION.md` v1.0.1 (21 funcionalidades: 17 del MVP + 4 del roadmap), la lista privada de términos sensibles, el archivo del sprint (`portafolio/habla/sprints/SPRINT_NNN.md`: inicio ejecutivo + plan + arranque), método y estándares. La **lees** (`additionalDirectories` o path absoluto); **nunca escribes ahí**.
- **Esta app** (`~/Code/app-habla`, pública): código, tests, ADRs, `sprints/SPRINT_NNN-cierre.md`. Escritor único: **tú**. El avance vive solo aquí; la planeadora te lee, tú no le reportas a mano. Si el plan necesita cambio, lo declaras en el cierre ejecutivo («desviaciones») y avisas al usuario.
- **Qué es:** **Hablemos San** — *«Su voz mueve el mundo.»* PWA que acompaña la práctica diaria del habla en casa, para niños de 4 a 6 años que están empezando a hablar, **dirigida por el adulto**. Complementaria, **jamás sustituta**, de las terapias integrales del lenguaje del niño. La tesis: **la app orquesta al adulto, no lo reemplaza**; la pantalla es utilería del juego compartido, nunca la niñera. Es la app más importante del portafolio: detrás hay un niño real. H-1 cerrado y sellado (S4); S5 y S6 sumaron `/mirada`, el documento «La pirámide, en casa» (56 fichas para jugar sin pantallas).
- **Stack:** Next.js 16 (App Router; `/conoce` y `/mirada` son reescrituras a HTML copiados por `scripts/copiar-documentos.mjs`) + React 19 + TypeScript strict + Tailwind v4 · **motor de voz:** Web Audio API + AudioWorklet (`src/worklets/`, RMS y tono por YIN, ADR-003, 004 y 007) · **sin backend, sin cuentas, sin base de datos** (ADR-002): todo en el cliente, persistencia local solo para progreso, ajustes, perfil inventado por la familia y el banco de voz del adulto (ADR-010) · Zod 4 · pictogramas ARASAAC con su crédito (ADR-008) · diccionario de ortografía embebido y cargado bajo demanda (ADR-014) · Vercel (preview por PR, producción desde `main`) · Sentry client-only, metadata-only e inerte sin DSN · Vitest 4 + Playwright (`mobile-chromium`, `desktop-chromium`, `desktop-chromium-tono`, micrófono falso con WAV sintéticos de `tests/fixtures`) + Testing Library + @axe-core/playwright · Node ≥ 22.18.
- **Perfil:** web (ni escritorio ni export estático): la línea siguiente es la declaración del perfil escritorio y aquí no aplica.
  captura_terceros: false
- **Estructura:** `src/app` (Hoy · `jugar/{globo,cohete,palabras,gemelas}` · `estudio` · `objetivo` · `rumbo` · `ajustes` · `spike/audio`) · `src/components` (UI sin lógica) · `src/lib` (`voice/` y `audio/` motores puros · `coach/` la cápsula del día · `banco-voz/` · `gemelas/` · `objetivo/` · `rumbo/` · `storage/` · `session-flow.ts` · `observability.ts`) · `src/worklets` · `content/` (`capsulas.ts` 50 · `fichas.ts` 56 · `contacto-visual.ts` · `pares-gemelos.ts` · `pictogramas.ts` · `schema.ts`) · `tests/{unit,e2e,fixtures}` · `design-system.md` · `.design-sync/` · `docs/{MANUAL-DE-USO.md, GUIA-DE-PRUEBA.html, BLUEPRINT.html, BROCHURE.html, LA-PIRAMIDE.html, CATALOGO-CAPSULAS.html, brochure-export.json, kit-de-prueba/}` · `decisions/001`–`016` · `sprints/` (summaries de la v1; desde el S7, `SPRINT_NNN-cierre.md`). No hay `docs/diseno/` (Habla nació antes de la Etapa de Diseño).

## Reglas duras de Habla (producto, no estilo — 8, completas)

Numeración de la v1 conservada (el código y los ADR citan «regla dura 2», «2-bis», «7»); la 8 sube del gate de sensibilidad (S5, ADR-015).

1. **Determinista primero.** El núcleo es buen código local (DSP en el navegador, lógica, contenido estructurado). La IA generativa es **acento con fallback determinista completo**, jamás la columna vertebral: en el runtime **jamás un API de pago por uso**; lo que necesite IA generativa (los cuentos por lotes) lo opera Claude Code fuera del runtime, por la bandeja de IA de la planeadora (`reusables/bandeja-ia/`), y **llega al niño solo tras la aprobación del adulto**, con biblioteca de respaldo. Ningún SDK de proveedor entra sin ADR «código primero».
2. **El audio y el video del niño JAMÁS se persisten ni salen del dispositivo.** El audio vive en el buffer de análisis en memoria y muere ahí: ni `localStorage`/IndexedDB/OPFS, ni red, ni logs, ni Sentry. **La app no abre la cámara.** Es la promesa más sagrada (un menor; Ley 1581). Lo blindan `tests/unit/privacidad-voice.test.ts` y el e2e de tráfico cero durante el juego. **2-bis:** lo que la familia graba o guarda de sí misma (el banco de voz del adulto, ADR-010) vive **solo** en el almacenamiento local, nunca en red ni en el repo (`tests/unit/privacidad-banco.test.ts`); se exporta solo por acción explícita (ADR-011).
3. **Honestidad como mecánica.** La app solo afirma lo que su DSP **de verdad midió** (hubo voz, duró N segundos, subió de tono); **el acierto de la palabra lo juzga el adulto** (ADR-009); prohibido el «¡muy bien!» que felicita diga lo que diga el niño. Todo reconocimiento automático futuro se muestra como «quizás», jamás como veredicto.
4. **No promete plazos ni hace de consultorio.** Posicionamiento: práctica complementaria. Prohibidos en el microcopy de los dos idiomas: plazos («resultados en X semanas»), puntajes de consultorio y nombres de condiciones; sin biometría, sin deepfakes, sin clonación de voz.
5. **Co-uso siempre.** No existe «modo niño solo»: cada actividad se diseña para adulto + niño y el guion del adulto precede al juego.
6. **Hecho para él.** Sin límite de tiempo, sin game-over, sin castigo por error; carga sensorial ajustable; **modo calma** de un toque; toque del niño ≥ 64 px (adulto ≥ 44 px); COGA W3C.
7. **Palabras sueltas PRIMERO (ADR-005).** Todo contenido nace calibrado a palabras de a una (asociación palabra ↔ objeto, intentos y gestos que cuentan); ningún juego exige palabras (miden voz, no vocabulario); «palabras sueltas» es el nivel por defecto permanente.
8. **Repo público, niño real: nada de la familia viaja.** Ni nombres, ni edades del niño o sus hermanos, ni voz, foto, video o condición, ni sus gustos con nombre propio, en ningún archivo, captura, commit o issue; los ejemplos usan perfiles inventados. El **gate de sensibilidad** (`scripts/gen-sensibilidad-hashes.mjs` lee la lista privada de la planeadora y solo viajan sus SHA-256; `tests/unit/sensibilidad.test.ts` con la guardia de edades) cubre el contenido, los documentos y **los dos idiomas**; un término nuevo se resuelve cambiando el copy, jamás escribiéndolo.

## Hito vigente: H-2 «Producto completo» (F0 2026-11-01; entra a la ola el 2026-11-11)

- **Desde el S7.** El H-1 está cerrado y sellado (S4); el gate humano de Habla hasta cerrar el H-2 es UNO: el **ensayo general** del dueño (no se ofrece un gate al cerrar sprints). El S7 empieza adoptando este núcleo y su anexo (≈ 1 h).
- **Sale cuando:** el inventario de la VISION v1.0.1 está al 100 % —las 17 del MVP (falta **cuentos hechos para él**; la videoteca llegó en el S8, ADR-018) y las 4 del roadmap («¿dijo la palabra?» automático, tarjetas y tableros imprimibles, juegos de tono avanzados, convenciones con Nutri-Kids), cada una **construida o descartada por el dueño con su nombre** (descartar jamás es default ni lo propone el builder; las que la VISION condiciona a un spike se construyen hasta el spike y su resultado lo decide el dueño)— · **bilingüe ES/EN completo** (Habla nació solo en español, ADR-001: el H-2 lo paga, ADR nuevo) · el despliegue de Vercel como entorno igual al de producción · arquitectura al día · **ensayo general del dueño**: todos los flujos como cliente, con la guía abierta; lo no visto no cuenta.
- **Ninguna feature del H-2 afloja una regla dura.** Las que la rozan (videoteca y cámara, cuentos e IA, reconocimiento y voz del niño) se le plantean al dueño como mirada de DECISIÓN, con su ADR, antes de construir; jamás se resuelven en silencio.

## Workflow del sprint (5 pasos)

1. **Plan.** El usuario trae el archivo del sprint de la planeadora (`portafolio/habla/sprints/SPRINT_NNN.md`: inicio ejecutivo + plan técnico breve + arranque). En **plan mode** corres `/plan-sprint`: estado real del código, riesgos, plan en ≤ 3 fases con criterio observable y horas por fase, recomendación de modelo. **La aprobación del plan NO arranca nada:** esperas el **«construye»** explícito. Branch `sprint-NNN/<tema>`.
2. **Construcción.** ≤ 3 fases; commits convencionales con `[F1]` / `[F2]` / `[F3]` en el subject (de ahí salen las horas por fase). **Un solo STOP al final de la construcción**, **más como máximo 1 mirada de DECISIÓN** si el sprint cambia una decisión del usuario, la promesa o su máquina (las paradas de contenido donde el usuario aprueba datos son producto y no cuentan). FORMA y TEXTO se maquetan «no vistas» (registro de una línea) y van al gate humano del hito.
3. **Auditoría de una pasada + checklist manual.** `/audita-sprint` (un auditor independiente en solo lectura, 4 casillas: alcance · calidad · seguridad y privacidad · frases caducadas); **todo hallazgo —crítico, alto, medio o bajo—, código y docs, se paga antes del STOP; lo imposible queda solo con la decisión del dueño escrita en el cierre** (exigencia del usuario 2026-11-08). Luego `/deploy-check`: ≤ 10 casillas — **la CI es el gate; si no está en la CI, no es casilla.**
4. **Cierre ejecutivo.** `sprints/SPRINT_NNN-cierre.md` ≤ 40 líneas con la salida de `node scripts/horas-sprint.mjs` pegada (campos abajo). Reemplaza al summary, al implementation-log y a la auditoría como archivos aparte.
5. **PR normal** (no en borrador) con el cierre dentro; checks requeridos de la ruleset `main-protegida` (`quality` · `e2e` · `lighthouse`, más `un-pr-vivo` desde que entra) con conclusión propia `success`, leídos **al final**. **Antes de abrirlo, `gh pr list --state open` (regla 18): un PR vivo por app.** Al pedir el merge entregas la lista de PRs abiertos, que debe ser ese uno. **El merge squash lo hace el usuario** y borra la rama; después corre `/cierre-sprint habla` en la planeadora.

- **Por hito, no por sprint:** gate humano único (sin tope de tiempo, sobre una guía que es UN recorrido sin pasos repetidos con matriz de cobertura y su test; FORMA y TEXTO pendientes; en el H-2, el ensayo general) · brochure · `design-sync` · `docs/BLUEPRINT.html` · pruebas y capturas en el segundo idioma · adopción del kit y de esta constitución (una vez al abrir el hito).
- **Matriz de hitos (método v2.3.0; 4 hitos, ninguno más; gate humano uno por hito, sin tope).**

  | Hito | Objetivo | Sale cuando (gate humano) |
  |---|---|---|
  | **H-1 Vitrina funcional** (= MVP) | diseño, experiencia y funciones esenciales, demostrables | flujo principal de punta a punta con datos sintéticos · manual · gate humano · ficha en CV Viva · arquitectura al día |
  | **H-2 Producto completo** (ensayo general; **no robusto**) | todo lo que el cliente verá y usará, de punta a punta como en producción | VISION 100 % construida o descartada con nombre · servicios reales sin mocks · bilingüe completo · **ensayo general del dueño** · arquitectura al día |
  | **H-3 Robustez** | calidad, mantenibilidad, datos y conectividad proporcionales | pruebas esenciales de lo que cambia · persistencia definitiva · cero hallazgos abiertos · arquitectura al día |
  | **H-4 Producción** (= G-Release) | seguridad, privacidad, despliegue, operación y legal | checklist de release · observabilidad mínima · legal · smoke en producción · arquitectura al día |

  Que la familia use la app en su vida real no es un hito. El sprint de cierre del hito trae la guía al día como recorrido, manual, BLUEPRINT, `design-sync` y auditoría de esta constitución.
- **Lo que ya no se necesita se cierra** (el usuario, 2026-11-02): todo servidor que abras (`dev`, `start`, el `webServer` de Playwright, Lighthouse) escucha en `127.0.0.1`, nunca en todas las interfaces; Habla usa el **3500** (3000 y 3100 son de otras apps, 3200 planlang, 3300 Velo, 3400/3401 Big-D). Lo que abres tú lo cierras antes de terminar la fase. Al STOP, `lsof -nP -iTCP -sTCP:LISTEN` no muestra procesos con cwd en este repo y el cierre lo dice en una línea. Un servidor de otra app no lo cierras: lo reportas.
- **Solo por cambio:** aprovisionamiento (solo si hay uno nuevo) · demo en rojo (solo gates propios nuevos) · roadmap de CV Viva (solo si el sprint toca una feature votada) · ADR (solo decisiones irreversibles).
- **Tamaño:** ≈ 4 h activas por defecto; hasta ≈ 12 h con una línea de justificación. Si el real supera el estimado en más del 50 %, el cierre explica la causa y propone una medida.
- **Modelo por DECISIÓN, nunca por descuido (regla dura del usuario, 2026-10-11).** Cada fase declara modelo requerido y esfuerzo **sugerido**; el tope ordinario es **Opus 5.5**; **Fable 5.1 solo en emergencia declarada por el usuario**, jamás por iniciativa del builder, de una skill ni de un subagente.

  | Actividad | Modelo requerido | Esfuerzo (sugerido) |
  |---|---|---|
  | Planear sprint, cerrar sprint, preguntas de la planeadora | Opus 5.5 | medium |
  | Checkpoint de hito, decisión irreversible, auditoría del proceso | Opus 5.5 | high |
  | Construcción con alcance claro (interfaz, lógica, pruebas, contenido redactado) | Sonnet 5.5 | medium |
  | Construcción simple: ajustes de interfaz, textos, cambios pequeños | Haiku 5.5 (en prueba, `claude-haiku-5-5`) | medium |
  | Depuración difícil, audio en tiempo real, seguridad y privacidad | Opus 5.5 | high |
  | Auditoría de una pasada | Sonnet 5.5 | high |
  | Cierre ejecutivo, script de horas, documentación corta | Haiku 5.5 | low |
  | Subagentes de búsqueda o lectura | `Explore` (Haiku 5.5) | medium |

  - **Gate de modelo al abrir cada fase:** tu primera línea es «Fase N · modelo requerido: X · esfuerzo sugerido: E (`/effort E` si tu encabezado muestra otro) · modelo activo: Y». Si coinciden, arrancas; **si no, NO construyes nada** hasta que el usuario escriba «vamos con Y» (queda en el archivo del sprint) o cambie con `/model X`. `/model`, `/effort`, `/compact` y `/advisor` los escribe el usuario, uno por mensaje: se los pides en una línea con el comando exacto. Entre fases se usa `/compact`, nunca `/clear`.
  - **Relevo, nunca loop (regla 29):** al segundo intento fallido sobre lo mismo, o a los 20 min sin avance verificable, paras, escribes qué intentaste y pides relevo en una línea: «Relevo: modelo actual X · recomiendo Y · por qué · `/model Y`» (Haiku → Sonnet → Opus; de Opus decide el usuario). Los subagentes declaran su modelo; ninguno hereda Opus o Fable por omisión.

## Reglas (29, una línea cada una)

`[sprint]` cuesta en cada sprint · `[hito]` al abrir o cerrar un hito · `[cambio]` solo si el sprint toca lo que cubre · `[siempre]` pasiva. 🔒 = privacidad o seguridad. Detalle: `docs/REGLAS-ANEXO.md § N`; lo propio de Habla, § «Habla».

1. `[siempre]` **TypeScript strict.** Sin `any` ni `@ts-ignore` sin justificación. — § 1
2. `[sprint]` **Tests de lo que cambia.** Motores puros > 80 % (`src/lib/**`; global 70 % en `vitest.config.ts`), ≥ 1 e2e por feature core que llega POR LA UI, con micrófono falso y WAV sintéticos; directorios generados a `globalIgnores`. — § 2
3. `[siempre]` **Motor separado de UI.** `lib/voice/`, `lib/coach/`, `session-flow` son puros y se prueban con señales sintéticas; la UI no habla Web Audio crudo. — § 3
4. `[siempre]` **Toda salida de LLM que se persista pasa por esquema Zod** (los cuentos por lotes, cuando lleguen); nunca texto libre directo al almacenamiento. — § 4
5. `[siempre]` **A11y desde el inicio:** contraste AA, aria-labels, sin límite de tiempo; `prefers-reduced-motion` cambia propiedades, jamás la forma del árbol; el color nunca solo (símbolo + texto + color). — § 5
6. `[siempre]` **Commits convencionales**; branch `sprint-NNN/<tema>`; jamás push directo a `main` (hook); ruleset `main-protegida`; un job de CI nuevo entra a la ruleset en el mismo sprint. — § 6
7. `[siempre]` 🔒 **Secrets solo en `.env.local` y Vercel env;** gitleaks a doble cinturón (hook + `githooks/pre-commit`); se prueba con la carnada canónica del anexo § 7, nunca improvisada. — § 7
8. `[sprint]` **Presupuesto medido:** ≈ 4 h, ≤ 12 h con justificación; horas con `scripts/horas-sprint.mjs`; ~12 pasos por pantalla. — § 8
9. `[sprint]` **Manual de uso vivo** (`docs/MANUAL-DE-USO.md`, en los dos idiomas): toda feature que llega a `main` tiene su sección en el mismo sprint, para el adulto, en llano. — § 9
10. `[hito]` **El diseño va antes del código:** sin `docs/diseno/`, la fuente de verdad visual es `design-system.md` (paleta sage/cream, dos registros: el del adulto y el del niño), que se extiende por ADR; solo **DECISIÓN** abre parada (máx. 1 por sprint); FORMA y TEXTO al gate del hito. — § 10
11. `[cambio]` **Guía de prueba viva** (`docs/GUIA-DE-PRUEBA.html`, autocontenida, origen por línea): se toca solo si el sprint cambia un flujo visible; al cierre del hito es UN recorrido por el flujo de una familia, sin pasos repetidos, con la matriz `cubre: [ids]` de todas las funcionalidades y su test (`guia-cobertura.test`), y se recorre entera en el ensayo, sin tope. — § 11
12. `[siempre]` **Prohibido entregar por artifacts o plataformas externas:** todo entregable es un archivo del repo y se entrega su ruta. — § 12
13. `[hito]` **Brochure** (`docs/BROCHURE.html` en `/conoce` + `docs/brochure-export.json`, contrato `brochure-export` v1.0.0; `tests/unit/brochure-export.test.ts` lo guarda): se ajusta al cierre de cada hito. — § 13
14. `[siempre]` **Código primero, IA generativa después:** feature LLM ⇒ ADR «código primero»; la IA es acento con fallback determinista (regla dura 1). — § 14
15. `[cambio]` **Un gate se demuestra fallando** (`scripts/demo-rojo.sh`, solo gates propios nuevos); `skipped` no es verde. — § 15
16. `[hito]` **El bundle de `design-sync`** (`.design-sync/`) es un artefacto del repo y se actualiza al cierre del hito. — § 16
17-bis. `[siempre]` **Lo que la app escribe también es superficie:** un derivado jamás nace menos privado que su fuente (el export del banco de voz, ADR-011). — § 17-bis
17. `[siempre]` 🔒 **Cero enlaces:** ningún archivo versionado ni campo de GitHub publica la URL de producción o de previews (CTA = «lista de espera»; homepage vacío; la integración de Vercel lo re-llena tras un deploy: se re-limpia tras cada merge); el barrido es un paso del job `quality` (`scripts/cero-enlaces.mjs`, hosts en `cero-enlaces.json`). El enlace que tiene la familia vive solo en la planeadora. — § 17
18. `[siempre]` **UN SOLO PR VIVO POR APP (regla dura 2026-10-11).** Dependabot cuenta; `gh pr list --state open` antes de abrir; un segundo PR solo si su cuerpo EMPIEZA con «complementa #N: <por qué>»; job `un-pr-vivo`; dependencias agrupadas al arrancar y antes del PR (`scripts/verificar-dependencias.mjs`). — § 18
19. `[cambio]` **Todo puente entre dos lenguajes exige su gate de contrato;** el AudioWorklet ↔ la página cruza mensajes tipados (`tsconfig.worklet.json`). — § 19
20. `[siempre]` **Bilingüe ES/EN en todo:** el dato nace como mapa `{ es, en }`, redactado (no traducido), con test de paridad de claves; en inglés **se practica en inglés** (palabras, pares y pictogramas propios del idioma); e2e y capturas en UN idioma por sprint, el otro al cierre del hito. Conversación y cierres en español; código, commits y ADRs nuevos en inglés. — § 20
21. `[cambio]` **IA de construcción por suscripción (7-S):** solo el binario oficial de Claude Code, token jamás en env, trazas ni repo; la suscripción jamás procesa peticiones de terceros. — § 21
22. `[cambio]` **Todo control dibujado tiene su script cargado;** la pasada de capturas activa cada control tocado. — § 22
23. `[cambio]` **Matriz de envejecimiento:** la cápsula del día y las semanas del rumbo dependen de la fecha: la fecha es perilla de prueba, nunca el reloj. — § 23
24. `[cambio]` 🔒 **Las protecciones del sistema del usuario se enseñan antes de tocarlas:** matriz por acción y un «sí» por acción (permisos de micrófono reales incluidos). — § 24
25. `[siempre]` **El comando de pruebas por defecto no toca hardware ni permisos:** micrófono falso siempre; el real, solo en el ensayo. — § 25
26. `[siempre]` **Worktrees prohibidos:** todo ocurre en `~/Code/app-habla`; nada de `git worktree` ni `git stash` a secas; se agrega por ruta, jamás `git add -A`. — § 26
27. `[siempre]` **La evidencia se escribe después del hecho** («N de N», «en verde», «leído como imagen») con la cuenta tomada del resultado. — § 27
28. `[cambio]` **Parejas de versiones entre dos ecosistemas:** no aplica hoy. — § 28
29. `[siempre]` **Relevo, nunca loop** (arriba, en «Modelo por DECISIÓN»). — § 29

## Cierre ejecutivo (`sprints/SPRINT_NNN-cierre.md`, ≤ 40 líneas)

Frontmatter `sprint · app · hito · opened · closed · branch · pr`, y los campos, una línea o tabla corta cada uno: nombre · objetivo · resultado · estado ·
tiempo estimado · tiempo real (salida de `scripts/horas-sprint.mjs`) · diferencia · fases y horas por fase · entregables · no completado · desviaciones y causas ·
decisiones · deuda (solo lo imposible, con `archivo:línea` y la decisión del dueño escrita) · aprendizajes · recomendación · esfuerzo-beneficio ·
**auditoría** (4 casillas; cada hallazgo con `pagado · <commit>`) · si una fase se pasó > 50 %: causa y medida · **modelo por fase y desvío** · **relevos** ·
servidores al STOP («`lsof` LISTEN en este repo: 0») · gate de sensibilidad («0 coincidencias en lo que vigila») · «Para mergear: squash y borrar la rama; después `/cierre-sprint habla`».

## Comandos

`/plan-sprint` · `/audita-sprint` · `/deploy-check` · `/design-sync` (hito; lo invoca el usuario) · `/self-review`, `/run-tests`, `/security-audit` (opcionales). Del kit v2.4.0 (desde el S7):
`scripts/horas-sprint.mjs` · `scripts/cero-enlaces.mjs` + `cero-enlaces.json` · `scripts/demo-rojo.sh` · `scripts/verificar-dependencias.mjs` · `.github/workflows/un-pr-vivo.yml`.
Propios: `node scripts/gen-sensibilidad-hashes.mjs` (al cambiar la lista privada) · `node scripts/sensibilidad-informe.mjs` · `pnpm gen:piramide` · `scripts/gen-{diccionario,catalogo-capsulas,voz-sintetica,barrido-tono}.mjs` · `pnpm build:documentos`.

## Estándares (los 6+1, gates en CI)

Testing · CI/CD · Observabilidad (metadata-only: jamás audio ni contenido, solo `kind` + conteos) · Seguridad · Performance (`perf-budget.json`, Lighthouse una corrida) · UX+A11y ·
**IA embebida responsable** (aplica cuando lleguen los cuentos por lotes). Detalle: `estandares/estandares.md` de la planeadora. Ítem rojo ⇒ deuda explícita en el cierre o el sprint no cierra.

## Patrones de dominio de esta app

- **Voice-meter con histéresis** sobre un umbral relativo al piso de ruido calibrado (2 s de silencio por sesión, recalibrable en un toque); voz sostenida avanza, silencio detiene sin parpadeo, ruido estable no mueve.
- **Cápsula diaria determinista** (`coach/daily.ts`): por fecha, sin repetir hasta agotar, cada cápsula con su técnica y su fuente; el objetivo de la semana la alinea dentro de la etapa, jamás fuerza otra.
- **Celebración honesta:** reporta la métrica real; los juegos que miden sonido no lo emiten (el eco vuelve por el micrófono).
- **Audio efímero por construcción:** `lib/voice/` no importa ninguna API de persistencia ni de red, y un test lo verifica.

# Compact instructions

Al compactar conserva: el archivo del sprint (`SPRINT_NNN.md`) como manifiesto, la fase en curso y su modelo, las rutas tocadas con su último commit,
las decisiones del dueño y los defaults que rigen, los gates en rojo con su causa (sensibilidad incluida, sin escribir el término) y lo que falta para el STOP.
Descarta salidas de herramientas, contenidos de archivos ya leídos y diffs: se releen si hacen falta.

Constitución núcleo kit v2.4.0 — Habla, regenerada 2026-11-11 para el S7 (H-2). Las reglas del kit en detalle y el texto íntegro de la v1 viven en docs/REGLAS-ANEXO.md.
