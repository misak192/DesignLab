/**
 * File: src/lib/master/matrix.ts
 * Description: The decision matrix behind Lab Master (pure TypeScript). Columns are the motion STYLES, rows are the things a
 * style has to decide, in three groups: Moments (how things happen), Type (what you read) and Controls (what you touch).
 * A cell says which lab design a row uses under a style. Status: `chosen` = Michal picked it, `proposed` = my suggestion from
 * reading every lab page, `gap` = the lab has nothing suitable yet. Michal looks through the lab pages and says "this one,
 * for that row, under that style"; the cell becomes `chosen`. When every cell is chosen the components are coded from it.
 * The /master page draws this table, so the document and the page cannot drift.
 *
 * Off, Normal and OTT are not columns: they are the AMOUNT (how much any style moves) and apply to every cell.
 */
export type CellStatus = 'chosen' | 'proposed' | 'gap';

export interface MatrixCell {
  status: CellStatus;
  /** Where the design lives in the lab: page and option, e.g. "Tab Selection · 20 Slice jitter". For a gap: what is missing. */
  from: string;
  /** Anything needed to build it exactly, or the idea for a gap. */
  note?: string;
}

export interface MatrixColumn {
  id: string;
  name: string;
  /** The one signature move of this style, reused on every row so the style feels like one thing. */
  signature: string;
}

export interface MatrixRow {
  id: string;
  name: string;
  group: 'Moments' | 'Type' | 'Controls';
}

export const MATRIX_COLUMNS: MatrixColumn[] = [
  { id: 'plain', name: 'Plain', signature: 'A hairline and a soft focus. Calm, nothing shows off.' },
  { id: 'kinetic', name: 'Kinetic', signature: 'Letters and numbers are alive: the letter wave.' },
  { id: 'slice', name: 'Slice', signature: 'Everything is cut in slices: the slice jitter.' },
  { id: 'stars', name: 'Stars', signature: 'Things break into stardust and re-form.' },
  { id: 'zoom', name: 'Zoom', signature: 'Things fly through the screen, toward you and past you.' },
];

export const MATRIX_ROWS: MatrixRow[] = [
  { id: 'arrival', name: 'Arrival', group: 'Moments' },
  { id: 'transition', name: 'Page transition', group: 'Moments' },
  { id: 'notification', name: 'Notification', group: 'Moments' },
  { id: 'pointer', name: 'Pointer and touch', group: 'Moments' },
  { id: 'hero', name: 'Hero title', group: 'Type' },
  { id: 'titles', name: 'Titles', group: 'Type' },
  { id: 'buttons', name: 'Buttons', group: 'Controls' },
  { id: 'tabs', name: 'Tabs', group: 'Controls' },
  { id: 'voting', name: 'Voting', group: 'Controls' },
  { id: 'knobs', name: 'Knobs', group: 'Controls' },
  { id: 'sliders', name: 'Sliders', group: 'Controls' },
  { id: 'steppers', name: 'Up and down', group: 'Controls' },
  { id: 'timers', name: 'Timers', group: 'Controls' },
];

const P = (from: string, note?: string): MatrixCell => ({ status: 'proposed', from, note });
const G = (from: string, note?: string): MatrixCell => ({ status: 'gap', from, note });

/** Filled so far: matrix[rowId][columnId]. Everything here is my proposal until Michal confirms it. */
export const MATRIX: Record<string, Record<string, MatrixCell | undefined> | undefined> = {
  /* ── Moments ── */
  arrival: {
    plain: P('Arrivals · Focus pull', 'Together. Out of a blur into sharp, with a slow push of depth.'),
    kinetic: P('Arrivals · Parallax slide', 'Delayed, back to front: the pieces arrive one after another.'),
    slice: P('Arrivals · Poster reveal', 'Delayed. A wipe uncovers each piece from the bottom.'),
    stars: P('Arrivals · Converge', 'Chaotic. Pieces fly in from random places and gather like stars.'),
    zoom: P('Arrivals · Depth', 'Together. Every piece falls along Z onto its layer; start Z from the front so pieces fly at you.'),
  },
  transition: {
    plain: P('Page Transitions · Ethereal Veil'),
    kinetic: P('Page Transitions · Light-Leak Wipe'),
    slice: P('Page Transitions · Curtain Sweep'),
    stars: G('No starry transition yet', 'Idea: a stardust sweep built from the Constellation field.'),
    zoom: G('No zoom transition yet', 'Idea: the old page flies past you and the new one comes from far away (the Warp Breach idea as a page transition).'),
  },
  notification: {
    plain: P('Notifications · Celestial Calm', 'Weightless late-night whisper.'),
    kinetic: P('Notifications · Sonic Monolith', 'Spring-loaded kinetic shockwave.'),
    slice: G('No sliced notification yet', 'Idea: the sign cut into slices that slide apart.'),
    stars: P('Notifications · Stardust Split', 'Wide letter scatter into light. Sentences: Stardust Stream.'),
    zoom: P('Notifications · Warp Breach', 'Grows so huge it flies past you. Sentences: Tunnel Train.'),
  },
  pointer: {
    plain: P('None', 'Quiet: press feedback only (Motion · Press text).'),
    kinetic: P('Trails · glowing ribbon', 'Desktop trail, light ripple on tap.'),
    slice: G('No sliced trail yet', 'Idea: the ribbon drawn in slices.'),
    stars: P('Trails · glowing ribbon, star tone', 'Light Tone set to the stars colour.'),
    zoom: P('Arrivals · pointer parallax', 'The pointer moves the vanishing point, so near layers shift more than far ones.'),
  },

  /* ── Type ── */
  hero: {
    plain: P('Hero Titles · Mist', 'Airy and barely visible.'),
    kinetic: P('Hero Titles · Veil', 'Letters surface out of the mist one by one, then breathe.'),
    slice: P('Hero Titles · Slice', 'You called it superb.'),
    stars: P('Hero Titles · Airbrush', 'Closest to stardust (soft grain). A real star-field hero does not exist yet.'),
    zoom: P('Hero Titles · Depth', 'You liked Depth on a normal fill.'),
  },
  titles: {
    plain: P('Motion · Kinetic type (Normal)', 'Words rise and fade in, calm.'),
    kinetic: P('Motion · Spread title and Proximity text', 'Tracking opens as you approach. Tab Selection 27 Letter spread is the same idea.'),
    slice: P('Tab Selection · 20 Slice jitter', 'Every title arrives in three slices.'),
    stars: P('Type Dissolve', 'Letters break into glowing particles. Arrival is the reverse.'),
    zoom: P('Notifications · Tunnel Train', 'Words queue behind one another and each swells past the camera: your fly-through text.'),
  },

  /* ── Controls ── */
  buttons: {
    plain: P('Motion · Press text', 'A quiet text button that answers the press.'),
    kinetic: P('Tab Selection · 25 Letter wave', 'The letters rise in turn on press.'),
    slice: P('Tab Selection · 20 Slice jitter', 'On press.'),
    stars: P('Backgrounds · Stars (the Constellation button)', 'Dissipates into stars behind it. You asked for this one.'),
    zoom: P('Buttons · Zoom to nothing', 'On press the word zooms away, or in.'),
  },
  tabs: {
    plain: P('Tab Selection · 02 Underline slide', 'One shared line glides between tabs.'),
    kinetic: P('Tab Selection · 25 Letter wave'),
    slice: P('Tab Selection · 20 Slice jitter'),
    stars: P('Tab Selection · 36 Dust dissolve', 'Eight particles drift off the selected word.'),
    zoom: P('Tab Selection · 35 Depth lift', 'The selected word moves toward you, with a soft shadow.'),
  },
  voting: {
    plain: P('Comments · +up | −down', 'Coloured by your own vote; springs read the amount.'),
    kinetic: P('Charts · Proportional vote split', 'The letters fill from green to red as votes arrive.'),
    slice: G('Nothing sliced yet', 'Idea: the +up and −down count slice-jitter when it changes.'),
    stars: G('Nothing starry yet', 'Idea: a vote bursts a few stars.'),
    zoom: G('Nothing zoomed yet', 'Idea: the count zooms in from far to near when it changes.'),
  },
  knobs: {
    plain: P('Notifications · Rotary knob', 'Hairline ring, one value.'),
    kinetic: P('Notifications · Intensity knob', 'Five detents with a snap you can feel.'),
    slice: G('No sliced knob yet', 'Idea: the ring drawn as slices.'),
    stars: G('No starry knob yet', 'Idea: a ring of stars that lights as it turns.'),
    zoom: G('No zoom knob yet', 'Idea: the value zooms toward you as you turn.'),
  },
  sliders: {
    plain: P('Arrivals · Knob slider', 'Hairline track, accent thumb, live value. The only real slider in the lab.'),
    kinetic: P('Motion · Rolling count', 'On the value: the number rolls as the thumb moves.'),
    slice: G('No sliced slider yet'),
    stars: G('No starry slider yet', 'Idea: the thumb trails stardust.'),
    zoom: G('No zoom slider yet', 'Idea: the thumb grows toward you as you drag.'),
  },
  steppers: {
    plain: G('Nothing in the lab', 'A number with up and down chevrons is only in the skeleton.'),
    kinetic: P('Motion · Rolling count', 'The number rolls up or down.'),
    slice: G('Nothing in the lab'),
    stars: G('Nothing in the lab'),
    zoom: G('Nothing in the lab'),
  },
  timers: {
    plain: G('Nothing in the lab', 'Only the skeleton has a timer; Charts has a timeline, which is different.'),
    kinetic: P('Motion · Rolling count', 'Digits roll as they change.'),
    slice: G('Nothing in the lab'),
    stars: G('Nothing in the lab'),
    zoom: G('Nothing in the lab', 'Idea: digits zoom from far to near as they change.'),
  },
};

/** What is deliberately NOT a row, and why. Shown under the table. */
export const MATRIX_LEFT_OUT: { name: string; why: string }[] = [
  { name: 'Off, Normal, OTT', why: 'These are the amount, not designs. Off is nothing moving, Full is OTT. They scale every cell above.' },
  { name: 'Comments, Charts', why: 'Their own product. They read the amount, and Comments is tuned in its own lab.' },
  { name: 'Cards, Backgrounds, Glow, Glass, Fluid smoke', why: 'Look and atmosphere you choose in LOOK. A style may suggest a default (AUTO), it does not redesign them.' },
  { name: 'Card to detail, Gestures', why: 'One behaviour under every style (the Shared Elements morph, drag to rank).' },
];

export const cellOf = (rowId: string, columnId: string): MatrixCell | undefined => MATRIX[rowId]?.[columnId];

export const matrixProgress = () => {
  const cells = MATRIX_ROWS.flatMap((r) => MATRIX_COLUMNS.map((c) => cellOf(r.id, c.id)));
  const count = (s: CellStatus) => cells.filter((c) => c?.status === s).length;
  return { total: cells.length, chosen: count('chosen'), proposed: count('proposed'), gaps: count('gap') };
};
