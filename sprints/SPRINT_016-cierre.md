---
sprint: 016
app: habla
hito: H-2
opened: 2026-11-16
closed: 2026-11-16
branch: sprint-016/listo-para-tu-ensayo
pr: "#PR"
---
- **Nombre / objetivo:** «Listo para tu ensayo» — repo público sin nada de la familia, documentos al día, la guía como UN recorrido y toda la app en inglés comprobada.
- **Resultado / estado:** construido y auditado, PR listo; el merge es del dueño. El ensayo general no se corre aquí (lo dijo la planeadora).
- **Tiempo:** estimado 3,5 h · real **2,5 h** (`horas-sprint.mjs`, antes del último commit; salida abajo) · diferencia −1,0 h (−29 %).
- **Fases (horas):** F1 repo limpio + sorpresa en su hueco · F2 papel e inglés · F3 guía, auditoría y cierre (`[F1]` 822db62 598af1e 77d5e2d · `[F2]` 72b4b45 60756bd 6de2b17 27ca1bf · `[F3]` ver `git log`).
- **Horas (salida pegada):** 16 commits · 1 sesión · **2,5 h** activas · span 2,0 h (09:46 → 11:47) · F1 0,5 h (3 commits) · F2 1,4 h (4) · F3 0,6 h (9). Es un piso: no ve las paradas ni la lectura.
- **Informe de sensibilidad (sin términos):** antes 34 coincidencias + 5 líneas con forma de edad · después **0 en 493 archivos** (474 al cerrar F1; el alcance se amplió después a estilos, flujos de CI y scripts). Gate: `alcanceGate()` lee todo lo versionado salvo binarios y 3 archivos; la lista no se tocó.
- **Demos en rojo:** (1) gate: el término de PRUEBA de la lista añadido a `.github/workflows/ci.yml` (archivo que el gate viejo no veía) → «1 failed | 993 passed (994)», con archivo y línea, sin el término; restaurado → 994 de 994; nada con el término se commiteó. (2) e2e inglés: `ROJO_ES=1` → 1 failed | 3 passed, «Spanish words on an English screen» por ruta.
- **Evidencia:** unit 1788 de 1788 (62 archivos, cobertura de líneas 95,93 %) · e2e 406 de 406 con `CI=1` (corrida completa al cerrar F2; tras la auditoría, 85 de 85 en los specs tocados: sorpresa, inglés, reconocedor, su mundo) · lint y typecheck limpios · `pnpm build` ok · `cero-enlaces` limpio · script ≤ 354 KB (no se tocó el bundle del juego) · `cmp` del núcleo = 0.
- **Capturas leídas como imagen (inglés):** 5 — sorpresa claro y oscuro en móvil, Hoy oscuro en móvil, Ajustes claro en escritorio, y la guía (cabecera y la parada 12). Las demás rutas pasan por la e2e (texto + axe en los dos temas); no se tomaron capturas de las 19.
- **Entregables:** `scripts/lib/sensibilidad.ts`, `tests/unit/sensibilidad.test.ts`, `sorpresa.tsx` (`HuecoSorpresa`), `tests/e2e/en-todas-las-pantallas.spec.ts`, `docs/GUIA-DE-PRUEBA.html` (13 paradas), `sprints/SPRINT_016-guia-anexo.md` (tabla **paso viejo → parada nueva**: 138 pasos vigentes de 140, 2 fundidos, 1 nuevo), `design-system.md`, BLUEPRINT, manual ES/EN, BROCHURE + export, 2 tarjetas en `.design-sync/`.
- **No completado / dueño:** `design-sync` NO publicado (lo invocas tú con `/design-sync`; `config.json` lo deja pendiente). `/spike/audio` y `/spike/reconocer` quedan fuera del barrido en inglés a propósito (herramientas del adulto).
- **Desviaciones y causas:** el cierre lo escribió Sonnet 5.5 (el modelo activo), no Haiku 5.5 · low: no pedí el cambio por no abrir un `/model` extra al final. El export decía 15 sprints cerrados y el de la rama del S15 decía 14 (no se había subido): queda en 16, contando este.
- **Decisiones técnicas (mías):** gate sobre `git ls-files` (todo salvo binarios, `CLAUDE.md`, hashes y lockfile) y borrado de los recortes por marcador; sorpresa en un hueco reservado de flujo y región viva permanente; e2e inglés con los dos diccionarios de la app y axe WCAG 2.x A/AA en los dos temas; en la guía, rumbo y pirámide van antes del cambio a English y los ajustes se prueban en Ajustes; el estado global va al final con su vuelta.
- **Deuda:** ninguna.
- **Aprendizajes:** un gate de «todo el repo» tiene que ser de todo el repo (la auditoría halló que dejaba fuera estilos y flujos); reordenar una guía exige releer cada paso que cita la pantalla en un idioma.
- **Auditoría (Sonnet 5.5 high, solo lectura, una pasada; matriz VISION → código de las 21 con `ruta:línea`, 0 parciales):** 1 A, 6 M, 8 B.
  - **Alcance:** gate no cubría todo el repo (M1) · pagado · 2515918; manual EN sin S16 (M2) · pagado · 9cb5b53; la guía no verificaba el hueco de la sorpresa (M3) · pagado · 40c7306; la parada de English citaba la interfaz en español (M4) · pagado · 40c7306 (rumbo y pirámide pasan antes del cambio de idioma).
  - **Calidad:** letras de bloque viejas (B1) · pagado · 40c7306; «seis juegos» y el texto de lo que no mide (B2) · pagado · 40c7306; axe de la e2e inglés más flojo que el del repo (B3) · pagado · 8479553; hueco de la sorpresa sin región viva y corto en móvil estrecho (B4) · pagado · 85bb94d; cifras del export (B5) · pagado · e37ffd9; comillas españolas en el inglés (B6) · pagado · c3fabb2; código muerto del gate (B7) · pagado · 2515918; capturas y rutas excluidas (B8) · declarado arriba; evidencia de las demos en rojo (M5) · pagada, arriba.
  - **Privacidad:** rasgos y circunstancias de la familia en textos públicos (A1) · pagado · cda1559 y 40c7306 (se cambió la palabra y quedó el hecho técnico, más las líneas gemelas que la auditoría no listó); servidor con cwd en este repo (M6) · ver abajo.
  - **Frases caducadas:** cifras («35 pruebas ⭐», conteos) y letras viejas · pagado · 40c7306. Veredicto del auditor: «requiere ajustes» → todos pagados.
- **Modelo por fase y desvío:** F1 Opus 5.5 (el activo, `/model opus`) · F2 Sonnet 5.5 · F3 Sonnet 5.5 · auditor Sonnet 5.5 high (subagente) · cierre Sonnet 5.5 (ver desviaciones). **Relevos:** 0. **`/compact` pedidos:** 2 (F1→F2, F2→F3).
- **CI del PR (leída uno por uno):** CICHECKS
- **Servidores al STOP:** puerto 3500 cerrado; `lsof` LISTEN con cwd en este repo: **1**, el `playwright test-server` del editor (pid 32529, de VS Code, puerto 56742, no lo abrí yo; no lo cerré: es tuyo). El de `app-nutri-kids` (pid 91870) no es de este repo.
- **Gate de sensibilidad:** 0 coincidencias en lo que vigila (493 archivos).
- **Recomendación / esfuerzo-beneficio:** merge; después `/design-sync` si quieres publicar las dos tarjetas nuevas. Alto beneficio, bajo costo: el repo queda listo para la purga de la historia.
- **Para mergear:** squash y borrar la rama; después `/cierre-sprint habla`. PRs abiertos al pedir el merge: solo este.
