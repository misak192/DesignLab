/**
 * File: src/lib/buttons/options.ts
 * Description: The fifty button designs of /buttons as plain data (pure TypeScript, no React or DOM). A button here is a bare
 * word: no border, no fill. A design is a LOOK (the light it rests in: halo, ember, ribbon, stars...) plus one or more MOVES
 * (what happens on press: pulse, hop, scatter, slice, zoom to nothing...). The moves are drawn in
 * src/components/buttons/moves.ts; the looks are CSS (`.fw-kb[data-look]` in globals.css).
 */
export type Look =
  | 'plain'
  | 'halo'
  | 'ember'
  | 'ribbon'
  | 'underline'
  | 'cursor'
  | 'mist'
  | 'stars'
  | 'bokeh'
  | 'sheen'
  | 'tide'
  | 'scan'
  | 'spot'
  | 'orbit';

export type Shape = 'star' | 'orb' | 'spark' | 'bokeh';

export type MoveKind =
  | 'pulse' | 'heartbeat' | 'spread' | 'flash' | 'rings'
  | 'hop' | 'wave' | 'squash' | 'launch' | 'drop'
  | 'scatter' | 'burst' | 'dust' | 'bokeh' | 'confetti'
  | 'slice'
  | 'zoomIn' | 'zoomOut' | 'implode' | 'explode' | 'focus'
  | 'constellation' | 'twinkle' | 'shoot' | 'orbit'
  | 'flare' | 'embers' | 'ripple' | 'sweep' | 'fade'
  | 'roll' | 'type' | 'wash' | 'fringe' | 'stamp' | 'inkpop';

/** One move and its knobs; every knob is optional, each move reads only the ones it needs. */
export interface MoveSpec {
  k: MoveKind;
  /** How many (rings, particles, strips). */
  n?: number;
  /** How far or how much (px, or a scale). */
  d?: number;
  /** Angle in degrees (slice, fringe). */
  deg?: number;
  shape?: Shape;
  /** Slice: cut into columns instead of rows. */
  vertical?: boolean;
  /** Slice: jitter in rapid steps. */
  glitch?: boolean;
  /** Burst: spread evenly in a ring from the middle of the word, not from the press point. */
  even?: boolean;
}

export interface ButtonOption {
  id: string;
  name: string;
  /** Index into BUTTON_ROWS. */
  row: number;
  look: Look;
  moves: MoveSpec[];
  description: string;
}

export const BUTTON_ROWS = [
  { title: 'Pulse', note: 'The word breathes: it swells, beats, opens or blooms, and light rings leave it.' },
  { title: 'Jump', note: 'The word leaves the line and comes back: hops, waves, squashes, launches, rain.' },
  { title: 'Scatter', note: 'The word breaks into stars, dust, bokeh or light and gathers again.' },
  { title: 'Slice', note: 'The word is cut with a line of light and the pieces slide apart and close (the hero title Slice, as a button).' },
  { title: 'Zoom to nothing', note: 'The word flies into the screen or shrinks to a point, is gone for a moment, then returns.' },
  { title: 'Stars', note: 'Constellations, twinkles, a shooting star and an orbit: the stars you use in the apps.' },
  { title: 'Light and orbs', note: 'Embers, aurora, a spotlight, drifting mist and a lens flare.' },
  { title: 'Letters', note: 'Each letter on its own: rolls, rises, types back, washes through colour, splits in colour.' },
  { title: 'Glass and colour', note: 'Quiet and premium: a sheen, pearl, prism, liquid squash and an ink stamp.' },
  { title: 'Merged', note: 'Ideas from the earlier button studies, redrawn without a border or a fill.' },
] as const;

const m = (k: MoveKind, rest: Omit<MoveSpec, 'k'> = {}): MoveSpec => ({ k, ...rest });

export const BUTTON_OPTIONS: ButtonOption[] = [
  // 1 · Pulse
  { id: 'B01', name: 'Soft pulse', row: 0, look: 'halo', moves: [m('pulse', { d: 1.12 }), m('rings', { n: 1 })], description: 'A soft halo breathes behind the word. Press: it swells once and one ring of light leaves the point you touched.' },
  { id: 'B02', name: 'Heartbeat', row: 0, look: 'ember', moves: [m('heartbeat')], description: 'An ember streak drifts through the word. Press: two beats, the second a little smaller.' },
  { id: 'B03', name: 'Sonar', row: 0, look: 'cursor', moves: [m('rings', { n: 3 }), m('pulse', { d: 1.05 })], description: 'Two hairlines and two diamonds close in on the word. Press: three rings ping out from your finger.' },
  { id: 'B04', name: 'Bloom', row: 0, look: 'mist', moves: [m('flash')], description: 'Three clouds of colour drift behind it. Press: the word blooms into light and settles.' },
  { id: 'B05', name: 'Inhale', row: 0, look: 'underline', moves: [m('spread', { d: 9 })], description: 'A dot under the word grows into a hairline on point. Press: the letters open out and draw back in.' },

  // 2 · Jump
  { id: 'B06', name: 'Hop', row: 1, look: 'plain', moves: [m('hop', { d: 16 })], description: 'Nothing but the word. Press: it hops, squashes on landing and bounces once more.' },
  { id: 'B07', name: 'Wave', row: 1, look: 'ribbon', moves: [m('wave', { d: 14 })], description: 'Two hairlines flow above and below. Press: every letter jumps, one after another.' },
  { id: 'B08', name: 'Squash', row: 1, look: 'halo', moves: [m('squash')], description: 'Press: the word is pressed flat, springs tall and settles, like a ball of dough.' },
  { id: 'B09', name: 'Launch', row: 1, look: 'scan', moves: [m('launch', { d: 80 })], description: 'A line of light scans across it on point. Press: the word shoots up out of sight and returns from below.' },
  { id: 'B10', name: 'Drop', row: 1, look: 'tide', moves: [m('drop')], description: 'Waves of light run above and below. Press: the letters fall in from above and bounce into place.' },

  // 3 · Scatter
  { id: 'B11', name: 'Scatter', row: 2, look: 'stars', moves: [m('scatter', { d: 70 })], description: 'A few stars twinkle round the word. Press: the letters fly apart, tumbling, and gather again.' },
  { id: 'B12', name: 'Star burst', row: 2, look: 'sheen', moves: [m('burst', { n: 16, shape: 'star', d: 90 })], description: 'The letters shift colour on point. Press: sixteen stars burst from the touch.' },
  { id: 'B13', name: 'Dust', row: 2, look: 'mist', moves: [m('dust')], description: 'Press: the letters crumble to dust that drifts away upward, then the word grows back out of the haze.' },
  { id: 'B14', name: 'Bokeh pop', row: 2, look: 'bokeh', moves: [m('bokeh', { n: 8 })], description: 'Soft discs of light drift behind it. Press: eight bokeh discs bloom and float away.' },
  { id: 'B15', name: 'Light confetti', row: 2, look: 'halo', moves: [m('confetti', { n: 18 })], description: 'Press: eighteen specks of coloured light are thrown up and fall back, never touching the word.' },

  // 4 · Slice
  { id: 'B16', name: 'Cut', row: 3, look: 'scan', moves: [m('slice', { n: 2, d: 14 })], description: 'One straight cut, a flash of light along it; the halves slide apart and close.' },
  { id: 'B17', name: 'Diagonal', row: 3, look: 'ribbon', moves: [m('slice', { n: 2, d: 16, deg: -14 })], description: 'The cut runs on a slant, as in the hero title Slice.' },
  { id: 'B18', name: 'Triple', row: 3, look: 'plain', moves: [m('slice', { n: 3, d: 12 })], description: 'Three bands, the middle one moving against the others.' },
  { id: 'B19', name: 'Glitch', row: 3, look: 'underline', moves: [m('slice', { n: 5, d: 8, glitch: true }), m('fringe')], description: 'Five thin bands jitter in rapid steps while the colours split.' },
  { id: 'B20', name: 'Blade', row: 3, look: 'ember', moves: [m('slice', { n: 2, d: 12, vertical: true, deg: 8 }), m('flare')], description: 'A blade falls down the word; the two halves part sideways and a flare crosses the cut.' },

  // 5 · Zoom to nothing
  { id: 'B21', name: 'Zoom in', row: 4, look: 'halo', moves: [m('zoomIn')], description: 'Press: the word rushes at you, blurs out into nothing, and comes back from afar.' },
  { id: 'B22', name: 'Zoom out', row: 4, look: 'plain', moves: [m('zoomOut')], description: 'Press: the word shrinks to a point and vanishes, then pops back a little too big.' },
  { id: 'B23', name: 'Implode', row: 4, look: 'stars', moves: [m('implode')], description: 'Every letter is pulled into the middle and gone; they spring back out.' },
  { id: 'B24', name: 'Explode', row: 4, look: 'bokeh', moves: [m('explode')], description: 'The letters fly past the camera, huge and blurred, and are gone; the word settles back from nothing.' },
  { id: 'B25', name: 'Focus pull', row: 4, look: 'mist', moves: [m('focus')], description: 'Press: the focus is pulled away, the word dissolves into a blur and sharpens again.' },

  // 6 · Stars
  { id: 'B26', name: 'Constellation', row: 5, look: 'stars', moves: [m('constellation')], description: 'The star button of the apps: a cloud of stars round the word blows apart on press and forms again.' },
  { id: 'B27', name: 'Twinkle', row: 5, look: 'stars', moves: [m('twinkle')], description: 'Press: a star flares on each letter in turn, the letters swell and glow as it passes.' },
  { id: 'B28', name: 'Shooting star', row: 5, look: 'sheen', moves: [m('shoot')], description: 'Press: a shooting star crosses the word and it flashes as the star leaves.' },
  { id: 'B29', name: 'Orbit', row: 5, look: 'orbit', moves: [m('orbit'), m('flash')], description: 'A small star circles the word all the time. Press: a bright one makes a lap and the word glows.' },
  { id: 'B30', name: 'Stardust ring', row: 5, look: 'halo', moves: [m('burst', { n: 22, shape: 'star', d: 100, even: true })], description: 'Press: twenty-two stars leave the word in an even ring.' },

  // 7 · Light and orbs
  { id: 'B31', name: 'Ember', row: 6, look: 'ember', moves: [m('embers', { n: 14 }), m('flash')], description: 'Press: the word flares and embers rise from it, cooling as they go.' },
  { id: 'B32', name: 'Aurora', row: 6, look: 'ribbon', moves: [m('sweep'), m('flare')], description: 'Press: a band of light sweeps through the letters and a flare stretches through the word.' },
  { id: 'B33', name: 'Orb follow', row: 6, look: 'spot', moves: [m('ripple')], description: 'A light follows your pointer across the word. Press: it swells into a soft ripple of light.' },
  { id: 'B34', name: 'Mist drift', row: 6, look: 'mist', moves: [m('fade')], description: 'Press: the letters melt into the haze one after another and come back.' },
  { id: 'B35', name: 'Lens flare', row: 6, look: 'halo', moves: [m('flare')], description: 'Press: a long anamorphic streak shoots through the word, like light in a lens.' },

  // 8 · Letters
  { id: 'B36', name: 'Roll', row: 7, look: 'plain', moves: [m('roll')], description: 'Press: every letter turns a full somersault, left to right.' },
  { id: 'B37', name: 'Rise', row: 7, look: 'tide', moves: [m('wave', { d: 7 })], description: 'A slower, smaller wave: the letters rise like a tide under the word.' },
  { id: 'B38', name: 'Type back', row: 7, look: 'scan', moves: [m('type')], description: 'Press: the word vanishes and is typed back, letter by letter.' },
  { id: 'B39', name: 'Wash', row: 7, look: 'halo', moves: [m('wash')], description: 'Press: a wave of colour runs through the letters and fades out of them.' },
  { id: 'B40', name: 'Chroma', row: 7, look: 'cursor', moves: [m('fringe')], description: 'Press: the colours split into two, like a lens that cannot focus, and come together.' },

  // 9 · Glass and colour
  { id: 'B41', name: 'Sheen pass', row: 8, look: 'plain', moves: [m('sweep')], description: 'Only the word, until you press: one soft glint of light slides through it.' },
  { id: 'B42', name: 'Pearl', row: 8, look: 'halo', moves: [m('flash'), m('rings', { n: 2 })], description: 'Press: the word glows like a pearl and two slow rings spread from it.' },
  { id: 'B43', name: 'Prism', row: 8, look: 'underline', moves: [m('fringe'), m('sweep')], description: 'Press: the colours split and a glint of white slides through the word.' },
  { id: 'B44', name: 'Liquid', row: 8, look: 'mist', moves: [m('squash'), m('ripple')], description: 'Press: the word squashes like a drop and a ripple of light runs out of it.' },
  { id: 'B45', name: 'Stamp', row: 8, look: 'cursor', moves: [m('stamp')], description: 'Press: the word is stamped into the page, pressed in and darkened, and a ring of ink spreads.' },

  // 10 · Merged
  { id: 'B46', name: 'Ink constellation', row: 9, look: 'stars', moves: [m('inkpop')], description: 'Press: the stars swell, pop into fragments and fly out; the word dims and grows back.' },
  { id: 'B47', name: 'Chrono-blade', row: 9, look: 'scan', moves: [m('slice', { n: 2, d: 14, deg: -10 }), m('rings', { n: 1 })], description: 'A scan line crosses the word; press: a slanted cut and a shockwave from the touch.' },
  { id: 'B48', name: 'Supernova', row: 9, look: 'stars', moves: [m('flash'), m('burst', { n: 34, shape: 'star', d: 130 })], description: 'Press: the word flares white and thirty-four stars are thrown out in every direction.' },
  { id: 'B49', name: 'Firefly', row: 9, look: 'bokeh', moves: [m('dust'), m('bokeh', { n: 5 })], description: 'Press: the word turns to dust and five soft orbs drift where it was.' },
  { id: 'B50', name: 'Eclipse', row: 9, look: 'orbit', moves: [m('zoomOut'), m('rings', { n: 2 }), m('orbit')], description: 'Press: the word shrinks to a point, rings spread from it and a star circles the empty place.' },
];

export const BUTTON_LABELS = [
  { id: 'continue', label: 'Continue' },
  { id: 'post', label: 'Post' },
  { id: 'journey', label: 'Start your journey' },
] as const;
