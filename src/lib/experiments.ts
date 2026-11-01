/**
 * File: src/lib/experiments.ts
 * Description: Every experiment in the lab, and the categories they are filed under. The home page shows one card per
 * CATEGORY (the top layer); a category page lists its experiments on one page. Adding an experiment means adding a page
 * under src/app, one object here, and a category for it.
 */
export type CategoryId = 'comments' | 'type' | 'motion' | 'light' | 'controls' | 'data' | 'decisions';

export interface Category {
  id: CategoryId;
  /** The route is /category/<id>. */
  name: string;
  /** One sentence: what lives in this folder. */
  blurb: string;
  /** A project colour (as in the Nexus) that leads the category's hero title. */
  colour: string;
}

/** The top layer, in the order the home page shows them. */
export const CATEGORIES: Category[] = [
  { id: 'comments', name: 'Comments', blurb: 'Letter-coded conversation: the room to play in, every older comment section, and how a posted comment leaves.', colour: '#8fd3b6' },
  { id: 'type', name: 'Type', blurb: 'The words themselves: hero titles behind a page, and spatial type that flies through the screen.', colour: '#b8c0d4' },
  { id: 'motion', name: 'Motion', blurb: 'How things arrive, move and answer a touch: the motion levels, arrivals, transitions, trails.', colour: '#c792ea' },
  { id: 'light', name: 'Light', blurb: 'What the page is lit by: backgrounds, glass, the fluid smoke shaders, and the lines and rays of light.', colour: '#7fd1e8' },
  { id: 'controls', name: 'Controls', blurb: 'What you touch to choose: cards, tabs and drag gestures.', colour: '#e9c46a' },
  { id: 'data', name: 'Data', blurb: 'Charts and the dots, bars and lines they are made of. Airbrush gradient is the default.', colour: '#f08fb0' },
  { id: 'decisions', name: 'Decisions', blurb: 'Where the choices get made: the Lab Master and the landing page.', colour: '#9fb8ff' },
];

export interface Experiment {
  /** Route the card opens. */
  href: string;
  title: string;
  /** One sentence: what you can try on the page. */
  blurb: string;
  /** Small support label under the card (T3). */
  tag: string;
  /** The folder it is filed under. */
  category: CategoryId;
}

export const EXPERIMENTS: Experiment[] = [
  {
    href: '/comments',
    title: 'Comments',
    blurb: 'Letter-coded comments, a room to play in as anyone, and every comment section ObservaLyst tried before them.',
    tag: 'Lab · Old · Room',
    category: 'comments',
  },
  {
    href: '/motion',
    title: 'Motion',
    blurb: 'Kinetic type, parallax and feedback at OFF, NORMAL, COLOUR and OTT. The numbers every page reads.',
    tag: 'Foundation',
    category: 'motion',
  },
  {
    href: '/cards',
    title: 'Card design',
    blurb: 'Five designs for these very cards. Choose the one the home page uses.',
    tag: 'Design',
    category: 'controls',
  },
  {
    href: '/hero-titles',
    title: 'Hero titles',
    blurb: 'The huge name behind the text, as etheric lines that follow the letters: echo, neon, beads, prism, depth and more.',
    tag: 'Design',
    category: 'type',
  },
  {
    href: '/backgrounds',
    title: 'Backgrounds',
    blurb: 'Seven ways a comment box lights up as you write in it, stars included, and the page backgrounds.',
    tag: 'Design',
    category: 'light',
  },
  {
    href: '/notifications',
    title: 'Notifications',
    blurb: 'Borderless spatial typography: big hero text that flies through the screen, dissipates into light, or expands past the camera.',
    tag: 'Spatial · Type',
    category: 'type',
  },
  {
    href: '/fluid-smoke',
    title: 'Fluid & Smoke Shaders',
    blurb: 'Live fluid and ink-smoke field reacting to scroll, cursor, and time of day via WebGL and Android AGSL.',
    tag: 'Shader · GLSL',
    category: 'light',
  },
  {
    href: '/shared-elements',
    title: 'Shared Elements',
    blurb: 'A card morphs into its detail page via Web View Transitions API and Jetpack Compose SharedTransitionLayout.',
    tag: 'Motion · Spatial',
    category: 'motion',
  },
  {
    href: '/type-dissolve',
    title: 'Type That Dissolves',
    blurb: 'When a comment posts, the letters break into glowing particles and drift away with thermal draft physics.',
    tag: 'Particles · Type',
    category: 'comments',
  },
  {
    href: '/charts',
    title: 'Letter-Coded Charts',
    blurb: 'Letter-colour encoding applied to XP bars, leaderboards, vote tallies, and the ChronoLyst timeline.',
    tag: 'Data · Identity',
    category: 'data',
  },
  {
    href: '/gestures',
    title: 'Spring Gestures',
    blurb: 'Drag-to-rank cards with momentum and rubber-band edges, building on ActionLyst’s swipe-to-rank.',
    tag: 'Gestures · Physics',
    category: 'controls',
  },
  {
    href: '/glass',
    title: 'Glass & Refraction',
    blurb: 'Frosted panels that bend the background beneath them using backdrop blur and SVG displacement maps.',
    tag: 'Optics · Filter',
    category: 'light',
  },
  {
    href: '/arrivals',
    title: 'Arrivals',
    blurb: 'Nine ways for a page to arrive in 3D depth: stamped, swung, focused, cinematic. Together, delayed or chaotic, from the front or the back.',
    tag: '3D · Arrival',
    category: 'motion',
  },
  {
    href: '/trails',
    title: 'Cursor & Touch Trails',
    blurb: 'A soft glowing ribbon on desktop, and a light ripple on tap on phone, with Android haptic taps.',
    tag: 'Tactile · Feedback',
    category: 'motion',
  },
  {
    href: '/page-transitions',
    title: 'Page Transitions',
    blurb: 'Light-leak and curtain wipes between pages with an authentic film-grain overlay texture.',
    tag: 'Cinematic · Pacing',
    category: 'motion',
  },
  {
    href: '/tab-selection',
    title: 'Tab Selection',
    blurb: 'Thirty-six borderless ways to show the selected tab: lines, colour, light, glitch, letters, breathing and dust. Pick a favourite.',
    tag: 'Type · Motion',
    category: 'controls',
  },
  {
    href: '/experiments/chart-elements',
    title: 'Chart Elements',
    blurb: 'Thirty see-through chart elements, thirty-six dots, their blends and five chart styles on one dataset. Airbrush gradient leads.',
    tag: 'Data · Light',
    category: 'data',
  },
  {
    href: '/lines',
    title: 'Lines',
    blurb: 'Sixty-six ways to draw a line of light, and a Veils tab with fifty-six big soft areas of colour: airbrush, neon, lasers, dissipating light, glass, highlighters, stars you can press.',
    tag: 'Light · Rays',
    category: 'light',
  },
  {
    href: '/master',
    title: 'Lab Master',
    blurb: 'Where the finished designs of the whole FrissonWorks empire get gathered: the decision matrix of motion styles and components.',
    tag: 'Skeleton · Matrix',
    category: 'decisions',
  },
  {
    href: '/landing',
    title: 'Landing',
    blurb: 'Decide how this very page looks: the layout of the categories, their hero titles, the card design and the welcome.',
    tag: 'Design · Home',
    category: 'decisions',
  },
];

export const categoryOf = (id: CategoryId): Category => CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0];

/** The experiments filed under a category, in the order of EXPERIMENTS. */
export const experimentsIn = (id: CategoryId): Experiment[] => EXPERIMENTS.filter((e) => e.category === id);
