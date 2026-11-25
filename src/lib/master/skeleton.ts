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

/** The style switcher at the top: the five motion styles (ids are the `style` setting's values). Off, Normal and Full are the amount. */
export const MASTER_MOTIONS: MasterMotion[] = [
  { id: 'plain', name: 'Plain', blurb: 'Calm. A hairline and a soft focus; nothing shows off.' },
  { id: 'kinetic', name: 'Kinetic', blurb: 'Letters and numbers are alive: the letter wave.' },
  { id: 'slice', name: 'Slice', blurb: 'Every title and animation is cut into slices.' },
  { id: 'stars', name: 'Stars', blurb: 'Things break into stardust, and a button dissipates into stars behind it.' },
  { id: 'zoom', name: 'Zoom', blurb: 'Text flies through the screen, toward you and past you.' },
];

export interface MasterSection {
  id: string;
  name: string;
  /** What this section will show once features are attached. */
  note: string;
}

/** The components, in page order. The Tab switcher at the top of the page is the motion switcher; Tabs at the bottom is the component. */
export const MASTER_SECTIONS: MasterSection[] = [
  { id: 'titles', name: 'Titles', note: 'Kicker, Vogue title, the hero behind it and reading text.' },
  { id: 'buttons', name: 'Buttons', note: 'Primary, quiet and disabled. Press them.' },
  { id: 'tabs', name: 'Tabs', note: 'A row of tabs; the selected one is shown in the style.' },
  { id: 'lines', name: 'Lines', note: 'One thin, lens-shaped line per style.' },
  { id: 'sliders', name: 'Sliders', note: 'Drag the ball, or use the arrow keys.' },
  { id: 'knobs', name: 'Knobs', note: 'Drag up and down, or use the arrow keys.' },
  { id: 'timers', name: 'Timers', note: 'Counting down and counting up, live.' },
  { id: 'steppers', name: 'Up and down', note: 'A number with an up and a down button.' },
  { id: 'voting', name: 'Voting', note: 'Radio buttons for up and down votes.' },
  { id: 'composer', name: 'Comment box', note: 'The stars glow, the only one chosen. Write, then post.' },
];
