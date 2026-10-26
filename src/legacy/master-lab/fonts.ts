/**
 * File: src/legacy/master-lab/fonts.ts
 * Description: Extra typefaces. Body text stays in Inter (app/layout.tsx).
 */
import { Newsreader } from 'next/font/google';

// Reflective display serif for questions (the Master Lab post). Optical sizing keeps it crisp at headline sizes.
export const thoughtSerif = Newsreader({ subsets: ['latin', 'latin-ext'], axes: ['opsz'] });
