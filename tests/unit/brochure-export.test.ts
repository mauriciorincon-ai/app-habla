// El CONTRATO del export de la vitrina (docs/brochure-export.json, schema v1.0.0).
//
// Por qué existe: el export es una ficha que se publica FUERA del repo, y sus dos garantías
// —el conteo cuadrado y la procedencia de cada cifra— no las vigila nadie más. Este test es
// el guardián de esas garantías: si un sprint agrega una feature al brochure y olvida el
// export (o al revés), o cuela una cifra sin fuente, o publica un enlace de acceso, aquí
// falla y el PR no entra.
//
// Demostrado en rojo antes de dar por bueno el archivo (ver el summary de la entrega).

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const RAIZ = join(__dirname, "..", "..");
const CRUDO = readFileSync(join(RAIZ, "docs", "brochure-export.json"), "utf8");
const EXPORTADO = JSON.parse(CRUDO) as Export;

type Feature = {
  id: string;
  nombre: string;
  que_hace: string;
  seccion_manual: string;
};
type Grupo = {
  orden: number;
  estrella: boolean;
  nombre: string;
  linea: string;
  features: Feature[];
};
type Metrica = {
  clave: string;
  etiqueta: string;
  valor: number;
  unidad: string;
  fuente: string;
  detalle: string;
};
type Export = {
  _schema: Record<string, string>;
  schema_version: string;
  app: { estado: string; sellado_en: string | null; slug: string };
  funcionalidades: {
    total: number;
    fuente_del_conteo: string;
    descartadas: unknown[];
    grupos: Grupo[];
  };
  metricas: Metrica[];
  enlaces: {
    produccion: string | null;
    repositorio: string | null;
    razon: string;
  };
};

const FUENTES_VALIDAS = ["medido", "calculada", "declarado", "estimacion"];

describe("contrato brochure-export.json (v1.0.0)", () => {
  it("trae el bloque _schema, para que el formato viaje con el archivo", () => {
    expect(EXPORTADO._schema).toBeTruthy();
    expect(EXPORTADO._schema._lee_esto_primero).toContain("formato");
    expect(EXPORTADO.schema_version).toBe("1.0.0");
  });

  it("el total cuadra con las features de los grupos (nada suelto, nada contado dos veces)", () => {
    const features = EXPORTADO.funcionalidades.grupos.flatMap(
      (g) => g.features,
    );
    expect(features).toHaveLength(EXPORTADO.funcionalidades.total);

    const ids = features.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("el total es EL MISMO número que el brochure declara en su pie", () => {
    const brochure = readFileSync(join(RAIZ, "docs", "BROCHURE.html"), "utf8");
    const pie = brochure.match(/data-contador>(\d+)</);
    expect(pie, "el pie del brochure debe declarar su conteo").not.toBeNull();
    expect(Number(pie![1])).toBe(EXPORTADO.funcionalidades.total);
  });

  it("el conteo declara contra qué documento se cuadró", () => {
    expect(EXPORTADO.funcionalidades.fuente_del_conteo).toBe(
      "docs/MANUAL-DE-USO.md",
    );
  });

  it("cada feature está completa (nombre, qué hace y su sección del manual)", () => {
    for (const grupo of EXPORTADO.funcionalidades.grupos) {
      for (const f of grupo.features) {
        expect(f.nombre.length, `feature ${f.id} sin nombre`).toBeGreaterThan(
          0,
        );
        expect(
          f.que_hace.length,
          `feature ${f.id} sin qué hace`,
        ).toBeGreaterThan(20);
        expect(
          f.seccion_manual.length,
          `feature ${f.id} sin sección`,
        ).toBeGreaterThan(0);
      }
    }
  });

  it("TODA métrica lleva su fuente válida y su detalle — una cifra sin fuente no entra", () => {
    expect(EXPORTADO.metricas.length).toBeGreaterThan(0);
    for (const m of EXPORTADO.metricas) {
      expect(FUENTES_VALIDAS, `métrica ${m.clave}: fuente inválida`).toContain(
        m.fuente,
      );
      expect(
        m.detalle.length,
        `métrica ${m.clave} sin detalle`,
      ).toBeGreaterThan(20);
      expect(typeof m.valor, `métrica ${m.clave}: valor no numérico`).toBe(
        "number",
      );
    }
  });

  it("CERO ENLACES: ni producción ni repositorio viajan en el export", () => {
    expect(EXPORTADO.enlaces.produccion).toBeNull();
    expect(EXPORTADO.enlaces.repositorio).toBeNull();
    expect(EXPORTADO.enlaces.razon.length).toBeGreaterThan(10);
  });

  it("CERO ENLACES: el archivo entero no contiene ninguna dirección de acceso", () => {
    expect(CRUDO).not.toMatch(
      /vercel\.app|workers\.dev|hablemos-san|https?:\/\//,
    );
  });

  it("si está sellado, la fecha del sello existe", () => {
    if (EXPORTADO.app.estado === "sellado") {
      expect(EXPORTADO.app.sellado_en).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    } else {
      expect(EXPORTADO.app.estado).toBe("inicial");
      expect(EXPORTADO.app.sellado_en).toBeNull();
    }
  });

  it("la privacidad del export dice la verdad de esta app: local, sin red y sin IA", () => {
    const p = (EXPORTADO as unknown as { privacidad: Record<string, unknown> })
      .privacidad;
    expect(p.local_only).toBe(true);
    expect(p.red_saliente).toBe(false);
    expect(p.usa_ia).toBe(false);
  });
});
