/**
 * File: src/lib/illusions/colour.ts
 * Description: Pure colour helpers for the illusion backgrounds (hex mixing, the time-of-day palette).
 * No React, no DOM: portable to other platforms (Android) as plain maths.
 */

export type RGB = [number, number, number];

export const hexToRgb = (hex: string): RGB => {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
};

export const rgbToHex = ([r, g, b]: RGB): string =>
  '#' + [r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');

/** Linear mix of two hex colours; t = 0 gives a, t = 1 gives b. */
export const mix = (a: string, b: string, t: number): string => {
  const x = hexToRgb(a);
  const y = hexToRgb(b);
  return rgbToHex([x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t]);
};

export const smooth = (t: number): number => {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
};

export interface TimePalette {
  a: string;
  b: string;
  line: string;
}

/** Key colours of the day. Night appears twice (hour 1 and hour 25) so the loop is seamless. */
const KEYS: { h: number; p: TimePalette }[] = [
  { h: 1, p: { a: '#0b1430', b: '#2b2a7a', line: '#5a5fae' } }, // night: deep navy and indigo
  { h: 6, p: { a: '#f6c1a4', b: '#b9a3d8', line: '#8c7aa8' } }, // dawn: peach and lilac
  { h: 12.5, p: { a: '#4a9fe0', b: '#bfe3fb', line: '#7fb8e8' } }, // midday: sky blue
  { h: 18.5, p: { a: '#f2a33c', b: '#d85a7f', line: '#a8504f' } }, // sunset: amber and rose
  { h: 25, p: { a: '#0b1430', b: '#2b2a7a', line: '#5a5fae' } },
];

/** Smoothly blended palette for a time in minutes (0 to 1440). Never jumps. */
export function timePalette(minutes: number): TimePalette {
  let h = (((minutes % 1440) + 1440) % 1440) / 60;
  if (h < 1) h += 24;
  for (let i = 0; i < KEYS.length - 1; i++) {
    const k0 = KEYS[i];
    const k1 = KEYS[i + 1];
    if (h >= k0.h && h <= k1.h) {
      const t = smooth((h - k0.h) / (k1.h - k0.h));
      return { a: mix(k0.p.a, k1.p.a, t), b: mix(k0.p.b, k1.p.b, t), line: mix(k0.p.line, k1.p.line, t) };
    }
  }
  return KEYS[0].p;
}

export function periodName(minutes: number): string {
  const h = (((minutes % 1440) + 1440) % 1440) / 60;
  if (h >= 4.5 && h < 9) return 'Dawn';
  if (h >= 9 && h < 16) return 'Midday';
  if (h >= 16 && h < 21.5) return 'Sunset';
  return 'Night';
}

export const hhmm = (minutes: number): string => {
  const m = Math.floor(((minutes % 1440) + 1440) % 1440);
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
};
