/**
 * File: src/components/lines/options.ts
 * Description: The 66 line and ray designs of the Lines page, as data (pure TypeScript), in seven groups. Every design is drawn twice on
 * the page: as an event stem rising from a dot (like the timeline's event lines) and as a horizontal ray with a label on it (like the ES
 * Employment bar). The drawing of each lives in this folder, keyed by the same id.
 */
export interface LineOption {
  /** "S01" to "R10". */
  id: string;
  group: number;
  name: string;
  description: string;
  /** You can press it. */
  interactive?: boolean;
  /** It draws its own dot at the base of the stem. */
  ownDot?: boolean;
  /** A wide bar like the timeline's ES Employment: the label sits on it, not above it. */
  bar?: boolean;
}

export const LINE_GROUPS = [
  { letter: 'S', title: 'Soft and airbrush', note: 'No edge anywhere: a haze of light with a hotter core, like the airbrush dots and charts.' },
  { letter: 'N', title: 'Neon and cyberpunk', note: 'Hard bright tubes with a halo, split colours, scanlines and glitch.' },
  { letter: 'L', title: 'Lasers and sabers', note: 'A thin hot beam that lands with a flare; a white blade in a coloured glow, with its hilt.' },
  { letter: 'D', title: 'Dissipating', note: 'How the light of a line thins out: fading, smoking, breaking into dots, shedding sparks.' },
  { letter: 'T', title: 'Stars', note: 'Rays made only of stars. Press the two marked "Press" and they dissipate, then gather again.' },
  { letter: 'H', title: 'Hairlines and lit lines', note: 'The quiet lines a timeline is mostly made of: stems, the now line, rulers and runways.' },
  { letter: 'R', title: 'Recommended', note: 'Combinations I would use.' },
] as const;

const o = (id: string, group: number, name: string, description: string, extra: Partial<LineOption> = {}): LineOption => ({ id, group, name, description, ...extra });

export const LINE_OPTIONS: LineOption[] = [
  /* S · Soft and airbrush */
  o('S01', 0, 'Airbrush ray', 'A wide soft haze in the shifted gradient and a hot core. The default look.'),
  o('S02', 0, 'Mist', 'Very wide and faint, no core: a breath of colour along the line.'),
  o('S03', 0, 'Feather', 'It tapers to a point at both ends, thickest in the middle.'),
  o('S04', 0, 'Ember fade', 'Strong where it starts, gone before it ends.'),
  o('S05', 0, 'Glow stack', 'Four pills, each narrower and brighter than the last, so the glow has steps of its own.'),
  o('S06', 0, 'Nebula', 'Two airbrush clouds, the lighter and the deeper cousin, laid across each other off-centre.'),
  o('S07', 0, 'Halftone ray', 'A haze made of dots, dense in the middle and thinning to the edges.'),
  o('S08', 0, 'Pillow', 'The pale blurred bar of the timeline, with a brighter stretch in the middle.', { bar: true }),

  /* N · Neon and cyberpunk */
  o('N01', 1, 'Neon tube', 'A coloured tube, a white-hot core and a halo.'),
  o('N02', 1, 'Double neon', 'Two tubes side by side, the lighter and the deeper cousin.'),
  o('N03', 1, 'Flicker', 'A neon tube whose halo stutters like a failing transformer.'),
  o('N04', 1, 'Magenta and cyan', 'The cyberpunk split, with a halo of each colour on its own side.'),
  o('N05', 1, 'Glitch', 'The colour channels pull apart, and two stretches jump sideways now and then.'),
  o('N06', 1, 'Hologram', 'A band of light cut by scanlines, flickering faintly.'),
  o('N07', 1, 'Circuit trace', 'A line of dashes that ends in nodes.'),
  o('N08', 1, 'HUD line', 'A thin line with end blocks and a ruler of ticks.'),
  o('N09', 1, 'Neon pulse', 'A neon tube with a bright charge running along it.'),
  o('N10', 1, 'Gradient neon', 'The shifted gradient as a tube: one cousin at one end, the other at the other.'),

  /* L · Lasers and sabers */
  o('L01', 2, 'Lightsaber', 'A hilt and a blade: a white core in a coloured glow.'),
  o('L02', 2, 'Double saber', 'A hilt in the middle and a blade out of each end, in the colour and its lighter cousin.'),
  o('L03', 2, 'Laser', 'A thin hot beam that lands with a flare at its end.'),
  o('L04', 2, 'Anamorphic flare', 'A hairline with a wide streak of light across its middle and ghosts of the lens.'),
  o('L05', 2, 'Bolt train', 'Short bolts of light shot along a faint rail, one after another.'),
  o('L06', 2, 'Plasma', 'A thick beam whose light surges in bands as it passes.'),
  o('L07', 2, 'Scanner', 'A line of light that sweeps back and forth across its own width, leaving a trail.'),
  o('L08', 2, 'Spotlight', 'A cone of light that widens as it travels and thins out.'),
  o('L09', 2, 'God rays', 'Thin beams fanning out from one point, each of its own length and strength.'),
  o('L10', 2, 'Blade', 'A thin tapered blade of light with a sharp bright edge, like a katana catching a lamp.'),

  /* D · Dissipating */
  o('D01', 3, 'Fade out', 'A tube that is strong where it starts and gone before it ends.'),
  o('D02', 3, 'Lens', 'A hairline brightest in the middle and thinning out at both ends.'),
  o('D03', 3, 'Smoke', 'Four layers, each shorter and wider than the last, so the light disperses in steps.'),
  o('D04', 3, 'Dissolve', 'A solid line that breaks into long dashes, short dashes, then dots, then nothing.'),
  o('D05', 3, 'Shed', 'The line sheds bright particles that drift off sideways and thin out.'),
  o('D06', 3, 'Comet', 'A bright head at one end and a long tail that fades behind it.'),
  o('D07', 3, 'Spark trail', 'The line thins into sparks, each smaller and fainter than the one before.'),
  o('D08', 3, 'Evaporate', 'Copies of the line lift off it, one after another, and vanish like heat.'),
  o('D09', 3, 'Ripple', 'A soft pulse runs along a hairline and dissolves at both ends.'),
  o('D10', 3, 'Fray', 'One line that splits into thin strands, which fan out and fade.'),

  /* T · Stars */
  o('T01', 4, 'Star dust', 'A ray that is only stars, thickest in the middle and thinning at both ends. One element.'),
  o('T02', 4, 'Twinkle', 'Two star fields that take turns, and a few stars that flash with a glint.'),
  o('T03', 4, 'Drift', 'Two layers of stars slide past at different speeds, with no seam.'),
  o('T04', 4, 'Constellation', 'Stars joined by hairlines, as on a star chart.'),
  o('T05', 4, 'Press: star ray', 'A ray of nothing but stars. Press it and the stars fly apart; then they come back.', { interactive: true }),
  o('T06', 4, 'Press: words on stars', 'Only the words, and a cloud of stars floating behind them. Press and the cloud dissipates.', { interactive: true }),
  o('T07', 4, 'Meteor', 'One bright star races along the line, trailing a fading tail and small stars.'),
  o('T08', 4, 'Galaxy band', 'A soft nebula of two colours with a dense field of stars through it and a thread of dust.'),

  /* H · Hairlines and lit lines */
  o('H01', 5, 'Hairline', 'One pixel, fading out at both ends.'),
  o('H02', 5, 'Gradient hairline', 'The shifted gradient: one colour to its cousin.'),
  o('H03', 5, 'Travelling light', 'A faint hairline with a bright spark running along it.'),
  o('H04', 5, 'Beads', 'A hairline strung with small beads of light.'),
  o('H05', 5, 'Ruler', 'A hairline with ticks, a long one every fifth.'),
  o('H06', 5, 'Double line', 'Two hairlines close together, the lighter and the deeper cousin.'),
  o('H07', 5, 'Event stem', 'The timeline’s line from a date up to its words, with the dot it grows from and a faint glow.', { ownDot: true }),
  o('H08', 5, 'Now line', 'The thin line that crosses a whole chart at today, with a soft glow and a diamond at its head.'),
  o('H09', 5, 'Lit dashes', 'A row of dashes that light up one after another, like a runway.'),
  o('H10', 5, 'Glass line', 'A pale glass tube with the colour bleeding in along its length, and a sheen on top.'),

  /* R · Recommended */
  o('R01', 6, 'Aurora ray', 'The airbrush ray whose colours slowly trade places: the lighter cousin drifts into the deeper one and back.'),
  o('R02', 6, 'Prism', 'Three hair-thin lines, the deeper cousin, the colour and the lighter cousin, with a hot core between.'),
  o('R03', 6, 'Silk', 'The pale ES Employment bar made premium: tinted by the shifted gradient, brighter in the middle.', { bar: true }),
  o('R04', 6, 'Soft event stem', 'An airbrushed stem that thins as it rises, with a breathing halo dot at its base.', { ownDot: true }),
  o('R05', 6, 'Light leak', 'An anamorphic streak with a hot centre and soft ghosts either side, as a lens catches a lamp.'),
  o('R06', 6, 'Glass beam', 'A pale glass tube with the colour bleeding in along it, a sheen on top, a soft shadow under it.'),
  o('R07', 6, 'Cutlass', 'A saber without hard edges: an airbrushed blade with a soft white-hot core, a slim hilt and a gentle hum.'),
  o('R08', 6, 'Full dissolve', 'A solid line that breaks into dashes, then dots, then a drift of stars, and is gone.'),
  o('R09', 6, 'Breathing line', 'An airbrush line that brightens and dims slowly, with a soft pulse of light passing through.'),
  o('R10', 6, 'Starlit ray', 'An airbrush glow with a dense field of stars through it, a thread of dust, and stars that glint.'),
];
