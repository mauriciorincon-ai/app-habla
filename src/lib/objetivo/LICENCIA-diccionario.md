# Diccionarios de ortografía — fuente, licencia y atribución

Los dos diccionarios embebidos del Objetivo (`palabras-es.ts`, `palabras-en.ts`) se generan con
`scripts/gen-diccionario.mjs` a partir de **Google Books Ngram** (1-gramas, edición 20200217, español `spa` e
inglés `eng`).

- **Fuente:** Google Books Ngram Viewer datasets — https://storage.googleapis.com/books/ngrams/books/datasetsv3.html
- **Licencia:** Creative Commons Attribution 3.0 Unported (**CC BY 3.0**) — https://creativecommons.org/licenses/by/3.0/
- **Qué exige:** solo la atribución, y esta app la da en **Ajustes → Acerca de** («Acerca de las palabras»).
  No hay cláusula de compartir igual ni de uso no comercial.
- **Qué viaja al repo:** únicamente las 16 000 palabras más frecuentes de cada idioma, ya curadas (alfabeto,
  sin nombres propios ni groserías ni términos de la lista de sensibilidad), más un suplemento corto escrito a
  mano con las palabras de la casa («hola», «dame», «mommy»…) que no lleva licencia ajena. El crudo de Ngram se
  lee en flujo y no se guarda.

## Corrección (S8)

Hasta el Sprint 007 el diccionario venía de **hermitdave/FrequencyWords** (OpenSubtitles 2018). El ADR-014 y la
cabecera de `palabras-es.ts` decían «MIT», y eso era un error: el código de FrequencyWords es MIT, pero **su
contenido es CC BY-SA 4.0**, que exige compartir igual. Esa fuente salió en el S8; ninguna palabra de ella
sobrevive por copia (la lista se rehízo entera desde Ngram).
