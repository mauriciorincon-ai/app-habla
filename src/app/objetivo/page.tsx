import Link from "next/link";
import { ObjetivoCliente } from "@/components/objetivo/objetivo-cliente";
import { IconoDiana } from "@/components/iconos";

// Patrón lcp-nace-estatico: el encabezado se renderiza ESTÁTICO; el editor del objetivo llega tras
// hidratar (depende del almacenamiento local).

export default function ObjetivoPage() {
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
          <IconoDiana className="text-acento h-9 w-9 shrink-0" />
          Objetivo de la semana
        </h1>
        <p className="text-tinta-suave mt-3 max-w-prose">
          ¿Qué te pidió trabajar la fonoaudióloga de tu hijo esta semana?
          Escríbelo aquí y la app pone eso primero: en la cápsula de hoy, en los
          dibujos del juego y en lo que te toca grabar. Es opcional — sin
          objetivo, todo sigue igual que siempre.
        </p>
      </header>

      <ObjetivoCliente />
    </main>
  );
}
