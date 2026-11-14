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

**Objetivo:** llevar la práctica fuera de la pantalla y entre dos casas. **Resultado:** construido y verificado; **estado:** listo para PR, a la espera de las 3 respuestas del dueño (abajo).
**Entregables:** (1) «Pasar a la otra casa», archivo cifrado con frase, ADR-020 · (2) spike de formantes con kit sintético, tabla en ADR-021 y «el mapa de las vocales» experimental · (3) tarjetas y tablero imprimibles con ARASAAC en cada hoja, sin nombre ni edad · (4) `docs/convenciones-familia/` v0.1.0 + ADR-022 + test · manual ES/EN, guía bloque R, brochure 26→29, BLUEPRINT. `CLAUDE.md` = la orden (`cmp` 0).
**No completado:** nada del alcance. Fuera por orden: «¿dijo la palabra?» y regla 2 (S11), e2e en inglés.

## Horas (`node scripts/horas-sprint.mjs`, `origin/main..HEAD`)

14 commits · 1 sesión · **1,4 h activas** (span 0,9 h) · F1 0,7 h (4) · F2 0,3 h (4) · F3 0,4 h (6). Estimado 3,5 h → **diferencia −2,1 h**; la heurística mide huecos entre commits, no el tiempo de ejecución de los e2e (6,8 min el completo).

## Desviaciones y causas

1. ADR-011 queda enmendado por ADR-020 (la orden decía «ya exporta»); «logros» = el registro de sesiones + gemelas (no había un «logros» guardado).
2. Sin huella SHA-256: la etiqueta de AES-GCM ya autentica (ADR-020 §2).
3. `vocales.ts` nace en F1 (el spike lo necesitaba). El selector pasa de 4 a 5 juegos (el quinto, experimental y último).
4. Variante `vocales` en `Metrica` y `SesionSchema` (cuenta como día de práctica; no alimenta cifras del Rumbo).
5. Las hojas imprimen solo dibujo y palabra, nunca texto libre de la familia.

## Auditoría (Sonnet · high · solo lectura, una pasada; 4 casillas)

Alcance: 4 de 4 entregables completos, el de docs «parcial» → H3–H7 abajo. **Todo pagado:**

- H1 A e2e de cero red no cubría el mapa de las vocales — pagado · 9de4d75
- H2 M `aplicar` escribía texto antes que las grabaciones (a medias si falla la cuota) — pagado · b7f4f69
- H3 M la frase no se recortaba/normalizaba (espacio final, NFC/NFD) — pagado · b7f4f69
- H4 B sin Web Crypto decía «frase mala» — pagado · b7f4f69
- H5 B el tope de 500 podía descartar sesiones locales — pagado · b7f4f69
- H6 B un avance de ciclo solo no se ofrecía — pagado · b7f4f69
- H7 B tope de 200 MB y banco sin límite — pagado · b7f4f69 (64 MB y 60 MB de voz)
- H8 B singular/«with» repetido en la celebración — pagado · 9de4d75
- H9 B test de `ruta:línea` solo miraba que la línea existiera — pagado · 9de4d75
- H10 B el service worker no precacheaba `formantes.js` (caché v1→v2) — pagado · 9de4d75
- H11 A promesas «solo en este dispositivo / sin copia» falsas con el archivo — pagado · 0552099 (textos) y 124a82c (manual ES/EN)
- H12 M ADR-011 y ADR-004 sin enmienda — pagado · 124a82c · H13 M README del worklet — pagado · 124a82c
- H14 M cifras viejas en el export (ahora 775 unit · 257 e2e · 94,57 %) — pagado · 124a82c · H15 B conteos «tres/cuatro juegos» — pagado · 124a82c
  Verificación tras los pagos: lint y typecheck limpios; unit 775/775; e2e 257/257; `cero-enlaces` limpio.

## Para el dueño (preguntas cerradas; sin tu respuesta escrita aquí no se pide el merge)

1. Mapa de las vocales sin tono detectado: ¿nombrar la vocal con centros de adulto (a) o no nombrar ninguna (b, deja mudo el kit adulto)? **Default: (a)**; el resultado del spike lo decides tú en el ensayo. Respuesta: _pendiente_.
2. ¿Aceptas que el archivo no lleve huella SHA-256 aparte (la etiqueta GCM la sustituye)? **Default: sí.** Respuesta: _pendiente_.
3. ¿Aceptas el selector de juegos en 5 (el quinto experimental, al final), sobre el techo de 4 del S3? **Default: sí.** Respuesta: _pendiente_.

## Modelo, relevos, tokens, servidores, gate

- Modelo por fase: F1 Opus 5.5 · F2 y F3 Sonnet 5.5 (cierre en la misma sesión, sin desvío). **Relevos:** 0.
- Tokens: subagentes: Explore Haiku (F1 y F2, ≈65 k el de F2) y auditor Sonnet (≈221 k); `/compact` pedidos 3, hechos 3; las cifras las mide la planeadora.
- `lsof` LISTEN en este repo: 0 (solo el `test-server` de la extensión Playwright de VS Code, exento; los de app-big-d y app-hoja-de-vida son de otras apps, reportados).
- Sensibilidad: 0 coincidencias en lo que vigila (30 en 8 archivos fuera del gate, igual que al inicio).
- Aprendizaje: escribir las promesas de privacidad con su salida explícita desde el primer texto. Recomendación: S11.

Para mergear: squash y borrar la rama; después `/cierre-sprint habla`.
