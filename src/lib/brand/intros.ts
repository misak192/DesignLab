/**
 * File: src/lib/brand/intros.ts
 * Description: Twenty variations of the FrissonWorks intro, as data (pure TypeScript). The story is always the same:
 * "FW" appears with the W raised like a superscript; the W settles to the baseline while "risson" and "orks" unfold
 * around it; "presents" arrives below; then the app reel lands on the current app. A variation changes how each step moves.
 */
export type EnterKind = 'fade' | 'rise' | 'blur' | 'zoom' | 'drop' | 'slit' | 'tracking';
export type GrowKind = 'width' | 'roll' | 'scatter' | 'type' | 'blur' | 'drop' | 'wave' | 'rise' | 'tracking';
export type PresentsKind = 'fade' | 'track' | 'type' | 'rise' | 'blur';
export type TravelKind = 'ease' | 'spring' | 'arc';
export type ToneKind = 'ink' | 'split' | 'app';

export interface IntroVariant {
  id: number;
  name: string;
  note: string;
  enter: EnterKind;
  grow: GrowKind;
  presents: PresentsKind;
  travel: TravelKind;
  tone: ToneKind;
  /** Seconds: FW alone, the unfold, "presents" (each is how long the step takes). */
  t: [number, number, number];
  /** Vogue-thin weight and wide tracking instead of Medium. */
  thin?: boolean;
  /** Index into REEL_VARIANTS (1-based id) used for the final reel. */
  reel: number;
}

const i = (
  id: number,
  name: string,
  note: string,
  enter: EnterKind,
  grow: GrowKind,
  presents: PresentsKind,
  o: Partial<IntroVariant> = {}
): IntroVariant => ({ id, name, note, enter, grow, presents, travel: 'ease', tone: 'split', t: [0.7, 0.9, 0.6], reel: 1, ...o });

export const INTROS: IntroVariant[] = [
  i(1, 'Unfold', 'The word opens out of FW, the W sinks to the baseline.', 'fade', 'width', 'fade'),
  i(2, 'Roll', 'Every letter rolls in from below like a drum.', 'rise', 'roll', 'rise', { reel: 9 }),
  i(3, 'Spring W', 'The W drops with a bounce while the word unfolds.', 'fade', 'width', 'fade', { travel: 'spring', reel: 3 }),
  i(4, 'Gather', 'Letters fly in from all sides and gather.', 'blur', 'scatter', 'blur', { reel: 2 }),
  i(5, 'Blur rise', 'Everything rises out of a soft blur.', 'blur', 'blur', 'blur', { tone: 'ink', reel: 2 }),
  i(6, 'Typewriter', 'The letters are typed in, "presents" too.', 'fade', 'type', 'type', { reel: 5, t: [0.6, 1.1, 0.7] }),
  i(7, 'Slit', 'FW opens from a thin slit of light.', 'slit', 'width', 'fade', { reel: 8 }),
  i(8, 'Zoom through', 'FW comes from close up and settles.', 'zoom', 'width', 'track', { reel: 16 }),
  i(9, 'Star dust', 'The letters condense out of a glow.', 'blur', 'blur', 'blur', { tone: 'app', reel: 3 }),
  i(10, 'Tracking', 'Wide letter-spacing collapses into the word.', 'tracking', 'tracking', 'track', { thin: true, reel: 4 }),
  i(11, 'Hairline', 'Vogue thin: the lightest weight, very wide.', 'fade', 'width', 'track', { thin: true, tone: 'ink', t: [0.9, 1.1, 0.7], reel: 13 }),
  i(12, 'Drop', 'The letters fall and land one after another.', 'drop', 'drop', 'rise', { travel: 'spring', reel: 7 }),
  i(13, 'Wave', 'A wave runs through the letters.', 'rise', 'wave', 'fade', { reel: 1 }),
  i(14, 'Roll up', 'Letters scroll up out of a clipped window.', 'rise', 'rise', 'rise', { reel: 4 }),
  i(15, 'Cinematic', 'Slow, long steps; the W takes an arc.', 'fade', 'width', 'track', { travel: 'arc', t: [1.1, 1.4, 1], reel: 10 }),
  i(16, 'Snap', 'Quick: under three seconds in all.', 'fade', 'width', 'fade', { t: [0.35, 0.5, 0.35], reel: 6 }),
  i(17, 'Arc W', 'The W swings in a high arc down to its place.', 'fade', 'roll', 'fade', { travel: 'arc', reel: 12 }),
  i(18, 'One tone', 'Everything in plain ink, only the reel has colour.', 'rise', 'width', 'fade', { tone: 'ink', reel: 20 }),
  i(19, 'App colour', 'The whole word takes the current app colour.', 'zoom', 'width', 'blur', { tone: 'app', reel: 1 }),
  i(20, 'Scatter and scramble', 'Letters gather, the reel scrambles into the name.', 'blur', 'scatter', 'type', { reel: 18 }),
];
