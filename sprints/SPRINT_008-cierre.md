---
sprint: 008
app: habla
hito: H-2
opened: 2026-11-12
closed: 2026-11-12
branch: sprint-008/en-ingles-tambien
pr: pendiente
---

# Sprint 008 «En inglés también se practica» — cierre ejecutivo

- **Objetivo / resultado:** Palabras, Gemelas y Objetivo se practican en inglés (diccionarios Ngram es/en, pictogramas y pares propios); `/mirada`, contacto visual y catálogo en `{es,en}`; videoteca de la familia en Estudio; licencia del diccionario corregida (CC BY 3.0). **Estado:** completo salvo lo de «Preguntas».
- **Tiempo:** estimado 4,25 h · real `horas-sprint.mjs`: 6 commits, 1 sesión, **1,4 h activas** (F1 0,5 · F2 0,5 · F3 0,5; la heurística solo cuenta commits, el reloj de pared fue mayor) · diferencia −2,85 h.
- **Modelo por fase:** F1–F3 Sonnet 5.5 (medium) = requerido, sin desvío. Auditor Sonnet 5.5 high. Prosa EN: Haiku 5.5. **Relevos:** 0.
- **Tokens:** Haiku en **6 lotes paralelos** (≈ 80–95 k c/u), no en serie como pedía el plan (desvío; sin colisión: archivos disjuntos); auditor ≈ 234 k.
- **Entregables:** `src/lib/{objetivo,videoteca}`, `content/{fichas,contacto-visual}-en/`, `scripts/lib/bilingue.mjs`, `docs/{LA-PIRAMIDE,CATALOGO-CAPSULAS}.html`, ADR-014 enmendado, **ADR-018**, ADR-017 enmendado, manual ES/EN, guía («Nuevo · S8»), brochure (función 25) y export.
- **Verificación:** lint y typecheck limpios · unit **540/540**, cobertura 91,2 % · e2e **215/215** (tras ajustar el pie del brochure a 25) · `pnpm build` OK · gitleaks sin hallazgos · cero enlaces: árbol y homepage limpios (Vercel la había rellenado; vaciada).
- **Auditoría (Sonnet 5.5 · high, solo lectura):** 23 hallazgos, todos pagados.
  - Alcance: pares sin par mínimo `boot-foot` — pagado · 9c9584c. Glosario `{es,en}` como archivo: no existió, vivió en el brief (ver Desviaciones).
  - Calidad: «sea» alineaba «mar» en español, foco del selector, fallo de borrado mudo, clip no reproducible, tope de 60 s sin duración, cobertura (`duracion.ts` 0 %), literal 40, test de `sugerir`, fecha UTC, e2e de Gemelas en inglés — pagados · 9c9584c.
  - Privacidad: `controlsList` y copy «no hay manera de sacarlos» → «la app no tiene botón»; nota «no para grabarlo a él»; **sensibilidad fuera del gate (decisión 2 a)** — pagado · ab1948b.
  - Caducadas: brochure EN, guía (v7-h1 y 10.000), export (10 000 / pantallas), manuales, ADR-017/014, BLUEPRINT, LICENCIA de pictogramas, ADR-018 faltante — pagados · 9c9584c.
  - **Veredicto: listo para cierre**, salvo las dos preguntas.
- **Sensibilidad:** el informe pasó de 197/33 (S7) a **73 coincidencias en 25 archivos**; `content/capsulas.ts` y los comandos del kit en 0 (pagado · ab1948b). Lo que queda (skills del kit, `design-system.md`, `src/`, ADR viejos, bitácoras) no entra en «2 a». Gate: **0 coincidencias en lo que vigila**.
- **Desviaciones:** (1) lotes Haiku paralelos; (2) `allowImportingTsExtensions` por el type stripping de Node 24 (worklet lo desactiva); (3) conteos del manifiesto (42 pictogramas / 13 pares / 57 fichas) vs código (41 / 10 EN y 12 ES / 56): manda el código; (4) par `bee-tea` caído por el gate; (5) diccionarios de 16 000 palabras (ADR-014); (6) la videoteca roza el espíritu de la regla 2 (ADR-018; se enmienda en S11); (7) cuerpos EN de fichas solo muestreados por el builder; (8) hecho de estudio «dos meses / cinco minutos» conservado en `dos-juguetes-iguales` EN; (9) `CLAUDE.md` sigue diciendo que falta la videoteca: no lo edité (lo regenera la planeadora).
- **Deuda:** ninguna con `archivo:línea`, salvo B-13: métricas de pruebas del export fechadas 2026-10-27 (se re-miden al cierre del hito, regla 13).
- **Decisiones · aprendizajes:** **Regla para todas las apps: en la sesión de una app, un prompt de arranque de otra app no se planea ni se construye: se avisa y se espera.** Y: leer la decisión del dueño («2 a») contra el manifiesto antes de cerrar F1; lo omití y lo cazó el auditor.
- **Preguntas (cerradas, con default):** 1) ¿Reescribo también el copy sensible restante (73 en 25 archivos)? Default: **no**, queda como está. 2) ¿Actualizo `CLAUDE.md` (videoteca ya existe)? Default: **no**, lo hace la planeadora al regenerar.
- **Recomendación / esfuerzo-beneficio:** alto; el inglés practicable cierra la brecha del S7. Siguiente: cuentos hechos para él.
- **Servidores:** `lsof` LISTEN en este repo: 0 de los míos (3500 cerrado). Ajeno, no cerrado: el `test-server` de la extensión de Playwright de VS Code con cwd aquí (127.0.0.1, puerto aleatorio).
- **Capturas:** las de F2 (móvil, un idioma, tema claro) se leyeron como imagen; no se rehicieron tras los retoques de la auditoría ni en escritorio u oscuro.

Para mergear: squash y borrar la rama; después `/cierre-sprint habla`.
