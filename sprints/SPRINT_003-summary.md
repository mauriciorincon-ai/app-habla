---
sprint: 003
app: habla
feature: la-voz-de-la-familia
estado: cerrado — gate ⭐ DIFERIDO al S4 (método v1.9.0, decisión del usuario 2026-07-19); CI verde · deploy-check MERGE OK · AUDITORÍA FINAL + remate fix/s3-remate (2026-07-19, ver § Remate)
fecha: 2026-07-18 (cierre 2026-07-19)
ciclo: H1 (sprint 3 de 4 — el S4 cierra el ciclo: BLUEPRINT + design-sync + gate ⭐ ACUMULADO obligatorio)
---

# Sprint 003 — "La voz de la familia" · Summary

> Tercer corte de **Hablemos San**. Lo que la planeadora necesita para la retro. Penúltimo del
> ciclo H1: este sprint **deja listo** el bloque de Cierre de CICLO (método v1.7.1), pero **no**
> produce blueprint ni design-sync — eso es del S4.

## Qué se entregó (contra los 3 outcomes)

**Outcome 1 — El banco de voz familiar ⭐:** ✅
Un **Estudio de grabación** (`/estudio`) donde el **adulto** graba su voz por lotes guiados
(MediaRecorder → grabar → escuchar → aceptar/regrabar, con 5 estados: sin permiso, error, sin
espacio, vacío, éxito). El banco vive **100 % local en IndexedDB** (ADR-010): jamás a la nube,
jamás al repo. Se guarda **ArrayBuffer + mimeType** (no Blob: no sobrevive el structured-clone en
todo entorno) y se reconstruye el Blob al leer. `navigator.storage.persist()` al primer guardado.
Gestión con **cobertura por categoría** (palabras / consignas / celebraciones), escuchar/borrar, y
el aviso honesto _"estas grabaciones viven SOLO en este dispositivo… la voz de tu hijo nunca se
graba."_ El catálogo es **puro y derivado del contenido real** (palabras de pictos + gemelas,
consignas fijas, celebraciones **sin cifras** — las que llevan número no son grabables, y se dice).

**Outcome 2 — Toda la app prefiere la voz familiar:** ✅
Un hook compartido `use-voz-familiar` resuelve con el `resolverFuente` **puro** (toggle `vozFamiliar`
× ¿hay grabación?) y reproduce la voz grabada. En **palabra↔objeto**: la palabra **suena sola** al
aparecer el dibujo + **botón altavoz ≥64 px** que el niño puede tocar; las frases honestas que ya
estaban en pantalla ("¡Le salió la voz!" / "¡Dijo la palabra!") ahora **suenan en la voz familiar**
— son exactamente las celebraciones del catálogo, así que la app **solo dice en voz alta lo que de
verdad pasó**. En **gemelas**: altavoz en cada picto del par. **Y desde el remate de auditoría: las CONSIGNAS
suenan** — altavoz ≥64 px en el globo ("Haz sonar tu voz: aaaaah") y el cohete ("Haz la voz de
sirena…"), siempre con la guarda del bucle. **Fallback silencioso siempre**: sin grabación o con
el toggle apagado, la app suena como antes (texto sin voz), nunca un error. La **mecánica del
cohete y el globo queda intacta** (ADR-007). Toggle en Ajustes para apagar sin borrar el banco.
**Corte declarado:** la "cápsula de Hoy" NO tiene altavoz — su línea cambia entre 50 cápsulas
(texto variable = no grabable, la misma regla que las celebraciones con cifras).

**⚠️ La guarda del bucle (riesgo nº 1, no listado en la orden):** los 3 juegos con micrófono medirían
la voz familiar sonando por los parlantes como si fuera la del niño (falsa activación → el juego
mentiría, regla dura 3). Mitigación: `silenciar(ms)` en `use-voice-session` descarta los frames
mientras suena el banco (+300 ms de cola). El hook la dispara con la duración de cada grabación.

**Outcome 3 — Palabras gemelas (el 4.º juego):** ✅
Pares mínimos es-CO (**pato/gato, mano/mono, foca/boca, casa/taza, luna/cuna, gota/bota**) con
valor fonológico real (contraste inicial CV y de vocal). **Juego SIN micrófono, co-uso puro**
(ADR-009 como motor): el niño dice una palabra del par, el **padre marca cuál oyó** — no hay
"correcto/incorrecto" para el niño, no se graba ni analiza nada. Celebración honesta ("¡Jugaron 6
rondas!" + "tú marcaste en N"), nunca "acertó". Registro local `habla:v1:gemelas` (insumo del
progreso honesto del S4). **9 pictos ARASAAC nuevos** bajados en desarrollo (script no destructivo)
y commiteados con licencia. Exige etapa **palabras sueltas** (no hay pares en "sonidos e intentos"),
consistente con ADR-005. **4.ª tarjeta** en el selector (COGA: el techo subió a 4 por decisión de la
orden).

**Ítem 0 — kit de prueba:** `docs/kit-de-prueba/` con los WAV sintéticos (voz sostenida + barrido de
tono) y un README, enlazado desde la guía v3 (bloque M).

## Definition of Done — los 6+1

| Gate                    | Estado               | Evidencia                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ----------------------- | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1. Testing**          | ✅                   | **150 unit** (motores del banco: catálogo/cobertura/lotes/almacén con `fake-indexeddb`; gemelas; barajar; privacidad-banco; y del remate: guarda-bucle puro + **integración del hook mic→juego** — se cae si se desconecta la guarda — + borrado del banco + reintento IDB) + **107 e2e** (estudio con mic falso, voz-familiar, gemelas, cero-red grabar+reproducir, axe ×2 rutas nuevas; del remate: consigna en voz familiar + guarda/voz-nueva con WAV real). Cobertura de motores **90 % stmts / 83 % branches**. Todo en CI. |
| **2. CI/CD**            | ✅                   | Actions verde (quality · e2e · lighthouse) esperado en el PR. Preview Vercel por rama. Gate de escritorio del usuario: **pendiente** (ver abajo).                                                                                                                                                                                                                                                                                                                                                                                 |
| **3. Observabilidad**   | ✅ (sin cambios)     | Sentry inerte metadata-only; defer vigente. El banco de voz **nunca** llega a Sentry/logs (regla dura 2-bis).                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **4. Seguridad**        | ✅                   | `pnpm audit --audit-level high` **limpio** (1 moderate transitivo: `postcss` vía next/sentry — dep de build, no explotable aquí; abajo). Cero secrets (gitleaks en cada commit). **Candado TRIPLE de privacidad** (secrets · audio del niño · **banco de voz familiar**): ESLint scoped a `banco-voz/**`+`audio/**` prohíbe RED (storage sí, es su razón de ser), test de escaneo, y **fuga inyectada verificada — 3.ª vez**. `borrarTodo` extendido a IndexedDB.                                                                 |
| **5. Performance**      | ✅                   | El código del banco y las gemelas vive en **sus propias rutas** (`/estudio`, `/jugar/*`): **"/" no se toca**. Budgets 350 KB/3800 ms verificados por la CI Lighthouse en las **8 rutas** (se agregaron `/estudio` y `/jugar/gemelas`). Reproducir audio usa `URL.createObjectURL` + revoke; cero dependencia runtime nueva.                                                                                                                                                                                                       |
| **6. UX/A11y**          | ✅                   | axe limpio en **8 rutas × 2 temas × 2 dispositivos** (`/estudio` y `/jugar/gemelas` nuevas) · altavoz y teclas de gemelas ≥64 px (e2e mide la caja) · `prefers-reduced-motion` en el press del altavoz (`motion-reduce:transition-none`) · sin límite de tiempo, sin game-over · microcopy 100 % es-CO.                                                                                                                                                                                                                           |
| **7. IA embebida**      | **N/A**              | Cero LLM, cero SDK — **cuarta vez consecutiva**. La magia salió del DSP, del contenido y de la voz de la propia familia.                                                                                                                                                                                                                                                                                                                                                                                                          |
| **Manual de uso**       | ✅                   | El 4.º juego (gemelas, sin micrófono); "La voz de la familia" (grabar TU voz, altavoz, toggle, **qué se graba y qué JAMÁS**); privacidad ampliada al banco; FAQ nueva; historial 002 + 003.                                                                                                                                                                                                                                                                                                                                       |
| **Guía de prueba viva** | ✅                   | `docs/GUIA-DE-PRUEBA.html` **v3 acumulativa**: hereda los **79 chips** del v2 ENTEROS, re-etiquetados como regresión de su sprint (ya no "Nuevo · S2"). **Agrega** J (estudio), K (voz en los juegos), L (gemelas), M (kit) + 3 ítems de tablet. **Elimina:** nada. Gate ⭐ = 17.                                                                                                                                                                                                                                                 |
| **Revisión de diseño**  | ⏳ auto-review hecho | Checklist `diseno-ui` corrido por mí sobre las pantallas nuevas (touch ≥64 px, paleta dual, 5 estados del estudio, reduced-motion). **La aprobación visual del usuario está DIFERIDA al gate ⭐ acumulado del S4** (método v1.9.0) — ver el bloque del gate abajo.                                                                                                                                                                                                                                                                |

## ADRs de este sprint

| #   | Tema                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 010 | **[ACCEPTED 2026-07-19, remate] Almacenamiento del banco de voz: IndexedDB con ArrayBuffer.** OPFS descartado (soporte Safari parcial, sin ganancia real para blobs pequeños). Formato **nativo del dispositivo** sin transcodificar (`MediaRecorder.isTypeSupported`); el banco es local → se reproduce donde se grabó (riesgo cross-device documentado). Guarda ArrayBuffer + mimeType (el Blob no sobrevive el structured-clone en jsdom/tests). `persist()` al primer guardado. Export/backup **diferido** (evaluar .zip local en S4; sin nube jamás). Incluye la **guarda del bucle** parlante→mic. |

> ADR-009 (el padre juzga la palabra, del S2) es el **motor conceptual de gemelas**: el padre marca,
> la app no juzga. La **posición del usuario** sobre mandar la voz a la nube sigue registrada ahí
> como decisión abierta — el banco de voz de este sprint es **del adulto** y **jamás sale del
> dispositivo**, así que no la toca.

## Deuda técnica explícita

1. **El eco real del bucle no se prueba en CI** (hallazgo importante): el micrófono falso de
   Playwright es un **archivo**, no capta los parlantes → reproducir audio no retroalimenta la
   captura. El e2e verifica que la **guarda está cableada** (el meter ignora frames mientras suena
   el banco); la **medición del eco real es ítem del gate de tablet** (acumulado, ver abajo). Si el
   eco molestara en la tablet, el autoplay degrada honestamente a solo-botón.
2. **El banco no viaja entre dispositivos** (por diseño, ADR-010): grabado en formato nativo, se
   reproduce donde se grabó. Export/backup local (.zip, sin nube) queda a evaluar en S4.
3. **`/spike/audio` y el spike de grabación (`spike-grabacion.spec.ts`) siguen en el repo**
   (heredado): se limpian al cerrar los ADR 003/007/010 con la tablet.
4. **Iconos de la PWA siguen placeholder** (heredado S1/S2): esperan el gate de tablet.

## Fricción del kit (para la retro)

- **K-habla-6 (entorno, no kit):** desincronización **harness↔disco** — las herramientas de lectura
  mostraron versiones fantasma de archivos (deltas que no estaban en disco) mientras Bash/git
  mostraban la verdad. Se trabajó tomando **Bash/git como fuente de verdad** (re-Read fresco + grep
  antes/después de cada edición). Sin impacto en el producto, pero conviene registrarlo.
- **Deltas del kit ×5 aplicados y verificados** (v1.6.2 gate de arranque · v1.6.3 carnada canónica
  gitleaks · v1.6.4 e2e-BD-real documental · v1.7.1 Cierre de CICLO listo para S4 · v1.7.2 reglas
  6-8 + Lighthouse solo públicas). La **carnada canónica** (`AWS_ACCESS_KEY_ID=AKIA…`) se escribió
  **partida** en CLAUDE.md para no auto-disparar el hook; `gitleaks detect` confirma "no leaks".
- **Regla del gate de arranque (v1.6.2) estrenada:** aprobar el plan **no** arrancó la construcción;
  se esperó el «construye» explícito del usuario con modelo/esfuerzo fijados por él. Funcionó.

## Aprendizajes técnicos

- **La privacidad se extiende con matiz, no en bloque.** El banco de voz **necesita storage** (es su
  razón de ser) pero **jamás red**: el candado ESLint de `banco-voz/**`+`audio/**` prohíbe solo la
  RED, a diferencia de `lib/voice/**` que sella ambos. Verificado inyectando un `fetch` real →
  ambos candados gritaron (3.ª vez que la fuga inyectada se gana su lugar).
- **El riesgo nº 1 no estaba en la orden.** Reproducir la voz familiar por los parlantes mientras el
  meter escucha es un bucle que haría mentir al juego. Se cazó en la exploración del plan, no en la
  construcción, y se blindó por diseño (`silenciar`). **La orden describe el qué; el cómo destapa
  riesgos que solo se ven leyendo el código que ya existe.**
- **Un e2e se apoya en el determinismo del producto.** El test "el dibujo suena con tu voz" inyecta
  una grabación en IndexedDB y se apoya en que el **mazo de pictos es determinista por semilla**:
  tras recargar sale la misma palabra, y se asevera. Sin esa propiedad, el test sería flaky.
- **F2a dejó un e2e mintiendo.** Meter la 4.ª tarjeta (gemelas) sin correr la suite ENTERA dejó
  `selector-juegos` aseverando "exactamente 3 juegos" hasta F3. **Lección: toda UI que toca una
  pantalla ya cubierta por e2e corre la suite entera en su fase, no al cierre.**
- **Honestidad como límite de alcance, otra vez.** La celebración final que dice cifras
  ("¡7,3 segundos!") **no** es grabable con la voz familiar (el número cambia). En vez de forzar una
  frase genérica, se declaró que la voz suena **solo** donde hay texto fijo — y se documentó en el
  manual. Preferir no sonar antes que sonar una mentira.

## Cierre de CICLO — qué queda LISTO para el S4 (no producido aquí)

Método v1.7.1: el S4 (último del ciclo H1) entregará (1) `docs/BLUEPRINT.html` as-built de toda la
infraestructura y (2) el design system publicado en Claude Design (`/design-sync`). Este sprint
**deja el bloque listo** (CLAUDE.md § Cierre de CICLO + regla 9 con el párrafo de publicación) pero
**no** los produce. Todo ciclo tiene mínimo 3 sprints; H1 cierra en el S4.

## Remate de auditoría final (2026-07-19) — `fix/s3-remate`

El usuario pidió una **auditoría de dos fases antes del cierre** (Fase 1 solo-lectura → aprobó →
Fase 2 con plan validado → implementada). El detalle vive en la bitácora § Remate; lo esencial:

- **A-1 pagado:** las consignas grabables ahora SUENAN (globo + cohete, altavoz ≥64 px con
  guarda); `consigna:nombra` retirada (dirigida al padre, sin sitio — grabar lo que jamás sonará
  es deshonesto); cortes del plan declarados en § Desviación de la bitácora.
- **A-2 pagado:** la guarda del bucle quedó blindada ×3 (motor puro + test de integración que se
  cae si se desconecta + e2e con WAV real) → **ADR-010 accepted** (era su condición).
- **A-3 pagado:** "Borrar mis datos" ESPERA el borrado real del banco (antes la recarga podía
  ganarle la carrera al `deleteDatabase`); unit lo garantiza.
- **A-4 — hallazgo NUEVO al implementar (defecto S2 latente, regla dura 3):** cada dibujo nuevo
  de palabra↔objeto se encendía SOLO con la voz acumulada del anterior (inflaba activaciones).
  Arreglo: **ancla de voz NUEVA por dibujo**. Cubierto por el e2e del WAV real.
- **Bonus del candado viejo:** el e2e de privacidad del S1 cazó que preguntar por el banco CREABA
  la base vacía — ahora las lecturas jamás crean (`indexedDB.databases()`); solo grabar crea.
- **M-1/M-2 pagados:** IndexedDB roto ya no deja `/estudio` en esqueleto eterno ni envenena la
  sesión; un `play()` fallido cancela la guarda (el juego no queda sordo).
- **Deuda declarada (S4):** tests de componente del estudio (la parte crítica la paga el de
  integración) · duplicaciones `barajar`/`fechaHoy`/`reproducir` · unit del cap-500 · revoke al
  navegar a mitad de clip · lote-por-etapa. El **eco acústico real** sigue siendo ítem de tablet.

## El gate ⭐ — DIFERIDO al S4 (decisión del usuario, 2026-07-19)

**El usuario decidió, explícitamente, diferir el gate ⭐ de este sprint intermedio al S4** (el
cierre del ciclo H1), según la figura del método **v1.9.0**. Las **4 condiciones** que la figura
exige se cumplen todas:

| #   | Condición (método v1.9.0)                                                            | Estado en el S3                                                                                                                                                         |
| --- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Registro en el summary**                                                           | ✅ Este bloque + el `estado` del frontmatter.                                                                                                                           |
| 2   | **CI contra dependencias reales + humo**                                             | ✅ 103 e2e con **micrófono falso real** (grabar/reproducir de verdad), cero-red, axe, Lighthouse — todo verde en el PR #3.                                              |
| 3   | **La guía acumulativa conserva TODAS las pruebas ⭐ (nada se pierde)**               | ✅ `docs/GUIA-DE-PRUEBA.html` v3 hereda los 79 chips ENTEROS + suma los del S3; **gate ⭐ = 17, ninguno eliminado**. Solo se pospone su ejecución.                      |
| 4   | **La orden del sprint de CIERRE (S4) declara el gate ⭐ ACUMULADO como OBLIGATORIO** | ⏳ **Requisito para la orden del S4** (la escribe la planeadora): debe cargar el gate ⭐ acumulado S1+S2+S3 como obligatorio — el gate del cierre **jamás** se difiere. |

Lo que se difiere al S4 (gate acumulado, obligatorio allá): grabar la voz real en el estudio y
oírla en los juegos, la aprobación visual de las pantallas nuevas, y —cuando regrese la tablet— la
validación de dispositivo (spike, 60 fps, PWA+offline, el tono con la voz DEL NIÑO, **el eco real
del bucle**, gemelas con el niño) que cierra los ADR 003/007/010.

## Lo que falta para cerrar (acciones del usuario)

1. Mergear el PR #3 (CI verde · deploy-check MERGE OK) y correr **`/cierre-sprint habla`** en la
   planeadora — es lo que ella lee para la retro y para preparar la orden del S4.
2. Al planear el **S4**: que la orden **declare el gate ⭐ ACUMULADO (S1+S2+S3) como OBLIGATORIO**
   (condición 4 de la figura v1.9.0) — el gate del cierre de ciclo no se difiere.

## Aprovisionamiento

| Servicio                    | Estado                                          |
| --------------------------- | ----------------------------------------------- |
| GitHub + Vercel             | ✅ operando (preview por rama)                  |
| Sentry                      | ⏳ defer aceptado (kit inerte sin DSN)          |
| ARASAAC                     | ✅ sin cuenta: lote offline con atribución (+9) |
| API LLM                     | N/A — cero IA en este sprint (**4.ª vez**)      |
| _(hardware)_ Tablet Android | ⏳ de viaje — lista diferida acumulada S1+S2+S3 |
