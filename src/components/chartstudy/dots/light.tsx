/**
 * File: src/components/chartstudy/dots/light.tsx
 * Description: Rows 1 and 2 of the Dot Study (01 to 12): colour and shadow, glow and fade. The gradient is the dot colour
 * shifted a little in RGB (`hi` and `lo`), and the shadows are that same off-colour instead of black. One element each,
 * except Fade and bloom, Beacon and Aura.
 */
import type { FC } from 'react';
import { anim, tint } from '../shared';
import { Wrap, at, disc, mask } from './kit';
import type { DotProps } from './kit';

/** 01 Flat: one solid colour. */
export const D01: FC<DotProps> = ({ c, s }) => <span aria-hidden style={disc(s, c)} />;

/** 02 Shifted gradient: the colour nudged in RGB one way and the other. */
export const D02: FC<DotProps> = ({ hi, lo, s }) => <span aria-hidden style={disc(s, `linear-gradient(145deg, ${hi}, ${lo})`)} />;

/** 03 Radial depth: a lighter cousin in the middle, a deeper one at the rim. Matte. */
export const D03: FC<DotProps> = ({ c, hi, lo, s }) => <span aria-hidden style={disc(s, `radial-gradient(circle, ${hi} 0%, ${c} 52%, ${lo} 100%)`)} />;

/** 04 Sharp shadow: a hard shadow in a deeper shift of the dot's own colour. */
export const D04: FC<DotProps> = ({ hi, lo, deep, s }) => (
  <span aria-hidden style={disc(s, `linear-gradient(145deg, ${hi}, ${lo})`, { boxShadow: `${s * 0.12}px ${s * 0.12}px 0 ${deep}` })} />
);

/** 05 Soft shadow: a wide, soft shadow in the same off-colour, falling below. */
export const D05: FC<DotProps> = ({ hi, lo, s }) => (
  <span aria-hidden style={disc(s, `linear-gradient(145deg, ${hi}, ${lo})`, { boxShadow: `0 ${s * 0.24}px ${s * 0.46}px ${tint(lo, 0.72)}` })} />
);

/** 06 Contact and bloom: a sharp contact shadow under a soft coloured bloom. */
export const D06: FC<DotProps> = ({ hi, lo, deep, s }) => (
  <span
    aria-hidden
    style={disc(s, `linear-gradient(145deg, ${hi}, ${lo})`, {
      boxShadow: `0 ${s * 0.07}px 0 ${deep}, 0 ${s * 0.3}px ${s * 0.55}px ${tint(lo, 0.6)}`,
    })}
  />
);

/** 07 Glow: a wide glow in the dot colour with a tighter, lighter core of light. */
export const D07: FC<DotProps> = ({ c, hi, lo, s }) => (
  <span aria-hidden style={disc(s, `linear-gradient(145deg, ${hi}, ${lo})`, { boxShadow: `0 0 ${s * 0.55}px ${tint(c, 0.7)}, 0 0 ${s * 0.14}px ${tint(hi, 0.95)}` })} />
);

/** 08 Fade down: the lower it goes, the more it disappears. */
export const D08: FC<DotProps> = ({ c, hi, lo, s }) => <span aria-hidden style={disc(s, `linear-gradient(to bottom, ${hi} 0%, ${c} 40%, ${tint(lo, 0)} 100%)`)} />;

/** 09 Fade and bloom: dissolves downward, with a soft bloom of colour behind the top. */
export const D09: FC<DotProps> = ({ c, hi, lo, s }) => (
  <Wrap s={s}>
    <span aria-hidden style={at(s * 1.6, { background: `radial-gradient(circle, ${tint(hi, 0.5)} 0%, ${tint(c, 0)} 66%)` }, 50, 36)} />
    {/* The dissolve is a mask on the dot itself, not a filter. */}
    <span aria-hidden style={at(s, { background: `linear-gradient(to bottom, ${hi}, ${c} 48%, ${lo})`, ...mask('linear-gradient(to bottom, #000 30%, transparent 96%)') })} />
  </Wrap>
);

/** 10 Airbrush: no edge at all, a soft spray of colour that thins out by itself. */
export const D10: FC<DotProps> = ({ c, hi, s }) => (
  <span
    aria-hidden
    style={{
      display: 'block',
      width: s * 1.35,
      height: s * 1.35,
      margin: -s * 0.175,
      background: `radial-gradient(closest-side, ${hi} 0%, ${tint(c, 0.92)} 28%, ${tint(c, 0.4)} 60%, ${tint(c, 0)} 100%)`,
    }}
  />
);

/** 11 Beacon: a shaft of light climbs and fades above the dot. */
export const D11: FC<DotProps> = ({ c, hi, lo, s, live }) => (
  <Wrap s={s} style={{ transform: `translateY(${s * 0.34}px)` }}>
    <span
      aria-hidden
      style={{
        position: 'absolute',
        left: '50%',
        bottom: '50%',
        width: s * 0.36,
        height: s * 1.3,
        marginLeft: -s * 0.18,
        background: `linear-gradient(to right, ${tint(c, 0)}, ${tint(hi, 0.85)} 50%, ${tint(c, 0)})`,
        ...mask('linear-gradient(to top, #000 8%, transparent 100%)'),
        ...anim(live, 'fw-ce-lit', 3000, { loop: true }),
      }}
    />
    <span aria-hidden style={at(s * 0.58, { background: `radial-gradient(circle, ${hi} 0%, ${c} 60%, ${lo} 100%)`, boxShadow: `0 0 ${s * 0.4}px ${tint(c, 0.75)}` })} />
  </Wrap>
);

/** 12 Aura: the dot with two faint rings of light around it, feathered, not drawn. */
export const D12: FC<DotProps> = ({ c, hi, s }) => (
  <span
    aria-hidden
    style={{
      display: 'block',
      width: s * 1.7,
      height: s * 1.7,
      margin: -s * 0.35,
      borderRadius: '50%',
      background: `radial-gradient(closest-side, ${hi} 0%, ${c} 15%, ${tint(c, 0)} 19%, ${tint(c, 0)} 36%, ${tint(c, 0.42)} 49%, ${tint(c, 0)} 61%, ${tint(c, 0.2)} 77%, ${tint(c, 0)} 92%)`,
    }}
  />
);

export const LIGHT_DOTS: Record<string, FC<DotProps>> = { '01': D01, '02': D02, '03': D03, '04': D04, '05': D05, '06': D06, '07': D07, '08': D08, '09': D09, '10': D10, '11': D11, '12': D12 };
