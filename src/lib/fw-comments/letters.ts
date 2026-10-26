/**
 * File: src/lib/fw-comments/letters.ts
 * Description: The letter-coding rules of the FrissonWorks comment system, as pure functions with no React or DOM.
 * A comment's FIRST word carries identity (a gradient, or a fill-meter of one hue) and its LAST word carries the
 * vote ratio, letter by letter. One fade/solid rule drives every meter: while a count is climbing and under the
 * word's capacity, every coloured letter is solid except the newest, which is a softer tint ("still growing");
 * once the count fills or overflows the word, every coloured letter goes solid ("settled").
 *
 * Source of truth: the "Letter-coded identity & votes" chapter of FW Comments · Design and the Comment Color
 * Mockups artefact (see CLAUDE.md). Meant to move into @frissonworks/comments unchanged, so keep it dependency-free.
 */

/**
 * What colour a letter wears, kept abstract so the palette (default or colour-blind) is chosen at render time.
 * - ink: plain text colour, nothing coded
 * - identity: the person's accent fading to white, across the whole word
 * - accent / accentSoft: the person's accent, solid or the newest "still growing" letter
 * - up / down (+ Soft): vote colours, solid or the newest letter
 */
export type Tone = 'ink' | 'identity' | 'accent' | 'accentSoft' | 'up' | 'upSoft' | 'down' | 'downSoft';

export interface Run {
  text: string;
  tone: Tone;
}

/** How the first word is coded: the identity gradient, or a one-hue meter filled `count` letters deep. */
export type FirstWordMode = { kind: 'identity' } | { kind: 'meter'; count: number };

export interface ComposeOptions {
  up: number;
  down: number;
  first: FirstWordMode;
}

const isLetter = (ch: string) => /[\p{L}\p{N}]/u.test(ch);

/** A word split from the punctuation around it, so only letters count towards a word's capacity. */
export interface Word {
  lead: string;
  core: string;
  trail: string;
}

export interface ParsedComment {
  first: Word;
  /** Everything between the first and last word, including the spaces next to them. */
  middle: string;
  /** Null for a one-word comment: the first word is also the last, and identity wins. */
  last: Word | null;
}

function splitWord(token: string): Word {
  const chars = Array.from(token);
  let start = 0;
  let end = chars.length;
  while (start < end && !isLetter(chars[start])) start++;
  while (end > start && !isLetter(chars[end - 1])) end--;
  if (start === end) return { lead: token, core: '', trail: '' };
  return { lead: chars.slice(0, start).join(''), core: chars.slice(start, end).join(''), trail: chars.slice(end).join('') };
}

export function parseComment(body: string): ParsedComment {
  const text = body.trim().normalize('NFC');
  const firstEnd = text.search(/\s/);
  if (firstEnd === -1) return { first: splitWord(text), middle: '', last: null };

  const lastStart = text.search(/\S+$/);
  return {
    first: splitWord(text.slice(0, firstEnd)),
    middle: text.slice(firstEnd, lastStart),
    last: splitWord(text.slice(lastStart)),
  };
}

/**
 * How many of a word's letters go green and how many red.
 * Under capacity the counts are literal (3 up + 1 down = 3 green + 1 red); at or past capacity they become a
 * proportional ratio scaled to fill the word (10 up / 3 down on 10 letters = 8 green / 2 red) instead of growing forever.
 */
export function voteSplit(up: number, down: number, capacity: number): { green: number; red: number } {
  if (capacity <= 0) return { green: 0, red: 0 };
  const total = up + down;
  if (total < capacity) return { green: up, red: down };
  const green = Math.min(Math.round((up / total) * capacity), capacity);
  return { green, red: capacity - green };
}

/** One tone per letter of a word of `capacity` letters. The colour fills from the word's end: green first, then red. */
export function voteTones(capacity: number, up: number, down: number): Tone[] {
  const { green, red } = voteSplit(up, down, capacity);
  const coloured = green + red;
  const plain = Math.max(0, capacity - coloured);
  const settled = coloured >= capacity;

  return Array.from({ length: capacity }, (_, i): Tone => {
    if (i < plain) return 'ink';
    const pos = i - plain;
    const newest = pos === coloured - 1 && !settled;
    if (pos < green) return newest ? 'upSoft' : 'up';
    return newest ? 'downSoft' : 'down';
  });
}

/** One tone per letter for a single-hue meter: `count` letters lit from the start, the newest one soft until full. */
export function meterTones(capacity: number, count: number): Tone[] {
  const lit = Math.max(0, Math.min(count, capacity));
  const settled = lit >= capacity;

  return Array.from({ length: capacity }, (_, i): Tone => {
    if (i >= lit) return 'ink';
    return i === lit - 1 && !settled ? 'accentSoft' : 'accent';
  });
}

/** Spread per-letter tones over a word's characters. Characters inside a word that aren't letters (the ' in "don't") join their neighbours. */
function wordRuns(core: string, letterTones: Tone[]): Run[] {
  const chars = Array.from(core);
  const letterIndexes = chars.flatMap((ch, i) => (isLetter(ch) ? [i] : []));
  const toneAt = (charIndex: number): Tone => {
    const ordinal = letterIndexes.indexOf(charIndex);
    if (ordinal >= 0) return letterTones[ordinal] ?? 'ink';
    const before = letterIndexes.filter((i) => i < charIndex).length - 1;
    const after = before + 1;
    const a = letterTones[before] ?? 'ink';
    return a === letterTones[after] ? a : 'ink';
  };
  return chars.map((ch, i) => ({ text: ch, tone: toneAt(i) }));
}

function merge(runs: Run[]): Run[] {
  const merged: Run[] = [];
  runs.forEach((run) => {
    if (!run.text) return;
    const prev = merged[merged.length - 1];
    if (prev && prev.tone === run.tone) prev.text += run.text;
    else merged.push({ ...run });
  });
  return merged;
}

/** Turn a comment body into coloured runs: first word coded as asked, last word coded by its votes, the rest plain. */
export function composeComment(body: string, { up, down, first }: ComposeOptions): Run[] {
  const { first: firstWord, middle, last } = parseComment(body);
  const firstCapacity = Array.from(firstWord.core).filter(isLetter).length;

  const firstRuns: Run[] =
    first.kind === 'identity'
      ? [{ text: firstWord.core, tone: 'identity' }]
      : wordRuns(firstWord.core, meterTones(firstCapacity, first.count));

  const runs: Run[] = [{ text: firstWord.lead, tone: 'ink' }, ...firstRuns, { text: firstWord.trail, tone: 'ink' }];

  if (last) {
    const lastCapacity = Array.from(last.core).filter(isLetter).length;
    runs.push(
      { text: middle, tone: 'ink' },
      { text: last.lead, tone: 'ink' },
      ...wordRuns(last.core, voteTones(lastCapacity, up, down)),
      { text: last.trail, tone: 'ink' }
    );
  }

  return merge(runs);
}

/**
 * How a person's NAME is coded, by the same rule as a sentence's first word. Once they have posted at least as many
 * times in the thread as the name has letters, every letter is solid; before that the name follows the sentence-start
 * treatment: the identity gradient, or (with the participation test on) a meter of their posts, the newest letter soft.
 */
export function nameFirstMode(name: string, posts: number, participation: boolean): FirstWordMode {
  const capacity = Array.from(name).filter(isLetter).length;
  if (posts >= capacity || participation) return { kind: 'meter', count: posts };
  return { kind: 'identity' };
}

/** The quiet, colour-independent fallback shown on every collapsed row. */
export function formatNet(up: number, down: number): string {
  const net = up - down;
  if (net === 0) return '0';
  return net > 0 ? `+${net}` : `−${Math.abs(net)}`;
}
