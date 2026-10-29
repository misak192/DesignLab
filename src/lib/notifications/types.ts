/**
 * File: src/lib/notifications/types.ts
 * Description: Types, tuning parameters, dual-sign archetypes, and word-by-word stream presets
 * for the borderless spatial typographic notification lab.
 */

export type DisappearanceMode =
  | 'infinite-grow'      // Text surges straight toward the camera, growing so big that it is gone
  | 'ethereal-dissipate' // Text arrives at focal clarity, lingers, then dissolves into radiant gaussian mist
  | 'stardust-split'     // Characters spread wide apart and vaporize like distant stars
  | 'horizon-sink'       // Surges in then plunges backward into the deep canvas horizon
  | 'dimensional-warp';  // 3D angular tilt slingshotting past the viewer

export type NotificationEasing =
  | 'warp-accel'    // Heavy exponential acceleration curve (calm entrance -> explosive breach)
  | 'luxe-sine'      // FrissonWorks signature cubic-bezier(0.22, 1, 0.36, 1) long-settling ease
  | 'snappy-spring'  // Kinetic overshoot spring
  | 'slingshot'      // Deep pull-back that whips forward
  | 'linear-glide';  // Hypnotic constant-velocity drift

export type ColorTone = 't1' | 't2' | 't3' | 'gradient' | 'ink' | 'aurora';

/**
 * Fine-grained tuning parameters controlled by the rotary knobs.
 */
export interface TuningParams {
  /** Overall intensity (0.05 to 1.0): drives Z-travel, halo bloom, and energy */
  intensity: number;
  /** Milliseconds between each sign / word spawning (100ms to 1000ms) */
  cadenceMs: number;
  /** Flight duration of each individual sign in seconds (0.8s to 4.5s) */
  durationSec: number;
  /** Maximum scale reached when flying through the screen (1.2x to 32x) */
  maxScale: number;
  /** Vertical stack offset (px) for the sign behind the front sign (-60px to +60px) */
  stackOffsetY: number;
  /** Optical blur / dissipation mist at departure (0px to 44px) */
  blurPx: number;
}

export const DEFAULT_TUNING: TuningParams = {
  intensity: 0.72,
  cadenceMs: 360,
  durationSec: 2.3,
  maxScale: 14,
  stackOffsetY: -18,
  blurPx: 20,
};

/**
 * A single flying sign within a multi-sign or word-by-word sequence.
 * Earlier signs (lower index) have higher zIndex so the front sign partially covers the sign behind it.
 */
export interface FlySign {
  id: string;
  text: string;
  kicker?: string;
  /** 0 = first sign (topmost z-index), 1 = second sign (behind first), etc. */
  index: number;
  total: number;
  delayMs: number;
  durationSec: number;
  maxScale: number;
  blurPx: number;
  stackOffsetY: number;
  disappearance: DisappearanceMode;
  easing: NotificationEasing;
  tone: ColorTone;
  intensity: number;
}

export interface ArchetypeConfig {
  id: string;
  kicker: string;
  name: string;
  tagline: string;
  description: string;
  disappearance: DisappearanceMode;
  easing: NotificationEasing;
  tone: ColorTone;
  followUpText: string;
}

export const DEFAULT_FOLLOW_UP = 'You are doing so well!';

export const ARCHETYPES: ArchetypeConfig[] = [
  {
    id: 'warp-breach',
    kicker: '01 · Breach',
    name: 'Warp Breach',
    tagline: 'Grows so huge it flies past you',
    description: 'First sign surges forward and expands to immense scale while "You are doing so well!" emerges right behind it.',
    disappearance: 'infinite-grow',
    easing: 'warp-accel',
    tone: 't1',
    followUpText: DEFAULT_FOLLOW_UP,
  },
  {
    id: 'ethereal-dissipate',
    kicker: '02 · Vapor',
    name: 'Ethereal Mist',
    tagline: 'Quiet focus & radiant evaporation',
    description: 'Glides into crisp focus in front, partially masking the second sign rising behind it before dissolving into luminous mist.',
    disappearance: 'ethereal-dissipate',
    easing: 'luxe-sine',
    tone: 't2',
    followUpText: DEFAULT_FOLLOW_UP,
  },
  {
    id: 'orbital-slingshot',
    kicker: '03 · Orbit',
    name: 'Cosmic Slingshot',
    tagline: 'Curved 3D dimensional arc',
    description: 'Enters with a 3D rotational tilt, banking across the air above the button while uncovering the second sign behind it.',
    disappearance: 'dimensional-warp',
    easing: 'slingshot',
    tone: 't1',
    followUpText: DEFAULT_FOLLOW_UP,
  },
  {
    id: 'stardust-dispersion',
    kicker: '04 · Dust',
    name: 'Stardust Split',
    tagline: 'Wide letter scatter into light',
    description: 'Tracking expands wide as it departs, letting you glimpse "You are doing so well!" emerging through the letter gaps behind it.',
    disappearance: 'stardust-split',
    easing: 'luxe-sine',
    tone: 'aurora',
    followUpText: DEFAULT_FOLLOW_UP,
  },
  {
    id: 'sonic-monolith',
    kicker: '05 · Monolith',
    name: 'Sonic Monolith',
    tagline: 'Spring-loaded kinetic shockwave',
    description: 'Snaps into the foreground with resonant spring overshoot, shielding the trailing sign until it rockets past the screen.',
    disappearance: 'infinite-grow',
    easing: 'snappy-spring',
    tone: 'ink',
    followUpText: DEFAULT_FOLLOW_UP,
  },
  {
    id: 'horizon-sinker',
    kicker: '06 · Horizon',
    name: 'Horizon Plunge',
    tagline: 'Materializes large, sinks into depth',
    description: 'Appears close and towering in front of the second sign, then both plunge backward into the deep canvas horizon.',
    disappearance: 'horizon-sink',
    easing: 'warp-accel',
    tone: 't3',
    followUpText: DEFAULT_FOLLOW_UP,
  },
  {
    id: 'quantum-pulse',
    kicker: '07 · Phase',
    name: 'Quantum Phase',
    tagline: 'High-energy gradient breach',
    description: 'Radiant skin-gradient hero letters accelerate exponentially until they swallow the screen, revealing the praise behind.',
    disappearance: 'infinite-grow',
    easing: 'warp-accel',
    tone: 'gradient',
    followUpText: DEFAULT_FOLLOW_UP,
  },
  {
    id: 'celestial-calm',
    kicker: '08 · Luxe',
    name: 'Celestial Calm',
    tagline: 'Weightless late-night whisper',
    description: 'Ultra-gentle drift where the front title softly parts like silk smoke to unveil "You are doing so well!" behind it.',
    disappearance: 'ethereal-dissipate',
    easing: 'linear-glide',
    tone: 'ink',
    followUpText: DEFAULT_FOLLOW_UP,
  },
];

/**
 * Curated styles for long-sentence word-by-word fly-throughs.
 */
export interface WordStreamStyle {
  id: string;
  kicker: string;
  name: string;
  tagline: string;
  description: string;
  disappearance: DisappearanceMode;
  easing: NotificationEasing;
  tone: ColorTone;
  tuning: TuningParams;
}

export const WORD_STREAM_STYLES: WordStreamStyle[] = [
  {
    id: 'tunnel-train',
    kicker: 'W1 · Tunnel',
    name: 'Tunnel Train',
    tagline: 'Tight overlapping Z-stack that grows huge',
    description: 'Words queue tightly behind one another; each front word partially covers the next word until it swells huge and breaches past the camera.',
    disappearance: 'infinite-grow',
    easing: 'warp-accel',
    tone: 't1',
    tuning: {
      intensity: 0.85,
      cadenceMs: 310,
      durationSec: 2.1,
      maxScale: 18,
      stackOffsetY: -16,
      blurPx: 18,
    },
  },
  {
    id: 'velvet-cascade',
    kicker: 'W2 · Mist',
    name: 'Velvet Cascade',
    tagline: 'Layered words rising & dissolving into mist',
    description: 'Each word glides forward in crisp focus while the next word materializes softly behind it, evaporating one by one into luminous blur.',
    disappearance: 'ethereal-dissipate',
    easing: 'luxe-sine',
    tone: 't2',
    tuning: {
      intensity: 0.55,
      cadenceMs: 420,
      durationSec: 2.6,
      maxScale: 2.4,
      stackOffsetY: -22,
      blurPx: 28,
    },
  },
  {
    id: 'corkscrew-orbit',
    kicker: 'W3 · Orbit',
    name: 'Dimensional Peel',
    tagline: '3D angled word cards of pure light',
    description: 'Words stack in 3D space with rotational depth and peel away sideways past your eyes, uncovering the next word in the sentence.',
    disappearance: 'dimensional-warp',
    easing: 'slingshot',
    tone: 'gradient',
    tuning: {
      intensity: 0.8,
      cadenceMs: 350,
      durationSec: 2.2,
      maxScale: 14,
      stackOffsetY: -14,
      blurPx: 16,
    },
  },
  {
    id: 'stardust-stream',
    kicker: 'W4 · Stardust',
    name: 'Stardust Stream',
    tagline: 'Expanding letter-spacing reveals the next word',
    description: 'As the front word widens its letter tracking and scatters into light, the next word shines right through the gaps from behind.',
    disappearance: 'stardust-split',
    easing: 'luxe-sine',
    tone: 'aurora',
    tuning: {
      intensity: 0.65,
      cadenceMs: 380,
      durationSec: 2.5,
      maxScale: 4.5,
      stackOffsetY: -12,
      blurPx: 22,
    },
  },
  {
    id: 'pulse-overdrive',
    kicker: 'W5 · Rapid',
    name: 'Rapid Overdrive',
    tagline: 'High-speed stacked word burst',
    description: 'Fast 220ms cadence puts 3 to 4 words in flight simultaneously — a deep overlapping cascade rushing straight through the screen.',
    disappearance: 'infinite-grow',
    easing: 'snappy-spring',
    tone: 'ink',
    tuning: {
      intensity: 0.95,
      cadenceMs: 220,
      durationSec: 1.6,
      maxScale: 24,
      stackOffsetY: -20,
      blurPx: 14,
    },
  },
  {
    id: 'horizon-echo',
    kicker: 'W6 · Echo',
    name: 'Horizon Echo',
    tagline: 'Large foreground words sinking into deep space',
    description: 'Words appear huge in the foreground and recede into the horizon one behind another, leaving a trailing corridor of type.',
    disappearance: 'horizon-sink',
    easing: 'warp-accel',
    tone: 't3',
    tuning: {
      intensity: 0.7,
      cadenceMs: 400,
      durationSec: 2.4,
      maxScale: 10,
      stackOffsetY: 20,
      blurPx: 24,
    },
  },
];

export const SAMPLE_SENTENCES = [
  'You are doing so well and every step forward lights the path ahead',
  'The letters themselves are the light moving through quiet space',
  'Breathe deeply because your best work is unfolding right now',
  'Every word in front parts like mist to reveal the truth behind it',
];

export const INTENSITY_PRESETS = [
  { label: 'Whisper', value: 0.15, note: 'Gentle float, soft overlap' },
  { label: 'Calm', value: 0.35, note: 'Poetic ease, subtle bloom' },
  { label: 'Kinetic', value: 0.6, note: 'Balanced speed & depth stack' },
  { label: 'Surge', value: 0.85, note: 'Deep rush & big scale breach' },
  { label: 'Hyper-warp', value: 1.0, note: 'Maximum velocity & 30× breach' },
] as const;
