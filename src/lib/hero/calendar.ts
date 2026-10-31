/**
 * File: src/lib/hero/calendar.ts
 * Description: The data behind the calendar test bench on /hero-titles: twelve months, their day counts and a total per
 * month. Pure TypeScript, no React or DOM. The calendar is a plain grid of days (no weekday offset, as in the
 * reference), so only the number of days matters.
 */

export interface CalendarMonth {
  /** 1 to 12. */
  n: number;
  name: string;
  days: number;
}

export const MONTHS: CalendarMonth[] = [
  ['January', 31], ['February', 28], ['March', 31], ['April', 30], ['May', 31], ['June', 30],
  ['July', 31], ['August', 31], ['September', 30], ['October', 31], ['November', 30], ['December', 31],
].map(([name, days], i) => ({ n: i + 1, name: name as string, days: days as number }));

/** What a month's header is made of; each part can take its own hero design. */
export type CalendarSlot = 'number' | 'name' | 'total';

export const SLOTS: { id: CalendarSlot; label: string }[] = [
  { id: 'number', label: 'Number' },
  { id: 'name', label: 'Name' },
  { id: 'total', label: 'Total' },
];

/** A small deterministic generator (mulberry32), so the server render and the first client render agree. */
function rng(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Twelve test totals of mixed length (1 to 4 digits), so every design meets short and long numbers. */
export function sampleTotals(random: () => number = rng(2026)): number[] {
  return MONTHS.map(() => {
    const digits = 1 + Math.floor(random() * 4);
    const top = 10 ** digits;
    return Math.max(1, Math.floor(random() * top));
  });
}

export const pad2 = (n: number) => String(n).padStart(2, '0');
