/**
 * File: src/lib/master/skeleton.ts
 * Description: The Lab Master page as data (pure TypeScript): the placeholder motions in its tab switcher and the sections
 * of components it will show. Nothing here is wired to anything yet; when a motion or a feature is decided, it is attached
 * to the entry it belongs to. Edit these two lists to change what the skeleton shows.
 */
export interface MasterMotion {
  id: string;
  name: string;
  /** One line on what the motion is meant to be. Placeholder wording until it is decided. */
  blurb: string;
}

/** The tab switcher at the top. Michal's list so far: the four current levels, with Colour swapped for Kinetic, plus Slice and Stars. */
export const MASTER_MOTIONS: MasterMotion[] = [
  { id: 'off', name: 'Off', blurb: 'Nothing moves. Every change is instant.' },
  { id: 'normal', name: 'Normal', blurb: 'Calm. One long-settling ease and a little travel.' },
  { id: 'kinetic', name: 'Kinetic', blurb: 'Type and controls move with energy; letters and numbers are alive.' },
  { id: 'ott', name: 'OTT', blurb: 'Over the top. Springs, deep parallax, big tilt.' },
  { id: 'slice', name: 'Slice', blurb: 'Every title and animation is cut into slices.' },
  { id: 'stars', name: 'Stars', blurb: 'A button dissipates into stars behind it.' },
];

export interface MasterSection {
  id: string;
  name: string;
  /** What this section will show once features are attached. */
  note: string;
}

/** The components, in page order. The Tab switcher at the top of the page is the motion switcher; Tabs at the bottom is the component. */
export const MASTER_SECTIONS: MasterSection[] = [
  { id: 'titles', name: 'Titles', note: 'Kicker, Vogue title, hero line and reading text.' },
  { id: 'buttons', name: 'Buttons', note: 'Primary, quiet, disabled and icon.' },
  { id: 'sliders', name: 'Sliders', note: 'A track and a thumb, with a value.' },
  { id: 'knobs', name: 'Knobs', note: 'A dial with a value.' },
  { id: 'timers', name: 'Timers', note: 'Counting up and counting down.' },
  { id: 'steppers', name: 'Up and down', note: 'A number with an up and a down button.' },
  { id: 'voting', name: 'Voting', note: 'Radio buttons for up and down votes.' },
  { id: 'tabs', name: 'Tabs', note: 'A row of tabs; the selected one is lit.' },
];
