# ADR 013 — El cohete tampoco termina solo: hitos de subida-y-bajada con cielo que pasa

- **Status:** accepted (2026-08-01, Sprint 004 — decidido por el usuario EN el gate ⭐ ACUMULADO,
  bloque F; opciones evaluadas en vivo: hito por cada subida-y-bajada + confeti + capa de cielo).
- **Sprint:** 004 "El rumbo" + cierre de ciclo H1.
- **Hermana de:** ADR-012 (el globo sin fin). **Supersede parcialmente:** el acceptance del S2
  ("el cohete celebra a las 3 inversiones").

## Contexto

El ADR-012 dejó al cohete con su meta a propósito: "su bloque del gate dirá". El bloque F lo
dijo: el usuario pidió el mismo comportamiento del globo — que el cohete siga subiendo
ilimitadamente, celebrando cada logro con confeti, "mostrando los niveles hacia arriba".

Hay un matiz honesto que el globo no tenía: **la posición del cohete ES el tono en vivo** (sube
cuando la voz sube). No puede acumular altura sin volverse mentira — la regla "la posición no
miente" manda.

## Decisión

1. **`meta: null` siempre: el intento JAMÁS se cierra solo.** Termina con "Ya jugamos" (o
   "Salir"). El cierre automático a las 3 inversiones cortaba el juego igual que el del globo.
2. **El hito: cada subida-y-bajada real de la voz** (cada inversión medida). Celebración en
   vivo sin detener nada: **confeti** (el estallido determinista compartido, `centrado` en el
   cielo del cohete) + **contador honesto** "¡Ya subió y bajó N veces!" — que es EXACTAMENTE el
   número que dirá la celebración final (misma métrica, cero semántica nueva).
3. **El ascenso se muestra con el MUNDO, no con el cohete:** una **capa de cielo** (nubes y
   estrellas deterministas) cruza hacia abajo UNA vez (~1,4 s) — como mirar por la ventanilla:
   el mundo corre, el cohete va más alto, y su posición sigue diciendo la verdad del tono. Sin
   bucle, sin parpadeo; con "reducir animaciones" no se muestra (el contador sigue).
   **Corrección de la re-mirada (mismo día):** la capa NO pasa en el instante del hito — ese
   instante es el PICO de la voz, justo cuando empieza a bajar, y el mundo corriendo hacia abajo
   hacía parecer SUBIDA lo que era bajada (hallazgo del usuario en la preview). La capa queda
   **pendiente y pasa cuando la voz VUELVE A SUBIR de verdad** (~65 ms sostenidos de ascenso):
   la ilusión de ascenso solo suena cuando de verdad se sube. El confeti y el contador sí
   celebran en el instante del hito — no insinúan dirección.
4. **Vocabulario:** nada de "niveles" en el microcopy — es la escalera vetada (rumbo anti-clínico
   y contra-recomendación de las etapas ordinales). Se celebran "subidas y bajadas", lo medido.
5. **De paso (F8):** el cohete adopta el patrón de planeo del globo — persecución 200 ms con voz
   (mayor que los 140 del globo: el tono llega a saltos y necesita más absorción) / 480 ms en
   pausa. Solo persigue, nunca se adelanta.
6. **La mecánica de meta del reducer queda SIN usuarios.** No se retira en pleno cierre de H1
   (motor probado); retirarla completa es **deuda declarada** para el próximo ciclo.

## Consecuencias

- El e2e del cohete verifica el hito EN VIVO (contador + confeti + capa) y que la celebración
  final nunca diga menos que lo celebrado en vivo; el de calma verifica que allí no hay hitos.
- COGA intacto: sin game-over, sin límite de tiempo, sin retroceso; el cierre es del padre.
- La guía (F3) y el manual describen los hitos; el gate ⭐ del bloque F se re-verifica sobre la
  preview.
