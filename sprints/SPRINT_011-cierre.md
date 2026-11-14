---
sprint: 011
app: habla
hito: H-2
opened: 2026-11-14
closed: 2026-11-14
branch: sprint-011/dijo-la-palabra
pr: pendiente (se abre tras este commit)
---
- **Nombre / objetivo:** «¿Dijo la palabra?» — reconocedor local (Vosk, Worker, gramática cerrada, ES/EN) en Palabras y Gemelas; «quizás» solo para el adulto; halo opcional para el niño; cierre de la construcción del H-2.
- **Resultado / estado:** construido y medido (ADR-023); lo que la medida significa lo decide el dueño en el ensayo. Estado: listo para PR, con 5 preguntas abiertas al dueño (abajo).
- **Tiempo:** estimado 2,25 h · real **2,8 h** (`horas-sprint.mjs`: 25 commits, 1 sesión, span 2,3 h) · diferencia +0,55 h (+24 %, bajo el 50 %; la F3 cargó la auditoría pagada y el e2e completo).
- **Fases:** F1 0,8 h · F2 1,1 h · F3 0,9 h (15 commits).
- **Entregables:** reconocedor y su motor (`src/lib/reconocer/`, `src/lib/voice/escucha.ts`, `pcm-tap`); Ajustes (apagado de fábrica, aviso de ≈ 40 MB, borrar); conteo 2×2 local fuera del archivo de la otra casa; ADR-023 + `medida-es/en.json` (10 de 10 palabra y «quizás» por idioma; controles sin palabra: 2/3 es, 1/3 en); e2e en inglés; guía como UN recorrido con `cubre` (21 ids) + test; manual ES/EN, BLUEPRINT, brochure (30 funcionalidades), export, `design-sync` (tarjeta nueva, 11 archivos remotos).
- **Evidencia:** unit 886 de 886 (42 archivos, cobertura 94,97 %) · e2e 271 de 271 en cinco proyectos · lint y typecheck limpios · cero enlaces limpio · `cmp` de CLAUDE.md = 0.
- **Desviaciones:** no existía Worker ni carga diferida (se creó); el IDBFS de vosk guarda el modelo dos veces (ADR §9, se borra con un toque); el zip se sirve tal cual (sin reempaque); licencia en `public/modelos/LICENCIA.md`; preludio sin red en el Worker; Lingua Libre en vez de WAV sintéticos (lo pide la orden; 10 grabaciones por límite de Wikimedia); Gemelas necesita un botón «Escuchar» del adulto; el filtro del e2e de cero red admite pictogramas por el optimizador local.
- **Decisiones:** ADR-023 (enmienda el 009). **Deuda:** ninguna por decisión propia; lo imposible va al dueño (preguntas).
- **Auditoría (Sonnet 5.5 high, solo lectura):** Alcance · reconocedor sin halo, carrera del hook, doble micrófono, conteo de lado: pagado · 9e3d053. Calidad · logLevel y palabras fuera de la gramática: pagado · 2fd28eb; ajustes que pisaban otros valores y «Borrar» durante la descarga: pagado · 46ce8d8; huecos de prueba (halo, Gemelas, IDB de vosk, inglés): pagado · 4b4aa21; el e2e completo halló 2 fallos de cero red: pagado · f690777. Seguridad/privacidad · Worker sin red y gate de sensibilidad (archivos nuevos entran; 2 comentarios reescritos): pagado · b9588a9, 2fd28eb. Frases caducadas («no usa micrófono / la app no reconoce palabras», filas de IA, ADR): pagado · 861f806, 93af7a9. Menores (noindex, VISION 1.0.2, nota del halo, dependencia del build): pagado · b9588a9, 861f806. Veredicto: listo para cierre.
- **Modelo por fase:** F1 con Sonnet 5.5 en vez de Opus 5.5 (desvío declarado); F2 y F3 Sonnet 5.5 como pedía. **Relevos:** 0. **Tokens:** no medidos por la sesión.
- **Servidores:** `lsof` LISTEN con cwd en este repo: solo el `test-server` de Playwright de VS Code (no cuenta); 3500 cerrado. Reporto servidores de `app-big-d` (PIDs 62024, 69703): no los toqué.
- **Sensibilidad:** 0 coincidencias en lo que vigila (las 30 del informe están en bitácoras antiguas fuera del gate, no tocadas).
- **Decisiones del dueño (respuesta escrita):** pendientes, ver preguntas del STOP.
- **Para mergear:** squash y borrar la rama; después `/cierre-sprint habla`.
