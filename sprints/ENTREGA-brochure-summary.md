---
entrega: brochure-conoce
app: habla
tipo: entrega puntual (no es sprint — orden ENTREGA-BROCHURE de la planeadora, kit v1.9.0)
estado: construida y verificada en local (249 unit · 161 e2e · typecheck · lint · Lighthouse 100/100/100/100 en /conoce). Falta: CI verde en el PR → **gate visual del usuario sobre la preview** → merge a su orden.
fecha: 2026-08-07
rama: entrega/brochure-conoce
---

# Entrega puntual — El brochure vivo de Hablemos San (`/conoce`) · Summary

> Lo que la planeadora necesita para registrar el cierre de la entrega. Esta es la **primera
> implementación del molde v1.9.0**: habla es el piloto del estándar que tendrán las 5 apps, así
> que el feedback del molde (abajo, § "Feedback del molde") es parte del entregable, no un extra.

## Qué se entregó

1. **`docs/BROCHURE.html`** — el brochure canónico, autocontenido (abre con doble clic sin
   internet: cero CDNs, cero `src`/`href` externos, cero `fetch`; verificado por grep). 48 KB.
2. **Ruta pública `/conoce`** en la app desplegada, sirviendo ese mismo contenido sin
   duplicación manual — la entrega a la familia es un **link de producción**, no un archivo.
3. **`tests/e2e/conoce.spec.ts`** — 12 casos (6 por proyecto: móvil y escritorio).

**Cero cambios de comportamiento en la app.** Los únicos archivos de la app tocados son glue de
build: `package.json`, `next.config.ts`, `.gitignore`, `lighthouse-urls.json`.

## Decisiones

**El corte de tarjetas (capa 1) — 6, decidido con el usuario.** Abre **las cápsulas** (la estrella
⭐⭐⭐ de la VISION: la respuesta diaria a _"¿y hoy qué puedo hacer por mi hijo?"_), y el Estudio va
de tercero con su hilo destacado —"grabas una palabra → suena en los dibujos, en las gemelas y en
las invitaciones del globo y el cohete"—, que fue el énfasis explícito del usuario al encargar la
entrega:

| #   | Tarjeta                  | Icono (de `src/components/iconos.tsx`) |
| --- | ------------------------ | -------------------------------------- |
| 1   | La respuesta de cada día | `IconoBrote`                           |
| 2   | Jugar con la voz         | `IconoBurbuja`                         |
| 3   | Tu voz dentro de la app  | `IconoMicrofono`                       |
| 4   | El objetivo de la semana | `IconoDiana`                           |
| 5   | El rumbo                 | `IconoBrujula`                         |
| 6   | A su medida              | `IconoAjustes`                         |

**Tono: de «tú»** (decisión del usuario). El manual habla de usted; el brochure le habla **a ella**,
cálido y directo. La palabra "manual" no aparece en el texto visible (grep).

**Mecanismo de `/conoce`: copia en build + rewrite.** `scripts/copiar-brochure.mjs` copia el
canónico a `public/conoce.html` (artefacto **gitignorado**, mismo trato que `public/worklets/`)
encadenado en `dev` y `build` —el patrón que ya existía para el worklet—, y `next.config.ts`
reescribe `/conoce` → `/conoce.html` para que el link no diga ".html".
_Descartadas:_ una página de Next con `dangerouslySetInnerHTML` (no ejecuta el `<script>` del
brochure: G2 y G3 muertos) y un route handler leyendo `docs/` en runtime (depende del file-tracing
de Vercel, frágil). La copia en build es determinista, sin código de servidor, y la ven la CI, los
e2e y Vercel porque todos pasan por `pnpm build`.

**Dirección de arte anclada a la app** (regla 9 de la orden). Tokens del molde reemplazados por la
paleta "Clínica cálida" del operador (cream/sage/ink) con su paleta `--oscuro-*` en tema oscuro;
radios 16/12; iconos SVG de trazo copiados de la app (**cero emojis** — el design system los
prohíbe); chips mono en versalitas. **Sin `data-tema`**: `/conoce` vive fuera del storage de la
app, así que el tema sigue solo al sistema.

**Las señas visuales de la app, a pedido del usuario.** El globo flota en la portada; el globo, el
cohete, el pictograma y las gemelas encabezan su juego **sobre el escenario claro del niño** (su
pantalla es clara SIEMPRE, también aquí); la burbuja del guion, el check de "ya lo hicimos" y el
altavoz acompañan lo del adulto en trazo; los tres estados del objetivo aparecen con su **forma y
color reales** (diana verde · círculo azul · triángulo rojo — daltonismo), y las sugerencias
muestran un chip verde y uno neutro de ejemplo. Todo son los **mismos SVG de la app**: se ven
idénticos y no se desincronizan.

**Datos del menor: CERO.** "Hablemos San" sí (decisión G-Visión); ni apodo, ni nombre, ni fotos,
ni datos de la familia (grep).

## El conteo: N = 24 — la tabla de mapeo

El pie declara **24 funcionalidades** y aquí está la evidencia, feature por feature, contra
`docs/MANUAL-DE-USO.md`. Un e2e vigila que el número del pie siga presente.

| #   | Feature en el brochure                                    | Sección del MANUAL-DE-USO               | Tarjeta |
| --- | --------------------------------------------------------- | --------------------------------------- | ------- |
| 1   | La cápsula del día                                        | La pantalla "Hoy"                       | 1       |
| 2   | «Sí, ya lo hicimos» — los días que llevan                 | La pantalla "Hoy"                       | 1       |
| 3   | Antes de jugar, tu guion                                  | Los juegos de voz (marco de co-uso)     | 2       |
| 4   | El globo — la voz que se sostiene                         | Los juegos de voz § 1                   | 2       |
| 5   | El cohete — la voz que sube y baja                        | Los juegos de voz § 2                   | 2       |
| 6   | Palabra y dibujo                                          | Los juegos de voz § 3                   | 2       |
| 7   | Palabras gemelas                                          | Los juegos de voz § 4                   | 2       |
| 8   | El Estudio: grabar, oír, guardar                          | La voz de la familia                    | 3       |
| 9   | Ve directo a lo que quieras grabar                        | La voz de la familia ("Con tu voz vas") | 3       |
| 10  | Lo que ya grabaste                                        | La voz de la familia                    | 3       |
| 11  | Tu voz suena en los juegos (+ el interruptor)             | La voz de la familia                    | 3       |
| 12  | Escríbelo y la app se alinea                              | El objetivo de la semana                | 4       |
| 13  | Mientras escribes, te acompaña (sugerencias + ortografía) | El objetivo de la semana                | 4       |
| 14  | La tarjeta te dice el estado — 3 señales                  | El objetivo de la semana                | 4       |
| 15  | Tendencias de lo que de verdad pasó                       | El rumbo                                | 5       |
| 16  | 16 hitos que no se pierden                                | El rumbo                                | 5       |
| 17  | Apodo y temas                                             | Primeros pasos                          | 6       |
| 18  | La etapa del habla                                        | La etapa del habla                      | 6       |
| 19  | Modo calma                                                | Modo calma                              | 6       |
| 20  | Reducir animaciones                                       | Modo calma                              | 6       |
| 21  | Claro u oscuro                                            | Claro u oscuro                          | 6       |
| 22  | Instálala como app — y sin internet                       | Primeros pasos + FAQ                    | 6       |
| 23  | Qué pasa con la voz de tu hijo (privacidad)               | Privacidad                              | capa 3  |
| 24  | Qué mide — y qué no va a fingir que mide                  | Qué mide y qué NO mide                  | capa 3  |

**Lo que NO cuenta como funcionalidad** (y por qué): "Requisitos y lo que esta app no es" (es
posicionamiento y contexto de uso, no una capacidad) y "El mapa" (es navegación). Las **50
cápsulas** no se cuentan una a una: son el catálogo de la feature 1, representado —regla "agrupar
sí, omitir jamás"— con sus **3 etapas** y sus **5 técnicas** reales tomadas de
`content/schema.ts`.

⚠️ **Ojo para la planeadora:** este 24 **no es** el 21 de la VISION. Aquel cuenta el inventario de
producto (17 MVP + 4 roadmap); este cuenta lo **construido y documentado** al cierre del ciclo H1,
con el grano del manual. Son dos conteos distintos, ambos correctos, y conviene no cruzarlos.

## Verificación

| Gate                               | Resultado                                                           |
| ---------------------------------- | ------------------------------------------------------------------- |
| `pnpm typecheck` · `pnpm lint`     | limpios                                                             |
| `pnpm test` (unit)                 | **249 verdes** (intactos: no se tocó código de la app)              |
| `pnpm test:e2e`                    | **165 verdes** (149 heredados + 16 nuevos de `/conoce`)             |
| Lighthouse local en `/conoce`      | **100 / 100 / 100 / 100** (perf · a11y · best-practices · SEO)      |
| Presupuestos de `perf-budget.json` | FCP 0,8 s (tope 1,5) · LCP 0,9 s (tope 3,8) · TBT 0 ms · CLS 0      |
| Autocontenido                      | grep: cero `src`/`href`/`@import`/`url(`/`http`/`fetch`             |
| Higiene de contenido               | cero emojis · cero datos del menor · cero "manual" en texto visible |

**Los 16 e2e (8 × 2 proyectos):** la ruta responde 200 con su portada · las 6 tarjetas llegan
cerradas · **el recorrido abre al bajar y tu toque manda sobre él** · **al volver hacia arriba se
quedan cerradas** (la regla de dirección, que es fácil de romper sin darse cuenta) · **las 10 rutas
enlazadas existen** · **lo cerrado no llega al lector de pantalla** (se mira el árbol de
accesibilidad real por CDP, no el pixel) · el conteo del pie está presente · axe limpio en los dos
temas con todo el detalle abierto.

## Lo que encontró el `/self-review` (y se corrigió)

Los dos hallazgos son **del molde v1.9.0**, no de habla — por eso van también a la planeadora:

1. **El acordeón mentía a los lectores de pantalla (serio).** El patrón del molde colapsa con
   `grid-template-rows: 0fr` + `overflow: hidden`. Eso engaña al ojo, **pero no al árbol de
   accesibilidad**: con TODAS las tarjetas cerradas, un lector de pantalla recitaba las 24
   features de corrido mientras `aria-expanded="false"` afirmaba lo contrario. La progressive
   disclosure —el corazón del entregable— no existía para esa persona. axe no lo ve (mide
   contraste y atributos). Verificado contra el árbol real por CDP, corregido con `visibility` en
   la transición (con un extremo en `visible`, CSS la mantiene visible todo el colapso, así que la
   animación no se corta) y **blindado con un e2e** que mira el árbol, no la pantalla.
2. **La portada animaba el candidato a LCP desde `opacity: 0`** — prohibido por el design system
   de habla (patrón `lcp-nace-estatico`): un LCP que nace invisible se mide como pintado al final
   del fundido. Ahora el titular **sube sin desvanecerse** y el fundido se lo queda la línea de
   apoyo, que no es candidata.

## ⚠️ El gate visual RECHAZÓ la v1 — y el diagnóstico es del molde

El usuario probó la v1 y la rechazó sin medias tintas: _"la parte inicial tiene un pequeño
viso de lo que podría ser el diseño, pero hacia abajo todo mal"_. Tenía razón, y el hallazgo
importa mucho más para la planeadora que para habla, porque **el defecto es del molde**, no
de esta app:

> **El molde v1.9.0 heredó la LEY del Estudio CINE y ninguna de sus TÉCNICAS.**

La plantilla declara que su ADN viene de `hr03-estudio-cine` y cita las tres gramáticas —
pero al estamparse **vetó G1** ("pesa demasiado para un brochure"), **redujo G2 a un
acordeón** y **G3 a un `fade-up` con stagger**. El estudio tiene **13 patrones catalogados**
en `memoria/patrones-acumulados.md` (cortina de 3 poses, `steps()` como identidad, física en
timeline, boiling line, brochazo, typewriter honesto, gramática de apertura blur-to-focus…):
el molde usaba **dos**. Un builder que sigue el molde al pie de la letra produce
inevitablemente un documento peinado — que es exactamente lo que pasó.

Y hubo un segundo defecto, de **método**: el molde salta la dramaturgia. No pide storyboard,
no pide clímax, no pide ritmo. Por eso la promesa más importante de la app —la privacidad—
había quedado como el primer acordeón del pie de página. El motion no era el problema de
fondo: **la escaleta lo era**.

### Cómo se corrigió

Se corrió el método completo del estudio: **storyboard primero**
([`ENTREGA-brochure-storyboard.md`](ENTREGA-brochure-storyboard.md), aprobado por el usuario
con «guion aprobado»), con 8 escenas, gramática por escena, justificación narrativa de cada
técnica, riesgo de dirección de arte registrado y variante `reduced-motion` declarada
**por escena**. Solo después se escribió una línea de HTML.

### Las 5 referencias que trajo el usuario — qué se tomó y qué NO

Él aportó los prompts de 5 piezas de motionsites que le gustan. Se analizaron con el
protocolo del estudio (técnicas, no stacks — las 5 usan React/GSAP/Framer/vídeo remoto y
este entregable es un archivo autocontenido que abre con doble clic):

| Referencia                | Qué se adoptó                                                                                                                                                                                                                                            | Qué se descartó y por qué                                                                                                                                                                                    |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1 y 5 · portafolio oscuro | Entrada `blur-to-focus` con stagger y curva `cubic-bezier(.16,1,.3,1)` · contador rAF que se cuenta solo · marquesina lenta · indicador de scroll con riel animado                                                                                       | Pantalla de carga (un brochure que hace esperar a quien odia los manuales es un chiste cruel) · vídeo HLS y webfonts de CDN (romperían el autocontenido) · gradiente de acento (el DS de habla no lo tiene)  |
| 2 · museo                 | Numeración de actos con regla mono `01 —` · titulares grandes en display · píldoras/chips · **`steps()` como identidad** (la llama del cohete hierve en dos poses) · cortina que barre el botón al hover                                                 | Disolución por `feTurbulence`/`feDisplacementMap` (bonita, pero re-renderiza el filtro por frame en un móvil; el "grano" se logró con transforms) · auto-ciclado de capítulos (quita el control a quien lee) |
| **3 · Mostar (vanilla)**  | **El motor entero**: escena pegada + rig de scroll, variables CSS escritas por un solo `rAF`, `clamp`/`smoothstep`/`lerp`, inercia `lerp(…, .14)`, paralaje de puntero `.12`, y el patrón de "seguir pidiendo cuadros solo mientras la inercia no llegó" | El secuestro del scroll y los 3.700 px de rig (aquí el rig es **una pantalla**: ella lee en el teléfono) · las capas fotográficas remotas                                                                    |
| 4 · moda                  | Escalado de tarjetas según su posición en pantalla, con origen de transformación variable                                                                                                                                                                | Cursor personalizado y `mix-blend-mode: exclusion` (ilegible sobre crema, y un cursor propio no ayuda a nadie en una tablet) · panel negro a pantalla completa (secuestra el recorrido)                      |

**La regla que gobernó cada decisión** es la del propio estudio: _"¿qué del MENSAJE hace
necesaria esta técnica?"_. Si la respuesta era "se ve increíble", la técnica se cortó.

### Qué es la v2, en una línea

El **hilo del globo**: sube por el borde mientras avanzas — tu recorrido _es_ la voz
sostenida. El titular se enfoca palabra por palabra; los iconos se terminan de dibujar; el
globo cruza y da su vuelta con confeti; y la privacidad dejó de ser un acordeón para volverse
**escena nocturna con paleta propia**, donde las barras del medidor bailan y se apagan
**dentro** del marco y la fuga llega al borde y se devuelve. El motion ES el argumento.

**Dos defectos propios, cazados por sondas antes de entregar** (no por la CI —de ahí la
lección): (1) con `prefers-reduced-motion` el rig colapsado daba progreso 1 y **desvanecía el
hero**: la experiencia alterna quedaba en blanco, justo lo que la regla prohíbe; (2) un token
del acto claro se coló en la escena nocturna (contraste 1,73:1) — ese sí lo cazó axe.

### Después de la v2: tres rondas de gate visual (v3 · v4 · v5)

La v2 pasó el gate («está espectacular el resultado»), y a partir de ahí el usuario corrigió
**en frío**, tres veces. Cada ronda es la misma lección repetida: **lo que el molde no puede
verificar es justo lo que hay que enseñar al ojo.** Ninguna de estas 11 correcciones la habría
producido un test.

| Ronda  | Lo que él vio                                                                                                | Lo que se hizo                                                                                                                                                                                                                                                       |
| ------ | ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **v3** | «Seis puertas» era un muro de texto; solo el globo mostraba cómo se juega                                    | Maquetas dentro de las tarjetas + las **cuatro canchas** de la galería (globo · cohete · palabra y dibujo · gemelas), no una                                                                                                                                         |
| **v4** | La línea bajo «baja despacio»; las tarjetas no acompañaban; gemelas mentía                                   | Flecha que respira · el recorrido **pasa páginas** al bajar (con anclaje) · **10 enlaces directos** · gemelas con sus **dos teclas** · el altavoz de la voz grabada en los dos juegos que lo tienen · el **acto del Estudio**, antes del clímax de privacidad        |
| **v5** | La apertura no se anunciaba; al subir se reabrían; el altavoz se salía del marco; el taller cambiaba de piso | Destello de apertura (marco + cabecera + telón) · el recorrido **abre bajando y no al subir** · el altavoz de «palabra y dibujo» pasa a ser **botón bajo la palabra, como en la app** · **un solo fondo** para las dos noches · «Suena allá» → «Suena en los juegos» |

**Tres defectos propios de esta tanda, cazados MIRANDO capturas** (ninguno lo veía la CI):

1. **La jugada de gemelas mentía sobre el juego real** — mostraba una sola tecla («¡Dijo pato!»)
   cuando en la app hay **una por palabra**. Lo cazó él, no yo: una demostración puede estar
   perfectamente animada y ser **falsa**.
2. **El altavoz colgaba de la esquina del marco** (`top:-9px; right:-9px`) y se salía de la cancha,
   pisando al vecino. Al moverlo, la app real dio la respuesta mejor: allá es un **botón redondo
   bajo la palabra** (≥64 px, el niño lo toca). Fidelidad y arreglo, el mismo cambio.
3. **Y al arreglarlo, el icono heredó el tamaño del pictograma** (`.pareja .picto svg` sin
   combinador hijo alcanzaba al `svg` del altavoz): 60×44 px de bocina fuera del marco. Invisible
   en el código, obvio en la captura. Corregido con `>` y comentado en el sitio.

**Lección de método que va al molde:** _la captura es un gate, no un lujo._ Este piloto cerró
con **9 defectos** que ni Playwright ni axe ni Lighthouse podían ver, todos hallados abriendo la
imagen. El molde debería pedir explícitamente una pasada de capturas por bloque antes de dar
la entrega por lista.

## Feedback del molde v1.9.0 — para la planeadora

Como piloto del estándar, esto es lo que el caso real le pide al molde:

1. **Los dos hallazgos del self-review de arriba deberían entrar al molde**, para que las otras 4
   apps no los repitan: el `visibility` en la transición del acordeón (con su comentario del
   porqué) y la advertencia de no animar el LCP desde `opacity: 0`.
2. **`[EMOJI]` como icono de tarjeta choca de frente con design systems que los prohíben** (el de
   habla lo hace explícitamente). El molde debería decir _"el icono sale del design system de la
   app"_ en vez de sugerir un emoji.
3. **El molde anida el `<h3>` DENTRO del `<button>`** (`<button><h3>…</h3></button>`), que es HTML
   inválido y rompe la navegación por encabezados. Aquí se usó el patrón canónico `<h3><button>`.
4. **La regla de conteo no define qué es "una funcionalidad".** Propuesta: que el molde exija en el
   summary de la entrega la **tabla de mapeo feature → sección del manual → tarjeta** (como la de
   arriba) y que declare qué NO cuenta. Sin eso, el N es una afirmación; con eso, es evidencia.
5. **Autocontenido vs. tipografía de marca.** Las fuentes de la app (Geist, Instrument Serif) no
   pueden viajar en un archivo que abre con doble clic sin incrustarlas (peso). Aquí se resolvió
   con serif del sistema (Georgia) para el display + `system-ui` de cuerpo. El molde debería
   **declarar ese trade-off** y su salida recomendada, en vez de dejar que cada app improvise.
6. **Nota de `data-tema`:** el brochure vive fuera del storage de la app, así que no puede seguir
   la preferencia de tema que el padre fijó en Ajustes — solo la del sistema. Vale la pena que el
   molde lo diga, porque en cualquier app con selector de tema pasará lo mismo.

## Propuesta concreta: el molde v2 (lo que este piloto aprendió a la mala)

Los 6 puntos de arriba son correcciones. Esto es lo estructural — la razón por la que la v1
nació muerta y la v2 no. **Recomendación: el brochure no se estampa, se PRODUCE.**

1. **Paso de dramaturgia obligatorio, antes del HTML.** El molde debe pedir un storyboard con
   escenas, mensaje por escena, técnica con su justificación narrativa, clímax explícito y
   ritmo (regla del estudio: _toda escena clímax = ninguna lo es_). La v1 escondió la promesa
   más importante de la app en el primer acordeón del pie **porque nadie le preguntó cuál era
   el clímax**. Gate barato: se corrige en el guion, no en el código.
2. **Un banco de técnicas por gramática, no las etiquetas.** Hoy el molde nombra G1/G2/G3 y
   entrega un `fade-up`. Debe traer las recetas del estudio listas para copiar y **en vanilla**
   (el motor de la referencia Mostar cabe en ~60 líneas: `clamp`/`smoothstep`/`lerp` + un
   `rAF` que escribe variables CSS). Sin recetas, "G3" degenera en fundido.
3. **La dirección de arte necesita diales y un riesgo registrado.** El molde debe exigir
   `MOTION_INTENSITY` fijado con el usuario **antes** de construir, la identidad justificada
   en una frase, y **una decisión valiente registrada** que el usuario juzgue. Sin eso, el
   builder elige lo seguro y lo seguro se ve a plantilla.
4. **La sala de proyección es el gate, y su checklist debe estar en el molde.** "La CI verifica
   el comportamiento, no la experiencia": aquí la CI estuvo **verde con un entregable
   rechazado**. El molde debe decirlo con esas palabras para que nadie confunda verde con
   bueno.
5. **`prefers-reduced-motion` necesita verificación ACTIVA, no una promesa.** El bug más grave
   de esta entrega —el hero invisible con movimiento reducido— **pasó los 12 e2e y Lighthouse
   100/100**: ningún gate automático miraba esa rama. Propuesta para el molde: un e2e
   obligatorio que cargue la pieza con `reducedMotion: "reduce"` y afirme que los elementos
   clave tienen opacidad y tamaño reales. Es de las pocas cosas de "experiencia" que **sí** se
   pueden automatizar, y esta entrega demuestra por qué hay que hacerlo.
6. **Presupuesto de recorrido en móvil.** El molde debe acotar cuánto scroll extra puede
   costar la coreografía. Aquí el rig son **~1 pantalla** (las referencias usan 3–4): quien
   odia los manuales no puede pagar peaje para llegar al contenido.

## Decisiones abiertas y oportunidades de mejora (para la planeadora)

1. **Capturas de pantalla reales en el brochure** — el usuario las pidió para "más adelante"
   ("imágenes de la app para identificar a qué estamos haciendo referencia"). Esta entrega lo
   resolvió con los **iconos y personajes reales** de la app (mismos SVG: pesan nada y no se
   desincronizan). Las capturas siguen abiertas y son **decisión de molde, no de habla**: pesan,
   se desactualizan con cada sprint que toque UI (y el brochure es vivo), y romperían el
   autocontenido si no se incrustan. Si se adoptan, el molde debería definir cómo se generan
   (¿Playwright en CI?) y cómo se mantienen frescas.
2. **La app no enlaza a `/conoce`.** A propósito: la orden prohíbe tocar features. Pero un enlace
   discreto desde Ajustes ("Conoce la app") le daría a la familia una puerta permanente. Queda
   como propuesta para el ciclo H2.
3. **`docs/MANUAL-DE-USO.md` no menciona el brochure**, a propósito: si el brochure entrara al
   manual como feature, el N del conteo se movería solo. Vale la pena que el molde fije esta regla
   (el brochure documenta la app; no se documenta a sí mismo).
4. **`docs/CATALOGO-CAPSULAS.html` quedó con etiquetas pre-ortografía** ("bano" en vez de «baño»)
   — stale del S4, de habla y no del kit. Se regenera con `node scripts/gen-catalogo-capsulas.mjs`;
   no se hizo aquí porque la orden acota la entrega al brochure.
5. **`/conoce.html` también responde directamente** (además de `/conoce`). Inofensivo para una app
   familiar sin SEO; se anota por completitud.

## Estado de cierre

- [x] `docs/BROCHURE.html` autocontenido, 4 capas, 6 tarjetas, 24 features con conteo verificable.
- [x] `/conoce` sirve el mismo contenido, sin duplicación manual.
- [x] **Rediseño CINE (v2)** sobre el storyboard aprobado: 8 escenas, gramática dominante G3 con
      un momento G1 sereno y G2 en las tarjetas, motor vanilla de ~60 líneas (cero librerías).
- [x] Motion con las **tres excepciones declaradas y comentadas** a solo-`transform`/`opacity`
      (`grid-template-rows`, `stroke-dashoffset`, `filter: blur` de apertura), y
      `prefers-reduced-motion` como experiencia **completa** — verificada en los dos modos con
      una sonda propia, no asumida.
- [x] A11y: teclado completo, `aria-expanded`/`aria-controls` correctos, contraste AA en los dos
      temas, lo cerrado fuera del árbol de accesibilidad y el LCP naciendo pintado.
- [x] **Tres rondas de corrección del gate visual (v3 · v4 · v5)**: las cuatro canchas jugando,
      el recorrido que pasa páginas al bajar y las deja cerradas al subir, los 10 enlaces
      directos, el acto del Estudio y el altavoz donde la app lo tiene.
- [x] `/self-review` + pasada de capturas; **13 defectos hallados y corregidos** en total (2 del
      molde en la v1, 2 propios en la v2, 9 que solo se veían mirando la imagen).
- [x] Cero cambios de comportamiento en la app.
- [x] **CI verde en el PR #7** (quality · e2e · lighthouse · Vercel).
- [ ] **Gate visual del usuario sobre la v5** — la v1 lo reprobó; de la v2 en adelante fue puliendo
      ronda a ronda, y esta cierra sus cinco últimas correcciones.
- [ ] Merge a la orden del usuario → él envía el link de producción a la mamá.
