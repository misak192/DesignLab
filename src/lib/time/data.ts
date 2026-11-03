/**
 * File: src/lib/time/data.ts
 * Description: The sample life every design on /time draws: about a thousand dated records (memories) from 1992 to Oct 2026,
 * each with a label, a weight, a mood, a person and a place, plus the periods of that life (places lived, work and study, focus,
 * together). Pure TypeScript, seeded, so the server and the browser agree. The data is shaped on purpose: richer years
 * (2004, 2012, 2019), a "May effect", labels that swell and fade with the eras, and people who come and go.
 */

export const Y0 = 1992;
export const Y1 = 2026;
export const NY = Y1 - Y0 + 1;
/** Today (3 Nov 2026) as a fractional year. */
export const NOW = 2026.84;
/** Index of the last full month (Oct 2026) counted from Jan 1992. */
export const LAST_MONTH = (Y1 - Y0) * 12 + 9;
export const N_MONTHS = LAST_MONTH + 1;

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;
export const MONTH_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'] as const;
export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

export const LABELS = [
  { id: 'work', name: 'Work' },
  { id: 'learning', name: 'Learning' },
  { id: 'love', name: 'Love' },
  { id: 'travel', name: 'Travel' },
  { id: 'family', name: 'Family' },
  { id: 'health', name: 'Health' },
] as const;
export const NL = LABELS.length;

export const PEOPLE = [
  { name: 'Ania', from: 1992, to: 2027 },
  { name: 'Tomek', from: 1996, to: 2009 },
  { name: 'Maya', from: 2004, to: 2012 },
  { name: 'Jan', from: 1992, to: 2002 },
  { name: 'Ola', from: 2006, to: 2018 },
  { name: 'Leo', from: 2011, to: 2027 },
  { name: 'Sam', from: 2015, to: 2027 },
  { name: 'Zoe', from: 2019, to: 2027 },
] as const;

export type Lane = 'place' | 'work' | 'focus' | 'together';
export const LANES: { id: Lane; name: string }[] = [
  { id: 'place', name: 'Places' },
  { id: 'work', name: 'Work' },
  { id: 'focus', name: 'Focus' },
  { id: 'together', name: 'Together' },
];

export interface Period {
  id: string;
  lane: Lane;
  name: string;
  /** Fractional years. */
  start: number;
  end: number;
}

export const PERIODS: Period[] = [
  { id: 'p1', lane: 'place', name: 'Home town', start: 1992, end: 2006.7 },
  { id: 'p2', lane: 'place', name: 'University city', start: 2006.7, end: 2011.5 },
  { id: 'p3', lane: 'place', name: 'Lisbon', start: 2011.5, end: 2014.2 },
  { id: 'p4', lane: 'place', name: 'The capital', start: 2014.2, end: 2021.6 },
  { id: 'p5', lane: 'place', name: 'The coast', start: 2021.6, end: NOW },

  { id: 'w1', lane: 'work', name: 'School', start: 1992, end: 2005.5 },
  { id: 'w2', lane: 'work', name: 'Odd jobs', start: 2005.5, end: 2006.9 },
  { id: 'w3', lane: 'work', name: 'University', start: 2006.9, end: 2011.5 },
  { id: 'w4', lane: 'work', name: 'Studio', start: 2011.5, end: 2014.8 },
  { id: 'w5', lane: 'work', name: 'Agency', start: 2014.8, end: 2018.4 },
  { id: 'w6', lane: 'work', name: 'Own company', start: 2018.4, end: NOW },

  { id: 'f1', lane: 'focus', name: 'Drawing', start: 1992, end: 2003 },
  { id: 'f2', lane: 'focus', name: 'The band', start: 2003, end: 2010 },
  { id: 'f3', lane: 'focus', name: 'Thesis', start: 2010, end: 2011.6 },
  { id: 'f4', lane: 'focus', name: 'First app', start: 2011.6, end: 2016 },
  { id: 'f5', lane: 'focus', name: 'The novel', start: 2016, end: 2019.5 },
  { id: 'f6', lane: 'focus', name: 'Studio lab', start: 2019.5, end: NOW },

  { id: 't1', lane: 'together', name: 'Maya', start: 2005, end: 2012 },
  { id: 't2', lane: 'together', name: 'Sam', start: 2015, end: NOW },
];

export const periodsIn = (lane: Lane) => PERIODS.filter((p) => p.lane === lane);

export interface Memory {
  id: number;
  year: number;
  /** 0 to 11. */
  month: number;
  day: number;
  /** Fractional year. */
  t: number;
  /** 0 to 51. */
  week: number;
  /** 0 = Monday. */
  weekday: number;
  /** Index into LABELS. */
  label: number;
  /** 1 to 5. */
  weight: number;
  /** -1 to 1. */
  mood: number;
  /** Index into PEOPLE, or -1. */
  person: number;
  /** Index into the place periods. */
  place: number;
}

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const bump = (y: number, c: number, w: number, h: number) => h * Math.exp(-0.5 * ((y - c) / w) ** 2);
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const MONTH_RAW = [0.8, 0.7, 0.9, 1.0, 1.9, 1.3, 1.4, 1.2, 0.9, 0.9, 0.7, 1.1];
const MONTH_MEAN = MONTH_RAW.reduce((a, b) => a + b, 0) / 12;
const MONTH_W = MONTH_RAW.map((v) => v / MONTH_MEAN);

const yearBase = (y: number) =>
  9 + 22 / (1 + Math.exp(-(y - 2005) / 5)) + bump(y, 1999, 1, 9) + bump(y, 2004, 1, 12) + bump(y, 2012, 1.1, 18) + bump(y, 2019, 1, 14);

function labelWeight(l: number, y: number, m: number): number {
  switch (l) {
    case 0:
      return (0.15 + bump(y, 2016, 6, 0.9)) * (m >= 8 ? 1.4 : 1);
    case 1:
      return (0.2 + bump(y, 1998, 5, 0.8) + bump(y, 2008, 3, 0.9)) * (m === 8 || m === 9 ? 1.8 : 1);
    case 2:
      return (0.2 + bump(y, 2005, 2, 0.6) + bump(y, 2013, 2, 0.4) + bump(y, 2019, 3, 0.6)) * (m === 1 ? 1.8 : 1);
    case 3:
      return (0.12 + bump(y, 2011, 3, 0.7) + bump(y, 2017, 2, 0.7)) * (m >= 5 && m <= 7 ? 2.2 : m === 4 ? 1.8 : 1);
    case 4:
      return 0.3 + bump(y, 1995, 5, 0.6) + bump(y, 2022, 3, 0.6);
    default:
      return 0.08 + bump(y, 2020, 2, 0.35) + bump(y, 2003, 1, 0.2);
  }
}

const PLACES = PERIODS.filter((p) => p.lane === 'place');

function generate(): Memory[] {
  const r = rng(20261103);
  const out: Memory[] = [];
  for (let y = Y0; y <= Y1; y++) {
    for (let m = 0; m < 12; m++) {
      if (y === Y1 && m > 9) break;
      const lam = (yearBase(y) * MONTH_W[m]) / 12;
      const n = Math.floor(lam + r());
      for (let k = 0; k < n; k++) {
        const day = 1 + Math.floor(r() * 28);
        const doy = Math.round((Date.UTC(y, m, day) - Date.UTC(y, 0, 1)) / 86400000);
        const t = y + doy / 365;
        const ws = Array.from({ length: NL }, (_, l) => labelWeight(l, y, m));
        let pick = r() * ws.reduce((a, b) => a + b, 0);
        let label = 0;
        for (let l = 0; l < NL; l++) {
          pick -= ws[l];
          if (pick <= 0) {
            label = l;
            break;
          }
        }
        const weight = 1 + Math.floor(Math.pow(r(), 2.2) * 5);
        const mood = clamp(0.18 * Math.sin(t * 0.9) + (r() + r() - 1) * 0.85 + (label === 2 ? 0.18 : 0) + (label === 3 ? 0.15 : 0) + (label === 5 && y >= 2019 && y <= 2021 ? -0.3 : 0), -1, 1);
        let person = -1;
        if (r() < 0.5) {
          const active = PEOPLE.map((p, i) => (y >= p.from && y <= p.to ? i : -1)).filter((i) => i >= 0);
          if (active.length) person = active[Math.floor(r() * active.length)];
        }
        const place = Math.max(0, PLACES.findIndex((p) => t >= p.start && t < p.end));
        const weekday = (new Date(Date.UTC(y, m, day)).getUTCDay() + 6) % 7;
        out.push({ id: out.length, year: y, month: m, day, t, week: Math.min(51, Math.floor(doy / 7)), weekday, label, weight, mood, person, place });
      }
    }
  }
  return out;
}

export const MEMORIES: Memory[] = generate();

const zeros = (n: number) => Array.from({ length: n }, () => 0);
const grid = (r: number, c: number) => Array.from({ length: r }, () => zeros(c));

/** Records per [year][month]. */
export const BY_MONTH = grid(NY, 12);
/** Records per [year][week of year]. */
export const WEEKS = grid(NY, 52);
/** Records per [label][year]. */
export const LABEL_YEAR = grid(NL, NY);
/** Records per [month][label]. */
export const LABEL_MONTH = grid(12, NL);
/** Records per [weekday][month]. */
export const WEEKDAY_MONTH = grid(7, 12);
export const YEAR_TOTAL = zeros(NY);
export const MONTH_TOTAL = zeros(12);
/** Records per month since Jan 1992. */
export const DENSITY = zeros(N_MONTHS);
const moodSum = zeros(N_MONTHS);

for (const m of MEMORIES) {
  const yi = m.year - Y0;
  BY_MONTH[yi][m.month]++;
  WEEKS[yi][m.week]++;
  LABEL_YEAR[m.label][yi]++;
  LABEL_MONTH[m.month][m.label]++;
  WEEKDAY_MONTH[m.weekday][m.month]++;
  YEAR_TOTAL[yi]++;
  MONTH_TOTAL[m.month]++;
  const mi = yi * 12 + m.month;
  DENSITY[mi]++;
  moodSum[mi] += m.mood;
}
/** Average mood per month since Jan 1992 (0 where nothing was recorded). */
export const MOOD = moodSum.map((s, i) => (DENSITY[i] ? s / DENSITY[i] : 0));

export const MAX_MONTH = Math.max(...BY_MONTH.flat());
export const MAX_WEEK = Math.max(...WEEKS.flat());
export const MAX_YEAR = Math.max(...YEAR_TOTAL);
export const TOTAL = MEMORIES.length;
