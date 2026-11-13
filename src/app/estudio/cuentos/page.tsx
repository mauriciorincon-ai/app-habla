import type { Metadata } from "next";
import { CuentosAdulto } from "@/components/cuentos/cuentos-adulto";
import { TituloDePagina } from "@/components/idioma/tx";
import { cuentos } from "@/lib/idioma/textos/cuentos";

export const metadata: Metadata = {
  title: "Cuentos de casa · Hablemos San",
};

// «Cuentos de casa», lado del adulto (S9, ADR-019): pedir, traer el lote, aprobar y poner la voz.
export default function CuentosAdultoPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8">
      <TituloDePagina t={cuentos.adulto.tituloPestana} />
      <CuentosAdulto />
    </main>
  );
}
