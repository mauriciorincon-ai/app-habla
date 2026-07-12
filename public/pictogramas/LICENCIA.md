# Pictogramas ARASAAC — licencia y atribución

Los pictogramas de esta carpeta **no son obra de esta app**. Se usan bajo licencia, y su
atribución es obligatoria.

- **Autor de los pictogramas:** Sergio Palao
- **Origen:** ARASAAC (https://arasaac.org)
- **Propiedad:** Gobierno de Aragón (España)
- **Licencia:** Creative Commons BY-NC-SA
  (https://creativecommons.org/licenses/by-nc-sa/4.0/deed.es)

## Qué significa aquí (ADR 008)

- **BY** — la atribución de arriba aparece en la app, visible para el usuario, en
  *Ajustes → Acerca de*.
- **NC (no comercial)** — Hablemos San es una app **personal y no comercial**. Si algún día
  dejara de serlo, estos pictogramas deben **reemplazarse** (o relicenciarse) ANTES de ese
  cambio.
- **SA** — cualquier obra derivada de los pictogramas se comparte bajo la misma licencia.

## Cómo se generó este lote

`node scripts/descargar-pictos.mjs` — descarga única en desarrollo, con curaduría humana de las
palabras (nivel "palabras sueltas", ADR 005). **En runtime la app no llama a ARASAAC:** sirve
estos archivos desde el repo, y un test e2e verifica que no hay ninguna petición de red durante
los juegos. `lote.json` guarda la trazabilidad (qué id de ARASAAC quedó en cada archivo).
