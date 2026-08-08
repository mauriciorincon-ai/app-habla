# Informe del piloto — El brochure vivo de Hablemos San

> **Para la planeadora.** Este es el informe de aprendizaje de la entrega ENTREGA-BROCHURE
> (kit v1.9.0), escrito para que el estándar de las otras 4 apps herede lo que aquí costó
> aprender. La historia en una línea: **el primer resultado fue rechazado sin medias tintas
> («todo mal, TODO TODO») y el último fue aprobado como sobresaliente («está espectacular»)
> — y la diferencia no fue esfuerzo, fue MÉTODO.** Todo lo afirmado aquí tiene evidencia en
> este repo: el summary (`ENTREGA-brochure-summary.md`), el storyboard con su adenda
> (`ENTREGA-brochure-storyboard.md`) y los 14 commits del PR #7.
>
> Escrito el 2026-08-08, con la entrega ya en producción pública:
> `https://hablemos-san.vercel.app/conoce`.

---

## 1 · Qué pasó, en orden

| Acto             | Qué se hizo                                                                                                                                                                                    | Qué pasó                                                                                                                                                   |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **v1**           | Se estampó la plantilla BROCHURE del kit v1.9.0, fielmente: 4 capas, acordeón, fade-up, conteo                                                                                                 | **CI verde, Lighthouse 100 — y el usuario la RECHAZÓ**: «la parte inicial tiene un pequeño viso de lo que podría ser el diseño, pero hacia abajo todo mal» |
| **Diagnóstico**  | Se leyó el harness del Estudio CINE completo antes de tocar código                                                                                                                             | El defecto era **del molde, no de la ejecución** (§3)                                                                                                      |
| **Guion**        | Storyboard G-Guion: 8 escenas, gramática y técnica justificada por escena, clímax explícito, variante reduced-motion por escena                                                                | Aprobado por el usuario («guion aprobado») **antes de escribir una línea de HTML**                                                                         |
| **v2**           | Rediseño CINE: motor vanilla (~60 líneas), hilo del globo, titular que se enfoca, iconos que se dibujan, escena nocturna para la privacidad                                                    | **«Está espectacular el resultado»** — y arrancaron las correcciones en frío                                                                               |
| **v3–v6**        | Cuatro rondas de gate visual del usuario: 4 canchas jugando, acordeón que pasa páginas, 10 enlaces directos, acto del Estudio, apertura anunciada, regreso limpio, canchas armadas como la app | Cada ronda cazó defectos que **ninguna automatización veía** (§4)                                                                                          |
| **Auditoría**    | A orden del usuario, pre-merge, en dos fases (solo lectura → fixes aprobados)                                                                                                                  | 9 hallazgos, 0 bloqueantes; datos factuales y microcopy citado: **cero errores**                                                                           |
| **Última milla** | Verificación del link de producción **desde afuera, sin sesión**                                                                                                                               | Hallazgo mayor: **toda la app llevaba semanas detrás del login de Vercel** y nadie lo sabía (§5)                                                           |

Resultado final: **249 unit · 165 e2e · Lighthouse 100/100/100/100 · FCP 0,2 s · TBT 0 ms ·
CLS 0**, gate visual aprobado, producción pública con dominio propio de la familia.

---

## 2 · La lección central: verde no es bueno

La v1 tenía la CI entera en verde y era un fracaso. La frase del Estudio CINE que el molde
cita pero no operacionaliza resultó ser el corazón de todo:

> **«La CI verifica el comportamiento, no la experiencia.»**

Esta entrega la convirtió en dato. De los **16 defectos** corregidos entre la v1 y el
merge, la distribución por quién los cazó fue:

| Gate                                  | Defectos que SOLO ese gate vio | Ejemplos                                                                                                                                                                                                           |
| ------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| CI / axe / Lighthouse                 | 4                              | contrastes a medio fundido, LCP naciendo invisible, acordeón que mentía al lector de pantalla (CDP)                                                                                                                |
| **Mirar capturas** (Playwright + ojo) | **12**                         | icono heredando el tamaño del vecino, chip descentrada por keyframes que terminan en `transform: none`, altavoz fuera del marco, globos tapando la palabra, gato caído del marco, cohete con pasto en vez de cielo |
| **El gate visual del usuario**        | las 11 correcciones de v3–v6   | «hay DOS teclas, no una», «se anima solo la primera vez», «salta hasta los dos últimos juegos»                                                                                                                     |
| **Verificación externa sin sesión**   | 1 (el mayor)                   | producción entera detrás del login de Vercel                                                                                                                                                                       |

Ningún gate sustituye a otro. El aprendizaje no es «la CI no sirve» — es que **cada capa ve
una clase de defecto que las demás no pueden ver**, y el molde hoy solo exige la primera.

---

## 3 · Por qué la v1 nació muerta (diagnóstico del molde)

**El molde v1.9.0 heredó la LEY del Estudio CINE y ninguna de sus TÉCNICAS.** Declara su
ADN, cita las tres gramáticas — y al estamparse vetó G1 («pesa demasiado»), redujo G2 a un
acordeón y G3 a un `fade-up` con stagger. El estudio tiene 13 patrones catalogados; el
molde usaba 2. Un builder que lo sigue al pie de la letra produce un documento peinado,
inevitablemente.

Y el segundo defecto era de método: **el molde salta la dramaturgia**. No pide storyboard,
no pide clímax, no pide ritmo. Por eso la promesa más importante de la app — la privacidad
— había quedado como el primer acordeón del pie de página: **nadie le preguntó a la pieza
cuál era su clímax.** El motion no era el problema de fondo; la escaleta lo era.

Lo que revirtió el resultado, en orden de impacto:

1. **Storyboard primero (G-Guion).** Contrato aprobado por el usuario antes del HTML:
   mensaje, gramática y justificación narrativa POR ESCENA, clímax explícito, riesgo de
   dirección de arte registrado, variante reduced-motion declarada. El punto más barato
   para corregir es el guion.
2. **Referencias analizadas como TÉCNICAS, no como stacks.** El usuario aportó 5 piezas de
   motionsites que le gustan (React/GSAP/Framer todas); se extrajeron las técnicas y se
   reescribieron en vanilla: un solo `rAF` que escribe variables CSS con inercia
   (`clamp`/`smoothstep`/`lerp`), `container-type` + `cqw` para medir contra la cancha,
   `pathLength` para dibujar el trazo. El motor completo: ~60 líneas, cero librerías,
   autocontenido intacto.
3. **El gate visual como institución, no como trámite.** Cuatro rondas de corrección en
   frío del usuario DESPUÉS de aprobar la dirección. La sala de proyección es un proceso,
   no un sí/no.
4. **Capturas leídas como imagen, en cada ronda** — incluyendo las animaciones **cuadro a
   cuadro** (rebobinar la jugada y capturar en el instante del efecto).
5. **Medir en vez de opinar.** El salto de scroll del acordeón se corrigió con una sonda
   comparada contra la versión anterior: **1291 px → 119 px**. Sin esa medición, el reporte
   habría sido «creo que mejoró».

---

## 4 · Casos de estudio (los que valen para las otras 4 apps)

**a. El hero invisible que pasó todos los gates.** Con `prefers-reduced-motion`, el rig
colapsado daba progreso 1 y desvanecía el titular: la experiencia alterna quedaba EN
BLANCO. Pasó 12 e2e y Lighthouse 100/100 — ningún gate automático miraba esa rama. Se cazó
con una sonda propia. Moraleja: **reduced-motion se verifica activamente** (es de las pocas
cosas de «experiencia» automatizables: cargar con `reducedMotion: "reduce"` y afirmar
opacidad/tamaño de los elementos clave).

**b. El acordeón que mentía al lector de pantalla.** El patrón de colapso del molde
(`grid-template-rows: 0fr` + `overflow: hidden`) engaña al ojo pero no al árbol de
accesibilidad: con todo cerrado, un lector recitaba las 24 features mientras
`aria-expanded="false"` afirmaba lo contrario. axe NO lo ve. Se verificó contra el árbol
real por CDP y se corrigió con `visibility` en la transición. La progressive disclosure —
el corazón del entregable — no existía para esa persona.

**c. La demostración falsa.** La jugada de «palabras gemelas» estaba perfectamente animada
y era **mentira**: mostraba una tecla cuando el juego real tiene dos. Lo cazó el usuario
mirando. Una maqueta puede estar impecable y desinformar — la fidelidad al producto real es
un criterio de revisión en sí mismo, y la respuesta correcta suele estar en la app: al ir a
corregir el altavoz, el arreglo y la fidelidad resultaron ser el mismo cambio.

**d. La última milla: la entrega se prueba sin sesión.** Con todo mergeado y desplegado, el
link de producción daba login de Vercel a cualquier persona sin cuenta. El proyecto llevaba
así desde su creación (`Vercel Authentication: all_except_custom_domains`) y NADIE lo había
visto: la CI corre adentro, el usuario navega logueado, Lighthouse corre local. Solo
apareció al verificar **como lo verificaría la destinataria: desde afuera, sin sesión**
(curl/incógnito). Se corrigió a modo `preview` (producción pública, previews protegidas) y
de paso se reclamó el dominio con nombre real (`hablemos-san.vercel.app` — el sufijo `-rho`
existía porque `app-habla.vercel.app` es de otra cuenta). **Ninguna entrega a usuario final
está cerrada hasta que el link se probó sin sesión** — y el dominio/protección deben estar
en el BLUEPRINT (en habla aún no están: deuda anotada para H2).

**e. La auditoría pre-merge en dos fases funcionó.** Fase 1 solo lectura (archivo completo,
datos factuales contra el código de la app, sondas, casos borde) con severidades; Fase 2
solo sobre lo aprobado. Valor real: verificó que las 50 cápsulas, 5 técnicas (nombres
exactos), 16 hitos y todo microcopy citado fueran VERDAD — un brochure es una promesa
pública sobre el producto, y una cifra inventada ahí cuesta la confianza que el producto se
ganó siendo honesto.

---

## 5 · Lo que el molde v2 debe adoptar (consolidado)

Las 6 correcciones puntuales y la propuesta estructural completa están en el summary
(secciones «Feedback del molde v1.9.0» y «Propuesta concreta: el molde v2»). El
consolidado, en orden de prioridad:

1. **El brochure no se estampa, se PRODUCE**: paso de dramaturgia obligatorio (storyboard
   con clímax explícito) antes del HTML.
2. **Banco de técnicas por gramática, en vanilla, listo para copiar** — sin recetas, «G3»
   degenera en fundido.
3. **Gate de capturas por bloque** (incluyendo animaciones cuadro a cuadro) antes de
   presentar al usuario — aquí cazó 12 de 16 defectos.
4. **e2e obligatorio de reduced-motion** que afirme visibilidad real de los elementos clave.
5. **Checklist de sala de proyección en el molde**, con la frase «la CI estuvo verde con un
   entregable rechazado» para que nadie confunda verde con bueno.
6. **Checklist de última milla**: probar el link de producción SIN sesión + dominio y
   protección de deployment documentados en el blueprint.
7. Las correcciones puntuales: `visibility` en el acordeón, LCP jamás desde `opacity: 0`,
   `<h3><button>` y no al revés, icono del design system (no `[EMOJI]`), tabla de mapeo
   como evidencia del conteo N, trade-off de webfonts declarado, nota de `data-tema`,
   dial de motion fijado con el usuario y presupuesto de scroll móvil.

Y una de proceso, transversal al método: **cuando se corrige algo medible, se mide contra
la versión anterior** (la sonda del salto). «Mejoró» sin número es una opinión.

---

## 6 · Números finales de la entrega

| Métrica                 | Valor                                                                                               |
| ----------------------- | --------------------------------------------------------------------------------------------------- |
| Rondas de gate visual   | v1 rechazada · v2 aprobada · v3–v6 de corrección · v6 sellada («nos vamos así»)                     |
| Defectos corregidos     | **16** (2 del molde en v1 · 2 propios en v2 · 12 solo visibles en imagen)                           |
| Tests                   | 249 unit (intactos) · **165 e2e** (149 heredados + 16 nuevos de `/conoce`)                          |
| Lighthouse en `/conoce` | **100 / 100 / 100 / 100** · FCP 0,2 s · LCP 0,2 s · TBT 0 ms · CLS 0                                |
| Peso                    | 1 archivo autocontenido (~120 KB, cero peticiones externas, abre con doble clic)                    |
| Conteo                  | 24 funcionalidades, con tabla de mapeo verificable en el summary                                    |
| Auditoría pre-merge     | 9 hallazgos (1 media + 4 bajas corregidas, 4 observaciones aceptadas) · datos factuales: 0 errores  |
| Infraestructura         | Producción pública en `hablemos-san.vercel.app` · previews protegidas · PR #7 mergeado con CI verde |

## 7 · Dónde vive cada evidencia

- `sprints/ENTREGA-brochure-summary.md` — el summary completo: tabla de mapeo del conteo,
  diagnóstico del rechazo, análisis de las 5 referencias, feedback del molde, propuesta v2,
  las cuatro rondas del gate, la auditoría.
- `sprints/ENTREGA-brochure-storyboard.md` — el contrato G-Guion aprobado + la adenda con
  lo que cada ronda del gate sumó (el contrato se amplía, no se reescribe).
- `docs/BROCHURE.html` — el canónico, con sus decisiones comentadas en el sitio.
- PR #7 (14 commits, `9ca7a3b…068c45e`) — la cronología con cada porqué en su mensaje.
