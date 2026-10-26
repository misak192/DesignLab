/**
 * File: src/lib/fw-comments/palette.ts
 * Description: Colours for the letter-coded comments: the fixed accent per person, the default and colour-blind
 * vote palettes, and the maths that turns an abstract Tone into an opaque colour. Text colours are always opaque
 * (the design book allows no alpha on text), so every "soft" tint is a computed hex, never an rgba.
 * Pure TypeScript, no React or DOM.
 */
import type { Tone } from './letters';

/** The canvas the soft vote tints are mixed against. */
export const CANVAS = '#0a0a0f';
/** The light-mode canvas. */
export const CANVAS_LIGHT = '#f4f4f7';

export interface Person {
  id: string;
  name: string;
  role: string;
  /** Where they are, shown after the occupation in the revealed line. */
  place: string;
  /** Fixed for the person: the same hue every time they appear. Never shared inside one thread. */
  accent: string;
}

/** Eight fake users with fixed accents: the first four from the Comment Color Mockups, then four more for longer threads. Eight distinct hues, none shared. */
export const PEOPLE: Person[] = [
  { id: 'samantha', name: 'Samantha', role: 'PR director', place: 'Meatpacking District', accent: '#8f6bff' },
  { id: 'carrie', name: 'Carrie', role: 'Columnist', place: 'West Village', accent: '#ff8a5c' },
  { id: 'miranda', name: 'Miranda', role: 'Attorney', place: 'Brooklyn Heights', accent: '#5cc9ff' },
  { id: 'charlotte', name: 'Charlotte', role: 'Gallery curator', place: 'Upper East Side', accent: '#ff6fb0' },
  { id: 'seema', name: 'Seema', role: 'Real estate broker', place: 'Upper West Side', accent: '#ffd24d' },
  { id: 'lisa', name: 'Lisa', role: 'Documentary filmmaker', place: 'Harlem', accent: '#3fe0b0' },
  { id: 'nya', name: 'Nya', role: 'Law professor', place: 'Park Slope', accent: '#b6f05a' },
  { id: 'anthony', name: 'Anthony', role: 'Podcast host', place: 'Greenwich Village', accent: '#e08bff' },
];

const channel = (hex: string, i: number) => parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16);
const toHex = (n: number) => Math.round(n).toString(16).padStart(2, '0');

/** Opaque mix of two #rrggbb colours: `t` is how much of `b` (0 to 1). */
export function mix(a: string, b: string, t: number): string {
  return '#' + [0, 1, 2].map((i) => toHex(channel(a, i) * (1 - t) + channel(b, i) * t)).join('');
}

/** A lighter tint of a colour, used for the newest letter of an accent meter. */
export const tint = (hex: string, amount = 0.4) => mix(hex, '#ffffff', amount);

export interface VotePalette {
  up: string;
  upSoft: string;
  down: string;
  downSoft: string;
}

// The mockup's soft tints were the deeper colour at 67% alpha over the canvas; here that is mixed once into an opaque hex.
const soften = (deeper: string, canvas = CANVAS) => mix(canvas, deeper, 0.67);

export const PALETTES = {
  standard: { up: '#8fd4a0', upSoft: soften('#5fb577'), down: '#ef8a8a', downSoft: soften('#e05a5a') },
  // Blue / orange instead of green / red, for colour-blind readers.
  colourBlind: { up: '#8ec6ff', upSoft: soften('#5aa8ff'), down: '#ffc27a', downSoft: soften('#ff9e3d') },
} satisfies Record<string, VotePalette>;

export type PaletteName = keyof typeof PALETTES;

// The same two palettes for a pale page: deeper colours, softened toward the light canvas.
const LIGHT_PALETTES = {
  standard: { up: '#2b8a4a', upSoft: soften('#5fb57f', CANVAS_LIGHT), down: '#c43d3d', downSoft: soften('#e07a7a', CANVAS_LIGHT) },
  colourBlind: { up: '#1f6fd0', upSoft: soften('#5aa0ee', CANVAS_LIGHT), down: '#b86400', downSoft: soften('#e8923a', CANVAS_LIGHT) },
} satisfies Record<PaletteName, VotePalette>;

/** The vote palette for a name, on a dark or a light page. */
export const votePaletteFor = (name: PaletteName, light: boolean): VotePalette => (light ? LIGHT_PALETTES : PALETTES)[name];

/** A person's accent as it should be drawn: bright on a dark page, darkened toward black on a light one so it still reads. */
export const accentFor = (accent: string, light: boolean): string => (light ? mix(accent, '#000000', 0.38) : accent);

/** The colour of a tone for one person, or null for plain ink and for the identity gradient (drawn by the UI). */
export function toneColour(tone: Tone, accent: string, palette: VotePalette): string | null {
  switch (tone) {
    case 'accent':
      return accent;
    case 'accentSoft':
      return tint(accent);
    case 'up':
    case 'upSoft':
    case 'down':
    case 'downSoft':
      return palette[tone];
    default:
      return null;
  }
}

/** HSL (degrees, 0-1, 0-1) to #rrggbb. */
function hslToHex(h: number, s: number, l: number): string {
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return '#' + [f(0), f(8), f(4)].map((v) => toHex(v * 255)).join('');
}

/**
 * An accent for the nth person of a roster: hues are spread by the golden angle, so any number of people get colours
 * that stay far apart (nobody picks one; a paid VIP badge could one day let a person choose their own).
 */
export const hueAccent = (index: number): string => hslToHex((20 + index * 137.508) % 360, 0.78, 0.66);

const roomPerson = (index: number, id: string, name: string, role: string, place: string): Person => ({
  id,
  name,
  role,
  place,
  accent: hueAccent(index),
});

/** The Comments Room roster: names from all over, each with a fixed, automatically assigned colour. */
export const ROOM_PEOPLE: Person[] = [
  roomPerson(0, 'michalku', 'Michalku', 'Architect', 'Kraków, Poland'),
  roomPerson(1, 'haruto', 'Haruto', 'Ramen chef', 'Osaka, Japan'),
  roomPerson(2, 'chidi', 'Chidi', 'Software engineer', 'Lagos, Nigeria'),
  roomPerson(3, 'camila', 'Camila', 'Marine biologist', 'Recife, Brazil'),
  roomPerson(4, 'aarav', 'Aarav', 'Chartered accountant', 'Pune, India'),
  roomPerson(5, 'mateo', 'Mateo', 'Street photographer', 'Mexico City, Mexico'),
  roomPerson(6, 'lena', 'Lena', 'Urban planner', 'Hamburg, Germany'),
  roomPerson(7, 'elif', 'Elif', 'Pastry chef', 'İzmir, Türkiye'),
  roomPerson(8, 'minjun', 'Min-jun', 'Game designer', 'Busan, South Korea'),
  roomPerson(9, 'amara', 'Amara', 'Midwife', 'Nairobi, Kenya'),
  roomPerson(10, 'siobhan', 'Siobhan', 'Bookseller', 'Galway, Ireland'),
  roomPerson(11, 'astrid', 'Astrid', 'Glaciologist', 'Tromsø, Norway'),
];

/** Who votes in the Comments Lab, where nobody posts: a reader who is none of the characters. */
export const LAB_VIEWER: Person = { id: 'viewer', name: 'You', role: 'Reader', place: '', accent: '#ffffff' };
