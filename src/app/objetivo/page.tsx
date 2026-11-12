import Link from "next/link";
import { ObjetivoCliente } from "@/components/objetivo/objetivo-cliente";
import { IconoDiana } from "@/components/iconos";
import { Tx, TituloDePagina } from "@/components/idioma/tx";
import { comunes } from "@/lib/idioma/textos/comunes";
import { objetivo } from "@/lib/idioma/textos/objetivo";

// Patrón lcp-nace-estatico: el encabezado se renderiza ESTÁTICO; el editor del objetivo llega tras
// hidratar (depende del almacenamiento local).

export default function ObjetivoPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-8 sm:py-12">
      <header>
        <TituloDePagina t={objetivo.tituloPestana} />
        <Link
          href="/"
          className="text-tinta-suave border-borde inline-flex min-h-11 items-center gap-2 rounded-xl border px-3 text-sm"
          data-testid="volver-a-hoy"
        >
          <Tx t={comunes.volverAHoy} />
        </Link>
        <h1 className="font-display mt-4 flex items-center gap-3 text-4xl sm:text-5xl">
          <IconoDiana className="text-acento h-9 w-9 shrink-0" />
          <Tx t={objetivo.titulo} />
        </h1>
        <p className="text-tinta-suave mt-3 max-w-prose">
          <Tx t={objetivo.intro} />
        </p>
      </header>

      <ObjetivoCliente />
    </main>
  );
}
