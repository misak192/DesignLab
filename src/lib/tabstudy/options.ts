/**
 * File: src/lib/tabstudy/options.ts
 * Description: The 36 ways to show a selected tab, as data (pure TypeScript). The drawing of each lives in
 * src/components/tabstudy/effects/, keyed by the same id. Every option is borderless and backgroundless: the
 * selected state is carried by type, colour, light, motion and hairlines or particles only.
 */
export type TabCategory = 'Motion' | 'Colour' | 'Light' | 'Glitch' | 'Kinetic letters' | 'Breathing and idle' | 'Spatial and particles';

export interface TabOption {
  /** "01" to "36". */
  id: string;
  name: string;
  category: TabCategory;
  /** One line under the live row. */
  description: string;
  /** How lit an unselected tab is, in percent of INK over the canvas (an opaque colour, never alpha). Default 40. */
  rest?: number;
}

export const TAB_LABELS = ['January', 'February', 'March', 'April'] as const;

export const TAB_OPTIONS: TabOption[] = [
  /* Motion */
  { id: '01', name: 'Underline draw', category: 'Motion', description: 'A thin line draws left to right under the selected tab.' },
  { id: '02', name: 'Underline slide', category: 'Motion', description: 'One shared line glides between the tabs on a spring.' },
  { id: '03', name: 'Float', category: 'Motion', description: 'The tab rises 6px and drifts on a slow sine path.' },
  { id: '04', name: 'Slide in from side', category: 'Motion', description: 'The label enters from the left with a 12px travel.' },
  { id: '05', name: 'Orbit dot', category: 'Motion', description: 'A small dot circles the label once, then rests below it.' },
  { id: '06', name: 'Drop and bounce', category: 'Motion', description: 'The label drops 10px and settles with an elastic bounce.' },

  /* Colour */
  { id: '07', name: 'Colour pop', category: 'Colour', description: 'White flashes to the accent, then settles into a calmer tint.' },
  { id: '08', name: 'Hue cycle', category: 'Colour', description: 'The colour drifts slowly through the skin palette, T1 to T2 to T3.' },
  { id: '09', name: 'Gradient text', category: 'Colour', description: 'The label fills with a gradient from T1 to T2.' },
  { id: '10', name: 'Colour bleed', category: 'Colour', description: 'Colour radiates outward from the letters, then fades.' },
  { id: '11', name: 'Two-tone split', category: 'Colour', description: 'The left half of the word is bright, the right half dim.' },
  { id: '12', name: 'Shadow colour', category: 'Colour', description: 'The halo turns from black into a coloured glow.' },

  /* Light */
  { id: '13', name: 'Soft glow', category: 'Light', description: 'A 12px glow of the accent, breathing.' },
  { id: '14', name: 'Neon flicker', category: 'Light', description: 'The glow stutters on like a neon tube, then holds steady.' },
  { id: '15', name: 'Halo', category: 'Light', description: 'A faint elliptical light sits behind the word.' },
  { id: '16', name: 'Light sweep', category: 'Light', description: 'A bright band passes across the word once.' },
  { id: '17', name: 'Lens flare', category: 'Light', description: 'A small star-shaped flare at the left edge of the word.' },
  { id: '18', name: 'Dim neighbours', category: 'Light', description: 'The selected tab stays lit, the others drop to 20%.', rest: 20 },

  /* Glitch */
  { id: '19', name: 'RGB split', category: 'Glitch', description: 'Two offset colour copies flash for a beat, then vanish.' },
  { id: '20', name: 'Slice jitter', category: 'Glitch', description: 'The word breaks into three slices that shift briefly.' },
  { id: '21', name: 'Scan line', category: 'Glitch', description: 'A thin line scans down through the word.' },
  { id: '22', name: 'Noise flicker', category: 'Glitch', description: 'Letters swap for random glyphs for 200ms, then resolve.' },
  { id: '23', name: 'Stutter', category: 'Glitch', description: 'The word appears in a two-frame stepped reveal.' },
  { id: '24', name: 'Digital wipe', category: 'Glitch', description: 'Blocks of the word switch on across a coarse grid.' },

  /* Kinetic letters */
  { id: '25', name: 'Letter wave', category: 'Kinetic letters', description: 'Each letter rises in turn across the word.' },
  { id: '26', name: 'Letter stagger in', category: 'Kinetic letters', description: 'Letters fade in one by one from the baseline.' },
  { id: '27', name: 'Letter spread', category: 'Kinetic letters', description: 'The tracking opens from 0.2em to 0.5em.' },
  { id: '28', name: 'Letter weight wave', category: 'Kinetic letters', description: 'The weight ripples from 300 to 500 across the letters.' },
  { id: '29', name: 'Letter-coded bar', category: 'Kinetic letters', description: 'Each letter takes a colour by its position, like a bar chart.' },
  { id: '30', name: 'Letter lift', category: 'Kinetic letters', description: 'The first letter lifts and takes the accent; the rest stay put.' },

  /* Breathing and idle */
  { id: '31', name: 'Breathing scale', category: 'Breathing and idle', description: 'The word scales between 1.00 and 1.03 on a 4s cycle.' },
  { id: '32', name: 'Breathing brightness', category: 'Breathing and idle', description: 'The word pulses between 70% and 100% brightness.' },
  { id: '33', name: 'Idle drift', category: 'Breathing and idle', description: 'A slow, constant sideways drift of 2px.' },
  { id: '34', name: 'Heartbeat', category: 'Breathing and idle', description: 'A double pulse, then a pause.' },

  /* Spatial and particles */
  { id: '35', name: 'Depth lift', category: 'Spatial and particles', description: 'The word moves toward you: larger, with a soft shadow below.' },
  { id: '36', name: 'Dust dissolve', category: 'Spatial and particles', description: 'Eight fine particles drift off the word and fade.' },
];
