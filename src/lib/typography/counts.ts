/**
 * File: src/lib/typography/counts.ts
 * Description: The notification-count designs of the Typography page as plain data (pure TypeScript). A count is a small number
 * raised at the top right of a word, like an exponent (x²). The same rules hold for every design: 0 shows nothing, 100 and more
 * read "99+", the number is tabular and never smaller than 13px. The drawing is in src/components/typography/Counted.tsx and
 * the `.fw-ct` rules in globals.css.
 */
export type CountVariant =
  | 'exponent'
  | 'colour'
  | 'light'
  | 'pulse'
  | 'star'
  | 'radical'
  | 'overline'
  | 'roll'
  | 'orb'
  | 'sparks';

export interface CountOption {
  id: string;
  variant: CountVariant;
  name: string;
  description: string;
}

export const COUNT_OPTIONS: CountOption[] = [
  { id: 'N01', variant: 'exponent', name: 'Exponent', description: 'The plain one: a small number raised at the top right of the word, in the skin colour T1, like the 2 in x².' },
  { id: 'N02', variant: 'colour', name: 'Own colour', description: 'The same, but in the colour of the thing it belongs to (a category keeps its own colour). Colour means data.' },
  { id: 'N03', variant: 'light', name: 'Light', description: 'The number glows in its colour with a soft orb of light behind it. Still no box.' },
  { id: 'N04', variant: 'pulse', name: 'Pulse', description: 'The number breathes, and a faint ring of light leaves it, for counts that should be noticed.' },
  { id: 'N05', variant: 'star', name: 'Star', description: 'A small twinkling star sits in front of the number. Fewer digits, more life.' },
  { id: 'N06', variant: 'radical', name: 'Root', description: 'The literal square root: the word sits under a root sign and a line, and the count is the small index of the root.' },
  { id: 'N07', variant: 'overline', name: 'Overline', description: 'A hairline runs over the word and ends in the number: the root without its sign.' },
  { id: 'N08', variant: 'roll', name: 'Roll', description: 'When the count changes, the new number rolls up into place from below.' },
  { id: 'N09', variant: 'orb', name: 'Orb', description: 'The number rests on a soft round bokeh of its colour: light, not a badge.' },
  { id: 'N10', variant: 'sparks', name: 'Sparks', description: 'A plain exponent that throws five sparks each time the count goes up.' },
];

/** The sample words: five of the lab's categories with their colours and a count each (one empty, one past 99). */
export const COUNT_SAMPLES = [
  { label: 'Comments', colour: '#8fd3b6', count: 3 },
  { label: 'Type', colour: '#b8c0d4', count: 12 },
  { label: 'Motion', colour: '#c792ea', count: 0 },
  { label: 'Light', colour: '#7fd1e8', count: 7 },
  { label: 'Data', colour: '#f08fb0', count: 128 },
] as const;

/** What the badge says: nothing for 0, "99+" from 100. */
export const countText = (n: number): string | null => (n <= 0 ? null : n > 99 ? '99+' : String(n));
