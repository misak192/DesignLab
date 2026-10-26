/**
 * File: src/components/comments/CommentsBoard.tsx
 * Description: One comment board, in memory only (a refresh starts over): the threads, the votes, who is looking and
 * (in the Room) the composer and filter row. Two modes:
 *  - lab   the Comments Lab: seeded conversation, read-only (you vote as a reader, nobody posts), display options are
 *          tuned on the tab above;
 *  - room  the Comments Room: your playground. Impersonate anyone from the roster, start hero posts, reply, vote.
 * The letter logic itself is in src/lib/fw-comments.
 */
"use client";
import { useCallback, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  accentFor,
  arrangeThreads,
  buildThreads,
  castVote,
  LAB_VIEWER,
  PEOPLE,
  ROOM_PEOPLE,
  tally,
  type FwComment,
  type ThreadView,
  type VoteMap,
} from '@/lib/fw-comments';
import { transitionFor } from '@/lib/motion/presets';
import { useDisplay, useMotion } from '@/components/display/DisplayProvider';
import CommentRow from './CommentRow';
import Composer from './Composer';
import { WhoAmI, type BoardSettings } from './Controls';
import { CommentsContext, type CommentsContextValue } from './context';
import { createRoomSeed, createSeed } from './seed';

interface CommentsBoardProps {
  mode: 'lab' | 'room';
  settings: BoardSettings;
}

const VIEWS: { id: ThreadView; label: string }[] = [
  { id: 'top', label: 'Top' },
  { id: 'new', label: 'New' },
  { id: 'mine', label: 'Mine' },
];

/** A word in the filter row: small caps, T1 and underlined when chosen. */
function FilterWord({ selected, onClick, children }: { selected?: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className="fw-kicker min-h-[48px] border-b transition-colors hover:text-ink"
      style={{ color: selected ? 'var(--t1)' : 'var(--ink-2)', borderColor: selected ? 'var(--t1)' : 'transparent' }}
    >
      {children}
    </button>
  );
}

export default function CommentsBoard({ mode, settings }: CommentsBoardProps) {
  const isRoom = mode === 'room';
  const people = isRoom ? ROOM_PEOPLE : PEOPLE;
  const { settings: display } = useDisplay();
  const m = useMotion();

  const [comments, setComments] = useState<FwComment[]>(() => (isRoom ? createRoomSeed(Date.now()) : createSeed(Date.now())));
  const [votes, setVotes] = useState<VoteMap>({});
  const [meId, setMeId] = useState(isRoom ? ROOM_PEOPLE[0].id : LAB_VIEWER.id);
  const [view, setView] = useState<ThreadView>('new');
  // Bumped by "Close all": every row is rebuilt closed.
  const [resetKey, setResetKey] = useState(0);
  const nextId = useRef(0);

  const me = isRoom ? (ROOM_PEOPLE.find((p) => p.id === meId) ?? ROOM_PEOPLE[0]) : LAB_VIEWER;
  // The filter row orders replies at every level, not just the heroes: Top = best score first, New = newest first.
  // (The Lab keeps the reading order: oldest first.)
  const threads = useMemo(() => {
    if (!isRoom) return buildThreads(comments);
    const net = (c: FwComment) => {
      const { up, down } = tally(c, votes);
      return up - down;
    };
    return buildThreads(
      comments,
      view === 'top' ? (a, b) => net(b) - net(a) || a.createdAt - b.createdAt : (a, b) => b.createdAt - a.createdAt
    );
  }, [comments, isRoom, view, votes]);
  const shown = useMemo(() => {
    const net = (c: FwComment) => {
      const { up, down } = tally(c, votes);
      return up - down;
    };
    return arrangeThreads(threads, view, me.id, net);
  }, [threads, view, me.id, votes]);

  const vote = useCallback(
    (commentId: string, direction: 1 | -1) => setVotes((prev) => castVote(prev, commentId, me.id, direction)),
    [me.id]
  );

  const post = useCallback(
    (parentId: string | null, body: string) => {
      const id = `${mode}-new-${nextId.current++}`;
      setComments((prev) => [...prev, { id, parentId, authorId: me.id, body, createdAt: Date.now() }]);
    },
    [me.id, mode]
  );

  const value: CommentsContextValue = {
    people: isRoom ? ROOM_PEOPLE : [...PEOPLE, LAB_VIEWER],
    me,
    canPost: isRoom,
    showParticipation: settings.showParticipation,
    palette: settings.palette,
    threadLines: settings.threadLines,
    openLevels: settings.openLevels,
    votes,
    vote,
    post,
  };

  return (
    <CommentsContext.Provider value={value}>
      <div className="flex flex-col gap-10">
        {isRoom && (
          <section aria-label="Who am I">
            <WhoAmI people={people} meId={me.id} onMe={setMeId} accentOf={(p) => accentFor(p.accent, display.light)} />
          </section>
        )}

        <section aria-label="Conversation" className="flex flex-col gap-8">
          <div className="flex items-baseline gap-3">
            <span className="fw-kicker fw-tabular text-t1">{isRoom ? '01' : '02'}</span>
            <h2 className="fw-kicker text-ink">Threads</h2>
          </div>

          {isRoom && (
            <>
              <Composer
                accent={accentFor(me.accent, display.light)}
                placeholder={`Start a thread as ${me.name}…`}
                submitLabel="Post"
                onSubmit={(body) => {
                  post(null, body);
                  setView('new');
                }}
              />

              {/* Filter row: Top New Mine at the left, Reply in the middle, Close all at the right. */}
              <div className="-mb-2 grid grid-cols-[1fr_auto_1fr] items-center gap-x-4">
                <div role="group" aria-label="Show" className="flex flex-wrap items-center gap-x-6">
                  {VIEWS.map((v) => (
                    <FilterWord key={v.id} selected={view === v.id} onClick={() => setView(v.id)}>
                      {v.label}
                    </FilterWord>
                  ))}
                </div>
                <FilterWord selected={view === 'reply'} onClick={() => setView('reply')}>
                  Reply
                </FilterWord>
                <div className="flex justify-end">
                  <FilterWord onClick={() => setResetKey((k) => k + 1)}>Close all</FilterWord>
                </div>
              </div>
            </>
          )}

          {shown.length === 0 && (
            <p className="text-[1.0625rem] font-light text-ink-3">
              {view === 'reply' ? `Nobody has replied to ${me.name} yet.` : `${me.name} hasn't posted in any thread yet.`}
            </p>
          )}

          <ol className="flex flex-col gap-1">
            <AnimatePresence initial={false}>
              {shown.map((thread) => (
                <motion.li
                  key={`${thread.comment.id}:${resetKey}`}
                  layout="position"
                  initial={m.scale ? { opacity: 0, y: 10 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={transitionFor(m, 0.5)}
                >
                  <ol>
                    <CommentRow node={thread} />
                  </ol>
                </motion.li>
              ))}
            </AnimatePresence>
          </ol>
        </section>
      </div>
    </CommentsContext.Provider>
  );
}
