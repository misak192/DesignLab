/**
 * File: src/legacy/labs/comments/mockCommentLab.ts
 * Description: Posts and discussions for the Comments Lab (ObservaLyst's app/lab/comments).
 * Each experiment pairs a post with a different comment layout, plus a note explaining it.
 */
import type { CommentEntity, ObservationEntity } from '@/legacy/master-lab/types';
import { getMockObservations } from './mockObservations';
import { MINUTE, toComments, toObservation, type CommentSeed } from '@/legacy/master-lab/mockLabPeople';

export type CommentLayout = 'branches' | 'nested' | 'replies' | 'focus' | 'chat';

export interface LabExperiment {
  id: string;
  layout: CommentLayout;
  label: string;
  title: string;
  howItWorks: string;
  whyItWorks: string;
  watchOut: string;
  observation: ObservationEntity;
  comments: CommentEntity[];
}

// Built so the busiest reply is not always the first one: the main line has to be discovered.
const BAKER_THREAD: CommentSeed[] = [
  ['r1', null, 'priya', 12, "I've seen this before. The owner does it most mornings, it's not a one-off."],
  ['r1a', 'r1', 'tom', 20, 'Which bakery? The one by the Angel bus stop?'],
  ['r1a1', 'r1a', 'priya', 26, "That's the one, small place with the blue door."],
  ['r1a1a', 'r1a1', 'tom', 31, 'Going tomorrow before my shift. Places like that deserve the business.'],
  ['r1a1a1', 'r1a1a', 'jana', 44, 'Go early, their sourdough is gone by 9.'],
  ['r1a1a1a', 'r1a1a1', 'tom', 47, '7am it is then.'],
  ['r1a2', 'r1a', 'marek', 29, 'Blue door, yes. They also drop their leftovers at the shelter on Essex Road every evening.'],
  ['r1a2a', 'r1a2', 'priya', 35, "I didn't know that. Is it organised, or just them?"],
  ['r1a2a1', 'r1a2a', 'marek', 41, 'Just them. Most bakeries bin it because they think hygiene rules forbid donating.'],
  ['r1a2a1a', 'r1a2a1', 'aisha', 58, 'Food inspector here: donating unsold bread is allowed. Proper labelling is the part people get wrong.'],
  ['r1a2a1a1', 'r1a2a1a', 'jana', 66, 'Wait, really? My café throws out a whole tray every night.'],
  ['r1a2a1a1a', 'r1a2a1a1', 'aisha', 71, 'Ask your manager. Date it, keep it covered, and a shelter will usually collect.'],
  ['r1a2a1a1a1', 'r1a2a1a1a', 'jana', 95, "Asked. We're trying it from Monday!"],
  ['r1a2a1b', 'r1a2a1', 'sarah', 62, 'Our school kitchen has the same problem. Sharing this with the head.'],
  ['r1b', 'r1', 'dan', 18, "Nice, but doesn't posting it online kind of ruin the quiet part?"],
  ['r1b1', 'r1b', 'michalku', 24, 'Fair point. No names, no photos. I just wanted people to know it still happens.'],
  ['r1b1a', 'r1b1', 'dan', 30, "That's reasonable, actually."],
  ['r1b2', 'r1b', 'sarah', 33, "I'd rather read this than another angry post about the council."],
  ['r2', null, 'ellie', 15, "Lovely, but one loaf doesn't fix why he's sleeping outside."],
  ['r2a', 'r2', 'marek', 22, 'Both can be true. Help today, pressure on the council for the rest.'],
  ['r2a1', 'r2a', 'ellie', 27, "Agreed. There's a referral service for people sleeping rough, worth using if you see someone."],
  ['r2a1a', 'r2a1', 'tom', 34, "Didn't know that existed. How fast do they come?"],
  ['r2a1a1', 'r2a1a', 'ellie', 40, 'Usually within a few days. It still makes a real difference.'],
  ['r2b', 'r2', 'dan', 25, 'Not every good moment needs a policy debate.'],
  ['r2b1', 'r2b', 'ellie', 38, "True. I just don't want it to stop at the loaf."],
  ['r3', null, 'jana', 9, 'Made my morning, honestly.'],
];

const TRAFFIC_THREAD: CommentSeed[] = [
  ['t1', null, 'oliver', 6, 'Electrician here. The whole block lost power around 8, the lights probably went with it.'],
  ['t1a', 't1', 'kwame', 10, 'That explains my flat. Any idea how long?'],
  ['t1a1', 't1a', 'oliver', 14, "Usually an hour or two if it's a substation fault."],
  ['t1a1a', 't1a1', 'kwame', 19, 'Great, my laptop is on 4%.'],
  ['t1a1a1', 't1a1a', 'mei', 23, 'The library on Mare Street has power and free wifi.'],
  ['t1a1a1a', 't1a1a1', 'kwame', 26, 'Legend. Heading there now.'],
  ['t1b', 't1', 'nadia', 17, 'Our pharmacy fridges run on backup. If anyone needs medicine kept cold, come by.'],
  ['t1b1', 't1b', 'ruth', 30, "That's very kind of you."],
  ['t2', null, 'sam', 8, 'Cycled through it. Honestly calmer than when the lights work.'],
  ['t2a', 't2', 'dan', 13, 'Until one person decides they have priority.'],
  ['t2a1', 't2a', 'sam', 18, "Didn't happen once in 20 minutes. People were waving each other through."],
  ['t2b', 't2', 'ruth', 21, 'A young man in a hi-vis jacket was directing traffic. Not police, he just stepped in.'],
  ['t2b1', 't2b', 'sarah', 25, 'Yes! Blue hi-vis. He was brilliant.'],
  ['t3', null, 'leo', 40, 'My dogs hated it. Every car horn set them off.'],
];

const CINEMA_THREAD: CommentSeed[] = [
  ['v1', null, 'jana', 5, 'Do you know what film they are showing?'],
  ['v1a', 'v1', 'leo', 9, 'Locals vote on it, the result comes out on Friday.'],
  ['v1a1', 'v1a', 'mei', 15, 'I voted for Paddington 2, no regrets.'],
  ['v1a1a', 'v1a1', 'tom', 20, 'Paddington 2 is a perfect film.'],
  ['v1b', 'v1', 'kwame', 12, 'Last year it was Jaws. Brave choice next to a lake.'],
  ['v2', null, 'priya', 7, 'Are dogs allowed?'],
  ['v2a', 'v2', 'leo', 11, "Yes, on a lead. I'll be there with three of them."],
  ['v2a1', 'v2a', 'priya', 16, 'Three! Save me a spot.'],
  ['v3', null, 'ruth', 18, "Is there seating for people who can't sit on the grass?"],
  ['v3a', 'v3', 'sarah', 24, 'There were benches at the back last year.'],
  ['v3a1', 'v3a', 'ruth', 29, 'Lovely, thank you.'],
  ['v4', null, 'sam', 31, 'The bike racks by the east gate fill up fast.'],
];

const BUS_THREAD: CommentSeed[] = [
  ['b1', null, 'tom', 8, 'Bus driver, different route. Half the fleet is in for repairs, so drivers skip stops to stay on time.'],
  ['b1a', 'b1', 'nadia', 12, "So it's the timetable, not the drivers?"],
  ['b1a1', 'b1a', 'tom', 17, 'Mostly. We get flagged for running late, and skipping a stop is the only way to catch up.'],
  ['b1a1a', 'b1a1', 'dan', 22, "That's a terrible incentive."],
  ['b1a1a1', 'b1a1a', 'tom', 28, 'It is. Report the skipped stops, the complaints do reach the people who plan timetables.'],
  ['b1a1b', 'b1a1', 'ellie', 25, 'Two of my elderly clients were left waiting this week.'],
  ['b1b', 'b1', 'sam', 15, "Riding past, I've seen three 38s in a row, then nothing for 20 minutes."],
  ['b1b1', 'b1b', 'tom', 20, 'Bunching. When one bus is late, the ones behind catch up with it.'],
  ['b2', null, 'ruth', 10, 'Waited 35 minutes yesterday. Walked in the end.'],
  ['b2a', 'b2', 'priya', 19, 'Same at the Angel end.'],
  ['b3', null, 'mei', 33, 'A live bus map shows the gaps. It helps a bit.'],
  ['b3a', 'b3', 'nadia', 38, 'Which app?'],
  ['b3a1', 'b3a', 'mei', 44, 'The official transport app has it under live arrivals.'],
];

const POWER_CUT_THREAD: CommentSeed[] = [
  ['p1', null, 'mei', 1, 'Same on Coldharbour Lane.'],
  ['p2', null, 'oliver', 2, 'Electrician here. Probably the substation, the whole area looks dark.'],
  ['p3', 'p1', 'kwame', 3, "Coldharbour too? That's big."],
  ['p4', null, 'ruth', 4, 'Is it safe to open the freezer?'],
  ['p5', 'p4', 'oliver', 5, "Keep it shut. A full freezer stays cold for a day or more if you don't open it."],
  ['p6', null, 'sam', 6, 'Traffic lights on Acre Lane are out, careful out there.'],
  ['p7', 'p2', 'kwame', 8, 'Any idea how long?'],
  ['p8', 'p7', 'oliver', 9, 'The network operator has an outage map with estimates.'],
  ['p9', null, 'priya', 11, 'My hospital shift starts at 10, hope transport is running.'],
  ['p10', 'p9', 'tom', 12, 'Buses are running normally, I just drove through.'],
  ['p11', 'p6', 'dan', 14, 'Police just arrived at Acre Lane.'],
  ['p12', null, 'mei', 21, 'Lights back on here!'],
  ['p13', 'p12', 'kwame', 22, 'Back here too. Thanks everyone.'],
];

export function getLabExperiments(): LabExperiment[] {
  const now = Date.now();
  const minutesAgo = (minutes: number) => now - minutes * MINUTE;

  // The two posts from the home feed, moved back in time so their discussions had time to grow.
  const [baker, traffic] = getMockObservations();
  const bakerPost = { ...baker, id: 'lab-baker', created_at: new Date(minutesAgo(180)).toISOString() };
  const trafficPost = { ...traffic, id: 'lab-traffic', created_at: new Date(minutesAgo(95)).toISOString() };
  const cinemaPost = toObservation('lab-cinema', 'leo', minutesAgo(50), 'Hackney Wick', 'Free outdoor cinema in Victoria Park this Saturday. Bring a blanket, it starts at sunset.');
  const busPost = toObservation('lab-bus', 'nadia', minutesAgo(70), 'Islington', 'Is it just me, or has the 38 bus been skipping stops on Essex Road all week?');
  const powerCutPost = toObservation('lab-power-cut', 'kwame', minutesAgo(25), 'Brixton', 'Power just went out on our street in Brixton. Anyone else?');

  return [
    {
      id: 'branches',
      layout: 'branches',
      label: 'Lab 01 · Branches',
      title: 'Your idea: conversations as branches',
      howItWorks: 'Each thread reads like a git branch. The line you see first is the main branch: from every comment it follows the reply that sparked the most discussion. Other replies wait as side branches, and opening one shows it as its own line.',
      whyItWorks: 'You read one conversation from start to finish instead of zig-zagging through indents. The liveliest discussion becomes the main line on its own, with no votes, and a side branch that grows bigger takes over automatically.',
      watchOut: '"Most replies" can also mean "biggest argument". Later, resonance could decide which reply leads a branch.',
      observation: bakerPost,
      comments: toComments(bakerPost, BAKER_THREAD),
    },
    {
      id: 'nested',
      layout: 'nested',
      label: 'Lab 02 · Nested threads',
      title: 'The Reddit classic',
      howItWorks: 'Every reply sits indented under the comment it answers. Tap the thin line on the left of a thread to fold it away. After four levels, the rest waits behind "Continue this thread".',
      whyItWorks: 'You see the whole shape of the discussion at once, and everyone already knows how it works.',
      watchOut: 'Deep threads turn into a staircase squeezed to the right, which is painful on a phone. The best reply is often buried five levels down.',
      observation: trafficPost,
      comments: toComments(trafficPost, TRAFFIC_THREAD),
    },
    {
      id: 'replies',
      layout: 'replies',
      label: 'Lab 03 · Replies under comments',
      title: 'The Instagram & Facebook way',
      howItWorks: 'Only two levels. Top comments come first, and every reply below them, however deep, sits in one flat list behind "View replies" with a note saying who it answers.',
      whyItWorks: 'Calm and very easy on a phone. Nothing ever indents more than once, so quick reactions stay tidy.',
      watchOut: 'Side conversations get mixed into one list, so a longer back-and-forth becomes hard to follow.',
      observation: cinemaPost,
      comments: toComments(cinemaPost, CINEMA_THREAD),
    },
    {
      id: 'focus',
      layout: 'focus',
      label: 'Lab 04 · Focus mode',
      title: 'The X & Threads way',
      howItWorks: 'You see one comment and its direct replies, nothing more. Step into a reply to make it the focus; the trail at the top shows how you got there and takes you back.',
      whyItWorks: 'Big, readable text and one step at a time. You always know where you are in the conversation.',
      watchOut: 'You only ever see one level, so exploring a big discussion takes a lot of tapping and you lose the overview.',
      observation: busPost,
      comments: toComments(busPost, BUS_THREAD),
    },
    {
      id: 'chat',
      layout: 'chat',
      label: 'Lab 05 · Live chat',
      title: 'The WhatsApp & Discord way',
      howItWorks: 'Every comment in time order, like a group chat. A reply carries a small quote of the message it answers.',
      whyItWorks: 'It feels live. Perfect for fast local moments like a power cut, where what matters is what is happening right now.',
      watchOut: 'Once many people join, several conversations run through each other and it gets noisy.',
      observation: powerCutPost,
      comments: toComments(powerCutPost, POWER_CUT_THREAD),
    },
  ];
}
