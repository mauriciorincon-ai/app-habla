import type { Metadata } from "next";
import { CuentosNino } from "@/components/cuentos/cuentos-nino";
import { TituloDePagina } from "@/components/idioma/tx";
import { cuentos } from "@/lib/idioma/textos/cuentos";

export const metadata: Metadata = {
  title: "Cuentos · Hablemos San",
};

// «Cuentos de casa», lado del niño (S9, ADR-019): la biblioteca y solo lo que el adulto aprobó.
export default function CuentosPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8">
      <TituloDePagina t={cuentos.nino.tituloPestana} />
      <CuentosNino />
    </main>
  );
}
