# ADR 014 — Diccionario de español embebido para la ortografía del objetivo

- **Status:** accepted (2026-08-07, Sprint 004 — decidido por el usuario EN el gate ⭐ ACUMULADO,
  bloque O; opciones evaluadas en vivo: chips en dos colores + corrector del sistema).
- **Sprint:** 004 "El rumbo" + cierre de ciclo H1.
- **Complementa:** el motor de sugerencias del objetivo (`lib/objetivo/sugerir.ts`, gate S4 O1).

## Contexto

El sugeridor del objetivo solo conocía el vocabulario de la app (~90 palabras de contenido). En
el gate, el usuario escribió "medi" yendo hacia "medios" y la app no pudo ayudarlo: le ofreció
«pedir» (lo único de la app a ≤2 letras) y el mensaje de "no está en el contenido". Su pedido:
sugerir la palabra **bien escrita aunque la app no la tenga** — en un color distinto, para que
se distinga "esto SÍ alinea juegos" de "esto es solo ortografía". El objetivo puede venir de las
terapias del niño con palabras que la app aún no tiene (caso O6): merecen quedar bien escritas.

## Decisión

**Diccionario embebido + corrector nativo, con chips en dos colores.**

1. **`src/lib/objetivo/palabras-es.ts`:** las 10 000 palabras más frecuentes del español que
   sobreviven una curaduría fuerte (fuente: OpenSubtitles 2018 vía hermitdave/FrequencyWords,
   MIT). El orden del arreglo ES el rango de frecuencia. Se regenera con
   `scripts/gen-diccionario.mjs` (ahí vive la curaduría: solo alfabeto español, marcadores
   anti-inglés, terminaciones no españolas con lista blanca de préstamos, interjecciones,
   y el veto de groserías/insultos/términos sexuales que JAMÁS deben salir como chip en una
   app familiar). ~115 KB, cargado BAJO DEMANDA al primer teclazo — jamás en el bundle inicial.
2. **`lib/objetivo/diccionario.ts` (motor puro):** prefijos por frecuencia («medi» → medio,
   médico, media…), parecidos (distancia ≤2, token ≥4) solo si el token NO es palabra conocida
   — a lo correcto no se le corrige nada. Una palabra conocida sí recibe **continuaciones**
   («medio» → medios). Excluye las claves del vocabulario de la app (esas van en su grupo).
3. **UI en dos grupos etiquetados** (nada comunica solo con color): chips verdes "Están en la
   app — alinean la cápsula y los juegos" · chips neutros "Bien escritas, aunque aún no están
   en la app". El paso de ortografía al guardar se calla ante palabra conocida (existir en el
   idioma ES estar bien escrito): «medios» o «colores» se guardan sin pregunta.
4. **Corrector del sistema además:** `lang="es" spellCheck` en el campo — el subrayado nativo
   del navegador/teclado cubre las palabras raras que el top-10k no trae.

## Alternativas descartadas

- **Solo el corrector nativo:** cero peso, pero sin chips tocables — en desktop es clic
  derecho, invisible para el flujo que el usuario pidió.
- **Hunspell/diccionario completo (~600k formas):** peso y complejidad desproporcionados para
  sugerir objetivos de una semana; el top-10k cubre el lenguaje de la casa.
- **IA/red:** vetadas por la regla dura 1 (quinto sprint con cero IA; determinista primero).

## Consecuencias

- Límite honesto: una palabra fuera de las 10 000 no recibe chip (el corrector nativo la cubre).
- La lista viaja curada y congelada en el repo: regenerarla es correr el script y revisar su
  "vigía" de sospechosas a ojo humano. Si cambia la fuente, re-verificar la curaduría.
- El unit de `palabras-es` clava forma, tope, duplicados y el veto (mierda/sexo/the/you…).
