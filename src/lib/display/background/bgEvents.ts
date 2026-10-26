/**
 * File: src/lib/display/background/bgEvents.ts
 * Description: Stand-in for LoreLyst's bgEvents. The NEXUS background there draws the signed-in visitor's explained
 * topics as stars; the Design Lab has no accounts or content, so there are no stars and nothing to listen to.
 */
export interface Star {
  key: string;
  level: 0 | 1 | 2;
  pillar: number;
  ox: number;
  oy: number;
  born: number;
  boom: number;
}

export type BgEvent = { type: 'page' } | { type: 'open' } | { type: 'elime' };

const NO_STARS: Star[] = [];
const NO_COUNTS = [0, 0, 0, 0, 0, 0];

export const onBgEvent = (fn: (e: BgEvent) => void) => {
  void fn;
  return () => {};
};
export const onStarsChange = (fn: () => void) => {
  void fn;
  return () => {};
};
export const getStars = (): Star[] => NO_STARS;
export const getCounts = (): number[] => NO_COUNTS;
