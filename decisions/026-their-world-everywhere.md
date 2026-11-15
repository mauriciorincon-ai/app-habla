# ADR 026 — Their world everywhere: one selector dresses every game and aims every helper at the weekly goal

- **Status:** accepted (2026-11-16, Sprint 014). The owner's G-Plan answers «1a 2a» apply as written: (1) the
  monthly-stories reminder is an **adult card in Today** with a button to order the batch, with no
  notification and no permission, and never shown to the child as an alarm; (2) their interests are declared
  in **one place**, the profile (themes plus «other things they love»). The Stories «Enjoys» value migrates
  there without loss, and Stories reads it from the profile.
- **Bound by:**
  - Hard rule 2-bis: what the family writes about itself stays on the device. Interests and the goal travel
    nowhere new.
  - Hard rule 3: the scene is dressed, never scored. A goal with no content behind it is said plainly.
  - Hard rule 5: the words to model are for the adult, in their turn.
  - Hard rule 7: single words first.
  - Hard rule 8: examples use invented profiles.
  - Rule 23: the date is a knob.

## Context

The family already tells the app two things:

- **What the child loves:** 1–3 of six themes at onboarding.
- **What therapy is working on:** the weekly goal.

Before this sprint those two only reached a few places:

- The themes filtered the word↔picture deck.
- The goal ordered today's capsule, the deck, the twin pairs and the study batch.

Everything else ignored them:

- The five voice games (balloon, blowing, loud-soft, rocket, vowels) looked the same for every child.
- The guide card and the in-game prompter never named a word to practise.
- Twin pairs ignored the themes.
- The word↔picture deck read the goal once per mount, so changing the goal mid-session did nothing.

The content also had holes:

- **No colours.** «Colores», a very common therapy goal, was the app's example of an _honest no-match_.
- **«Actions» never reached a drawing or a pair.**
- **Only two bath capsules.**

There were also two sources of interests: the profile themes and «Enjoys» in Stories.

## Decision

1. **One pure selector.**
   - `suMundo({temas, objetivo, idioma, fecha}, juego)` lives in `src/lib/su-mundo/su-mundo.ts`.
   - It returns:
     - `protagonista`: one of their themes, or `null` with no profile;
     - `palabrasAModelar`: ≤ 4 words, in the screen language;
     - `paresPreferidos`: the twin-pair ids to prefer;
     - `etiquetaCercana`: the real tag closest to a goal that matched nothing, or `null`.
   - Every screen asks the selector; no screen decides on its own.
   - `useSuMundo(juego)` reads it **reactively** over the existing `usePerfil`/`useObjetivo` stores.
2. **The protagonist rotates by date and by game.**
   - The index is `(day + game offset) mod themes`, so it is deterministic, and two games on the same day
     do not always wear the same theme.
   - The date is read once per mount and is a test knob, never the clock.
   - The protagonist **dresses** the scene and never changes a mechanic, a threshold or what is measured:
     the balloon still rises with voice, the windmill with a blow.
3. **The words to model come from `alinear()`.**
   - It is the same engine as the rest of the app.
   - Singular and plural now count the same (`-s`, `-es`), so «verbos de acción» reaches `acciones` and
     «rojos» reaches «rojo».
   - Tag drawings come first, then theme drawings, at most four.
   - They appear only where the **adult** reads them: the guide card and the adult's turn on the prompter
     strip.
4. **Content grows by tag, not by theme.**
   - `colores` joins the controlled vocabulary with four capsules, and «color» is written the same in both
     languages.
   - **Six new bath capsules** bring bath to eight. Every new capsule is written in both languages, with its
     technique and source.
   - Drawings that belong to a **tag** rather than a theme (four colours, actions, bathing) live in their own
     list, `PICTOGRAMAS_DE_ETIQUETA`, so the six readers of a themed pictogram's `tema` stay untouched.
     They join the word↔picture deck only when the goal asks for them.
   - Action minimal pairs: come/tome and toca/boca in Spanish, run/sun and dig/pig in English, each written
     for its language and tagged `acciones`.
   - A pair's theme is derived from its drawings, never tagged by hand.
   - The honest no-match example is now «números».
5. **Their interests live in the profile.**
   - `Perfil.otrasCosas` holds up to 8 «other things they love», under the same schema as the stories
     contract's interests.
   - The migration (`moverIntereses`, pure and idempotent):
     - moves «Enjoys» into the profile without loss, keeping what was already there first;
     - leaves in Stories anything that does not fit;
     - does nothing without a profile.
   - It runs before the first read of the profile or the stories store.
   - The stories order and the printables read `interesesDe(perfil, idioma)`: their own things first, then
     their theme names. The stories' own fill-in slots read `interesesParaCuentos`: only their own things,
     never a theme name, because a name like «the sea» does not fit the story templates' grammar.
   - The profile has never been part of the other-home package, and `otra-casa.test` now proves that neither
     the themes nor «other things» travel.
6. **The reminder is a pure rule.**
   - `recordatorioCuentos(hoy, cuentos, pospuesto)` lives in `src/lib/bandeja/recordatorio.ts`.
   - It shows the card when no batch was ever imported, or when the last import is ≥ 30 days old (the
     order's own validity, `DIAS_DE_VIGENCIA`).
   - «Not now» stores today in `ajustes.recordatorioPospuesto` and hides the card until tomorrow.
   - There is no notification API and no permission [omitido].
7. **The drawings stay off the shared bundle.** The six protagonist drawings are inline SVG components
   loaded with a dynamic `import()` per theme, so only the active theme's drawing ships with a game. The
   script budget stays ≤ 354 KB, which Lighthouse checks in CI.

## Consequences

- **Every game shows something of the child's world.** The goal reaches the adult's line, the prompter, the
  monthly stories and the printables. Gemelas prefers the goal's pairs, then the child's themes.
- **The pyramid map no longer counts every capsule.** It was approved over the 74 capsules of S6, and the S14
  capsules live in Today, not in that document. `fichas.test` scopes the map to them.
- **One more preference to manage.** The postponed-reminder day is a settings field. It travels nowhere,
  like all settings.
- **Words to model can be wrong for a child, so they stay advice to the adult.** They are never a target the
  app checks. Judging the word is still the adult's job (ADR-009).
