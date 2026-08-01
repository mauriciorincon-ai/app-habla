# Design System — Hablemos San

> Fuente de verdad visual de la app. Creado en el Sprint 001 tomando como **referencia visual**
> los tokens del prototipo legado (`referencias-ui/habla/Habla Santy/design-system.md`, paleta
> "Clínica cálida"). Las 9 pantallas funcionales de ese prototipo están **ANULADAS** — de ahí no
> se hereda ningún flujo, layout ni feature; solo el lenguaje visual.
> Implementación: `src/app/globals.css` (Tailwind v4, `@theme` + capa semántica).

## Personalidad

**Es:** cálida · honesta · serena.
**Jamás será:** clínica (nada de batas blancas ni puntajes) · infantiloide (el niño no es tonto:
nada de colores chillones ni premios falsos) · ansiosa (sin rachas, sin cuentas atrás, sin nada
que apure a un padre que ya carga bastante).

La prueba de fuego de cada pantalla: _¿esto trataría con respeto a un padre cansado a las 8 de la
noche, y a un niño que ese día no quiere hablar?_

## Filosofía — "Clínica cálida"

Dos audiencias, una paleta dual:

- **Operador (el padre):** calidez informativa sin estética de dashboard. Verde salvia como
  primario (regulación, restauración), crema en vez de blanco puro (menos fatiga), coral y ámbar
  solo para celebrar hitos y la voz parental. Soporta light y dark (uso nocturno): sigue al
  sistema por defecto, **y desde el S2 el padre puede fijarlo** en Ajustes (`data-tema` en el
  `<html>` le gana a `prefers-color-scheme`; se aplica antes de la primera pintura, sin parpadeo).
  Los valores de la paleta oscura se declaran **una sola vez** (`--oscuro-*`); los dos caminos que
  la encienden solo mapean.
- **Niño (4–6, perfil neurodivergente):** calma y cero ruido visual. Paleta propia, **SIEMPRE
  clara** (sin dark mode — la pantalla del juego no cambia con el sistema), áreas táctiles
  grandes, contraste alto solo en lo accionable.

Regla de oro: **la vista del niño es soberana** — ningún elemento del operador se filtra al
escenario del juego (solo un botón de salir, pequeño y discreto, para el padre).

### Globos de fiesta (celebración de la palabra — ADR 009)

`--color-fiesta-*` (coral · verde · cielo · sol · uva): los primos **saturados** de la paleta del
niño. La paleta del niño es pastel a propósito —es la pantalla donde él vive, y tiene que ser
calmada—; estos colores existen **solo** para el instante en que el padre dice que dijo la palabra.
Regla: se usan en algo que **sube una vez y se va**, nunca en superficie fija. El sosiego se cuida
por la duración, no por la saturación.

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

**Modo calma** (`.tema-nino--calma`): "atardecer" — el cambio debe ser PERCEPTIBLE en todo el
escenario, no solo en los acentos (hallazgo del gate 2026-07-12). Fondo baja a cream-200,
superficie a cream-100, borde a cream-300, acentos desaturados (sage-200 `#B8CDB1`), celebración
en crema, y los primitivos del niño se atenúan: kid-peach → `#E8CBBD`, kid-sage → `#B3C2AD`,
kid-sky → `#CCD8DB`, kid-yellow → `#ECDFBE` (el globo y el suelo los leen en vivo vía `var()`).
La tinta se queda oscura: el contraste AA no se negocia. Además el componente oculta medidor y
meta (eso es lógica, no CSS), y el globo pasa de "viajar hacia la meta" a "flotar": sube mientras
hay voz real y baja despacio en el silencio — jamás se congela.

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
- **Iconografía propia, cero emojis.** Los iconos viven en `src/components/iconos.tsx`: trazo
  line (stroke 1.5, viewBox 24, `currentColor`), `aria-hidden` salvo que el icono sea el
  contenido. Los emojis están prohibidos como iconos: es la firma del "look de IA con prisa" y,
  peor, cada sistema operativo los dibuja distinto — para un niño con perfil neurodivergente, un
  símbolo que cambia de forma entre dispositivos es ruido, no señal. **Los PERSONAJES son la
  excepción**: el globo y el cohete no son iconos —son los protagonistas del juego— y por eso
  llevan la paleta del niño en vez de `currentColor`.
- **El icono va SIEMPRE a la IZQUIERDA del texto que acompaña** (regla del usuario, gate S4). En
  toda la app: botones, etiquetas, filas de tarjeta, `<summary>`. El ojo entra por el símbolo y
  sigue a la palabra; alternar el lado obliga a re-aprender la pantalla en cada bloque. La
  excepción es el chevron/flecha de "sigue por aquí", que sí va a la derecha porque señala salida,
  no identidad.
- **Los estados existen en PAREJA visible.** Si "hecho" tiene su icono (`IconoHecho`), "todavía
  no" tiene el suyo (`IconoPorHacer`) — nunca se comunica un estado solo por la ausencia del
  otro, que además suele ser el estado más frecuente (la cápsula del día empieza pendiente).
- **Los pictogramas (ARASAAC) no son iconos ni personajes: son CONTENIDO** (ADR 008). Van
  grandes, con su palabra escrita debajo en la display, dentro de un marco con `border-4` que
  cambia de color al encenderse — el estado nunca se comunica solo con color: el texto
  ("¡Le salió la voz!") lo dice también. Atribución CC BY-NC-SA obligatoria en Ajustes.
- **Selector de juegos (COGA):** exactamente 3 tarjetas, siempre en el mismo orden. La
  predictibilidad manda sobre la variedad. Cada tarjeta dice, en mono pequeña, **qué mide** ese
  juego — incluida la promesa incómoda: "mide que hubo voz, nunca qué palabra dijo".

## Patrones de movimiento del juego (Sprint 2)

- **El personaje nunca se congela ni cae por silencio.** Su posición se interpola hacia un
  objetivo (τ ≈ 120–140 ms) en píxeles del escenario, mutando `transform` en un rAF — jamás con
  estado de React (60 fps aunque el medidor emita a ~31/s). El globo viaja hacia la meta; el
  cohete mapea el TONO (escala musical); en modo calma los dos flotan sin meta.
- **Duraciones y curvas:** solo la escala del token (`--dur-rapida/media/lenta` + `ease-suave`).
  Nada de `duration-300` suelto (se coló en el S2 y se corrigió en el gate de diseño).

## Los 5 estados (cada pantalla los tiene diseñados)

| Estado                  | Hoy                                                                     | Juego                                                                                                                                                |
| ----------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Vacío** (primera vez) | Onboarding cálido: apodo + temas + la promesa de privacidad en 2 líneas | Guion del padre — nunca se entra al juego sin él                                                                                                     |
| **Cargando**            | Espacio reservado con la altura final (sin salto de layout)             | Igual; la calibración tiene su propia barra                                                                                                          |
| **Error**               | —                                                                       | Mic denegado: pasos concretos + salida sin culpa ("la actividad también se puede hacer sin pantalla") · Ruido alto: lo dice de frente y deja decidir |
| **Éxito**               | Cápsula marcada: "Hecho hoy. Mañana hay otra" (sobrio, sin fanfarria)   | Celebración honesta con la métrica real; si no hubo voz, se dice sin drama                                                                           |
| **Contenido**           | La cápsula del día                                                      | El personaje respondiendo a la voz (globo/cohete) o el pictograma encendido                                                                          |

**El selector de juegos** no tiene estado vacío ni de error: siempre hay tres juegos, siempre los
mismos. Es, a propósito, la pantalla más aburrida y más predecible de la app.

## Pantallas del padre (Sprint 4)

Dos cuartos nuevos del **operador** (paleta operador, LCP estático, jamás se filtran a la vista del
niño), accesibles desde el encabezado de "Hoy" junto a Ajustes — con iconos propios de trazo
(`IconoBrujula`, `IconoDiana`; stroke 1.5, viewBox 24, `currentColor`):

- **El rumbo** (`/rumbo`) — progreso honesto. **Vacío:** "Todavía no hay nada que contar" + puerta
  a los juegos. **Contenido:** tendencias por semana (números medidos en Geist `tabular-nums`, nunca
  Mono dentro de frase) + hitos funcionales. **Regla de contenido dura:** cero vocabulario clínico
  —ni "puntaje", ni "diagnóstico", ni "nivel", ni "%", ni siquiera negado—; una semana floja es un
  número sin adjetivo (sin rachas que castiguen). Es la mecánica de honestidad hecha pantalla.
- **Objetivo de la semana** (`/objetivo`) — texto libre → alineación determinista. Los 5 estados:
  **vacío** (sin objetivo, campo con placeholder), **escribiendo** (preview honesto en vivo),
  **activo** (tarjeta con "desde…" + quitar), **sin coincidencias** (dice honesto que no encontró
  nada — el caso "colores"), **guardado** (confirmación sobria). Toques del adulto ≥44 px.
