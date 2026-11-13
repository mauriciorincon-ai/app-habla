"use client";

// EL CONTACTO VISUAL DE HOY (S9): una actividad por día, junto a la cápsula del habla. La línea del
// adulto va PRIMERO (regla 5: el guion precede a la actividad). Cero pantalla, cero cámara. La biblioteca
// se carga bajo demanda para no engordar el primer pintado de «Hoy».

import { useEffect, useState } from "react";
import type { CapsulaContactoVisual, NivelContactoVisual } from "@content/schema";
import { IconoBurbuja, IconoJuntos } from "@/components/iconos";
import { contactoVisualDeHoy } from "@/lib/coach/contacto-visual-hoy";
import { useT } from "@/lib/idioma/estado";
import { hoy } from "@/lib/idioma/textos/hoy";

export function ContactoVisualHoy({ fecha, nivel }: { fecha: string; nivel: NivelContactoVisual }) {
  const tx = useT();
  const [biblioteca, setBiblioteca] = useState<readonly CapsulaContactoVisual[] | null>(null);

  useEffect(() => {
    let vivo = true;
    import("@content/contacto-visual").then((m) => {
      if (vivo) setBiblioteca(m.CAPSULAS_CONTACTO_VISUAL);
    });
    return () => {
      vivo = false;
    };
  }, []);

  if (!biblioteca) return null;
  const c = contactoVisualDeHoy(fecha, nivel, biblioteca);
  if (!c) return null;
  const t = hoy.contactoVisual;

  return (
    <article
      className="bg-superficie shadow-tarjeta rounded-2xl p-6"
      data-testid="contacto-visual-hoy"
      data-contacto-visual-id={c.id}
      aria-labelledby="contacto-visual-hoy-titulo"
    >
      <p className="text-tinta-suave font-mono text-[11px] tracking-[0.08em] uppercase">
        {tx(t.etiqueta)} · {tx(t.sinPantalla)}
      </p>
      <h2 id="contacto-visual-hoy-titulo" className="mt-3 text-xl font-medium">
        {tx(c.titulo)}
      </h2>

      <div className="border-acento bg-acento-suave/40 mt-5 flex gap-3 rounded-xl border-l-4 p-4">
        <IconoBurbuja className="text-acento mt-0.5 h-8 w-8 shrink-0" />
        <div>
          <p className="text-tinta-suave font-mono text-[11px] tracking-[0.08em] uppercase">{tx(t.tuLinea)}</p>
          <p className="font-display mt-2 text-xl italic" data-testid="contacto-visual-guion">
            {tx(c.guion)}
          </p>
        </div>
      </div>

      <div className="border-acento bg-acento-suave/40 mt-4 flex gap-3 rounded-xl border-l-4 p-4">
        <IconoJuntos className="text-acento mt-0.5 h-8 w-8 shrink-0" />
        <div>
          <p className="text-tinta-suave font-mono text-[11px] tracking-[0.08em] uppercase">
            {tx(t.laActividad)} · {tx(t.duracion)} {c.actividad.duracion} · {tx(t.conQuien[c.conQuien])}
          </p>
          <p className="mt-2 text-lg leading-relaxed" data-testid="contacto-visual-actividad">
            {tx(c.actividad.texto)}
          </p>
        </div>
      </div>

      <p className="text-tinta-suave mt-4 text-sm">
        <strong>{tx(t.queNoHacer)}:</strong> {tx(c.queNoHacer)}
      </p>

      <p className="mt-4 text-sm">
        <a href="/mirada" className="text-acento inline-flex min-h-11 items-center underline underline-offset-4">
          {tx(t.verMas)}
        </a>
      </p>
    </article>
  );
}
