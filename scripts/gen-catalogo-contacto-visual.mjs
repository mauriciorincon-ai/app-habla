// Genera docs/CATALOGO-CONTACTO-VISUAL.html — EL DOCUMENTO DE LA MAMÁ (Sprint 005).
//
// Es el caballo de batalla hasta noviembre: las cápsulas de contacto visual como progresión,
// para trabajarlas a diario SIN pantallas para el niño (ella lo lee en su teléfono o impreso).
// Lleva adentro el REGISTRO DIARIO (bloques A/B/C — nunca un puntaje del niño), que vive solo en
// su teléfono y sale de ahí únicamente cuando ella lo envía o lo guarda.
//
// La fuente de verdad es content/contacto-visual.ts (se importa DIRECTO — cero copias a mano):
// si el contenido cambia, regenerar con `pnpm gen:catalogo-mirada`. La app lo sirve en /mirada
// (scripts/copiar-documentos.mjs + rewrite). Autocontenido: cero CDNs, cero peticiones.
//
// Regla de la casa: aquí solo hay COMPORTAMIENTO OBSERVABLE. Ninguna etiqueta, ninguna
// condición, ninguna jerga; el gate de sensibilidad (tests/unit/sensibilidad.test.ts) lo vigila.
//
// Modo revisión (para el padre, G-Contenido): abrir con `?revision` muestra las preguntas de
// juicio y la casilla «Revisada» por cápsula. La mamá no lo ve.

import { writeFileSync } from "node:fs";
import { CAPSULAS_CONTACTO_VISUAL } from "../content/contacto-visual.ts";
import {
  BibliotecaContactoVisualSchema,
  DESCRIPCION_NIVEL_CONTACTO_VISUAL,
  DESCRIPCION_TECNICA_CONTACTO_VISUAL,
  FUERZA_TECNICA_CONTACTO_VISUAL,
  NIVELES_CONTACTO_VISUAL,
  NOMBRE_FUERZA,
  NOMBRE_MOMENTO,
  NOMBRE_NIVEL_CONTACTO_VISUAL,
  NOMBRE_TECNICA_CONTACTO_VISUAL,
  TECNICAS_CONTACTO_VISUAL,
} from "../content/schema.ts";
import {
  ITEMS_A,
  ITEMS_B,
  NOMBRE_ITEM_A,
  NOMBRE_ITEM_B,
  NOMBRE_RESPUESTA_A,
  NOMBRE_RESPUESTA_C,
  REGISTRO_CLAVE_STORAGE,
  REGISTRO_VERSION,
  RESPUESTAS_A,
  RESPUESTAS_C,
} from "../content/registro-contacto-visual.ts";
import { PALETA_CSS, esc, fechaHoy } from "./lib/catalogo-comun.mjs";

const fecha = fechaHoy();
const capsulas = CAPSULAS_CONTACTO_VISUAL;
// Mientras la biblioteca no cumpla su schema completo (fase 0), el documento se marca de prueba.
const BIBLIOTECA_COMPLETA = BibliotecaContactoVisualSchema.safeParse(capsulas).success;
const numeroNivel = (n) => n.slice(1);

// ── Qué no hacer (§6 de la investigación aprobada, en observable) ─────────────────────────
const QUE_NO_HACER = [
  "No le digas «mírame» ni le pidas la mirada. Y no le retengas el juguete hasta que mire.",
  "Ningún premio por mirar. Lo que sigue a su mirada es que el juego sigue.",
  "Si aparta la vista, se tapa la cara o se irrita, paras. Ese es el único semáforo que vale. Si está muy acelerado, suavizas.",
  "Con un juguete que lo absorbe, no compitas: métete en el juguete y haz turnos con él.",
  "Durante el juego, sin preguntas de examen ni órdenes. Tus turnos, cortos.",
  "Persona nueva o juego nuevo — nunca los dos el mismo día.",
  "No «gastes» su nombre: llámalo solo cuando venga algo que valga la pena.",
  "Sin plazos, sin metas con número, sin comparar con otros niños. Y tú también descansas.",
];

// ── Preguntas de juicio (modo revisión — G-Contenido del padre) ───────────────────────────
const JUICIO = [
  "¿Lo puede hacer la mamá en su día real, en un momento corto, sin preparar nada?",
  "¿Reconoces al niño en la línea de base y en el nivel donde arranca cada cápsula?",
  "¿Alguna cápsula le pediría forzarlo, aunque sea un poquito? Si sí, cuál.",
  "¿La línea la diría ella tal cual? ¿Le suena a jugar con él y no a una tarea?",
];

// ── Secciones ─────────────────────────────────────────────────────────────────────────────
const tecnicasHtml = TECNICAS_CONTACTO_VISUAL.map((t) => {
  const fuerza = FUERZA_TECNICA_CONTACTO_VISUAL[t];
  return `
      <li class="tecnica">
        <p class="tecnica-nombre">${esc(NOMBRE_TECNICA_CONTACTO_VISUAL[t])}
          <span class="chip chip-${fuerza}">${esc(NOMBRE_FUERZA[fuerza])}</span></p>
        <p class="suave">${esc(DESCRIPCION_TECNICA_CONTACTO_VISUAL[t])}</p>
      </li>`;
}).join("");

const escaleraHtml = NIVELES_CONTACTO_VISUAL.map(
  (n) => `
      <li>
        <span class="peldano">${numeroNivel(n)}</span>
        <div><strong>${esc(NOMBRE_NIVEL_CONTACTO_VISUAL[n])}</strong>
          <p class="suave">${esc(DESCRIPCION_NIVEL_CONTACTO_VISUAL[n])}</p></div>
      </li>`,
).join("");

function formularioRegistro(c) {
  const id = esc(c.id);
  const filaA = (item) => `
          <div class="fila" role="group" aria-label="${esc(NOMBRE_ITEM_A[item])}">
            <p class="fila-texto">${esc(NOMBRE_ITEM_A[item])}</p>
            <div class="segmentos">${RESPUESTAS_A.map(
              (r) => `
              <label><input type="radio" name="a-${item}-${id}" value="${r}"><span>${esc(NOMBRE_RESPUESTA_A[r])}</span></label>`,
            ).join("")}
            </div>
          </div>`;
  const filaB = (item) => `
          <label class="marca"><input type="checkbox" name="b-${item}-${id}"><span>${esc(NOMBRE_ITEM_B[item])}</span></label>`;
  return `
      <form class="registro" data-registro data-capsula="${id}" hidden>
        <p class="registro-titulo">Este momento, en dos minutos</p>
        <fieldset>
          <legend>A · Lo que hice yo</legend>${ITEMS_A.map(filaA).join("")}
        </fieldset>
        <fieldset>
          <legend>B · Lo que vi en él <span class="suave">(marca lo que pasó; no hay que contar)</span></legend>${ITEMS_B.map(filaB).join("")}
          <label class="ejemplo"><span>Un ejemplo, si quieres («hoy señaló el avión»)</span>
            <input type="text" name="ejemplo-${id}" maxlength="200" autocomplete="off"></label>
        </fieldset>
        <fieldset>
          <legend>C · Cómo estuvo él</legend>
          <div class="segmentos">${RESPUESTAS_C.map(
            (r) => `
            <label><input type="radio" name="c-${id}" value="${r}"><span>${esc(NOMBRE_RESPUESTA_C[r])}</span></label>`,
          ).join("")}
          </div>
          <label class="marca"><input type="checkbox" name="paramos-${id}"><span>Paramos</span></label>
        </fieldset>
        <p class="registro-error" role="alert" hidden>Falta marcar las tres de «lo que hice yo» y cómo estuvo él.</p>
        <div class="acciones">
          <button type="submit" class="boton">Guardar en este teléfono</button>
          <button type="button" class="boton boton-suave" data-cancelar>Ahora no</button>
        </div>
      </form>`;
}

function capsulaHtml(c) {
  const fuerza = FUERZA_TECNICA_CONTACTO_VISUAL[c.tecnica];
  return `
    <article class="capsula" id="${esc(c.id)}" data-capsula-id="${esc(c.id)}" data-titulo="${esc(c.titulo)}">
      <label class="revision solo-revision"><input type="checkbox" data-revision="${esc(c.id)}"> Revisada</label>
      <h4>${esc(c.titulo)}</h4>
      <p class="chips">
        <span class="chip">${esc(NOMBRE_TECNICA_CONTACTO_VISUAL[c.tecnica])}</span>
        <span class="chip chip-${fuerza}">${esc(NOMBRE_FUERZA[fuerza])}</span>
        <span class="chip suave">${esc(c.actividad.duracion)}</span>
        ${c.actividad.momentos.map((m) => `<span class="chip suave">${esc(NOMBRE_MOMENTO[m])}</span>`).join("")}
        ${c.conQuien === "otra-persona" ? `<span class="chip chip-otra">con otra persona</span>` : ""}
      </p>
      <p class="explicacion">${esc(c.explicacion)}</p>
      <blockquote><strong>Tu línea:</strong> ${esc(c.guion)}</blockquote>
      <p class="actividad"><strong>La actividad:</strong> ${esc(c.actividad.texto)}</p>
      <p class="ojo"><strong>Ojo:</strong> ${esc(c.queNoHacer)}</p>
      <p class="fuente">${esc(c.fuente)}</p>
      <button type="button" class="boton boton-registrar" data-abrir-registro="${esc(c.id)}">Registrar este momento</button>
      ${formularioRegistro(c)}
    </article>`;
}

let cuerpo = "";
for (const nivel of NIVELES_CONTACTO_VISUAL) {
  const deNivel = capsulas.filter((c) => c.nivel === nivel);
  cuerpo += `
  <section class="nivel" id="nivel-${numeroNivel(nivel)}">
    <h3><span class="peldano">${numeroNivel(nivel)}</span> ${esc(NOMBRE_NIVEL_CONTACTO_VISUAL[nivel])}
      <span class="conteo">(${deNivel.length} ${deNivel.length === 1 ? "cápsula" : "cápsulas"})</span></h3>
    <p class="suave">${esc(DESCRIPCION_NIVEL_CONTACTO_VISUAL[nivel])}</p>
    ${deNivel.length ? deNivel.map(capsulaHtml).join("") : `<p class="vacio">Todavía no hay cápsulas en este peldaño.</p>`}
  </section>`;
}

const avisoPrueba = BIBLIOTECA_COMPLETA
  ? ""
  : `
  <p class="aviso aviso-prueba"><strong>Versión de prueba.</strong> Estas cápsulas existen para probar el documento y el
  registro en el teléfono. Las cápsulas reales llegan cuando el papá apruebe el contenido.</p>`;

const html = `<!doctype html>
<html lang="es-CO">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<title>Hablemos San — Mirarse jugando</title>
<style>
${PALETA_CSS}
  * { box-sizing: border-box; }
  html { -webkit-text-size-adjust: 100%; }
  body { margin: 0; padding: 1.25rem 1rem 5rem; background: var(--fondo); color: var(--tinta);
    font: 17px/1.55 Georgia, "Times New Roman", serif; }
  main { max-width: 42rem; margin: 0 auto; }
  h1 { font-size: 2rem; line-height: 1.12; margin: .3rem 0 .6rem; }
  h2 { font-size: 1.35rem; line-height: 1.2; margin: 2.4rem 0 .5rem; padding-bottom: .35rem; border-bottom: 2px solid var(--borde); }
  h3 { font-size: 1.12rem; margin: 1.8rem 0 .3rem; color: var(--acento); display: flex; align-items: center; gap: .5rem; flex-wrap: wrap; }
  h4 { margin: .1rem 0 .4rem; font-size: 1.08rem; line-height: 1.3; }
  p { margin: .45rem 0; }
  .eyebrow { font: 600 .72rem/1 system-ui, sans-serif; letter-spacing: .08em; text-transform: uppercase; color: var(--suave); margin: 0; }
  .suave { color: var(--suave); }
  .conteo { font-weight: normal; font-size: .85em; color: var(--suave); }
  .aviso { background: var(--superficie); border: 1px solid var(--borde); border-radius: 14px; padding: .9rem 1rem; }
  .aviso-prueba { border-color: var(--aviso); background: var(--aviso-suave); }
  .encuadre { border-left: 4px solid var(--acento); }
  .semaforo { border-left: 4px solid var(--peligro); }
  ul.lista { padding-left: 1.2rem; } ul.lista li { margin: .35rem 0; }
  ol.pasos { padding-left: 1.3rem; } ol.pasos li { margin: .4rem 0; }
  .escalera { list-style: none; padding: 0; margin: .5rem 0; }
  .escalera li { display: flex; gap: .75rem; align-items: flex-start; padding: .6rem 0; border-bottom: 1px dashed var(--borde); }
  .escalera li p { margin: .15rem 0 0; font-size: .95rem; }
  .peldano { flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center; width: 2rem; height: 2rem;
    border-radius: 999px; background: var(--acento); color: var(--fondo); font: 700 .95rem/1 system-ui, sans-serif; }
  .tecnicas { list-style: none; padding: 0; margin: .5rem 0; }
  .tecnica { padding: .7rem 0; border-bottom: 1px dashed var(--borde); }
  .tecnica-nombre { margin: 0; font-weight: 700; display: flex; align-items: center; gap: .5rem; flex-wrap: wrap; }
  .tecnica .suave { margin: .2rem 0 0; font-size: .95rem; }
  .chips { margin: .2rem 0 .6rem; line-height: 1.9; }
  .chip { display: inline-block; font: 600 .72rem/1 system-ui, sans-serif; letter-spacing: .03em; background: var(--acento-suave);
    color: var(--acento); border-radius: 999px; padding: .32rem .62rem; margin: 0 .3rem .3rem 0; vertical-align: middle; }
  .chip.suave { background: transparent; border: 1px solid var(--borde); color: var(--suave); }
  .chip-fuerte { background: var(--acento); color: var(--fondo); }
  .chip-moderada { background: var(--acento-suave); color: var(--acento); }
  .chip-otra { background: var(--aviso-suave); color: var(--tinta); }
  .capsula { background: var(--superficie); border: 1px solid var(--borde); border-radius: 16px; padding: 1rem 1.1rem 1.1rem; margin: .9rem 0; position: relative; }
  .capsula.lista { opacity: .55; }
  .revision { position: absolute; top: .9rem; right: 1rem; font: .8rem system-ui, sans-serif; color: var(--suave); user-select: none; }
  .solo-revision { display: none; }
  body.revision .solo-revision { display: block; }
  body.revision .capsula h4 { margin-right: 6rem; }
  blockquote { margin: .6rem 0; padding: .55rem .9rem; border-left: 4px solid var(--acento); background: var(--fondo); border-radius: 0 10px 10px 0; font-style: italic; }
  blockquote strong, .actividad strong, .ojo strong { font-style: normal; }
  .ojo { font-size: .95rem; padding: .5rem .8rem; background: var(--fondo); border-radius: 10px; border: 1px dashed var(--borde); }
  .fuente { font: .78rem system-ui, sans-serif; color: var(--suave); margin: .5rem 0 .2rem; }
  .vacio { color: var(--suave); font-style: italic; }
  .boton { font: 600 1rem system-ui, sans-serif; min-height: 48px; padding: .7rem 1.1rem; border-radius: 12px; border: 2px solid var(--acento);
    background: var(--acento); color: var(--fondo); cursor: pointer; }
  .boton:focus-visible, input:focus-visible { outline: 3px solid var(--info); outline-offset: 2px; }
  .boton-suave { background: transparent; color: var(--acento); }
  .boton-peligro { background: transparent; color: var(--peligro); border-color: var(--peligro); }
  .boton-registrar { margin-top: .6rem; width: 100%; }
  .registro { margin-top: .8rem; padding: .9rem; background: var(--fondo); border: 2px solid var(--acento-suave); border-radius: 14px; }
  .registro-titulo { margin: 0 0 .3rem; font: 700 1rem system-ui, sans-serif; }
  fieldset { border: 0; padding: 0; margin: .8rem 0 0; }
  legend { font: 700 .95rem system-ui, sans-serif; padding: 0; margin-bottom: .4rem; }
  .fila { margin: .45rem 0 .7rem; }
  .fila-texto { margin: 0 0 .3rem; font-size: .98rem; }
  .segmentos { display: flex; gap: .4rem; flex-wrap: wrap; }
  .segmentos label { flex: 1 1 5.5rem; }
  .segmentos input { position: absolute; opacity: 0; width: 1px; height: 1px; }
  .segmentos span { display: flex; align-items: center; justify-content: center; min-height: 46px; padding: .4rem .6rem; border-radius: 12px;
    border: 2px solid var(--borde); background: var(--superficie); font: 600 .92rem system-ui, sans-serif; text-align: center; cursor: pointer; }
  .segmentos input:checked + span { border-color: var(--acento); background: var(--acento-suave); color: var(--acento); }
  .segmentos input:focus-visible + span { outline: 3px solid var(--info); outline-offset: 2px; }
  .marca { display: flex; align-items: center; gap: .6rem; min-height: 46px; padding: .3rem .2rem; font: .98rem system-ui, sans-serif; cursor: pointer; }
  .marca input { width: 1.4rem; height: 1.4rem; accent-color: var(--acento); flex: 0 0 auto; }
  .ejemplo { display: block; margin-top: .5rem; font: .9rem system-ui, sans-serif; color: var(--suave); }
  .ejemplo input { display: block; width: 100%; margin-top: .3rem; min-height: 46px; padding: .5rem .7rem; font: 1rem Georgia, serif; color: var(--tinta);
    background: var(--superficie); border: 2px solid var(--borde); border-radius: 12px; }
  .registro-error { color: var(--peligro); font: .92rem system-ui, sans-serif; }
  .acciones { display: flex; gap: .5rem; flex-wrap: wrap; margin-top: .8rem; }
  .acciones .boton { flex: 1 1 10rem; }
  .panel { background: var(--superficie); border: 1px solid var(--borde); border-radius: 16px; padding: 1rem 1.1rem; }
  .entradas { list-style: none; padding: 0; margin: .5rem 0 0; }
  .entradas li { padding: .6rem 0; border-top: 1px dashed var(--borde); font-size: .95rem; }
  .entradas .cuando { font: 600 .8rem system-ui, sans-serif; color: var(--suave); letter-spacing: .03em; }
  .entradas .quitar { font: .8rem system-ui, sans-serif; color: var(--peligro); background: none; border: 0; padding: .4rem 0; cursor: pointer; min-height: 40px; }
  .toast { position: fixed; left: 50%; bottom: 1.2rem; transform: translateX(-50%); background: var(--tinta); color: var(--fondo);
    padding: .7rem 1rem; border-radius: 12px; font: 600 .92rem system-ui, sans-serif; max-width: 90vw; text-align: center; z-index: 9; }
  .toast[hidden] { display: none; }
  .cuadricula { display: none; }
  footer { margin-top: 3rem; font-size: .8rem; color: var(--suave); border-top: 1px solid var(--borde); padding-top: 1rem; }
  @media (prefers-reduced-motion: no-preference) { .capsula { transition: opacity .2s; } }
  @media print {
    body { padding: 0; font-size: 11pt; background: #fff; color: #000; }
    .boton, .registro, .panel, .toast, .solo-revision, .no-imprimir { display: none !important; }
    .capsula { break-inside: avoid; border: 1px solid #999; background: #fff; }
    .cuadricula { display: block; break-before: page; }
    .cuadricula table { width: 100%; border-collapse: collapse; font: 9pt system-ui, sans-serif; }
    .cuadricula th, .cuadricula td { border: 1px solid #999; padding: .25rem .3rem; text-align: left; vertical-align: top; }
    .cuadricula td.dia { width: 4.5rem; height: 3.2rem; }
  }
</style>
</head>
<body>
<main>
  <header>
    <p class="eyebrow">Hablemos San · Para la mamá · sin pantallas</p>
    <h1>Mirarse jugando</h1>
    <p>Él <strong>ya mira</strong>: cuando algo le interesa, y a las personas en quienes confía. Lo que sigue no es enseñarle a mirar.
    Es <strong>estirar</strong> lo que ya hace — que la mirada aguante dentro de un turno de juego, y que pase también con su hermano, con
    quien viva en la casa, en el baño, en la mesa. Todo lo de aquí sale de lo que ya le saca la mirada: las cosquillas, algunas canciones, el juego físico, y tú.</p>
    ${avisoPrueba}
    <div class="aviso encuadre">
      <p><strong>Esto no es una prueba.</strong> Ni para él ni para ti. No hay forma correcta o incorrecta de jugar, no hay totales
      ni metas con número, y ningún nivel tiene plazo. La mirada nunca es una condición para nada: lo que sigue a su mirada es que
      el juego sigue.</p>
      <p><strong>La dosis son momentos cortos</strong> — de 5 a 30 minutos, repartidos en el día: en el baño, en la mesa, jugando, al
      acostarlo. No son sesiones. Y <strong>descansar también cuenta</strong>: una mamá cansada juega peor que una mamá que paró a tiempo.</p>
    </div>
    <div class="aviso semaforo">
      <p><strong>El único semáforo:</strong> si aparta la vista, se tapa la cara o se irrita cuando le pides algo con la mirada, <strong>se para</strong>.
      Si está muy acelerado, suavizas. Se vuelve a intentar más tarde, o mañana.</p>
    </div>
  </header>

  <h2>Cómo se usa</h2>
  <ol class="pasos">
    <li><strong>Elige un momento corto</strong> en que él ya esté contento, y una cápsula del peldaño donde va.</li>
    <li><strong>Lee la cápsula</strong> — treinta segundos: qué hacer, tu línea, y el «ojo».</li>
    <li><strong>Hazla.</strong> Ponte a su altura y de frente, sigue lo que él eligió, y espera.</li>
    <li>Si quieres, <strong>registra ese momento</strong> — dos minutos, en este mismo teléfono. Lo que hiciste tú, lo que viste en él y cómo estuvo. Sin contar nada.</li>
  </ol>

  <h2>La escalera: por dónde va y por dónde sigue</h2>
  <p>Seis peldaños, descritos por lo que tú ves. <strong>Contigo ya está en el 1</strong>, y con las cosquillas y algunas canciones ya
  asoma el 2. Se sube un peldaño cuando el anterior pasa <em>la mayoría de las veces</em> contigo — sin fecha. Dos atajos: si un juguete lo
  absorbe, entra por el 3 (turnos con ese juguete); si hay poco interés, por el 2 (juego físico o canción).</p>
  <ol class="escalera">${escaleraHtml}
  </ol>

  <h2>Las seis maneras</h2>
  <p>Cada cápsula usa una. Al lado de cada una va qué tan fuerte es la evidencia que la respalda.</p>
  <ul class="tecnicas">${tecnicasHtml}
  </ul>

  <h2>Qué no hacer</h2>
  <ul class="lista">${QUE_NO_HACER.map((q) => `
    <li>${esc(q)}</li>`).join("")}
  </ul>

  <section class="solo-revision aviso" aria-label="Preguntas de juicio para la revisión">
    <p class="eyebrow">Modo revisión · para el papá, antes de que llegue a la mamá</p>
    <ul class="lista">${JUICIO.map((q) => `
      <li>${esc(q)}</li>`).join("")}
    </ul>
    <p class="suave"><span id="revisadas">0</span> de ${capsulas.length} revisadas · tu avance queda guardado en este navegador.</p>
  </section>

  <h2>Las cápsulas, peldaño a peldaño</h2>
  ${cuerpo}

  <h2 id="mis-registros">Mis registros</h2>
  <section class="panel" aria-labelledby="mis-registros">
    <p class="suave">Lo que anotas vive <strong>solo en este teléfono</strong>. Sale de aquí únicamente si tú lo envías o lo guardas.
    «Enviar a papá» arma un resumen con ejemplos — nunca números.</p>
    <div class="acciones">
      <button type="button" class="boton" data-enviar>Enviar a papá</button>
      <button type="button" class="boton boton-suave" data-guardar>Guardar registro</button>
    </div>
    <p class="suave" data-vacio>Todavía no has registrado ningún momento. Cada cápsula tiene su botón «Registrar este momento».</p>
    <ul class="entradas" data-entradas></ul>
    <div class="acciones no-imprimir" data-borrar-todo hidden>
      <button type="button" class="boton boton-peligro" data-borrar>Borrar todos mis registros</button>
    </div>
  </section>

  <section class="cuadricula" aria-label="Cuadrícula semanal para llenar a mano">
    <h2>Mi semana, a mano</h2>
    <p>Por si prefieres papel: una fila por momento. Marca lo que hiciste tú y lo que viste en él; una foto de esta hoja se la mandas a papá.</p>
    <table>
      <thead><tr><th>Día y momento</th><th>Cápsula</th><th>Lo que hice yo</th><th>Lo que vi en él (un ejemplo)</th><th>Cómo estuvo él</th></tr></thead>
      <tbody>${["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"].map((d) => `
        <tr><td class="dia">${d}</td><td></td><td>altura y de frente ☐ · seguí y esperé ☐ · pausa o imité ☐</td><td></td><td>a gusto ☐ · neutro ☐ · incómodo ☐</td></tr>`).join("")}
      </tbody>
    </table>
  </section>

  <footer>Hablemos San — el documento de contacto visual de la mamá. ${capsulas.length} cápsulas, generadas del contenido real el ${fecha}.
  Cada cápsula cita la investigación que la respalda (autor, año y revista). Esto es práctica en casa, con juego: acompaña, nunca reemplaza,
  las terapias del niño. Nada de lo que anotes aquí sale de tu teléfono si tú no lo envías.</footer>
</main>
<div class="toast" role="status" aria-live="polite" hidden data-toast></div>

<script>
(function () {
  "use strict";
  var CLAVE = ${JSON.stringify(REGISTRO_CLAVE_STORAGE)};
  var VERSION = ${REGISTRO_VERSION};
  var ITEMS_A = ${JSON.stringify(ITEMS_A)};
  var ITEMS_B = ${JSON.stringify(ITEMS_B)};
  var NOMBRE_ITEM_A = ${JSON.stringify(NOMBRE_ITEM_A)};
  var NOMBRE_ITEM_B = ${JSON.stringify(NOMBRE_ITEM_B)};
  var NOMBRE_A = ${JSON.stringify(NOMBRE_RESPUESTA_A)};
  var NOMBRE_C = ${JSON.stringify(NOMBRE_RESPUESTA_C)};
  var TITULOS = {};
  document.querySelectorAll("[data-capsula-id]").forEach(function (el) { TITULOS[el.dataset.capsulaId] = el.dataset.titulo; });

  // ── storage, siempre en try/catch: el documento debe funcionar aunque el navegador no guarde ──
  function leer() {
    try { var v = localStorage.getItem(CLAVE); var j = v ? JSON.parse(v) : null; return (j && Array.isArray(j.entradas)) ? j.entradas : []; }
    catch (e) { return []; }
  }
  function escribir(entradas) {
    try { localStorage.setItem(CLAVE, JSON.stringify({ version: VERSION, entradas: entradas })); return true; }
    catch (e) { return false; }
  }
  var toastEl = document.querySelector("[data-toast]"), toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg; toastEl.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { toastEl.hidden = true; }, 2600);
  }
  function dos(n) { return (n < 10 ? "0" : "") + n; }
  function fechaLocal(d) { return d.getFullYear() + "-" + dos(d.getMonth() + 1) + "-" + dos(d.getDate()); }
  function horaLocal(d) { return dos(d.getHours()) + ":" + dos(d.getMinutes()); }
  function idNuevo() {
    try { if (window.crypto && crypto.randomUUID) return crypto.randomUUID(); } catch (e) {}
    return "e" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
  }

  // ── abrir / cerrar el formulario de cada cápsula ──
  document.querySelectorAll("[data-abrir-registro]").forEach(function (b) {
    b.addEventListener("click", function () {
      var form = document.querySelector('[data-registro][data-capsula="' + b.dataset.abrirRegistro + '"]');
      form.hidden = !form.hidden; b.hidden = !form.hidden;
      if (!form.hidden) { var primero = form.querySelector("input"); if (primero) primero.focus(); }
    });
  });
  document.querySelectorAll("[data-registro]").forEach(function (form) {
    var id = form.dataset.capsula;
    var boton = document.querySelector('[data-abrir-registro="' + id + '"]');
    var error = form.querySelector(".registro-error");
    function cerrar() { form.reset(); form.hidden = true; boton.hidden = false; error.hidden = true; }
    form.querySelector("[data-cancelar]").addEventListener("click", cerrar);
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var a = {}, faltan = false;
      ITEMS_A.forEach(function (item) {
        var r = form.querySelector('input[name="a-' + item + "-" + id + '"]:checked');
        if (!r) faltan = true; else a[item] = r.value;
      });
      var c = form.querySelector('input[name="c-' + id + '"]:checked');
      if (!c) faltan = true;
      if (faltan) { error.hidden = false; return; }
      var b = {};
      ITEMS_B.forEach(function (item) { b[item] = !!form.querySelector('input[name="b-' + item + "-" + id + '"]').checked; });
      b.ejemplo = (form.querySelector('input[name="ejemplo-' + id + '"]').value || "").trim().slice(0, 200);
      var ahora = new Date();
      var entrada = { id: idNuevo(), fecha: fechaLocal(ahora), hora: horaLocal(ahora), capsulaId: id, a: a, b: b,
        c: { comoEstuvo: c.value, paramos: !!form.querySelector('input[name="paramos-' + id + '"]').checked } };
      var entradas = leer(); entradas.push(entrada);
      if (escribir(entradas)) { toast("Guardado en este teléfono"); } else { toast("Este navegador no deja guardar. Anótalo en la hoja de la semana."); }
      cerrar(); pintarPanel();
    });
  });

  // ── el panel «Mis registros» ──
  var lista = document.querySelector("[data-entradas]"), vacio = document.querySelector("[data-vacio]");
  var borrarTodo = document.querySelector("[data-borrar-todo]");
  var DIAS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
  var MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  function cuando(e) {
    var p = e.fecha.split("-"); var d = new Date(+p[0], +p[1] - 1, +p[2]);
    return DIAS[d.getDay()] + " " + (+p[2]) + " " + MESES[d.getMonth()] + " · " + e.hora;
  }
  function frasesA(e) {
    return ITEMS_A.map(function (item) { return NOMBRE_ITEM_A[item].toLowerCase() + ": " + NOMBRE_A[e.a[item]].toLowerCase(); }).join(" · ");
  }
  function frasesB(e) {
    var vistas = ITEMS_B.filter(function (item) { return e.b[item]; }).map(function (item) { return NOMBRE_ITEM_B[item].toLowerCase(); });
    return vistas.length ? vistas.join(" · ") : "nada de lo de la lista, y está bien";
  }
  function fraseC(e) { return NOMBRE_C[e.c.comoEstuvo].toLowerCase() + (e.c.paramos ? " — paramos" : ""); }
  function pintarPanel() {
    var entradas = leer().slice().sort(function (x, y) { return (y.fecha + y.hora).localeCompare(x.fecha + x.hora); });
    lista.innerHTML = "";
    vacio.hidden = entradas.length > 0; borrarTodo.hidden = entradas.length === 0;
    entradas.forEach(function (e) {
      var li = document.createElement("li");
      var h = document.createElement("p"); h.className = "cuando"; h.textContent = cuando(e) + " · " + (TITULOS[e.capsulaId] || e.capsulaId);
      var p1 = document.createElement("p"); p1.textContent = "Yo: " + frasesA(e) + ".";
      var p2 = document.createElement("p"); p2.textContent = "Vi: " + frasesB(e) + (e.b.ejemplo ? ". «" + e.b.ejemplo + "»" : ".");
      var p3 = document.createElement("p"); p3.textContent = "Él: " + fraseC(e) + ".";
      var q = document.createElement("button"); q.type = "button"; q.className = "quitar"; q.textContent = "Quitar este registro";
      q.addEventListener("click", function () {
        if (q.dataset.seguro !== "1") { q.dataset.seguro = "1"; q.textContent = "¿Seguro? Toca otra vez"; setTimeout(function () { q.dataset.seguro = ""; q.textContent = "Quitar este registro"; }, 3000); return; }
        escribir(leer().filter(function (x) { return x.id !== e.id; })); pintarPanel(); toast("Registro quitado");
      });
      li.appendChild(h); li.appendChild(p1); li.appendChild(p2); li.appendChild(p3); li.appendChild(q);
      lista.appendChild(li);
    });
  }
  pintarPanel();

  // ── «Enviar a papá»: ejemplos, no números. Web Share; si no hay, al portapapeles ──
  function textoResumen() {
    var todas = leer().slice().sort(function (x, y) { return (x.fecha + x.hora).localeCompare(y.fecha + y.hora); });
    if (!todas.length) return "";
    var hace7 = new Date(); hace7.setDate(hace7.getDate() - 7);
    var corte = fechaLocal(hace7);
    var recientes = todas.filter(function (e) { return e.fecha >= corte; });
    if (!recientes.length) recientes = todas.slice(-7);
    var lineas = ["Mirarse jugando — lo que hicimos esta semana", ""];
    recientes.forEach(function (e) {
      lineas.push("• " + cuando(e) + " — " + (TITULOS[e.capsulaId] || e.capsulaId));
      lineas.push("  Yo: " + frasesA(e) + ".");
      lineas.push("  Vi: " + frasesB(e) + (e.b.ejemplo ? ". «" + e.b.ejemplo + "»" : "."));
      lineas.push("  Él: " + fraseC(e) + ".");
      lineas.push("");
    });
    lineas.push("(Anotado en el documento de la mamá. Sin números a propósito: son ejemplos.)");
    return lineas.join("\\n");
  }
  document.querySelector("[data-enviar]").addEventListener("click", function () {
    var texto = textoResumen();
    if (!texto) { toast("Todavía no hay nada que enviar"); return; }
    if (navigator.share) {
      navigator.share({ title: "Mirarse jugando — esta semana", text: texto }).catch(function () {});
      return;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texto).then(function () { toast("Copiado: pégalo en WhatsApp"); }, function () { toast("No se pudo copiar"); });
    } else { toast("Este navegador no deja compartir ni copiar"); }
  });

  // ── «Guardar registro»: el JSON versionado que el papá lee en noviembre ──
  document.querySelector("[data-guardar]").addEventListener("click", function () {
    var entradas = leer();
    if (!entradas.length) { toast("Todavía no hay nada que guardar"); return; }
    var archivo = JSON.stringify({ version: VERSION, generado: new Date().toISOString(), entradas: entradas }, null, 2);
    var blob = new Blob([archivo], { type: "application/json" });
    var a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = "registro-mirada-" + fechaLocal(new Date()) + ".json";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    toast("Archivo guardado en el teléfono");
  });

  // ── borrar todo, con segundo toque ──
  var bBorrar = document.querySelector("[data-borrar]");
  bBorrar.addEventListener("click", function () {
    if (bBorrar.dataset.seguro !== "1") { bBorrar.dataset.seguro = "1"; bBorrar.textContent = "¿Seguro? Toca otra vez para borrar todo"; setTimeout(function () { bBorrar.dataset.seguro = ""; bBorrar.textContent = "Borrar todos mis registros"; }, 4000); return; }
    escribir([]); bBorrar.dataset.seguro = ""; bBorrar.textContent = "Borrar todos mis registros"; pintarPanel(); toast("Registros borrados");
  });

  // ── modo revisión (?revision): casillas «Revisada» para el papá, guardadas aparte ──
  if (/[?&]revision/.test(location.search)) {
    document.body.classList.add("revision");
    var CLAVE_REV = "catalogo-mirada-revision:"; var cajas = document.querySelectorAll("[data-revision]"); var contador = document.getElementById("revisadas");
    function pintarRev() { var n = 0; cajas.forEach(function (c) { if (c.checked) n++; c.closest(".capsula").classList.toggle("lista", c.checked); }); contador.textContent = n; }
    cajas.forEach(function (c) {
      try { c.checked = localStorage.getItem(CLAVE_REV + c.dataset.revision) === "1"; } catch (e) {}
      c.addEventListener("change", function () { try { if (c.checked) localStorage.setItem(CLAVE_REV + c.dataset.revision, "1"); else localStorage.removeItem(CLAVE_REV + c.dataset.revision); } catch (e) {} pintarRev(); });
    });
    pintarRev();
  }
})();
</script>
</body>
</html>
`;

writeFileSync(new URL("../docs/CATALOGO-CONTACTO-VISUAL.html", import.meta.url), html);
console.log(`docs/CATALOGO-CONTACTO-VISUAL.html generado — ${capsulas.length} cápsulas${BIBLIOTECA_COMPLETA ? "" : " (VERSIÓN DE PRUEBA)"}.`);
