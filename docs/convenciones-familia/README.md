# Convenciones de la familia de apps (Habla ↔ Nutri-Kids)

**Versión: 0.1.0 — propuesta.** Escrita por Habla en el Sprint 10 para el dueño; no es vinculante hasta que
el dueño la ratifique y Nutri-Kids la adopte en su propio repo. Este documento solo **lee** Nutri-Kids (su
`design-system.md`); no escribe nada allí. Decisión: [ADR-022](../../decisions/022-shared-conventions-nutri-kids.md).

*Version 0.1.0 — proposal. Written by Habla in Sprint 10 for the owner; it is not binding until the owner
ratifies it and Nutri-Kids adopts it in its own repo. English summaries follow each rule.*

Las dos apps son para familias con un niño real detrás, las usa un adulto con el niño al lado, y comparten
tres promesas: **nada de la familia sale del aparato**, **el adulto dirige** y **cero presión**. Las seis
convenciones de abajo son lo mínimo que las dos pueden cumplir y comprobar. Cada una dice dónde la cumple
Habla (`ruta:línea`, que `tests/unit/convenciones.test.ts` verifica) y qué le falta a Nutri-Kids.

## C1 · El estado nunca va solo en color

Todo estado (bien, atención, alto; encendido, apagado) se dice con **símbolo + texto + color**; el color solo
refuerza. Los colores de estado tienen versión clara y oscura con contraste AA.

*C1 · State is never color alone. Every state uses symbol + text + color; color only reinforces.*

- **Habla:** [src/components/juego/forma-vocal.tsx:30](../../src/components/juego/forma-vocal.tsx) (letra + forma + color) ·
  [src/app/globals.css:112](../../src/app/globals.css) (tokens de estado) · axe en claro y oscuro en `tests/e2e/a11y.spec.ts`.
- **Nutri-Kids:** ya la cumple: su semáforo es símbolo + texto + color (`design-system.md:35-45`).

## C2 · Modo calma de un toque

Un interruptor visible en toda pantalla del niño baja la carga sensorial (sin celebraciones, sin contadores,
sin movimiento) y **se recuerda** entre sesiones.

*C2 · One-tap calm mode, visible on every child screen, remembered between sessions.*

- **Habla:** [src/lib/storage/schemas.ts:20](../../src/lib/storage/schemas.ts) (`modoCalma` guardado) ·
  [src/components/juego/marco-juego.tsx:96](../../src/components/juego/marco-juego.tsx) (el interruptor).
- **Nutri-Kids:** **le falta.** Su sistema de diseño no define modo calma; es la única brecha de esta versión.

## C3 · Tamaño de los toques

Toque del niño **≥ 64 px**; toque del adulto **≥ 44 px**.

*C3 · Child touch targets ≥ 64 px; adult ≥ 44 px.*

- **Habla:** [src/components/juego/mapa-vocales.tsx:172](../../src/components/juego/mapa-vocales.tsx) (`min-h-16` = 64 px, el niño) ·
  [src/components/juego/marco-juego.tsx:96](../../src/components/juego/marco-juego.tsx) (`min-h-11` = 44 px, el adulto).
- **Nutri-Kids:** cumple el piso del adulto (≥ 44 px, `design-system.md:71`); el del niño no aplica hoy (la usa el adulto).

## C4 · Microcopy sin plazos, sin puntajes, sin culpa

Prohibidos en los dos idiomas: plazos («resultados en N semanas»), puntajes de consultorio, nombres de
condiciones, culpa y premios por cumplir. El texto nace `{es, en}`, **redactado, no traducido**, con test de
paridad.

*C4 · Microcopy: no deadlines, no scores, no guilt. Text is born `{es, en}`, written, not translated.*

- **Habla:** [tests/unit/gate-idiomas.test.ts:18](../../tests/unit/gate-idiomas.test.ts) (copy prohibido en inglés) ·
  [tests/unit/idioma.test.ts:21](../../tests/unit/idioma.test.ts) (paridad).
- **Nutri-Kids:** ya prohíbe cifras corporales, culpa y premios con comida (`design-system.md:133-137`).

## C5 · Pictogramas ARASAAC con su crédito

Los pictogramas se usan bajo CC BY-NC-SA: crédito visible en la app **y en cada hoja impresa**, uso personal y
no comercial; si algún día dejara de serlo, se reemplazan antes.

*C5 · ARASAAC pictograms carry their credit in the app and on every printed sheet; non-commercial use.*

- **Habla:** [src/app/ajustes/page.tsx:104](../../src/app/ajustes/page.tsx) (Acerca de) ·
  [src/components/imprimibles/imprimibles-cliente.tsx:22](../../src/components/imprimibles/imprimibles-cliente.tsx) (pie de cada hoja).
- **Nutri-Kids:** si usa pictogramas, debe llevar el mismo crédito; hoy no los usa.

## C6 · Nada de la familia viaja

Ni nombres ni edades ni voz ni fotos en el repo, en commits ni en archivos que la app genera; los datos se
quedan en el aparato y lo que sale lo decide el adulto, cifrado.

*C6 · Nothing about the family travels: not in the repo, not in generated files; the adult decides what leaves.*

- **Habla:** [tests/unit/sensibilidad.test.ts:64](../../tests/unit/sensibilidad.test.ts) (gate) ·
  [tests/unit/privacidad-voice.test.ts:57](../../tests/unit/privacidad-voice.test.ts) (la voz no se guarda ni sale).
- **Nutri-Kids:** su propia constitución; esta convención solo pide que lo declare igual.

## Cómo se versiona

`0.x` = propuesta del builder, sin efecto. `1.0.0` = el dueño la ratificó y **las dos apps** la citan. Un cambio
que afloje una convención sube la versión mayor. La brecha abierta (C2 en Nutri-Kids) la decide el dueño.
