---
sprint: 016
app: habla
tipo: anexo del cierre
---

# Anexo S16 · la guía de prueba, de bloques a un recorrido

`docs/GUIA-DE-PRUEBA.html` pasó de 19 bloques por funcionalidad a **13 paradas en un solo recorrido**. Los ids de los pasos no cambian: «paso viejo» es el id y su bloque de antes; «parada nueva» es el número de parada. Cada paso conserva su `data-cubre`; `tests/unit/guia-cobertura.test.ts` sigue exigiendo las 21 funcionalidades, más de 80 pasos y ninguno repetido.

## Las 13 paradas

| # | Parada | Pasos |
|---|---|---|
| 1 | “Hoy”: la respuesta del día y la etapa del habla | 15 |
| 2 | El oído de la app: energía y tono | 12 |
| 3 | Los juegos de voz | 33 |
| 4 | Palabras gemelas y los turnos | 7 |
| 5 | ¿Dijo la palabra? — una segunda opinión solo para ti | 6 |
| 6 | La voz de la familia | 13 |
| 7 | Cuentos y videos de la familia | 7 |
| 8 | El Estudio y el objetivo de la semana | 6 |
| 9 | Cambias a English | 3 |
| 10 | El rumbo y la pirámide, ya en English | 12 |
| 11 | Ajustes de la casa | 16 |
| 12 | Paradas de estado global — al final, y cada una con su vuelta | 6 |
| 13 | El kit de prueba y las convenciones (en el repo, opcional) | 2 |

## Paso viejo → parada nueva

| Bloque viejo | Pasos (ids) | Parada nueva |
|---|---|---|
| B · “Hoy”: la respuesta del día | `v2-b1`, `v2-b2`, `v2-b3`, `v2-b4`, `v2-b5`, `v2-b6`, `v2-b7`, `v2-b8`, `v2-b9` | 1 · “Hoy”: la respuesta del día y la etapa del habla |
| C · La etapa del habla | `v2-c1`, `v2-c2`, `v2-c3`, `v2-c4`, `v2-c5` | 1 · “Hoy”: la respuesta del día y la etapa del habla |
| A · El oído de la app: energía y tono | `v2-a1`, `v2-a2`, `v2-a3`, `v2-a4`, `v2-a5`, `v2-a6`, `v2-a7`, `v2-a8`, `v2-a9`, `v2-a10`, `v2-a11`, `v2-a12` | 2 · El oído de la app: energía y tono |
| D · El selector de juegos | `v2-d1`, `v2-d2`, `v2-d3` | 3 · Los juegos de voz |
| E · El globo | `v2-e1`, `v2-e2`, `v2-e3`, `v2-e4`, `v2-e5`, `v2-e6`, `v2-e7`, `v2-e8`, `v2-e9`, `v2-e10` | 3 · Los juegos de voz |
| E · El globo | `v2-e12` | 12 · Paradas de estado global |
| E · El globo | `v2-e13` | 3 · Los juegos de voz |
| F · El cohete del tono | `v2-f1`, `v2-f2`, `v2-f3`, `v2-f4`, `v2-f5`, `v2-f8` | 3 · Los juegos de voz |
| G · Palabra y dibujo | `v2-g1`, `v2-g2`, `v2-g3`, `v2-g4`, `v2-g8`, `v2-g5`, `v2-g6`, `v4-g9` | 3 · Los juegos de voz |
| S · ¿Dijo la palabra? | `v11-s1`, `v11-s2`, `v11-s3`, `v11-s4`, `v11-s5`, `v11-s6` | 5 · ¿Dijo la palabra? |
| T · Soplar, fuerte y suave, y las sesiones c | `v12-t1`, `v12-t2` | 3 · Los juegos de voz |
| T · Soplar, fuerte y suave, y las sesiones c | `v12-t3`, `v12-t4`, `v15-6`, `v15-6b` | 11 · Ajustes de la casa |
| T · Soplar, fuerte y suave, y las sesiones c | `v15-7` | 12 · Paradas de estado global |
| T · Soplar, fuerte y suave, y las sesiones c | `v13-t1` | 3 · Los juegos de voz |
| T · Soplar, fuerte y suave, y las sesiones c | `v12-t5`, `v15-5` | 11 · Ajustes de la casa |
| T · Soplar, fuerte y suave, y las sesiones c | `v12-t6` | 10 · El rumbo y la pirámide, ya en English |
| L · Palabras gemelas | `v3-l1`, `v3-l2`, `v3-l3`, `v3-l4`, `v3-l5` | 4 · Palabras gemelas y los turnos |
| L · Palabras gemelas | `v3-l6` | 6 · La voz de la familia |
| L · Palabras gemelas | `v15-1`, `v15-2` | 4 · Palabras gemelas y los turnos |
| J · La voz de la familia: grabar tu voz | `v3-j1`, `v3-j2`, `v3-j3`, `v3-j4`, `v3-j5` | 6 · La voz de la familia |
| J · La voz de la familia: grabar tu voz | `v3-j6` | fundido en `v2-e12` (parada 12) |
| K · La voz de la familia dentro de los juego | `v3-k1`, `v3-k2`, `v3-k3`, `v3-k4`, `v3-k5`, `v15-3`, `v15-4` | 6 · La voz de la familia |
| N · El rumbo | `v4-n2`, `v4-n3`, `v4-n4` | 10 · El rumbo y la pirámide, ya en English |
| O · El objetivo de la semana | `v4-o1`, `v4-o3`, `v4-o6`, `v4-o4`, `v4-o5` | 8 · El Estudio y el objetivo de la semana |
| Q · La pirámide, en tu teléfono | `v6-q1`, `v6-q2`, `v6-q3`, `v6-q4`, `v6-q5`, `v6-q6`, `v6-q7` | 10 · El rumbo y la pirámide, ya en English |
| H · Ajustes, honestidad y borrar datos | `v4-h6`, `v2-h1`, `v2-h2`, `v2-h3`, `v14-m1` | 11 · Ajustes de la casa |
| H · Ajustes, honestidad y borrar datos | `v14-m2` | 7 · Cuentos y videos de la familia |
| H · Ajustes, honestidad y borrar datos | `v2-h4`, `v2-h5`, `v2-h6` | 11 · Ajustes de la casa |
| H · Ajustes, honestidad y borrar datos | `v7-h1`, `v7-h2`, `v8-h1` | 9 · Cambias a English |
| H · Ajustes, honestidad y borrar datos | `v8-h2` | 10 · El rumbo y la pirámide, ya en English |
| H · Ajustes, honestidad y borrar datos | `v8-h3` | 7 · Cuentos y videos de la familia |
| H · Ajustes, honestidad y borrar datos | `v8-h4` | fundido en `v2-h7` (parada 12) |
| H · Ajustes, honestidad y borrar datos | `v8-h5` | 11 · Ajustes de la casa |
| H · Ajustes, honestidad y borrar datos | `v9-h1`, `v9-h2`, `v9-h3`, `v9-h4`, `v9-h5` | 7 · Cuentos y videos de la familia |
| H · Ajustes, honestidad y borrar datos | `v2-h7` | 12 · Paradas de estado global |
| I · La biblioteca — tu veredicto, EN EL CATÁ | `v4-i1` | 1 · “Hoy”: la respuesta del día y la etapa del habla |
| R · Lejos de la pantalla | `v10-r1`, `v10-r2`, `v10-r3` | 12 · Paradas de estado global |
| R · Lejos de la pantalla | `v10-r4`, `v10-r5` | 3 · Los juegos de voz |
| R · Lejos de la pantalla | `v10-r6` | 8 · El Estudio y el objetivo de la semana |
| R · Lejos de la pantalla | `v11-r7` | 13 · El kit de prueba y las convenciones (en el repo, opcional) |
| M · El kit de prueba | `v3-m1` | 13 · El kit de prueba y las convenciones (en el repo, opcional) |
| (nuevo) | `v16-1` | 11 · Ajustes de la casa (volver a Español) |
| tablet | `v2-t1`…`v4-t11` | sin cambio: lista diferida al final |

## Fundidos y nuevos

- `v3-j6` (micrófono negado en el estudio) se fundió en `v2-e12`, que ahora cubre el juego y el estudio en una sola prueba de estado global.
- `v8-h4` (borrar datos con un clip guardado) se fundió en `v2-h7`, el último paso: borrar datos también vacía la videoteca.
- `v16-1` es nuevo: al terminar la parada de English se vuelve a Español desde Ajustes.

## Estado global, al final y con su vuelta

Parada 12: micrófono negado (se devuelve el permiso en el candado), modo avión (se apaga), la otra casa (solo suma datos al segundo aparato) y «Borrar mis datos» (último; vuelve al primer día).
