# Sprint 006 — «La pirámide» · Bitácora de implementación

> App: habla · Branch: `sprint-006/la-piramide` · Orden: `portafolio/habla/ordenes/SPRINT_006-orden.md`
> (planeadora, RO) + enmienda del 2026-09-27 (G-Investigación APROBADA, fase 2 habilitada).
> Regla de la casa: aquí solo hay comportamiento observable; ningún término de la lista de
> sensibilidad, ningún nombre, ninguna edad, ningún lugar. El gate lo vigila también en esta bitácora.

## Estado por fase

- [x] F0 — Estructura: delta del kit v1.31.0 · registro retirado entero · schema de la ficha ·
      generador y `/mirada` · gate ampliado con su rojo en el mismo commit · B4 · guía (bloque P
      fuera, bloque Q) · manual · ADR 016
- [ ] F2 — Contenido: ejecutar el mapa de las 74 · fichas · capturas · `/audita-sprint` (todo pagado)
- [ ] STOP → G-Contenido del usuario (lee TODO el documento)
- [ ] Cierre: `/deploy-check` · summary EN el PR · CI por check · merge a su orden · homepage

## Decisiones de diseño (declaradas en el plan aprobado)

1. **Biblioteca propia, `content/fichas.ts`, con `FichaSchema`** al final de `content/schema.ts`.
   Las 24 del S5 (`content/contacto-visual.ts`) y las 50 de la app (`content/capsulas.ts`) no se
   tocan: son las fuentes, y `origen` (`mirada:` · `habla:` · `anexo:`) las deja trazables.
2. **Prioridad por agregado:** el mapa aprobado pone 7 fichas en atención conjunta y 10 en
   comprender (señalar vive junto a atención conjunta). La regla «cada prioritario ≥ cada no
   prioritario» contradecía el mapa; queda **«los tres prioritarios, juntos, llevan más fichas que
   los otros tres juntos»** (la lectura del mapa: 32 contra 23).
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
