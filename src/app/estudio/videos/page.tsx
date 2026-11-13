import type { Metadata } from "next";
import { VideotecaCliente } from "@/components/estudio/videoteca-cliente";
import { TituloDePagina } from "@/components/idioma/tx";
import { videoteca } from "@/lib/idioma/textos/videoteca";

export const metadata: Metadata = {
  title: "Videos de la familia · Hablemos San",
};

// La videoteca de la familia (S8): clips elegidos de la galería, solo en este dispositivo. La app no
// abre la cámara (regla dura 2). El encabezado vive en el cliente para que el titular nazca estático.
export default function VideosPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8">
      <TituloDePagina t={videoteca.tituloPestana} />
      <VideotecaCliente />
    </main>
  );
}
