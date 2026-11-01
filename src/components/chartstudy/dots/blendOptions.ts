/**
 * File: src/components/chartstudy/dots/blendOptions.ts
 * Description: The 29 dots of the Blends page, as data (pure TypeScript), in five rows: the favourites combined, the ones
 * to fix, the pop-in, the coin stack as stacked bars, and my recommendations. Ids "01" to "29" belong to this page only.
 */
export interface BlendOption {
  id: string;
  row: number;
  name: string;
  description: string;
  /** The design plays an arrival: it replays itself every few seconds and has a Replay button. */
  replay?: boolean;
}

export const BLEND_ROWS = [
  { title: 'Favourites, combined', note: 'Shifted gradient, soft shadow, glow and airbrush, mixed. Airbrush ones take their shadow and glow from soft layers.', bars: false },
  { title: 'Fixed', note: 'A fade-down that never goes dark, a halftone with faded edges, and tint bleed with no black behind it. Switch LIGHT in the header to see it on a light page.', bars: false },
  { title: 'Pop-in', note: 'The layers pop out from the smallest core, then become one surface. The cutouts are only for arriving.', bars: false },
  { title: 'Coin stack as stacked bars', note: 'One coin is one element. Six columns of two to seven coins.', bars: true },
  { title: 'Recommended', note: 'Combinations I think look the most premium.', bars: false },
] as const;

const b = (id: string, row: number, name: string, description: string, replay = false): BlendOption => ({ id, row, name, description, replay });

export const BLEND_OPTIONS: BlendOption[] = [
  /* Favourites, combined */
  b('01', 0, 'Gradient and soft shadow', 'The shifted gradient with a wide shadow in its own off-shade.'),
  b('02', 0, 'Gradient, shadow and glow', 'The same with a glow of the lighter cousin around it.'),
  b('03', 0, 'Airbrush gradient', 'No edge, with the shifted gradient running diagonally through it.'),
  b('04', 0, 'Airbrush and shadow', 'The airbrush with a soft ellipse of the off-shade under it.'),
  b('05', 0, 'Airbrush and glow', 'The airbrush with a lit core and a halo of light.'),
  b('06', 0, 'Airbrush, all three', 'Shifted gradient, soft shadow and glow in one airbrushed dot.'),

  /* Fixed */
  b('07', 1, 'Fade down, clean', 'Thins out by transparency, so the colour stays bright to the last.'),
  b('08', 1, 'Fade down with glow', 'The clean fade with a glow rising behind the top.'),
  b('09', 1, 'Airbrush fade', 'The airbrush that also dissolves toward the bottom.'),
  b('10', 1, 'Halftone, faded edge', 'A grid of dots that dissolves toward the rim, in the shifted gradient.'),
  b('11', 1, 'Halftone on glow', 'The faded halftone laid over a soft glow of its colour.'),
  b('12', 1, 'Tint bleed', 'Pale glass in the theme’s own neutral, the colour bleeding in from one side.'),

  /* Pop-in */
  b('13', 2, 'Pop-in to gradient', 'Six layers pop out from the core, then one shifted gradient replaces them.', true),
  b('14', 2, 'Pop-in to airbrush', 'The same arrival, resting as an airbrush with no edge.', true),
  b('15', 2, 'Pop-in to gradient, shadow, glow', 'The arrival resting with soft shadow and glow.', true),
  b('16', 2, 'Pop-in of glass', 'Glass layers pop out, then merge into a pearl of tint-bleed glass.', true),

  /* Coin stack as bars */
  b('17', 3, 'Gradient coins', 'Shifted gradient on every coin, a deeper shade for the thickness.'),
  b('18', 3, 'Airbrush coins', 'Soft overlapping ellipses with no edges: a column of spray.'),
  b('19', 3, 'Tint-bleed coins', 'Pale glass coins with the colour bleeding in from the right.'),
  b('20', 3, 'Prism stack', 'The shift grows up the stack, from the deeper cousin to the lighter.'),
  b('21', 3, 'Glow on top', 'The top coin of every column is lit.'),
  b('22', 3, 'Fade to base', 'Columns dissolve toward the baseline.'),
  b('23', 3, 'Prism airbrush', 'The airbrush column with the shift growing up it.'),

  /* Recommended */
  b('24', 4, 'Ember', 'An airbrush dot that rises out of its own glow and dissolves toward the bottom.'),
  b('25', 4, 'Pearl', 'Tint-bleed glass with a sheen, the shifted gradient and a soft shadow.'),
  b('26', 4, 'Nebula', 'Two airbrush clouds in the colour’s two cousins, overlapping.'),
  b('27', 4, 'Halo', 'An airbrush core inside two feathered rings of light.'),
  b('28', 4, 'Signet', 'A gradient dot with soft shadow and glow, and halftone grain rising from its base.'),
  b('29', 4, 'Aurora', 'An airbrush dot whose colours slowly turn, at the speed MOTION allows.'),
];
