import { z } from "zod";
import { TEMAS, type Tema } from "@/lib/storage/temas";

/**
 * SORPRESAS POR TEMA (S15). Una escena pequeña por tema que aparece CON los turnos del niño (cuando su
 * voz suena, no cuando «acierta»), y se va sola. Cambia cada día (la elige `sorpresaDelDia` con la fecha).
 *
 * Reglas del texto: es y en REDACTADOS (no traducidos), sin «no», sin felicitar, sin puntajes, sin nombrar
 * al niño. Describen algo que pasa en el mundo del juego; no premian nada, no se acumulan, no hay
 * monedas, fichas ni colección.
 */
const FraseSchema = z.object({ es: z.string().min(1), en: z.string().min(1) });

export const SorpresasSchema = z.record(z.enum(TEMAS), z.array(FraseSchema).min(3));

export const SORPRESAS: Record<Tema, { es: string; en: string }[]> =
  SorpresasSchema.parse({
    animales: [
      { es: "Un animalito se asoma a saludar.", en: "A little animal peeks out to say hi." },
      { es: "Alguien movió la cola por aquí cerca.", en: "Someone wagged a tail right around here." },
      { es: "Se oyen pasitos de animal muy cerca.", en: "Tiny animal footsteps are close by." },
    ],
    carros: [
      { es: "Pasó un carrito tocando la bocina: ¡piii!", en: "A little car drove by and honked: beep!" },
      { es: "Un tren lejano hace chucu-chucu.", en: "A faraway train goes choo-choo." },
      { es: "Una moto cruza la esquina despacito.", en: "A motorbike slowly crosses the corner." },
    ],
    espacio: [
      { es: "Una estrella parpadeó allá arriba.", en: "A star twinkled way up there." },
      { es: "La luna se asoma por un rincón.", en: "The moon peeks in from a corner." },
      { es: "Un cohete pequeñito pasó volando.", en: "A tiny rocket zoomed by." },
    ],
    dinosaurios: [
      { es: "Un dino asoma la cabeza entre las hojas.", en: "A dino pokes its head out of the leaves." },
      { es: "Se oyen pisadas grandotas: pum, pum.", en: "Big footsteps in the distance: thump, thump." },
      { es: "Un huevo grande se mece un poquito.", en: "A big egg rocks just a little." },
    ],
    musica: [
      { es: "Suena una campanita muy bajito.", en: "A little bell rings very softly." },
      { es: "Un tambor hace tum, tum a lo lejos.", en: "A drum goes boom, boom far away." },
      { es: "Una notita baila por el aire.", en: "A little note dances through the air." },
    ],
    mar: [
      { es: "Una burbuja sube desde el fondo.", en: "A bubble floats up from the bottom." },
      { es: "Un pececito pasa nadando.", en: "A little fish swims by." },
      { es: "Una ola llega y se va despacito.", en: "A wave comes in and slowly goes out." },
    ],
  });
