/**
 * File: src/components/brand/SuperscriptIdeas.tsx
 * Description: Twenty uses of the superscript as a general FrissonWorks UI device, each a tiny live sample. A superscript
 * says "something about this word": a count, a state, a level. It is always type (or a dot), never a box, and never
 * trust or reputation. Every sample is built from the shared `Superscript`.
 */
"use client";
import { useEffect, useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBrandPalette } from './palette';
import { Superscript, useCalm } from './kit';

export interface IdeaDef {
  id: number;
  name: string;
  note: string;
  render: () => ReactNode;
}

const W = ({ children, size = 34 }: { children: ReactNode; size?: number }) => <span style={{ fontSize: size, fontWeight: 400, lineHeight: 1.2 }}>{children}</span>;
const Tap = ({ children, onClick }: { children: ReactNode; onClick: () => void }) => (
  <button type="button" onClick={onClick} className="min-h-[48px] px-1 text-left">
    {children}
  </button>
);

function useTick(ms: number, max: number) {
  const calm = useCalm();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (calm) return;
    const t = setInterval(() => setN((x) => (x >= max ? 0 : x + 1)), ms);
    return () => clearInterval(t);
  }, [calm, ms, max]);
  return n;
}

function Wheel() {
  const roads = ['Roads', 'Places', 'Lore', 'Time', 'Notes'];
  const [open, setOpen] = useState<number[]>([0]);
  return (
    <div className="relative" style={{ width: 340, height: 150 }}>
      {roads.map((r, i) => {
        const a = Math.PI + (i / (roads.length - 1)) * Math.PI;
        const on = open.includes(i);
        return (
          <Tap key={r} onClick={() => setOpen((o) => (o.includes(i) ? o : [...o, i]))}>
            <span className="absolute -translate-x-1/2 text-[1.125rem] font-light" style={{ left: 170 + Math.cos(a) * 125, top: 124 + Math.sin(a) * 105, color: on ? 'var(--ink)' : 'var(--ink-3)' }}>
              {r}
              {!on && <Superscript colour="var(--fw-pink)" size={0.62}>new</Superscript>}
            </span>
          </Tap>
        );
      })}
    </div>
  );
}

function Footnote() {
  const [o, setO] = useState(false);
  return (
    <div className="flex max-w-[34ch] flex-col gap-2">
      <W size={22}>
        Every comment is one sentence
        <button type="button" onClick={() => setO(!o)} className="min-h-[48px]" aria-label="Footnote">
          <Superscript size={0.6}>1</Superscript>
        </button>
      </W>
      <AnimatePresence>{o && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-[0.875rem] font-light text-ink-2"><Superscript size={0.8}>1</Superscript> Or two, if the first is short.</motion.p>}</AnimatePresence>
    </div>
  );
}

function Counter() {
  const [n, setN] = useState(3);
  return (
    <Tap onClick={() => setN((x) => x + 1)}>
      <W>Replies<Superscript>{n > 99 ? '99+' : n}</Superscript></W>
    </Tap>
  );
}

function Level() {
  const [lv, setLv] = useState(7);
  return (
    <Tap onClick={() => setLv((x) => x + 1)}>
      <W>Michal<Superscript>Lv {lv}</Superscript></W>
    </Tap>
  );
}

function Pct() {
  const n = useTick(120, 100);
  return <W>Uploading<Superscript size={0.4}>{n}%</Superscript></W>;
}

export const IDEAS: IdeaDef[] = [
  { id: 1, name: 'Road unlocks in the nav wheel', note: 'The decided one: a locked road shows a raised “new”; tap it to unlock.', render: () => <Wheel /> },
  { id: 2, name: 'Count on a word', note: 'Replies, new items: a number raised at the top right (tap to add).', render: () => <Counter /> },
  { id: 3, name: 'Level', note: 'A level beside a name, in the same position as every count.', render: () => <Level /> },
  { id: 4, name: 'Tab counts', note: 'Plain-text tabs; the raised number is the only decoration.', render: () => <div className="flex gap-6">{['All', 'Mine', 'Replies'].map((t, i) => <W key={t} size={24}>{t}<Superscript colour={i === 0 ? 'var(--fw-pink)' : 'var(--ink-3)'}>{[48, 6, 2][i]}</Superscript></W>)}</div> },
  { id: 5, name: 'XP gain', note: 'A “+12” rises off the word and fades.', render: () => <XpGain /> },
  { id: 6, name: 'Streak', note: 'Days in a row, raised at the word.', render: () => <W>Streak<Superscript>14d</Superscript></W> },
  { id: 7, name: 'New item', note: 'A list row with a raised “new” until it is read.', render: () => <div className="flex flex-col gap-1">{['Trip to Kraków', 'Roads of Lore', 'Week 47'].map((t, i) => <W key={t} size={22}>{t}{i === 0 && <Superscript>new</Superscript>}</W>)}</div> },
  { id: 8, name: 'Lock and open', note: 'A road is locked until a condition: the raised mark says which.', render: () => <div className="flex flex-col gap-1"><W size={22}>Chrono<Superscript colour="var(--ink-3)">locked</Superscript></W><W size={22}>Lore<Superscript>open</Superscript></W></div> },
  { id: 9, name: 'Version', note: 'The app name with its version, raised: Lyst²-style.', render: () => <W>ActionLyst<Superscript colour="var(--ink-3)">v2</Superscript></W> },
  { id: 10, name: 'Reply depth', note: 'A comment name with how deep it sits in the thread.', render: () => <W size={24}>Seema<Superscript colour="var(--ink-3)">↳3</Superscript></W> },
  { id: 11, name: 'Rank', note: 'Place in a list, raised at the title.', render: () => <div className="flex flex-col gap-1">{['Warming stripes', 'Tree rings', 'Streamgraph'].map((t, i) => <W key={t} size={22}>{t}<Superscript>#{i + 1}</Superscript></W>)}</div> },
  { id: 12, name: 'Age', note: 'How long ago, raised, instead of a grey line under.', render: () => <W>Chrono<Superscript colour="var(--ink-3)">3m</Superscript></W> },
  { id: 13, name: 'Unread dot', note: 'The smallest possible superscript: a dot.', render: () => <W>Inbox<Superscript size={0.3} lift={0.05} colour="var(--fw-pink)">●</Superscript></W> },
  { id: 14, name: 'Price', note: 'A tier or price as an exponent of its name.', render: () => <W>Supporter<Superscript>€2</Superscript></W> },
  { id: 15, name: 'Language', note: 'Which language a text is in.', render: () => <div className="flex gap-6"><W size={24}>Hello<Superscript colour="var(--ink-3)">EN</Superscript></W><W size={24}>Dzień dobry<Superscript colour="var(--ink-3)">PL</Superscript></W></div> },
  { id: 16, name: 'Footnote', note: 'A real exponent: tap the 1 to read the note.', render: () => <Footnote /> },
  { id: 17, name: 'Icon badge', note: 'The Android notification badge, in the same top-right place as in the monogram.', render: () => <AppBadges /> },
  { id: 18, name: 'Delta', note: 'A big statistic with its change since last week.', render: () => <span style={{ fontSize: 64, fontWeight: 300, lineHeight: 1 }}>1 284<Superscript size={0.3}>+7%</Superscript></span> },
  { id: 19, name: 'Progress', note: 'A percentage that ticks, raised at the verb.', render: () => <Pct /> },
  { id: 20, name: 'Presence', note: 'Who is here now, in a thread: a count with a live dot.', render: () => <W>Thread<Superscript>● 4</Superscript></W> },
];

function AppBadges() {
  const { apps } = useBrandPalette();
  return (
    <div className="flex gap-6">
      {apps.slice(0, 3).map((a, i) => (
        <span key={a.id} style={{ fontSize: 44, fontWeight: 500, color: a.colour }}>
          {a.prefix[0]}
          <Superscript colour="var(--ink)">L</Superscript>
          <Superscript colour="var(--fw-pink)" size={0.34}>{[3, 12, 1][i]}</Superscript>
        </span>
      ))}
    </div>
  );
}

function XpGain() {
  const calm = useCalm();
  const n = useTick(1600, 1);
  return (
    <span className="relative inline-block">
      <W>Experience</W>
      <motion.span key={n} initial={calm ? false : { opacity: 0, y: 6 }} animate={{ opacity: [0, 1, 1, 0], y: [6, 0, -6, -12] }} transition={{ duration: 1.5, times: [0, 0.2, 0.7, 1] }} style={{ display: 'inline-block' }}>
        <Superscript size={0.4}>+12</Superscript>
      </motion.span>
    </span>
  );
}
