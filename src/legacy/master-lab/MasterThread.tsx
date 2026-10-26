/**
 * File: src/legacy/master-lab/MasterThread.tsx
 * Description: The Master Lab: one question and its conversation as a quiet thread of sentences.
 * Tapping a sentence opens its branch along the best replies and shows who wrote it; tapping it again folds it away.
 * Each top branch's theme colours flow down and split with the conversation.
 */
"use client";
import { useMemo, useState } from 'react';
import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import RelativeTime from './RelativeTime';
import { useResonanceEngine } from './engine';
import type { CommentEntity, ObservationEntity } from './types';
import { assignColorRanges, type ColorRange } from './branchPalette';
import { buildCommentTree, countComments, getMainLine, type CommentNode } from './commentTree';
import { thoughtSerif } from './fonts';
import { THEME_TIERS } from './themes';
import { layoutThread } from './threadRows';
import type { VoteHandler } from './VoteControl';
import { useLabVotes } from './useLabVotes';
import { EASE_OUT, useMotionScale } from './motion';
import { CommentRowView, MoreRowView, onActivate, THREAD_TEXT_INSET } from './ThreadRow';

// Replies shown under a comment before "more" (the best reply counts as one), and top branches before "more branches".
const REPLY_LIMIT = 3;
const ROOT_LIMIT = 6;
// When a branch opens, each row below it arrives this much later than the one before (capped).
const STAGGER_SECONDS = 0.06;
const MAX_STAGGERED_ROWS = 12;

const withMember = (set: Set<string>, id: string, include: boolean) => {
  const next = new Set(set);
  if (include) next.add(id);
  else next.delete(id);
  return next;
};

interface MasterThreadProps {
  observation: ObservationEntity;
  comments: CommentEntity[];
  votes: Record<string, number>;
}

export default function MasterThread({ observation, comments, votes }: MasterThreadProps) {
  const { activeTheme } = useResonanceEngine();
  const motionScale = useMotionScale();
  const { scores, vote, reset, hasVoted } = useLabVotes(votes);
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set());
  const [revealedIds, setRevealedIds] = useState<Set<string>>(() => new Set());
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());
  const [showAllRoots, setShowAllRoots] = useState(false);
  // Nothing animates on page load; rows only arrive word by word once the reader starts exploring.
  const [hasExplored, setHasExplored] = useState(false);
  // The comment acted on most recently; rows below it arrive one after another.
  const [anchorId, setAnchorId] = useState<string | null>(null);
  const [showAuthor, setShowAuthor] = useState(false);

  const roots = useMemo(() => buildCommentTree(comments, scores), [comments, scores]);

  // The oldest top branch wears the current skin; the others walk through every other theme.
  const ranges = useMemo(() => {
    const first = Math.max(THEME_TIERS.indexOf(activeTheme), 0);
    return assignColorRanges(roots, [...THEME_TIERS.slice(first), ...THEME_TIERS.slice(0, first)]);
  }, [roots, activeTheme]);

  // Open a comment and keep following its best reply to the end of the conversation.
  const openBranch = (node: CommentNode) => {
    setHasExplored(true);
    setAnchorId(node.id);
    setOpenIds((prev) => {
      const next = new Set(prev);
      getMainLine(node).forEach((comment) => {
        if (comment.children.length > 0) next.add(comment.id);
      });
      return next;
    });
  };

  const closeBranch = (node: CommentNode) => setOpenIds((prev) => withMember(prev, node.id, false));

  // First tap opens a closed branch and shows who wrote it. A tap on an open, revealed sentence folds it away.
  const tapSentence = (node: CommentNode) => {
    const hasReplies = node.children.length > 0;
    const isOpen = openIds.has(node.id);
    const isRevealed = revealedIds.has(node.id);

    if (hasReplies && !isOpen) {
      openBranch(node);
      setRevealedIds((prev) => withMember(prev, node.id, true));
    } else if (hasReplies && isRevealed) {
      closeBranch(node);
      setRevealedIds((prev) => withMember(prev, node.id, false));
    } else {
      setRevealedIds((prev) => withMember(prev, node.id, !isRevealed));
    }
  };

  const toggleReplies = (node: CommentNode) => {
    if (openIds.has(node.id)) closeBranch(node);
    else openBranch(node);
  };

  const showMoreReplies = (parent: CommentNode) => {
    setHasExplored(true);
    setAnchorId(parent.id);
    setExpandedIds((prev) => withMember(prev, parent.id, true));
  };

  const showMoreRoots = () => {
    setHasExplored(true);
    setShowAllRoots(true);
  };

  const closeAll = () => {
    setOpenIds(new Set());
    setRevealedIds(new Set());
    setExpandedIds(new Set());
  };

  const toggleAuthor = () => setShowAuthor((shown) => !shown);

  const author = observation.profiles;
  const visibleRoots = showAllRoots ? roots : roots.slice(0, ROOT_LIMIT);
  const hiddenRootCount = roots.length - visibleRoots.length;

  return (
    <MotionConfig reducedMotion={motionScale === 0 ? 'always' : 'user'}>
      <article className="flex flex-col">
        <header className="flex flex-col gap-4 pb-8">
          <h2 className={`${thoughtSerif.className} flow-root text-[28px] leading-[1.18] tracking-[-0.012em] text-[var(--foreground)] sm:text-[34px]`}>
            <span
              role="button"
              tabIndex={0}
              aria-expanded={showAuthor}
              onClick={toggleAuthor}
              onKeyDown={onActivate(toggleAuthor)}
              className="cursor-pointer decoration-[var(--foreground)]/25 underline-offset-8 focus-visible:underline focus-visible:outline-none"
            >
              {observation.content}
            </span>

            {/* Reserved beside the last line, so showing who asked never moves the thread */}
            <span
              aria-hidden={!showAuthor}
              className={`float-right ml-4 flex items-center transition-[opacity,filter] duration-500 ${
                showAuthor ? 'opacity-100 blur-0' : 'opacity-0 blur-[3px]'
              }`}
              style={{ height: '1.18em' }}
            >
              <span className="font-mono text-[11px] leading-none tracking-normal text-[var(--foreground)]/55">
                {author?.display_name} · {author?.occupation} · {observation.neighborhood}
              </span>
            </span>
          </h2>

          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 font-mono text-[11px] tabular-nums text-[var(--foreground)]/40">
            <p className="flex items-baseline gap-2">
              <RelativeTime date={observation.created_at} className="" />
              <span aria-hidden>·</span>
              <span>{countComments(roots)} replies</span>
            </p>

            <div className="flex gap-4">
              {hasVoted && <MetaButton onClick={reset}>reset votes</MetaButton>}
              {openIds.size > 0 && <MetaButton onClick={closeAll}>close all</MetaButton>}
            </div>
          </div>
        </header>

        <ol className="flex flex-col">
          <AnimatePresence initial={false}>
            {visibleRoots.map((root) => (
              <motion.li
                key={root.id}
                layout="position"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{
                  duration: 0.5 * motionScale,
                  ease: EASE_OUT,
                  layout: { duration: 0.5 * motionScale, ease: EASE_OUT },
                }}
                // The theme class lets every line and dot in this branch use its own theme's colours.
                className={`overflow-hidden py-2.5 ${ranges.get(root.id)?.theme ?? ''}`}
              >
                <ThreadGroup
                  root={root}
                  ranges={ranges}
                  openIds={openIds}
                  revealedIds={revealedIds}
                  expandedIds={expandedIds}
                  anchorId={anchorId}
                  animateArrival={hasExplored && motionScale > 0}
                  onTapSentence={tapSentence}
                  onToggleReplies={toggleReplies}
                  onShowMore={showMoreReplies}
                  onVote={vote}
                />
              </motion.li>
            ))}
          </AnimatePresence>
        </ol>

        {hiddenRootCount > 0 && (
          <div className="pt-3" style={{ paddingLeft: THREAD_TEXT_INSET }}>
            <MetaButton onClick={showMoreRoots}>
              + {hiddenRootCount} more {hiddenRootCount === 1 ? 'branch' : 'branches'}
            </MetaButton>
          </div>
        )}
      </article>
    </MotionConfig>
  );
}

interface ThreadGroupProps {
  root: CommentNode;
  ranges: Map<string, ColorRange>;
  openIds: Set<string>;
  revealedIds: Set<string>;
  expandedIds: Set<string>;
  anchorId: string | null;
  animateArrival: boolean;
  onTapSentence: (node: CommentNode) => void;
  onToggleReplies: (node: CommentNode) => void;
  onShowMore: (parent: CommentNode) => void;
  onVote: VoteHandler;
}

// One top branch and everything opened inside it, laid out as a flat list of rows.
function ThreadGroup({
  root,
  ranges,
  openIds,
  revealedIds,
  expandedIds,
  anchorId,
  animateArrival,
  onTapSentence,
  onToggleReplies,
  onShowMore,
  onVote,
}: ThreadGroupProps) {
  const rows = layoutThread(root, { openIds, expandedIds, ranges, replyLimit: REPLY_LIMIT });
  const anchorIndex = rows.findIndex((row) => row.key === anchorId);
  const delayFor = (index: number) =>
    anchorIndex >= 0 && index > anchorIndex ? Math.min(index - anchorIndex - 1, MAX_STAGGERED_ROWS) * STAGGER_SECONDS : 0;

  return (
    <ol>
      <AnimatePresence initial={false}>
        {rows.map((row, index) =>
          row.kind === 'comment' ? (
            <CommentRowView
              key={row.key}
              row={row}
              enterDelay={delayFor(index)}
              animateArrival={animateArrival}
              isRevealed={revealedIds.has(row.node.id)}
              onTapSentence={onTapSentence}
              onToggleReplies={onToggleReplies}
              onVote={onVote}
            />
          ) : (
            <MoreRowView
              key={row.key}
              row={row}
              enterDelay={delayFor(index)}
              animateArrival={animateArrival}
              onShowMore={onShowMore}
            />
          )
        )}
      </AnimatePresence>
    </ol>
  );
}

function MetaButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="font-mono text-[11px] text-[var(--foreground)]/40 transition-colors hover:text-[var(--foreground)] focus-visible:text-[var(--foreground)] focus-visible:outline-none"
    >
      {children}
    </button>
  );
}
