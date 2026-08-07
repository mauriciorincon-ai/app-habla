# ADR 012 — El globo no termina solo: la meta se vuelve HITO (vueltas infinitas)

- **Status:** accepted (2026-08-01, Sprint 004 — decidido por el usuario EN el gate ⭐ ACUMULADO,
  bloque E, hallazgo E6; opciones evaluadas en vivo y elegida "meta → hito con vueltas").
- **Sprint:** 004 "El rumbo" + cierre de ciclo H1.
- **Supersede parcialmente:** el acceptance del S1 ("el globo llega a la meta a los 3 s y celebra").

## Contexto

Desde el S1, el globo cerraba el intento AUTOMÁTICAMENTE al acumular 3 s de voz (`meta: 3000` en
la máquina de sesión). En el gate acumulado del S4, el padre lo probó enseñándoselo a su hijo por
primera vez y el veredicto fue tajante: **el juego se termina justo mientras uno le está
explicando al niño cómo funciona** — 3 segundos no alcanzan ni para captar su atención, y un
juego que se cierra solo cada pocos segundos mata el interés en vez de invitarlo a seguir.

La mecánica "sin fin automático" ya existía en la app: `meta: null` (palabra↔objeto y el modo
calma viven así desde S2). La pregunta era solo si el globo debía adoptarla y cómo conservar la
sensación de logro.

## Decisión

1. **El globo pasa a `meta: null`: el intento JAMÁS se cierra solo.** Termina cuando el padre
   toca "Ya jugamos" (o "Salir"). El reducer conserva la mecánica de meta — el cohete la sigue
   usando (su bloque del gate dirá si también migra).
2. **La meta se vuelve HITO: cada 3000 ms de voz acumulada es UNA VUELTA** (`HITO_VUELTA_MS`).
   El globo cruza la línea, reaparece entrando por la izquierda (nunca en reversa) y sigue —
   vueltas infinitas. Un contador visible y honesto celebra en vivo ("¡Ya dio 3 vueltas!") sin
   detener nada.
3. **La celebración final no cambia:** total de voz + racha más larga (los números ya existían;
   con vueltas solo crecen). El registro del Rumbo (`habla:v1:sesiones`) tampoco cambia.
4. **De paso, la navegación del juego quedó coherente (mismo bloque del gate):** "Salir" dentro
   del juego vuelve al GUION (apagando el micrófono — regla dura 2), y el guion tiene su
   "← Juegos" hacia el selector.

## Por qué así y no de otra forma

- **Alargar la meta (30 s)** seguía cortando el juego solo — media solución al mismo defecto.
- **Obstáculos/cajas que saltar** es una mecánica nueva de verdad (diseño, sprites, dificultad):
  va al backlog del cierre, no a un remate de gate.
- Las vueltas reutilizan TODO lo existente (línea, medidor, métrica, celebración) y el motor puro
  ya soportaba `meta: null` — el cambio es pequeño, honesto y unit-testeado
  (`session-flow.test.ts`: "NO celebra solo, ni tras muchas vueltas").

## Consecuencias

- El e2e del camino feliz ahora verifica la vuelta EN VIVO y cierra con "Ya jugamos".
- COGA intacto: sigue sin game-over, sin límite de tiempo, sin retroceso; el cierre es del padre.
- La guía de prueba (E6) y el manual describen las vueltas; el gate ⭐ del bloque E se re-verifica
  sobre la preview.
