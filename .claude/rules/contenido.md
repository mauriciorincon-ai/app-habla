---
paths:
  - "content/**"
  - "src/lib/idioma/**"
  - "docs/**"
---

# Contenido y texto (reglas duras 4, 5, 7, 8 y 20)

- El texto nace `{ es, en }`, redactado en cada idioma (no traducido), con test de paridad de claves.
- Sin plazos, sin puntajes, sin lenguaje de consultorio ni nombres de condiciones, en los dos idiomas. Co-uso siempre: el guion del adulto precede al juego. Palabras sueltas primero.
- Nada de la familia viaja: ni nombres, ni edades, ni gustos con nombre propio, en ningún idioma; los ejemplos usan perfiles inventados.
- El gate de sensibilidad (`scripts/gen-sensibilidad-hashes.mjs`, `tests/unit/sensibilidad.test.ts`) se regenera ANTES de redactar; un choque se arregla cambiando el copy, jamás escribiendo el término.
- El color nunca va solo (símbolo + texto + color). Nada se marca «descartado» sin decisión del dueño.
- Cero enlaces: ninguna URL de producción ni de preview en ningún archivo.
