# Design System — Hablemos San

> Fuente de verdad visual de la app. Creado en el Sprint 001 tomando como **referencia visual**
> los tokens del prototipo legado (`referencias-ui/habla/Habla Santy/design-system.md`, paleta
> "Clínica cálida"). Las 9 pantallas funcionales de ese prototipo están **ANULADAS** — de ahí no
> se hereda ningún flujo, layout ni feature; solo el lenguaje visual.
> Implementación: `src/app/globals.css` (Tailwind v4, `@theme` + capa semántica).

## Filosofía — "Clínica cálida"

Dos audiencias, una paleta dual:

- **Operador (el padre):** calidez informativa sin estética de dashboard. Verde salvia como
  primario (regulación, restauración), crema en vez de blanco puro (menos fatiga), coral y ámbar
  solo para celebrar hitos y la voz parental. Soporta light y dark (uso nocturno).
- **Niño (4–6, perfil neurodivergente):** calma y cero ruido visual. Paleta propia, **SIEMPRE
  clara** (sin dark mode — la pantalla del juego no cambia con el sistema), áreas táctiles
  grandes, contraste alto solo en lo accionable.

Regla de oro: **la vista del niño es soberana** — ningún elemento del operador se filtra al
escenario del juego (solo un botón de salir, pequeño y discreto, para el padre).

## Paleta

### Capa semántica (lo ÚNICO que consume la UI)

La UI usa utilidades semánticas (`bg-fondo`, `bg-superficie`, `text-tinta`, `text-tinta-suave`,
`bg-acento`, `border-borde`, `bg-celebracion`, …), nunca primitivos ni hex directos.

| Token                                  | Operador light                                | Operador dark | Niño (`.tema-nino`) |
| -------------------------------------- | --------------------------------------------- | ------------- | ------------------- |
| `fondo`                                | cream-50 `#FBF8F2`                            | `#14171A`     | kid-bg `#FFF9EE`    |
| `superficie`                           | cream-100 `#F5F0E5`                           | `#1B1F22`     | cream-50 `#FBF8F2`  |
| `borde`                                | cream-200 `#ECE4D2`                           | `#232830`     | cream-200 `#ECE4D2` |
| `tinta`                                | ink-900 `#1F2420`                             | `#F2EFE8`     | kid-ink `#2B3530`   |
| `tinta-suave`                          | ink-500 `#5A615C`                             | `#969994`     | ink-500 `#5A615C`   |
| `acento`                               | sage-700 `#2E4628`                            | `#B5D5AB`     | kid-sage `#A8C9A0`  |
| `acento-hover`                         | sage-600 `#3F5F37`                            | `#94BB89`     | sage-400 `#7AA070`  |
| `acento-suave`                         | sage-100 `#DCE6D8`                            | `#233022`     | sage-50 `#EEF2EC`   |
| `celebracion`                          | coral-500 `#DD7B5E`                           | coral-500     | kid-peach `#FFC7B0` |
| `exito` / `aviso` / `peligro` / `info` | `#527947` / `#C99432` / `#B14B3D` / `#4A6E84` | =             | =                   |

**Modo calma** (`.tema-nino--calma`): acentos desaturados (sage-200 `#B8CDB1`), celebración en
crema — la paleta baja de intensidad; además el componente oculta medidor y meta (eso es lógica,
no CSS).

### Primitivos (solo para construir la capa semántica)

- **Sage:** 50 `#EEF2EC` · 100 `#DCE6D8` · 200 `#B8CDB1` · 400 `#7AA070` · 500 `#527947` ·
  600 `#3F5F37` · 700 `#2E4628`
- **Coral (logros):** 100 `#FBE3DA` · 300 `#F5B4A0` · 500 `#DD7B5E` · 700 `#A95239`
- **Ámbar (voz parental):** 100 `#F8E9C8` · 300 `#ECC56F` · 500 `#C99432` · 700 `#8C6113`
- **Cream:** 50 `#FBF8F2` · 100 `#F5F0E5` · 200 `#ECE4D2` · 300 `#DDD2BB`
- **Ink:** 900 `#1F2420` · 700 `#353B36` · 500 `#5A615C` · 400 `#7A8079` · 300 `#9CA29C`
- **Niño:** bg `#FFF9EE` · sage `#A8C9A0` · peach `#FFC7B0` · sky `#BCD9E2` · yellow `#FFE08A` ·
  ink `#2B3530`

Contrastes verificados en el prototipo: ink-900/cream-50 15.9:1 (AAA) · ink-500/cream-50 5.4:1
(AA) · cream-50/sage-700 9.6:1 (AAA) · sage-700/sage-100 6.4:1 (AA). No introducir colores
nuevos sin derivarlos de la paleta.

## Tipografía

- **Geist** (UI, 400/500/600) · **Geist Mono** (etiquetas, eyebrows y datos en bloque —
  **no** para cifras dentro de una frase: la coma decimal monoespaciada se lee como "3 , 1";
  ahí va Geist con `tabular-nums`) · **Instrument Serif**
  (display, la "voz humana": el saludo del día, la pregunta del juego; itálica para palabras del
  niño o conceptos citados). Utilidades: `font-sans`, `font-mono`, `font-display`. Nunca
  Inter/Roboto.
- Escala (px/line-height): display 44/1.05 serif · h1 28/1.15 · h2 20/1.20 · h3 16/1.30 ·
  body 14/1.5 · small 12/1.45 (tinta-suave) · eyebrow 11 mono UPPER tracking 0.08em.
- **Vista del niño: texto nunca < 18 px; la pregunta/consigna del juego ≥ 30 px.**

## Espaciado, radios, sombras, movimiento

- **Espaciado:** base 4 px (escala Tailwind). Vista del niño: padding generoso 24–32 px.
- **Radios (escala Tailwind v4):** chips `rounded-md` (8) · inputs/botones `rounded-xl` (12) ·
  cards `rounded-2xl` (16) · hero/escenario del juego `rounded-3xl` (24) · pills `rounded-full`.
- **Sombras:** `shadow-suave` (hairline) · `shadow-tarjeta` (border-as-shadow) ·
  `shadow-flotante` (hover) · `shadow-modal`.
- **Movimiento:** duraciones `--dur-rapida` 120 ms · `--dur-media` 220 ms · `--dur-lenta`
  380 ms, curva `--ease-suave` (out-soft). **`prefers-reduced-motion` y el ajuste de la app
  (`html[data-reducir-animacion="true"]`) apagan TODA animación** (0.01 ms); el pulso decorativo
  del día se desactiva por completo. El candidato LCP de cada ruta **nace estático** — jamás
  envuelto en un wrapper que arranque en `opacity: 0` (patrón `lcp-nace-estatico`).

## Accesibilidad y reglas de interacción (COGA)

- **Touch:** niño ≥ 64 px (en el escenario del juego: ≥ 96 px); adulto ≥ 44 px.
- **Sin límite de tiempo, sin game-over, sin castigo por error.** Toda pantalla "mala" (mic
  denegado, ruido alto, silencio largo) tiene salida amable y honesta.
- Nada comunica **solo** con color; estados vacío/carga/error explícitos; foco visible;
  navegable con teclado; axe limpio.
- Baja densidad de información; una acción principal por pantalla; transiciones anunciadas.

## Reglas de contenido visual

- **Celebración honesta:** la UI celebra con la métrica real medida (Geist Mono para el número).
  Prohibido el confeti desacoplado del desempeño.
- **PrivacyNotice obligatorio** en toda superficie que toque el micrófono: qué se escucha, qué
  se mide y que **nada se guarda ni sale del dispositivo**. Es contrato, no decoración.
- Lenguaje empático: jamás "déficit", "diagnóstico", "terapia" ni plazos; microcopy es-CO
  cálido, directo, sin culpa.
- Iconos estilo line (stroke 1.5, viewBox 24, `currentColor`), `aria-hidden` + `aria-label` en
  icon-only.
