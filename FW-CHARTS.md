# FW charts: styles, defaults and recipes

Decided in the FrissonWorks Design Lab (Chart Elements → Charts tab), 1 Nov 2026. Reference code: `src/components/chartstudy/charts/` (`data.ts`, `styles.tsx`, `ChartsStudy.tsx`), `src/components/chartstudy/dots/blends.tsx`, `src/components/chartstudy/shared.tsx`. Keyframes `fw-ch-*` and `fw-cd-*` are in `src/app/globals.css`.

## Paste this into another chat

> Build FW charts from `FW-CHARTS.md` in the fw-design-lab repo (C:\Users\micha\VS Code\fw-design-lab). Support all five styles, with **airbrush gradient as the default**. Settings: `chartStyle` (airbrush | gradient-shadow-glow | halftone | tint-bleed | glass-over-colour, default airbrush), `shift` (subtle 12 | medium 48 | strong 110, default medium), `arrival` (pop-in | none, default pop-in). Read the recipes, the shared rules and the code files above before writing anything. Keep every style cheap: gradients, masks and stacked strokes only, no blur filter and no backdrop-filter, and only transform and opacity animated. Follow MOTION: when it is off, draw at rest.

## Settings

| Setting | Values | Default |
| --- | --- | --- |
| `chartStyle` | `airbrush`, `gradient-shadow-glow`, `halftone`, `tint-bleed`, `glass-over-colour` | **`airbrush`** |
| `shift` | subtle 12, medium 48, strong 110 | medium |
| `arrival` | `pop-in`, `none` | `pop-in` |

Three chart types in every style, on the same data: a **line** (two series), a **stacked bar** (three series), a **scatter** (24 points, three groups, each with a size). Series colours: cyan `#5FF6FF`, violet `#8B5CF6`, magenta `#FF5BD6` (amber `#FFB84D` is the fourth).

## Shared rules (every style)

- **Shifted gradient.** From a series colour `c` and an amount `amt`: `hi = shiftRgb(c, +amt)`, `lo = shiftRgb(c, -amt)`, `deep` = `shiftRgb(c, -1.4 amt)` mixed 35% toward black. `shiftRgb` moves red by `0.9 amt`, green by `-0.5 amt`, blue by `amt`, clamped (code in `shared.tsx`). The gradient is `linear-gradient(145deg, hi, lo)`; on a line it runs along x from `hi` to `lo`.
- **Shadows and glows are the colour's own off-shade**, never black: shadows from `lo`, glows from `hi` or `c`.
- **Cheap by rule.** Gradients, masks, shadows and stacked strokes. No `backdrop-filter`, no blur filter. A mask clips `box-shadow`, so a masked (airbrush) element takes its shadow and glow from separate soft gradient layers.
- **Animation is transform and opacity only** (plus the line's clip reveal). Loops 2 to 6 s. MOTION off or reduced motion: draw the static look, no arrival.
- **Glass neutral** is `rgb(var(--dot-glass) / a)`, with `--dot-glass: 232 238 249` on the dark page and `120 132 170` on the light page, so glass shows on both with no black behind it.
- **Glass rule.** Keep the coloured end solid. Make the glass end almost transparent and let it dissolve into the page, never a grey disc. A glass shape laid over a coloured one stays close to its core, and its line is soft.
- No borders, outlines or edge lines on any chart element. Hairline gridlines (`--rail`) only.

## The five styles

### 1. Airbrush gradient (default)

No edge anywhere; one element per dot and per segment.
- **Line:** strokes of the gradient with widths 22, 15, 9, 5 at stroke-opacity 0.05, 0.09, 0.17, 0.4, plus a 1.6 px core in `hi` mixed 70% toward white (opacity 0.95). Round caps and joins.
- **Stacked bar:** each segment is a rectangle, `grad(hi, lo)`, drawn 28% wider and 36% taller than the segment (offset 14% and 18%), with two intersected masks: `linear-gradient(to right, transparent, #000 30%, #000 70%, transparent)` and `linear-gradient(to bottom, transparent, #000 26%, #000 74%, transparent)`. Segments stay 2 px apart.
- **Dots (line markers every 2nd point at 14 px, scatter 14 to 30 px):** a disc 1.3 times the size, `grad(hi, lo)`, mask `radial-gradient(closest-side, #000 0%, rgba(0,0,0,.92) 26%, rgba(0,0,0,.45) 60%, transparent 100%)`.

### 2. Gradient, shadow and glow

- **Line:** a copy shifted down 7 px in `lo` at 0.32 opacity, 7 px wide; a glow stroke in `hi` at 0.2, 13 px wide; the gradient stroke, 3 px.
- **Bar:** radius 3, `linear-gradient(to bottom, hi, lo)`. The bottom segment of each stack: `box-shadow: 0 10px 18px lo/.5, 0 0 10px hi/.3`. Others: `0 0 8px hi/.28`.
- **Dots (12 px):** a gradient disc with `box-shadow: 0 .28s .5s lo/.6, 0 0 .42s hi/.6` (s = size).

### 3. Halftone, faded edge

- **Line:** dotted, `stroke-dasharray: 0.1 6.6`, 5.5 px wide, gradient stroke, plus a second pass 3 px wide at 0.6 opacity with dashoffset 3.3. An SVG mask fades both ends (black to white by 16%, white to black from 84%).
- **Bar:** `grad(hi, lo)` with three intersected masks: a dot grid (`radial-gradient(circle, #000 0 42%, transparent 48%)`, 5 px cells), a fade across (22% to 78%), a fade along (24% to 76%).
- **Dots:** a gradient disc masked by a dot grid (cell = size / 8) intersected with `radial-gradient(circle, #000 18%, transparent 70%)`. Scatter points are drawn 1.5 times their size. No line markers.

### 4. Tint bleed

Clear glass with the colour bleeding in from one side.
- **Line:** a soft shadow (shifted down 6 px, `lo` at 0.18, 9 px wide); a glass tube (`glass(.14)`, 10 px); the core stroke, gradient from `c` at 0.04 opacity to `c`, 3.2 px; a thin sheen (shifted up 2.6 px, `glass(.3)`, 1.4 px).
- **Bar:** radius 3, `SHEEN_SOFT, linear-gradient(100deg, glass(.16), glass(.06) 42%, c/.85)`, mask `linear-gradient(to right, rgba(0,0,0,.25), #000 55%)` so the glass end dissolves. `SHEEN_SOFT` is `linear-gradient(to bottom, white/.2 0, white/.04 46%, transparent 50%)`.
- **Dots (14 px):** a soft ellipse shadow of `lo` underneath; the disc `SHEEN_SOFT, linear-gradient(100deg, glass(.2) 0, glass(.07) 40%, c/.8 78%, hi/.95 100%)` with mask `linear-gradient(100deg, rgba(0,0,0,.3) 0, #000 52%)`.

### 5. Glass over colour

- **Line:** the airbrush line (style 1), with a soft glass band laid over it, offset (3, 4): strokes 18, 12, 7 px at 0.07, 0.12, 0.18 opacity in `glass(1)`.
- **Bar:** the coloured segment (`grad(hi, lo)`, radius 3, glow `0 0 8px hi/.25`) with a glass pane the same size offset (4, 4): `SHEEN, glass(.3)`, radius 3. `SHEEN` is `linear-gradient(to bottom, white/.34 0, white/.06 46%, transparent 50%)`.
- **Dots (16 px):** a coloured disc (0.78 of the size, centred at 45%, 46%) and a glass disc (0.74, centred at 57%, 56%), close to the core, with a soft shadow of `lo`.

## Arrival (pop-in), for any style

The pop-in is a setting, not a style. The end state is always the style's own design.
- **Line:** the drawing is uncovered from the left, `clip-path: inset(-40px 100% -40px 0)` to `inset(-40px -40px -40px 0)`, 1400 ms ease-in-out. (The negative insets keep the glow from being clipped.)
- **Line markers:** pop in after the line, 560 ms each, delay `500 + 90 * pointIndex` ms.
- **Bar segments:** rise from the baseline, `scaleY` 0, then 1.08, then 1 about the baseline, 700 ms ease-out, delay `90 * column + 120 * seriesIndex` ms.
- **Scatter dots:** pop out from nothing, delay `45 * pointIndex` ms. The pop is `scale(0)` and opacity 0, then `scale(1.14)` at 55%, then `scale(1)`, 560 ms ease-out.
- Replay on demand. Under MOTION off or reduced motion, no arrival: draw at rest.

## Cost (measured on the lab page, elements in the three charts)

Halftone 142, gradient-shadow-glow 152, airbrush 156, tint bleed 226, glass over colour 238. The first three are within 10% of each other and cheap; tint bleed and glass over colour cost about 50% more because their dots and bars are two layers each. Airbrush is not the absolute cheapest by element count, but it is as cheap in practice (no filters, one element per dot and per segment) and it is the default for its look.
