// Lo que comparten los documentos impresos en dos idiomas (S8): «La pirámide, en casa» (/mirada) y el
// catálogo de cápsulas. Mismo patrón que el brochure (/conoce, S7): cada texto es una pareja de
// hermanos `data-l="es"` / `data-l="en"`, un conmutador de dos botones y un guion previo a la pintura
// que fija `lang` con la elección guardada (habla:v1:ajustes → idioma) o la del navegador.
// Autocontenido: cero CDNs, cero peticiones.

import { esc } from "./catalogo-comun.mjs";

/** Una pareja de textos en línea. */
export const par = (es, en) => `<span data-l="es">${esc(es)}</span><span data-l="en">${esc(en)}</span>`;

/** Lo mismo, pero con HTML ya armado (negritas, etc.) que el llamador escapó. */
export const parHtml = (es, en) => `<span data-l="es">${es}</span><span data-l="en">${en}</span>`;

/** Un bloque completo (p, li, h3…) repetido en los dos idiomas: la misma etiqueta y atributos. */
export const bloque = (tag, atributos, es, en) =>
  `<${tag} data-l="es"${atributos ? " " + atributos : ""}>${es}</${tag}><${tag} data-l="en"${atributos ? " " + atributos : ""}>${en}</${tag}>`;

export const IDIOMA_HEAD = `<script>
/* Idioma: la elección guardada (habla:v1:ajustes → idioma) y, sin ella, la primera preferencia del
   navegador que sea es o en. Se fija antes de pintar. */
(function () {
  var l = null;
  try {
    var j = JSON.parse(localStorage.getItem("habla:v1:ajustes"));
    if (j && (j.idioma === "en" || j.idioma === "es")) { l = j.idioma; }
  } catch (e) {}
  if (!l) {
    try {
      var ls = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language];
      for (var i = 0; i < ls.length; i++) {
        var p = String(ls[i] || "").toLowerCase().slice(0, 2);
        if (p === "en" || p === "es") { l = p; break; }
      }
    } catch (e) {}
  }
  document.documentElement.lang = l === "en" ? "en" : "es-CO";
})();
</script>`;

export const IDIOMA_CSS = `
  /* ── Dos idiomas: cada texto es una pareja de hermanos data-l="es" / "en". ── */
  html[lang="en"] [data-l="es"] { display: none !important; }
  html:not([lang="en"]) [data-l="en"] { display: none !important; }
  .idioma { position: static; width: fit-content; margin: 0 0 12px auto; display: flex; gap: 4px; padding: 4px;
    background: var(--superficie); border: 1px solid var(--borde); border-radius: 999px; }
  .idioma button { font: inherit; font-size: .85rem; min-height: 44px; min-width: 44px; padding: 0 14px;
    border-radius: 999px; border: 1px solid transparent; background: transparent; color: var(--tinta, #1f2420); cursor: pointer; }
  .idioma button[aria-pressed="true"] { background: var(--acento); color: var(--fondo); font-weight: 600; }
  .idioma button[aria-pressed="true"]::before { content: "\\2713\\00a0"; }
  .idioma button:focus-visible { outline: 3px solid var(--info, #4a6e84); outline-offset: 2px; }
  @media print { .idioma { display: none !important; } }
`;

export const IDIOMA_CONMUTADOR = `<div class="idioma" role="group" aria-label="Idioma · Language">
  <button type="button" data-idioma="es" lang="es" aria-pressed="true">Español</button>
  <button type="button" data-idioma="en" lang="en" aria-pressed="false">English</button>
</div>`;

/** El conmutador: cambia `lang` al instante y guarda SOLO el campo idioma, fusionado con los ajustes locales. */
export const idiomaScript = (meta) => `<script>
(function () {
  "use strict";
  var raiz = document.documentElement;
  var META = ${JSON.stringify(meta)};
  function cada(sel, fn) { [].slice.call(document.querySelectorAll(sel)).forEach(fn); }
  function aplicar(l) {
    var en = l === "en";
    raiz.lang = en ? "en" : "es-CO";
    cada("[data-idioma]", function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-idioma") === (en ? "en" : "es") ? "true" : "false");
    });
    cada("[data-aria-en]", function (el) {
      if (!el.hasAttribute("data-aria-es")) { el.setAttribute("data-aria-es", el.getAttribute("aria-label") || ""); }
      el.setAttribute("aria-label", el.getAttribute(en ? "data-aria-en" : "data-aria-es"));
    });
    document.title = META[en ? "en" : "es"];
  }
  function guardar(l) {
    try {
      var j = null;
      try { j = JSON.parse(localStorage.getItem("habla:v1:ajustes")); } catch (e) {}
      if (!j || typeof j !== "object" || Array.isArray(j)) { j = {}; }
      j.idioma = l;
      localStorage.setItem("habla:v1:ajustes", JSON.stringify(j));
    } catch (e) {}
  }
  cada("[data-idioma]", function (b) {
    b.addEventListener("click", function () {
      var l = b.getAttribute("data-idioma");
      aplicar(l);
      guardar(l);
    });
  });
  aplicar(raiz.lang === "en" ? "en" : "es");
})();
</script>`;
