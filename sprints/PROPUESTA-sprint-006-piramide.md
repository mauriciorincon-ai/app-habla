---
sprint: 006 (propuesta — bifurcación del 2026-09-27; sigue la regla «lo que llega fuera del camino es el siguiente sprint»)
app: habla
tema: el documento de la mamá reorganizado por la pirámide de seis grupos, todas las cápsulas revisadas, formato de actividad, hiperpersonalizado
estado: PROPUESTA para la planeadora — pide investigación nueva + orden de construcción
fecha: 2026-09-27
---

# Propuesta · Sprint 006 — «La pirámide»: todas las cápsulas, por grupo, en formato de actividad

> **Regla de privacidad de este archivo:** repo público. Aquí no hay nombres, lugares, condiciones
> ni etiquetas: solo comportamiento observable y decisiones. El informe que dio origen a esto es
> un intercambio privado de la mamá; lo que se toma de él está traducido a observable.

## 1 · Qué pasó (contexto)

Tres semanas después del Sprint 005, el usuario trae un informe con lo que la mamá ve ahora en
el niño y una pirámide de seis piezas («antes de hablar se necesita: señalar · imitación ·
comprender · atención conjunta · intención comunicativa · juego»). Su pedido, en sus palabras:
las cápsulas «han sido muy valiosas» y «hemos logrado grandes avances»; ahora quiere
**hiperpersonalizarlas** a los gustos del niño, **una investigación profunda nueva** con ideas
nuevas, **complementar o unir** las que ya hay con más sustento, **cambiar la redacción** a un
copy neutro centrado en la actividad misma (qué tener a la mano · qué hacer · qué esperar ·
cómo saber que funcionó), y **organizar TODAS las cápsulas por los seis grupos de la pirámide**,
que no son secuenciales: se construyen todos a la vez. Calidad sobre cantidad: «no vamos a
hacer 100, pero no esperaría menos de 20». Prioridad ahora: **imitar, atención conjunta y
turnos de juego**.

## 2 · Decisiones ya tomadas por el usuario (2026-09-27)

| # | Decisión | Consecuencia |
|---|---|---|
| D1 | **Tono: instrucción directa a la mamá** (imperativo, sin narrativa ni adjetivos). | Cada cápsula es una ficha: *Ten a la mano · Haz · Tu línea · Espera ver · Funcionó si · Si no pasa*. |
| D2 | **TODAS las cápsulas se revisan**: las 24 de la mirada y las 50 de habla. Todas se clasifican en un grupo de la pirámide; se pueden agrupar, cambiar de tono, complementar o **unir**. | La biblioteca del documento se reescribe entera. El número final lo dictan la evidencia y las fusiones (piso: 20). |
| D3 | **El registro diario se descarta.** La mamá no lo consideró factible y no lo va a usar. No hubo registros. | Sale del documento: formulario, panel, «Enviar a papá», «Guardar registro», cuadrícula impresa, contrato JSON y sus tests. La «medida» pasa a vivir **dentro de cada cápsula** («Funcionó si…», observable, sin puntaje). |

Supuesto declarado (la planeadora o el usuario lo corrigen): **la app del niño sigue sin
cambios hasta noviembre.** Sus 50 cápsulas de habla en `content/capsulas.ts` siguen alimentando
«Hoy» tal cual; la biblioteca nueva vive en un archivo propio para el documento de la mamá. Qué
hacer con las dos bibliotecas en la app es decisión de la observación de noviembre.

## 3 · La línea de base nueva del niño, en observable (del informe, 2026-09-27)

| Lo que la mamá ve hoy | Grupo de la pirámide | Lectura |
|---|---|---|
| Sigue el dedo del adulto cuando señala. | señalar · atención conjunta | Responde a la atención conjunta. Falta que **él** señale o muestre **para compartir**, no solo para pedir. |
| En el juego de marchar mira los brazos y las piernas del adulto y los copia; voltea a ver si lo siguen, sonríe y corre para que lo persigan, con mirada sostenida. | imitación · juego · atención conjunta | Imita movimientos de cuerpo entero. Anticipa, inicia y pide que siga (peldaños 2–4 de la escalera del S5, presentes). Falta imitar **acciones con objetos y sonidos**. |
| Repite vocales; dice «tú» señalando; junta mano y voz para «hola» y «chao». | intención comunicativa · comprender | Gesto + palabra con intención social. |
| En el juego de cosquillas invierte los roles: se las hace al adulto, con el sonido del juego. | juego (turnos) · intención comunicativa | Turno con roles cambiados, arrancado por él. Falta que el turno **dure varias idas y vueltas**. |

**Los favoritos del niño (para personalizar):** marchar e imitar movimientos grandes · «corre que
te atrapo» · las cosquillas con su sonido propio · señalar y decir «tú» · «hola» y «chao» con la
mano · las vocales. Todo con la mamá; el hermano (16) sigue siendo la «otra persona» hasta
noviembre.

**Objetivo del sprint, en observable:** que él **imite acciones con objetos y sonidos** (no solo
cuerpo), que **señale o muestre para compartir** algo con el adulto, y que un **turno de juego
dure varias idas y vueltas** — y que todo eso se construya **junto** con señalar, comprender e
intención comunicativa, no después.

## 4 · Lo que se le pide a la planeadora

1. **Investigación nueva, profunda, con anexos** (casa privada): por cada grupo de la pirámide,
   las actividades concretas con evidencia para un niño de 4–5 años **que ya tiene lo de la §3**
   —qué las hace funcionar, qué no hacer, dosis— con énfasis en **imitación (objetos y sonidos,
   ida y vuelta), atención conjunta iniciada por el niño (mostrar, señalar para compartir) y
   turnos que se sostienen**. Que incluya cómo se **mide en casa sin puntaje** cada actividad
   (el «funcionó si» observable). Citas públicas como en el S5 (autor · año · revista, o autor ·
   año cuando la revista describe a quién se estudió). Lista de términos sensibles: revisar si
   hay que ampliarla.
2. **Revisión de las 74** contra la investigación: cuáles se quedan, cuáles se unen, cuáles se
   caen (p. ej. las 5 de habla que necesitan la app), cuáles faltan por grupo. La planeadora
   propone el mapa; el builder lo ejecuta.
3. **Orden de construcción** del Sprint 006 con el contrato de fases y los gates del usuario:
   G-Investigación → G-Contenido (él lee TODO el documento nuevo antes de que llegue a la mamá).

## 5 · Lo que el builder propone construir (para la orden)

1. **Schema nuevo del documento** (`content/schema.ts`, sin tocar las 50 de la app): `grupo`
   (los seis de la pirámide) · `prioridad` (alta para imitación, atención conjunta, juego) ·
   `tecnica` (etiqueta, sigue existiendo) · `titulo` · `tenALaMano[]` · `haz[]` (3–5 pasos) ·
   `tuLinea` · `esperaVer` · `funcionoSi` · `siNoPasa` · `duracion` · `momentos[]` · `conQuien`
   · `origen` (de-mirada · de-habla · nueva · fusión de […]) · `fuente`. Biblioteca: todos los
   grupos cubiertos; los tres prioritarios con más cápsulas; piso 20, techo lo que la evidencia
   justifique.
2. **Documento regenerado** (`/mirada` sigue siendo la ruta): portada con **los favoritos del
   niño** y la pirámide explicada en una frase por grupo («todas a la vez»); un índice por grupo;
   cada cápsula como ficha de actividad; «qué no hacer» y semáforo se quedan. **Sale el registro
   entero.** Se mantiene: cero pantalla, imprimible, teléfono primero, `?revision` para el papá.
3. **Copy**: instrucción directa (D1). Sin narrativa, sin adjetivos, sin plazos, sin puntajes.
   Personalizado: los ejemplos usan sus favoritos (marchar, corre que te atrapo, las cosquillas
   con su sonido, «tú», «hola»/«chao»).
4. **Gate de sensibilidad**: la biblioteca nueva entra entera al alcance del gate (incluidas las
   que vienen de las 50: sus citas se reescriben limpias con la investigación nueva).
5. **Tests**: schema y biblioteca (grupos cubiertos, prioridad, piso), e2e del documento (ruta,
   seis grupos, cero registro, axe), gate verde. Guía de prueba v6 (bloque nuevo; el bloque P
   del registro se **elimina** y se declara en el historial). Manual: sección reescrita; sale
   «Qué hacer con lo que le llega».
6. **Cierre**: `/audita-sprint` · summary en el PR (con la decisión del registro y su razón) ·
   merge a orden del usuario · homepage re-verificado.

## 6 · Qué NO se toca

La app del niño y sus 50 cápsulas (`content/capsulas.ts`), el brochure y su export, la planeadora.

## 7 · Preguntas abiertas para la planeadora / el usuario

- ¿La escalera de seis peldaños del S5 sigue viva como progresión dentro de cada grupo, o la
  pirámide la reemplaza? (Propuesta del builder: la pirámide organiza; el peldaño se conserva
  como etiqueta opcional solo en las de atención conjunta.)
- ¿Las cápsulas que hoy «necesitan la app» se caen del documento o se adaptan a versión sin
  pantalla? (Propuesta: adaptar las que tengan versión de casa; caer las demás.)
