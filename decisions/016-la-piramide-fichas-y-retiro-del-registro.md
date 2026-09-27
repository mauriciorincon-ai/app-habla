# ADR 016 — La pirámide: una biblioteca de fichas de actividad con origen trazable, y el retiro del registro

- **Status:** accepted (2026-09-27, Sprint 006 — decisiones del plan aprobado; el gate ampliado
  nació en rojo en el mismo commit, regla 15 del kit).
- **Sprint:** 006 «La pirámide» (segundo de H2, bifurcación pedida por el usuario).
- **Reemplaza en parte:** ADR 015 § Consecuencias (el contrato del registro deja de existir).
- **Archivos:** `content/fichas.ts`, `content/schema.ts` (sección «LA PIRÁMIDE»),
  `scripts/gen-la-piramide.mjs`, `docs/LA-PIRAMIDE.html`, `scripts/lib/sensibilidad.ts`.

## Contexto

Tres semanas después del documento del S5, la mamá trae una pirámide de seis piezas («antes de
hablar se necesita: señalar · imitación · comprender · atención conjunta · intención comunicativa ·
juego») y el usuario pide revisar TODAS las cápsulas —las 24 de la mirada y las 50 de habla—,
organizarlas por esos seis grupos, reescribirlas como actividades en instrucción directa y
personalizarlas con lo que al niño ya le gusta. Además: **a la mamá no le resultó factible llevar el
registro diario**, y no hay registros. La investigación privada del S6 y su mapa de las 74 fueron aprobados
en G-Investigación.

## Decisión

1. **Una biblioteca nueva, `content/fichas.ts`, con su schema propio (`FichaSchema`).** Cada ficha:
   `grupo` (seis fijos) · `prioridad` (alta solo en imitación, atención conjunta y juego) ·
   `tecnica` (etiqueta) · `tenALaMano[]` · `haz[]` (3–5 pasos) · `tuLinea` · `esperaVer` ·
   `funcionoSi` (sin números: ni conteos, ni plazos) · `siNoPasa` · `duracion` · `momentos[]` ·
   `conQuien` (mamá | hermano; si es el hermano, la ficha dice qué hace él) · `progresion`
   opcional (solo pasos aprobados de SU grupo; intención comunicativa no tiene) · `origen` ·
   `fuente`. `BibliotecaFichasSchema`: piso 20 · seis grupos con fichas · los tres prioritarios,
   juntos, pesan más que los otros tres.
2. **Origen trazable, y las 24 y las 50 se quedan como están.** `origen = { de, refs }` con
   `mirada:<id>` · `habla:<id>` · `anexo:<X-Yn>`. Un unit comprueba que cada ref apunta a una
   cápsula que existe, y que el mapa se ejecutó entero: cada una de las 74 tiene destino (una
   ficha, o la lista de las que caen del documento con su razón). En noviembre, la app puede
   reconciliar las dos bibliotecas sin adivinar.
3. **Generador nuevo `gen-la-piramide.mjs`** → `docs/LA-PIRAMIDE.html`, servido en `/mirada`. El
   generador y el documento del S5 se eliminan (la historia los guarda). Cero JS salvo el modo
   revisión; el documento no escribe nada en el teléfono de la mamá.
4. **El registro se retira entero:** formulario, panel, «Enviar a papá», «Guardar registro»,
   cuadrícula impresa, `content/registro-contacto-visual.ts` y sus pruebas. La señal de que una
   actividad sirvió vive dentro de cada ficha («Funcionó si…»), observable y sin puntaje.
5. **Gate de sensibilidad ampliado:** lista de 483 términos (hashes regenerados) y n-gramas de 1 a
   **5** palabras (la lista trae términos de cinco). Alcance: todo lo del S6 (biblioteca,
   documento, generador, pruebas, bitácora, summary, auditoría, propuesta, esta ADR, secciones
   `s6:` de la guía y el manual) además de lo que ya vigilaba del S5.

## Alternativas descartadas

- **Reescribir las 24 y las 50 en su sitio:** las 50 alimentan «Hoy» en la app y la app no cambia
  hasta noviembre; tocar su contenido rompía esa promesa y perdía la trazabilidad.
- **Parametrizar el generador del S5:** el documento cambia de forma (ficha de actividad), de
  organización (grupos, no peldaños) y pierde el registro; un generador con dos formas no ayuda.
- **Mantener el registro «por si acaso»:** una pieza que la mamá no opera es peso muerto y ruido en
  el documento; la lección del S5 es que quien prueba no es quien usa.
- **Dejar `N_MAX` en 4:** tres términos de la lista no se cazarían nunca.

## Consecuencias

- La app y sus 50 cápsulas no cambian; tampoco las 24 del S5, que quedan como fuente.
- El mapa ejecutado da **56 fichas** (imitación 12 · atención conjunta 7 · juego 13 · señalar 4 ·
  intención comunicativa 10 · comprender 10) y **11 cápsulas de la app caen del documento**
  (5 necesitan la pantalla · 4 son de la etapa siguiente · 2 quedaron como reglas del «Qué no
  hacer»); siguen intactas en la app.
- El documento de la mamá no guarda datos en su teléfono: no hay nada que exportar ni perder.
- Cuando la lista de términos cambie, se regenera el fixture con `scripts/gen-sensibilidad-hashes.mjs`.
- Los scripts `.mjs` que importan `.ts` exigen Node ≥ 22.18 (`engines` en `package.json`).
