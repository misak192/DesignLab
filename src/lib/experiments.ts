/**
 * File: src/lib/experiments.ts
 * Description: Every experiment in the lab. The home page renders one card per entry, so adding an experiment
 * means adding a page under src/app and one object here.
 */
export interface Experiment {
  /** Route the card opens. */
  href: string;
  title: string;
  /** One sentence: what you can try on the page. */
  blurb: string;
  /** Small support label under the card (T3). */
  tag: string;
}

export const EXPERIMENTS: Experiment[] = [
  {
    href: '/comments',
    title: 'Comments',
    blurb: 'Letter-coded comments, a room to play in as anyone, and every comment section ObservaLyst tried before them.',
    tag: 'Lab · Old · Room',
  },
  {
    href: '/motion',
    title: 'Motion',
    blurb: 'Kinetic type, parallax and feedback at OFF, NORMAL, COLOUR and OTT. The numbers every page reads.',
    tag: 'Foundation',
  },
  {
    href: '/cards',
    title: 'Card design',
    blurb: 'Five designs for these very cards. Choose the one the home page uses.',
    tag: 'Design',
  },
  {
    href: '/hero-titles',
    title: 'Hero titles',
    blurb: 'The huge name behind the text, as etheric lines that follow the letters: echo, neon, beads, prism, depth and more.',
    tag: 'Design',
  },
  {
    href: '/backgrounds',
    title: 'Backgrounds',
    blurb: 'Seven ways a comment box lights up as you write in it, stars included, and the page backgrounds.',
    tag: 'Design',
  },
];
