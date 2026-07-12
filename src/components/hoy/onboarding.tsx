"use client";

// Onboarding local mínimo: apodo (opcional) + hasta 3 temas que le gusten.
// TODO se queda en este dispositivo. Sin cuentas, sin correo, sin nube.
// Solo aparece la primera vez; después, apodo y temas se cambian desde Ajustes.

import { guardarPerfilEnStore } from "@/components/estado-local";
import { PerfilForm } from "@/components/perfil-form";

export function Onboarding() {
  return (
    <section
      className="bg-superficie shadow-tarjeta rounded-2xl p-6"
      data-testid="onboarding"
    >
      <h2 className="text-xl font-medium">Antes de empezar, dos cositas</h2>

      <p className="text-tinta-suave mt-3 text-sm">
        Todo lo que escribas aquí se queda <strong>en este dispositivo</strong>:
        no hay cuentas ni servidores. Y la voz de su hijo nunca se graba ni sale
        de aquí — solo se analiza en el momento para saber si hay voz y cuánto
        dura.
      </p>

      <PerfilForm
        inicial={null}
        textoGuardar="Empezar"
        testIdGuardar="terminar-onboarding"
        onGuardar={guardarPerfilEnStore}
      />
    </section>
  );
}
