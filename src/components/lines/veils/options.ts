/**
 * File: src/components/lines/veils/options.ts
 * Description: The 56 veils of the Veils page, as data (pure TypeScript), in eight groups. A veil is not a line: it is a big soft area of
 * colour (always horizontal), the kind of highlighted area that sits behind words. Each is drawn behind the words "ES Employment" so it can
 * be judged as a highlight. The drawing of each lives in this folder, keyed by the same id.
 */
export interface VeilOption {
  /** "V01" to "V56". */
  id: string;
  group: number;
  name: string;
  description: string;
  /** You can press it. */
  interactive?: boolean;
}

export const VEIL_GROUPS = [
  { letter: 'A', title: 'Airbrush and aurora', note: 'Big soft areas with no edge: haze, cloud, aurora, nebula, dusk, horizon, spotlight.' },
  { letter: 'B', title: 'Halftone and texture', note: 'A veil given a grain: dots that fade at the edges, dust, scanlines, hatching, tiles.' },
  { letter: 'C', title: 'Glass', note: 'Clear glass in the theme’s own neutral with a tint of the colour. The clear end dissolves into the page.' },
  { letter: 'D', title: 'Highlighters', note: 'A thick stroke behind words: marker, brush swipe, underline, neon, torn edge.' },
  { letter: 'E', title: 'Dissipating', note: 'A veil that thins out: one way, into dots, into smoke, rising like heat, fraying into strands.' },
  { letter: 'F', title: 'Light and colour', note: 'Sunrise, light leaks, prisms, aurora curtains, god rays, bokeh, film burn.' },
  { letter: 'G', title: 'Stars', note: 'Veils made of stars. V49 can be pressed: the stars fly apart, then gather again.' },
  { letter: 'H', title: 'Recommended', note: 'Combinations I would use.' },
] as const;

const o = (id: string, group: number, name: string, description: string, extra: Partial<VeilOption> = {}): VeilOption => ({ id, group, name, description, ...extra });

export const VEIL_OPTIONS: VeilOption[] = [
  /* A · Airbrush and aurora */
  o('V01', 0, 'Airbrush veil', 'A big soft area in the shifted gradient with a lighter heart. The default look.'),
  o('V02', 0, 'Mist', 'Very wide and faint, spilling past its box, with no heart.'),
  o('V03', 0, 'Cloud', 'Two soft clouds, the lighter and the deeper cousin, drifting into each other.'),
  o('V04', 0, 'Aurora veil', 'Two gradients that slowly trade places, so the colours move through the haze.'),
  o('V05', 0, 'Nebula', 'Three blobs of colour and a few bright knots, like a gas cloud.'),
  o('V06', 0, 'Dusk', 'Strong along the bottom and rising into nothing, like the sky after sunset.'),
  o('V07', 0, 'Horizon', 'A bright band low in the box, glowing up and down from a thin line of light.'),
  o('V08', 0, 'Spotlight', 'A pool of light, white at the centre and the colour out to the rim.'),

  /* B · Halftone and texture */
  o('V09', 1, 'Halftone, faded edge', 'A grid of dots that dissolves toward every side.'),
  o('V10', 1, 'Big dots', 'A coarse halftone, dots the size of peas, thinning to an oval.'),
  o('V11', 1, 'Dust', 'A fine mist of grains, thick in the middle and thin at the rim.'),
  o('V12', 1, 'Scanlines', 'A veil cut by fine horizontal lines, like a screen.'),
  o('V13', 1, 'Hatch', 'Diagonal pen strokes that fade out toward the edges.'),
  o('V14', 1, 'Mosaic', 'Square tiles with hairline gaps, the colour thinning at the edges.'),

  /* C · Glass */
  o('V15', 2, 'Glass veil', 'A pane of pale glass with the colour gathering at its foot, a sheen across the top and a soft shadow.'),
  o('V16', 2, 'Tint bleed', 'Clear glass on the left with the colour bleeding in from the right; the clear end dissolves.'),
  o('V17', 2, 'Frosted', 'A faint milky pane with a lighter heart, the edges gone.'),
  o('V18', 2, 'Glass over colour', 'A pane of glass laid over a cloud of colour and offset from it, so the overlap shows tinted.'),
  o('V19', 2, 'Ice', 'A cold, clear pane brightened toward blue-white, with a bright edge of light along the top.'),
  o('V20', 2, 'Pane stack', 'Three panes of glass, each a little off the one behind, building up where they overlap.'),

  /* D · Highlighters */
  o('V21', 3, 'Marker', 'A flat thick stroke with slightly skewed ends, a little darker along its foot.'),
  o('V22', 3, 'Brush swipe', 'An uneven edge and the streaks of the bristles running through it.'),
  o('V23', 3, 'Double swipe', 'Two strokes, one over the other, in the lighter and the deeper cousin.'),
  o('V24', 3, 'Underline swipe', 'Only the lower part, tilted a little, as a pen underlines a line of words.'),
  o('V25', 3, 'Spotlight highlight', 'A softly lit rounded area with a glow around it, the words as if lit from behind.'),
  o('V26', 3, 'Neon marker', 'A bright stroke that glows past its own edge.'),
  o('V27', 3, 'Pastel marker', 'A pale, milky stroke with softened ends.'),
  o('V28', 3, 'Torn', 'A stroke with ragged top and bottom edges, like a strip of torn paper.'),

  /* E · Dissipating */
  o('V29', 4, 'Fade right', 'Full on the left, gone before the right edge.'),
  o('V30', 4, 'Fade left', 'The same, the other way.'),
  o('V31', 4, 'Lens', 'Thickest in the middle, thinning to nothing on every side.'),
  o('V32', 4, 'Fade down', 'Full along the top and gone toward the bottom, like light through a blind.'),
  o('V33', 4, 'Dissolve', 'Solid at one end, then big dots, then small dots, then nothing at the other.'),
  o('V34', 4, 'Smoke', 'Four layers, each shorter and fainter than the one behind, so the colour disperses in steps.'),
  o('V35', 4, 'Evaporate', 'Wisps of the veil lift off it one after another, rising and thinning like heat.'),
  o('V36', 4, 'Fray', 'The right of the veil comes apart into strands of different lengths.'),

  /* F · Light and colour */
  o('V37', 5, 'Sunrise', 'Bands of amber, magenta and violet rising out of the bottom edge into nothing.'),
  o('V38', 5, 'Light leak', 'Warm light spilling in from the left edge, with a thin streak across it.'),
  o('V39', 5, 'Prism', 'Three copies of the veil, the deeper cousin, the colour and the lighter cousin, laid a little apart.'),
  o('V40', 5, 'Aurora curtains', 'Soft vertical bands of changing colour hanging from the top, swaying a little.'),
  o('V41', 5, 'God rays', 'Slanting beams of light through a soft glow, strongest at the top.'),
  o('V42', 5, 'Bokeh', 'Soft discs of out-of-focus light in the colour and its cousins.'),
  o('V43', 5, 'Film burn', 'The film’s edge scorched orange and yellow, thinning into the picture.'),
  o('V44', 5, 'Glow bar', 'A lit block of colour with its light spilling all round it.'),

  /* G · Stars */
  o('V45', 6, 'Starlit veil', 'A soft veil with a field of stars through it.'),
  o('V46', 6, 'Dust of stars', 'A haze of hundreds of tiny grains, thick in the middle. One element.'),
  o('V47', 6, 'Twinkle', 'Two star fields that take turns, and a couple of stars that flash with a glint.'),
  o('V48', 6, 'Drift', 'Two layers of stars slide past behind a glow, with no seam.'),
  o('V49', 6, 'Press: veil of stars', 'A veil of nothing but stars. Press it and the stars fly apart; then they gather again.', { interactive: true }),

  /* H · Recommended */
  o('V50', 7, 'Silk', 'The pale blurred bar of the timeline, big: a pillow of light tinted by the shifted gradient.'),
  o('V51', 7, 'Aurora silk', 'The aurora veil with a pale silk heart.'),
  o('V52', 7, 'Glass aurora', 'A pane of glass laid over the aurora veil, offset from it.'),
  o('V53', 7, 'Ember', 'Dusk rising from the bottom edge with a hot line along it and sparks lifting off.'),
  o('V54', 7, 'Soft highlighter', 'A highlighter stroke made airbrush: rounded, the gradient inside it, its edges breathing out.'),
  o('V55', 7, 'Dusk glass', 'Clear glass over a dusk of colour, the colour showing through its lower half.'),
  o('V56', 7, 'Halftone aurora', 'A halftone veil whose colours trade places slowly, with a soft glow beneath it.'),
];
