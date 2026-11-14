---
sprint: 010
app: habla
hito: H-2
opened: 2026-11-13
closed: 2026-11-13
branch: sprint-010/lejos-de-la-pantalla
pr: PENDIENTE
---

# Sprint 010 «Lejos de la pantalla» — cierre ejecutivo

**Objetivo:** práctica fuera de la pantalla y entre dos casas. **Resultado:** construido y verificado. **Estado:** PR listo; faltan las 3 respuestas del dueño (abajo).

**Entregables:** «Pasar a la otra casa» (archivo cifrado con frase, ADR-020) · spike de formantes con kit sintético, tabla en ADR-021, y «el mapa de las vocales» experimental · tarjetas y tablero imprimibles con ARASAAC en cada hoja, sin nombre ni edad · `docs/convenciones-familia/` v0.1.0 + ADR-022 + test · manual ES/EN, guía bloque R, brochure 26→29, BLUEPRINT · `CLAUDE.md` = la orden (`cmp` 0). **No completado:** nada del alcance (fuera por orden: «¿dijo la palabra?», regla 2, e2e en inglés).

**Horas** (`node scripts/horas-sprint.mjs`): 14 commits · 1 sesión · **1,4 h activas** (F1 0,7 · F2 0,3 · F3 0,4). Estimado 3,5 h → **diferencia −2,1 h** (la heurística mide huecos entre commits, no los 6,8 min del e2e completo).

**Desviaciones:** (1) ADR-011 enmendado por ADR-020 (la orden decía «ya exporta»); «logros» = registro de sesiones + gemelas. (2) Sin huella SHA-256: la etiqueta GCM ya autentica. (3) `vocales.ts` nace en F1; el selector pasa de 4 a 5 juegos (el quinto, experimental y último). (4) Variante `vocales` en `Metrica` y `SesionSchema`: cuenta como día de práctica, no alimenta cifras del Rumbo. (5) Las hojas imprimen solo dibujo y palabra.

**Auditoría** (Sonnet · high · solo lectura · 4 casillas; todo pagado): H1 A e2e de cero red sin el mapa — pagado · 9de4d75 · H2 M `aplicar` escribía texto antes que las grabaciones — pagado · b7f4f69 · H3 M frase sin recorte/NFC — pagado · b7f4f69 · H4 B sin Web Crypto decía «frase mala» — pagado · b7f4f69 · H5 B tope de 500 podía descartar lo local — pagado · b7f4f69 · H6 B avance de ciclo solo no se ofrecía — pagado · b7f4f69 · H7 B topes de 200 MB y banco sin límite — pagado · b7f4f69 · H8 B singular y «with» repetido — pagado · 9de4d75 · H9 B test de `ruta:línea` sin ancla — pagado · 9de4d75 · H10 B service worker sin `formantes.js` — pagado · 9de4d75 · H11 A promesas «solo en este dispositivo / sin copia» falsas con el archivo — pagado · 0552099 y 124a82c · H12 M ADR-011 y ADR-004 sin enmienda — pagado · 124a82c · H13 M README del worklet — pagado · 124a82c · H14 M cifras viejas del export (775 unit · 257 e2e · 94,57 %) — pagado · 124a82c · H15 B conteos «tres/cuatro juegos» — pagado · 124a82c. Tras los pagos: lint y typecheck limpios, unit 775/775, e2e 257/257, `cero-enlaces` limpio.

**Preguntas al dueño** (sin tu respuesta escrita aquí no se pide el merge): 1. Mapa de las vocales sin tono detectado: ¿nombrar la vocal con centros de adulto (a) o no nombrar ninguna (b, deja mudo el kit adulto)? Default (a); el resultado del spike lo decides en el ensayo. Respuesta: _pendiente_. 2. ¿Aceptas el archivo sin huella SHA-256 aparte? Default: sí. Respuesta: _pendiente_. 3. ¿Aceptas el selector en 5 juegos (el quinto experimental, al final) sobre el techo de 4 del S3? Default: sí. Respuesta: _pendiente_.

**Modelo:** F1 Opus 5.5 · F2 y F3 Sonnet 5.5, sin desvío. **Relevos:** 0. **Tokens:** subagentes: Explore Haiku (F1 y F2; ≈65 k el de F2) y auditor Sonnet (≈221 k); `/compact` pedidos 3, hechos 3; las cifras las mide la planeadora. **Servidores:** `lsof` LISTEN en este repo: 0 (solo el `test-server` de Playwright de VS Code, exento; los de app-big-d y app-hoja-de-vida son de otras apps, reportados). **Sensibilidad:** 0 coincidencias en lo que vigila (30 en 8 archivos fuera del gate, igual que al inicio). **Aprendizaje:** redactar las promesas de privacidad con su salida explícita desde el primer texto.

Para mergear: squash y borrar la rama; después `/cierre-sprint habla`.
