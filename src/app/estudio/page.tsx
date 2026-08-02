import type { Metadata } from "next";
import Link from "next/link";
import { EstudioCliente } from "@/components/estudio/estudio-cliente";

export const metadata: Metadata = {
  title: "La voz de la familia · Hablemos San",
};

// LCP estático (patrón lcp-nace-estatico): el titular y el aviso de privacidad nacen en el HTML
// del servidor; el grabador (MediaRecorder) y el banco (IndexedDB) viven en el cliente.

export default function EstudioPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8">
      <header>
        {/* La salida estándar, ARRIBA (regla del usuario, gate S4): el estudio se abre desde
            Ajustes, así que su chip vuelve allá. */}
        <Link
          href="/ajustes"
          prefetch={false}
          className="text-tinta-suave border-borde inline-flex min-h-11 items-center gap-2 rounded-xl border px-3 text-sm"
          data-testid="volver-a-ajustes"
        >
          ← Ajustes
        </Link>
        <h1 className="font-display mt-4 text-4xl">La voz de la familia</h1>
        <p className="text-tinta-suave mt-3 max-w-prose">
          Graba tu voz —la de mamá o papá— para que los juegos suenen con la voz
          que tu hijo conoce. <strong>La voz de tu hijo nunca se graba.</strong>{" "}
          Todo lo que grabes vive <strong>solo en este dispositivo</strong>: no
          se sube a internet ni sale de aquí.
        </p>
      </header>

      <EstudioCliente />
    </main>
  );
}
