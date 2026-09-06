# ADR 015 — Un segundo dominio de cápsulas («contacto visual») y el gate de sensibilidad por hashes

- **Status:** accepted (2026-09-06, Sprint 005 — decisiones 1 y 5 del plan aprobado; el gate
  nació en rojo en el mismo commit, regla 15 del kit).
- **Sprint:** 005 «Contacto visual» (primero de H2, bifurcación pedida por el usuario).
- **Complementa:** `content/schema.ts` (dominio nuevo al final), `scripts/lib/sensibilidad.ts`,
  `tests/unit/sensibilidad.test.ts`, `tests/fixtures/sensibilidad-hashes.json`.

## Contexto

Hasta noviembre el niño no tiene pantalla: la mamá trabaja a diario con un documento impreso o en
su teléfono, y quiere el contacto visual por encima del habla. El sprint produce **un documento**
(`/mirada`) con cápsulas de otro dominio, generadas del contenido estructurado como las 50 de
habla. Dos restricciones lo atraviesan: (1) las 50 cápsulas de habla y sus tests no se tocan; (2)
este repo es **público** y la investigación que sustenta las cápsulas nombra condiciones y
poblaciones — nada de eso puede aparecer aquí: ni en cápsulas, ni en el catálogo, ni en
bitácoras, ni en las citas (los títulos y algunas revistas nombran poblaciones).

## Decisión

1. **Dominio como schema hermano, no como campo del schema de habla.** La orden pedía
   `dominio: "habla" | "contacto-visual"`. Añadirlo al `CapsulaSchema` de habla cambia el tipo
   `Capsula` y obliga a tocar las 50 (`Omit<Capsula, "etiquetas">`). En su lugar:
   `CapsulaContactoVisualSchema` lleva `dominio: z.literal("contacto-visual")` como discriminante,
   sus propias técnicas (6), niveles (N1–N6), momentos, `conQuien`, `queNoHacer`, `fuente` y
   `conPantalla: literal false`; `CapsulaDeDominio` es el union que consumirá la app en el segundo
   paso. `BibliotecaContactoVisualSchema` codifica lo que la investigación justifica (18–24,
   3–4 por técnica en niveles distintos, seis niveles, N5 con otra persona). Las 50 de habla
   quedan byte a byte iguales.
2. **Gate de sensibilidad por hashes, acotado por diseño.** La lista de términos vive en la
   planeadora (privada). Al repo viaja solo `tests/fixtures/sensibilidad-hashes.json` (SHA-256 de
   cada término normalizado: minúsculas, sin acentos, no-alfanumérico → espacio). El test arma los
   n-gramas de **1 a 4** palabras (la orden decía 1–3; un término aprobado tiene cuatro) de todo lo
   que el sprint publica —contenido, catálogo generado, scripts, tests, bitácora, summary,
   propuesta, y las secciones S5 de la guía y el manual entre marcadores `s5:inicio`/`s5:fin`— y
   exige cero coincidencias, reportando solo archivo, línea y tamaño del n-grama. El resto del
   repo lo cubre un **informe** que reporta y no falla (lo previo al sprint lo decide el usuario).
3. **Citas públicas «Autor, año, Revista» — y «Autor, año» cuando la revista describe a quién se
   estudió** (regla A, fijada por el usuario tras el hallazgo del gate en la fase 0). El schema lo
   acepta con una expresión regular sin título.

## Alternativas descartadas

- **`dominio` con default en el schema de habla:** tocaba las 50 cápsulas y sus tests por un campo
  que en habla no discrimina nada.
- **Lista de términos copiada al repo (aunque fuera en un test):** el repo es público y la lista
  ES el contenido que no puede publicarse.
- **Gate sobre todo el repo desde el primer día:** el informe encontró 111 coincidencias en 31
  archivos previos (vocabulario genérico de salud en los anti-claims de la app, skills del kit, el
  diccionario de 10 000 palabras…); ponerlas en rojo habría bloqueado el sprint por textos que no
  son suyos y cuya decisión es del usuario.
- **Parametrizar el generador del catálogo de habla:** el documento de la mamá tiene otro lector,
  otro encuadre y un registro adentro; un generador hermano con `scripts/lib/catalogo-comun.mjs`
  para lo compartido evita un generador con dos personalidades.

## Consecuencias

- El segundo paso (traer las cápsulas a «Hoy» en la app, tras la observación de noviembre)
  consume `CapsulaDeDominio` y el contrato del registro (`RegistroExportSchema`) sin cambiar el
  schema de habla.
- Cuando la lista de términos cambie, se regenera el fixture con `scripts/gen-sensibilidad-hashes.mjs`
  (la lista sigue en la planeadora); los scripts `.mjs` que importan `.ts` exigen Node ≥ 22.18.
- El gate se documenta sin escribir jamás un término: esta ADR tampoco.
