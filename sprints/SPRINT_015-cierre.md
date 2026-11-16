---
sprint: 015
app: habla
hito: H-2
opened: 2026-11-15
closed: 2026-11-15
branch: sprint-015/lo-que-faltaba
pr: "#28"
---
- **Nombre / objetivo:** «Lo que faltaba de verdad» — pagar las siete sub-promesas a medias del H-2 (matriz VISION → código del 2026-11-15).
- **Resultado / estado:** construido y auditado, PR listo; el merge es del dueño.
- **Tiempo:** estimado 3,6 h · real **2,6 h** (`horas-sprint.mjs`: 27 commits, 1 sesión, span 2,1 h; antes de este commit) · diferencia −1,0 h (−28 %).
- **Fases (horas):** F1 0,5 (precache generado, tope en cuentos y videoteca, voz del aparato, celebración, esquema, ADR-027) · F2 0,3 (marco común con Gemelas, calma, siete consignas, ajustes sensoriales, sorpresas) · F3 1,8 (e2e ES/EN, documentos, auditoría pagada, presupuesto, arreglo de CI).
- **Entregables:** `scripts/gen-precache.mjs` + `scripts/precache.mjs` + `public/sw.js` (caché por build); `src/lib/audio/{voz-aparato,sonido-palabra}.ts`; `src/lib/su-mundo/sorpresa.ts` + `components/juego/sorpresa.tsx`; `components/aplicar-intensidad.tsx`; `src/lib/idioma/textos/etapa-nombre.ts`; `decisions/027-what-was-missing.md`; e2e `lo-que-faltaba{,-casi,-mas}.spec.ts`; manual ES/EN, guía (siete pasos nuevos), BLUEPRINT, brochure y export.
- **Evidencia:** unit 1103 de 1103 (62 archivos) · e2e 398 de 398 con `CI=1` (`next start`, incluye `csp` y `sin-red`) · lint y typecheck limpios · Lighthouse local de las 14 URL en verde (script ≤ 354 KB, CLS, LCP) · `cero-enlaces` limpio · `cmp` del núcleo = 0 · 0 PRs abiertos antes de abrir.
- **CI del PR #28 (leída uno por uno):** `quality` pass · `e2e` pass · `lighthouse` pass · `un-pr-vivo` pass · Vercel pass. La primera corrida falló en `e2e` (el test del par de Gemelas en inglés dependía del par del día, y el reloj de la CI está en UTC) y en Vercel (el host arma el build distinto y el precache no hallaba el HTML de «/»); se reprodujo con `CI=1` y se pagó en 65361fd: test sin depender de la fecha + precache tolerante, que cae a todo `.next/static` con aviso. La causa exacta del armado de Vercel queda sin [omitido]; el fallback no deja nada fuera del precache.
- **Capturas leídas como imagen:** Gemelas con la sorpresa visible, móvil (Pixel 7) en claro y oscuro. El aviso fijo cubre a la vista el borde inferior de la tarjeta unos segundos, pero no capta toques; se dejó así y está dicho en `sorpresa.tsx`.
- **Auditoría (Sonnet 5.5 high, solo lectura, matriz VISION re-corrida: 17 MVP + 4 roadmap):**
  - Alcance · pictogramas sin red (`images` optimizadas no entraban al precache): pagado · 656e154 · sorpresa que repetía frase dos días seguidos: pagado · 14bbc15 · aviso del tope perdido al salir antes: pagado · d166fc9. Con eso la matriz queda sin parciales.
  - Calidad · reconocedor oía la voz de la propia app (guarda de eco): pagado · a6b2b87 · fin de una frase cancelada levantaba la guarda de la siguiente: pagado · 3bed4da · `AplicarIntensidad` borraba el atributo antes de hidratar: pagado · 4050173 · paneles de Ajustes que movían «Borrar mis datos» (altura reservada + observador): pagado · cc11b47 · tests que faltaban (aviso sin voz local, «le salió», sorpresa en juego de voz, tope en videoteca): pagado · 79b1272. «dijo la palabra» solo lo cubre el unit de `claveCelebracion`.
  - Seguridad/privacidad · el worker no tenía guarda de audio en ejecución: pagado · 7f0b1fa (guarda + test que lee `sw.js`; ADR-027 §2).
  - Frases caducadas · «las dos consignas», «two invitations», «cuatro juegos», ADR-025, comentarios de `schemas.ts` y `sorpresa.tsx`, pasos `v15-2` y `v15-6` de la guía: pagado · 7f0b1fa.
  - Veredicto: listo para cierre.
- **Desviaciones:** (1) «Sonidos de la app» gobierna solo la voz propia del aparato, no el volumen de la celebración (la app no tiene efectos); ADR-027 §3 y el manual lo dicen así. (2) Gemelas cuenta un turno de él cuando el adulto marca, porque no mide voz.
- **Decisiones técnicas (mías, con default):** `images.unoptimized` para que el precache guarde lo que el juego pide; paneles de Ajustes tras el primer pintado con altura reservada; `etapa-nombre` partido de Ajustes para recortar Hoy; el aviso «sin voz local» va al final del Estudio (no mueve el diseño); `design-sync` no se corrió (por hito, lo invoca el dueño).
- **Para el dueño:** la frase grabada de «casi» sonará con la voz de la familia, tal cual la grabaron.
- **Decisiones:** ADR-027. **Deuda:** ninguna.
- **Modelo por fase:** F1 Opus 5.5 · F2 y F3 Sonnet 5.5 · cierre Haiku 5.5 · auditor Sonnet high; Fable no usado. **Relevos:** 0. **`/compact`:** 2.
- **Servidores:** `lsof` LISTEN en este repo: 0 abiertos por el sprint (3500 cerrado). Solo queda el test-server de la extensión Playwright de VS Code (127.0.0.1, puerto efímero), que es del editor y no se cerró.
- **Sensibilidad:** 0 coincidencias en lo que vigila (31 coincidencias previas fuera del alcance del gate, solo reportadas).
- **Para mergear:** squash y borrar la rama; después `/cierre-sprint habla`.
