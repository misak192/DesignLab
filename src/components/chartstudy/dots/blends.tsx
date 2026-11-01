/**
 * File: src/components/chartstudy/dots/blends.tsx
 * Description: Rows 1, 2 and 5 of the Blends page: the dot-study favourites combined (shifted gradient, soft tinted shadow,
 * glow, airbrush), the ones Michalku asked to have fixed (a clean fade-down, a halftone with faded edges, tint bleed that
 * works on a light page and shows no black on a dark one), and my own recommendations. Airbrush = a gradient with a
 * radial mask so it has no edge; because a mask would clip a box-shadow, the airbrush dots take their shadow and glow
 * from their own soft layers instead. Still gradients, masks and shadows only: no blur filter, no backdrop-filter.
 */
import type { CSSProperties, FC } from 'react';
import { anim, tint } from '../shared';
import { Wrap, at, disc, mask } from './kit';
import type { DotProps } from './kit';

/** The neutral of glass: pale on the dark page, grey-blue on the light one (see --dot-glass in globals.css). */
export const glassN = (a: number) => `rgb(var(--dot-glass) / ${a})`;

/** The glossy part of glass: a pale sheen over the top half that stops short. One gradient layer, no element. */
export const SHEEN = `linear-gradient(to bottom, ${tint('#ffffff', 0.34)} 0, ${tint('#ffffff', 0.06)} 46%, ${tint('#ffffff', 0)} 50%)`;

/** Opaque in the middle, thinning out to nothing at the rim: the airbrush. */
export const SOFT = 'radial-gradient(closest-side, #000 0%, rgba(0,0,0,0.92) 26%, rgba(0,0,0,0.45) 60%, transparent 100%)';
/** An airbrush squashed upward: opaque near the top, thinning out toward the bottom. One mask, so no rectangle shows. */
export const SOFT_UP = 'radial-gradient(ellipse 50% 56% at 50% 36%, #000 0%, rgba(0,0,0,0.92) 30%, rgba(0,0,0,0.42) 62%, transparent 100%)';
/** The lower it goes, the more it disappears. A mask, so the colour stays bright all the way down. */
export const FADE = 'linear-gradient(to bottom, #000 38%, transparent 98%)';

export const grad = (hi: string, lo: string) => `linear-gradient(145deg, ${hi}, ${lo})`;

/** An airbrush dot as a layer centred in a Wrap. */
export const airAt = (s: number, background: string, extra: CSSProperties = {}, x = 50, y = 50, k = 1.3): CSSProperties => at(s * k, { background, ...mask(SOFT), ...extra }, x, y);

/** A soft ellipse of the off-shade under a dot: its shadow, as a gradient. */
export const shadowBlob = (s: number, lo: string, a = 0.6): CSSProperties =>
  at(s * 1.15, { background: `radial-gradient(closest-side, ${tint(lo, a)}, ${tint(lo, 0)})`, transform: 'scaleY(0.5)' }, 50, 96);

/** A soft glow of light in the dot colour, behind it. */
export const glowBlob = (s: number, c: string, a = 0.5, k = 1.9, y = 50): CSSProperties =>
  at(s * k, { background: `radial-gradient(closest-side, ${tint(c, a)}, ${tint(c, 0)})` }, 50, y);

/** The core of light in the middle of an airbrush dot, laid over its gradient in the same element. */
const core = (hi: string, a = 0.85) => `radial-gradient(closest-side, ${tint(hi, a)}, ${tint(hi, 0)} 55%)`;

/** The grid of tiny dots that halftone is cut with. */
const dots = (s: number) => ({ maskSize: `${s / 8}px ${s / 8}px, 100% 100%`, WebkitMaskSize: `${s / 8}px ${s / 8}px, 100% 100%`, maskRepeat: 'repeat, no-repeat', WebkitMaskRepeat: 'repeat, no-repeat' }) as CSSProperties;
const DOTS = 'radial-gradient(circle, #000 0 42%, transparent 48%)';

/* ── Row 1: the favourites, combined ─────────────────────────────────────────────────────────────────────────────── */

/** Gradient and soft shadow. */
export const B01: FC<DotProps> = ({ hi, lo, s }) => <span aria-hidden style={disc(s, grad(hi, lo), { boxShadow: `0 ${s * 0.24}px ${s * 0.46}px ${tint(lo, 0.72)}` })} />;

/** Gradient, soft shadow and glow. */
export const B02: FC<DotProps> = ({ hi, lo, s }) => (
  <span aria-hidden style={disc(s, grad(hi, lo), { boxShadow: `0 ${s * 0.28}px ${s * 0.5}px ${tint(lo, 0.6)}, 0 0 ${s * 0.42}px ${tint(hi, 0.6)}` })} />
);

/** Airbrush with the shifted gradient. */
export const B03: FC<DotProps> = ({ hi, lo, s }) => <span aria-hidden style={{ display: 'block', width: s * 1.3, height: s * 1.3, margin: -s * 0.15, background: grad(hi, lo), ...mask(SOFT) }} />;

/** Airbrush with a soft shadow of the off-shade. */
export const B04: FC<DotProps> = ({ hi, lo, s }) => (
  <Wrap s={s}>
    <span aria-hidden style={shadowBlob(s, lo, 0.6)} />
    <span aria-hidden style={airAt(s, grad(hi, lo))} />
  </Wrap>
);

/** Airbrush with glow and a lit core. */
export const B05: FC<DotProps> = ({ c, hi, lo, s }) => (
  <Wrap s={s}>
    <span aria-hidden style={glowBlob(s, c, 0.5)} />
    <span aria-hidden style={airAt(s, `${core(hi)}, ${grad(hi, lo)}`)} />
  </Wrap>
);

/** Airbrush, shifted gradient, soft shadow and glow together. */
export const B06: FC<DotProps> = ({ c, hi, lo, s }) => (
  <Wrap s={s}>
    <span aria-hidden style={shadowBlob(s, lo, 0.55)} />
    <span aria-hidden style={glowBlob(s, c, 0.45)} />
    <span aria-hidden style={airAt(s, `${core(hi)}, ${grad(hi, lo)}`)} />
  </Wrap>
);

/* ── Row 2: the ones to fix ──────────────────────────────────────────────────────────────────────────────────────── */

/** Fade down, clean: it thins out by transparency, so the colour stays bright to the last. */
export const B07: FC<DotProps> = ({ hi, lo, s }) => <span aria-hidden style={disc(s, grad(hi, lo), mask(FADE))} />;

/** Fade down with a glow rising behind the top. */
export const B08: FC<DotProps> = ({ c, hi, lo, s }) => (
  <Wrap s={s}>
    <span aria-hidden style={glowBlob(s, c, 0.5, 1.8, 36)} />
    <span aria-hidden style={at(s, { background: grad(hi, lo), ...mask(FADE) })} />
  </Wrap>
);

/** Airbrush that also thins out downward. */
export const B09: FC<DotProps> = ({ hi, lo, s }) => (
  <span aria-hidden style={{ display: 'block', width: s * 1.3, height: s * 1.3, margin: -s * 0.15, background: grad(hi, lo), ...mask(SOFT_UP) }} />
);

/** Halftone with the edge faded: the grid of dots dissolves toward the rim. */
export const B10: FC<DotProps> = ({ hi, lo, s }) => (
  <span aria-hidden style={disc(s, grad(hi, lo), { ...mask([DOTS, 'radial-gradient(circle, #000 18%, transparent 70%)'], dots(s)) })} />
);

/** Halftone laid over a soft glow of its own colour. */
export const B11: FC<DotProps> = ({ c, hi, lo, s }) => (
  <Wrap s={s}>
    <span aria-hidden style={glowBlob(s, c, 0.5, 1.7)} />
    <span aria-hidden style={at(s, { background: grad(hi, lo), ...mask([DOTS, 'radial-gradient(circle, #000 18%, transparent 70%)'], dots(s)) })} />
  </Wrap>
);

/** A lighter sheen than SHEEN: for glass that is meant to be mostly clear. */
export const SHEEN_SOFT = `linear-gradient(to bottom, ${tint('#ffffff', 0.2)} 0, ${tint('#ffffff', 0.04)} 46%, ${tint('#ffffff', 0)} 50%)`;

/**
 * Tint bleed: clear glass with the colour bleeding in from one side. The glass end is almost transparent and dissolves into the
 * page (a mask thins it to a hint), so there is no grey disc; only the coloured end is solid. Its own soft shadow sits under it.
 */
export const B12: FC<DotProps> = ({ c, hi, lo, s }) => (
  <Wrap s={s}>
    <span aria-hidden style={shadowBlob(s, lo, 0.45)} />
    <span
      aria-hidden
      style={at(s, {
        background: `${SHEEN_SOFT}, linear-gradient(100deg, ${glassN(0.2)} 0%, ${glassN(0.07)} 40%, ${tint(c, 0.8)} 78%, ${tint(hi, 0.95)} 100%)`,
        ...mask('linear-gradient(100deg, rgba(0,0,0,0.3) 0%, #000 52%)'),
      })}
    />
  </Wrap>
);

/* ── Row 5: my recommendations ───────────────────────────────────────────────────────────────────────────────────── */

/** Ember: an airbrush dot that rises out of its own glow and dissolves toward the bottom. */
export const B24: FC<DotProps> = ({ c, hi, lo, s }) => (
  <Wrap s={s}>
    <span aria-hidden style={glowBlob(s, hi, 0.55, 1.9, 34)} />
    <span aria-hidden style={airAt(s, `${core(hi, 0.9)}, linear-gradient(to bottom, ${hi}, ${c} 45%, ${lo})`, mask('radial-gradient(ellipse 50% 56% at 50% 32%, #000 0%, rgba(0,0,0,0.92) 26%, rgba(0,0,0,0.4) 60%, transparent 100%)'))} />
  </Wrap>
);

/** Pearl: tint-bleed glass with a shifted gradient, a sheen and a soft shadow in the off-shade. */
export const B25: FC<DotProps> = ({ c, hi, lo, s }) => (
  <Wrap s={s}>
    <span aria-hidden style={shadowBlob(s, lo, 0.6)} />
    <span aria-hidden style={at(s * 0.92, { background: `${SHEEN}, linear-gradient(120deg, ${glassN(0.7)} 0%, ${glassN(0.34)} 40%, ${tint(c, 0.7)} 72%, ${tint(hi, 0.95)})`, boxShadow: `0 ${s * 0.1}px ${s * 0.3}px ${tint(lo, 0.35)}` })} />
  </Wrap>
);

/** Nebula: two airbrush clouds of the colour and its two cousins, overlapping. */
export const B26: FC<DotProps> = ({ c, hi, lo, s }) => (
  <Wrap s={s}>
    <span aria-hidden style={airAt(s, grad(hi, c), {}, 42, 42, 1.35)} />
    <span aria-hidden style={airAt(s, grad(c, lo), {}, 62, 62, 1.1)} />
  </Wrap>
);

/** Halo: an airbrush core inside two feathered rings of light. */
export const B27: FC<DotProps> = ({ c, hi, lo, s }) => (
  <Wrap s={s}>
    <span
      aria-hidden
      style={at(s * 1.9, { background: `radial-gradient(closest-side, ${tint(c, 0)} 0%, ${tint(c, 0)} 34%, ${tint(hi, 0.4)} 50%, ${tint(c, 0)} 62%, ${tint(c, 0.2)} 78%, ${tint(c, 0)} 92%)` })}
    />
    <span aria-hidden style={airAt(s * 0.9, `${core(hi)}, ${grad(hi, lo)}`)} />
  </Wrap>
);

/** Signet: a shifted-gradient dot with soft shadow and glow, and a halftone grain rising from its base. */
export const B28: FC<DotProps> = ({ hi, lo, deep, s }) => (
  <Wrap s={s}>
    <span aria-hidden style={at(s * 0.92, { background: grad(hi, lo), boxShadow: `0 ${s * 0.26}px ${s * 0.46}px ${tint(lo, 0.55)}, 0 0 ${s * 0.36}px ${tint(hi, 0.45)}` })} />
    <span aria-hidden style={at(s * 0.92, { background: tint(deep, 0.6), ...mask([DOTS, 'linear-gradient(to top, #000 0%, transparent 68%)'], dots(s)) })} />
  </Wrap>
);

/** Aurora: an airbrush dot whose colours slowly turn. The turning follows MOTION; still, it is the same dot. */
export const B29: FC<DotProps> = ({ c, hi, lo, s, live }) => (
  <Wrap s={s}>
    <span aria-hidden style={glowBlob(s, c, 0.45)} />
    <span aria-hidden style={airAt(s, `${core(hi, 0.7)}, conic-gradient(from 0deg, ${hi}, ${c}, ${lo}, ${c}, ${hi})`, anim(live, 'fw-cd-spin', 16000, { loop: true, ease: 'linear' }))} />
  </Wrap>
);

export const BLEND_DOTS: Record<string, FC<DotProps>> = { '01': B01, '02': B02, '03': B03, '04': B04, '05': B05, '06': B06, '07': B07, '08': B08, '09': B09, '10': B10, '11': B11, '12': B12, '24': B24, '25': B25, '26': B26, '27': B27, '28': B28, '29': B29 };
