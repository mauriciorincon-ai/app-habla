import type { Metadata } from "next";
import { EstudioCliente } from "@/components/estudio/estudio-cliente";

export const metadata: Metadata = {
  title: "La voz de la familia · Hablemos San",
};

// El encabezado (chip de salida + titular + promesa de privacidad) vive DENTRO del cliente
// porque la salida depende de la vista (gate S4: en el banco "← Ajustes", en el lote "← Tu banco
// de voz" — atrás es SIEMPRE la pantalla anterior). El LCP sigue naciendo estático (patrón
// lcp-nace-estatico): el cliente se prerenderiza y el titular llega en el HTML del servidor.

export default function EstudioPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8">
      <EstudioCliente />
    </main>
  );
}
