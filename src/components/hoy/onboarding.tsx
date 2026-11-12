"use client";

// Onboarding local mínimo: apodo (opcional) + hasta 3 temas que le gusten.
// TODO se queda en este dispositivo. Sin cuentas, sin correo, sin nube.
// Solo aparece la primera vez; después, apodo y temas se cambian desde Ajustes.

import { guardarPerfilEnStore } from "@/components/estado-local";
import { PerfilForm } from "@/components/perfil-form";
import { useT } from "@/lib/idioma/estado";
import { primerUso } from "@/lib/idioma/textos/primer-uso";

export function Onboarding() {
  const tx = useT();
  return (
    <section
      className="bg-superficie shadow-tarjeta rounded-2xl p-6"
      data-testid="onboarding"
    >
      <h2 className="text-xl font-medium">{tx(primerUso.titulo)}</h2>

      <p className="text-tinta-suave mt-3 text-sm">
        {tx(primerUso.privacidad.antes)}{" "}
        <strong>{tx(primerUso.privacidad.enfasis)}</strong>
        {tx(primerUso.privacidad.despues)}
      </p>

      <PerfilForm
        inicial={null}
        textoGuardar={tx(primerUso.empezar)}
        testIdGuardar="terminar-onboarding"
        onGuardar={guardarPerfilEnStore}
      />
    </section>
  );
}
