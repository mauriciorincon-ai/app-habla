# Sprint 005 — «Contacto visual» (documento primero, app después) · Bitácora de implementación

> Orden: `portafolio/habla/ordenes/SPRINT_005-orden.md` + enmienda 2026-09-06 (planeadora, RO) ·
> Plan aprobado por el usuario 2026-09-06 (plan mode) · «construye» dado con modelo Fable 5.1
> `[1m]`. Branch `sprint-005/contacto-visual` desde `main` (post-merge PR #12, `d3c3baa`).
> **Primer sprint de H2 — bifurcación → sprint inmediato** (método v1.26.0): lo planeado del
> backlog del S4 se corre un turno. Documento para la mamá; **cero pantallas para el niño;
> ninguna feature de la app**.

## Estado por fase

- [x] F0 — Estructura (branch · delta del kit `audita-sprint` · dominio en el schema · generador
      del catálogo · ruta propia · registro A/B/C · gate de sensibilidad por hashes con rojo en el
      mismo commit · guía · manual) — 300 unit · 183 e2e · build · PR #13
- [ ] **STOP F0 → prueba del registro en el teléfono real del usuario** (bloque P de la guía sobre
      la preview del PR) + decisión sobre las citas cuya revista describe a quién se estudió
- [ ] F2 — Contenido (cápsulas como progresión · catálogo real · gate en verde · `/audita-sprint`
      · **G-Contenido**)
- [ ] Cierre (`/deploy-check` · summary EN el PR · CI · merge a orden del usuario · homepage
      re-verificado tras el deploy)

## Los tres outcomes (del plan del sprint)

- **O1 — Investigación aprobada** (vive en la planeadora, privada): G-Investigación ✅ 2026-09-06.
- **O2 — Cápsulas de contacto visual como progresión** en dominio propio + catálogo generado
  servido en ruta propia + registro diario en el teléfono de la mamá (o descartado con razón),
  aprobado en G-Contenido.
- **O3 — Gate de sensibilidad por hashes**, verificable por comando, demostrado en rojo.

## Decisiones de diseño (declaradas en el plan aprobado)

1. **Dominio sin tocar `capsulas.ts`.** Añadir `dominio` al schema de habla cambiaría el tipo
   `Capsula` y `capsulas.ts` está tipado con `Omit<Capsula, "etiquetas">` → obligaría a tocar las
   50. El dominio nuevo tiene su schema propio con `dominio` literal como discriminante; el de
   habla se declara a nivel de biblioteca. Las 50 quedan byte a byte iguales.
2. **Catálogo hermano** (`gen-catalogo-contacto-visual.mjs`) con módulo común pequeño: el
   catálogo del S4 es el instrumento de revisión del padre; el de la mamá es OTRO documento.
3. **Ruta `/mirada`** (observable, corta; patrón de `/conoce`).
4. **Registro A/B/C** de la enmienda: sin puntaje del niño; solo `localStorage`; «Enviar a papá»
   con ejemplos, no números; «Guardar registro» JSON versionado; cuadrícula impresa de respaldo.
5. **Gate de sensibilidad acotado por diseño:** modo gate (falla) sobre contenido y docs del S5;
   modo informe (solo reporta archivo + línea + tamaño del n-grama, jamás el término) sobre el
   resto. `CLAUDE.md` excluido, como dice la lista.
6. **Regla 15:** el rojo del gate nace en el mismo commit que lo introduce.

## Bitácora

- 2026-09-06 · **F0 arranca.** Branch creado. Delta del kit adoptado: `.claude/commands/audita-sprint.md`
  (la orden lo exige como obligatorio y esta app no lo tenía — hallazgo de la exploración). La
  propuesta del sprint (`PROPUESTA-sprint-005-contacto-visual.md`, escrita el 2026-09-06 antes de
  la orden) entra al repo con este commit.
- 2026-09-06 · **F0.2 — Dominio en el schema.** `content/schema.ts` gana el dominio «contacto
  visual»: 6 técnicas (con nombre para la mamá, descripción de una frase y fuerza de evidencia a
  la vista), 6 niveles descritos por lo que ella ve, momentos del día, `conQuien`, y el schema de
  cápsula (cero pantalla por literal; fuente «autor, año, revista» por regex, sin título) + el de
  biblioteca (18–24 · 3–4 por técnica · niveles distintos por técnica · seis niveles cubiertos ·
  N5 con otra persona · ids únicos). `capsulas.ts` (las 50 de habla) **no se tocó** — decisión 1.
  `content/registro-contacto-visual.ts`: el contrato del archivo que descarga «Guardar
  registro» (versión 1; bloques A/B/C de la enmienda — sin puntaje del niño). Contenido de
  prueba: 3 cápsulas marcadas DE PRUEBA en `content/contacto-visual.ts` (se reemplazan en F2;
  `BIBLIOTECA_COMPLETA=false` lo declara). Tests: 11 del schema (cada constraint con su fixture
  inválido) + 4 del registro. **Rojo demostrado:** al quitar la constraint «niveles distintos
  dentro de la técnica», cae exactamente el test que la vigila (1 de 11); restaurada, 11 verdes.
- 2026-09-06 · **F0.3–F0.7 — Generador, ruta y registro.** `scripts/gen-catalogo-contacto-visual.mjs`
  (+ `scripts/lib/catalogo-comun.mjs` con lo compartido: escape, fecha, paleta del design system
  light/dark) genera `docs/CATALOGO-CONTACTO-VISUAL.html` del contenido real: portada con el
  encuadre («esto no es una prueba», dosis en momentos cortos, «descansar también cuenta»), el
  semáforo, cómo se usa, la escalera N1–N6, las seis maneras con su fuerza a la vista, «qué no
  hacer» (§6 en observable), las cápsulas peldaño a peldaño, el registro A/B/C por cápsula, el
  panel «Mis registros» (Enviar a papá · Guardar registro · borrar con segundo toque) y la
  cuadrícula semanal solo impresa. Modo `?revision` para el papá (preguntas de juicio + casilla
  «Revisada»), invisible para la mamá. `scripts/copiar-brochure.mjs` → `copiar-documentos.mjs`
  (brochure → `/conoce`, catálogo → `/mirada`); `build:brochure` → `build:documentos`;
  `/mirada` en `lighthouse-urls.json`. Un tropiezo: un `import` de valor sin extensión no
  resuelve bajo Node con tipos quitados — el contenido solo importa tipos (como `capsulas.ts`) y
  el generador decide si la biblioteca está completa. **e2e `mirada.spec.ts` (7 × móvil y
  escritorio = 14 verdes):** ruta 200 · falta algo → lo dice · registro sobrevive a recargar ·
  «Guardar registro» descarga un JSON que **valida contra el schema del repo** (el cable, no solo
  la pieza) · «Enviar a papá» arma ejemplos sin números (share stubeado) · borrar con segundo
  toque · `?revision` · axe limpio con el formulario abierto. **Capturas en Pixel 7 leídas como
  imagen** (9): portada, escalera, maneras, cápsula, formulario vacío y lleno, panel, impresión con
  cuadrícula, oscuro. Un falso positivo descartado: el cuerpo parecía sans en oscuro por residuo
  de la emulación de impresión; en contexto limpio la fuente es Georgia.
- 2026-09-06 · **F0.8 — Gate de sensibilidad por hashes (regla 15: rojo en el mismo commit).**
  `scripts/lib/sensibilidad.ts` (normalización compartida: minúsculas · sin acentos · todo lo no
  alfanumérico → espacio · n-gramas) · `scripts/gen-sensibilidad-hashes.mjs` (lee la lista de la
  planeadora en RO —ruta por env o la de la casa— y escribe `tests/fixtures/sensibilidad-hashes.json`:
  105 términos activos → 92 huellas SHA-256; los comentados «para REVISAR» no entran) ·
  `tests/unit/sensibilidad.test.ts` (modo gate: 24 pruebas — normalización + un test por archivo
  del alcance del sprint) · `scripts/sensibilidad-informe.mjs` (modo informe: el resto del repo,
  solo reporta). **Ni el test, ni el informe, ni esta bitácora escriben un término: archivo, línea
  y tamaño del n-grama, nada más.**
  **Desviación declarada:** la orden pedía n-gramas de 1 a 3; la lista aprobada trae un término de
  4 palabras, así que van de 1 a 4 (con 1–3 ese término no se cazaría).
  **El gate se ganó el sueldo antes de la demo:** su primera corrida cazó fugas reales en lo que yo
  mismo había escrito — (a) **los nombres de algunas revistas describen a quién se estudió** y la
  lista los marca (la orden asumió que solo los títulos lo hacían); (b) la propuesta del sprint
  nombraba métodos y una palabra de jerga; (c) un fixture del test usaba una de esas revistas.
  Decisión provisional, **para el usuario en el cierre de la fase 0:** cuando la revista describe
  a quién se estudió, la cita pública es «Autor, año» (el schema lo admite; la referencia completa
  vive en la investigación privada); en los demás casos «Autor, año, Revista». La propuesta se
  reescribió describiendo sin nombrar. **La historia de la rama se reconstruyó desde el árbol
  limpio** (tres commits, mismos mensajes) porque los commits ya hechos —no empujados— llevaban
  esas revistas: un repo público también publica su historia. Verificado con el propio gate sobre
  cada archivo de cada commit: lo único que queda son 2 comentarios previos al sprint en la parte
  de habla de `schema.ts` y 2 líneas del comando del kit copiado tal cual — fuera del alcance por
  diseño, reportados en el informe. Bug propio cazado por su test: `recortar` incluía el marcador
  de inicio. **Demo en rojo:** el término de prueba de la lista, puesto en una cápsula de prueba y
  regenerado el catálogo, tumba exactamente 2 pruebas (catálogo línea 341 y contenido línea 27,
  n-grama de 2); retirado de la cápsula —no de la lista— y regenerado: 24 verdes, árbol idéntico.
  **Informe del resto del repo:** 111 coincidencias en 31 archivos previos al sprint (skills del
  kit, cápsulas de habla, bitácoras, el diccionario de 10 000 palabras, componentes…) — se
  reportan aparte para decisión del usuario, sin tocarlas.
- 2026-09-06 · **F0.9–F0.10 — Guía y manual.** `docs/GUIA-DE-PRUEBA.html` v5 (acumulativa): cabecera
  «al cierre del Sprint 005», chip `Nuevo · S5` (el S4 pasa a heredado), **bloque P «El documento
  de la mirada, en tu teléfono»** — 7 pruebas ⭐ en el teléfono real (portada legible · registrar
  con validación y ≤6 toques · cerrar y volver · «Enviar a papá» con ejemplos · «Guardar registro»
  descarga · imprimir muestra la cuadrícula · `?revision`), historial del pie. Todas las pruebas
  del S4 se heredan enteras; eliminadas: ninguna. `docs/MANUAL-DE-USO.md`: sección «El documento
  de contacto visual — para trabajar sin pantallas», FAQ e historial 005. Las secciones nuevas de
  ambos van entre marcadores `s5:inicio`/`s5:fin` para que el gate de sensibilidad las vigile sin
  tocar el texto previo. El brochure y su export **no se tocan**: el documento no es una feature del
  producto (se declara, criterio de la orden).
- 2026-09-06 · **F0 CERRADA.** Verificación: `pnpm test` 300 (261 + 39 nuevos) · `pnpm test:e2e`
  **183** (169 + 14 de `/mirada`) · build · typecheck · lint · cero enlaces vacío · gate de
  sensibilidad verde (y la historia de la rama, verificada commit a commit con el mismo gate).
  PR #13 abierto con la fase 0. **Se detiene aquí** (contrato de fases): el ⭐ acotado es el
  registro en el teléfono real del usuario, sobre la preview del PR (bloque P de la guía), y
  queda una decisión suya: la cita pública cuando la revista describe a quién se estudió
  («Autor, año», provisional). Fase 2 solo tras su «continúa».
- 2026-09-06 · **CI roja por algo que no era del sprint — arreglada.** `pnpm audit` en el PR
  cazó una alta nueva en `browserslist` (≤4.28.6), transitiva por Sentry/Babel/webpack (7
  caminos), publicada después del último merge a `main`; el sprint no había tocado
  `package.json` ni el lockfile. `pnpm update browserslist -r` → 4.28.7 dentro del rango (solo
  cambia el lockfile). Verificado: audit limpio, 300 unit, build. Mismo patrón que la entrega del
  export (`nanoid`): las advisories llegan solas entre merges.
