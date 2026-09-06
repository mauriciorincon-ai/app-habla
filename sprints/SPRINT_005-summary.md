---
sprint: 005
app: habla
feature: contacto-visual-documento-primero
estado: listo para cierre — /audita-sprint EJECUTADO en 2 fases (0 críticos · 0 altos · 1 medio + 3 bajos pagados · 2 bajos como deuda) · G-Contenido APROBADO (24 cápsulas, «excelente») · ⭐ del registro en el teléfono real: BUENO (se queda) · deploy-check MERGE OK · CI verde. Falta: merge del PR #13 (a orden del usuario) → re-verificar el homepage de GitHub tras el deploy → /cierre-sprint.
fecha: 2026-09-06
ciclo: H2 (sprint 1 — bifurcación pedida por el usuario; el backlog planeado de H2 se corre un turno)
---

# Sprint 005 — «Contacto visual» (documento primero, app después) · Summary

> Primer corte de H2 de **Hablemos San**, nacido de una **bifurcación** del usuario (regla suya:
> lo que llega fuera del camino estructurado se vuelve el siguiente sprint; lo planeado se corre).
> Hasta mediados de noviembre el niño no tiene pantalla: la mamá trabaja a diario con un documento,
> y quiere el **contacto visual** por encima del habla. Este sprint produce **ese documento** —
> `/mirada`, «Mirarse jugando» — con 24 cápsulas de un dominio nuevo, un registro que vive solo en
> su teléfono, y un gate que garantiza que **ningún término sensible** sale a este repo público.
> **La app del niño no cambió.** Sexto sprint con cero IA.

## Qué se entregó (contra los 3 outcomes)

| Outcome | Estado | Evidencia |
|---|---|---|
| **O1 · Investigación aprobada** (vive en la planeadora, privada) | ✅ | G-Investigación 2026-09-06: 6 técnicas graduadas, progresión N1–N6, registro A/B/C (enmienda), lista de términos aprobada. |
| **O2 · Cápsulas como progresión + catálogo en ruta propia + registro en el teléfono** | ✅ | `content/contacto-visual.ts` (24) · `docs/CATALOGO-CONTACTO-VISUAL.html` generado y servido en `/mirada` · registro A/B/C probado en el teléfono real del usuario («bueno», se queda) · **G-Contenido aprobado** («muy bien, apropiadas, orientadas al juego», «excelente» tras la corrección del hermano). |
| **O3 · Gate de sensibilidad por hashes, verificable por comando, demostrado en rojo** | ✅ | `tests/unit/sensibilidad.test.ts` (24 tests) sobre `tests/fixtures/sensibilidad-hashes.json` (105 términos, 92 hashes); rojo en el mismo commit con el término de prueba de la lista (2 coincidencias: catálogo y contenido), verde al retirarlo. El informe del resto del repo: 111 coincidencias en 31 archivos previos, **reportadas, no tocadas**. |

**El documento, en una línea:** portada con encuadre («Esto no es una prueba», dosis en momentos
cortos de 5–30 min, «descansar también cuenta»), el semáforo (si aparta la vista, se tapa la cara
o se irrita: parar), «Cómo se usa», la escalera de seis peldaños descrita por lo que la mamá ve,
las seis maneras con su fuerza de evidencia a la vista, «Qué no hacer» en observable, las cápsulas
agrupadas por peldaño con su botón «Registrar este momento», el panel «Mis registros» («Enviar a
papá» con ejemplos y nunca números · «Guardar registro» JSON · borrar en dos toques), y una
cuadrícula semanal que solo aparece al imprimir. Modo `?revision` solo para el papá.

## Cuántas cápsulas y por qué esa cantidad

**24 — el techo que fija la investigación aprobada** (§4: 18–24; «más de 24 empieza a ser
variaciones sin evidencia propia») y que el schema hace cumplir. Seis técnicas × su escalera,
cada cápsula en un nivel distinto dentro de su técnica y anclada a UNA actividad que describen las
fuentes (dos juguetes iguales · cosquillas con pausa · el globo en la boca · cucú cuando se tapa él ·
«¡alto!… ¡ya!» con el carro · burbujas y espera · el frasco que no abre · lo dejo a medias · una
media puesta · sigo su ritmo · su canción con hueco · una estrofa más · la loción del baño · y las
cinco con el hermano). Distribución: T1 N1·N2·N4·N5 · T2 N1–N4 · T3 N2–N5 · T4 N2·N3·N4·N6 ·
T5 N1·N2·N3·N6 · T6 N3·N4·N5·N6. El usuario pidió más: se revisó contra la evidencia y se llegó
al techo con una sola cápsula más (el peldaño 4 de la técnica 6); más allá sería repetir.

## La decisión del registro

**Se queda.** Condición del usuario: «si no queda fácil en el teléfono real, se descarta con la
razón». Probó el bloque P de la guía sobre la preview del PR: «el resultado del teléfono es
bueno». Formato A/B/C de la enmienda: no se puntúa al niño; se registra lo que hizo la mamá, se
marca —sin contar— lo que vio, y cómo estuvo él (la casilla de asentimiento). Solo `localStorage`
(`registro-mirada-v1`); sale del teléfono únicamente cuando ella lo envía (texto con ejemplos) o
lo guarda (JSON versionado, contrato en `content/registro-contacto-visual.ts`, validado por e2e).
La cuadrícula impresa queda como respaldo en papel.

## Corrección del usuario en el G-Contenido

**La «otra persona» es el hermano (16 años), no papá:** papá no está con el niño hasta noviembre;
en la casa están la mamá y el hermano. Las cinco cápsulas donde papá hacía la rutina pasaron al
hermano, guiado por la mamá en una frase; la técnica 6, el nivel 5 y la portada dicen «el hermano,
quien viva en la casa». «Enviar a papá» se queda: es el resumen que la mamá le manda a él.

## Definition of Done — los 6+1

| Gate | Estado | Evidencia |
|---|---|---|
| **1. Testing** | ✅ | **304 unit** (261 previas + 43: schema del dominio con cada constraint en rojo · biblioteca real contra su contrato · id kebab-case · registro (zod) · sensibilidad con normalización, n-gramas, recorte por marcadores y rojo demostrado) — cobertura 91 % stmts / 86 % branches. **185 e2e** (169 previas + 16 de `/mirada` en móvil y escritorio: ruta, validación, persistencia al recargar, descarga validada contra el contrato, compartir con ejemplos y sin números, entrada rota tolerada, borrar en dos toques, `?revision`, axe). |
| **2. CI/CD** | ✅ | quality · e2e · lighthouse verdes en el PR #13 en cada push (la primera CI cazó advisories ajenas al sprint — ver deuda). `/mirada` entró a `lighthouse-urls.json`. |
| **3. Observabilidad** | ✅ (sin cambios) | El documento no tiene Sentry ni red: es HTML autocontenido. El registro jamás sale solo. |
| **4. Seguridad** | ✅ | `pnpm audit --audit-level high` limpio (candados `browserslist@4 ^4.28.7` y `fast-uri@3 ^3.1.6`). Cero secrets (gitleaks en cada commit). **Gate de sensibilidad** verde sobre todo lo publicado por el sprint, bitácora y este summary incluidos; la historia de la rama se reconstruyó limpia cuando el gate cazó revistas con nombre de población en commits aún no subidos. Cero enlaces: grep vacío. |
| **5. Performance** | ✅ | La app no cambió (`src/` sin diff): bundles idénticos a `main`. `/mirada` es un HTML estático de ~170 KB sin JS externo; Lighthouse verde en CI. |
| **6. UX/A11y** | ✅ | axe limpio en `/mirada` con el registro abierto · toques ≥44 px · sin límite de tiempo · nada comunica solo con color (chips con texto) · legible en Pixel 7 sin zoom (capturas leídas como imagen en cada regeneración) · imprimible. |
| **7. IA embebida** | **N/A** | Cero LLM, cero SDK — sexta vez consecutiva. |
| **Manual de uso** | ✅ | Sección «El documento de contacto visual — para trabajar sin pantallas», FAQ e historial 005 (entre marcadores `s5:inicio`/`s5:fin` para el gate). |
| **Guía de prueba viva** | ✅ | v5 acumulativa: hereda las v4 ENTERAS (S4 pasa a regresión), bloque **P** (7 pruebas ⭐ del registro en el teléfono + `?revision`), historial. Elimina: nada. **Ejecutada por el usuario** en su teléfono. |
| **Revisión de diseño** | ✅ | Tokens del `design-system.md` vía `scripts/lib/catalogo-comun.mjs`; claro/oscuro; capturas revisadas. Aprobación del usuario: contenido («excelente») y teléfono («bueno»). |
| **Brochure + export** | ✅ (no se tocan) | El documento no es una feature del producto; el conteo del manual no cambió. Criterio de la orden. |

## ADRs de este sprint

| # | Tema |
|---|---|
| 015 | **[ACCEPTED 2026-09-06] Un segundo dominio de cápsulas como schema hermano (sin tocar las 50 de habla) y el gate de sensibilidad por hashes acotado por diseño**, con la regla de citas «Autor, año, Revista» / «Autor, año». |

## Auditoría final (`/audita-sprint`, 2 fases — ejecutada, aprobada por el usuario)

**Fase 1 (solo lectura):** alcance completo o completo con desviación declarada; **0 Críticos ·
0 Altos · 1 Medio · 5 Bajos**; ninguna afirmación pública caducó; el contrato del registro no
tiene importador fuera del e2e **por diseño** (segundo paso). **Fase 2 («ejecuta» del usuario):**
**M1** el panel del registro tolera entradas rotas (validación de forma y versión al leer; pintura
inicial al final y protegida) con e2e en rojo demostrado sobre el catálogo anterior · **B2** id de
cápsula kebab-case estricto · **B3** comentario del schema corregido · **B5** la PROPUESTA anota
que la enmienda superó el registro de tres toques. **Deuda declarada:** B1 · B4 (abajo).

## Desviaciones declaradas (todas en la bitácora)

1. **`dominio` no se añadió al schema de habla** (discriminante literal en el dominio nuevo) — para
   no tocar las 50.
2. **n-gramas 1–4, no 1–3:** un término aprobado tiene cuatro palabras.
3. **Citas:** «Autor, año» cuando la revista describe a quién se estudió — hallazgo del gate en la
   fase 0, regla fijada por el usuario (opción A).
4. **Gate acotado al S5 + informe del resto:** el criterio de aceptación decía «todo lo público»;
   la propia lista acota el gate; lo previo (111/31) es decisión del usuario, aparte.
5. **Historia de la rama reconstruida** antes del primer push (tres commits recompuestos) para que
   ningún commit público llevara nombres de revista que describen poblaciones.
6. **Cero pantalla por literal** (`conPantalla: false`) aunque el usuario anticipa que «en su
   momento» querrá al niño en la app: eso es el segundo paso, no este documento.

## Deuda técnica explícita

- **B1 · el compartir no cae al portapapeles** si el compartir del teléfono rechaza por algo
  distinto a cancelar. Pago: primer sprint que toque el documento.
- **B4 · Node ≥ 22.18** para los scripts `.mjs` que importan `.ts` (generador, hashes, informe):
  no documentado en `engines`; la CI no los corre. Pago: junto a B1.
- **Importador del registro:** el JSON tiene contrato y e2e, y ningún lector en la app todavía.
  Pago: el segundo paso, tras la observación de noviembre.
- **111 coincidencias en 31 archivos previos al sprint** (informe de sensibilidad): vocabulario de
  salud en anti-claims de la app, skills del kit, el diccionario embebido, bitácoras viejas. Se
  revisan con el usuario, archivo por archivo, sin escribir términos. No bloquea.
- **Advisories entre merges:** `browserslist` y `fast-uri` pusieron la CI en rojo el día del PR
  sin que el sprint tocara dependencias; candados con caret (patrón S4). Se revisan al subir mayores.

## Lo desplazado (backlog del S4 en su orden — NO entró; se corre un turno)

- **ALTA:** ítem 2 (qué pasa al agotar la etapa) · ítem 1 (histórico navegable + «reforzar esta»)
  · ítem 3 (pantalla que explique las técnicas).
- **MEDIA:** ítem 8 (sonidos de ambientación) · ítem 7 (filtro por tono niño/adulto).
- **BAJA:** ítem 5 (obstáculos del globo) · ítem 6 (despegue del globo) · ítem 4 (ordinales,
  bloqueado) · ítem 9 (alerta dos-casas, bloqueado).

## Lo pendiente, visible

- **Las 3 decisiones abiertas de H2** (del summary del S4, son del usuario): (a) ordinales en las
  etapas · (b) sincronización entre las dos casas · (c) revisión de la regla dura 2 (la voz).
- **Observación de noviembre:** cuando el niño vuelva, se observa con la mamá qué peldaño ocurre
  «la mayoría de las veces» y se decide el segundo paso (traer las cápsulas a «Hoy»; importar el
  JSON del registro).
- **Blueprint:** `docs/BLUEPRINT.html` documenta la infraestructura del ciclo H1; el documento
  `/mirada` (copia al build + rewrite) se añade en el próximo sprint que toque el blueprint.
- **Vercel reescribe el homepage de GitHub** tras cada deploy a producción: no hay interruptor en
  el proyecto (verificado con la CLI); se limpia a mano tras cada merge.
- **La investigación** y sus anexos viven en la planeadora; el usuario los verifica allá.

## Fricción del kit (para la retro)

- `/audita-sprint` no estaba estampado en esta app: se adoptó como delta del kit en la fase 0.
- La regla 15 (rojo en el mismo commit) funcionó como estaba pensada: el rojo cazó, además del
  término de prueba, **fugas reales** (revistas con nombre de población en las citas y métodos
  nombrados en la propuesta) antes del primer push.
- El gate «cero enlaces» y el de sensibilidad comparten lección: el documento que narra el gate no
  puede romperlo. Los marcadores `s5:inicio`/`s5:fin` resolvieron vigilar secciones nuevas de
  archivos viejos sin tocar el texto previo.

## Aprendizajes técnicos

- Node quitando tipos: un `.mjs` puede importar un `.ts` directamente, pero un import de VALOR sin
  extensión desde un `.ts` no resuelve ahí — `content/contacto-visual.ts` usa solo `import type`.
- Un comentario HTML dentro de una tabla Markdown la rompe: el marcador envuelve la sección entera.
- El gate debe correr también sobre el árbol de cada commit antes del push: la historia pública
  cuenta tanto como el HEAD.

## Remate del mismo día (PR aparte, tras el merge — pedidos del usuario al ver producción)

- **«Enviar a papá» manda solo lo nuevo desde la última vez** (ids enviados aparte; el contrato
  del archivo no cambia; cancelar no marca; fallo → portapapeles, lo que **paga B1**), marquita
  «enviado» en el panel, y **«Enviar otra vez esta semana»** por si un mensaje se perdió.
- **Las 50 cápsulas de habla entran al mismo documento**, por etapa y con el mismo registro, sin
  la cita (métodos e instrumentos de la bibliografía de habla no van al documento de la mamá). El
  gate del catálogo excluye esa sección por marcadores (`excepto`, variante nueva con unit): texto
  previo al sprint, cubierto por el informe.
- **Manual:** «Qué hacer con lo que le llega (para el papá)» — las tres lecturas. **Guía:** P4
  mejorada, P8 y P9 nuevas.
- Deuda que queda: **B4** (Node ≥ 22.18 en los scripts). B1 quedó pagada aquí.

## Lo que falta para cerrar (acciones del usuario)

1. **«Mergea»** el PR #13 (CI verde). 2. Tras el deploy, se re-verifica y limpia el homepage de
GitHub. 3. `/cierre-sprint` en la planeadora. 4. Entregar a la mamá la dirección de `/mirada`
(vive en el registro privado de la planeadora, no aquí) — y borrar antes los registros de prueba
del teléfono del usuario («Borrar todos mis registros»).
