import Link from "next/link";
import { HoyCliente } from "@/components/hoy/hoy-cliente";

// Patrón lcp-nace-estatico: el bloque grande de la mitad superior (el saludo) se renderiza
// ESTÁTICO en el servidor — sin envolturas que arranquen en opacity 0. La cápsula, que depende
// del almacenamiento local, llega tras hidratar dentro de un espacio ya reservado.

export default function HoyPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-8 sm:py-12">
      <header>
        <p className="text-tinta-suave font-mono text-[11px] tracking-[0.08em] uppercase">
          Hablemos San
        </p>
        <h1 className="font-display mt-2 text-4xl sm:text-5xl">
          ¿Y hoy qué puedo hacer por mi hijo?
        </h1>
        <p className="text-tinta-suave mt-3 max-w-prose">
          Esto es lo de hoy: una técnica con evidencia, explicada en 30
          segundos, con una línea que puedes decirle y una actividad concreta.
          Práctica en casa para acompañar —nunca reemplazar— la fonoaudiología
          de su hijo.
        </p>
      </header>

      <HoyCliente />

      <nav className="text-tinta-suave text-center text-sm">
        <Link
          href="/ajustes"
          className="min-h-11 underline-offset-4 hover:underline"
        >
          Ajustes y privacidad
        </Link>
      </nav>
    </main>
  );
}
