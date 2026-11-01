/**
 * File: src/components/lines/veils/kit.tsx
 * Description: What every veil of the Veils page is built from. A veil is not a line: it is a big area of colour with no edge, drawn in a
 * box of `w` x `h` px (always horizontal). Everything is a layer (`V`) with a background and masks: `fx` and `fy` fade the sides, so two of
 * them together dissolve a rectangle into a haze; `grid` cuts a layer into dots, tiles or scanlines. Cheap by rule: gradients and masks, no
 * blur filter, no backdrop-filter; motion is transform and opacity.
 */
import type { CSSProperties, ReactNode } from 'react';
import { mask } from '@/components/chartstudy/dots/kit';
import { rand, tint } from '@/components/chartstudy/shared';

export interface VeilProps {
  /** The box in px. */
  w: number;
  h: number;
  /** The colour and its RGB cousins (see shiftRgb). */
  c: string;
  hi: string;
  lo: string;
  deep: string;
  live: boolean;
  seed: number;
}

export const WHITE = (a = 0.95) => tint('#ffffff', a);

export function VRoot({ p, children }: { p: VeilProps; children?: ReactNode }) {
  return (
    <span aria-hidden style={{ position: 'relative', display: 'block', width: p.w, height: p.h }}>
      {children}
    </span>
  );
}

/** A layer filling the box, inset by `inset` = [x, y] px (negative spills out of it). */
export function V({ bg, masks, inset = [0, 0], extra, radius }: { bg: string; masks?: string[]; inset?: [number, number]; extra?: CSSProperties; radius?: number }) {
  return (
    <span
      aria-hidden
      style={{
        position: 'absolute',
        left: inset[0],
        right: inset[0],
        top: inset[1],
        bottom: inset[1],
        background: bg,
        ...(radius !== undefined ? { borderRadius: radius } : {}),
        ...(masks && masks.length ? mask(masks) : {}),
        ...extra,
      }}
    />
  );
}

/** A layer at a place and size given in percent (of the box). */
export function Vp({ x, y, w, h, bg, masks, extra, radius }: { x: number; y: number; w: number; h: number; bg: string; masks?: string[]; extra?: CSSProperties; radius?: number }) {
  return (
    <span
      aria-hidden
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        width: `${w}%`,
        height: `${h}%`,
        background: bg,
        ...(radius !== undefined ? { borderRadius: radius } : {}),
        ...(masks && masks.length ? mask(masks) : {}),
        ...extra,
      }}
    />
  );
}

/* masks (alpha only) */
/** Both sides dissolve. */
export const fx = (a = 12, b = 88) => `linear-gradient(to right, transparent 0%, #000 ${a}%, #000 ${b}%, transparent 100%)`;
/** Top and bottom dissolve. */
export const fy = (a = 24, b = 76) => `linear-gradient(to bottom, transparent 0%, #000 ${a}%, #000 ${b}%, transparent 100%)`;
/** Strong on the left, gone toward the right. */
export const toR = (from = 20, to = 100) => `linear-gradient(to right, #000 ${from}%, transparent ${to}%)`;
/** Strong on the right, gone toward the left. */
export const toL = (from = 20, to = 100) => `linear-gradient(to left, #000 ${from}%, transparent ${to}%)`;
/** Strong at the top, gone toward the bottom. */
export const toB = (from = 20, to = 100) => `linear-gradient(to bottom, #000 ${from}%, transparent ${to}%)`;
/** Strong at the bottom, gone toward the top. */
export const toT = (from = 20, to = 100) => `linear-gradient(to top, #000 ${from}%, transparent ${to}%)`;
/** An ellipse: opaque in the middle, gone at the rim. */
export const oval = (a = 30, b = 78) => `radial-gradient(ellipse at center, #000 ${a}%, transparent ${b}%)`;

/** A colour from the left to the right. */
export const gh = (a: string, b: string) => `linear-gradient(to right, ${a}, ${b})`;

/** Dots for a mask (`r` is the dot's size in percent of its cell). Pair with `tiles`. */
export const dots = (r = 42) => `radial-gradient(circle, #000 0 ${r}%, transparent ${r + 6}%)`;

/**
 * The size and repeat of the masks of a layer whose FIRST mask is a pattern in cells of `cell` px and whose other `rest` masks cover the
 * whole layer. Give it as `extra` next to `masks=[pattern, ...rest]`.
 */
export function tiles(cell: number, rest: number): CSSProperties {
  const sizes = [`${cell}px ${cell}px`, ...Array(rest).fill('100% 100%')].join(', ');
  const repeats = ['repeat', ...Array(rest).fill('no-repeat')].join(', ');
  return { maskSize: sizes, WebkitMaskSize: sizes, maskRepeat: repeats, WebkitMaskRepeat: repeats };
}

/** Stars scattered over the whole box as ONE background: a radial gradient per star. */
export function starBlock(p: VeilProps, o: { n: number; seed: number; size?: [number, number]; tintEvery?: number; pad?: number }): string {
  const [r0, r1] = o.size ?? [0.7, 1.7];
  const pad = o.pad ?? 6;
  const layers: string[] = [];
  for (let i = 0; i < o.n; i++) {
    const x = pad + rand(i, o.seed) * (p.w - 2 * pad);
    const y = pad + rand(i, o.seed + 1) * (p.h - 2 * pad);
    const r = r0 + rand(i, o.seed + 2) * (r1 - r0);
    const a = 0.4 + rand(i, o.seed + 3) * 0.6;
    const col = o.tintEvery && i % o.tintEvery === 0 ? tint(p.hi, a) : tint('#ffffff', a);
    layers.push(`radial-gradient(circle at ${x.toFixed(1)}px ${y.toFixed(1)}px, ${col} 0, ${col} ${r.toFixed(2)}px, transparent ${(r + 0.9).toFixed(2)}px)`);
  }
  return layers.join(', ');
}

/** A jagged outline for a clip-path: the top and bottom edges wander by up to `amp` percent. */
export function ragged(seed: number, steps: number, amp: number): string {
  const top: string[] = [];
  const bottom: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * 100;
    top.push(`${x.toFixed(1)}% ${(rand(i, seed) * amp).toFixed(1)}%`);
    bottom.push(`${(100 - x).toFixed(1)}% ${(100 - rand(i, seed + 50) * amp).toFixed(1)}%`);
  }
  return `polygon(${[...top, ...bottom].join(', ')})`;
}
