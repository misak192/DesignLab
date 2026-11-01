/**
 * File: src/components/chartstudy/types.ts
 * Description: What every one of the 30 elements receives. One shape for all three families; each family reads
 * the fields it needs (a dot ignores `h`, a stack reads `value` as its number of segments).
 */
export interface ElementProps {
  /** 2 to 20. Sets the hue along the ramp, and the height of a bar or the number of segments of a stack. */
  value: number;
  /** Position in the series (0 for the large sample). */
  index: number;
  /** Length of the series (1 for the large sample). */
  count: number;
  /** Dot diameter, tile width or column width in px. */
  w: number;
  /** Tile height in px (squares only). */
  h: number;
  /** Pixels per unit of value: vertical step of a dot, height per segment of a stack. */
  px: number;
  /** Horizontal distance between neighbours in the series. */
  pitch: number;
  /** The previous value in the series, if any. */
  prev?: number;
  /** Loops and entries may run. False under reduced motion or MOTION off: the static look is drawn instead. */
  live: boolean;
  /** The large sample (true) or an element of the series (false). */
  sample: boolean;
}
