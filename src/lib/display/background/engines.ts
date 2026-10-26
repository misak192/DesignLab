/**
 * File: src/lib/display/background/engines.ts (from LoreLyst)
 * Description: The list of backgrounds and the three intensity words, shared by the provider (which stores the
 * choice), the Nexus panel (which shows it) and the host (which draws it).
 *
 * BG in the panel reads "WHISPER MARBLE": the first word is the INTENSITY, the second the BACKGROUND, and each
 * is its own tap target. The motion setting (MOTION) is separate: it decides how much any background moves.
 */

export type BgEngine =
  | "off" | "scenery"
  | "marble" | "radiance" | "aurora" | "glass" | "galaxy" | "orbs"
  | "ink" | "rhythm" | "bokeh";

export type BgIntensity = "whisper" | "core" | "impact";

/** In the order the BG control cycles through them. */
export const BG_ENGINES: BgEngine[] = [
  "scenery", "marble", "radiance", "aurora", "glass", "galaxy", "orbs", "ink", "rhythm", "bokeh", "off",
];

export const BG_LABEL: Record<BgEngine, string> = {
  off: "OFF",
  scenery: "SCENERY",
  marble: "MARBLE",
  radiance: "RADIANCE",
  aurora: "AURORA WAVES",
  glass: "GLASS PANELS",
  galaxy: "NEXUS",
  orbs: "ORBS",
  ink: "INK",
  rhythm: "KINETIC RHYTHM",
  bokeh: "PARALLAX BOKEH",
};

export const BG_INTENSITIES: BgIntensity[] = ["whisper", "core", "impact"];

/** How much of the picture shows over the page. IMPACT stops at 80%: there is text on the screen, and 100% is too much. */
export const INTENSITY_STRENGTH: Record<BgIntensity, number> = { whisper: 0.3, core: 0.55, impact: 0.8 };

/** SCENERY's own scale, the three levels the photograph always had (its LOW, MID and HIGH). */
export type PhotoLevel = "low" | "mid" | "high";
export const PHOTO_LEVEL: Record<BgIntensity, PhotoLevel> = { whisper: "low", core: "mid", impact: "high" };

export const isBgEngine = (v: unknown): v is BgEngine => typeof v === "string" && (BG_ENGINES as string[]).includes(v);
export const isBgIntensity = (v: unknown): v is BgIntensity => v === "whisper" || v === "core" || v === "impact";

/** The engines that are drawn by the WebGL host (everything but OFF and the photograph). */
export const isShaderEngine = (e: BgEngine) => e !== "off" && e !== "scenery";

/**
 * Every background is STILL at rest and answers an action (a tap on the page, a page change, a node opening) for the
 * SAME time on every background and every MOTION level: ACTION_MS, a little longer than the page transition itself, so
 * by the time the new page has settled the background has too. What MOTION changes is how MUCH it moves in that time:
 *   move      the engine's clock units covered by one action (an engine's own factor scales it: orbs barely move);
 *   pageStep  how far a page change slides it;           amp  how hard a tap's pulse hits;
 *   sat       the saturation it PULSES up to and back from (1 = no pulse).
 * OFF never moves. NORMAL is a tiny nudge. COLOUR the same nudge with the colours pulsing richer and settling back.
 * OTT moves things visibly, then is still again after the same second.
 */
export const ACTION_MS = 1000;
/** How fast a page change slides, per second (about 99% there when ACTION_MS has passed). */
export const PAGE_EASE = 5;
export interface MotionFeel { move: number; pageStep: number; amp: number; sat: number }
export const MOTION_FEEL: Record<string, MotionFeel> = {
  off: { move: 0, pageStep: 0, amp: 0, sat: 1 },
  normal: { move: 1.2, pageStep: 0.35, amp: 0.8, sat: 1 },
  colour: { move: 1.2, pageStep: 0.35, amp: 0.8, sat: 1.7 },
  color: { move: 1.2, pageStep: 0.35, amp: 0.8, sat: 1.7 },
  ott: { move: 8, pageStep: 1.4, amp: 2, sat: 1 },
};

/** NEXUS draws at most this many of the visitor's stars one by one (the shader has fixed slots); the rest still brighten their cluster. */
export const MAX_STARS = 16;

/**
 * Where each pillar's cluster sits in NEXUS, as a fraction of the screen (from the left, from the top): one per
 * pillar colour slot, spread so the six read as a scatter of small galaxies round the big one. The shader and the host
 * both read this list, so a star is always drawn where its cluster is.
 */
export const CLUSTER_ANCHORS: [number, number][] = [[0.14, 0.30], [0.5, 0.13], [0.86, 0.28], [0.15, 0.76], [0.52, 0.87], [0.87, 0.75]];
