/**
 * File: src/components/lines/kit.tsx
 * Description: What every line and ray design of the Lines page is built from. A design draws ONE line, either horizontal (`o` = 'h',
 * like the ES Employment bar) or vertical (`o` = 'v', like an event stem, rising from its base); everything here is orientation-blind:
 * `band` is a layer centred across the line, `bell`, `ends` and `tail` are masks that make it soft or make it dissipate, `Runner` is a
 * piece of light that travels along it, and `starField` paints a cluster of stars with one gradient per star on a single element.
 * Cheap by rule: gradients, masks and shadows only, no blur filter, no backdrop-filter; motion is transform and opacity.
 */
import type { CSSProperties, ReactNode } from 'react';
import { mask } from '@/components/chartstudy/dots/kit';
import { anim, bright, rand, tint } from '@/components/chartstudy/shared';

export interface RayProps {
  /** Horizontal or vertical. A vertical line rises from its base, so "along" runs upward. */
  o: 'h' | 'v';
  /** Length of the line in px. */
  len: number;
  /** The base line thickness in px: tubes and cores are multiples of it. */
  t: number;
  /** The box across the line, in px: room for glows. */
  box: number;
  /** The colour and its RGB cousins (see shiftRgb). */
  c: string;
  hi: string;
  lo: string;
  deep: string;
  live: boolean;
  seed: number;
}

export const isH = (p: RayProps) => p.o === 'h';
export const alongDir = (p: RayProps) => (isH(p) ? 'to right' : 'to top');
export const acrossDir = (p: RayProps) => (isH(p) ? 'to bottom' : 'to right');

/** White-hot: the colour of a core. */
export const hot = (c: string, a = 0.95) => tint(bright(c, 0.85), a);
export const WHITE = (a = 0.95) => tint('#ffffff', a);

/** The box a design lives in. Glows may spill out of it. */
export function Root({ p, children, style }: { p: RayProps; children?: ReactNode; style?: CSSProperties }) {
  return (
    <span aria-hidden style={{ position: 'relative', display: 'block', width: isH(p) ? p.len : p.box, height: isH(p) ? p.box : p.len, ...style }}>
      {children}
    </span>
  );
}

/**
 * A layer centred across the line, `th` px thick, covering `from` to `to` percent of its length (a vertical line counts from its base).
 * `off` moves it across by px. `extra` carries the background, masks, radius and animation.
 */
export function band(p: RayProps, th: number, extra: CSSProperties = {}, from = 0, to = 100, off = 0): CSSProperties {
  return isH(p)
    ? { position: 'absolute', left: `${from}%`, width: `${to - from}%`, top: '50%', height: th, marginTop: -th / 2 + off, ...extra }
    : { position: 'absolute', bottom: `${from}%`, height: `${to - from}%`, left: '50%', width: th, marginLeft: -th / 2 + off, ...extra };
}

/** A layer from `from` to `to` percent along the line, spanning the whole box across. */
export function slab(p: RayProps, extra: CSSProperties = {}, from = 0, to = 100): CSSProperties {
  return isH(p)
    ? { position: 'absolute', left: `${from}%`, width: `${to - from}%`, top: 0, height: '100%', ...extra }
    : { position: 'absolute', bottom: `${from}%`, height: `${to - from}%`, left: 0, width: '100%', ...extra };
}

/* masks (alpha only; the colour comes from the background) */
/** Soft across: opaque on the centre line, fading to nothing at both edges. `k` is the alpha at the shoulders. */
export const bell = (p: RayProps, k = 0.35) => `linear-gradient(${acrossDir(p)}, transparent 0%, rgba(0,0,0,${k}) 26%, #000 50%, rgba(0,0,0,${k}) 74%, transparent 100%)`;
/** Both ends dissolve. */
export const ends = (p: RayProps, a = 12, b = 88) => `linear-gradient(${alongDir(p)}, transparent 0%, #000 ${a}%, #000 ${b}%, transparent 100%)`;
/** Strong at the start, gone by `to`. */
export const tail = (p: RayProps, from = 0, to = 100) => `linear-gradient(${alongDir(p)}, #000 ${from}%, transparent ${to}%)`;
/** A colour along the line. */
export const gr = (p: RayProps, a: string, b: string) => `linear-gradient(${alongDir(p)}, ${a}, ${b})`;
/** Dashes along the line: `on` px solid, `off` px gap. */
export const dashes = (p: RayProps, on: number, off: number) => `repeating-linear-gradient(${alongDir(p)}, #000 0 ${on}px, transparent ${on}px ${on + off}px)`;

/** A soft sheet: a gradient layer cut by masks. */
export function Sheet({ p, th, bg, masks, extra, from, to, off, radius }: { p: RayProps; th: number; bg: string; masks?: string[]; extra?: CSSProperties; from?: number; to?: number; off?: number; radius?: boolean }) {
  return <span aria-hidden style={band(p, th, { background: bg, ...(radius ? { borderRadius: 999 } : {}), ...(masks && masks.length ? mask(masks) : {}), ...extra }, from, to, off)} />;
}

/**
 * A piece of light that travels along the line, over and over. It sits in a clipped layer; not live, it rests at `rest` (0 to 1) of the
 * way along. `seg` is its length in px, `dur` one trip in ms.
 */
export function Runner({ p, seg, dur, delay = 0, rest = 0.4, children, style }: { p: RayProps; seg: number; dur: number; delay?: number; rest?: number; children: ReactNode; style?: CSSProperties }) {
  const h = isH(p);
  const vars = { '--len': `${p.len}px`, '--seg': `${seg}px` } as unknown as CSSProperties;
  const inner: CSSProperties = {
    position: 'absolute',
    ...(h ? { left: 0, top: 0, width: seg, height: '100%', transform: `translateX(${p.len * rest}px)` } : { left: 0, bottom: 0, width: '100%', height: seg, transform: `translateY(${-p.len * rest}px)` }),
    ...vars,
    ...anim(p.live, h ? 'fw-ln-run-h' : 'fw-ln-run-v', dur, { loop: true, delay, ease: 'linear' }),
  };
  return (
    <span aria-hidden style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', ...style }}>
      <span style={inner}>{children}</span>
    </span>
  );
}

/** A dot of light at a place along the line (percent), centred on it. `size` is its diameter. */
export function glowDot(p: RayProps, at: number, size: number, colour: string, extra: CSSProperties = {}): CSSProperties {
  const common: CSSProperties = { position: 'absolute', width: size, height: size, borderRadius: '50%', background: `radial-gradient(circle, ${colour} 0%, ${tint(colour, 0.55)} 40%, ${tint(colour, 0)} 72%)`, ...extra };
  return isH(p) ? { ...common, left: `${at}%`, top: '50%', marginLeft: -size / 2, marginTop: -size / 2 } : { ...common, bottom: `${at}%`, left: '50%', marginLeft: -size / 2, marginBottom: -size / 2 };
}

/**
 * A cluster of stars as ONE background: a radial gradient per star, scattered along `tile` px of the line and across `spread` px either
 * side of its centre line, thickest in the middle. The element that paints it must repeat it (see starLayer).
 */
export function starField(p: RayProps, o: { n: number; tile: number; spread: number; seed: number; size?: [number, number]; tintEvery?: number }): string {
  const [r0, r1] = o.size ?? [0.7, 1.7];
  const layers: string[] = [];
  for (let i = 0; i < o.n; i++) {
    const a = rand(i, o.seed) * o.tile;
    const g = (rand(i, o.seed + 1) + rand(i, o.seed + 2) + rand(i, o.seed + 3)) / 3 - 0.5;
    const across = p.box / 2 + g * 2 * o.spread;
    const r = r0 + rand(i, o.seed + 4) * (r1 - r0);
    const al = 0.4 + rand(i, o.seed + 5) * 0.6;
    const col = o.tintEvery && i % o.tintEvery === 0 ? tint(p.hi, al) : tint('#ffffff', al);
    const [x, y] = isH(p) ? [a, across] : [across, a];
    layers.push(`radial-gradient(circle at ${x.toFixed(1)}px ${y.toFixed(1)}px, ${col} 0, ${col} ${r.toFixed(2)}px, transparent ${(r + 0.9).toFixed(2)}px)`);
  }
  return layers.join(', ');
}

/** The element that paints a star field: it repeats every `tile` px along the line, and may be `extra` px longer (for drifting). */
export function starLayer(p: RayProps, field: string, tile: number, extra = 0, style: CSSProperties = {}): CSSProperties {
  return isH(p)
    ? { position: 'absolute', left: 0, top: 0, width: p.len + extra, height: '100%', background: field, backgroundSize: `${tile}px 100%`, backgroundRepeat: 'repeat-x', ...style }
    : { position: 'absolute', left: 0, bottom: 0, width: '100%', height: p.len + extra, background: field, backgroundSize: `100% ${tile}px`, backgroundRepeat: 'repeat-y', ...style };
}
