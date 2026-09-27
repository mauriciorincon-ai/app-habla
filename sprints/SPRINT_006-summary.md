---
sprint: 006
app: habla
feature: la-piramide-fichas-de-actividad
estado: listo para merge — G-Contenido APROBADO por el usuario (56 fichas) · /audita-sprint EJECUTADO en 2 fases (auditor independiente · 0 críticos · 1 alto · 6 medios · 21 bajos — los 28 pagados, sin deuda) · deploy-check MERGE OK · CI verde. Falta: merge del PR #15 con squash (a orden del usuario) → borrar la rama → re-verificar el homepage de GitHub tras el deploy → /cierre-sprint.
fecha: 2026-09-27
ciclo: H2 (sprint 2 — segunda bifurcación pedida por el usuario; el backlog planeado de H2 se corre otro turno)
---

# Sprint 006 — «La pirámide» · Summary

> Segundo corte de H2 de **Hablemos San**, otra **bifurcación** del usuario. Tras tres semanas con
> el documento del S5, la mamá trae una pirámide de seis piezas —señalar · imitación · comprender ·
> atención conjunta · intención comunicativa · juego— y el usuario pide revisar **todas** las
> cápsulas (las 24 de la mirada y las 50 de la app), clasificarlas en esos seis grupos, reescribirlas
> como **actividades en instrucción directa**, personalizarlas con lo que al niño ya le gusta y
> priorizar **imitar, atención conjunta y turnos de juego**. Este sprint rehace el documento de la
> mamá, `/mirada`: **«La pirámide, en casa»**, 56 fichas por los seis grupos, que se trabajan todos a
> la vez. **El registro diario se retira entero.** **La app del niño no cambió.** Séptimo sprint con
> cero IA.

## Qué se entregó (contra la orden)

| Pedido | Estado | Evidencia |
|---|---|---|
| **Investigación nueva, con anexos por grupo** (vive en la planeadora, privada) | ✅ | G-Investigación 2026-09-27: seis anexos (53 actividades), mapa de las 74, progresiones por grupo, lista de términos ampliada (483). |
| **TODAS las 74 revisadas y clasificadas en los seis grupos** | ✅ | `content/fichas.ts` + test «el mapa quedó ejecutado»: cada una de las 74 aparece **exactamente una vez**, en una ficha o en `CAEN_DEL_DOCUMENTO` (con su razón). |
| **Formato de actividad, en instrucción directa** | ✅ | Cada ficha: Ten a la mano · Haz (3–5 pasos, uno por acción) · Tu línea · Espera ver · Funcionó si (observable, sin números: lo exige el schema) · Si no pasa (siempre baja la exigencia). |
| **Hiperpersonalizadas con sus favoritos** | ✅ | Marchar, «corre que te atrapo», las cosquillas con su sonido, señalar y «tú», «hola»/«chao» con mano y voz, las vocales — en portada y dentro de las fichas, en observable. |
| **Los seis grupos a la vez; prioridad imitar · atención conjunta · juego** | ✅ | Portada «un mapa, no una escalera»; las tres de prioridad van primero y juntas pesan más (32 contra 24, regla del schema). |
| **Calidad sobre cantidad (piso 20)** | ✅ | 56 (ver abajo por qué). |
| **Registro descartado** | ✅ | Retirado entero (ver abajo). |
| **Nada de la casa privada en el repo** | ✅ | Gate de sensibilidad ampliado (483 términos, n-gramas 1–5) + **guardia nueva de edades**; sin nombres, edades, lugares ni condiciones. |

**El documento, en una línea:** portada («La pirámide tiene seis piezas… se construyen todas a la
vez»), índice por grupo (tres con «prioridad ahora»), «Lo que ya le gusta», «Esto no es una
prueba» y momentos cortos, el único semáforo (si aparta la vista, se tapa la cara o se irrita para
salirse del juego: se para), la pirámide como mapa con una frase por grupo, «Cómo se lee una ficha»,
«Qué no hacer» en diez reglas, y las 56 fichas por grupo. Imprimible (fichas enteras, sin índice ni
casillas). `?revision` solo para el papá: preguntas de juicio, casilla por ficha, de dónde viene cada
una y la lista de lo que quedó fuera. Cero JS salvo ese modo; el documento no guarda nada en el
teléfono de la mamá.

## ⭐ acotado (sección fija)

- **G-Contenido — APROBADO por el usuario (2026-09-27):** leyó las 56 en `/mirada?revision` sobre la
  preview del PR: «Ya las revisé y las veo bien, esto se juzga es en la práctica».
- **Miradas de FORMA:** capturas en Pixel 7 **leídas como imagen** en cada regeneración (portada,
  pirámide, una ficha por formato —imitación, con el hermano, comprender, señalar—, impresión y modo
  revisión) + **medida de desborde** (`scrollWidth` 412 = ancho 412; ninguna ficha ni bloque se sale)
  + e2e en móvil y escritorio. Las capturas cazaron un defecto que la CI no veía (el modo revisión
  cambiaba la letra de todo el documento): arreglado y vigilado por un e2e con su rojo. El usuario
  revisó el documento en la preview y lo aprobó; las pruebas Q1–Q6 de la guía no se reportaron una
  por una.
- **`prefers-reduced-motion`:** no aplica — el documento no tiene animación (solo una transición de
  opacidad en las casillas del modo revisión, y solo con `no-preference`).

## Cuántas fichas y por qué esa cantidad

**56 — lo que da ejecutar el mapa aprobado, no una meta.** El pedido fue «calidad sobre cantidad,
no menos de 20»; el mapa decide ficha por ficha qué queda, qué se une y qué cae: de la mirada, 19
quedan con otra forma, 4 se unen en «Con el hermano: la misma rutina» y 1 se une a «El frasco que no
abre»; de la app, 2 quedan, 27 se funden en 7 fichas, 10 entran dentro de otras y **11 caen del
documento**; y 28 fichas nacen de los anexos. Reparto: **imitación 12 · atención conjunta 7 · juego
13** (prioridad) · señalar 4 · intención comunicativa 10 · comprender 10. El resumen del mapa decía
~56 con «intención comunicativa 9» (suma 55); su lista, ficha por ficha, da 10: se ejecutó la lista.

## El mapa ejecutado (con ids)

| Ficha | Origen | Viene de |
|---|---|---|
| **Imitación** (12) | | |
| `dos-juguetes-iguales` | queda (mirada) | mirada · dos-juguetes-iguales + anexo B-A1 |
| `el-prueba-si-lo-copias` | queda (mirada) | mirada · el-prueba-si-lo-copias |
| `sigo-su-ritmo` | queda (mirada) | mirada · sigo-su-ritmo + anexo D-A3 |
| `una-estrofa-mas` | queda (mirada) | mirada · una-estrofa-mas |
| `ahora-yo-ahora-tu` | nueva | anexo B-A2 + anexo D-A10 |
| `eco-de-voz` | nueva | anexo B-A3 + app · sonidos-habla-como-el |
| `marchar-con-algo-en-la-mano` | nueva | anexo B-A4 + anexo F-F5 |
| `cosquillas-con-sonido` | nueva | anexo B-A5 |
| `gestos-que-dicen-algo` | nueva | anexo B-A6 |
| `sonidos-de-las-cosas` | nueva | anexo B-A7 + app · sonidos-ponle-sonido-al-mundo + app · sonidos-su-sonido-tu-palabra |
| `espejo-por-turnos` | nueva | anexo B-A8 + app · sonidos-turnos-de-sonidos |
| `dos-pasos-y-lo-de-ayer` | nueva | anexo B-A10 |
| **Atención conjunta** (7) | | |
| `te-trae-el-otro-juguete` | queda (mirada) | mirada · te-trae-el-otro-juguete |
| `el-globo-en-la-boca` | queda (mirada) | mirada · el-globo-en-la-boca |
| `cucu-cuando-se-tapa-el` | queda (mirada) | mirada · cucu-cuando-se-tapa-el |
| `se-lo-lleva-al-hermano` | queda (mirada) | mirada · le-lleva-el-juego-al-hermano + anexo D-A7 + anexo A-A7 |
| `comento-no-pregunto` | nueva | anexo D-A5 |
| `lo-que-hace-contigo-tiene-nombre` | nueva | anexo D-A6 |
| `en-el-piso-con-su-juguete` | fusión | app · interes-siéntate-en-el-piso + app · interes-el-juguete-que-el-eligio |
| **Juego** (13) | | |
| `el-avion-cara-a-cara` | queda (mirada) | mirada · el-avion-cara-a-cara |
| `cosquillas-que-se-detienen` | queda (mirada) | mirada · cosquillas-que-se-detienen + anexo E-A1 + anexo A-A6 |
| `me-meto-en-su-juguete` | queda (mirada) | mirada · me-meto-en-su-juguete |
| `alto-y-ya-con-el-carro` | queda (mirada) | mirada · alto-y-ya-con-el-carro |
| `el-me-pasa-el-turno` | queda (mirada) | mirada · el-me-pasa-el-turno |
| `la-marcha-que-cambia` | nueva | anexo F-F1 + anexo D-A8 |
| `cosquillas-al-reves` | nueva | anexo F-F2 |
| `corre-que-te-atrapo-con-base` | nueva | anexo F-F3 |
| `el-carro-va-y-viene` | nueva | anexo F-F4 + anexo A-A5 |
| `un-paso-mas` | nueva | anexo F-F6 |
| `de-mentira-conmigo` | nueva | anexo F-F7 |
| `lucha-suave-con-senal` | nueva | anexo F-F10 |
| `con-el-hermano-la-misma-rutina` | fusión | mirada · el-hermano-lo-copia + mirada · los-mismos-turnos-con-el-hermano + mirada · el-hermano-al-lado-un-turno-cada-uno + mirada · las-mismas-cosquillas-con-el-hermano + anexo B-A9 + anexo F-F9 |
| **Señalar** (4) | | |
| `mama-senala-el-mundo` | nueva | anexo A-A1 |
| `la-respuesta-completa` | nueva | anexo A-A2 + anexo C-C4 + anexo D-A1 + app · sonidos-senalar-ya-es-hablar |
| `mira-lo-que-traigo` | nueva | anexo A-A3 + anexo D-A4 + anexo F-F8 + anexo E-A7 |
| `la-sorpresa-en-la-ruta` | nueva | anexo A-A4 + anexo D-A2 + anexo D-A9 |
| **Intención comunicativa** (10) | | |
| `burbujas-y-espero` | queda (mirada) | mirada · burbujas-y-espero |
| `lo-dejo-a-medias` | queda (mirada) | mirada · lo-dejo-a-medias |
| `una-media-puesta` | queda (mirada) | mirada · una-media-puesta + app · espera-el-hueco-de-la-rutina |
| `de-a-poquitos` | queda (app) | app · espera-de-a-poquitos + anexo E-A8 |
| `espera-con-cara-de-pregunta` | fusión | app · sonidos-espera-con-cara-de-pregunta + app · espera-cuenta-cinco + app · espera-no-adivines + app · espera-tres-segundos-mas + anexo C-C7 |
| `el-frasco-que-no-abre` | fusión | mirada · la-espera-se-estira + app · espera-el-frasco-dificil + app · focalizada-palabra-abre + anexo E-A3 |
| `marchar-con-tropiezo` | nueva | anexo E-A2 |
| `dos-cosas-una-eleccion` | nueva | anexo E-A4 + app · frases-elige-tu-o-yo |
| `chao-a-tres-silencio-al-cuarto` | nueva | anexo E-A5 |
| `lo-que-no-le-gusta` | nueva | anexo E-A6 |
| **Comprender** (10) | | |
| `lo-que-el-mira-yo-lo-nombro` | fusión | app · modelado-nombra-su-mundo + app · interes-el-manda + app · focalizada-el-nombre-vive-en-la-cosa + app · modelado-en-el-carro + app · modelado-mercado + app · modelado-parque + app · modelado-la-calle + app · interes-nombra-lo-que-el-hace + anexo C-C1 |
| `las-mismas-palabras` | fusión | app · modelado-mismas-palabras-rutina + app · modelado-hora-de-dormir + anexo C-C2 |
| `su-palabra-mas-una` | fusión | app · modelado-habla-a-su-tamano + app · recast-devuelve-la-palabra + app · recast-su-palabra-mas-una + app · recast-repite-bien-sin-corregir + app · frases-una-palabra-mas-una + app · frases-recast-sin-corregir + anexo C-C6 |
| `una-palabra-muchas-veces` | fusión | app · focalizada-palabra-semana + app · sonidos-un-solo-sonido-todo-el-dia + app · focalizada-misma-palabra-cinco-lugares + anexo C-C3 |
| `la-cancion-de-siempre-al-vestirlo` | queda (mirada) | mirada · la-cancion-de-siempre-al-vestirlo + app · modelado-vestirse + app · modelado-cancion-de-la-rutina |
| `la-locion-despues-del-bano` | queda (mirada) | mirada · la-locion-despues-del-bano |
| `su-cancion-con-hueco` | queda (mirada) | mirada · su-cancion-con-hueco + app · espera-pausa-canciones |
| `ponle-nombre-a-lo-que-siente` | queda (app) | app · recast-nombra-lo-que-siente |
| `acciones-en-tres-palabras` | nueva | anexo C-C5 |
| `corre-que-te-atrapo-con-palabras` | nueva | anexo C-C8 |

**Caen del documento (11, siguen intactas en la app):** necesitan la pantalla —
`interes-voz-mueve` · `interes-co-uso` · `sonidos-cualquier-sonido-cuenta` ·
`interes-cohete-de-la-voz` · `interes-palabra-y-objeto`; son de la etapa siguiente —
`frases-dos-palabras-utiles` · `frases-el-hueco-de-la-segunda` · `frases-narra-con-dos` ·
`frases-cuenta-cuentos-con-huecos`; quedaron como reglas del «Qué no hacer» —
`focalizada-sin-examen` · `focalizada-no-preguntes-nombra`.

## La decisión del registro

**Se retira entero.** El usuario: a la mamá no le resultó factible llevarlo, y no hubo registros;
«si quieres omitir esa estrategia hazlo, la mamá no la va a usar». Fuera: formulario, panel, «Enviar
a papá», «Guardar registro», cuadrícula impresa, `content/registro-contacto-visual.ts` y sus pruebas.
La señal de que una actividad sirvió vive dentro de cada ficha («Funcionó si…»), para verla mientras
juegan. Un e2e verifica que el documento no tiene formularios, ni botones, ni escribe en el teléfono.
En la guía, el bloque P se eliminó como **feature muerta, declarada en el historial**.

## Definition of Done — los 6+1

| Gate | Estado | Evidencia |
|---|---|---|
| **1. Testing** | ✅ | **359 unit** — `fichas.test.ts` (21: cada garantía del schema en rojo con fixtures, la biblioteca real, el mapa 74/74, el documento regenerado, los conteos del manual y la guía) y el gate (62: sensibilidad por archivo, edades por archivo, marcadores y rutas) —; cobertura 91 % stmts / 86 % branches. **185 e2e** (169 de la app + 16 de `/mirada` en móvil y escritorio: portada, grupos e índice, seis partes en orden, cero registro, `?revision` con la lista de lo que quedó fuera, `?revision` no cambia la cara del documento, cero desborde, axe). |
| **2. CI/CD** | ✅ | quality · e2e · lighthouse · Vercel verdes en el PR #15 en cada push. |
| **3. Observabilidad** | ✅ (sin cambios) | El documento es HTML estático sin red ni Sentry. El generador falla (no publica) si la biblioteca no cumple su contrato. |
| **4. Seguridad** | ✅ | `pnpm audit` en **cero, todos los niveles** (next 16.3.6 y candados `sharp`, `js-yaml`, `vitest` por avisos publicados entre merges). Cero secrets (gitleaks en cada commit). Gate de sensibilidad + guardia de edades verdes sobre todo lo que el sprint publica, esta página incluida. Cero enlaces: grep vacío. |
| **5. Performance** | ✅ | `src/` solo cambió un comentario. JS del build **1,9 % más liviano** que `main` (1 665 138 contra 1 697 043 bytes, ambos construidos hoy). Lighthouse verde contra `perf-budget.json`. |
| **6. UX/A11y** | ✅ | axe limpio en `/mirada` y `/mirada?revision` · enlaces del índice ≥44 px · la prioridad también para lector de pantalla · cada casilla con el título de su ficha · nada comunica solo con color · legible en Pixel 7 sin zoom · imprimible. |
| **7. IA embebida** | **N/A** | Cero LLM, cero SDK — séptima vez consecutiva. |
| **Manual de uso** | ✅ | «El documento de la mamá: "La pirámide, en casa"», FAQ (qué es; dónde quedó el registro), historial 006 — entre marcadores `s6:` para el gate. |
| **Guía de prueba viva** | ✅ | v6 acumulativa: hereda S1–S5; bloque **Q** (Q1–Q6 de forma, Q7 el G-Contenido; gate mínimo del S6: 6); P1 → Q1 y P7 → Q6 «Mejorado en S6»; bloque P eliminado y declarado. La cabecera ahora cuenta bien su gate mínimo previo (23). |
| **Revisión de diseño** | ✅ | Tokens del `design-system.md` vía `scripts/lib/catalogo-comun.mjs`; claro/oscuro; capturas leídas. Aprobación del usuario sobre el contenido. |
| **Brochure + export** | ✅ (no se tocan) | El documento no es una feature del producto; el conteo del manual de la app no cambió. |
| **README** | ✅ | Node ≥ 22.18 y `pnpm gen:piramide`. |

## ADRs de este sprint

| # | Tema |
|---|---|
| 016 | **[ACCEPTED 2026-09-27] La pirámide: biblioteca de fichas con schema propio y origen trazable, generador nuevo en `/mirada`, retiro del registro y gate ampliado.** La ADR 015 anota que el contrato del registro se retiró. |

## Auditoría final (`/audita-sprint`, 2 fases — ejecutada)

**Fase 1 — auditor independiente** (subagente con el diff `main...HEAD`, la orden, el plan y el
mapa; la bitácora como fuente secundaria): **0 Críticos · 1 Alto · 6 Medios · 21 Bajos**, cada uno
con `archivo:línea` en `sprints/SPRINT_006-auditoria.md`. **Fase 2 — los 28 pagados, sin deuda**
(la orden de fase 2 del usuario ya pedía «todos los hallazgos pagados»). Lo principal:

- **A1 · edades escritas** en cinco líneas de cuatro documentos (S5 y S6), que el gate de términos no
  podía ver → quitadas + **guardia de edades** sobre todo el alcance, en rojo con los archivos viejos.
- **M1** el semáforo contradecía al cucú → «para salirse del juego» · **M2** «Funcionó si» nunca
  armado para ver si entiende · **M3** una sola lista de reglas para el hermano · **M4** el schema
  aceptaba claves del prototipo como paso (rojo demostrado) · **M5** nueve pasos que eran dos acciones
  · **M6** las 24 del S5 vuelven al gate.
- **B1–B21:** entre ellos, el unit que caza un documento sin regenerar (rojo demostrado), el gate que
  ya no pasa en silencio si falta un archivo o un marcador (rojo demostrado), la lista de lo que quedó
  fuera en el modo revisión, y copy de fichas.

**Casilla 4 («¿qué frases caducaron?») dos veces:** antes de los pagos (reporte) y sobre el diff de
los pagos, que cazó tres frases hermanas (la ficha del hermano, el manual y la Q6 de la guía). Una
tercera pasada corrió sobre este summary.

## Desviaciones declaradas (todas en la bitácora)

1. **Fase 0 y fase 2 en una sola corrida**, con un solo STOP (el G-Contenido): la fase 0 no había
   arrancado en este repo y la investigación ya estaba aprobada.
2. **Prioridad por agregado** (los tres prioritarios juntos pesan más que los otros tres): la regla
   «cada prioritario ≥ cada no prioritario» contradecía el mapa (atención conjunta 7, comprender 10).
3. **56 fichas, no 55:** se ejecutó la lista del mapa, no su resumen.
4. **Cinco fichas en otro grupo que el plan:** cucú → atención conjunta y «Su canción con hueco» →
   comprender (segundo grupo del mapa, para cumplir sus conteos); «Lo dejo a medias» → intención
   comunicativa, «La loción» → comprender, «Me meto en su juguete» → juego (grupo principal del mapa).
5. **Progresiones:** imitación con seis pasos (I1–I6) y juego hasta T7, como los anexos aprobados.
6. **`N_MAX` 4 → 5** en el gate: la lista ampliada trae términos de cinco palabras.
7. **`E2E_PORT`** en la config de Playwright (por defecto 3000, la CI no cambia).
8. **Documentos del S5 editados** para quitar edades (hallazgo A1): la orden pide «sin edades» y la
   bitácora del S6 lo prometía.

## Deuda técnica explícita

**Ninguna nueva.** De la deuda del S5: **B4** (Node ≥ 22.18) se pagó; **B1** (compartir → portapapeles)
y el **importador del registro** desaparecen con el registro (feature retirada, no deuda).

## Lo desplazado (backlog del S4 en su orden — NO entró; se corre otro turno)

- **ALTA:** ítem 2 (qué pasa al agotar la etapa) · ítem 1 (histórico navegable + «reforzar esta»)
  · ítem 3 (pantalla que explique las técnicas).
- **MEDIA:** ítem 8 (sonidos de ambientación) · ítem 7 (filtro por tono niño/adulto).
- **BAJA:** ítem 5 (obstáculos del globo) · ítem 6 (despegue del globo) · ítem 4 (ordinales,
  bloqueado) · ítem 9 (alerta dos-casas, bloqueado).

## Lo pendiente, visible

- **La historia de `main` guarda una edad** (del hermano, en commits del S5). Reescribirla es
  decisión del usuario; no se recomienda por defecto. El commit de la rama con una edad no entra si el
  merge es **squash**, y la rama se borra al mergear.
- **Observación de noviembre:** con el niño de vuelta en la app, se observa en vivo qué fichas pasan a
  «Hoy» y cómo se reconcilian las dos bibliotecas (`origen` lo deja trazable).
- **Las 3 decisiones abiertas de H2** (del summary del S4): ordinales · sincronización entre las dos
  casas · revisión de la regla dura 2 (la voz).
- **Informe de sensibilidad del resto del repo:** con la lista ampliada, 194 coincidencias en 32
  archivos fuera del gate (vocabulario previo de la app, skills del kit, bitácoras viejas). Se reportan,
  no se tocan: decisión del usuario, archivo por archivo, sin escribir términos.
- **Blueprint:** el documento `/mirada` (copia al build + rewrite) sigue sin anotar en
  `docs/BLUEPRINT.html`; entra en el próximo sprint que toque el blueprint.
- **Vercel reescribe el homepage de GitHub** tras cada deploy a producción: se limpia a mano tras el
  merge.

## Fricción del kit (para la retro)

- El auditor independiente de `/audita-sprint` (kit v1.31.0) encontró lo que el constructor daba por
  bueno: edades en documentos que el propio gate vigilaba, un refine que aceptaba claves del prototipo
  y un e2e de conteos tautológico.
- «Mirar las capturas es un gate» volvió a pagar: el modo revisión cambiaba la letra de todo el
  documento (una clase compartida entre la casilla y el `body`) y ningún test lo veía.
- El gate de sensibilidad cazó una **sílaba de balbuceo** que, normalizada, coincide con un término de
  la lista: los hashes no distinguen contexto; se cambió la sílaba.

## Aprendizajes técnicos

- `clave in objeto` mira el prototipo: para validar contra un mapa de datos, `hasOwnProperty`.
- Una clase de estado que se pone en el `body` no puede llamarse igual que la de un componente.
- Un e2e que compara dos números salidos de la misma función del generador no prueba nada: el test
  útil lee el documento commiteado contra la biblioteca.
