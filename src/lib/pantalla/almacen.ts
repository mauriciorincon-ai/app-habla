// The daily cap's counter on disk (S12, ADR-024): a date and a number of milliseconds, nothing else.
// Kept apart from storage/local.ts on purpose: the Today page loads local.ts, and only the games need this
// (the performance budget counts every byte of the home page).

import { CLAVES, guardar, leer } from "@/lib/storage/local";
import { PANTALLA_VACIA, PantallaSchema, type EstadoPantalla } from "./tope";

export const leerPantalla = (): EstadoPantalla =>
  leer(CLAVES.pantalla, PantallaSchema) ?? PANTALLA_VACIA;
export const guardarPantalla = (estado: EstadoPantalla): void =>
  guardar(CLAVES.pantalla, PantallaSchema, estado);
