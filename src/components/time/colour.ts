/**
 * File: src/components/time/colour.ts
 * Description: The colour setting of /time. Two modes keep the whole palette (Labels: one hue per label, Ramp: one hue per value);
 * four use a single hue, where labels and values differ only by a shifted cousin of that hue (`shiftRgb`, the shifted-gradient rule)
 * and by how much of it is drawn. Density fills are see-through tints, never alpha on text.
 */
import { PALETTE, ramp, shiftRgb, tint } from '@/components/chartstudy/shared';
import { clamp } from '@/lib/time/geometry';

export type ColourMode = 'labels' | 'ramp' | 'cyan' | 'violet' | 'magenta' | 'amber';

export const COLOUR_MODES: { id: ColourMode; label: string }[] = [
  { id: 'labels', label: 'Labels' },
  { id: 'ramp', label: 'Ramp' },
  { id: 'cyan', label: 'Cyan' },
  { id: 'violet', label: 'Violet' },
  { id: 'magenta', label: 'Magenta' },
  { id: 'amber', label: 'Amber' },
];

/** Work, Learning, Love, Travel, Family, Health. */
export const LABEL_HUES = ['#5FF6FF', '#8B5CF6', '#FF5BD6', '#FFB84D', '#8fd3b6', '#9fb8ff'];

const single = (mode: ColourMode): string | null => (mode === 'labels' || mode === 'ramp' ? null : PALETTE[mode]);

/** The hue of label i (0 to 5). */
export function labelHue(mode: ColourMode, i: number): string {
  if (mode === 'labels') return LABEL_HUES[i % LABEL_HUES.length];
  const base = single(mode);
  return base ? shiftRgb(base, (i - 2.5) * 22) : ramp(i / 5);
}

/** A bright opaque hue for a value t from 0 to 1 (lines, stems, stars). */
export function hueOf(mode: ColourMode, t: number): string {
  const base = single(mode);
  return base ? shiftRgb(base, (clamp(t, 0, 1) - 0.5) * 50) : ramp(clamp(t, 0, 1));
}

/** The fill for a density t from 0 to 1: dim when sparse, full when rich. */
export function dens(mode: ColourMode, t: number): string {
  const v = clamp(t, 0, 1);
  const base = single(mode);
  return base ? tint(shiftRgb(base, (v - 0.5) * 40), 0.16 + 0.84 * v) : tint(ramp(v), 0.22 + 0.78 * v);
}

/** The colour that picks out one thing (the May petal, the present). */
export const accent = (mode: ColourMode): string => single(mode) ?? PALETTE.amber;

/** A column or lane hue for the diagrams that colour by kind (sankey, lanes), with a small shift per item. */
export function kindHue(mode: ColourMode, kind: number, item = 0): string {
  const hues = ['#8fd3b6', '#5FF6FF', '#8B5CF6', '#FF5BD6'];
  const base = single(mode);
  return shiftRgb(base ?? hues[kind % hues.length], (item - 2) * 14 + (base ? (kind - 1.5) * 20 : 0));
}

/** The diverging hue for a mood from -1 (low) to 1 (high). */
export function moodHue(mode: ColourMode, mood: number): string {
  const t = clamp((mood + 1) / 2, 0, 1);
  const base = single(mode);
  return base ? shiftRgb(base, (t - 0.5) * 120) : ramp(0.72 * (1 - t));
}
