# FrissonWorks Design Lab

A sandbox for interactively prototyping shared FrissonWorks components. Next.js (App Router), TypeScript, Tailwind v4, Framer Motion. **No backend, no auth: all state is in memory** and a refresh starts over.

Next.js here is a newer version than most training data. Read the relevant guide in `node_modules/next/dist/docs/` before using an unfamiliar API (see `AGENTS.md`).

## Source of truth

These artefacts decide how things look and behave. If code and an artefact disagree, say which is wrong; do not quietly pick one. If you can't open them, stop and tell Michal.

| Artefact | What it decides |
| --- | --- |
| [FrissonWorks Design](https://claude.ai/code/artifact/1947e93c-f922-40db-8390-870ba548ea9d) | The look: Jost, poster style, halo on every text, no boxes behind text, weight ≤ 500, no alpha/grey text, Vogue titles, spacing and type roles |
| [FW Comments · Design](https://claude.ai/artifact/M61gGoGnqFCzxEgtENQnMq) | The comment system. Read the chapter **"Letter-coded identity & votes"** (first word = identity, last word = votes, hero meter on direct replies, per-person participation idea, visible-vs-internal rule) |
| [Comment Color Mockups](https://claude.ai/artifact/4BifJBSiyuVKZDmDwStetj) | The working letter algorithm (fill/fade, vote split, palettes, colour-blind toggle). `project/Main.dc.html` holds the reference JS |
| [FW Brain · Trust & Moderation](https://claude.ai/artifact/SVRysF74ateEV8ce9wENoF) | Trust is **internal only** and never shown as a badge/score on a person. Only thread-scoped signals may be visible |

Michal keeps an agenda artefact in Claude that lists all FrissonWorks artefacts; look there for anything not linked above.

## Routes

| Route | What |
| --- | --- |
| `/` | Home: one poster-style card per experiment, from `src/lib/experiments.ts` |
| `/comments` | One page, five tabs (kept in the URL: `?tab=old`, `?tab=threads`, `?tab=branches`, `?tab=room`): **Comments Lab** (the letter-coded comments with every display option; read-only conversation), **Old Comments** (the ObservaLyst Master Lab thread, unchanged), **Old Threads** (ObservaLyst's Comments Lab: five comment sections, one per post), **Old Branches** (ObservaLyst's Branches Lab: six branching layouts of one debate, with live voting) and **Comments Room** (a playground: impersonate anyone from 12 international names, start hero posts, reply, vote, filter Top / New / Mine / Reply, Close all). `/comments-old` redirects to `/comments?tab=old`. |
| `/motion` | Motion test bench: kinetic type, parallax, feedback at OFF / NORMAL / COLOUR / OTT |
| `/cards` | Five designs for the home page cards; choose the one the home page uses |
| `/hero-titles` | Thirteen **fill-only** designs for the hero title (the huge name behind a list or page; the Nexus's stripes redrawn as light): Mist, Radiance, Airbrush, Smoke, Veil, Glass, Satin, Mirror, Aurora, Prism, Slice, Depth, Long shadow. Shown at Nexus list size (88px, cropped by the column) or page size. Pick word, colours (project / skin), size and a tag; "Use as FW default" saves the design (`hero` setting) and the home page draws its title with it. |
| `/backgrounds` | Light in the lab. Tab **Threads**: seven ways a comment box lights up while you write in it (none, line, spotlight, mesh, theme gradient, aurora, **stars**); "Use in comments" saves the choice. Tab **Page**: the WebGL page backgrounds. |

**Add an experiment:** create `src/app/<name>/page.tsx`, then add one object to `EXPERIMENTS` in `src/lib/experiments.ts`. The home page picks it up.

## Layout

- `src/lib/fw-comments/` — **pure TypeScript, no React/DOM/storage.** The letter logic (`letters.ts`), thread maths (`thread.ts`) and palettes/colour maths (`palette.ts`). This is the future `@frissonworks/comments` package: keep it dependency-free and keep UI out of it.
- `src/components/comments/` — the `/comments` UI built on that logic: `CommentsPage.tsx` (tabs + shared display options), `CommentsBoard.tsx` (one board, mode `lab` or `room`, in-memory state), `CommentRow.tsx`.
- `src/legacy/master-lab/` — the ObservaLyst Master Lab, ported with only its imports rewired (`engine.ts` stands in for ObservaLyst's theme provider; `legacy.css` carries the skins and keyframes). Treat as read-only reference; don't restyle it, `/comments-old` exists to show how it was.
- `src/legacy/labs/` — ObservaLyst's two earlier labs, moved here when ObservaLyst kept only the Comments Room (27 Oct 2026): `comments/` the five comment sections (Branches, Nested, Replies, Focus, Chat) and `branches/` the six branching layouts (Ranked, Side by side, Matrix, Story, Pyramid, Switcher), with `shared/` holding the note, post card, author line and the quiet buttons they share. Same rule as the Master Lab: **read-only reference, don't restyle**. Their pure helpers (`commentTree`, `mockLabPeople`, `types`, `VoteControl`, `useLabVotes`, `RelativeTime`, `engine`) are imported from `../master-lab/` instead of being copied again; `legacyBody.ts` is ObservaLyst's Inter and `labs/labs.css` adds the hidden scrollbar and the opaque canvas these two need. `OldThreads.tsx` / `OldBranches.tsx` are the tab entry points (server components: `connection()`, because the seeds are dated relative to now).
- `src/lib/display/`, `src/components/display/` — Sovereign settings, header, WebGL backgrounds. `src/lib/motion/`, `src/components/motion/` — motion presets and the /motion blocks. `src/components/cards/` — card designs.

## Rules for the letter logic

- Text colour is always **opaque**. "Soft" tints are computed hexes, never alpha.
- Same rule everywhere: under capacity, every coloured letter is solid except the newest (soft); at/over capacity all solid.
- Votes: literal counts under the word's letter count, proportional ratio once full. Colour fills from the end of the word, green first then red.
- Hero meter counts **direct replies only** (not descendants, not depth).
- First word: identity gradient (accent → white), or a one-hue meter. Last word: vote colours. Never tint the same letters twice; one-word comments show identity only.
- Never give two people in one thread the same hue.
- Nothing about trust or reputation is rendered. Only identity (start), votes (end) and, if adopted, a participation count scoped to one thread.

## Status: this is the FW comment section (final, 26 Oct 2026)

The design on /comments is the default comment section for every FrissonWorks app, documented in full in [FW Comments · Design](https://claude.ai/artifact/M61gGoGnqFCzxEgtENQnMq) under **"The FW comment section (final)"**. That doc is the spec; this repo is the code. If they disagree, say which is wrong.

- **Letter count is always on** in the final design (the Lab starts with it on; the row stays only to compare with the gradient state).
- **Settings move to the Sovereign header:** a Comments button that reveals Palette (blue/orange for colour-blind readers), Levels per tap and Thread lines. Not built yet; today these rows are on the Comments Lab tab.
- **Name fields can be amended per app:** Name · Occupation · Location are data slots; the unit's placement and the fill rule stay.
- Next: put this repo in git and extract `@frissonworks/comments` (Master Planner, project Comments).

## Row layout v2.2 (`/comments`; FW Comments · Design → "Row layout v2", plus Master Lab behaviours Michalku asked back)

- A row at rest: the coded sentence on the left, a quiet cluster on the far right: `Name  time  total  count ›` (13px, tabular; the name is in the author's identity colour, the rest `--ink-3`). Revealed, the total becomes `+up | −down` (those are the vote buttons; the only place exact counts show). The count + chevron (lucide `ChevronRight`, turns 90° when open) exists only when the comment has **direct** replies, number first, chevron after.
- **Tapping the sentence does both** (like Master Lab): opens the replies below it and reveals the rest of the author line; tap again to fold and hide. This deliberately overrides the earlier v2 brief's "never one gesture doing both" (that rule came from the prompt, not from any tool limit). The reply count is a second, narrower target that opens/folds only that comment's direct replies.
- **Levels per tap** (setting on the page, default 2): a tap on a sentence opens its replies that many levels deep (1 = just the direct replies). The count/chevron always opens exactly one level. Implemented with `initialOpen` / `cascade` props on `CommentRow`.
- Reveal (no reserved space, opens with a short height animation via `useHeightTransition`): the sentence, then **Reply** right after the text it answers (Room only; the Lab is read-only), then the identity unit **Name · Occupation · Location** as one nowrap piece, **always ending where the name sits at rest** (the name has its own 4.25rem grid column; a revealed sentence block spans it). It stays on the sentence's row if it fits; if not, the whole unit drops to the next row and ends at the same place, never split.
- **Names use the first-word rule** (`nameFirstMode` in `letters.ts`): once a person's posts in the thread reach the name's letter count every letter is solid; before that the name follows the sentence start (identity gradient, or with Letter count On a meter of their posts, newest letter soft, unlit letters grey).
- The count at the end of a row is **every reply below it, at every level** (`descendants`); the hero meter still counts direct replies only. The count/chevron still opens just one level.
- The total is coloured by **your own vote** (green if you voted up, red if down, whatever its sign); in the revealed `+up | −down` only the side you voted on is coloured.
- **Reply** is one design (`.fw-reply`: 13px, the same size as the name, light, ink-3, brightens on point) in one place, 20px after the end of the sentence. Collapsed rows show it on pointer hover (zero width, so nothing reflows; measured on mouse-enter and hidden if the last line leaves no room); revealed rows have it in the line. On touch, tap the sentence.
- Name, time and total (collapsed) are extra mouse/touch targets for the same tap as the sentence. Under the Room's **Top** filter replies at every level sort best score first; under **New** newest first (the Lab keeps oldest first).
- Replies start folded. Rows at rest have no gap; top-level threads sit close together (`gap-1`). No `+`/`−` expander, no "x direct replies / n posts" text.
- Thread hairlines are off: indentation + identity colour carry the structure. Compare with the lines via the **Thread lines** setting in the Comments Lab.
- Two rosters in `palette.ts`: the Lab's eight characters (4 from the mockups + Seema, Lisa, Nya, Anthony; hand-picked hues) and the Room's 12 international people (`ROOM_PEOPLE`; hues spread by the golden angle with `hueAccent`, so nobody picks a colour). Seeds in `seed.ts`: five threads up to seven levels deep for the Lab, three small threads for the Room.
- **Room filter row** (`arrangeThreads` in `thread.ts`): Top (best net score), New, Mine (threads where the impersonated person has posted), Reply (threads where someone replied to that person). Close all rebuilds every row closed.
- Idea parked in Master Planner (project Comments, Later): a paid **VIP badge** that lets a person choose a unique comment colour. It must stay a colour, never a trust/reputation signal (FW Brain).

## Sovereign header, settings and backgrounds

- `src/components/display/SovereignHeader.tsx` is LoreLyst's header (plain rows, tap to cycle): LIGHT, SKIN (10 skins), MOTION (off / normal / colour / ott), TEXT, TYPE (jost / italic / serif / sans / mono), BG (intensity + background), SHADOW; plus links to every page. Mounted in the root layout.
- Settings live in `src/lib/display/` (`settings.ts` values and defaults, `store.ts` the external store). **Only these display preferences are saved in the browser (localStorage `fwlab_display_v1`)**; comments, votes and users are in memory only.
- `DisplayEffects` turns the settings into the page: skin class + `light-mode` on `<body>`, `data-text-scale` / `data-type-style` on `<html>`, `data-kinematics`, `data-shadow`. Skins and tokens are in `globals.css`. T1 = `--theme-primary-glow`, T2 = `--theme-secondary-glow`, T3 = `--node-4`.
- Backgrounds are LoreLyst's WebGL engines, copied (`src/lib/display/background/engines.ts`, `shaders.ts`, `src/components/display/BackgroundHost.tsx`). SCENERY (pillar photographs) and NEXUS's stars (need accounts/content) are not part of the lab: `bgEvents.ts` is a stub.
- Reading text is in `rem` so TEXT scales it; heroes, Vogue titles and statements are px and stay fixed.

## Motion

- `src/lib/motion/presets.ts` is the one place MOTION is defined (pure TypeScript): per level, a time scale, ease, spring, stagger, travel, blur, parallax, tilt, colour and fringe flags. Read it in components with `useMotion()`; turn a preset into a framer-motion transition with `transitionFor(preset, seconds, delay)`. OFF means every duration is 0 and CSS transitions/animations are killed too (`body[data-kinematics="off"]`).
- `/motion` is the test bench: kinetic type, scroll and pointer parallax, feedback. Building blocks are in `src/components/motion/parts.tsx`.
- The comments read the same presets (replies arrive staggered, reveal fade length, vote springs, colour fades for COLOUR/OTT).

## Backgrounds and the comment box glow

- `src/components/backgrounds/GlowFrame.tsx` lights a box while something inside it has focus (the composer). Styles: `GLOW_STYLES` in `src/lib/display/settings.ts`, default **stars**, saved as the `glow` display setting.
- **Stars** is LoreLyst's constellation button (DESIGN.md "The button", `app/lorelyst/poster/ConstellationButton.tsx`, the one button-sized action in the app) used as a background: `ConstellationField.tsx` is the same star cloud and physics sized to the box; it brightens on focus and blows apart from the Post button when a comment is posted, then re-forms. Follows MOTION (OFF paints it once).
- The composer has no focus ring: the global `:focus-visible` rule is in `@layer base` so utilities like `outline-none` can override it (unlayered CSS always beats Tailwind utilities).

## Cards

- `src/components/cards/variants.tsx` holds five designs for the home page's experiment cards (line, index, spotlight, tilt, echo); `/cards` shows them live and "Use on home" saves the choice (`card` setting). `ExperimentGrid` draws the home page with it. No box, fill or border behind text in any of them.

## Hero titles

- Source: the **FW Nexus** page ("light-ray titles", the `.ghost` block) is where hero titles live today; FrissonWorks Design covers only Vogue titles and the Poster hero type role. Michal's brief (26 Oct): ethereal = heavenly, airy, barely visible, airbrush; **no outlines and no neon, only fill and transparency or gradients**; the letters themselves are the light, not stripes laid over them; small like the Nexus list titles (about 88px, oversized and cropped by the column), page titles bigger. Liked: Prism, Slice (superb), Glass and Depth on a normal fill.
- `src/components/hero/HeroTitle.tsx`: `<HeroTitle word variant tint size crop overlap>` with the content to put on top as children. **SVG**, so gradients, masks and filters follow the real glyphs: the word is measured once (`getBBox` + `getStartPositionOfChar`), the viewBox hugs the capitals, `size` is the font px. `crop` (list size) lets the column clip the word and slides it sideways with the scroll like the Nexus; otherwise it shrinks to fit. Every design is fills: vertical gradients with their own alpha (`VGrad`), blurred copies for bloom, a masked moving band for sheen (`Sheen`), vertical-only blur for beams (Radiance), `feTurbulence` thresholded into grain (Airbrush) or displacement (Smoke).
- `src/lib/hero/heroes.ts` (pure): names, tags, notes, the sample words (Nexus project colours) and `projectTint`. `hero` in `settings.ts` is the saved default (`HERO_STYLES`).
- Reads MOTION through `useMotion()`: OFF paints still, NORMAL calm, COLOUR lets colour drift, OTT is loud. One shared window pointer listener; scroll via `useScroll` on the title box. Decoration only: aria-hidden, `pointer-events: none`, no halo (art, not reading text), no trust/identity meaning. Keyframes are `fw-h-*` in `globals.css`; offscreen titles pause (`data-live="false"`).

## Ported to ObservaLyst (26 Oct 2026)

Since 27 Oct 2026 the Comments Room is the *only* comment page in ObservaLyst: the Comments Lab, Branches Lab and Master Lab were deleted there and live on here, under `src/legacy/`. A copy of the comment section lives in the ObservaLyst repo (`components/fw-comments/`, `lib/fw-comments/`), shown on `/lab/room` ("Comments Room" tab). It is these files copied with imports rewritten (`src/lib/fw-comments/*`, `src/lib/motion/presets.ts` as `motion.ts`, `Age`, `CommentRow`, `CommentText`, `Composer`, `Controls`, `context`, `useHeightTransition`, `GlowFrame`, `ConstellationField`); the host-specific parts are `display.ts` (light and MOTION from ObservaLyst's provider; glow fixed to stars), `store.ts` (the room and the comment settings in localStorage, so nothing is lost on reload) and `CommentsRoom.tsx` (the Room board, empty). Comment settings (palette, levels per tap, thread lines) are in ObservaLyst's Sovereign header under COMMENTS. **A fix to the comment components here must be copied there too** until they become the shared `@frissonworks/comments` package (re-run the copy, then keep `display.ts`/`store.ts`/`CommentsRoom.tsx`).

## Gotcha: the button reset

`globals.css` has an unlayered `button, input, textarea { font: inherit; color: inherit }`. Unlayered CSS beats Tailwind utilities, so `text-*`, `font-*` and `hover:text-*` classes on a `<button>` do **not** apply. Style buttons with a class in `globals.css` (like `.fw-reply`) or an inline style, or put the reset in `@layer base`.

## Design rules to keep in this repo

- Type is the interface: no cards, borders or fills behind text. Hairlines (1px) and dots are fine.
- Every text has a halo (set on `body`); under 24px it also has an edge. Gradient text uses `.fw-gradient-text` (halo via `drop-shadow`).
- Weight 200–500 only. No bold. Colour roles: T1 `--t1`, T2 `--t2`, T3 `--t3` (per skin), ink and opaque "rest" inks.
- Tap targets ≥ 48px. Motion uses `cubic-bezier(0.22, 1, 0.36, 1)`; respect `prefers-reduced-motion`.

## Commands

```bash
npm run dev     # dev server, http://localhost:3000
npm run build   # production build (also type-checks)
npm run lint
```
