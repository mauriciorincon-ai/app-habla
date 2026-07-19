import Link from "next/link";
import { RumboCliente } from "@/components/rumbo/rumbo-cliente";
import { IconoBrujula } from "@/components/iconos";

// Patrón lcp-nace-estatico: el encabezado se renderiza ESTÁTICO en el servidor; el contenido, que
// depende del almacenamiento local, llega tras hidratar dentro de un espacio ya reservado.

export default function RumboPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-8 sm:py-12">
      <header>
        <Link
          href="/"
          className="text-tinta-suave border-borde inline-flex min-h-11 items-center gap-2 rounded-xl border px-3 text-sm"
          data-testid="volver-a-hoy"
        >
          ← Hoy
        </Link>
        <h1 className="font-display mt-4 flex items-center gap-3 text-4xl sm:text-5xl">
          <IconoBrujula className="text-acento h-9 w-9 shrink-0" />
          El rumbo
        </h1>
        <p className="text-tinta-suave mt-3 max-w-prose">
          Cómo van, contado con lo que de verdad pasó: los días que jugaron, las
          palabras que practicaron, lo que su voz hizo. Sin notas, sin puntajes,
          sin comparar con nadie. Volver es lo que cuenta — no la racha.
        </p>
      </header>

      <RumboCliente />
    </main>
  );
}
