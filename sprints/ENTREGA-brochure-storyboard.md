---
id: pieza-brochure-habla-storyboard
titulo: Storyboard — El brochure vivo de Hablemos San (rediseño CINE)
arquetipo: app # plantilla del Estudio CINE (cartelera/_template/STORYBOARD.md) aplicada en app-habla
elemento_tipo: entregable
rigor: completo
capa: producto
version: 0.1.0
fecha: 2026-08-07
estado: propuesto # → aprobado cuando el usuario diga «guion aprobado»
objetivo: "El recorrido de la mamá por la app, contado con el motion narrativo del Estudio CINE: su scroll es la voz sostenida que hace subir al globo."
depende_de: [ENTREGA-brochure-summary.md]
relacionado_con: [docs/BROCHURE.html]
tags: [pieza, storyboard, g-guion, brochure]
---

# Storyboard — El brochure vivo de Hablemos San

> **El contrato de G-Guion.** Sin este documento aprobado («guion aprobado») no se toca el
> HTML. Si no reconoces aquí tu idea, se corrige aquí — el punto más barato.
> Cobertura: **todos los mensajes del brochure (n/n)** — agrupar sí, omitir jamás.
>
> **Decisiones del usuario ya selladas (2026-08-07):** storyboard primero · dial
> MOTION_INTENSITY = **cine sereno** (coreografía constante, curvas suaves — fiel a la
> personalidad "cálida, honesta, serena": la prueba del padre cansado a las 8 pm) ·
> estructura **capas + escenas** (la progressive disclosure es sagrada; el cine la rodea).

## La narrativa

Ella abre el link en su teléfono. Lo primero que ve no es un documento: es **el globo
subiendo a su lugar** mientras el título se enfoca palabra por palabra, como una voz que
arranca tímida y agarra fuerza: _Su voz mueve el mundo._ Abajo, una invitación quieta:
baja cuando quieras.

Y al bajar descubre la regla del viaje: **por el borde de la pantalla sube un globo
pequeñito con su cuerda** — sube mientras ella avanza, exactamente como en la app sube
mientras el niño sostiene la voz. Su recorrido ES la voz sostenida. Nadie se lo explica;
se siente.

Las seis puertas la esperan respirando: entran asentándose una tras otra, cada una con su
icono que **se termina de dibujar a mano** al llegar. Ninguna se abre sola. Cuando ELLA
toca una, la tarjeta se abre como un telón sereno y por dentro las features se acomodan en
fila, cada una llegando un instante después de la anterior. El globo y el cohete la saludan
desde su escenario claro con un gesto mínimo — están vivos, pero tranquilos.

Entre "qué hace" y "los detalles finos", un respiro: **el globo de verdad cruza la
pantalla, toca la línea y estalla UNA vuelta de confeti** — la mecánica del juego contada
en dos segundos, sin una palabra de más.

Y entonces, el clímax — que no es un truco: es la promesa. Un marco de tablet dibujado en
trazo; adentro, **una barra de sonido que baila** como la del Estudio de la app… y se
apaga ahí mismo. Nada — ni una línea, ni un punto — cruza jamás el borde del marco.
_La voz de tu hijo nunca se graba, ni se guarda, ni sale de aquí._ El motion ES el
argumento: lo que pasa adentro, muere adentro.

Cierra con la verdad contable: el número **24 se cuenta a sí mismo** hasta llegar, el
globo del borde llega a su meta con su vueltica de confeti discreta, y la página le dice
lo único que un anti-manual puede prometer: _todas están aquí, y las descubres a tu
ritmo._

## Decisiones de pieza

- **Gramática dominante: G3** (coreografía temporizada + IntersectionObserver) — es la
  gramática del sosiego: entradas dirigidas, sin secuestrar el scroll, perfecta en móvil.
  **Un momento G1 con justificación narrativa** (el hilo del globo: scroll→altura, mapeo
  puro y testeable, sin pin ni scrub-jack). **G2 en las tarjetas** (máquina de estados
  abierta/cerrada que ya existe, ahora con coreografía interior).
- **Formato:** scroll de una página, móvil primero (ella lo lee en el teléfono).
- **Motion-system (tokens de la pieza, derivados del DS de habla):**
  - Curvas: `--ease-suave` (la del DS) + `--ease-asentar` `cubic-bezier(0.22, 1, 0.36, 1)`
    (decelera largo, sin rebote — el "aliento" de la pieza).
  - Duraciones: las del DS (120/220/380 ms) + escala de escena: `--dur-escena` 600 ms ·
    `--dur-apertura` 900 ms. Nada de números mágicos sueltos.
  - Vocabulario: **enfocar** (blur→nítido) · **alzar** (sube y se asienta) · **dibujar**
    (el trazo se completa) · **bailar** (la barra de sonido) · **volar** (el globo) ·
    **latir** (pulso lento de invitación).
  - Stagger con jerarquía, jamás uniforme: título → apoyo → señal; tarjetas a 70 ms con
    la primera (la estrella) entrando sola un beat antes.
- **Identidad en una frase (dirección de arte):** _"La página respira como la app
  escucha: todo lo que se mueve, se mueve como movido por una voz."_
- **El riesgo registrado de la pieza:** el **hilo del globo** — un personaje persistente
  guiado por scroll en el margen de un brochure. Raro en un documento, imposible de
  confundir con una plantilla; es el alma del producto vuelta navegación. Lo juzgas tú en
  la sala de proyección.
- **Excepciones declaradas a "solo transform/opacity":** (1) `grid-template-rows` en la
  apertura de tarjeta (heredada del molde, un solo disparo por clic); (2)
  `stroke-dashoffset` para **dibujar** los iconos de trazo (técnica insignia del estudio,
  corre UNA vez por icono al entrar, sobre SVG decorativo `aria-hidden`); (3) `filter:
blur()` en **enfocar** (apertura y nada más — blur nunca en scroll). Las tres van
  comentadas en el código con su porqué.
- **Reglas que el cine NO negocia:** autocontenido (vanilla, cero librerías — patrón
  "plataforma nativa antes que librería") · reduced-motion = **corte editorial completo**
  (cada escena declara su variante abajo) · el candidato LCP nace pintado (el titular se
  enfoca desde blur con **opacidad 1** — nunca desde invisible) · lo cerrado fuera del
  árbol de accesibilidad (ya blindado por e2e) · presupuestos de perf intactos · el
  conteo 24 del pie intacto (el e2e lo vigila).

## Inventario COMPLETO de escenas

### E01 · Apertura — la voz que arranca

| Campo                                | Valor                                                                                                                                                                     |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mensaje**                          | Identidad y promesa: _Su voz mueve el mundo_ — esto no es un manual, es la app hablándote.                                                                                |
| **Gramática**                        | G3                                                                                                                                                                        |
| **Técnica**                          | Cascada blur-to-focus palabra por palabra (patrón yevtam) + el globo **alza** hasta su sitio + la promesa **alza** con retraso + señal de bajar que **late** lento.       |
| **Cómo el motion cuenta el mensaje** | El título se enfoca como una voz que arranca insegura y termina firme — el arco del niño que esta app acompaña. El globo llega ANTES de que leas: el personaje te recibe. |
| **Assets + origen**                  | Globo SVG (ya en la pieza) · título en spans por palabra (`aria-hidden`, texto íntegro en `aria-label`).                                                                  |
| **Peso estimado**                    | +0 KB assets · ~1 KB CSS/JS.                                                                                                                                              |
| **Frame budget / propiedades**       | `transform` + `opacity` + excepción declarada `filter: blur(3px→0)` con opacidad SIEMPRE 1 en el h1 (LCP honesto).                                                        |
| **Reduced-motion**                   | Todo en su pose final desde el primer frame; la señal de bajar no late (flecha quieta). Nada falta.                                                                       |

### E02 · El hilo del globo — tu recorrido es la voz _(el riesgo de la pieza)_

| Campo                                | Valor                                                                                                                                                                                                                        |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mensaje**                          | La mecánica madre de la app: la voz sostenida hace avanzar al globo — aquí, tu avance lo hace subir.                                                                                                                         |
| **Gramática**                        | **G1 serena** (scroll→progreso, mapeo puro; sin pin, sin scrub-jack, sin tocar la rueda).                                                                                                                                    |
| **Técnica**                          | Cuerda hairline sage por el borde izquierdo que se extiende con el scroll + globo pequeñito (~20 px) que sube sobre ella, con `translateY` interpolado en rAF (τ suave — igual que el personaje del juego, que nunca salta). |
| **Cómo el motion cuenta el mensaje** | Es la tesis del producto hecha navegación: sostener (el recorrido) hace subir al globo. Al llegar al pie, el globo toca su meta (ver E08).                                                                                   |
| **Assets + origen**                  | Globo mini reutilizado (mismo SVG, 20 px) · línea CSS.                                                                                                                                                                       |
| **Peso estimado**                    | ~1,5 KB JS (listener con rAF — patrón sancionado; el mapeo scroll→altura es función pura).                                                                                                                                   |
| **Frame budget / propiedades**       | Solo `transform: translateY/scaleY`. Cero lectura de layout en el tick (medidas cacheadas en `resize`).                                                                                                                      |
| **Reduced-motion**                   | El hilo no existe como animación: aparece completo con el globo arriba, quieto (decoración estática de margen).                                                                                                              |

### E03 · Las seis puertas — entradas con oficio

| Campo                                | Valor                                                                                                                                                                                                                                                               |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mensaje**                          | Qué hace la app, en 6 grupos — y que se sienta la mano que lo hizo (esto no es plantilla).                                                                                                                                                                          |
| **Gramática**                        | G3                                                                                                                                                                                                                                                                  |
| **Técnica**                          | Tarjetas que **alzan y se asientan** con stagger jerárquico (la estrella entra sola un beat antes; las demás a 70 ms) + cada icono de trazo **se dibuja** (`stroke-dashoffset`, una vez) al entrar su tarjeta + hairline bajo cada `h2` que se extiende (`scaleX`). |
| **Cómo el motion cuenta el mensaje** | El orden de aparición ES la jerarquía (la estrella primero — la elevaste tú en G-Visión). El trazo dibujándose dice "hecho a mano para él", el argumento anti-genérico de toda la app.                                                                              |
| **Assets + origen**                  | Los 6 iconos ya existen; se les calcula `pathLength`.                                                                                                                                                                                                               |
| **Peso estimado**                    | ~1 KB.                                                                                                                                                                                                                                                              |
| **Frame budget / propiedades**       | `transform`/`opacity` + excepción declarada `stroke-dashoffset` (decorativo, un disparo).                                                                                                                                                                           |
| **Reduced-motion**                   | Tarjetas e iconos completos desde el primer frame.                                                                                                                                                                                                                  |

### E04 · La tarjeta abierta — el telón sereno (G2)

| Campo                                | Valor                                                                                                                                                                                                                                                                                                                                              |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mensaje**                          | Nadie lee lo que no pidió — pero cuando pides, la casa te recibe ordenada.                                                                                                                                                                                                                                                                         |
| **Gramática**                        | G2 (máquina de estados cerrada/abierta que ya existe).                                                                                                                                                                                                                                                                                             |
| **Técnica**                          | Apertura `grid-rows` (heredada) + **coreografía interior**: las features **alzan** en fila (stagger 40 ms), los personajes saludan un gesto mínimo — el globo hace una flotadita única, la llama del cohete **tiembla en dos poses** (`steps(2)`, patrón boiling-line de tbh, 600 ms y se queda quieta) + presión táctil del botón (`scale 0.99`). |
| **Cómo el motion cuenta el mensaje** | El detalle no "aparece": te lo van sirviendo en orden de lectura. Los personajes vivos-pero-tranquilos son la promesa sensorial de la app (viva, jamás estridente).                                                                                                                                                                                |
| **Assets + origen**                  | Todo existe.                                                                                                                                                                                                                                                                                                                                       |
| **Peso estimado**                    | ~1 KB.                                                                                                                                                                                                                                                                                                                                             |
| **Frame budget / propiedades**       | `transform`/`opacity` (+ `grid-rows` ya declarada).                                                                                                                                                                                                                                                                                                |
| **Reduced-motion**                   | La tarjeta abre sin transición con TODO su contenido en pose final (comportamiento actual, que ya está blindado por e2e).                                                                                                                                                                                                                          |

### E05 · El respiro — la vuelta del globo

| Campo                                | Valor                                                                                                                                                                                                                                                                                                |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mensaje**                          | Así se ve jugar: la voz sostiene, el globo cruza, la vuelta se celebra — y nada se pierde.                                                                                                                                                                                                           |
| **Gramática**                        | G3 (corrida temporizada al entrar en viewport, una sola vez).                                                                                                                                                                                                                                        |
| **Técnica**                          | Franja de escenario claro (kid-bg) entre capa 1 y capa 3: el globo grande cruza de izquierda a derecha (~2,5 s, curva del juego), toca la línea de meta y estalla **UNA** caída de confeti con los colores de fiesta (cae y se va, como en la app); leyenda: _"Cada 3 segundos de voz, una vuelta."_ |
| **Cómo el motion cuenta el mensaje** | Es la demo del juego sin pedirle nada a nadie: dos segundos de verlo y ya entendió el globo mejor que con un párrafo. Y el confeti honesto de la app (corre una vez y se va) queda demostrado, no descrito.                                                                                          |
| **Assets + origen**                  | Globo + confeti: SVG/CSS propios (los colores `--color-fiesta-*` se toman de `globals.css`).                                                                                                                                                                                                         |
| **Peso estimado**                    | ~2 KB.                                                                                                                                                                                                                                                                                               |
| **Frame budget / propiedades**       | Solo `transform`/`opacity` (el confeti son ~14 partículas `transform`, generadas con variación **precalculada** — sin aleatoriedad en runtime, seed en comentario: determinismo del estudio).                                                                                                        |
| **Reduced-motion**                   | El cuadro final estático: globo junto a la meta + la leyenda. El confeti no corre (regla de la app) y el texto sigue contando el logro.                                                                                                                                                              |

### E06 · El clímax — lo que pasa adentro, muere adentro

| Campo                                | Valor                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mensaje**                          | LA promesa: la voz de tu hijo nunca se graba, ni se guarda, ni sale del aparato.                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| **Gramática**                        | G3                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| **Técnica**                          | Escena propia (deja de ser el primer acordeón): marco de tablet dibujado en trazo; adentro, 5 barras que **bailan** (`scaleY`, como el medidor real del Estudio) mientras la escena está en viewport, y cada pocos segundos **se asientan en línea plana** (el sonido se analizó y murió); una cuerda punteada que intenta salir del marco se queda SIEMPRE a medio dibujar y se borra (nada cruza el borde, literalmente). El texto completo de privacidad queda VISIBLE debajo — la promesa no se esconde en un acordeón. |
| **Cómo el motion cuenta el mensaje** | El argumento técnico ("se analiza en memoria y se descarta") vuelto imagen: lo que baila adentro se apaga adentro; el borde del marco es la frontera que nada atraviesa. Es la única escena con loop ambiental — porque es la única promesa que nunca descansa.                                                                                                                                                                                                                                                             |
| **Assets + origen**                  | Marco + barras: SVG propio nuevo (trazo 1.5, estilo iconos de la app).                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| **Peso estimado**                    | ~2 KB.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| **Frame budget / propiedades**       | `transform: scaleY` en las barras · la cuerda punteada con `stroke-dashoffset` (excepción ya declarada) · loop pausado fuera de viewport (IO) y bajo `document.hidden`.                                                                                                                                                                                                                                                                                                                                                     |
| **Reduced-motion**                   | Composición estática: barras a media altura dentro del marco + línea plana + el mismo texto íntegro. El mensaje completo sin un solo frame de movimiento.                                                                                                                                                                                                                                                                                                                                                                   |

### E07 · Lo fino — los acordeones que quedan

| Campo                                | Valor                                                                                                                                                                     |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mensaje**                          | Qué mide (y qué no finge medir) · requisitos y qué no es · el mapa de rutas.                                                                                              |
| **Gramática**                        | G3 + G2 (details nativo).                                                                                                                                                 |
| **Técnica**                          | Entradas **alzar** con el reveal general; al abrir un `details`, su cuerpo **alza** una vez (60 ms de retraso interior). Sin más: aquí la página baja la voz a propósito. |
| **Cómo el motion cuenta el mensaje** | Ritmo (regla del método: toda escena clímax = ninguna lo es). Después del clímax, sosiego — lo fino se lee, no se dramatiza.                                              |
| **Assets + origen**                  | Existe todo.                                                                                                                                                              |
| **Peso estimado**                    | ~0,3 KB.                                                                                                                                                                  |
| **Frame budget / propiedades**       | `transform`/`opacity`.                                                                                                                                                    |
| **Reduced-motion**                   | Apertura instantánea completa.                                                                                                                                            |

### E08 · El cierre — el número que se cuenta solo

| Campo                                | Valor                                                                                                                                                                                                                                                                                                                                     |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mensaje**                          | Están las 24, ninguna por fuera — y este recorrido termina en logro, como un juego de la app.                                                                                                                                                                                                                                             |
| **Gramática**                        | G3 (+ remate del G1 de E02).                                                                                                                                                                                                                                                                                                              |
| **Técnica**                          | El **24** se cuenta 0→24 (~700 ms, `tabular-nums`, una vez al entrar en viewport; el texto accesible dice "24 funcionalidades" desde el primer byte — el e2e del conteo ni se entera) · el globo del hilo llega a su meta en el pie y suelta una **mini** caída de confeti (6 partículas, discretísima): tu recorrido completó su vuelta. |
| **Cómo el motion cuenta el mensaje** | El dato duro dramatizado (taxonomía del método) + la metáfora del hilo cerrada: leerlo todo también fue sostener.                                                                                                                                                                                                                         |
| **Assets + origen**                  | Reutiliza el confeti de E05.                                                                                                                                                                                                                                                                                                              |
| **Peso estimado**                    | ~0,5 KB.                                                                                                                                                                                                                                                                                                                                  |
| **Frame budget / propiedades**       | `transform`/`opacity`; el contador muta texto en rAF (sin layout thrash: ancho fijo `ch`).                                                                                                                                                                                                                                                |
| **Reduced-motion**                   | "24" quieto desde siempre; el globo en su meta; sin confeti (el texto ya cuenta el logro — regla de la app).                                                                                                                                                                                                                              |

## Cuadre contra el brief

| Mensaje del brochure                                       | Escena(s)                                                            |
| ---------------------------------------------------------- | -------------------------------------------------------------------- |
| La promesa / identidad ("Su voz mueve el mundo")           | E01                                                                  |
| La mecánica madre (voz sostenida → el globo avanza)        | E02 · E05                                                            |
| Qué hace — los 6 grupos (24 features, la estrella primero) | E03 · E04                                                            |
| El hilo "tu voz dentro de la app" (Estudio → juegos)       | E04 (tarjeta 3) · E06 (la barra que baila es el medidor del Estudio) |
| Co-uso: tú diriges, nadie juega solo                       | E04 (tarjetas 2 y 3, sin cambio de copy)                             |
| Privacidad — la promesa mayor                              | **E06 (clímax)**                                                     |
| Qué mide y qué no finge medir                              | E07                                                                  |
| Requisitos y qué no es                                     | E07                                                                  |
| El mapa de rutas                                           | E07                                                                  |
| Conteo completo y brochure vivo                            | E08                                                                  |

**Total escenas: 8 · Mensajes cubiertos: 10/10.** El copy existente NO cambia (aprobado
implícitamente en el gate — el reclamo fue el diseño); solo se reubica la privacidad de
acordeón a escena.

## Fuentes

- `~/Code/hr03-estudio-cine` — método (`metodo/metodo.md`), estándares y gramáticas
  (`estandares/estandares.md` §G1–G3), skills (`kit-escena/specs/skills/cine-*`),
  patrones (`memoria/patrones-acumulados.md`), referencias analizadas:
  `referencias/yevtam-com.md` (cascada blur-to-focus, física en timeline, plataforma
  nativa) y `referencias/tbh-studiovoila-com.md` (steps(), boiling line, disparo en 3
  capas). Leído completo el 2026-08-07.
- `design-system.md` de habla (personalidad, tokens, colores de fiesta, patrón
  `lcp-nace-estatico`, regla del confeti que corre una vez).
- `docs/MANUAL-DE-USO.md` (las mecánicas que las escenas dramatizan: el globo que no se
  congela, el medidor que baila, la celebración honesta).

## Gaps

- **G1 no tiene ejemplar analizado en el estudio** (el propio estándar lo declara). El
  hilo de E02 es deliberadamente la versión mínima y serena (sin pin, sin scrub de
  timeline); si el usuario aporta 1–2 referencias de motionsites/onepagelove que le
  gusten, se analizan con el protocolo del estudio y E02 se refina en el sprint.
- **El feel no es verificable por CI** ("la CI verifica el comportamiento, no la
  experiencia"): la sala de proyección eres tú, en tu teléfono y tu computador, a
  velocidad real y a scroll lento. Este storyboard es el contrato de qué vas a ver.

---

## Adenda — lo que el gate visual sumó después de la aprobación (v3–v6)

El contrato de arriba (8 escenas) se aprobó con «guion aprobado» y se construyó entero.
Las cuatro rondas del gate visual del usuario lo AMPLIARON — no lo contradijeron:

- **E06a · El acto del Estudio (nueva, v4):** una novena escena, antes del clímax de
  privacidad — «me parece incluso más relevante por lo que debe ir antes de esta». Misma
  noche que E06 (un solo fondo, decidido en v5), distinguida solo por el acento ámbar de
  la voz parental. Su animación: grabas → se queda aquí → viaja → suena en los juegos.
- **E03/E04:** las tarjetas pasan páginas solas al bajar (con anclaje de scroll) y quedan
  cerradas al subir; la apertura se anuncia (marco + destello + telón); 10 enlaces
  directos a las rutas reales.
- **E05:** la galería creció de 1 cancha a las 4, se re-anima en cada pasada, y las
  canchas se arman como la app (marco → palabra → altavoz).

El detalle de cada ronda vive en `ENTREGA-brochure-summary.md` (tabla v3–v6).
