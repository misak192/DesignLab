/**
 * File: src/components/comments/seed.ts
 * Description: The starting conversation for /comments: five threads, up to seven levels deep, written by the eight
 * fake users. Original lines (not quotes), with starting votes so the last words already show a mix of colours
 * when the page opens. Long chains are there on purpose, to try the "Levels per tap" setting on.
 */
import type { FwComment } from '@/lib/fw-comments';

const MINUTE = 60_000;

// [id, parent id, author, minutes ago, up, down, text]
type Seed = [string, string | null, string, number, number, number, string];

const SEEDS: Seed[] = [
  // 1 · Samantha: double texting (seven levels deep on the Carrie / Miranda / Anthony line)
  ['t1', null, 'samantha', 360, 24, 3, 'Double texting is just confidence wearing main character energy.'],
  ['t1a', 't1', 'carrie', 300, 5, 1, 'Finally someone said it, I triple texted my situationship this morning.'],
  ['t1a1', 't1a', 'miranda', 290, 2, 0, 'Objectively this is how anxious attachment starts, not confidence.'],
  ['t1a1a', 't1a1', 'carrie', 240, 3, 2, "Fine, it's anxious attachment with excellent texting speed."],
  ['t1a1a1', 't1a1a', 'miranda', 235, 1, 0, "That's not the own you think it is."],
  ['t1a1a1a', 't1a1a1', 'anthony', 225, 4, 0, 'The own was never the point, the speed was.'],
  ['t1a1a1a1', 't1a1a1a', 'carrie', 215, 3, 1, 'Speed is the entire personality, thank you.'],
  ['t1a1a1a1a', 't1a1a1a1', 'nya', 205, 2, 0, 'Speed without a witness is just typing.'],
  ['t1a1a1a1a1', 't1a1a1a1a', 'charlotte', 195, 1, 3, 'I would like a witness for every text I send at midnight.'],
  ['t1b', 't1', 'charlotte', 230, 0, 6, 'Honestly the real crime is leaving someone on read for 3 days.'],
  ['t1b1', 't1b', 'samantha', 180, 3, 0, "Days plural means you've moved on, stop lying to yourself."],
  ['t1b1a', 't1b1', 'miranda', 170, 4, 0, 'Then the verdict is the days, not the text.'],
  ['t1b2', 't1b', 'seema', 200, 3, 2, 'On read for three days is a negotiating position, not a crime.'],
  ['t1c', 't1', 'miranda', 120, 7, 2, "Calling it confidence doesn't change the group chat evidence."],
  ['t1c1', 't1c', 'anthony', 110, 6, 0, 'The group chat is a jury that never adjourns and never reads the case file.'],
  ['t1c1a', 't1c1', 'seema', 100, 4, 1, 'Listing photos work the same way. Everyone is certain by the second picture.'],
  ['t1c1a1', 't1c1a', 'carrie', 95, 3, 0, 'And then you open the door and the kitchen is a hallway.'],
  ['t1c1a1a', 't1c1a1', 'seema', 90, 5, 0, 'Open concept, Carrie. Open concept.'],
  ['t1c1a1a1', 't1c1a1a', 'lisa', 85, 2, 0, 'I filmed that kitchen. It was a hallway with ambition.'],
  ['t1c2', 't1c', 'lisa', 105, 3, 2, 'My rule is one follow-up, then the phone goes in a drawer.'],
  ['t1c2a', 't1c2', 'samantha', 98, 1, 4, 'A drawer is just confidence with a lid on.'],
  ['t1c2a1', 't1c2a', 'nya', 92, 6, 1, 'Or boundaries, which you can write down and cite.'],

  // 2 · Charlotte: handwritten thank-you notes
  ['t2', null, 'charlotte', 150, 11, 4, 'Unpopular opinion: a handwritten thank-you note still beats any message you can send.'],
  ['t2a', 't2', 'carrie', 70, 4, 0, 'Handwritten, yes. Legible, rarely.'],
  ['t2a1', 't2a', 'charlotte', 60, 2, 0, "Legible is a love language I'm still learning."],
  ['t2a1a', 't2a1', 'anthony', 50, 4, 1, 'Calligraphy is just legible with a mortgage.'],
  ['t2b', 't2', 'lisa', 140, 5, 1, 'I write mine on postcards from the places we filmed.'],
  ['t2b1', 't2b', 'nya', 130, 3, 0, 'Postcards count as evidence. Keep the stamp.'],
  ['t2b1a', 't2b1', 'lisa', 120, 2, 0, 'The stamp is the best part. Nobody forges a stamp from 1998.'],
  ['t2c', 't2', 'seema', 100, 1, 3, 'A thank-you note that arrives after the closing is just a receipt.'],
  ['t2c1', 't2c', 'charlotte', 90, 3, 1, 'Receipts with feelings are my favourite kind.'],

  // 3 · Nya: reply-all
  ['t3', null, 'nya', 240, 14, 3, 'Hot take: reply-all should require a licence.'],
  ['t3a', 't3', 'anthony', 230, 6, 0, "A licence and a short written test about what 'unsubscribe' means."],
  ['t3a1', 't3a', 'miranda', 220, 5, 1, "I would add a waiting period. Twenty minutes, minimum, before anyone writes 'per my last email'."],
  ['t3a1a', 't3a1', 'nya', 210, 4, 0, 'Per my last email is a threat dressed as a citation.'],
  ['t3a1a1', 't3a1a', 'carrie', 200, 7, 1, "Everything I write is a threat dressed as a citation, and I'm told it's a column."],
  ['t3a1a1a', 't3a1a1', 'anthony', 190, 3, 0, 'A column is just reply-all with a byline.'],
  ['t3a1a1a1', 't3a1a1a', 'seema', 180, 2, 2, 'And no unsubscribe link.'],
  ['t3b', 't3', 'seema', 215, 3, 2, 'Reply-all saved a closing once. Once.'],
  ['t3b1', 't3b', 'nya', 205, 2, 1, 'Once is the exception that writes the legislation.'],
  ['t3c', 't3', 'charlotte', 175, 4, 0, 'Could the licence include a gentle reminder that everyone can see the CC line?'],
  ['t3c1', 't3c', 'lisa', 165, 3, 0, 'The BCC line is where friendships go to be tested.'],

  // 4 · Anthony: brunch
  ['t4', null, 'anthony', 90, 9, 6, 'Brunch has become a personality, and not a good one.'],
  ['t4a', 't4', 'samantha', 80, 2, 5, 'Brunch is the only meal where nobody asks what you do.'],
  ['t4a1', 't4a', 'anthony', 70, 4, 1, 'They ask what you did last night, which is worse.'],
  ['t4b', 't4', 'miranda', 75, 6, 0, 'Two hours, one bottomless anything, and a bill split nine ways. I would rather file taxes.'],
  ['t4b1', 't4b', 'charlotte', 65, 3, 1, 'Split nine ways is how I learned maths.'],
  ['t4b2', 't4b', 'seema', 60, 4, 0, 'Apps now split it for you. The dread remains.'],

  // 5 · Lisa: rewatching films
  ['t5', null, 'lisa', 45, 8, 0, 'Rewatching a favourite film after ten years is the cheapest time machine.'],
  ['t5a', 't5', 'nya', 35, 3, 0, 'And the most honest, because you are the one thing in it that changed.'],
  ['t5a1', 't5a', 'lisa', 25, 5, 0, "That's the part that gets me."],
  ['t5a1a', 't5a1', 'miranda', 20, 1, 0, 'Cheaper than therapy, and the popcorn is better.'],
];

export function createSeed(now: number): FwComment[] {
  return SEEDS.map(([id, parentId, authorId, minutesAgo, seedUp, seedDown, body]) => ({
    id,
    parentId,
    authorId,
    body,
    createdAt: now - minutesAgo * MINUTE,
    seedUp,
    seedDown,
  }));
}

// The Comments Room starts small, so there is something to read, vote on and answer from the first minute.
const ROOM_SEEDS: Seed[] = [
  ['r1', null, 'camila', 130, 9, 1, 'Does anyone else read the last page of a book first, or is that a crime?'],
  ['r1a', 'r1', 'haruto', 118, 4, 0, 'A crime, but a quiet one. I do it with recipes too.'],
  ['r1a1', 'r1a', 'lena', 105, 3, 1, 'Recipes I understand. Endings you can only survive once.'],
  ['r1a1a', 'r1a1', 'astrid', 96, 2, 0, 'Spoilers are just maps with the fun removed.'],
  ['r1b', 'r1', 'siobhan', 112, 6, 0, 'Bookseller here. Customers confess this to me weekly. I keep their secrets.'],
  ['r2', null, 'aarav', 75, 7, 2, 'Group chats are just meetings that never end.'],
  ['r2a', 'r2', 'chidi', 60, 5, 0, 'At least meetings have an agenda. Ours has memes and a birthday every day.'],
  ['r2b', 'r2', 'elif', 52, 3, 1, 'Mute is the only agenda item I attend.'],
  ['r3', null, 'michalku', 30, 11, 0, 'A building should be readable from the street before anyone walks in.'],
  ['r3a', 'r3', 'lena', 22, 4, 0, 'Same for a city. If the front door hides, people hide.'],
  ['r3b', 'r3', 'minjun', 14, 2, 0, 'Level design says the same: show the exit before you ask for courage.'],
];

export function createRoomSeed(now: number): FwComment[] {
  return ROOM_SEEDS.map(([id, parentId, authorId, minutesAgo, seedUp, seedDown, body]) => ({
    id,
    parentId,
    authorId,
    body,
    createdAt: now - minutesAgo * MINUTE,
    seedUp,
    seedDown,
  }));
}
