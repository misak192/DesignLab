/**
 * File: src/components/chartstudy/dots/options.ts
 * Description: The 36 dots of the Dot Study, as data (pure TypeScript): six rows of six. Each is a single dot on its own,
 * not in a chart, and each is a different design, not one design with an effect added. All are cheap by construction:
 * CSS gradients, masks and shadows on one to a handful of elements, no backdrop-filter and no blur filter; the only motion
 * is transform and opacity. The drawing of each lives in this folder, keyed by the same id.
 */
export interface DotOption {
  /** "01" to "36". */
  id: string;
  /** Index of the row in DOT_ROWS. */
  row: number;
  name: string;
  /** One sentence: what to look at. */
  description: string;
}

export const DOT_ROWS = [
  { title: 'Colour and shadow', note: 'The dot colour shifted a little in RGB makes the gradient, and the shadow.' },
  { title: 'Glow and fade', note: 'Light in the dot’s own colour, and dots that disappear the lower they go.' },
  { title: 'Cutouts', note: 'Slices, holes, segments, wedges and a halftone, all cut out of one gradient.' },
  { title: 'Glass', note: 'A neutral glass dot with a tint of the dot colour. No blur filter, so it stays cheap.' },
  { title: '3D', note: 'A little tilt and a gradient inside: coins, a turntable, a matte ball and a stack.' },
  { title: 'Layers and motion', note: 'Papercut layers that pulse, a ring marker, a crescent and a ripple.' },
] as const;

const d = (id: string, row: number, name: string, description: string): DotOption => ({ id, row, name, description });

export const DOT_OPTIONS: DotOption[] = [
  /* Colour and shadow */
  d('01', 0, 'Flat', 'One solid colour. The reference the others are judged against.'),
  d('02', 0, 'Shifted gradient', 'The colour nudged in RGB one way and the other, as a diagonal gradient.'),
  d('03', 0, 'Radial depth', 'Lighter cousin in the middle, deeper cousin at the rim. Matte, no highlight.'),
  d('04', 0, 'Sharp shadow', 'A hard shadow in a deeper shift of the dot’s own colour.'),
  d('05', 0, 'Soft shadow', 'A wide, soft shadow in the same off-colour, falling below.'),
  d('06', 0, 'Contact and bloom', 'A sharp contact shadow under a soft coloured bloom.'),

  /* Glow and fade */
  d('07', 1, 'Glow', 'A glow in the dot’s own colour, with a tighter lighter core of light.'),
  d('08', 1, 'Fade down', 'The lower it goes, the more it disappears.'),
  d('09', 1, 'Fade and bloom', 'Dissolves downward, with a soft bloom of colour behind the top.'),
  d('10', 1, 'Airbrush', 'No edge at all: a soft spray of colour that thins out by itself.'),
  d('11', 1, 'Beacon', 'A shaft of light climbs and fades above the dot, like the glowing bars.'),
  d('12', 1, 'Aura', 'The dot with two faint rings of light around it, feathered, not drawn.'),

  /* Cutouts */
  d('13', 2, 'Slice cuts', 'Horizontal cuts that grow thicker toward the bottom, like a setting sun.'),
  d('14', 2, 'Ring', 'A hole through the middle, with a gradient around the ring.'),
  d('15', 2, 'Segmented ring', 'Twelve segments in a ring with the gradient running round it.'),
  d('16', 2, 'Arc rings', 'Three concentric arcs of different lengths, like a progress dial.'),
  d('17', 2, 'Pulled wedge', 'A wedge pulled out of the dot, like a slice of a donut chart.'),
  d('18', 2, 'Halftone', 'A grid of tiny dots that fades out toward the rim.'),

  /* Glass */
  d('19', 3, 'Neutral glass', 'A pale, translucent dot that picks up the colour only at its base.'),
  d('20', 3, 'Glass vessel', 'A neutral glass dot filled with the dot colour up to a level.'),
  d('21', 3, 'Tint bleed', 'Neutral glass with the colour bleeding in from one side.'),
  d('22', 3, 'Glass over colour', 'A neutral glass dot overlapping a coloured one, so the overlap shows tinted.'),
  d('23', 3, 'Soft raised', 'A neutral raised dot, light from the top left and shade from the bottom right.'),
  d('24', 3, 'Lit pad', 'The same raised pad with the colour lit inside it like a lamp.'),

  /* 3D */
  d('25', 4, 'Coin', 'A cylinder tilted toward you: a lit top and a gradient across the side.'),
  d('26', 4, 'Glass coin', 'The same coin in neutral glass with a tint of the colour at its base.'),
  d('27', 4, 'Turntable', 'A disc tilted back in perspective, its gradient slowly turning.'),
  d('28', 4, 'Matte ball', 'Shaded round with cousins of the colour, no gloss, with a shadow on the ground.'),
  d('29', 4, 'Capped', 'A lighter lid on the top of the dot, like the capped bars.'),
  d('30', 4, 'Coin stack', 'Three coins stacked, each pushed down by a deeper shade of the colour.'),

  /* Layers and motion */
  d('31', 5, 'Layered', 'Six nested dots, each darker and smaller, with a papercut shadow between.'),
  d('32', 5, 'Layered pulse', 'The same layers bouncing one after another, like a heartbeat.'),
  d('33', 5, 'Soft glass layers', 'Layers of neutral glass tinted deeper toward the middle, pulsing slowly.'),
  d('34', 5, 'Ring marker', 'A white ring with the colour inside, the marker on a line.'),
  d('35', 5, 'Crescent', 'A dot cut by a second dot, with a ghost of the whole behind it.'),
  d('36', 5, 'Ripple', 'A core with two soft rings spreading out and fading.'),
];
