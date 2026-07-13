import Link from "next/link";
import { HoyCliente } from "@/components/hoy/hoy-cliente";
import { IconoAjustes } from "@/components/iconos";

// Patrón lcp-nace-estatico: el bloque grande de la mitad superior (el saludo) se renderiza
// ESTÁTICO en el servidor — sin envolturas que arranquen en opacity 0. La cápsula, que depende
// del almacenamiento local, llega tras hidratar dentro de un espacio ya reservado.

export default function HoyPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-8 sm:py-12">
      <header>
        {/* Ajustes vive ARRIBA, visible sin bajar la página. Hallazgo del gate (2026-07-12): era
            un texto gris al pie, debajo de la tarjeta de juegos — el usuario no lo encontró en dos
            sprints seguidos, y ahí adentro está la etapa del habla. Dos veces no es casualidad. */}
        <div className="flex items-start justify-between gap-4">
          <p className="text-tinta-suave font-mono text-[11px] tracking-[0.08em] uppercase">
            Hablemos San
          </p>
          <Link
            href="/ajustes"
            className="text-tinta-suave border-borde -mt-1 flex min-h-11 items-center gap-2 rounded-xl border px-3 text-sm"
            data-testid="ir-a-ajustes"
          >
            <IconoAjustes className="h-4 w-4 shrink-0" />
            Ajustes
          </Link>
        </div>
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

      {/* El pie sigue enlazando, pero ya no es la ÚNICA puerta: el que baja hasta aquí también la
          encuentra, y el que no baja la tiene arriba. */}
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
