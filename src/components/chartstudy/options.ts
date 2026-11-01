/**
 * File: src/components/chartstudy/options.ts
 * Description: The 30 chart elements of the Chart Elements Study, as data (pure TypeScript). Three families of ten:
 * Dot (A), Square (B) and Stacked segment (C). The drawing of each lives in src/components/chartstudy/families/,
 * keyed by the same id. Every element is see-through (low-alpha tint, backdrop blur, a thin bright inner edge),
 * never faded by lowering opacity.
 */
export type ChartFamily = 'dot' | 'square' | 'stacked';

export interface ChartOption {
  /** "A01" to "C10". */
  id: string;
  family: ChartFamily;
  /** "01" to "10": the position inside its family row. */
  number: string;
  name: string;
  /** Short support label: category · what it does. */
  tag: string;
  /** One or two sentences under the sample. */
  description: string;
}

export const FAMILIES: { id: ChartFamily; letter: 'A' | 'B' | 'C'; label: string; note: string }[] = [
  { id: 'dot', letter: 'A', label: 'Dot', note: 'Height is vertical position on a hairline baseline.' },
  { id: 'square', letter: 'B', label: 'Square', note: 'Tiles rise from a shared baseline as bars.' },
  { id: 'stacked', letter: 'C', label: 'Stacked segment', note: 'One segment per unit, climbing from the baseline.' },
];

const o = (id: string, family: ChartFamily, name: string, tag: string, description: string): ChartOption => ({
  id,
  family,
  number: id.slice(1),
  name,
  tag,
  description,
});

export const CHART_OPTIONS: ChartOption[] = [
  /* A · Dot */
  o('A01', 'dot', 'Plain core', 'Baseline · Halo', 'A star: a soft core, tapering rays and a glass halo that fades out by itself. The reference the others are judged against.'),
  o('A02', 'dot', 'Sparkle', 'Flash · Entry', 'A four-point star flashes on the dot once as it arrives, then the dot is still.'),
  o('A03', 'dot', 'Twinkle', 'Flicker · Random', 'The dot flares and dims, with a random 3 to 6 second gap between pulses.'),
  o('A04', 'dot', 'Ignition', 'Flare · Cool down', 'The dot flares bright, then cools to a steady glow over 600ms.'),
  o('A05', 'dot', 'Electric core', 'Electric · Arc flash', 'Two or three thin jagged arcs jump off the dot and flicker.'),
  o('A06', 'dot', 'Halo ring', 'Ring · Entry', 'A thin ring expands out of the dot once, then fades.'),
  o('A07', 'dot', 'Glass lens', 'Glass · Rim', 'A translucent disc with blur behind it. Its rim is far fainter than its inside.'),
  o('A08', 'dot', 'Comet', 'Trail · Direction', 'A short fading trail points back along the series, toward the previous value.'),
  o('A09', 'dot', 'Breath', 'Halo · 4s cycle', 'The halo grows and shrinks on a slow four-second cycle, a beat later for each dot.'),
  o('A10', 'dot', 'Spark burst', 'Particles · Entry', 'Six tiny particles leave the dot once as it arrives, then fade.'),

  /* B · Square */
  o('B01', 'square', 'Plain tile', 'Baseline · Edge', 'A small rounded square, a see-through gradient lit from the top. No border.'),
  o('B02', 'square', 'Lit edge', 'Backlit · Top edge', 'The top of the tile is backlit, like a panel with light behind it, and breathes slowly.'),
  o('B03', 'square', 'Ignition bar', 'Flash · Settle', 'The tile flashes bright as it arrives, then settles into its tint.'),
  o('B04', 'square', 'Scan', 'Line · Entry', 'A thin line of light sweeps down through the tile once.'),
  o('B05', 'square', 'Electric edge', 'Electric · Arc outline', 'The outline is a thin jagged arc that flickers between two shapes.'),
  o('B06', 'square', 'Glass pane', 'Glass · Streak', 'A blurred, translucent tile with a diagonal streak of light that passes through.'),
  o('B07', 'square', 'Pulse stack', 'Pulse · Series', 'Tiles light one after another along the series, then rest and go again.'),
  o('B08', 'square', 'Sparkle corner', 'Sparkle · Corner', 'A four-point sparkle sits on one corner and twinkles slowly.'),
  o('B09', 'square', 'Heat', 'Colour · Value', 'The tint runs from cool to warm as the value rises, and the warm ones glow more.'),
  o('B10', 'square', 'Dust fill', 'Fill · Particles', 'The tint fills from the bottom, with fine particles drifting off the top edge.'),

  /* C · Stacked segment */
  o('C01', 'stacked', 'Plain segments', 'Baseline · 2px gap', 'A stack of thin, translucent segments with a two pixel gap.'),
  o('C02', 'stacked', 'Continuous bar', 'No gaps · Hairlines', 'The same stack with no gaps, only hairline dividers between the segments.'),
  o('C03', 'stacked', 'Ignition rise', 'Light · Baseline up', 'Segments light one by one from the baseline upward as the stack arrives.'),
  o('C04', 'stacked', 'Electric stack', 'Electric · Edge arc', 'A thin arc runs up the edge of the stack and flickers.'),
  o('C05', 'stacked', 'Glass column', 'Glass · Streak', 'One blurred translucent column with a streak of light that rises through it.'),
  o('C06', 'stacked', 'Sparkle top', 'Sparkle · Top segment', 'A four-point sparkle sits on the top segment and twinkles slowly.'),
  o('C07', 'stacked', 'Gradient fill', 'Gradient · No segments', 'One continuous column, cyan at the baseline to violet at the top of the scale.'),
  o('C08', 'stacked', 'Pulse climb', 'Pulse · Climb', 'A pulse of light climbs the stack, then fades out at the top.'),
  o('C09', 'stacked', 'Dust column', 'Particles · Rise', 'Fine particles rise off the top of a column that thins out toward its crown.'),
  o('C10', 'stacked', 'Thin needles', 'Spectrum · 1px lines', 'The stack is one-pixel lines of light, like a spectrum, shimmering at the top.'),
];
