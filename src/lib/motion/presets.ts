/**
 * File: src/lib/motion/presets.ts
 * Description: What each MOTION level means, as numbers. Every animated thing in the lab (comments, cards, the
 * /motion page) reads its feel from here, so one switch in the Sovereign header changes all of it the same way.
 *
 *   off     nothing moves: every duration is 0, no parallax, no hover travel.
 *   normal  calm and fast: one long-settling ease, a little travel, a hint of parallax.
 *   colour  normal movement, plus colour doing the work: theme-coloured glows follow the pointer, gradients drift,
 *           colour changes (votes!) fade instead of snapping.
 *   ott     over the top: springs with overshoot, big travel, deep parallax and tilt, chromatic split on text.
 *
 * Pure TypeScript, no React or DOM, so it can move into a shared package with the letter logic.
 */
import type { Transition } from 'framer-motion';
import type { MotionLevel } from '@/lib/display/settings';

export interface MotionPreset {
  level: MotionLevel;
  /** 0 when nothing may move; multiply any duration or delay by it. */
  scale: number;
  /** The one easing, as a cubic-bezier. */
  ease: readonly [number, number, number, number];
  /** Spring for things that should bounce (null = use the ease). */
  spring: { stiffness: number; damping: number; mass: number } | null;
  /** Seconds between siblings arriving. */
  stagger: number;
  /** How far things travel on entrance, px. */
  rise: number;
  /** Entrance blur, px. */
  blur: number;
  /** Multiplier for scroll and pointer parallax (0 = none). */
  parallax: number;
  /** Max tilt of a hovered/pointed card, degrees. */
  tilt: number;
  /** Colours glow, drift and cross-fade. */
  colour: boolean;
  /** Text splits into a chromatic fringe on hover and on entrance. */
  glitch: boolean;
}

export const MOTION_PRESETS: Record<MotionLevel, MotionPreset> = {
  off: {
    level: 'off', scale: 0, ease: [0.22, 1, 0.36, 1], spring: null,
    stagger: 0, rise: 0, blur: 0, parallax: 0, tilt: 0, colour: false, glitch: false,
  },
  normal: {
    level: 'normal', scale: 1, ease: [0.22, 1, 0.36, 1], spring: null,
    stagger: 0.06, rise: 14, blur: 6, parallax: 1, tilt: 6, colour: false, glitch: false,
  },
  colour: {
    level: 'colour', scale: 1, ease: [0.22, 1, 0.36, 1], spring: null,
    stagger: 0.07, rise: 14, blur: 8, parallax: 1, tilt: 7, colour: true, glitch: false,
  },
  ott: {
    level: 'ott', scale: 1.15, ease: [0.16, 1, 0.3, 1], spring: { stiffness: 260, damping: 14, mass: 0.9 },
    stagger: 0.09, rise: 46, blur: 14, parallax: 2.6, tilt: 16, colour: true, glitch: true,
  },
};

/** One line per level, for the /motion page and the settings. */
export const MOTION_BLURB: Record<MotionLevel, string> = {
  off: 'Nothing moves. Every change is instant.',
  normal: 'Calm. One long-settling ease, a little travel, a hint of depth.',
  colour: 'Normal movement, with colour doing the work: glows follow you, changes fade through colour.',
  ott: 'Over the top. Springs that overshoot, deep parallax, big tilt, a chromatic fringe on type.',
};

/** A framer-motion transition for this level: instant when off, a spring for ott, the long ease otherwise. */
export function transitionFor(preset: MotionPreset, seconds = 0.5, delay = 0): Transition {
  if (preset.scale === 0) return { duration: 0, delay: 0 };
  if (preset.spring) return { type: 'spring', ...preset.spring, delay: delay * preset.scale };
  const [a, b, c, d] = preset.ease;
  return { duration: seconds * preset.scale, ease: [a, b, c, d], delay: delay * preset.scale };
}
