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
| `pnpm test:e2e`                    | **161 verdes** (149 heredados + 12 nuevos de `/conoce`)             |
| Lighthouse local en `/conoce`      | **100 / 100 / 100 / 100** (perf · a11y · best-practices · SEO)      |
| Presupuestos de `perf-budget.json` | FCP 0,8 s (tope 1,5) · LCP 0,9 s (tope 3,8) · TBT 0 ms · CLS 0      |
| Autocontenido                      | grep: cero `src`/`href`/`@import`/`url(`/`http`/`fetch`             |
| Higiene de contenido               | cero emojis · cero datos del menor · cero "manual" en texto visible |

**Los 12 e2e:** la ruta responde 200 con su portada · las 6 tarjetas llegan cerradas · una abre y
cierra con `aria-expanded` correcto y su detalle visible · **lo cerrado no llega al lector de
pantalla** (se mira el árbol de accesibilidad real por CDP, no el pixel) · el conteo del pie está
presente · axe limpio en los dos temas con todo el detalle abierto.

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
- [x] Motion G3 + G2 (con la excepción declarada de `grid-template-rows`), y `prefers-reduced-motion`
      como experiencia **completa**: todo el contenido llega, sin movimiento.
- [x] A11y: teclado completo, `aria-expanded`/`aria-controls` correctos, contraste AA en los dos
      temas, y lo cerrado fuera del árbol de accesibilidad.
- [x] `/self-review` corrido, con sus dos hallazgos corregidos y verificados.
- [x] Cero cambios de comportamiento en la app.
- [ ] **CI verde en el PR.**
- [ ] **Gate visual del usuario sobre la preview** (obligatorio: aprueba el brochure de habla Y
      sella el molde v1.9.0 con el caso real enfrente).
- [ ] Merge a la orden del usuario → él envía el link de producción a la mamá.
