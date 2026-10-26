/**
 * File: src/lib/display/settings.ts
 * Description: The Sovereign settings of the Design Lab, as plain data: every value a setting can take, its label,
 * and the defaults. These mirror the controls in LoreLyst's Sovereign header (LIGHT, SKIN, MOTION, TEXT, TYPE, BG,
 * SHADOW) so a choice made here means the same thing there. Pure TypeScript, no React or DOM.
 */
import type { BgEngine, BgIntensity } from './background/engines';

export const SKINS = [
  'aurora', 'ocean', 'minimal', 'solar', 'gold', 'nebula', 'glass', 'celadon', 'forest', 'obsidian',
] as const;
export type Skin = (typeof SKINS)[number];

/** Same four levels as LoreLyst's MOTION: OFF means nothing moves. */
export const MOTION_LEVELS = ['off', 'normal', 'colour', 'ott'] as const;
export type MotionLevel = (typeof MOTION_LEVELS)[number];

export const TEXT_SCALES = ['small', 'normal', 'large'] as const;
export type TextScale = (typeof TEXT_SCALES)[number];

/** Jost is the FrissonWorks face; the others are the TYPE setting's alternatives. */
export const TYPE_STYLES = ['jost', 'italic', 'serif', 'sans', 'mono'] as const;
export type TypeStyle = (typeof TYPE_STYLES)[number];

/** How the experiment cards on the home page are drawn (chosen on /cards). */
export const CARD_STYLES = ['line', 'index', 'spotlight', 'tilt', 'echo'] as const;
export type CardStyle = (typeof CARD_STYLES)[number];

/** How a hero title (the huge name behind the text) is drawn (chosen on /hero-titles). */
export const HERO_STYLES = [
  'mist', 'radiance', 'airbrush', 'smoke', 'veil', 'glass', 'satin', 'mirror', 'aurora', 'prism', 'slice', 'depth', 'longshade',
] as const;
export type HeroStyle = (typeof HERO_STYLES)[number];

/** How a comment box lights up while you write in it (chosen on /backgrounds). */
export const GLOW_STYLES = ['none', 'line', 'spotlight', 'mesh', 'gradient', 'aurora', 'stars'] as const;
export type GlowStyle = (typeof GLOW_STYLES)[number];

export interface DisplaySettings {
  light: boolean;
  skin: Skin;
  motion: MotionLevel;
  text: TextScale;
  type: TypeStyle;
  bgEngine: BgEngine;
  bgIntensity: BgIntensity;
  /** The halo behind text. On by default; OFF is an accessibility opt-out. */
  shadow: boolean;
  card: CardStyle;
  glow: GlowStyle;
  hero: HeroStyle;
}

export const DEFAULT_SETTINGS: DisplaySettings = {
  light: false,
  skin: 'ocean',
  motion: 'normal',
  text: 'normal',
  type: 'jost',
  bgEngine: 'off',
  bgIntensity: 'core',
  shadow: true,
  card: 'line',
  glow: 'stars',
  hero: 'mist',
};

const includes = <T extends string>(list: readonly T[], value: unknown): value is T =>
  typeof value === 'string' && (list as readonly string[]).includes(value);

/** Read a saved object defensively: anything unknown or missing falls back to the default. */
export function sanitizeSettings(raw: unknown): DisplaySettings {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const d = DEFAULT_SETTINGS;
  return {
    light: typeof r.light === 'boolean' ? r.light : d.light,
    skin: includes(SKINS, r.skin) ? r.skin : d.skin,
    motion: includes(MOTION_LEVELS, r.motion) ? r.motion : d.motion,
    text: includes(TEXT_SCALES, r.text) ? r.text : d.text,
    type: includes(TYPE_STYLES, r.type) ? r.type : d.type,
    bgEngine: typeof r.bgEngine === 'string' ? (r.bgEngine as BgEngine) : d.bgEngine,
    bgIntensity: typeof r.bgIntensity === 'string' ? (r.bgIntensity as BgIntensity) : d.bgIntensity,
    shadow: typeof r.shadow === 'boolean' ? r.shadow : d.shadow,
    card: includes(CARD_STYLES, r.card) ? r.card : d.card,
    glow: includes(GLOW_STYLES, r.glow) ? r.glow : d.glow,
    hero: includes(HERO_STYLES, r.hero) ? r.hero : d.hero,
  };
}

/** The next value in a list, wrapping round: what a tap on a settings row does. */
export function nextOf<T>(list: readonly T[], current: T): T {
  return list[(list.indexOf(current) + 1) % list.length];
}
