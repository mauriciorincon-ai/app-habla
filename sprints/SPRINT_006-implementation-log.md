# Sprint 006 — «La pirámide» · Bitácora de implementación

> App: habla · Branch: `sprint-006/la-piramide` · Orden: `portafolio/habla/ordenes/SPRINT_006-orden.md`
> (planeadora, RO) + enmienda del 2026-09-27 (G-Investigación APROBADA, fase 2 habilitada).
> Regla de la casa: aquí solo hay comportamiento observable; ningún término de la lista de
> sensibilidad, ningún nombre, ninguna edad, ningún lugar. El gate lo vigila también en esta bitácora.

## Estado por fase

- [x] F0 — Estructura: delta del kit v1.31.0 · registro retirado entero · schema de la ficha ·
      generador y `/mirada` · gate ampliado con su rojo en el mismo commit · B4 · guía (bloque P
      fuera, bloque Q) · manual · ADR 016
- [x] F2 — Contenido: el mapa de las 74 ejecutado · 56 fichas · capturas y medida de desborde
- [x] `/audita-sprint` (auditor independiente · todo pagado · casilla 4 dos veces)
- [x] STOP → G-Contenido del usuario: APROBADO
- [x] Cierre: `/deploy-check` (MERGE OK) · summary EN el PR · CI por check
- [ ] Merge (squash) a su orden · borrar la rama · homepage

## Decisiones de diseño (declaradas en el plan aprobado)

1. **Biblioteca propia, `content/fichas.ts`, con `FichaSchema`** al final de `content/schema.ts`.
   Las 24 del S5 (`content/contacto-visual.ts`) y las 50 de la app (`content/capsulas.ts`) no se
   tocan: son las fuentes, y `origen` (`mirada:` · `habla:` · `anexo:`) las deja trazables.
2. **Prioridad por agregado:** el mapa aprobado pone 7 fichas en atención conjunta y 10 en
   comprender (señalar vive junto a atención conjunta). La regla «cada prioritario ≥ cada no
   prioritario» contradecía el mapa; queda **«los tres prioritarios, juntos, llevan más fichas que
   los otros tres juntos»** (la lista ejecutada: 32 contra 24).
3. **Orden del documento:** la pirámide de la portada va en el orden de la imagen de la mamá (de
   la base a la punta); las secciones de fichas van **primero las tres de prioridad ahora**.
4. **Generador nuevo** `scripts/gen-la-piramide.mjs` → `docs/LA-PIRAMIDE.html`, servido en
   `/mirada`; el del S5 y su documento se eliminan. Título de trabajo «La pirámide, en casa»
   (texto al G-Contenido).
5. **Gate:** `N_MAX` 4 → 5 (la lista ampliada trae tres términos de cinco palabras).
6. **Progresión de imitación con seis pasos** (I1–I6), como la trae el anexo: la enmienda los
   resume en cinco («con ayuda → cuando le muestran → espontánea → ida y vuelta → otra persona»);
   el anexo agrega el primero, «se da cuenta de que lo copias», que el niño ya tiene con el cuerpo.

## Desviación del plan

- **Fase 0 y fase 2 en una sola corrida**, sin parada entre ellas: la fase 0 no había arrancado en
  este repo y la investigación ya estaba aprobada (lo mismo que en el S5). El único STOP es el
  G-Contenido.
- **`playwright.config.ts` acepta `E2E_PORT`** (por defecto 3000, la CI no cambia): en local, otra
  app del portafolio tenía un servidor en el 3000 y los e2e le preguntaban a ella (404).
- **56 fichas, no 55.** El resumen del mapa dice «~56» y reparte «intención comunicativa 9 ·
  comprender 10» (suma 55); su propia lista, ficha por ficha, da **intención comunicativa 10**. Se
  ejecutó la lista, no el resumen. Los tres prioritarios suman 32 contra 24.
- **Dos cápsulas van a su segundo grupo del mapa** para que los conteos del mapa se cumplan:
  «Cucú: cuando se tapa él» (juego · atención conjunta) va a **atención conjunta**, y «Su canción,
  con un hueco antes de lo mejor» (intención comunicativa · comprender) va a **comprender**. El
  contenido no cambia por eso; el mapa ya las daba por dobles.
- **Tres fichas más cambiaron de grupo respecto del plan aprobado** (declaradas en la auditoría,
  B14): «Lo dejo a medias» (el plan la ponía en atención conjunta) va a **intención comunicativa**,
  «La loción después del baño» (plan: atención conjunta) va a **comprender**, y «Me meto en su
  juguete» (plan: imitación) va a **juego**. Las tres siguen el grupo PRINCIPAL que les da el mapa;
  el plan las había listado por su segundo grupo.
- **La progresión de juego llega a T7** («lo mismo con el hermano»): la enmienda resumía la escalera
  de los turnos hasta «papeles al revés con un objeto»; el anexo aprobado trae un séptimo escalón,
  el de otra persona, y es el que etiqueta la ficha del hermano. Igual que I6 en imitación.

## Bitácora

- 2026-09-27 · **F0.1 — Setup.** Branch desde `main` (`88da93f`). Delta del kit v1.31.0 adoptado:
  `.claude/commands/audita-sprint.md` (auditor independiente con el diff · reporte
  `SPRINT_NNN-auditoria.md` con todos los hallazgos y `archivo:línea` · casilla 6 «la guía heredada
  se relee contra la arquitectura» · Fase 2 paga TODO · casilla 4 dos veces, summary incluido). La
  PROPUESTA del S6 entra al repo.
- 2026-09-27 · **F0.2 — El registro se retira entero.** Fuera: `content/registro-contacto-visual.ts`,
  su unit, el generador del S5 y su documento (formulario, panel, «Enviar a papá», «Guardar
  registro», cuadrícula impresa). El documento nuevo no tiene formularios, ni botones, ni escribe
  nada en el teléfono: un e2e lo verifica (cero `form`, cero `button`, `localStorage` vacío).
- 2026-09-27 · **F0.3 — Schema de la ficha** (`FichaSchema`, `BibliotecaFichasSchema`, grupos,
  técnicas, progresiones aprobadas, origen). `tests/unit/fichas.test.ts`: cada garantía en rojo con
  fixtures. **El test cazó un defecto real del schema:** con `refs` vacío el refine del origen
  reventaba (zod corre el refine aunque `min(1)` ya falló) en vez de rechazar; se protegió.
- 2026-09-27 · **F0.4 — Generador y ruta.** `gen-la-piramide.mjs` valida cada ficha contra el schema
  antes de escribir, marca «Versión de prueba» mientras la biblioteca no cumple su contrato, y trae
  el modo revisión con la línea «Viene de (…)» por ficha. `copiar-documentos.mjs` sirve el documento
  nuevo en `/mirada`. `package.json`: `gen:piramide` y **`engines` Node ≥ 22.18 (paga B4 del S5)**.
- 2026-09-27 · **F0.5 — Gate ampliado, con su rojo en el mismo commit.** Hashes regenerados desde la
  lista aprobada: 483 términos, 418 huellas, `N_MAX` 5 (test nuevo: el fixture y el gate usan el
  mismo tamaño). La lista ampliada cazó **una palabra en tres líneas de dos documentos del S5** (la
  bitácora y la propuesta): se reescribieron con palabras llanas, verificadas antes contra los
  hashes. **Rojo demostrado:** un script tomó el término de prueba de la lista privada, lo metió en
  una ficha, regeneró el documento y corrió el gate → 2 fallos (la biblioteca, línea 18, y el
  documento generado, línea 214; n-grama de 2) → se restauraron ambos archivos → verde. El término
  no quedó escrito en ningún archivo del repo.
- 2026-09-27 · **F0.6 — Guía v6 y manual.** Guía: bloque P fuera y declarado en el historial —
  feature muerta (P2 · P3 · P4 · P5 · P8, el registro) y reemplazo del documento (P6, P9) —; P1 y
  P7 pasan a Q1 y Q6 «Mejorado en S6»; bloque **Q** nuevo con las miradas de forma (Q1–Q6) y el
  G-Contenido (Q7); cabecera, leyenda y filtros al S6 (el filtro «s5» nunca existió: el del S4
  pasa a regresión y entra el del S6). Manual: sección del documento reescrita (pirámide, fichas,
  sin registro), preguntas frecuentes, historial 006. ADR 016; la ADR 015 anota que el contrato
  del registro se retiró.
- 2026-09-27 · **F0 cerrada.** 326 unit · 14/14 e2e de `/mirada` · typecheck · lint · gate verde.
- 2026-09-27 · **CI roja por algo que no era del sprint — arreglada.** El primer push cayó en
  `quality`: `pnpm audit` cazó advisories publicadas después del último merge — **dos críticas en
  `next`** (<16.3.3), una alta en `sharp` (<0.35.4) y otra en `js-yaml` (<4.3.2), todas transitivas
  o del framework. Arreglo: `next` y `eslint-config-next` 16.2.11 → **16.3.6** (la línea parcheada
  más reciente; el aviso del kit sobre 16.3.6 es solo para `output: export`, que esta app no usa) y
  candados `sharp` ^0.35.4 y `js-yaml@4` ^4.3.2; `vitest` ^4.1.11 cerró las dos moderadas que
  quedaban. `pnpm audit` en **cero, todos los niveles**. La versión nueva trajo dos efectos,
  resueltos sin tocar el comportamiento: (1) una regla nueva de lint sobre `window.location.href`
  en «Borrar mis datos» — la recarga completa es a propósito (el estado en memoria debe morir con
  los datos) y queda con una excepción justificada en línea; (2) en modo desarrollo Next crea la
  base IndexedDB `__next_debug_channel`, que hacía fallar el candado de almacenamiento del e2e de
  privacidad — **verificado que la build de producción no la crea** (los 10 e2e de privacidad en
  verde contra `pnpm start`), se excluye ese nombre exacto, igual que ya se hacía con el canal
  `__next*` de `sessionStorage`. Además, el e2e de privacidad tenía el origen `localhost:3000`
  escrito a mano: ahora lo toma del `baseURL` de la config. Verificado: audit limpio · lint ·
  typecheck · 326 unit · build · **183 e2e**.
- 2026-09-27 · **F2.1 — El mapa de las 74, ejecutado: 56 fichas.** Imitación 12 · atención conjunta
  7 · juego 13 · señalar 4 · intención comunicativa 10 · comprender 10. De la mirada: 19 quedan
  (con otra forma) y 4 se unen en «Con el hermano: la misma rutina, con las mismas palabras»; 1 se
  une a «El frasco que no abre». De la app: 2 quedan, 27 se funden en 7 fichas, 10 entran dentro de
  otras fichas, y **11 caen del documento** (`CAEN_DEL_DOCUMENTO`, siguen intactas en la app): 5 necesitan la pantalla, 4 son de
  la etapa siguiente, 2 quedaron como reglas del «Qué no hacer». 28 salen de los anexos A–F.
  Cada ficha en instrucción directa, con los favoritos del niño en observable, «Funcionó si» sin
  números ni conteos (el schema lo exige) y «Si no pasa» que siempre baja la exigencia. Dos
  decisiones de copy: el hermano va sin edad y sin «mayor»; y **papá no aparece en ninguna ficha**
  (no está hasta noviembre), aunque un anexo lo nombraba en dos ejemplos.
- 2026-09-27 · **F2.2 — El gate cazó tres líneas antes del commit.** El checker local (los mismos
  hashes que la CI) marcó una **sílaba de balbuceo** que, normalizada, coincide con un término de la
  lista (dos líneas; se cambió por otra sílaba) y el **nombre de una revista** en una cita (se citó
  como «Autor, año», la regla A). Limpio después; el documento generado, también.
- 2026-09-27 · **F2.3 — Tests del contenido.** `BibliotecaFichasSchema` activado sobre la biblioteca
  real (ninguna ficha de prueba queda) y **test «el mapa quedó ejecutado»**: cada una de las 74
  aparece exactamente una vez, en las refs de una ficha o en las que caen. El documento deja de
  marcarse «Versión de prueba» solo, porque la biblioteca ya cumple su contrato. 328 unit.
- 2026-09-27 · **F2.4 — Miradas de FORMA, en Pixel 7 (leídas como imagen).** Portada, pirámide,
  una ficha de imitación, la del hermano, una de comprender, la respuesta completa, impresión y
  `?revision`. Medida: `scrollWidth` 412 = ancho 412, ninguna ficha ni bloque se sale; en
  impresión, cero casillas, cero índice, cero botones. **La mirada cazó un defecto de la fase 0
  que la CI no veía:** la clase `revision` era a la vez la de la casilla y la del `body` en modo
  revisión, así que con `?revision` TODO el documento heredaba la letra de la casilla (sin serifa,
  0.8rem, gris) y `position: absolute`. La casilla pasa a `casilla-revision`; e2e nuevo «?revision
  no le cambia la cara al documento» — **en rojo contra el documento viejo** (letra y posición
  distintas) y verde después. Además, el rótulo del modo revisión se partía en dos líneas pegadas:
  interlineado 1 → 1.35. Guía: Q6 gana su señal de «Mal»; Q7 dice «las 56 fichas».
- 2026-09-27 · **F2.5 — Texto fiel a lo que dijo el usuario.** La razón del retiro del registro
  decía «no lo usó» / «anotar no le servía»; el usuario dijo que **a la mamá no le resultó factible
  llevarlo**. Corregido en guía, manual y ADR 016 (que además anota el conteo final y las 11 que
  caen).
- 2026-09-27 · **Auditoría Fase 1 — auditor independiente** (subagente con el diff `main...HEAD`, la orden,
  el plan y el mapa; la bitácora como fuente secundaria). Reporte en `sprints/SPRINT_006-auditoria.md`:
  0 críticos · 1 alto · 6 medios · 21 bajos, cada uno con `archivo:línea`. El alto: **edades escritas**
  en cinco líneas de cuatro documentos del sprint y del S5, que el gate de términos no podía ver.
- 2026-09-27 · **Auditoría Fase 2 — los 28 pagados, sin deuda.** La orden de fase 2 del usuario ya
  pedía «todos los hallazgos pagados», así que no hubo parada entre fases. Tres guardias nuevas con su
  rojo: **edades** (rojo con los archivos viejos, 5 líneas), **claves del prototipo en la progresión**
  (rojo con `in`) y **documento desfasado de la biblioteca** (rojo con el documento viejo); más el gate
  que ya no pasa en silencio si falta un archivo o un marcador (rojo al romper un marcador). Las 24 del
  S5 vuelven al gate. En el copy: el semáforo pide que se aparte «para salirse del juego» (en el cucú,
  taparse es el juego); una sola lista de reglas para el hermano; nueve pasos que eran dos acciones,
  partidos; las fichas de la mamá ya no exigen al hermano. **Casilla 4 dos veces:** la segunda, sobre
  el diff de los pagos, cazó tres frases hermanas (ver el reporte). 359 unit · 16/16 e2e de `/mirada`.
- 2026-09-27 · **G-Contenido — APROBADO.** El usuario revisó las 56 en la preview: «Ya las revisé y
  las veo bien, esto se juzga es en la práctica». Sin ajustes de contenido.
- 2026-09-27 · **`/deploy-check` — MERGE OK.** 359 unit (91 % stmts) · typecheck · lint · build ·
  **185/185 e2e** · audit en cero · sin secrets ni variables nuevas · axe limpio · Lighthouse verde en la
  CI · README, manual, ADR 016 y bitácora al día. **Bundle medido contra `main`** (construido hoy en un
  worktree aparte, con su propio lockfile): JS 1,9 % más liviano en la rama.
- 2026-09-27 · **Summary** `sprints/SPRINT_006-summary.md` en el PR, con el mapa ejecutado ficha por
  ficha (generado del contenido, no a mano). Casilla 4 sobre el summary (tercera pasada): ninguna
  promesa aplazada; se corrigió una afirmación que no estaba respaldada (dónde leyó el usuario).
- 2026-09-27 · **Merge (squash) `140512a`**, rama borrada, producción verificada (56 fichas, cero registro), homepage limpiado.
- 2026-09-27 · **Remate del mismo día — pedido del usuario al ver producción** (rama `sprint-006/remate-titulos`,
  PR aparte): «cada cápsula debería tener el título más grande: no se identifica bien dónde empieza una y
  dónde termina otra». Medido: el título de la ficha iba a ~18 px contra 17 px del texto, y el borde entre
  fichas era de 1 px color crema. Cambio: título de ficha a 1.45rem (~23 px), el nombre del grupo encima
  en pequeño, **franja de 6 px arriba** de cada ficha (4 px negra al imprimir), el doble de aire entre
  fichas; el título de grupo sube a 1.75rem para seguir por encima de la ficha. E2e nuevo que mide la
  jerarquía en las 56 fichas: **rojo contra el documento de producción** (título 1,05× el texto) y verde
  después. Capturas en Pixel 7 leídas: claro, oscuro, modo revisión (el título deja lugar a la casilla) e
  impresión; sin desborde. Guía: Q2 lo dice en su «Esperado» y su «Mal».

