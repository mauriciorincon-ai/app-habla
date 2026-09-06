// Lo que comparten los generadores de catálogos (S4: el del padre; S5: el de la mamá).
// Pequeño a propósito: escapar HTML, la fecha del build y la paleta del design-system.md
// (cream / sage / ink — capa semántica, light y dark) como CSS listo para incrustar.

export const esc = (s) =>
  String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

export const fechaHoy = () => new Date().toISOString().slice(0, 10);

/** Tokens semánticos del design system, light por defecto y dark por preferencia del sistema. */
export const PALETA_CSS = `
  :root {
    --fondo:#FBF8F2; --superficie:#F5F0E5; --borde:#ECE4D2; --tinta:#1F2420; --suave:#5A615C;
    --acento:#2E4628; --acento-hover:#3F5F37; --acento-suave:#DCE6D8; --exito:#527947;
    --aviso:#C99432; --aviso-suave:#F8E9C8; --peligro:#B14B3D; --info:#4A6E84; --celebracion:#DD7B5E;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --fondo:#14171A; --superficie:#1B1F22; --borde:#232830; --tinta:#F2EFE8; --suave:#969994;
      --acento:#B5D5AB; --acento-hover:#94BB89; --acento-suave:#233022; --exito:#A8C9A0;
      --aviso:#ECC56F; --aviso-suave:#3A2F14; --peligro:#E08A7C; --info:#8FB3C7; --celebracion:#DD7B5E;
    }
  }
`;
