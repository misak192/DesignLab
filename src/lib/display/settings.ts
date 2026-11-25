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

/**
 * MOTION is the AMOUNT: how much any style moves. OFF means nothing moves, FULL (id 'ott') is over the top. The old COLOUR level is
 * gone: colour is not an amount, and its drift belongs to a style or a look. A saved 'colour' reads as 'normal'.
 */
export const MOTION_LEVELS = ['off', 'normal', 'ott'] as const;
export type MotionLevel = (typeof MOTION_LEVELS)[number];
export const MOTION_LABEL: Record<MotionLevel, string> = { off: 'OFF', normal: 'NORMAL', ott: 'FULL' };

/**
 * The motion STYLE: the character of how things behave and are drawn, on top of the amount. Each style has its own design for every
 * component (the matrix on /master). Today the setting is saved and exposed as `data-motion-style` on <body>; the designs are
 * attached cell by cell as they are chosen.
 */
export const MOTION_STYLES = ['plain', 'kinetic', 'slice', 'stars', 'zoom'] as const;
export type MotionStyle = (typeof MOTION_STYLES)[number];

export const TEXT_SCALES = ['small', 'normal', 'large'] as const;
export type TextScale = (typeof TEXT_SCALES)[number];

/** Jost is the FrissonWorks face; the others are the TYPE setting's alternatives. */
export const TYPE_STYLES = ['jost', 'italic', 'serif', 'sans', 'mono'] as const;
export type TypeStyle = (typeof TYPE_STYLES)[number];

/** How the experiment cards on the home page are drawn (chosen on /cards). */
export const CARD_STYLES = ['line', 'index', 'spotlight', 'tilt', 'echo'] as const;
export type CardStyle = (typeof CARD_STYLES)[number];

/** How the categories on the home page are laid out (chosen on /landing). */
export const LANDING_STYLES = ['index', 'cards', 'poster', 'compact', 'directory', 'split', 'accordion', 'wall'] as const;
export type LandingStyle = (typeof LANDING_STYLES)[number];

/** The welcome at the top of the home page (chosen on /landing). */
export const WELCOME_STYLES = ['full', 'compact', 'off'] as const;
export type WelcomeStyle = (typeof WELCOME_STYLES)[number];

/** How a hero title (the huge name behind the text) is drawn (chosen on /hero-titles). */
export const HERO_STYLES = [
  'mist', 'radiance', 'airbrush', 'smoke', 'veil', 'glass', 'satin', 'mirror', 'aurora', 'prism', 'slice', 'depth', 'longshade',
] as const;
export type HeroStyle = (typeof HERO_STYLES)[number];

/** The TITLES style setting: one of the designs, or AUTO = the one the motion style suggests (STYLE_HERO). */
export const HERO_CHOICES = ['auto', ...HERO_STYLES] as const;
export type HeroSetting = (typeof HERO_CHOICES)[number];

/** The hero each motion style suggests (the Hero title row of the matrix on /master). */
export const STYLE_HERO: Record<MotionStyle, HeroStyle> = {
  plain: 'mirror',
  kinetic: 'veil',
  slice: 'slice',
  stars: 'airbrush',
  zoom: 'depth',
};

/** The hero title that is actually drawn: the chosen design, or the style's suggestion for AUTO. */
export function resolveHero(s: { hero: HeroSetting; style: MotionStyle }): HeroStyle {
  return s.hero === 'auto' ? STYLE_HERO[s.style] : s.hero;
}

/** How big the hero titles are: HUGE is today's size, OFF draws no hero (a plain Vogue title instead). */
export const HERO_SIZES = ['huge', 'large', 'small', 'off'] as const;
export type HeroSize = (typeof HERO_SIZES)[number];
export const HERO_SCALE: Record<HeroSize, number> = { huge: 1, large: 0.7, small: 0.45, off: 0 };

/** A hero's font size in px for a design size (e.g. 150), 0 when titles are off. */
export const heroPx = (size: HeroSize, base: number) => Math.round(base * HERO_SCALE[size]);

/** How a comment box lights up while you write in it (chosen on /backgrounds). */
export const GLOW_STYLES = ['none', 'line', 'spotlight', 'mesh', 'gradient', 'aurora', 'stars'] as const;
export type GlowStyle = (typeof GLOW_STYLES)[number];

export interface DisplaySettings {
  light: boolean;
  skin: Skin;
  /** The amount (OFF, NORMAL, FULL). */
  motion: MotionLevel;
  /** The style (plain, kinetic, slice, stars, zoom). */
  style: MotionStyle;
  text: TextScale;
  type: TypeStyle;
  bgEngine: BgEngine;
  bgIntensity: BgIntensity;
  /** The halo behind text. On by default; OFF is an accessibility opt-out. */
  shadow: boolean;
  card: CardStyle;
  glow: GlowStyle;
  hero: HeroSetting;
  heroSize: HeroSize;
  landing: LandingStyle;
  welcome: WelcomeStyle;
}

export const DEFAULT_SETTINGS: DisplaySettings = {
  light: false,
  skin: 'ocean',
  motion: 'normal',
  style: 'plain',
  text: 'normal',
  type: 'jost',
  bgEngine: 'off',
  bgIntensity: 'core',
  shadow: true,
  card: 'line',
  glow: 'stars',
  hero: 'auto',
  heroSize: 'huge',
  landing: 'index',
  welcome: 'full',
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
    style: includes(MOTION_STYLES, r.style) ? r.style : d.style,
    text: includes(TEXT_SCALES, r.text) ? r.text : d.text,
    type: includes(TYPE_STYLES, r.type) ? r.type : d.type,
    bgEngine: typeof r.bgEngine === 'string' ? (r.bgEngine as BgEngine) : d.bgEngine,
    bgIntensity: typeof r.bgIntensity === 'string' ? (r.bgIntensity as BgIntensity) : d.bgIntensity,
    shadow: typeof r.shadow === 'boolean' ? r.shadow : d.shadow,
    card: includes(CARD_STYLES, r.card) ? r.card : d.card,
    glow: includes(GLOW_STYLES, r.glow) ? r.glow : d.glow,
    hero: includes(HERO_CHOICES, r.hero) ? r.hero : d.hero,
    heroSize: includes(HERO_SIZES, r.heroSize) ? r.heroSize : d.heroSize,
    landing: includes(LANDING_STYLES, r.landing) ? r.landing : d.landing,
    welcome: includes(WELCOME_STYLES, r.welcome) ? r.welcome : d.welcome,
  };
}

/** The next value in a list, wrapping round: what a tap on a settings row does. */
export function nextOf<T>(list: readonly T[], current: T): T {
  return list[(list.indexOf(current) + 1) % list.length];
}
