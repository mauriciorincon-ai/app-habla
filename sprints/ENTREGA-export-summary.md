# ENTREGA-EXPORT — summary

> Entrega puntual (orden `ENTREGA-EXPORT-orden.md`, planeadora, 2026-08-20). PR chico, sin
> storyboard y sin gate visual: **no se tocó el producto ni el `BROCHURE.html`**.
> Branch `entrega/export-y-cero-enlaces` · ejecutada 2026-08-21.

**Las dos cosas que faltaban** para la vitrina de hoja-de-vida, ambas nacidas DESPUÉS del
cierre del brochure de habla (2026-08-08): el **export estructurado** conforme al contrato
v1.0.0 y el **barrido de cero enlaces**. La producción sigue exactamente igual: **el link que
tiene la familia está vivo y público** — lo único que desapareció es su publicación dentro
de este repo, que es público.

---

## 1 · FASE 0 — Barrido CERO ENLACES

### El inventario decía 5; el comando encontró 9

La orden traía un inventario verificado desde la planeadora con **5 ubicaciones**. El
grep-gate corrido en el repo encontró **9**: las 5 más `docs/BLUEPRINT.html` (3 menciones,
nacidas en el cierre del ciclo H1, posteriores al barrido de la planeadora) y una línea más
de `docs/GUIA-DE-PRUEBA.html` (un ejemplo de ruta que arrastraba el dominio). Se barrieron
las 9. **Es exactamente la lección que dejó ds y que la orden citaba: el inventario es punto
de partida; el gate es EL COMANDO.** Se declara aquí como desviación del inventario, no del
plan.

| #   | Dónde                                       | Qué había                                      | Qué quedó                                                                           |
| --- | ------------------------------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------- |
| 1   | Campo homepage del repo GitHub              | La URL vieja del subdominio                    | Vacío (`gh repo edit --homepage ""`)                                                |
| 2   | `docs/GUIA-DE-PRUEBA.html:162`              | URL de preview del S4                          | Campo **EN USO**: «(pega aquí la dirección que trae la orden de prueba…)»           |
| 3   | `docs/GUIA-DE-PRUEBA.html:184`              | Ejemplo de ruta con el dominio pegado adelante | Ejemplo sin dominio: `…/spike/audio`                                                |
| 4   | `ENTREGA-brochure-informe-planeadora.md:12` | URL de producción                              | «(URL de producción — registro privado en la planeadora)»                           |
| 5   | `…informe-planeadora.md:119-120`            | 2 dominios reales                              | Conserva el HECHO (se reclamó un subdominio con el nombre real, y por qué) sin URLs |
| 6   | `…informe-planeadora.md:171`                | URL en tabla de infraestructura                | «Producción pública (URL en el registro privado de la planeadora)»                  |
| 7   | `docs/BLUEPRINT.html:99` (texto del SVG)    | El comodín del dominio del hosting             | «subdominio de Vercel»                                                              |
| 8   | `docs/BLUEPRINT.html:159` (tabla hosting)   | Ídem                                           | «Subdominio de Vercel» + nota de dónde vive la dirección real                       |
| 9   | `docs/BLUEPRINT.html:168` (tabla dominio)   | Ídem                                           | «Subdominio de Vercel»                                                              |

**La guía sigue completa y usable:** el bloque de URL no se eliminó, se volvió campo EN USO
(se llena al momento de probar, desde la orden, y jamás se commitea con una dirección
adentro). El blueprint sigue documentando hosting, dominio y protección — sin escribir la URL,
que es justo lo que pide la regla.

### Verificación (los dos gates de la orden)

```
$ grep -rn "vercel\.app\|workers\.dev\|hablemos[-]san" --include="*.md" --include="*.html" --include="*.json" .
(vacío)

$ gh repo view --json homepageUrl
{"homepageUrl":""}
```

⚠️ **Pendiente post-merge (lección de ds, anticipada):** la integración de Vercel **vuelve a
llenar el campo homepage tras el deploy de producción**. Se re-verifica DESPUÉS del merge; si
volvió, se limpia de nuevo y se anota aquí. Quedó escrito en la regla 13 del `CLAUDE.md` para
que no dependa de la memoria de nadie.

**Detalle del gate:** el comando documentado en el `CLAUDE.md` escribe el nombre del
subdominio como clase de carácter (`hablemos[-]san`) — regex equivalente que evita que el
propio comando se cace a sí mismo y deje el gate en rojo permanente.

---

## 2 · `docs/brochure-export.json` — contrato v1.0.0

El **primer export SELLADO del portafolio**: `estado: "sellado"`, `sellado_en: "2026-08-08"`
(gate visual aprobado + producción verificada desde afuera, ambos cierres ✅).

- **`_schema` copiado TAL CUAL** del contrato — el formato viaja con el archivo.
- **`enlaces.produccion: null`** con razón de **lista de espera**; **`repositorio: null`**.
  Nota honesta: este repo es **público**, así que la razón NO dice «repositorio privado»
  (sería falso) sino que la vitrina no enlaza repositorios por la regla de cero enlaces.
- **Los grupos REFLEJAN el brochure**, no lo reinventan: las 6 puertas con su nombre y su
  línea literales, más «La promesa mayor» (privacidad) y «Lo fino» — los dos actos donde
  viven las funcionalidades 23 y 24. La estrella es la puerta 1, como en el brochure.
- `descartadas: []` — en habla nada se construyó y se retiró.

### El conteo cuadra en los tres lados

| Fuente                                        | Número |
| --------------------------------------------- | ------ |
| Pie del `BROCHURE.html` (`data-contador`)     | **24** |
| Suma de features de los grupos del export     | **24** |
| Tabla de mapeo contra `docs/MANUAL-DE-USO.md` | **24** |

Y ya no depende de que alguien lo revise: **el test del contrato falla si los tres se
desincronizan.**

### Las métricas, todas MEDIDAS hoy (no copiadas de memoria)

| Métrica                     | Valor     | Fuente    | Comando / origen                              |
| --------------------------- | --------- | --------- | --------------------------------------------- |
| Funcionalidades             | 24        | medido    | tabla de mapeo contra el MANUAL               |
| Pantallas                   | 10        | medido    | `page.tsx` bajo `src/app` (11) menos el spike |
| Pruebas unitarias           | 261       | medido    | `pnpm test` — 20 archivos                     |
| Pruebas e2e                 | 169       | medido    | `pnpm test:e2e`                               |
| Cobertura de líneas         | 94,02 %   | medido    | v8                                            |
| Cápsulas                    | 50        | medido    | `content/capsulas.ts`                         |
| Hitos                       | 16        | medido    | `src/lib/rumbo/hitos.ts` (8 + 8 por umbral)   |
| Palabras del corrector      | 10 000    | medido    | `src/lib/objetivo/palabras-es.ts`             |
| Dependencias de runtime     | 6         | medido    | `package.json` (Sentry INERTE, sin DSN)       |
| Llamadas de red en el juego | 0         | medido    | e2e permanente de cero red                    |
| Rastro de la voz del niño   | 0 bytes   | medido    | e2e de storage tras jugar                     |
| Costo mensual               | 0 USD     | calculada | servicios contratados: ninguno                |
| Peso del brochure           | 125 567 B | medido    | `wc -c docs/BROCHURE.html`                    |
| ADRs                        | 14        | medido    | `decisions/`                                  |

> El export publica **261** pruebas unitarias: las 251 que ya existían más las **10 del test
> del contrato** que nació en esta misma entrega. La cifra del export se midió DESPUÉS de
> escribirlo, no antes.

---

## 3 · El test del contrato — demostrado en rojo

`tests/unit/brochure-export.test.ts` (10 pruebas). Se adoptó el patrón que recomendó ds y se
verificó que **de verdad caza** lo que dice cazar, mutando el JSON a propósito:

| Mutación                               | Resultado                                                                                       |
| -------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `total: 24` → `23`                     | 🔴 2 fallos: «el total cuadra con las features» + «el total es EL MISMO número que el pie»      |
| `"fuente": "calculada"` → `"como sea"` | 🔴 1 fallo: «TODA métrica lleva su fuente válida y su detalle»                                  |
| `produccion: null` → una URL           | 🔴 2 fallos: «ni producción ni repositorio viajan» + «el archivo no contiene ninguna dirección» |
| JSON restaurado                        | ✅ 10 pruebas verdes                                                                            |

---

## 4 · Reglas 12 y 13 en el `CLAUDE.md` de la app

- **12 · Brochure vivo + su export** (refleja la regla 13 del kit): el brochure está SELLADO,
  y el sello **no lo congela** — todo sprint que cambie features ajusta HTML **y** export en
  el MISMO PR, es DoD. El export sigue el contrato v1.0.0, con `_schema` tal cual, toda cifra
  con `fuente` medida al generarla y el total cuadrado contra el MANUAL.
- **13 · CERO ENLACES** (refleja la regla 17 del kit): ningún archivo ni campo de GitHub
  publica URLs de acceso; el campo de la guía va EN USO; el blueprint documenta sin URL; CTA
  = lista de espera; **el link de la familia sigue vivo, en el registro privado de la
  planeadora**. Incluye el comando del gate y el aviso de que Vercel reescribe el homepage.

---

## 5 · Verificación de la entrega

| Gate                              | Resultado                                                |
| --------------------------------- | -------------------------------------------------------- |
| Grep de cero enlaces              | ✅ VACÍO                                                 |
| `gh repo view --json homepageUrl` | ✅ `""` (re-verificar post-deploy)                       |
| `pnpm test`                       | ✅ 261 pruebas, 20 archivos · líneas 94,02 %             |
| `pnpm test:e2e`                   | ✅ 169 pruebas (suite completa: nada de la app cambió)   |
| `pnpm typecheck`                  | ✅ limpio                                                |
| `pnpm lint`                       | ✅ limpio                                                |
| `pnpm build`                      | ✅ exitoso                                               |
| `pnpm audit --audit-level high`   | ✅ sin vulnerabilidades conocidas (ver abajo)            |
| Conteo del export cuadrado        | ✅ 24 = 24 = 24, y con test que lo vigila                |
| Producción intacta                | ✅ cero cambios al `BROCHURE.html`, a `src/` y a los e2e |

### La CI se puso roja por algo que no era de esta entrega — y se arregló

El primer `quality` del PR falló en `pnpm audit`: una **alta en `nanoid`** (`<3.3.18`,
GHSA-2v37-7h3g-55p8), transitiva por `postcss` (que llega por `next`, `@sentry/nextjs`,
`@tailwindcss/postcss` y `vite` — 7 caminos). **No la introdujo esta entrega:** el PR no había
tocado `package.json` ni el lockfile, y el último `main` (2026-08-08) estaba verde — la
advisory se publicó después, así que `main` habría fallado igual en su próximo run.

Arreglo mínimo: `pnpm update nanoid -r` → **3.3.17 → 3.3.18**, dentro del rango que ya pedía
`postcss` (solo cambia `pnpm-lock.yaml`, ninguna dependencia declarada). Verificado después:
261 unit, 169 e2e, typecheck, lint y build limpios, y `pnpm audit` sin vulnerabilidades.

### Dos hallazgos del `/self-review`

1. **El blueprint declaraba el repositorio como «privado» y es PÚBLICO** (`gh repo view` →
   `PUBLIC`). Era un dato factual falso publicado, y justo sobre el hecho que da sentido a
   todo este barrido: se corrigió, y la fila ahora dice por qué rige la regla de cero enlaces.
2. **El comando del gate se cazaba a sí mismo** al escribirlo en el `CLAUDE.md`: se documenta
   con el nombre del subdominio como clase de carácter, regex equivalente que deja el gate
   utilizable sin dejarlo en rojo permanente.
3. **El export publicaba 251 pruebas unitarias y ya eran 261**: el JSON se escribió antes que
   el test del contrato, y el propio test lo desactualizó al nacer. Corregido a 261 / 20
   archivos. **Vale como advertencia para el portafolio:** el test del contrato vigila que las
   métricas tengan `fuente`, pero **no puede verificar que su valor siga siendo cierto** — eso
   solo lo caza volver a correr el comando. De ahí que la regla 12 diga «medida al generarla,
   jamás de memoria»: la última medición manda, y va de última.

### Un flake e2e, identificado y descartado como regresión

Tras actualizar `nanoid`, una pasada local de e2e dio **168/169**: falló
`objetivo.spec.ts:169` («guardar «animles» pregunta ¿Quisiste decir animales?») en
`mobile-chromium`. Se verificó antes de seguir: **aislado pasa en 263 ms**, y **la suite
completa vuelve a dar 169/169** en la siguiente pasada. No es regresión de la actualización
—esta entrega no tocó ningún e2e ni `src/`— sino un flake de arranque: esa pantalla carga el
diccionario de 10 000 palabras bajo demanda y, con los workers en paralelo, el primer render
puede llegar tarde. La CI lo absorbe (`retries: 2` en CI, 0 en local, que es justo por qué
apareció aquí y no allá). **Queda anotado como flake conocido para H2**, no se parchea en
una entrega que no toca el producto.

Deuda que sigue abierta para H2: el blueprint aún no documenta dominio y protección (heredada
del cierre del brochure), y este flake.

---

## 6 · Feedback al contrato (para la planeadora)

Dos cosas que aparecieron al adoptarlo, por si el contrato evoluciona:

1. **`privacidad` no tiene núcleo común definido.** El ejemplo de Dash trae
   `escribe_en_las_fuentes`, que es un campo suyo (su app lee archivos del usuario). En habla
   no significa nada, así que se omitió y el resto (`local_only`, `red_saliente`, `usa_ia`,
   `detalle`) se mantuvo. Convendría que el contrato diga cuáles son obligatorios y cuáles
   son extensiones propias de cada app.
2. **`razon_repositorio` asume repositorios privados.** El ejemplo dice «Repositorio
   privado.», pero habla es **público**: repetir esa frase sería una mentira publicada. Aquí
   la razón es que la vitrina no enlaza repositorios (regla de cero enlaces) — probablemente
   sea la formulación correcta para todo el portafolio, y la privacidad del repo sea un dato
   aparte.
