/**
 * File: src/components/comments/CommentsPage.tsx
 * Description: The /comments page: one page, five tabs.
 *   Comments Lab   the letter-coded comments with every display option to tune (read-only conversation)
 *   Old Comments   the ObservaLyst Master Lab thread, unchanged, for comparison (rendered on the server, passed in)
 *   Old Threads    ObservaLyst's Comments Lab: five comment sections under five posts (server, passed in)
 *   Old Branches   ObservaLyst's Branches Lab: six branching layouts of one debate, with votes (server, passed in)
 *   Comments Room  your playground: impersonate anyone, start hero posts, reply, vote
 * The display options live here, so what you tune in the Lab is what the Room shows. The tab is kept in the URL
 * (?tab=old / ?tab=threads / ?tab=branches / ?tab=room) so a refresh or a link lands on the same tab.
 */
"use client";
import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { useMotion } from '@/components/display/DisplayProvider';
import { transitionFor } from '@/lib/motion/presets';
import { useUrlTab } from '@/lib/useUrlTab';
import CommentsBoard from './CommentsBoard';
import { LabSettings, type BoardSettings } from './Controls';

type TabId = 'lab' | 'old' | 'threads' | 'branches' | 'room';

const TABS: { id: TabId; label: string }[] = [
  { id: 'lab', label: 'Comments Lab' },
  { id: 'old', label: 'Old Comments' },
  { id: 'threads', label: 'Old Threads' },
  { id: 'branches', label: 'Old Branches' },
  { id: 'room', label: 'Comments Room' },
];

const STATEMENTS: Record<TabId, string> = {
  lab: 'A conversation you can read by its colours.',
  old: 'The Master Lab thread, as it was in ObservaLyst.',
  threads: 'Five ways to hold a conversation.',
  branches: 'Six ways to branch one, and votes that re-route it.',
  room: 'Your playground. Be anyone, say anything.',
};

// The line each ported lab opened with in ObservaLyst.
const NOTES: Partial<Record<TabId, string>> = {
  threads:
    'Each post below uses a different comment section. Open one with the arrow under the post and compare how it feels to read.',
  branches:
    'Every variation shows the same Upper Street debate. Vote with the arrows and watch comments move. Lab rule: every click counts, so you can push things around; the real app will allow one vote per person.',
};

const TAB_IDS = ['lab', 'old', 'threads', 'branches', 'room'] as const;

export default function CommentsPage({ old, threads, branches }: { old: ReactNode; threads: ReactNode; branches: ReactNode }) {
  const [tab, selectTab] = useUrlTab<TabId>(TAB_IDS);
  const m = useMotion();
  const [settings, setSettings] = useState<BoardSettings>({
    showParticipation: true,
    palette: 'standard',
    threadLines: false,
    openLevels: 2,
  });
  const [showKey, setShowKey] = useState(false);
  const patch = (p: Partial<BoardSettings>) => setSettings((s) => ({ ...s, ...p }));

  return (
    <main className="mx-auto flex w-full max-w-[1000px] flex-1 flex-col px-7 pb-40 pt-10 sm:pt-14">
      <header className="flex flex-col gap-8 pb-10">
        <Link href="/" className="fw-kicker w-fit text-ink-2 hover:text-ink">
          ← Design Lab
        </Link>
        <h1 className="fw-vogue text-[clamp(30px,7vw,56px)] leading-[1.1] text-ink">Comments</h1>
        <p className="fw-big max-w-[30ch] text-[29px] font-light leading-[1.25] text-ink">{STATEMENTS[tab]}</p>
      </header>

      <div role="tablist" aria-label="Comments" className="mb-12 flex flex-wrap gap-x-10 gap-y-1">
        {TABS.map((t) => {
          const selected = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={selected}
              aria-controls={`panel-${t.id}`}
              onClick={() => selectTab(t.id)}
              className="fw-big relative min-h-[48px] text-[22px] font-light uppercase tracking-[0.08em] transition-colors hover:text-t1"
              style={{ color: selected ? 'var(--t1)' : 'var(--ink)', fontWeight: selected ? 400 : 300 }}
            >
              {t.label}
              {selected && (
                <motion.span
                  layoutId="comments-tab-line"
                  aria-hidden
                  transition={transitionFor(m, 0.5)}
                  className="absolute inset-x-0 bottom-1 h-px bg-t1"
                />
              )}
            </button>
          );
        })}
      </div>

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="flex flex-col gap-14">
        {NOTES[tab] && (
          <p className="max-w-[60ch] text-[1.0625rem] font-light leading-[1.5] text-ink-2">{NOTES[tab]}</p>
        )}

        {tab === 'lab' && (
          <>
            <section aria-label="Settings" className="flex flex-col gap-3">
              <div className="flex items-baseline gap-3">
                <span className="fw-kicker fw-tabular text-t1">01</span>
                <h2 className="fw-kicker text-ink">Try it</h2>
                <button
                  type="button"
                  onClick={() => setShowKey((v) => !v)}
                  aria-expanded={showKey}
                  aria-label="How to read the colours"
                  className="grid min-h-[48px] min-w-[32px] place-items-center text-[0.875rem] font-medium text-t1"
                >
                  (i)
                </button>
              </div>

              <AnimatePresence initial={false}>
                {showKey && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={transitionFor(m, 0.4)}
                    className="overflow-hidden"
                  >
                    <ul className="flex max-w-[60ch] flex-col gap-2 pb-4 text-[1.0625rem] font-light leading-[1.5] text-ink-2">
                      <li>First word: who wrote it. Each person keeps one colour, fading to white.</li>
                      <li>On the first comment of a thread, the first word instead fills one letter for every direct reply.</li>
                      <li>
                        Last word: the votes. Under the word&apos;s length, one letter per vote; past it, the ratio. The newest
                        letter is softer while the word is still filling.
                      </li>
                      <li>Names follow the same rule: solid once a person has posted as many times as their name has letters.</li>
                      <li>On the right: name, time, total score (for when colour is not enough, and coloured by your own vote) and the number of replies below, at every level.</li>
                      <li>Tap a sentence to open its replies and see who wrote it, with +up | −down to vote. Tap it again to fold.</li>
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>

              <LabSettings settings={settings} onChange={patch} />
            </section>

            <CommentsBoard mode="lab" settings={settings} />
          </>
        )}

        {tab === 'old' && <div className="max-w-2xl">{old}</div>}

        {tab === 'threads' && <div className="max-w-2xl">{threads}</div>}

        {/* The sideways layouts (Side by side, Pyramid) want the whole page width. */}
        {tab === 'branches' && branches}

        {tab === 'room' && <CommentsBoard mode="room" settings={settings} />}
      </div>
    </main>
  );
}
