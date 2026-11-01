/**
 * File: src/components/chartstudy/shared.tsx
 * Description: Small pieces every chart element uses: the palette and the value-to-hue ramp, colour helpers, the
 * animation shorthand, a seeded random, and the light-only layers (Sparkle, Flare, Zap). Nothing here draws a box;
 * the see-through body is ElementBase.
 */
import type { CSSProperties, ReactNode } from 'react';

export const PALETTE = { cyan: '#5FF6FF', violet: '#8B5CF6', magenta: '#FF5BD6', amber: '#FFB84D' } as const;
const STOPS = [PALETTE.cyan, PALETTE.violet, PALETTE.magenta, PALETTE.amber];

const rgb = (hex: string): [number, number, number] => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
];
const toHex = (c: [number, number, number]) => '#' + c.map((n) => Math.round(n).toString(16).padStart(2, '0')).join('');

/** Opaque mix of two hexes; t = 0 gives a, t = 1 gives b. */
export function mixHex(a: string, b: string, t: number): string {
  const x = rgb(a);
  const y = rgb(b);
  return toHex([x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t]);
}

/** The ramp cyan, violet, magenta, amber for t from 0 to 1. */
export function ramp(t: number): string {
  const c = Math.min(1, Math.max(0, t)) * 3;
  const i = Math.min(2, Math.floor(c));
  return mixHex(STOPS[i], STOPS[i + 1], c - i);
}

/** A value of 2 to 20 on the ramp. */
export const rampValue = (v: number) => ramp((v - 2) / 18);

/** A hex as rgba(): the tint of a see-through fill, a halo or a light layer (never text). */
export function tint(hex: string, a: number): string {
  const [r, g, b] = rgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/** The hue pulled toward white: for edges and sparks, which read brighter than the fill. */
export const bright = (hex: string, t = 0.6) => mixHex(hex, '#ffffff', t);

/** Deterministic 0..1, so server and client draw the same arcs and gaps. */
export const rand = (i: number, salt = 1) => {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

/**
 * The animation shorthand for a keyframe in globals.css (fw-ce-*), or nothing when the element is not live, so
 * reduced motion keeps the static look. Entries run once and hold their last frame; loops run forever.
 */
export function anim(
  live: boolean,
  name: string,
  ms: number,
  o: { delay?: number; loop?: boolean; ease?: string } = {}
): CSSProperties {
  if (!live) return {};
  const { delay = 0, loop = false, ease = loop ? 'ease-in-out' : EASE } = o;
  return { animation: `${name} ${Math.round(ms)}ms ${ease} ${Math.round(delay)}ms ${loop ? 'infinite' : '1'} ${loop ? 'none' : 'both'}` };
}

/** A relative box of exact size for an element and its layers. */
export function Box({ w, h, style, children }: { w: number; h: number; style?: CSSProperties; children?: ReactNode }) {
  return (
    <span aria-hidden style={{ position: 'relative', display: 'block', width: w, height: h, ...style }}>
      {children}
    </span>
  );
}

/** A 4-point star, drawn flat in a bright tint with a light-only drop-shadow glow. Centred on (x, y) in its parent. */
export function Sparkle({ size, hue, x, y, style }: { size: number; hue: string; x: number | string; y: number | string; style?: CSSProperties }) {
  return (
    <span
      aria-hidden
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: size,
        height: size,
        marginLeft: -size / 2,
        marginTop: -size / 2,
        pointerEvents: 'none',
        filter: `drop-shadow(0 0 ${Math.max(2, size * 0.25)}px ${tint(hue, 0.9)})`,
        ...style,
      }}
    >
      <svg width={size} height={size} viewBox="-1 -1 2 2" style={{ display: 'block', overflow: 'visible' }}>
        <path d="M0 -1 Q0.07 -0.07 1 0 Q0.07 0.07 0 1 Q-0.07 0.07 -1 0 Q-0.07 -0.07 0 -1Z" fill={bright(hue, 0.85)} />
      </svg>
    </span>
  );
}

/** A soft radial glow centred on its parent: light only, behind the element. */
export function Flare({ size, hue, a = 0.5, style }: { size: number; hue: string; a?: number; style?: CSSProperties }) {
  return (
    <span
      aria-hidden
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: size,
        height: size,
        marginLeft: -size / 2,
        marginTop: -size / 2,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${tint(hue, a)} 0%, ${tint(hue, a * 0.4)} 38%, ${tint(hue, 0)} 70%)`,
        pointerEvents: 'none',
        ...style,
      }}
    />
  );
}

/** A jagged line from (x1, y1) to (x2, y2): points along it pushed sideways by up to `amp`. */
export function jagged(x1: number, y1: number, x2: number, y2: number, seed: number, amp: number, step: number): string {
  const len = Math.hypot(x2 - x1, y2 - y1) || 1;
  const n = Math.max(2, Math.round(len / step));
  const nx = -(y2 - y1) / len;
  const ny = (x2 - x1) / len;
  let d = `M${x1.toFixed(1)} ${y1.toFixed(1)}`;
  for (let k = 1; k < n; k++) {
    const t = k / n;
    const off = (rand(k, seed) - 0.5) * 2 * amp;
    d += ` L${(x1 + (x2 - x1) * t + nx * off).toFixed(1)} ${(y1 + (y2 - y1) * t + ny * off).toFixed(1)}`;
  }
  return `${d} L${x2.toFixed(1)} ${y2.toFixed(1)}`;
}

/** The outline of a w x h rectangle as four jagged edges. */
export function jaggedRect(w: number, h: number, seed: number, amp: number, step: number): string {
  return [
    jagged(0, 0, w, 0, seed, amp, step),
    jagged(w, 0, w, h, seed + 1, amp, step),
    jagged(w, h, 0, h, seed + 2, amp, step),
    jagged(0, h, 0, 0, seed + 3, amp, step),
  ].join(' ');
}

/**
 * Thin electric arcs. Every arc has two shapes (A and B) that swap in hard steps, plus an irregular overall flicker;
 * not live, shape A is drawn still. The svg sits at (left, top) of its parent and may draw outside it.
 */
export function Zap({
  width,
  height,
  left = 0,
  top = 0,
  hue,
  a,
  b,
  live,
  period = 1300,
  phase = 0,
}: {
  width: number;
  height: number;
  left?: number;
  top?: number;
  hue: string;
  a: string[];
  b: string[];
  live: boolean;
  period?: number;
  phase?: number;
}) {
  const stroke = bright(hue, 0.8);
  return (
    <svg
      aria-hidden
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{
        position: 'absolute',
        left,
        top,
        overflow: 'visible',
        pointerEvents: 'none',
        filter: `drop-shadow(0 0 3px ${tint(hue, 0.9)})`,
        ...anim(live, 'fw-ce-zap', period * 2.3, { loop: true, delay: -phase }),
      }}
    >
      {a.map((d, i) => (
        <path
          key={`a${i}`}
          d={d}
          fill="none"
          stroke={stroke}
          strokeWidth={1}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={live ? undefined : 0.85}
          style={anim(live, 'fw-ce-flk-a', period, { loop: true, ease: 'steps(1)', delay: -phase - i * 211 })}
        />
      ))}
      {live &&
        b.map((d, i) => (
          <path
            key={`b${i}`}
            d={d}
            fill="none"
            stroke={stroke}
            strokeWidth={1}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={anim(live, 'fw-ce-flk-b', period, { loop: true, ease: 'steps(1)', delay: -phase - i * 211 })}
          />
        ))}
    </svg>
  );
}

/**
 * The same colour, tilted a little: red and blue move by `amt`, green by about half of it the other way, so the result is
 * similar but not quite. Positive tilts toward a lighter, bluer cousin, negative toward a deeper, greener one. Used for
 * gradients and for shadows that are the dot's own colour, slightly off.
 */
export function shiftRgb(hex: string, amt: number): string {
  const [r, g, b] = rgb(hex);
  const c = (n: number) => Math.min(255, Math.max(0, n));
  return toHex([c(r + amt * 0.9), c(g - amt * 0.5), c(b + amt)]);
}
