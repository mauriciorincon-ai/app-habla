// RESOLVER DE AUDIO (Outcome 2) — PURO. Decide, para un ítem dado, si suena la VOZ FAMILIAR o el
// fallback (el comportamiento actual sin sonido). No toca IndexedDB ni reproduce nada: eso es del
// componente. Aquí solo la decisión, para poder testearla sin navegador.
//
// Regla: se usa la voz familiar cuando (1) el padre no la apagó en Ajustes Y (2) ese ítem tiene
// grabación. Si falta cualquiera, `ninguna` — y el fallback NUNCA es un error ni un silencio roto,
// es la app como sonaba antes (texto sin voz).

export type Fuente = "familiar" | "ninguna";

export function resolverFuente(opts: {
  /** ¿Existe grabación para este ítem en el banco? (lo sabe el almacén). */
  tieneGrabacion: boolean;
  /** El toggle "usar la voz de la familia" de Ajustes. */
  vozFamiliarActiva: boolean;
}): Fuente {
  return opts.vozFamiliarActiva && opts.tieneGrabacion ? "familiar" : "ninguna";
}
