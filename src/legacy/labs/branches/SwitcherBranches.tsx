/**
 * File: src/legacy/labs/branches/SwitcherBranches.tsx
 * Description: Branches Lab 06, Claude's pick. One dialogue top to bottom; wherever the conversation split,
 * a ‹ 2/4 › switcher (or a swipe) changes the reply and everything below follows it.
 */
"use client";
import { useState } from 'react';
import { AnimatePresence, motion, type PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { followPath, type PathStep } from '@/legacy/master-lab/commentTree';
import VotedComment from '@/legacy/labs/shared/VotedComment';
import type { BranchLayoutProps } from './types';

// How far a swipe has to travel before it switches to the next reply.
const SWIPE_DISTANCE = 60;

export default function SwitcherBranches({ roots, onVote }: BranchLayoutProps) {
  // The reply picked under each parent. Levels without a pick show the best-voted reply.
  const [picks, setPicks] = useState<Record<string, string>>({});
  const path = followPath(roots, picks);

  const switchReply = (step: PathStep, direction: 1 | -1) => {
    const index = step.options.indexOf(step.chosen);
    const next = step.options[(index + direction + step.options.length) % step.options.length];
    setPicks((prev) => ({ ...prev, [step.parentId]: next.id }));
  };

  const handleSwipe = (step: PathStep, info: PanInfo) => {
    if (info.offset.x <= -SWIPE_DISTANCE) switchReply(step, 1);
    else if (info.offset.x >= SWIPE_DISTANCE) switchReply(step, -1);
  };

  return (
    <ol className="relative flex flex-col gap-6">
      {/* The rail: the one conversation you are reading */}
      <span aria-hidden className="absolute bottom-2 left-[4px] top-2 w-px bg-[var(--theme-primary-glow)] opacity-40" />

      {path.map((step, depth) => {
        const hasAlternatives = step.options.length > 1;

        return (
          <motion.li layout="position" key={depth} className="relative flex flex-col gap-1.5 pl-6">
            <span
              aria-hidden
              className="absolute left-0 top-1 h-[9px] w-[9px] rounded-full border-2 border-[var(--theme-primary-glow)] bg-[var(--background)]"
            />

            {hasAlternatives && (
              <div className="flex items-center gap-1 text-[var(--foreground)]/45">
                <button
                  type="button"
                  aria-label="Previous reply"
                  onClick={() => switchReply(step, -1)}
                  className="rounded p-0.5 transition-colors hover:text-[var(--theme-primary-glow)]"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <span className="font-mono text-[10px] tabular-nums">
                  {step.options.indexOf(step.chosen) + 1}/{step.options.length}
                </span>
                <button
                  type="button"
                  aria-label="Next reply"
                  onClick={() => switchReply(step, 1)}
                  className="rounded p-0.5 transition-colors hover:text-[var(--theme-primary-glow)]"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={step.chosen.id}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.2 }}
                drag={hasAlternatives ? 'x' : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.25}
                onDragEnd={(_, info) => handleSwipe(step, info)}
              >
                <VotedComment comment={step.chosen} onVote={onVote} />
              </motion.div>
            </AnimatePresence>
          </motion.li>
        );
      })}
    </ol>
  );
}
