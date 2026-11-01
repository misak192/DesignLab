/**
 * File: src/components/chartstudy/dots/cutouts.tsx
 * Description: Row 3 (13 to 18, cutouts) and row 6 (31 to 36, layers and motion) of the Dot Study. Cutouts are masks on one
 * gradient, so a sliced, ringed or halftone dot is still one element. The layered dots are nested discs with a papercut
 * shadow between them; they move by transform only, so a bouncing one costs a handful of elements and no repaint.
 */
import type { CSSProperties, FC } from 'react';
import { anim, mixHex, tint } from '../shared';
import { N, Wrap, at, disc, mask } from './kit';
import type { DotProps } from './kit';

/** 13 Slice cuts: horizontal cuts that grow thicker toward the bottom, like a setting sun. */
export const D13: FC<DotProps> = ({ c, hi, lo, s }) => (
  <span
    aria-hidden
    style={disc(s, `linear-gradient(to bottom, ${hi}, ${c} 50%, ${lo})`, {
      ...mask(
        'linear-gradient(to bottom, #000 0 42%, transparent 42% 45%, #000 45% 56%, transparent 56% 60%, #000 60% 69%, transparent 69% 74%, #000 74% 82%, transparent 82% 88%, #000 88% 94%, transparent 94%)'
      ),
    })}
  />
);

/** 14 Ring: a hole through the middle, with a gradient around the ring. */
export const D14: FC<DotProps> = ({ hi, lo, s }) => (
  <span aria-hidden style={disc(s, `linear-gradient(135deg, ${hi}, ${lo})`, { ...mask('radial-gradient(circle, transparent 0 33%, #000 34%)') })} />
);

/** 15 Segmented ring: twelve segments in a ring, the gradient running round it. */
export const D15: FC<DotProps> = ({ c, hi, lo, s }) => (
  <span
    aria-hidden
    style={disc(s, `conic-gradient(from 20deg, ${lo}, ${c}, ${hi}, ${c}, ${lo})`, {
      ...mask(['repeating-conic-gradient(#000 0deg 24deg, transparent 24deg 30deg)', 'radial-gradient(circle, transparent 0 38%, #000 39%)']),
    })}
  />
);

/** 16 Arc rings: three concentric arcs of different lengths, like a progress dial. */
export const D16: FC<DotProps> = ({ c, hi, lo, s }) => (
  <svg aria-hidden width={s} height={s} viewBox="0 0 100 100" style={{ display: 'block' }}>
    {(
      [
        [44, 0.78, c],
        [31, 0.58, hi],
        [18, 0.36, lo],
      ] as const
    ).map(([r, f, col]) => (
      <circle
        key={r}
        cx={50}
        cy={50}
        r={r}
        fill="none"
        stroke={col}
        strokeWidth={9}
        strokeLinecap="round"
        strokeDasharray={`${(2 * Math.PI * r * f).toFixed(1)} ${(2 * Math.PI * r).toFixed(1)}`}
        transform="rotate(-90 50 50)"
      />
    ))}
  </svg>
);

/** 17 Pulled wedge: a wedge pulled out of the dot, like a slice of a donut chart. */
export const D17: FC<DotProps> = ({ c, hi, lo, s }) => (
  <Wrap s={s}>
    <span aria-hidden style={at(s, { background: `linear-gradient(145deg, ${hi}, ${lo})`, ...mask('conic-gradient(from -38deg, transparent 0 76deg, #000 76deg)') })} />
    <span aria-hidden style={at(s, { background: `linear-gradient(to bottom, ${hi}, ${c})`, transform: `translateY(${-s * 0.1}px)`, ...mask('conic-gradient(from -38deg, #000 0 76deg, transparent 76deg)') })} />
  </Wrap>
);

/** 18 Halftone: a grid of tiny dots that fades out toward the rim. */
export const D18: FC<DotProps> = ({ hi, lo, s }) => (
  <span
    aria-hidden
    style={disc(s, `linear-gradient(145deg, ${hi}, ${lo})`, {
      ...mask(['radial-gradient(circle, #000 0 42%, transparent 48%)', 'radial-gradient(circle, #000 60%, transparent 84%)'], {
        maskSize: `${s / 8}px ${s / 8}px, 100% 100%`,
        WebkitMaskSize: `${s / 8}px ${s / 8}px, 100% 100%`,
        maskRepeat: 'repeat, no-repeat',
        WebkitMaskRepeat: 'repeat, no-repeat',
      }),
    })}
  />
);

/* ── Row 6 ───────────────────────────────────────────────────────────────────────────────────────────────────────── */

const LAYERS = 6;

/**
 * Nested discs, outer lightest and inner deepest, each pushed in by the same step. `look` decides what a layer is made
 * of; `beat` is the length of one bounce in ms (0 = still); each layer starts a little after the one outside it.
 */
function Layers({
  p,
  look,
  beat,
}: {
  p: DotProps;
  look: (i: number, size: number) => CSSProperties;
  beat: number;
}) {
  return (
    <Wrap s={p.s}>
      {Array.from({ length: LAYERS }, (_, i) => {
        const size = p.s * (1 - i * 0.16);
        return <span key={i} aria-hidden style={at(size, { ...look(i, size), ...(beat ? anim(p.live, 'fw-cd-bounce', beat, { loop: true, delay: i * 90 }) : {}) })} />;
      })}
    </Wrap>
  );
}

/** 31 Layered: six nested dots, each darker and smaller, with a papercut shadow between them. */
export const D31: FC<DotProps> = (p) => (
  <Layers
    p={p}
    beat={0}
    look={(i, size) => ({ background: mixHex(p.hi, p.deep, i / (LAYERS - 1)), boxShadow: `0 ${size * 0.05}px ${size * 0.08}px ${tint(p.deep, 0.85)}` })}
  />
);

/** 32 Layered pulse: the same layers, bouncing one after another like a heartbeat. */
export const D32: FC<DotProps> = (p) => (
  <Layers
    p={p}
    beat={1500}
    look={(i, size) => ({ background: mixHex(p.hi, p.deep, i / (LAYERS - 1)), boxShadow: `0 ${size * 0.05}px ${size * 0.08}px ${tint(p.deep, 0.85)}` })}
  />
);

/** 33 Soft glass layers: neutral glass tinted deeper toward the middle, pulsing slowly. */
export const D33: FC<DotProps> = (p) => (
  <Layers
    p={p}
    beat={2800}
    look={(i, size) => ({
      background: tint(mixHex(N, p.c, 0.15 + (i / (LAYERS - 1)) * 0.7), 0.42),
      boxShadow: `0 ${size * 0.06}px ${size * 0.16}px ${tint(p.lo, 0.3)}`,
    })}
  />
);

/** 34 Ring marker: a white ring with the colour inside, the marker on a line. */
export const D34: FC<DotProps> = ({ hi, lo, s }) => (
  <Wrap s={s}>
    <span aria-hidden style={at(s * 0.9, { background: 'linear-gradient(160deg, #ffffff, #d3dcee)', boxShadow: `0 ${s * 0.14}px ${s * 0.3}px ${tint(lo, 0.55)}` })} />
    <span aria-hidden style={at(s * 0.5, { background: `linear-gradient(145deg, ${hi}, ${lo})` })} />
  </Wrap>
);

/** 35 Crescent: a dot cut by a second dot, with a ghost of the whole behind it. */
export const D35: FC<DotProps> = ({ c, hi, lo, s }) => {
  const r = s * 0.4;
  return (
    <Wrap s={s}>
      <span aria-hidden style={at(s, { background: tint(c, 0.16) })} />
      <span
        aria-hidden
        style={at(s, {
          background: `linear-gradient(145deg, ${hi}, ${lo})`,
          ...mask(`radial-gradient(circle at 70% 36%, transparent 0 ${r}px, #000 ${r + 0.6}px)`),
        })}
      />
    </Wrap>
  );
};

/** 36 Ripple: a core with two soft rings spreading out and fading. */
export const D36: FC<DotProps> = ({ c, hi, lo, s, live }) => {
  const ring = (delay: number, rest: { scale: number; opacity: number }) => ({
    background: `radial-gradient(closest-side, ${tint(c, 0)} 50%, ${tint(hi, 0.7)} 74%, ${tint(c, 0)} 100%)`,
    transform: `scale(${rest.scale})`,
    opacity: rest.opacity,
    ...anim(live, 'fw-cd-ripple', 2400, { loop: true, delay, ease: 'ease-out' }),
  });
  return (
    <Wrap s={s}>
      <span aria-hidden style={at(s, ring(0, { scale: 1.35, opacity: 0.45 }))} />
      <span aria-hidden style={at(s, ring(-1200, { scale: 1.9, opacity: 0.2 }))} />
      <span aria-hidden style={at(s * 0.5, { background: `linear-gradient(145deg, ${hi}, ${lo})`, boxShadow: `0 0 ${s * 0.35}px ${tint(c, 0.7)}` })} />
    </Wrap>
  );
};

export const CUTOUT_DOTS: Record<string, FC<DotProps>> = { '13': D13, '14': D14, '15': D15, '16': D16, '17': D17, '18': D18, '31': D31, '32': D32, '33': D33, '34': D34, '35': D35, '36': D36 };
