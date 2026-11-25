/**
 * File: src/lib/master/matrix.ts
 * Description: The decision matrix behind Lab Master (pure TypeScript). Columns are the motion STYLES, rows are the things a style has to
 * decide, in three groups: Moments (how things happen), Type (what you read) and Controls (what you touch). A cell says which lab design a
 * row uses under a style. Status: `chosen` = Michal picked it, `proposed` = my suggestion (many are now built live on /master, from his
 * ideas), `gap` = the lab has nothing suitable yet. Michal looks through the lab pages and says "this one, for that row, under that
 * style"; the cell becomes `chosen`. When every cell is chosen the components are coded from it. /master draws this table, so the document
 * and the page cannot drift.
 *
 * Off, Normal and OTT (FULL) are not columns: they are the AMOUNT (how much any style moves) and apply to every cell.
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
  { id: 'plain', name: 'Plain', signature: 'Mirror: the word and its reflection, with the hero behind the title.' },
  { id: 'kinetic', name: 'Kinetic', signature: 'Letters and numbers are alive: the letter wave, the letter that grows.' },
  { id: 'slice', name: 'Slice', signature: 'Everything is cut in strips that slide apart and join.' },
  { id: 'stars', name: 'Stars', signature: 'LoreLyst’s stars and dust: things dissipate and re-form.' },
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
  { id: 'lines', name: 'Lines', group: 'Controls' },
  { id: 'voting', name: 'Voting', group: 'Controls' },
  { id: 'knobs', name: 'Knobs', group: 'Controls' },
  { id: 'sliders', name: 'Sliders', group: 'Controls' },
  { id: 'steppers', name: 'Up and down', group: 'Controls' },
  { id: 'timers', name: 'Timers', group: 'Controls' },
  { id: 'composer', name: 'Comment box', group: 'Controls' },
];

const C = (from: string, note?: string): MatrixCell => ({ status: 'chosen', from, note });
const P = (from: string, note?: string): MatrixCell => ({ status: 'proposed', from, note });
const G = (from: string, note?: string): MatrixCell => ({ status: 'gap', from, note });

/** Filled so far: matrix[rowId][columnId]. */
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
    plain: P('None', 'Quiet: press feedback only.'),
    kinetic: P('Trails · glowing ribbon', 'Desktop trail, light ripple on tap.'),
    slice: G('No sliced trail yet', 'Idea: the ribbon drawn in slices.'),
    stars: P('Trails · glowing ribbon, star tone', 'Light Tone set to the stars colour.'),
    zoom: P('Arrivals · pointer parallax', 'The pointer moves the vanishing point, so near layers shift more than far ones.'),
  },

  /* ── Type ── */
  hero: {
    plain: C('Hero Titles · Mirror', 'Your favourite, and the default. It sits behind the Vogue title, starting lower so it bleeds under the subtitle.'),
    kinetic: P('Hero Titles · Veil', 'Letters surface out of the mist one by one, then breathe.'),
    slice: C('Hero Titles · Slice', 'Amazing. The scroll travel is cut to a third (13 Nov): it moved too much left and right.'),
    stars: P('Hero Titles · Airbrush', 'You love Airbrush; it is here for Stars, and a few stars in it would make it more starry. Could swap with Zoom.'),
    zoom: C('Hero Titles · Depth', 'Great. The new Smoke is similar: pick it in Settings → Titles.'),
  },
  titles: {
    plain: C('Vogue title with the hero behind it', 'The hero starts lower than the title and runs under the subtitle: the clear title, and the one that is only light.'),
    kinetic: P('Letters rise in turn', 'The arrival of the title: a wave across the letters.'),
    slice: P('Strips converge', 'The arrival of the title: it comes together from cut strips.'),
    stars: P('Clears out of a blur', 'The arrival of the title: like dust gathering into letters.'),
    zoom: P('Flies in from far', 'The arrival of the title: it comes at you and settles.'),
  },

  /* ── Controls ── */
  buttons: {
    plain: P('Mirror on press', 'Press: the word gets its reflection underneath, then it fades.'),
    kinetic: P('Tab Selection · 25 Letter wave', 'The letters rise in turn on press.'),
    slice: C('The word rests cut in strips', 'Press: the strips join into the whole word, then cut again.'),
    stars: C('LoreLyst constellation button', 'Stars behind the word. Press: they blow apart, dissipate and form again.'),
    zoom: P('Buttons · Zoom to nothing', 'Press: the word zooms away and comes back from nothing.'),
  },
  tabs: {
    plain: P('Selected tab on its reflection', 'The mirror, as on the buttons.'),
    kinetic: C('Tab Selection · 30 Letter grow', 'The first letter grows bigger (not higher) and takes the accent; the rest stay white.'),
    slice: C('The selected tab is the cut one', 'Like the button: the selected word is in strips.'),
    stars: C('Tab Selection · 36 Dust dissolve', 'Fourteen glowing particles now (eight were too faint).'),
    zoom: P('Tab Selection · 35 Depth lift', 'The selected word moves toward you, with a soft shadow.'),
  },
  lines: {
    plain: C('Lines · S02 Mist', 'Thin and lens-shaped. The ends now fade out fully (no visible ray at the end).'),
    kinetic: C('Lines · S04 Ember fade', 'Strong where it starts, gone before it ends. Thin and lens-shaped.'),
    slice: C('Lines · N06 Hologram', 'Scanlines, flickering faintly. Thin and lens-shaped.'),
    stars: C('Lines · T01 Star dust with T03 Drift', 'Made a thin line (it was too thick). Lens-shaped.'),
    zoom: C('Lines · D03 Smoke', 'Great as a line. Thin and lens-shaped.'),
  },
  voting: {
    plain: P('Comments · +up | −down', 'The count fades up and away, the new one rises in.'),
    kinetic: P('Rolling count', 'The count rolls like a counter.'),
    slice: P('Cut count', 'The count is cut: old strips slide away, new ones slide in.'),
    stars: P('Dissolving count', 'The old count dissolves, the new one clears out of a blur.'),
    zoom: P('Zooming count', 'The new count flies in from far.'),
  },
  knobs: {
    plain: P('Thin ring', 'A hairline ring and a pointer.'),
    kinetic: P('Ticks that grow', 'Twenty-eight ticks; those passed grow and light up.'),
    slice: P('Ring in strips', 'The ring is cut in three; hold it and the strips join.'),
    stars: P('Ring of stars', 'Stars along the ring that light as it turns.'),
    zoom: P('Ring, readout zooms', 'The number in the middle zooms toward you while you turn.'),
  },
  sliders: {
    plain: P('Ball with its reflection', 'The track is the Mist line.'),
    kinetic: P('Ball that springs', 'It springs bigger while you hold it. The track is the Ember fade line.'),
    slice: P('Ball cut in strips', 'Hold it and the strips join. The track is the Hologram line.'),
    stars: P('A star for a ball', 'The track is the Star dust line.'),
    zoom: P('Ball comes toward you', 'It grows while you hold it. The track is the Smoke line.'),
  },
  steppers: {
    plain: P('Number fades', 'The old number fades up and away, the new rises in.'),
    kinetic: P('Number rolls', 'Like a counter.'),
    slice: P('Number cut', 'The old strips slide away and the new strips slide in (your idea).'),
    stars: P('Number dissolves', 'The old one dissolves, the new one clears out of a blur.'),
    zoom: P('Number zooms', 'The new one flies in from far, the old one shrinks away.'),
  },
  timers: {
    plain: P('Digits fade', 'Only the digit that changes moves. Progress is the Mist line.'),
    kinetic: P('Digits roll', 'Progress is the Ember fade line.'),
    slice: P('Digits cut', 'Progress is the Hologram line.'),
    stars: P('Digits dissolve', 'Progress is the Star dust line.'),
    zoom: P('Digits zoom', 'Progress is the Smoke line.'),
  },
  composer: {
    plain: C('Backgrounds · Stars glow', 'The only comment-box glow you like. It lights while you write and the stars blow apart when you post.'),
    kinetic: C('Backgrounds · Stars glow', 'The same in every style.'),
    slice: C('Backgrounds · Stars glow', 'The same in every style.'),
    stars: C('Backgrounds · Stars glow', 'The same in every style.'),
    zoom: C('Backgrounds · Stars glow', 'The same in every style.'),
  },
};

/** What is deliberately NOT a row, and why. Shown under the table. */
export const MATRIX_LEFT_OUT: { name: string; why: string }[] = [
  { name: 'Off, Normal, OTT', why: 'These are the amount, not designs. Off is nothing moving, Full is OTT. They scale every cell above.' },
  { name: 'Comments, Charts', why: 'Their own product. They read the amount, and Comments is tuned in its own lab.' },
  { name: 'Cards, Backgrounds, Glass, Fluid smoke', why: 'Look and atmosphere you choose in LOOK. A style may suggest a default (AUTO), it does not redesign them.' },
  { name: 'Other comment-box glows', why: 'Only the stars glow was liked, so it is the one in every style.' },
  { name: 'Card to detail, Gestures', why: 'One behaviour under every style (the Shared Elements morph, drag to rank).' },
];

export const cellOf = (rowId: string, columnId: string): MatrixCell | undefined => MATRIX[rowId]?.[columnId];

export const matrixProgress = () => {
  const cells = MATRIX_ROWS.flatMap((r) => MATRIX_COLUMNS.map((c) => cellOf(r.id, c.id)));
  const count = (s: CellStatus) => cells.filter((c) => c?.status === s).length;
  return { total: cells.length, chosen: count('chosen'), proposed: count('proposed'), gaps: count('gap') };
};
