# Sprint 006 — «La pirámide» · Auditoría final (Fase 1)

- **Fecha:** 2026-09-27
- **Auditor:** subagente independiente, con el diff `main...HEAD` (rama `sprint-006/la-piramide`,
  commits `c41884e` · `89b2d2e` · `49f634e` · `d6b38cc`; 33 archivos, +5996 / −7002).
- **Fuentes contrastadas:** el diff archivo por archivo; el plan aprobado; la orden del S6 con su
  enmienda; el plan del sprint; el mapa de las 74 y los anexos (solo para verificar fidelidad: nada
  de ahí se copia aquí). La bitácora se leyó como fuente secundaria.
- **Modo:** SOLO LECTURA. No se tocó ningún archivo del repo ni de la planeadora.

**Corridas propias (hoy):**

| Verificación                                                                           | Resultado                                                              |
| -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `pnpm test`                                                                            | 23 archivos · **328 pruebas en verde**                                 |
| `pnpm typecheck`                                                                       | sin errores                                                            |
| `pnpm lint`                                                                            | sin errores                                                            |
| Checks del PR (#15, borrador)                                                          | quality · e2e · lighthouse · despliegue: **todos en verde**            |
| Documento regenerado en un directorio temporal (fuera del repo) con el mismo generador | **idéntico** a `docs/LA-PIRAMIDE.html` commiteado                      |
| Gate de cero enlaces (`grep` de la regla 13)                                           | vacío                                                                  |
| `node scripts/sensibilidad-informe.mjs` (solo reporta)                                 | `content/contacto-visual.ts` da **0 coincidencias** (dato usado en M6) |

No se corrió Playwright ni `pnpm build` (fuera del mandato); los e2e se toman de la CI.

---

## 1. Cobertura de alcance

| #   | Ítem planeado (orden + enmienda + plan aprobado)                                                               | Clasificación                             | Evidencia                                                                                                                                                                                                                                                                                                        |
| --- | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Delta del kit v1.31.0 (`/audita-sprint`: auditor independiente, reporte con todo, casilla 6, Fase 2 paga todo) | Completo                                  | `.claude/commands/audita-sprint.md:22-30, 73-78, 83-101, 106-122`                                                                                                                                                                                                                                                |
| 2   | Registro retirado entero (contenido, generador y documento del S5, unit, e2e)                                  | Completo                                  | diff: `content/registro-contacto-visual.ts` (−114), `scripts/gen-catalogo-contacto-visual.mjs` (−651), `docs/CATALOGO-CONTACTO-VISUAL.html` (−5533), `tests/unit/registro-contacto-visual.test.ts` (−70); `tests/e2e/mirada.spec.ts:100-112`; `git grep` sin restos fuera de historia                            |
| 3   | Bloque P como feature muerta declarada en el historial (condición C)                                           | Completo                                  | `docs/GUIA-DE-PRUEBA.html:913`                                                                                                                                                                                                                                                                                   |
| 4   | Schema propio con `origen` trazable (condición A)                                                              | Implementado con desviación (declarada)   | `content/schema.ts:398-677`; `origen` como `{de, refs}` en vez de prefijos (ADR 016 §2); prioridad por agregado en vez de «cada prioritario ≥ cada no prioritario» (bitácora `:22-26`). Defecto en M4                                                                                                            |
| 5   | Seis grupos fijos · prioridad solo en tres · piso 20 · cada grupo ≥ 2                                          | Completo                                  | `content/schema.ts:411-418, 628-638, 653-677`; `tests/unit/fichas.test.ts:88-92, 146-189`                                                                                                                                                                                                                        |
| 6   | Progresiones: solo las aprobadas, etiqueta opcional                                                            | Implementado con desviación               | `content/schema.ts:505-549`: I1–I6 (declarada en bitácora `:36-38`, fiel al anexo); **T7 no declarada** (B14)                                                                                                                                                                                                    |
| 7   | Generador + `/mirada` + `?revision` + imprimible + cero JS salvo revisión                                      | Completo (con hallazgos M1, M2, B11, B19) | `scripts/gen-la-piramide.mjs`; `scripts/copiar-documentos.mjs:22`; `next.config.ts:12`; `tests/e2e/mirada.spec.ts:30-185`                                                                                                                                                                                        |
| 8   | Mapa de las 74 ejecutado (~56; 11 caen con razón)                                                              | Implementado con desviación               | `content/fichas.ts:21-1704`; `tests/unit/fichas.test.ts:218-234` (cada una de las 74 aparece una sola vez); los 53 ids de anexo usados exactamente una vez (verificado). 56 vs 55 y dos cambios de grupo declarados (bitácora `:43-50`); **tres movimientos más respecto del plan aprobado no declarados** (B14) |
| 9   | Copy: instrucción directa, un paso = una acción, favoritos en observable, sin nombres/edades (condición B)     | Parcial                                   | Documento sin nombres ni edades (verificado); pero **edades en archivos del sprint** (A1), pasos compuestos (M5), fichas «con la mamá» que exigen al hermano (B5)                                                                                                                                                |
| 10  | Gate: lista ampliada (483), `N_MAX` 5, alcance, rojo en el mismo commit                                        | Implementado con desviación               | fixture: 483 términos / 418 huellas / `n_max` 5; `scripts/lib/sensibilidad.ts:18, 122-160`; `tests/unit/sensibilidad.test.ts:58-60`. `content/contacto-visual.ts` **salió del gate** (M6). El rojo no es verificable en el diff (declarado en bitácora `:73-80`)                                                 |
| 11  | B4: `engines` Node ≥ 22.18 (+ nota en README si hay sección de arranque)                                       | Parcial                                   | `package.json:5-7`; README tiene «Arranque» (`README.md:26`) y no trae la nota (B13)                                                                                                                                                                                                                             |
| 12  | Tests F0/F2 (schema con rojo por restricción, trazabilidad, e2e reescrito con axe)                             | Completo (con B3, B20)                    | `tests/unit/fichas.test.ts`; `tests/e2e/mirada.spec.ts`                                                                                                                                                                                                                                                          |
| 13  | Guía v6 acumulativa (bloque Q, orígenes, filtro, historial)                                                    | Completo (con B10)                        | `docs/GUIA-DE-PRUEBA.html:154-205, 793-833, 913`                                                                                                                                                                                                                                                                 |
| 14  | Manual: sección del documento, FAQ, historial 006                                                              | Completo (con M1, B7, B16)                | `docs/MANUAL-DE-USO.md:306-341, 417-428, 463`                                                                                                                                                                                                                                                                    |
| 15  | ADR 016 + anotación en ADR 015                                                                                 | Completo (con M6)                         | `decisions/016-…md`; `decisions/015-…md:58-60`                                                                                                                                                                                                                                                                   |
| 16  | La app y sus 50, y las 24 del S5, intactas                                                                     | Completo                                  | no aparecen en el diff; `src/components/estado-local.ts:151-154` solo agrega comentario + excepción de lint (sin cambio de comportamiento)                                                                                                                                                                       |
| 17  | Brochure y export sin tocar                                                                                    | Completo                                  | fuera del diff; no mencionan el documento de la mamá                                                                                                                                                                                                                                                             |
| 18  | Miradas de FORMA en teléfono + medida de desborde                                                              | No verificable desde el diff              | bitácora `:121-131`; la medida automática vive en `tests/e2e/mirada.spec.ts:153-170`                                                                                                                                                                                                                             |
| 19  | `gh pr checks` por push                                                                                        | Completo al momento de auditar            | checks del PR en verde                                                                                                                                                                                                                                                                                           |
| 20  | Arreglo de CI por avisos de seguridad (next 16.3.6, candados, puerto de e2e, canal de depuración)              | Implementado con desviación (declarada)   | `package.json:23, 38-47`; `pnpm-workspace.yaml:21-33`; `playwright.config.ts:18-22, 62-65`; `tests/e2e/privacidad-cero-red.spec.ts:3-5, 183-188`; bitácora `:88-102`                                                                                                                                             |
| 21  | G-Contenido · summary · merge                                                                                  | Pendiente (posterior a esta fase)         | —                                                                                                                                                                                                                                                                                                                |

---

## 2. Hallazgos

### Crítico

Ninguno.

### Alto

**A1 — Edades escritas en archivos públicos que el propio gate del S6 vigila (condición B de la orden).**

- **Dónde:**
  - `sprints/PROPUESTA-sprint-006-piramide.md:53` — la edad del hermano, entre paréntesis, junto a
    «el hermano» (**entró en este sprint**, commit `c41884e`).
  - `sprints/PROPUESTA-sprint-006-piramide.md:64` — un rango de edad del niño (**entró en este sprint**).
  - `sprints/SPRINT_005-summary.md:60` — la edad del hermano entre paréntesis.
  - `sprints/SPRINT_005-implementation-log.md:209-210` — «El hermano tiene … años» (archivo que el S6
    editó en la línea 90 para quitar un término, y dejó esta).
  - `sprints/PROPUESTA-sprint-005-contacto-visual.md:28` — un rango de edad del niño.
- **Qué está mal:** la orden exige «sin nombres, edades ni condiciones; «el hermano» sin edad», y la
  bitácora (`:111`) afirma que se cumplió. El documento sí cumple; estos cinco archivos, todos dentro
  de `ALCANCE_GATE`, no. El gate de términos no lo puede ver (no son términos de la lista).
- **Ajuste ejecutable:**
  1. `PROPUESTA-sprint-006-piramide.md:53`: borrar el paréntesis con la edad que sigue a «el hermano»
     (queda «…Todo con la mamá; el hermano sigue siendo la «otra persona» hasta noviembre.»).
  2. `PROPUESTA-sprint-006-piramide.md:64`: reemplazar «para un niño de ‹rango› años» por «para un
     niño en la etapa de palabras sueltas».
  3. `SPRINT_005-summary.md:60`: borrar el paréntesis con la edad (queda «**La «otra persona» es el
     hermano, no papá:**»).
  4. `SPRINT_005-implementation-log.md:209-210`: reemplazar «El hermano tiene ‹edad› años: las
     instrucciones de una frase se quedan tal cual» por «El hermano entiende instrucciones de una
     frase: se quedan tal cual».
  5. `PROPUESTA-sprint-005-contacto-visual.md:28`: reemplazar «para un niño de ‹rango› años.» por
     «para un niño en la etapa de palabras sueltas.».
  6. Guardia mecánica en `tests/unit/sensibilidad.test.ts`, al final del `describe` del gate:

     ```ts
     const EDAD = [
       /\b\d{1,2}\s*(?:[–-]\s*\d{1,2}\s*)?años\b/i,
       /hermano\s*\(\s*\d{1,2}/i,
       /\btiene\s+\d{1,2}\s+años\b/i,
     ];
     for (const alcance of ALCANCE_GATE) {
       const archivo = archivoDe(alcance);
       it(`sin edades escritas: ${nombreDe(alcance)}`, () => {
         const ruta = join(RAIZ, archivo);
         if (!existsSync(ruta)) return;
         const lineas = recortar(readFileSync(ruta, "utf8"), alcance)
           .split("\n")
           .flatMap((l, i) => (EDAD.some((r) => r.test(l)) ? [i + 1] : []));
         expect(lineas, `edad escrita en ${archivo}`).toEqual([]);
       });
     }
     ```

  7. Al mergear, usar **squash** (como los PR anteriores): así el commit `c41884e` con la edad no entra
     a la historia de `main`. Las líneas del S5 ya están en la historia de `main`; reescribirla es
     decisión del usuario (no se recomienda por defecto).
- **Criterio de verificación:** la guardia nueva corre en rojo antes de los pasos 1–5 (cinco líneas) y
  en verde después; `pnpm test` verde; `grep -n "años" sprints/PROPUESTA-sprint-006-piramide.md` sin
  edades.

### Medio

**M1 — El «único semáforo» quedó incondicional y contradice la ficha del cucú.**

- **Dónde:** `scripts/gen-la-piramide.mjs:248` (caja del semáforo), `scripts/gen-la-piramide.mjs:62`
  («Qué no hacer» #8), `docs/MANUAL-DE-USO.md:329`; choca con `content/fichas.ts:431-436`
  (cucú: que **se tape** es justamente la señal de que funcionó).
- **Qué está mal:** el documento del S5 decía «…se irrita _cuando le pides algo con la mirada_, se
  para»; el S6 quitó la condición. Leído al pie de la letra, la mamá debería parar el cucú cuando él se
  tapa, y parar cualquier juego cada vez que él mira a otro lado.
- **Ajuste ejecutable:**
  - `gen-la-piramide.mjs:248` → `<p><strong>El único semáforo:</strong> si aparta la vista, se tapa la
cara o se irrita <strong>para salirse del juego</strong>, <strong>se para</strong>. Se vuelve a
intentar más tarde, o mañana. (En el cucú, taparse es el juego, no el semáforo.)</p>`
  - `gen-la-piramide.mjs:62` → `"Si aparta la vista, se tapa la cara o se irrita para salirse del
juego: se para. «Se acabó» cierra el juego; no lo persigas para seguir."`
  - `docs/MANUAL-DE-USO.md:329` → `- **El semáforo**: si aparta la vista, se tapa la cara o se irrita
para salirse del juego, se para (en el cucú, taparse es el juego).`
  - `content/fichas.ts:438` (siNoPasa del cucú) → anteponer `"Aquí taparse es el juego, no el
semáforo. "` (queda en 179 caracteres, bajo el tope de 260).
  - `pnpm gen:piramide`.
- **Criterio:** `grep -c "para salirse del juego" docs/LA-PIRAMIDE.html` ≥ 2; unit + e2e verdes
  (`mirada.spec.ts:39` sigue encontrando «El único semáforo:»); gate verde.

**M2 — «Qué no hacer» #5 perdió la cláusula de la síntesis y choca con preguntas que la mamá misma
responde.**

- **Dónde:** `scripts/gen-la-piramide.mjs:59`. Choques literales: cucú «¿Dónde está mamá?…»
  (`content/fichas.ts:433`) contra «ni «¿dónde está?»»; «¿Más?… ¡más!» (`:1163`) contra «No preguntes
  «¿quieres más?»» (`:1082`). Y varios «Funcionó si» de comprender describen un montaje tipo prueba
  (`:1370`, `:1446`, `:1643`).
- **Qué está mal:** la regla transversal aprobada dice, además de «sin examen», que el «funcionó si»
  vale solo cuando lo dicho era parte real del juego; esa mitad no llegó al documento. Sin ella, la
  mamá puede armar escenas «para ver si entiende», y las preguntas autorrespondidas parecen prohibidas.
- **Ajuste ejecutable:** reemplazar el texto de `gen-la-piramide.mjs:59` por:
  `"Sin examen: ni «¿qué es?», ni «¿dónde está?», ni «¿cómo se dice?», ni «haz esto» sentados en una
mesa. Nómbrale las cosas en vez de preguntarle por ellas. Las preguntas que tú misma respondes
enseguida («¿Más?… ¡más!», «¿Dónde está mamá?… ¡Aquí está!») son parte del juego. Y «Funcionó si»
vale solo cuando pasó dentro de un juego de verdad, nunca armado para ver si entiende."`
  Luego `pnpm gen:piramide`.
- **Criterio:** la frase «nunca armado para ver si entiende» aparece en `docs/LA-PIRAMIDE.html`;
  unit + e2e + gate verdes.

**M3 — Dos juegos distintos de «tres reglas» para el hermano.**

- **Dónde:** `scripts/gen-la-piramide.mjs:61` («Tres reglas para el hermano: una cosa a la vez,
  esperar cinco segundos, copiarlo») contra `content/fichas.ts:453` y `:459` («tres reglas dichas
  antes: mira lo que él te muestre · di «¡uy!» y míralo a la cara · sigue su dedo»). `:904` coincide
  con la regla general.
- **Qué está mal:** el documento le da a la mamá dos listas diferentes con el mismo nombre; falla la
  pregunta de juicio «¿se entiende sin ti?».
- **Ajuste ejecutable:**
  - `fichas.ts:453` → `"El hermano cerca, unos minutos. Además de sus reglas de siempre, para este
juego: mira lo que él te muestre · di «¡uy!» y míralo a la cara · sigue su dedo cuando señale."`
  - `fichas.ts:459` → `"El hermano responde como le dijiste; tú te quedas un paso atrás, sin
hablar."`
  - `gen-la-piramide.mjs:61` → `"El hermano juega con él; no le enseña. Sus reglas de siempre: una
cosa a la vez, esperar cinco segundos, copiarlo. Si una ficha le da otras, son solo para ese
juego."`
  - `pnpm gen:piramide`.
- **Criterio:** `grep -c "tres reglas" docs/LA-PIRAMIDE.html` baja a 1 (la de `:904`); unit + gate
  verdes.

**M4 — El refine de `progresion` acepta claves del prototipo (verificado).**

- **Dónde:** `content/schema.ts:626` — `f.progresion in PROGRESIONES[f.grupo]`.
- **Qué está mal:** `in` mira la cadena de prototipos. Probado hoy: `FichaSchema.safeParse` da
  `success: true` con `progresion: "constructor"`, `"toString"`, `"__proto__"` o `"hasOwnProperty"`,
  **incluso en intención comunicativa**, que no debe tener pasos. El generador
  (`gen-la-piramide.mjs:81`) pintaría entonces el texto de una función nativa en el chip «Paso: …».
- **Ajuste ejecutable:**
  - `schema.ts:626` → `(f) => f.progresion === undefined ||
Object.prototype.hasOwnProperty.call(PROGRESIONES[f.grupo], f.progresion),`
  - `tests/unit/fichas.test.ts`, dentro de «la progresión es un paso aprobado de SU grupo…» (tras la
    línea 97):

    ```ts
    for (const clave of ["constructor", "toString", "__proto__"]) {
      expect(valida({ progresion: clave }), clave).toBe(false);
      expect(
        valida({
          grupo: "intencion-comunicativa",
          prioridad: "normal",
          progresion: clave,
        }),
        clave,
      ).toBe(false);
    }
    ```
- **Criterio:** el test nuevo en rojo con el `in` y verde con `hasOwnProperty`; `pnpm test` y
  `pnpm typecheck` verdes.

**M5 — «Haz — los pasos, uno por acción» no es cierto en varios pasos.**

- **Dónde:** la promesa en `scripts/gen-la-piramide.mjs:265` (y regla de copy de la orden). Pasos que
  encadenan varias acciones con ramas, o que no son acción: `content/fichas.ts:31`, `:149`, `:199/204`,
  `:347`, `:793/804`, `:853`, `:1011`, `:1187/1193`, `:1515`.
- **Qué está mal:** el documento se describe a sí mismo con una regla que estas fichas no cumplen; la
  mamá no puede hacerlas «tal cual» paso por paso.
- **Ajuste ejecutable (texto exacto; todo respeta 3–5 pasos y los topes del schema):**
  - `:30-31` (dos-juguetes-iguales, tenALaMano) → un solo ítem: `"Dos juguetes iguales que ya le
gusten: dos carros, dos tambores o dos cucharas de palo."` (sale «Nada nuevo el primer día.», que no
    es un objeto).
  - `:149` (ahora-yo-ahora-tu, paso 4) → `"Si no la copia después de verla unas veces, llévale las
manos con suavidad, una sola vez, y celébralo igual."`
  - `:199` (marchar-con-algo, tenALaMano[0]) → `"Dos cucharas de palo, o dos botellas con arroz que
suenen: la suya, a su alcance, sin dársela."`; `:204` (paso 2) → `"En la segunda vuelta, marcha con
tu cuchara arriba y abajo, al ritmo."`
  - `:347` (dos-pasos-y-lo-de-ayer, paso 1, que es una condición) → sacarlo de `haz` (quedan 4) y
    agregar a `tenALaMano`: `"Que «Ahora yo, ahora tú» ya salga con una acción; si no, empieza por esa
ficha."`
  - `:793` (el-carro-va-y-viene, paso 2) → `"Espera con las manos abiertas a que lo devuelva."`; `:804`
    (siNoPasa) → `"Si no lo devuelve, acércate, empújalo apenas hacia ti y agradécelo en grande. Usa lo
que él prefiera rodar. Si se queda con el carro, no se lo quites: rueda otro igual y espera a que te
mire. Si lo nuevo rompe el juego, vuelve a lo simple."` (239 caracteres).
  - `:853` (de-mentira-conmigo, paso 4) → `"Cuando eso salga, pásale la taza y acerca tu boca: que él te
dé de beber."`
  - `:1011` (mira-lo-que-traigo, paso 3) → `"Cuando la tenga, extiende la mano abierta y espera: si te
la da, devuélvesela enseguida."`
  - `:1187` (espera-con-cara-de-pregunta, paso 5) → `"Si le pides algo, dilo una sola vez y espera."`;
    `:1193` (siNoPasa) → agregar al final `" Si le pides algo y no responde, muéstraselo con tu cuerpo; y
si tampoco, háganlo juntos."` (224 caracteres).
  - `:1515` (la-cancion-de-siempre-al-vestirlo, paso 2, fragmento sin verbo) → `"Deja su hueco de
siempre antes de lo mejor, y espera."`
  - `pnpm gen:piramide`.
- **Criterio:** `pnpm test` verde (schema: 3–5 pasos, topes de largo); `mirada.spec.ts:82-98` verde
  (≥ 3 pasos); gate verde; cada paso citado se lee como una acción en `/mirada?revision`.

**M6 — Las 24 del S5 salieron del gate, y el ADR 016 dice que no.**

- **Dónde:** `scripts/lib/sensibilidad.ts:122-160` (ya no incluye `content/contacto-visual.ts`, que el
  S5 sí vigilaba) y su comentario `:118-120`; `decisions/016-la-piramide-fichas-y-retiro-del-registro.md:43-44`
  («…además de lo que ya vigilaba del S5»).
- **Qué está mal:** la cobertura del gate de privacidad retrocedió sobre un archivo público que
  describe al niño, y el ADR afirma lo contrario. El archivo está limpio hoy (0 coincidencias en el
  informe), así que volver a vigilarlo no cuesta nada y no toca su contenido.
- **Ajuste ejecutable:** en `sensibilidad.ts`, agregar `"content/contacto-visual.ts",` en el bloque del
  S5 (después de la línea 137) y cambiar el comentario `:118-120` a «El resto del repo —incluidas las 50
  cápsulas de la app, que no se tocan— lo cubre el INFORME». El ADR 016 queda cierto sin editarlo.
- **Criterio:** `pnpm test` muestra el caso `content/contacto-visual.ts` en verde;
  `node scripts/sensibilidad-informe.mjs` ya no lo considera fuera del gate.

### Bajo

**B1 — `Ficha.prioridad` sin consumidor (casilla 5).** `content/schema.ts:592` solo se lee en su propio
refine (`:634`); el generador marca la prioridad por `GRUPOS_PRIORITARIOS` (`gen-la-piramide.mjs:41`).
_Ajuste:_ `gen-la-piramide.mjs:41` → `const esPrioritario = (g) => deGrupo(g).length > 0 &&
deGrupo(g).every((f) => f.prioridad === "alta");` (el refine garantiza que coincide con
`GRUPOS_PRIORITARIOS`). _Criterio:_ documento regenerado idéntico salvo la fecha; unit + e2e verdes.

**B2 — `CAEN_DEL_DOCUMENTO` y su campo `razon` sin consumidor fuera de tests (casilla 5).**
`content/fichas.ts:1689-1704`; `razon` no tiene ni un lector. _Ajuste:_ en el modo revisión
(`gen-la-piramide.mjs`, dentro de la sección `solo-revision`, tras la línea del conteo) agregar
`<p class="suave">Quedaron fuera del documento (${CAEN_DEL_DOCUMENTO.length}), siguen en la app:</p>` y
una lista `<ul class="lista">` con `app · ${esc(c.id)} — ${esc(RAZON_LEGIBLE[c.razon])}`, con
`const RAZON_LEGIBLE = { "necesita-la-app": "necesita la pantalla", "etapa-siguiente": "es de la etapa
siguiente", "va-a-que-no-hacer": "quedó como regla del «Qué no hacer»" }`; importar
`CAEN_DEL_DOCUMENTO`. En `mirada.spec.ts:114-127` agregar `await
expect(page.getByText("Quedaron fuera del documento")).toBeVisible();` y en el test de `/mirada` sin
revisión, que esté oculto. _Criterio:_ e2e verde; gate verde (los ids ya viven en `fichas.ts`, que el
gate vigila).

**B3 — Nada detecta que el documento se desfase de la biblioteca; el e2e de conteos es tautológico.**
`tests/e2e/mirada.spec.ts:53-80` compara el conteo del título con las fichas de la misma sección, y
ambos salen de la misma llamada `deGrupo(g)` del generador (`gen-la-piramide.mjs:121-140`). Si alguien
edita `fichas.ts` y no corre `pnpm gen:piramide`, todo sigue verde. _Ajuste:_ en
`tests/unit/fichas.test.ts`, test nuevo que lea `docs/LA-PIRAMIDE.html` y compruebe: número de
`<article class="ficha"` = `FICHAS.length`; cada `id="${f.id}"` presente; cada `f.funcionoSi` presente
escapado con una función local (`&`→`&amp;`, `<`→`&lt;`, `>`→`&gt;`, `"`→`&quot;`). _Criterio:_ el test
falla si se edita una ficha sin regenerar, y pasa tras `pnpm gen:piramide`.

**B4 — Números cableados menores (casilla 6b).** `tests/e2e/mirada.spec.ts:13-20` duplica los seis
grupos y `:72-74` espera `3` chips de prioridad; `gen-la-piramide.mjs:254` dice «Las tres marcadas… las
otras tres»; `docs/GUIA-DE-PRUEBA.html:827` («las 56 fichas») y `docs/MANUAL-DE-USO.md:323-324` (56 y
el reparto por grupo) no tienen guardia. _Ajuste:_ (a) en el e2e importar `GRUPOS` y
`GRUPOS_PRIORITARIOS` desde `../../content/schema` y usar `GRUPOS_PRIORITARIOS.length`; (b)
`gen-la-piramide.mjs:254` → «Las seis, en una frase cada una. Las marcadas «prioridad ahora» son las
que más trabajo necesitan ahora; las demás también van, todos los días.» (cubre también B17); (c) en
`fichas.test.ts`, test que normalice espacios del manual y verifique `**${FICHAS.length} fichas de
actividad**` y `${NOMBRE_GRUPO[g].toLowerCase()} ${n}` por grupo, y que la guía contenga `las
${FICHAS.length} fichas`. _Criterio:_ tests verdes; cambiar una ficha de grupo los pone en rojo.

**B5 — Fichas «con la mamá» cuyos pasos o señal de éxito dependen del hermano.** `content/fichas.ts:1013`
(mira-lo-que-traigo, paso 5), `:1665` y `:1670` (corre-que-te-atrapo-con-palabras), `:1413`
(las-mismas-palabras, «Funcionó si»), `:853` (de-mentira-conmigo), `:1054` (la-sorpresa-en-la-ruta).
Sin el chip «con el hermano», la mamá no sabe que lo necesita. _Ajuste:_ `:1013` → «Si el hermano está
cerca, gira tu cuerpo hacia él —«¡muéstrasela!»— y que él responda: mira la cosa, mira su cara y la
nombra.»; `:1665` → «Si el hermano juega, usa las mismas cuatro palabras.»; `:1670` y `:1413` → quitar
«; también cuando la dice el hermano» / «; y también cuando la dice el hermano»; `:853` → ver M5;
`:1054` → «…Si la pide con la mano, dásela y, si el hermano está cerca, muéstrensela juntos. Nunca la
misma dos veces seguidas.» _Criterio:_ ninguna ficha con `conQuien: "mama"` exige al hermano sin
«si está cerca / si juega».

**B6 — «Funcionó si» con un conteo en palabras.** `content/fichas.ts:1228` («…con dos cosas a la
vez…»); el refine solo detecta cifras (`content/schema.ts:621`). _Ajuste:_ `:1228` → «te pide ayuda
juntando el frasco hacia ti con la mirada, o un gesto con un sonido.» _Criterio:_ regenerado; unit
verde.

**B7 — El manual dice que «Funcionó si» se ve «en el momento», pero dos fichas se ven otro día.**
`docs/MANUAL-DE-USO.md:333` contra `content/fichas.ts:356` y `:1370`. _Ajuste:_ `:333` → «…("Funcionó
si…"), para verla mientras juegan —algunas, en los días siguientes—: no hay nada que anotar…».
_Criterio:_ lectura del manual coherente con esas dos fichas.

**B8 — Una espera que se estira «aunque se sienta eterno».** `content/fichas.ts:1184` choca con «la
pausa dura segundos» (`gen-la-piramide.mjs:55`). _Ajuste:_ `:1184` → «Cuenta hasta cinco por dentro,
sin adivinar lo que quiere.» _Criterio:_ regenerado; gate verde.

**B9 — Pausas sin cierre «si no, sigue igual» (regla «al final dale siempre lo que quería»).**
`content/fichas.ts:1158`, `:1255`, `:880`. _Ajuste:_ `:1158` → «Espera, mirándolo, a que pida la
siguiente: te mira, estira la mano, hace un sonido o dice «más»; si no pide, dásela igual.»; `:1255` →
«Espera unos segundos, mirándolo; si no reacciona, vuelve a marchar igual.»; `:880` → «Espera su señal
para seguir —la mirada, los brazos, un sonido o su «¡ya!»—; si no llega, arranca igual.» _Criterio:_
cada pausa del documento termina en entrega.

**B10 — La guía cuenta mal su gate mínimo y dice que todo va en el computador.**
`docs/GUIA-DE-PRUEBA.html:183` dice «Son 25» pruebas ⭐ antes del bloque Q; hay **23** (líneas 222 a 770;
el desfase viene del S4 y el S6 lo heredó). `:159` dice «Todo se hace en el computador», pero el bloque
Q pide el teléfono (`:794`). _Ajuste:_ `:183` → «Son <strong>23</strong>»; `:159` → agregar al final
de la oración «; el bloque Q va en tu teléfono». _Criterio:_ conteo de `⭐ gate mínimo</span>` en
etiquetas de prueba entre las líneas 217 y 792 = 23.

**B11 — Rama muerta «Versión de prueba» con una promesa aplazada.** `gen-la-piramide.mjs:39, 144-148,
321`: «Las fichas reales llegan cuando el papá apruebe el contenido.» ya no puede salir (la biblioteca
cumple el schema y el unit lo exige), pero reaparecería en silencio si la biblioteca se rompe. _Ajuste:_
reemplazar `BIBLIOTECA_COMPLETA` por un `throw` si `BibliotecaFichasSchema.safeParse(FICHAS)` falla;
borrar `avisoPrueba` y la clase `.aviso-prueba`. _Criterio:_ `pnpm gen:piramide` genera igual; con una
biblioteca inválida, el generador falla en vez de publicar.

**B12 — Comentarios caducados.** `.gitignore:6-8` nombra `CATALOGO-CONTACTO-VISUAL.html`;
`scripts/lib/catalogo-comun.mjs:1` dice «(S4: el del padre; S5: el de la mamá)»;
`content/contacto-visual.ts:4` («el documento que la mamá trabaja sin pantallas») y `:18` («el
generador corre con Node») ya no son ciertos: desde el S6 es fuente de trazabilidad y ningún generador
la importa. _Ajuste:_ `.gitignore:8` → `# LA-PIRAMIDE.html — scripts/copiar-documentos.mjs)`;
`catalogo-comun.mjs:1` → «(S4: el del padre; S6: el de la mamá, «La pirámide»)»; en
`contacto-visual.ts` cambiar solo el comentario de cabecera (no los datos) o, si se prefiere no tocar
el archivo, anotarlo en ADR 016 § Consecuencias. _Criterio:_ `git grep CATALOGO-CONTACTO -- .gitignore`
vacío.

**B13 — README sin la nota de Node ≥ 22.18 (plan, decisión 6) ni el comando nuevo.** `README.md:26-47`.
_Ajuste:_ tras el bloque de «Arranque», agregar «Requiere **Node ≥ 22.18** (`engines` en
`package.json`): los scripts `.mjs` importan `.ts` directamente.»; en la tabla de comandos, fila `pnpm
gen:piramide` → «Regenera `docs/LA-PIRAMIDE.html` (el documento de la mamá, `/mirada`) desde
`content/fichas.ts`». _Criterio:_ `grep -n "22.18\|gen:piramide" README.md` con dos resultados.

**B14 — Desviaciones sin declarar y una cifra inconsistente en la bitácora.** (a) La progresión de
juego llega a **T7** (`content/schema.ts:547`), más allá de «1 vuelta → papeles al revés con objeto» de
la enmienda (el anexo la trae; se declaró I1 pero no T7). (b) Respecto del plan aprobado, tres fichas
cambiaron de grupo sin declararse: lo-dejo-a-medias (atención conjunta → intención comunicativa,
`fichas.ts:1090-1091`), la-locion-despues-del-bano (atención conjunta → comprender, `:1542-1543`) y
me-meto-en-su-juguete (imitación → juego, `:618-619`); siguen el grupo principal del mapa, pero la
bitácora solo declara cucú y su-canción. (c) `sprints/SPRINT_006-implementation-log.md:26` dice «32
contra 23»; `:46` dice «32 contra 24» (lo real: 24). _Ajuste:_ agregar (a) y (b) a «## Desviación del
plan» y corregir `:26` a 24. _Criterio:_ la sección nombra las cinco fichas movidas y T7.

**B15 — «Espera ver» con un efecto que ninguna fuente de la ficha sostiene.** `content/fichas.ts:1613`
(«Que se calme más rápido cuando lo nombras»; la cápsula de origen no lo dice). _Ajuste:_ → «Que se
quede cerca de ti mientras nombras lo que siente, y que a veces repita tu sonido o tu cara.» _Criterio:_
regenerado; gate verde.

**B16 — La portada afirma un orden («antes de hablar se necesitan…») que el propio documento niega.**
`gen-la-piramide.mjs:230` y `docs/MANUAL-DE-USO.md:313`, mientras la lista de favoritos dice que ya usa
«tú», «hola» y «chao» (`gen-la-piramide.mjs:48-50`). _Ajuste:_ `:230` → «La pirámide tiene seis piezas:
<strong>señalar, imitar, comprender, atención conjunta, intención comunicativa y juego</strong>. No son
pisos…» (resto igual); `MANUAL:313` → «Está organizado por las **seis piezas de la pirámide**: …».
_Criterio:_ ni el documento ni el manual dicen «antes de hablar».

**B17 — Comprender no dice «lo que ya hace / lo que viene», aunque la portada lo anuncia para las
seis.** `content/schema.ts:437` contra `gen-la-piramide.mjs:254`. _Ajuste:_ el de B4 (b), que deja de
anunciarlo; o, si el usuario quiere la simetría, que él dicte en G-Contenido qué «ya hace» en
comprender. _Criterio:_ la frase de la portada y las seis descripciones coinciden.

**B18 — Tres fichas casi iguales en su acción central («nombra en una o dos palabras lo que hace o
mira»).** `content/fichas.ts:488` (comento-no-pregunto), `:537` (en-el-piso-con-su-juguete),
`:1360-1361` (lo-que-el-mira-yo-lo-nombro). Vienen del mapa aprobado; el riesgo es que la mamá crea
que son técnicas distintas. _Ajuste:_ `:537` → «Nombra lo que él hace con el juguete, de a una palabra,
como en «Comento, no pregunto»: «rueda», «tapa», «¡pum!».» _Criterio:_ decisión final en G-Contenido.

**B19 — Accesibilidad menor.** (a) Las 56 casillas se llaman todas «Revisada» (`gen-la-piramide.mjs:84`).
(b) En el índice, la prioridad se distingue solo por el grosor del borde (`:130` + CSS `:181`).
_Ajuste:_ (a) al `<input>` agregar `aria-label="Revisada: ${esc(f.titulo)}"` (el `getByLabel("Revisada")`
del e2e sigue encontrándola); (b) dentro del enlace prioritario, `<span class="solo-lector"> · prioridad
ahora</span>` con `.solo-lector { position:absolute; width:1px; height:1px; overflow:hidden;
clip:rect(0 0 0 0); white-space:nowrap; }`. _Criterio:_ axe verde; lector de pantalla anuncia la
prioridad y el título de cada casilla.

**B20 — El gate puede pasar en silencio.** `tests/unit/sensibilidad.test.ts:66` acepta cualquier archivo
inexistente (un error de ruta en `ALCANCE_GATE` pasaría verde), y `scripts/lib/sensibilidad.ts:77`
devuelve texto vacío si falta el marcador `desde` (de él depende que la sección del S6 del schema se
vigile). _Ajuste:_ en el test, `const PENDIENTES = ["sprints/SPRINT_006-summary.md",
"sprints/SPRINT_006-auditoria.md"];` y, si no existe, `expect(PENDIENTES).toContain(archivo); return;`;
y para alcances con marcadores, `expect(textoCompleto).toContain(marcador)` por cada marcador. _Criterio:_
cambiar un marcador o una ruta pone el test en rojo.

**B21 — «Todavía no es su momento» (juicio sobre el niño).** `content/fichas.ts:861`. _Ajuste:_ → «Hoy
no le llamó la atención: deja la taza a la vista en las meriendas y jueguen «Un paso más». No insistas
con lo de mentira.» _Criterio:_ regenerado; gate verde.

---

## 3. Casilla 4 — ¿qué frases caducaron?

Barrido por promesa aplazada (`todavía no` · `aún no` · `por ahora` · `de momento` · `mientras tanto` ·
`próximamente` · `llega(n) después` · `en esta versión` · `más adelante` · `no (se) puede` · `sin
embargo` · `podrás` · `permitirá` · `cuando vuelva` · `lo que viene`) sobre manual, README, guía,
brochure, export, documento generado, `content/fichas.ts` y el generador; más barrido de lo retirado
(registro, «Enviar a papá», «24 cápsulas», documento viejo) y de la copia de la app.

| Ubicación                                                            | Frase / tema                                                                                                           | Veredicto                                        |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| `MANUAL:162`, `:226`, `:269`, `:278`, `:298`                         | «más adelante», «todavía no las junta», «aún no tiene»                                                                 | Vigentes (features S1–S4 sin cambio)             |
| `MANUAL:322`                                                         | «lo que ya hace y lo que viene»                                                                                        | Vigente como descripción; ver B17                |
| `MANUAL:329`                                                         | semáforo                                                                                                               | **Caducó el matiz** → M1                         |
| `MANUAL:333`                                                         | «para verla en el momento»                                                                                             | **Parcialmente falsa** → B7                      |
| `MANUAL:419-421`                                                     | «cuando el niño vuelva a la app… se decide»                                                                            | Vigente (plan, sin promesa de feature)           |
| `GUIA:159`                                                           | «Todo se hace en el computador»                                                                                        | **Falsa para el bloque Q** → B10                 |
| `GUIA:183`                                                           | «Son 25»                                                                                                               | **Falsa (23)** → B10                             |
| `GUIA:326, 340, 488, 602, 689, 703, 735, 771, 871`                   | copy de pruebas S1–S4                                                                                                  | Vigentes                                         |
| `GUIA:809`                                                           | «mientras tanto» (Q3)                                                                                                  | Vigente                                          |
| `BROCHURE:1231, 1661`; `export:6`                                    | «aún no tiene», «no se puede»                                                                                          | Vigentes; no mencionan el documento              |
| `LA-PIRAMIDE` (descripciones por grupo)                              | «lo que viene es…» ×5                                                                                                  | Vigentes (dirección sin plazo); comprender → B17 |
| `fichas.ts:266, 742, 848`                                            | «más adelante» dentro de la ficha                                                                                      | Vigentes                                         |
| `fichas.ts:861`                                                      | «Todavía no es su momento»                                                                                             | Juicio → B21                                     |
| `gen-la-piramide.mjs:146-147`                                        | «Las fichas reales llegan cuando…»                                                                                     | Rama muerta → B11                                |
| `decisions/016:43-44`                                                | «además de lo que ya vigilaba del S5»                                                                                  | **Falsa** → M6                                   |
| `.gitignore:6-8`; `catalogo-comun.mjs:1`; `contacto-visual.ts:4, 18` | nombres del documento viejo                                                                                            | Caducados → B12                                  |
| README                                                               | sin coincidencias                                                                                                      | Falta la nota de Node → B13                      |
| Registro / «Enviar a papá» / «24 cápsulas» / documento viejo         | solo en historial, bitácoras, summary y propuesta del S5, ADR 016, manual `:331, :424` y guía `:913-916` como historia | Vigentes (declaradas como pasado)                |
| App (`src/`)                                                         | ninguna copia visible menciona el documento o el registro                                                              | Vigente                                          |

---

## 4. Casilla 5 — campos sin consumidor

| Campo / export nuevo                                                                                                                                                                      | Lectores fuera de su construcción y sus tests    | Veredicto                                                                |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------ |
| `Ficha.id` · `grupo` · `tecnica` · `titulo` · `tenALaMano` · `haz` · `tuLinea` · `esperaVer` · `funcionoSi` · `siNoPasa` · `duracion` · `momentos` · `conQuien` · `progresion` · `fuente` | `gen-la-piramide.mjs:81-116`                     | Con consumidor                                                           |
| `Ficha.origen.de` · `origen.refs`                                                                                                                                                         | `gen-la-piramide.mjs:76-78, 115` (modo revisión) | Con consumidor                                                           |
| **`Ficha.prioridad`**                                                                                                                                                                     | ninguno (solo el refine `schema.ts:634`)         | **Huérfano → B1**                                                        |
| **`CAEN_DEL_DOCUMENTO`**                                                                                                                                                                  | solo `tests/unit/fichas.test.ts`                 | **Sin consumidor de producto → B2**                                      |
| **`CAEN_DEL_DOCUMENTO[].razon`**                                                                                                                                                          | ninguno                                          | **Huérfano → B2**                                                        |
| `NOMBRE_GRUPO` · `DESCRIPCION_GRUPO` · `ORDEN_DOCUMENTO` · `GRUPOS_PRIORITARIOS` · `NOMBRE_TECNICA_FICHA` · `PROGRESIONES`                                                                | generador                                        | Con consumidor                                                           |
| `PRIORIDADES` · `TECNICAS_FICHA` · `CON_QUIEN_FICHA` · `ORIGENES` · `MIN_FICHAS` · `MIN_POR_GRUPO`                                                                                        | el schema (enums y topes)                        | Aceptable (constantes del contrato)                                      |
| Tipos `Prioridad` · `ConQuienFicha` · `OrigenFicha`                                                                                                                                       | ninguno                                          | Export sin uso, inocuo (se puede quitar `export`)                        |
| `nombreDe` · `N_MAX` (gate)                                                                                                                                                               | `tests/unit/sensibilidad.test.ts`                | Son piezas del gate: correcto                                            |
| Dominio del S5 (`CAPSULAS_CONTACTO_VISUAL` y su schema)                                                                                                                                   | solo tests desde el S6                           | Huérfano **por diseño y declarado** (ADR 016 §2: fuente de trazabilidad) |

Resultado: 16 de 17 campos de `Ficha` con lector; 1 huérfano. `CAEN_DEL_DOCUMENTO`: 0 de 2 campos con
lector de producto.

---

## 5. Casilla 6a — la guía heredada contra la arquitectura · Casilla 6b — números cableados

### 6a

| Bloque (origen)       | Qué exige                         | ¿Lo permite la arquitectura de hoy?                                                        |
| --------------------- | --------------------------------- | ------------------------------------------------------------------------------------------ |
| A–H, J–L, N–O (S1–S4) | la app del niño                   | Sí: el S6 no cambió la app; la subida de framework la cubren los e2e de la CI en verde     |
| H (borrar datos)      | recarga completa tras borrar      | Sí: `estado-local.ts:151-154` conserva el comportamiento, solo agrega la excepción de lint |
| I (S2/S4)             | `docs/CATALOGO-CAPSULAS.html`     | Sí: existe                                                                                 |
| M (S4)                | `docs/kit-de-prueba/`             | Sí: existe                                                                                 |
| P (S5)                | el registro y el documento viejo  | Retirado y **declarado** (`GUIA:913`); P1 → Q1 y P7 → Q6 como «Mejorado en S6»             |
| Q (S6)                | `/mirada`, `?revision`, impresión | Sí                                                                                         |
| Diferido (tablet)     | tablet                            | Sí (sigue diferido)                                                                        |

Ninguna prueba heredada pide algo que el producto prohíba hoy o un estado que ya no exista. Los dos
defectos de la guía son de su cabecera, no de sus pruebas (B10).

### 6b

La orden fija los grupos («Los seis valores de `grupo` son fijos»), así que «seis» es un literal
permitido; la VISION no declara ninguna entidad de este sprint como extensible solo con datos. El
código que cuenta fichas deriva de los datos (pie, conteo por grupo, «N de M revisadas»). No hay
hallazgo Alto. Quedan literales menores —prioritarios «tres» en prosa y e2e, «56» en guía y manual sin
guardia, la lista de grupos duplicada en el e2e, `toHaveLength(74)` redundante en
`tests/unit/fichas.test.ts:232`— reunidos en **B4**.

---

## 6. Herramientas y dependencias

Sin casos fuertes. La subida de `next`/`eslint-config-next` a 16.3.6 y los candados de `sharp`,
`js-yaml` y `vitest` responden a avisos de seguridad publicados entre merges y están documentados
(`pnpm-workspace.yaml:32-33`, bitácora `:88-102`); la CI quedó en verde.

---

## 7. Recomendación

**Requiere ajustes.** Cero críticos · **1 alto** (A1) · **6 medios** (M1–M6) · **21 bajos** (B1–B21).
Todos son pagables en la Fase 2 con el texto exacto de este reporte; ninguno exige tocar la app ni las
50 cápsulas. Tras los pagos: `pnpm gen:piramide`, `pnpm test`, `pnpm typecheck`, `pnpm lint`, e2e de
`/mirada`, gate de cero enlaces, y **repetir la casilla 4** sobre el diff de la Fase 2 (summary
incluido).

_Aprueba la Fase 1 y fija el modelo de la Fase 2 con `/model` (un modelo menor basta si sigue este
plan)._

---

## Fase 2 — pagos (2026-09-27)

Autorización: la orden de fase 2 del usuario pide «Termina con /audita-sprint (todos los hallazgos
pagados)»; la Fase 2 corrió sin parada intermedia, siguiendo este plan al pie. **Pagados los 28; deuda
aceptada: ninguna.** Desviaciones del plan, declaradas: M2 dice «las preguntas que respondes tú» (sin
«misma», copy neutro); B12 no toca `content/contacto-visual.ts` (sus 24 no se tocan): la nota va en
ADR 016 § Consecuencias, la alternativa que el plan dejaba.

| Hallazgo | Pago | Verificación |
| --- | --- | --- |
| A1 | Edades fuera de `PROPUESTA-006` (dos líneas), `SPRINT_005-summary`, `SPRINT_005-implementation-log` y `PROPUESTA-005`. Guardia nueva en `tests/unit/sensibilidad.test.ts` («gate: ninguna edad escrita…», sus ejemplos armados por partes) | **Rojo** con los archivos como estaban: 4 archivos, 5 líneas → **verde** tras el pago. Merge con squash: queda para el merge (el commit `c41884e` no entra a la historia de `main`; la historia vieja de `main` es decisión del usuario) |
| M1 | Semáforo condicionado («para salirse del juego») en portada, «Qué no hacer» y manual; el cucú dice «aquí taparse es el juego» | `grep -c "para salirse del juego"` en el documento = 2 |
| M2 | Regla 5: las preguntas que se responden solas son juego; «Funcionó si» nunca armado | la frase está en el documento |
| M3 | Las reglas del hermano: «sus reglas de siempre» en la regla 7 y en la ficha «Con el hermano»; la de «Se lo lleva al hermano» dice «además… para este juego» | `grep -c "tres reglas"` en el documento = 0 |
| M4 | `hasOwnProperty` en vez de `in` | test nuevo **rojo** con `in`, verde después |
| M5 | Nueve pasos compuestos partidos o movidos (dos iguales, ahora yo, marchar con algo, dos pasos, carro, de mentira, mira lo que traigo, cara de pregunta, canción de siempre) | schema (3–5 pasos, topes) y e2e verdes |
| M6 | `content/contacto-visual.ts` vuelve al gate; comentario del alcance corregido | caso nuevo del gate en verde |
| B1 | `esPrioritario` lee `prioridad` de las fichas | documento idéntico en prioridad; e2e verde |
| B2 | Modo revisión: «Quedaron fuera del documento (11)» con id y razón | e2e: visible con `?revision`, oculto sin él |
| B3 | Unit «docs/LA-PIRAMIDE.html está regenerado» (ids, «Funcionó si», número de fichas) | **rojo** con el documento viejo y la biblioteca nueva, verde tras regenerar |
| B4 | e2e toma `GRUPOS` y `GRUPOS_PRIORITARIOS` del schema; portada sin «tres»; `CAPSULAS_DEL_MAPA` como constante con su razón; unit de conteos del manual y la guía | unit y e2e verdes |
| B5 | Las fichas «con la mamá» ya no exigen al hermano («si está cerca», «si juega») | lectura |
| B6 | «Funcionó si» del frasco sin conteo en palabras | lectura |
| B7 | Manual: «mientras juegan —algunas, en los días siguientes—» | lectura |
| B8 | Sin «aunque se sienta eterno» | lectura |
| B9 | Tres pausas con su cierre («si no, dásela / vuelve a marchar / arranca igual») | lectura |
| B10 | Guía: «Son 23» (contadas: 23 ⭐ antes del bloque Q) y «salvo el bloque Q, en tu teléfono» | conteo |
| B11 | El generador falla si la biblioteca no cumple; sin rama «Versión de prueba» ni su CSS | `pnpm gen:piramide` genera igual |
| B12 | `.gitignore` y `catalogo-comun.mjs` al día; nota en ADR 016 | `git grep CATALOGO-CONTACTO -- .gitignore` vacío |
| B13 | README: Node ≥ 22.18 y `pnpm gen:piramide` | dos resultados en el grep |
| B14 | Bitácora: T7 y las tres fichas movidas declaradas; «32 contra 24» | lectura |
| B15 | «Espera ver» de «Ponle nombre…» sin efecto no sostenido | lectura |
| B16 | Portada y manual sin «antes de hablar» | grep vacío en documento y manual |
| B17 | Pagado con B4: la portada ya no anuncia «lo que ya hace y lo que viene» para las seis; el manual tampoco | lectura |
| B18 | «En el piso…» remite a «Comento, no pregunto» | lectura |
| B19 | Cada casilla con su título (`aria-label`); la prioridad del índice también para lector de pantalla | axe verde |
| B20 | El gate exige que solo falte el summary y que cada marcador exista | **rojo** al romper un marcador del manual, verde al reponerlo |
| B21 | «Hoy no le llamó la atención» | lectura |

**Casilla 4, segunda pasada (sobre el diff de la Fase 2).** El vocabulario de promesa aplazada no
aparece en ninguna línea nueva. Siguiendo cada pago hasta sus frases hermanas salieron tres más, y se
pagaron: la ficha «Con el hermano» decía «tres reglas» (ahora «sus reglas de siempre», como la regla
7); el manual prometía «lo que ya hace y lo que viene» para cada grupo (ahora «una frase por grupo, en
lo que se ve»); y la Q6 de la guía no nombraba la lista nueva de lo que quedó fuera (ahora la cita
literal). El summary aún no existe: la casilla se repite sobre él al escribirlo.

**Resultado tras los pagos:** 359 unit · typecheck · lint · 16/16 e2e de `/mirada` · gate verde · capturas
en Pixel 7 releídas (portada, modo revisión con la lista nueva; `scrollWidth` 412 = 412).
