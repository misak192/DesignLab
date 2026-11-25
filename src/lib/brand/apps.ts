/**
 * File: src/lib/brand/apps.ts
 * Description: The FrissonWorks apps as the brand system sees them. Pure TypeScript (portable to Compose): every app is
 * [Prefix] + "Lyst", abbreviated to the first letter of the prefix + a raised L (the tick-L). Colours are not stored
 * here: an app has a gradient pair of brand tokens (src/lib/brand/tokens.json), resolved by `resolveApps` from the
 * current app map (the defaults, or what was changed on the Brand colours tab).
 */
import { DEFAULT_APP_MAP, cssVar, gradientOf, spectrumBetween, type AppMap, type BrandKey, type ColourId } from './tokens';

export type AppId = 'action' | 'chrono' | 'eng' | 'lore' | 'observa' | 'swiper';

export interface BrandApp {
  id: AppId;
  /** The part that changes: "Action". */
  prefix: string;
  /** The part that never does. */
  suffix: 'Lyst';
  /** Two-letter abbreviation: AL, CL, EL, LL, OL, SL. */
  abbr: string;
  /** Gradient pair, as brand token ids. */
  from: ColourId;
  to: ColourId;
  /** CSS colour of the start of the gradient (a var(--fw-…)). */
  colour: string;
  /** CSS colour of the end of the gradient. */
  colour2: string;
  /** The whole gradient as CSS. */
  gradient: string;
}

interface AppDef {
  id: AppId;
  prefix: string;
  abbr: string;
}

export const APP_DEFS: AppDef[] = [
  { id: 'action', prefix: 'Action', abbr: 'AL' },
  { id: 'chrono', prefix: 'Chrono', abbr: 'CL' },
  { id: 'eng', prefix: 'Eng', abbr: 'EL' },
  { id: 'lore', prefix: 'Lore', abbr: 'LL' },
  { id: 'observa', prefix: 'Observa', abbr: 'OL' },
  { id: 'swiper', prefix: 'Swiper', abbr: 'SL' },
];

export const APP_IDS = APP_DEFS.map((a) => a.id);

/** The parent brand. Not an app: it has no Lyst. */
export interface BrandParent {
  from: ColourId;
  to: ColourId;
  colour: string;
  colour2: string;
  /** Every spectrum colour between from and to. */
  stops: ColourId[];
  gradient: string;
}

export function resolveApps(map: AppMap = DEFAULT_APP_MAP): BrandApp[] {
  return APP_DEFS.map((d) => {
    const [from, to] = map[d.id as BrandKey];
    return { ...d, suffix: 'Lyst', from, to, colour: cssVar(from), colour2: cssVar(to), gradient: gradientOf([from, to]) };
  });
}

export function resolveParent(map: AppMap = DEFAULT_APP_MAP): BrandParent {
  const [from, to] = map.frisson;
  const stops = spectrumBetween(from, to);
  return { from, to, colour: cssVar(from), colour2: cssVar(to), stops, gradient: gradientOf(stops) };
}

/** First letter of the prefix: the big letter of a monogram. LoreLyst gives L + raised L = LL. */
export const bigLetter = (a: BrandApp): string => a.prefix[0];

/** Apps with the default palette, for code that has no React context (maths, tests). */
export const DEFAULT_APPS: BrandApp[] = resolveApps();
export const defaultApp = (id: AppId): BrandApp => DEFAULT_APPS.find((a) => a.id === id) ?? DEFAULT_APPS[0];
