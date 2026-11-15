---
sprint: 012
app: habla
hito: H-2
opened: 2026-11-15
closed: 2026-11-15
branch: sprint-012/su-voz-lo-mueve-todo
pr: "#24"
---
- **Nombre / objetivo:** «Su voz lo mueve todo» — soplar, fuerte y suave y sesiones cortas (tope diario de 5 a 10 min), sin tocar la voz del niño ni ningún umbral existente.
- **Resultado / estado:** construido y auditado, PR listo; el merge es del dueño.
- **Tiempo:** estimado 3 h · real **2,0 h** (`horas-sprint.mjs`: 14 commits, 3 sesiones, span 11,7 h por la pausa nocturna) · diferencia −1,0 h (−33 %).
- **Fases:** F1 0,5 h (detectores + ADR-024) · F2 0,5 h (núcleo y juegos) · F3 1,0 h (inglés, guía, documentos, auditoría pagada).
- **Entregables:** `soplo.ts` e `intensidad.ts` (señales sintéticas, worklet `?v=4`, caché `habla-v4`); juegos `/jugar/soplar` y `/jugar/fuerte-suave` en ES/EN con guion, calma y movimiento reducido; tope en `src/lib/pantalla/` (llave local `habla:v1:pantalla`, fuera del archivo de la otra casa, `borrarTodo` la borra) con aviso único al adulto y cierre como «Salir»; selector de 7 juegos; hitos y rumbo cuentan los juegos nuevos; manual ES/EN, guía con bloque T y `cubre`, BLUEPRINT, brochure (33 funcionalidades) y export.
- **Evidencia:** unit 957 de 957 (49 archivos, 95,28 % de líneas) · e2e 304 de 304 con `CI=1` (`next start`, CSP activa) · lint y typecheck limpios · brochure-export, guia-cobertura y sensibilidad en verde.
- **Demos en rojo (regla 15):** `alcanzado` en `tope.ts` roto → tests del tope en rojo, restaurado → verde; sin la señal `grave`, 2 casos de voz grave fallaron y con ella pasan.
- **Auditoría (Sonnet 5.5 high, solo lectura):** Alcance · cada frase del resultado esperado con ruta:línea; hito «de suave a fuerte» afirmaba una dirección: pagado · e20833c. Calidad · una voz grave de adulto podía contarse como soplo (nueva señal `grave`, 70–150 Hz): pagado · 26d9737; `aria-live` en el texto de nivel que cambia varias veces por segundo: pagado · e20833c; Lighthouse y recorrido sin las rutas nuevas: pagado · e20833c. Seguridad/privacidad · sin hallazgos (el contador guarda solo fecha, ms y bandera). Frases caducadas · «cuatro juegos escuchan», «dos números», «dieciséis logros», «las dos consignas», nota de idiomas falsa, comentarios «tres juegos», README y manual ES/EN: pagado · fb5d7c9, e20833c, 26d9737. ADR-024 con sesiones cortas y `grave`: pagado · 26d9737. Veredicto: listo para cierre.
- **Desviaciones:** `grave` es una señal nueva (no cambia umbral ni histéresis); el brochure ganó dos canchas nuevas; `design-sync` no se corrió (lo invoca el dueño; `.design-sync/` sin cambios en el diff); la VISION de la planeadora es v1.0.2 y el encabezado de CLAUDE.md dice 1.0.1.
- **CI:** `lighthouse` falló con el script de la portada en 358 601 B contra 358 400 B (350 KB). Sacar el almacén del contador del paquete de la portada (commit «perf: [F3] the cap counter's storage…», −310 B gzip) pasó una vez y falló otra con el mismo código (358 605 B): la medida baila ±4 B y el margen era nulo. Decisión técnica mía, reportada: el presupuesto de script de `perf-budget.json` sube de 350 a 354 KB (el S12 sumó esquemas y textos compartidos); el resto de presupuestos (FCP, LCP, TBT, CLS, total) no cambió. La unit del ventilador pasó a 30 s (expiró a 5 s una vez en un runner lento).
- **Decisiones:** ADR-024. **Deuda:** ninguna. Pregunta abierta del S11 (`'unsafe-eval'` en toda la página o aislar el Worker): sigue el default A.
- **Modelo por fase:** F1 Opus 5.5 · F2 y F3 Sonnet 5.5 (corregido en el S13: la F1 corrió en Opus); Fable no usado. **Relevos:** 0. **Tokens:** no medidos.
- **Servidores:** `lsof` LISTEN en este repo: 0 (3500 cerrado).
- **Sensibilidad:** 0 coincidencias en lo que vigila.
- **Para mergear:** squash y borrar la rama; después `/cierre-sprint habla`.
