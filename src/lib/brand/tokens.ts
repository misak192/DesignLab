/**
 * File: src/lib/brand/tokens.ts
 * Description: Typed access to the FrissonWorks brand colours (source of truth: tokens.json). Pure TypeScript.
 * The CSS variables (--fw-pink ...), the Tailwind colours (text-fw-pink ...) and Color.kt are generated from the same
 * JSON by `npm run brand:tokens`. Components never write a hex: they use `cssVar(id)`.
 */
import raw from './tokens.json';

export type ColourId = 'pink' | 'purple' | 'violet' | 'lavender' | 'cyan' | 'deepcyan' | 'turquoise' | 'aqua';
export type NeutralId = 'white' | 'night';

export interface BrandColour {
  id: ColourId;
  name: string;
  role: string;
  hex: string;
}
export interface BrandNeutral {
  id: NeutralId;
  name: string;
  role: string;
  hex: string;
}

/** The eight core colours, in spectrum order (pink to aqua). */
export const FW_COLOURS = raw.colours as BrandColour[];
export const FW_NEUTRALS = raw.neutrals as BrandNeutral[];

export type BrandKey = 'action' | 'observa' | 'lore' | 'chrono' | 'swiper' | 'eng' | 'frisson';
export type GradientPair = [ColourId, ColourId];
export type AppMap = Record<BrandKey, GradientPair>;

export const DEFAULT_APP_MAP = Object.fromEntries(raw.apps.map((a) => [a.id, [a.from, a.to]])) as AppMap;
export const KOTLIN_NAME = Object.fromEntries(raw.apps.map((a) => [a.id, a.kotlin])) as Record<BrandKey, string>;

export const cssVar = (id: ColourId | NeutralId): string => `var(--fw-${id})`;
export const colourById = (id: ColourId): BrandColour => FW_COLOURS.find((c) => c.id === id) ?? FW_COLOURS[0];

/** The colours from one end of the spectrum to the other, both included, in either direction. */
export function spectrumBetween(from: ColourId, to: ColourId): ColourId[] {
  const ids = FW_COLOURS.map((c) => c.id);
  const a = ids.indexOf(from);
  const b = ids.indexOf(to);
  const slice = ids.slice(Math.min(a, b), Math.max(a, b) + 1);
  return a <= b ? slice : slice.reverse();
}

/** A CSS linear gradient through the given colours (CSS variables). */
export const gradientOf = (ids: ColourId[], angle = 135): string => `linear-gradient(${angle}deg, ${ids.map(cssVar).join(', ')})`;

export const pairEquals = (a: GradientPair, b: GradientPair) => a[0] === b[0] && a[1] === b[1];
