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
  {
    href: '/notifications',
    title: 'Notifications',
    blurb: 'Borderless spatial typography: big hero text that flies through the screen, dissipates into light, or expands past the camera.',
    tag: 'Spatial · Type',
  },
  {
    href: '/fluid-smoke',
    title: 'Fluid & Smoke Shaders',
    blurb: 'Live fluid and ink-smoke field reacting to scroll, cursor, and time of day via WebGL and Android AGSL.',
    tag: 'Shader · GLSL',
  },
  {
    href: '/shared-elements',
    title: 'Shared Elements',
    blurb: 'A card morphs into its detail page via Web View Transitions API and Jetpack Compose SharedTransitionLayout.',
    tag: 'Motion · Spatial',
  },
  {
    href: '/type-dissolve',
    title: 'Type That Dissolves',
    blurb: 'When a comment posts, the letters break into glowing particles and drift away with thermal draft physics.',
    tag: 'Particles · Type',
  },
  {
    href: '/charts',
    title: 'Letter-Coded Charts',
    blurb: 'Letter-colour encoding applied to XP bars, leaderboards, vote tallies, and the ChronoLyst timeline.',
    tag: 'Data · Identity',
  },
  {
    href: '/gestures',
    title: 'Spring Gestures',
    blurb: 'Drag-to-rank cards with momentum and rubber-band edges, building on ActionLyst’s swipe-to-rank.',
    tag: 'Gestures · Physics',
  },
  {
    href: '/glass',
    title: 'Glass & Refraction',
    blurb: 'Frosted panels that bend the background beneath them using backdrop blur and SVG displacement maps.',
    tag: 'Optics · Filter',
  },
  {
    href: '/arrivals',
    title: 'Arrivals',
    blurb: 'Nine ways for a page to arrive in 3D depth: stamped, swung, focused, cinematic. Together, delayed or chaotic, from the front or the back.',
    tag: '3D · Arrival',
  },
  {
    href: '/trails',
    title: 'Cursor & Touch Trails',
    blurb: 'A soft glowing ribbon on desktop, and a light ripple on tap on phone, with Android haptic taps.',
    tag: 'Tactile · Feedback',
  },
  {
    href: '/page-transitions',
    title: 'Page Transitions',
    blurb: 'Light-leak and curtain wipes between pages with an authentic film-grain overlay texture.',
    tag: 'Cinematic · Pacing',
  },
];
