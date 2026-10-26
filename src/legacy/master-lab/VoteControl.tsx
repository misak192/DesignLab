/**
 * File: src/legacy/master-lab/VoteControl.tsx
 * Description: Up / down voting with the current score. Uses arrows, not chevrons, so voting never looks like "expand".
 */
"use client";
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowBigDown, ArrowBigUp } from 'lucide-react';

export type VoteHandler = (commentId: string, delta: 1 | -1) => void;

interface VoteControlProps {
  score: number;
  onVote: (delta: 1 | -1) => void;
  direction?: 'column' | 'row';
}

export default function VoteControl({ score, onVote, direction = 'column' }: VoteControlProps) {
  return (
    <div className={`flex shrink-0 items-center text-[var(--foreground)]/35 ${direction === 'column' ? 'flex-col' : 'gap-0.5'}`}>
      <button
        type="button"
        aria-label="Vote up"
        onClick={() => onVote(1)}
        className="rounded-md p-0.5 transition-colors hover:text-[var(--theme-primary-glow)]"
      >
        <ArrowBigUp className="h-4 w-4" />
      </button>

      <span className="relative flex h-4 min-w-[2.5ch] items-center justify-center overflow-hidden font-mono text-[11px] tabular-nums text-[var(--foreground)]/70">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={score}
            initial={{ y: -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 8, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {score}
          </motion.span>
        </AnimatePresence>
      </span>

      <button
        type="button"
        aria-label="Vote down"
        onClick={() => onVote(-1)}
        className="rounded-md p-0.5 transition-colors hover:text-[var(--theme-secondary-glow)]"
      >
        <ArrowBigDown className="h-4 w-4" />
      </button>
    </div>
  );
}
