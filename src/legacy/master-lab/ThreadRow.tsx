/**
 * File: src/legacy/master-lab/ThreadRow.tsx
 * Description: Rows of the Master Lab thread. A comment row is a dot on a hairline, the sentence and the time;
 * its author and vote wait in space already reserved beside the sentence. A "more" row reveals hidden replies.
 */
"use client";
import { Fragment, useState, type KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import RelativeTime from './RelativeTime';
import { colorAt, rangeMidpoint, type ColorRange } from './branchPalette';
import type { CommentNode } from './commentTree';
import type { ThreadCommentRow, ThreadMoreRow, ThreadRail } from './threadRows';
import VoteControl, { type VoteHandler } from './VoteControl';
import { EASE_OUT, useMotionScale } from './motion';

// Thread geometry in px. Every line and dot is placed from these.
const COLUMN = 22;
const DOT = 7;
// Row padding (8) + half of the first text line (24 / 2), so each dot sits on the first line of its sentence.
const DOT_Y = 20;
// Where sentence text starts in the first column; buttons below the thread line up with it.
export const THREAD_TEXT_INSET = COLUMN + 4;

// Each word of an arriving sentence starts this much later than the one before.
const WORD_STAGGER_SECONDS = 0.018;

const columnCentre = (column: number) => column * COLUMN + COLUMN / 2;
const textInset = (column: number) => (column + 1) * COLUMN + 4;
const hairline = (range: ColorRange) => `color-mix(in oklab, ${colorAt(rangeMidpoint(range))} 45%, transparent)`;

// Lets a non-button element (inline text) act like one from the keyboard.
export const onActivate = (action: () => void) => (event: KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    action();
  }
};

// Rows open and close their height; the words inside make their own entrance.
function useRowMotion(enterDelay: number) {
  const scale = useMotionScale();
  const delay = enterDelay * scale;

  return {
    delay,
    scale,
    rowProps: {
      layout: 'position' as const,
      initial: { height: 0, opacity: 0 },
      animate: {
        height: 'auto',
        opacity: 1,
        transition: {
          height: { duration: 0.5 * scale, ease: EASE_OUT, delay },
          opacity: { duration: 0.2 * scale, delay },
        },
      },
      exit: {
        height: 0,
        opacity: 0,
        transition: {
          height: { duration: 0.32 * scale, ease: EASE_OUT },
          opacity: { duration: 0.18 * scale },
        },
      },
      transition: { layout: { duration: 0.45 * scale, ease: EASE_OUT } },
    },
  };
}

// Words rise out of a soft blur one after another (the animation lives in app/globals.css).
function RevealWords({ text, delay }: { text: string; delay: number }) {
  const words = text.split(' ');
  return (
    <>
      {words.map((word, index) => (
        <Fragment key={index}>
          <span className="fw-word-in" style={{ animationDelay: `${(delay + index * WORD_STAGGER_SECONDS).toFixed(3)}s` }}>
            {word}
          </span>
          {index < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </>
  );
}

function PassingRails({ passing, arrived, delay }: { passing: ThreadRail[]; arrived: boolean; delay: number }) {
  return (
    <>
      {passing.map((rail) => (
        <span
          key={rail.column}
          aria-hidden
          className={`absolute inset-y-0 w-px ${arrived ? 'fw-line-draw' : ''}`}
          style={{ left: columnCentre(rail.column), background: hairline(rail.range), animationDelay: `${delay}s` }}
        />
      ))}
    </>
  );
}

// A soft bend from the parent's line into a side reply.
function Bend({ column, range, arrived, delay }: { column: number; range: ColorRange; arrived: boolean; delay: number }) {
  return (
    <span
      aria-hidden
      className={`absolute top-0 rounded-bl-[10px] border-b border-l ${arrived ? 'fw-fade-in' : ''}`}
      style={{
        left: columnCentre(column - 1),
        width: COLUMN - DOT / 2 - 2,
        height: DOT_Y,
        borderColor: hairline(range),
        animationDelay: `${delay}s`,
      }}
    />
  );
}

interface CommentRowViewProps {
  row: ThreadCommentRow;
  // Seconds to wait before arriving, so a freshly opened branch unfolds one sentence after another.
  enterDelay: number;
  // True for rows that appear after the reader starts exploring; those arrive word by word.
  animateArrival: boolean;
  isRevealed: boolean;
  onTapSentence: (node: CommentNode) => void;
  onToggleReplies: (node: CommentNode) => void;
  onVote: VoteHandler;
}

export function CommentRowView({
  row,
  enterDelay,
  animateArrival,
  isRevealed,
  onTapSentence,
  onToggleReplies,
  onVote,
}: CommentRowViewProps) {
  const { delay, scale, rowProps } = useRowMotion(enterDelay);
  // Decided once, when the row first appears.
  const [arrived] = useState(animateArrival);
  const { node, column, range, joins, nextRange, passing, isOpen } = row;
  const replyCount = node.size - 1;
  const x = columnCentre(column);
  // Unopened branches and side replies stay in the background until you engage with them.
  const isQuiet = !isOpen && !isRevealed && joins !== 'continues';
  const tone = isRevealed
    ? 'text-[var(--foreground)]'
    : isQuiet && joins === 'branches'
      ? 'text-[var(--foreground)]/55 hover:text-[var(--foreground)]'
      : 'text-[var(--foreground)]/80 hover:text-[var(--foreground)]';

  return (
    <motion.li {...rowProps} className="relative overflow-hidden">
      <PassingRails passing={passing} arrived={arrived} delay={delay} />
      {joins === 'continues' && (
        <span
          aria-hidden
          className={`absolute top-0 w-px ${arrived ? 'fw-line-draw' : ''}`}
          style={{ left: x, height: DOT_Y, background: hairline(range), animationDelay: `${delay}s` }}
        />
      )}
      {nextRange && (
        <span
          aria-hidden
          className={`absolute bottom-0 w-px ${arrived ? 'fw-line-draw' : ''}`}
          style={{ left: x, top: DOT_Y, background: hairline(nextRange), animationDelay: `${delay + 0.15 * scale}s` }}
        />
      )}
      {joins === 'branches' && <Bend column={column} range={range} arrived={arrived} delay={delay} />}

      <motion.span
        aria-hidden
        initial={arrived ? { scale: 0 } : false}
        animate={{ scale: 1 }}
        transition={{ duration: 0.35 * scale, ease: EASE_OUT, delay: delay + 0.12 * scale }}
        className="absolute rounded-full transition-opacity duration-500"
        style={{
          left: x - DOT / 2,
          top: DOT_Y - DOT / 2,
          width: DOT,
          height: DOT,
          background: colorAt(rangeMidpoint(range)),
          opacity: isQuiet ? 0.45 : 1,
        }}
      />

      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 py-2" style={{ paddingLeft: textInset(column) }}>
        {/* flow-root keeps the floated author inside the row, so its space is reserved even while hidden */}
        <div className="flow-root text-[15px] leading-6">
          <span
            role="button"
            tabIndex={0}
            aria-expanded={replyCount > 0 ? isOpen : isRevealed}
            onClick={() => onTapSentence(node)}
            onKeyDown={onActivate(() => onTapSentence(node))}
            className={`cursor-pointer decoration-[var(--foreground)]/30 underline-offset-4 transition-colors duration-300 focus-visible:underline focus-visible:outline-none ${tone}`}
          >
            {arrived ? <RevealWords text={node.content} delay={delay + 0.08 * scale} /> : node.content}
          </span>

          {/* Author and vote: on the last line if they fit, otherwise right-aligned on the next */}
          <span
            inert={!isRevealed}
            aria-hidden={!isRevealed}
            className={`float-right ml-4 flex h-6 items-center gap-2 font-mono text-[11px] transition-[opacity,filter] duration-500 ${
              isRevealed ? 'opacity-100 blur-0' : 'opacity-0 blur-[3px]'
            }`}
          >
            <span className="text-[var(--foreground)]/75">{node.profiles?.display_name || "Observer"}</span>
            {node.profiles?.occupation && <span className="text-[var(--foreground)]/40">{node.profiles.occupation}</span>}
            <VoteControl direction="row" score={node.score} onVote={(delta) => onVote(node.id, delta)} />
          </span>
        </div>

        <div className="flex h-6 items-center gap-3 font-mono text-[11px] tabular-nums text-[var(--foreground)]/35">
          <RelativeTime date={node.created_at} className="" />
          {replyCount > 0 ? (
            <button
              type="button"
              onClick={() => onToggleReplies(node)}
              aria-expanded={isOpen}
              aria-label={isOpen ? 'Close replies' : `Open ${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}`}
              className="flex w-10 items-center justify-end gap-0.5 transition-colors hover:text-[var(--foreground)] focus-visible:text-[var(--foreground)] focus-visible:outline-none"
            >
              {replyCount}
              <ChevronRight aria-hidden className={`h-3 w-3 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} />
            </button>
          ) : (
            <span aria-hidden className="w-10" />
          )}
        </div>
      </div>
    </motion.li>
  );
}

interface MoreRowViewProps {
  row: ThreadMoreRow;
  enterDelay: number;
  animateArrival: boolean;
  onShowMore: (parent: CommentNode) => void;
}

export function MoreRowView({ row, enterDelay, animateArrival, onShowMore }: MoreRowViewProps) {
  const { delay, rowProps } = useRowMotion(enterDelay);
  const [arrived] = useState(animateArrival);
  const label = `${row.hiddenCount} more ${row.hiddenCount === 1 ? 'reply' : 'replies'}`;

  return (
    <motion.li {...rowProps} className="relative overflow-hidden">
      <PassingRails passing={row.passing} arrived={arrived} delay={delay} />
      <Bend column={row.column} range={row.range} arrived={arrived} delay={delay} />

      <div className="py-2" style={{ paddingLeft: textInset(row.column) }}>
        <button
          type="button"
          onClick={() => onShowMore(row.parent)}
          className={`h-6 font-mono text-[11px] text-[var(--foreground)]/40 transition-colors hover:text-[var(--foreground)] focus-visible:text-[var(--foreground)] focus-visible:outline-none ${
            arrived ? 'fw-fade-in' : ''
          }`}
          style={{ animationDelay: `${delay}s` }}
        >
          + {label}
        </button>
      </div>
    </motion.li>
  );
}
