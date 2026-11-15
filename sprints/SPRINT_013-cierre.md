---
sprint: 013
app: habla
hito: H-2
opened: 2026-11-15
closed: 2026-11-15
branch: sprint-013/juntos-de-verdad
pr: "#25"
---
- **Nombre / objetivo:** «Juntos de verdad» — turnos dentro de los seis juegos de micrófono y un apuntador que le habla al adulto en el momento justo (Gemelas solo gana el indicador).
- **Resultado / estado:** construido y auditado, PR listo; el merge es del dueño.
- **Tiempo:** estimado 3 h · real **1,4 h** (`horas-sprint.mjs`: 11 commits, 1 sesión, span 0,9 h) · diferencia −1,6 h (−53 %).
- **Fases:** F1 0,6 h (núcleo recopiado, turnos de voz, apuntador puro, ADR-025) · F2 0,4 h (franja, indicador, «N turnos de él», Rumbo, hito, ajuste) · F3 0,4 h (e2e, ES/EN, guía, documentos, auditoría pagada).
- **Entregables:** `Turno` y `CAMBIAR_TURNO` en `session-flow`; dos paquetes de motores (vivo = mueve el dibujo; el del niño = cuenta, recibe silencio en el turno del adulto); `coach/apuntador.ts` (4 momentos, sin repetir, técnica y fuente por línea); `franja-apuntador` e `indicador-turno` (figura + palabra, no solo color); `turnosNino` en sesiones, celebración, Rumbo y hito `juntos-por-turnos`; ajuste «Tu apuntador»; manual ES/EN, guía (paso `v13-t1`), BLUEPRINT, brochure (34) y export.
- **Evidencia:** unit 998 de 998 (52 archivos; 95,47 % de líneas) · e2e 312 de 312 en dev y 316 de 316 con `CI=1` (4 omitidos en dev por proyecto) · lint y typecheck limpios · `cero-enlaces` limpio · guía, brochure y convenciones en verde.
- **Demos en rojo (regla 15):** sin el arreglo de la cola de voz, el test «cola de la voz del adulto» falla y con él pasa.
- **Auditoría (Sonnet 5.5 high, solo lectura):** Alcance · cada frase del resultado esperado con ruta:línea; «dijo la palabra» y el reconocedor contaban en el turno del adulto: pagado · cbf101e; capa del cohete: pagado · cbf101e. Calidad · la cola de la voz del adulto contaba como suya: pagado · cbf101e; historial del apuntador se perdía con «Otra vez»: pagado · 6e952d8; fila en blanco de la franja: pagado · 6e952d8; indicador pequeño: pagado · 6e952d8; e2e con espera que no probaba nada: pagado · 4ed0b3d; contraste y axe del indicador en Gemelas: pagado · 4ed0b3d; viaje de `turnosNino` en la otra casa y e2e fuera del globo: pagado · 4ed0b3d. Seguridad/privacidad · nadie identifica de quién es la voz; copy de «sin voz» neutro: pagado · 6e952d8. Frases caducadas · ADR-025, design-system, comentarios «vista soberana» y manual (modelar antes de «Mi turno» cuenta como suyo): pagado · 4ed0b3d. `AGENTS.md` modificado en el árbol y fuera del PR (no es de este sprint). Veredicto: listo para cierre.
- **Desviaciones:** (1) la franja es cromo permanente del adulto (botón y etiqueta de turno); solo la LÍNEA dura ~7 s y el modo calma y el ajuste apagan la línea, no el botón (el adulto siempre debe poder pasar el turno); (2) las sesiones de globo guardaban ms fraccionarios que el esquema rechazaba: ahora se redondean; (3) una sesión nace en el turno del niño (jugar sin tocar la franja cuenta como antes).
- **Decisiones técnicas (mías, con default):** el turno lo marca el adulto con un toque y la app jamás adivina la voz; el silencio (no dejar de alimentar) cierra limpio las rachas del niño; `design-sync` no se corrió (lo invoca el dueño).
- **Decisiones:** ADR-025. **Deuda:** ninguna. Límite honesto, documentado en el manual: modelar antes de tocar «Mi turno» cuenta como de él.
- **Modelo por fase:** F1 Opus 5.5 · F2 y F3 Sonnet 5.5 (auditor Sonnet high); Fable no usado. **Relevos:** 0. **Tokens:** no medidos.
- **Servidores:** `lsof` LISTEN en este repo: 0 (3500 cerrado).
- **Sensibilidad:** 0 coincidencias en lo que vigila.
- **Para mergear:** squash y borrar la rama; después `/cierre-sprint habla`.
