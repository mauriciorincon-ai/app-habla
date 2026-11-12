---
sprint: 007
app: habla
hito: H-2
opened: 2026-11-11
closed: 2026-11-11
branch: sprint-007/dos-idiomas
pr: 18
---

# Sprint 007 «Habla en dos idiomas» — cierre ejecutivo

- **Objetivo / resultado:** abrir el H-2 adoptando el núcleo del kit v2.4.0 y dejando la app en español y English (ADR-017). **Estado: listo para merge.**
- **Tiempo:** estimado 4,5 h · real **1,4 h activas** (diferencia −3,1 h). Salida de `node scripts/horas-sprint.mjs` (rango `origin/main..HEAD`, 15 commits al cerrar la construcción, 1 sesión):

  | Fase | Commits | Horas |
  | ---- | ------: | ----: |
  | F1   |       5 | 0,5 h |
  | F2   |       6 | 0,6 h |
  | F3   |       4 | 0,3 h |

- **Entregables:** núcleo + `docs/REGLAS-ANEXO.md` + piezas del kit (`un-pr-vivo`, `cero-enlaces`, `demo-rojo`, reglas por ruta) · puertos 127.0.0.1:3500 · devolución 026 (export idéntico, «Qué mide» nombra el tono del cohete) · capa `src/lib/idioma/` y 12 catálogos · 50 cápsulas `{es,en}` · `/conoce` bilingüe · manual ES y EN · guía y BLUEPRINT al día.
- **Checks leídos:** lint y typecheck sin error · unit 436/436 (cobertura 91,28 % sentencias) · e2e 201/201 (14/14 del spec de idioma en la última corrida) · build verde · `cero-enlaces`: árbol y homepage limpios.
- **Rojos vistos (`demo-rojo.sh`):** paridad vacía, edad escrita en inglés, copy prohibido en inglés, y cero-enlaces (dominio inventado, rojo nombrando README.md, verde al restaurar).
- **Gate de sensibilidad:** 0 coincidencias en lo que vigila (sin términos escritos). README, manual ES/EN, guía, brochure, BLUEPRINT, anexo y ADR-017 pasan a vigilarse enteros (lotes en 0). El informe fuera del gate marca 197 coincidencias en 33 archivos (cápsulas en español, bitácoras viejas, diccionario): quedan por decisión del dueño de S6.
- **Desviaciones:** (1) dos frases de Ajustes cambiaron en español porque el gate ahora las vigila; (2) Objetivo en inglés: alineador y diccionario siguen en español, con aviso y chips en español; (3) Palabras y Gemelas en inglés muestran una tarjeta honesta; (4) `interes-palabra-y-objeto` conserva `conPantalla: true` aunque su actividad en inglés es sin pantalla; (5) el anexo conserva la v1 con siete frases reescritas y una nota de que «solo español» quedó sustituido; (6) FORMA y TEXTO maquetados **no vistos** (al ensayo general del H-2); (7) `docs/brochure-export.json:139` conserva su coincidencia: debe quedar idéntico a la 026.
- **Auditoría (Sonnet, una pasada) — todo pagado:**
  - Alcance: A-1 Objetivo en inglés · pagado · 8606d1c; A-2 lotes de sensibilidad · pagado · add9806.
  - Calidad: M-1 `lang` al hidratar · pagado · 8606d1c; B-1 «full turns» · 8606d1c; B-2 volver al idioma del dispositivo · 8606d1c; B-3 iconos decorativos · 8606d1c; B-4 nombres exhaustivos · 8606d1c; B-5 test del tono · 8606d1c.
  - Seguridad y privacidad (sin hallazgos de voz, red o secretos): M-2 jerga en ADR y anexo · pagado · add9806; B-6 alcance del gate · add9806.
  - Frases caducadas: M-3 promesas «pronto/soon» · pagado · 8606d1c (app, e2e) y add9806 (brochure, manual); M-4 manual EN a la par (463 líneas) · add9806; M-5 README :3500 · add9806; B-7 nota en el anexo · add9806; B-8 ⭐ de la guía · add9806; B-9 evidencia del rojo · pagado · 5732293 (demo corrida).
  - Veredicto: listo para cierre. ADR-017 suma el destello de español al hidratar · 6199bb5.
- **Modelo por fase:** plan Opus 5.5 · F1–F3 Sonnet 5.5 medium · auditor Sonnet 5.5 high; sin desvío. **Relevos:** 0.
- **Tokens:** subagentes en serie: 8 en F2 (migración, cápsulas EN, brochure), 2 en F3 (auditor, manual EN) y los de plan/F1; `/compact` pedidos y hechos: 3 (plan, F1, F2). Cifras medidas por la planeadora.
- **Servidores:** `lsof` LISTEN en este repo: 0 míos (solo el test-server de Playwright de VS Code, que no cuenta). De otras apps, sin tocar: app-big-d y app-planlang (:3200).
- **un-pr-vivo:** corre por primera vez en este PR; entra a la ruleset `main-protegida` tras su primera corrida verde.
- **Recomendación:** S8 = palabras, pares y diccionario del Objetivo en inglés. Esfuerzo-beneficio alto.
- **Para mergear:** squash y borrar la rama; después `/cierre-sprint habla`.
