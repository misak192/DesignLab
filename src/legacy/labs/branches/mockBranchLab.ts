/**
 * File: src/legacy/labs/branches/mockBranchLab.ts
 * Description: The Branches Lab (ObservaLyst's app/lab/branches): one local debate with starting votes,
 * shown through several branching layouts.
 */
import type { CommentEntity, ObservationEntity } from '@/legacy/master-lab/types';
import { MINUTE, toObservation, toVotedComments, type VotedSeed } from '@/legacy/master-lab/mockLabPeople';

export type BranchLayout = 'ranked' | 'columns' | 'rows' | 'story' | 'pyramid' | 'switcher';

export interface BranchExperiment {
  id: string;
  layout: BranchLayout;
  label: string;
  title: string;
  howItWorks: string;
  whyItWorks: string;
  watchOut: string;
  observation: ObservationEntity;
  comments: CommentEntity[];
  // Starting score per comment id (up minus down votes).
  votes: Record<string, number>;
}

// Scores are close on purpose: a couple of clicks is enough to change which reply leads.
const UPPER_STREET_DEBATE: VotedSeed[] = [
  ['a', null, 'marek', 8, 24, "Yes. Our terrace would double on weekends, and people linger when there's no traffic noise."],
  ['a1', 'a', 'dan', 20, 9, "Until deliveries can't get in and your kitchen runs out of stock on a Saturday."],
  ['a1a', 'a1', 'marek', 26, 12, 'Deliveries before 10am stay allowed in the plan. That is when we get ours anyway.'],
  ['a1a1', 'a1a', 'sam', 41, 15, "Courier here. A 10am cutoff works for restaurants, not for parcels. We'd need a loading bay at each end."],
  ['a1a1a', 'a1a1', 'mei', 55, 8, 'Two loading bays and a cargo-bike hub would solve most of that. Other cities already do it.'],
  ['a1a1a1', 'a1a1a', 'sam', 63, 6, "A cargo-bike hub I'd actually use. Put that in the proposal."],
  ['a1a1b', 'a1a1', 'dan', 70, 3, 'So it costs money before it saves any.'],
  ['a1b', 'a1', 'jana', 35, 4, "Our café is two doors down from Marek's. Saturday deliveries are rare, most come on Monday."],
  ['a2', 'a', 'priya', 15, 7, 'Quieter street, cleaner air. Fewer fumes would help people with asthma.'],
  ['a2a', 'a2', 'nadia', 44, 5, 'Agreed. Traffic fumes make a real difference for people with breathing problems.'],
  ['b', null, 'ellie', 11, 19, 'Not without a plan for disabled access. Some of my clients can only get there by car or taxi.'],
  ['b1', 'b', 'ruth', 18, 11, 'Blue badge holders and taxis could keep access. Would that work for them?'],
  ['b1a', 'b1', 'ellie', 30, 14, 'Mostly, if drop-off points are close to the shops. Twenty metres, not two hundred.'],
  ['b1a1', 'b1a', 'michalku', 52, 10, 'Architect here. Drop-off bays every 80 to 100 metres would fit without losing the car-free feel.'],
  ['b1a1a', 'b1a1', 'ellie', 80, 9, "If that's written into the plan, I'd support it."],
  ['b2', 'b', 'kwame', 24, 2, 'Buses would still run though, right?'],
  ['b2a', 'b2', 'tom', 33, 8, "The plan keeps two bus routes running slowly through. I'd be driving one of them."],
  ['c', null, 'tom', 14, 11, "Buses already crawl there on Saturdays. If we keep a proper bus lane, I'm in."],
  ['c1', 'c', 'sam', 38, 6, 'And cyclists? Sharing a car-free street with buses gets tense.'],
  ['c1a', 'c1', 'tom', 47, 7, "Separate lanes with a kerb. Painted lines don't work."],
  ['d', null, 'dan', 22, 6, 'Shops will lose customers who drive in from outside the borough.'],
  ['d1', 'd', 'mei', 29, 10, 'Streets that went car-free usually got more visitors, not fewer.'],
  ['d1a', 'd1', 'dan', 36, 3, "Usually. Upper Street isn't usual."],
  ['d2', 'd', 'jana', 58, 5, 'Most of our customers walk. The ones who drive park badly and leave.'],
  ['e', null, 'kwame', 60, 3, 'Can we have street food stalls? Asking on a student budget.'],
  ['e1', 'e', 'marek', 75, 4, 'Keep the stalls away from restaurant fronts and we have a deal.'],
];

type ExperimentCopy = Pick<BranchExperiment, 'id' | 'layout' | 'label' | 'title' | 'howItWorks' | 'whyItWorks' | 'watchOut'>;

const EXPERIMENTS: ExperimentCopy[] = [
  {
    id: 'ranked',
    layout: 'ranked',
    label: 'Lab 01 · Branches 2.0',
    title: 'Your branches, now with votes',
    howItWorks: 'The git-style lanes from the Comments Lab, ranked by votes. The main line follows the highest-voted reply, and every split hides behind a small "more".',
    whyItWorks: 'Vote a side reply above the main one and the whole branch re-routes through it, right in front of you.',
    watchOut: 'Long branches still grow tall, so it is a lot of scrolling on a phone.',
  },
  {
    id: 'columns',
    layout: 'columns',
    label: 'Lab 02 · Side by side',
    title: 'Main branches next to each other',
    howItWorks: 'Only the start of each main branch, side by side with the best on the left. The arrow under a branch opens its conversation below it.',
    whyItWorks: 'Every direction the discussion took is visible at a glance, and you open only the ones you care about.',
    watchOut: 'On a phone only one column fits at a time, so it becomes a sideways swipe.',
  },
  {
    id: 'rows',
    layout: 'rows',
    label: 'Lab 03 · Matrix',
    title: 'Main branches as rows',
    howItWorks: 'Each main branch is one compact row: rank, votes, who said it, one line of text, and how many replies. The arrow opens the branch under its row.',
    whyItWorks: 'Scannable like a table. All the branches fit on one screen, and you can watch them swap places as votes change.',
    watchOut: 'One line of text can hide what a branch is really about.',
  },
  {
    id: 'story',
    layout: 'story',
    label: 'Lab 04 · Story mode',
    title: 'The best dialogues, told line by line',
    howItWorks: 'Press play and the top three branches write themselves out: the best comment, the best reply to it, the best reply to that, and so on.',
    whyItWorks: 'It turns a messy comment section into a story you can follow. A great summary for anyone arriving late.',
    watchOut: 'Watching text type out gets old quickly, so it needs a skip. With MOTION set to OFF, lines appear instantly.',
  },
  {
    id: 'pyramid',
    layout: 'pyramid',
    label: 'Lab 05 · Pyramid',
    title: 'From the top down',
    howItWorks: 'The conversation grows down from the post. Each level shows the replies side by side with the chosen one in the middle. Tap another reply to send the path through it.',
    whyItWorks: 'The best path runs straight down the middle, with every alternative right beside it.',
    watchOut: 'Busy levels get wide, so rows scroll sideways on small screens.',
  },
  {
    id: 'switcher',
    layout: 'switcher',
    label: "Lab 06 · Claude's pick",
    title: 'One conversation, every branch',
    howItWorks: 'You always read a single dialogue, top to bottom. Wherever the conversation split, a small ‹ 2/4 › switches to another reply and everything below follows it. Swiping works too.',
    whyItWorks: 'It reads like a chat but keeps every branch one tap away, the same pattern AI chat apps use for alternative answers. Votes decide which reply you see first.',
    watchOut: 'The other replies stay out of sight until you switch, so the counters must be easy to notice.',
  },
];

export function getBranchExperiments(): BranchExperiment[] {
  const observation = toObservation(
    'branch-upper-street',
    'ruth',
    Date.now() - 240 * MINUTE,
    'Islington',
    'The council wants to make Upper Street car-free on weekends. Good idea or not?'
  );
  const { comments, votes } = toVotedComments(observation, UPPER_STREET_DEBATE);

  // Every variation discusses the same post, so the layouts can be compared fairly.
  return EXPERIMENTS.map((copy) => ({ ...copy, observation, comments, votes }));
}
