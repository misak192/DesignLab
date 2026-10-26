/**
 * File: src/lib/hero/heroes.ts
 * Description: What the hero-title designs are, as plain data: names, tags, notes, the sample words (the project
 * names of the FrissonWorks Nexus, with their colours) and the colour maths for a tint. Pure TypeScript, no React or DOM.
 *
 * A hero title is the huge name set behind a list or a page: decoration only, never the carrier of meaning, so it is
 * always aria-hidden and the text on top keeps its own halo.
 */
import type { HeroStyle } from '@/lib/display/settings';

export const HERO_TAGS = ['Etheric', 'Light', 'Kinetic', 'Parallax', 'Colour', 'Edgy', 'Premium'] as const;
export type HeroTag = (typeof HERO_TAGS)[number];

export interface HeroInfo {
  name: string;
  tags: HeroTag[];
  /** What it looks like, in one sentence. */
  note: string;
  /** What each MOTION level does to it. */
  motion: string;
}

/** Every design is fill only: gradients and transparency, never an outline. */
export const HERO_INFO: Record<HeroStyle, HeroInfo> = {
  mist: {
    name: 'Mist',
    tags: ['Etheric'],
    note: 'Airbrushed haze. The letters are a soft gradient of light that melts away downward, so the text on top never fights it.',
    motion: 'OFF: still haze. NORMAL: it breathes. COLOUR: a slow light drifts through and the hue floats. OTT: deeper bloom, faster.',
  },
  radiance: {
    name: 'Radiance',
    tags: ['Etheric', 'Light', 'Parallax'],
    note: 'The letters are the light. Beams stream down from them as if from a source above the word; the pointer moves the source.',
    motion: 'OFF: fixed beams. NORMAL: the source sways slowly and follows the pointer. COLOUR: hue drift. OTT: more beams, wider swing.',
  },
  airbrush: {
    name: 'Airbrush',
    tags: ['Etheric'],
    note: 'Spray-paint grain: dense at the top of each letter, thinning to nothing below. Pure fill, no edge anywhere.',
    motion: 'NORMAL: one pass, breathing. COLOUR: a second pass in another colour. OTT: three passes.',
  },
  smoke: {
    name: 'Smoke',
    tags: ['Etheric', 'Kinetic'],
    note: 'Soft letters that ripple slowly, as if drawn in smoke. Never quite still, never sharp.',
    motion: 'OFF: a frozen wisp. NORMAL: slow ripple. OTT: it churns.',
  },
  veil: {
    name: 'Veil',
    tags: ['Kinetic', 'Etheric'],
    note: 'Letters surface out of the mist one after another, then keep breathing in a slow wave that runs along the word.',
    motion: 'OFF: already there. NORMAL: calm arrival. OTT: fast, from further away. Use Replay to see it again.',
  },
  glass: {
    name: 'Glass',
    tags: ['Premium'],
    note: 'Frosted glass: a gloss on top of each letter, a little thickness below, and a highlight that passes through now and then.',
    motion: 'OFF: no highlight. NORMAL: a slow pass with long pauses. COLOUR: the tint drifts. OTT: two sharper passes.',
  },
  satin: {
    name: 'Satin',
    tags: ['Premium', 'Colour'],
    note: 'Brushed metal in the project colour (gold for Studio): bands of light and shade across the fill, a raised edge of light, a slow sheen.',
    motion: 'OFF: still metal. NORMAL: a broad sheen crosses it. OTT: the sheen is quick and sharp.',
  },
  mirror: {
    name: 'Mirror',
    tags: ['Premium'],
    note: 'The word stands on a floor. Its reflection fades away underneath, with a soft glow at the base.',
    motion: 'Only the glow breathes; the reflection is the design. Needs a little more room below.',
  },
  aurora: {
    name: 'Aurora',
    tags: ['Colour', 'Etheric'],
    note: 'Clouds of colour drift inside the letters and fade out toward the bottom.',
    motion: 'OFF and NORMAL: a still colour wash. COLOUR: the clouds drift. OTT: faster, with a bloom.',
  },
  prism: {
    name: 'Prism',
    tags: ['Edgy', 'Colour', 'Parallax'],
    note: 'Three fills in three colours, a hair out of register. Where they overlap the light adds up. The pointer pulls them apart.',
    motion: 'NORMAL: the pointer splits the colours. COLOUR: they drift on their own. OTT: wide split and torn slices.',
  },
  slice: {
    name: 'Slice',
    tags: ['Edgy', 'Parallax'],
    note: 'The word is cut on one line, with a hairline gap. The halves slide against each other as you scroll and meet when you are centred on it.',
    motion: 'NORMAL: slides with scroll, a little with the pointer. OTT: slides much further. OFF: stays cut and still.',
  },
  depth: {
    name: 'Depth',
    tags: ['Parallax'],
    note: 'Five to seven layers at different distances; the far ones are out of focus. Pointer and scroll move them by different amounts.',
    motion: 'Parallax is the level’s own number: ×1 NORMAL, ×2.6 OTT. OFF: the layers sit still, stacked.',
  },
  longshade: {
    name: 'Long shadow',
    tags: ['Edgy', 'Parallax'],
    note: 'A long soft shadow trails from the letters, dense at the word and thinning out. The pointer turns the light, so the shadow swings.',
    motion: 'OFF: a fixed shadow. NORMAL: it follows the pointer. OTT: longer shadow, wider swing.',
  },
};

/** The sample words: project names from the Nexus, with their colour, tagline and three example rows. */
export interface HeroWord {
  word: string;
  /** The project colour (Nexus). */
  colour: string;
  about: string;
  rows: { t: string; d: string }[];
}

export const HERO_WORDS: HeroWord[] = [
  {
    word: 'Lorelyst', colour: '#8fd3b6', about: 'The wisdom game.',
    rows: [
      { t: 'Welcome Page', d: 'Scroll story' },
      { t: 'Wisdom Game', d: 'Concept summary and action plan' },
      { t: 'LoreLyst Features', d: 'Feature list' },
    ],
  },
  {
    word: 'Frissonworks', colour: '#b8c0d4', about: 'The ecosystem behind the apps.',
    rows: [
      { t: 'FrissonWorks Design', d: 'Shared design language' },
      { t: 'Brain · Trust & Moderation', d: 'FW Brain' },
      { t: 'Comments · Design', d: 'FW Comments' },
    ],
  },
  {
    word: 'Actionlyst', colour: '#c792ea', about: 'The swipe-to-log app.',
    rows: [
      { t: 'ActionLyst Analytics', d: 'Every number and sentence, one map' },
      { t: 'ActionLyst Design', d: 'The visual spec' },
      { t: 'VERSUS', d: 'Stats comparison mode' },
    ],
  },
  {
    word: 'Observalyst', colour: '#7fd1e8', about: 'Watching what you do.',
    rows: [
      { t: 'ObservaLyst Overview', d: 'Master overview' },
      { t: 'Ladder', d: 'The idea, step by step' },
      { t: 'Decisions', d: 'What is settled' },
    ],
  },
  {
    word: 'Studio', colour: '#e9c46a', about: 'Visual experiments and specimens.',
    rows: [
      { t: 'Matrix Rain Studio', d: 'Digital rain playground' },
      { t: 'Gold Flake Marble', d: 'Background study' },
      { t: 'RAG Specimen Sheet', d: 'Colour specimens' },
    ],
  },
];

/** The three colours a hero title draws with. Every one is a CSS colour (a var or a color-mix), never alpha. */
export interface HeroTint {
  c1: string;
  c2: string;
  c3: string;
}

/** The skin's own T1, T2, T3: the default, so a hero follows whichever skin is chosen. */
export const SKIN_TINT: HeroTint = { c1: 'var(--t1)', c2: 'var(--t2)', c3: 'var(--t3)' };

/**
 * A tint led by one project colour, with the skin's T2 and T3 mixed in so the three colours still differ.
 * On a light page the colour is darkened with black, as the Nexus does, so it reads against the canvas.
 */
export function projectTint(colour: string, light: boolean): HeroTint {
  const c1 = light ? `color-mix(in oklab, ${colour} 55%, #000)` : colour;
  return {
    c1,
    c2: `color-mix(in oklab, ${c1} 40%, var(--t2))`,
    c3: `color-mix(in oklab, ${c1} 40%, var(--t3))`,
  };
}
