/**
 * File: src/legacy/labs/branches/ColumnBranches.tsx
 * Description: Branches Lab 02. Main branches side by side, best on the left; the arrow under each opens its conversation.
 */
"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import type { CommentNode } from '@/legacy/master-lab/commentTree';
import VotedComment from '@/legacy/labs/shared/VotedComment';
import type { VoteHandler } from '@/legacy/master-lab/VoteControl';
import BranchLine from './BranchLine';
import type { BranchLayoutProps } from './types';

export default function ColumnBranches({ roots, onVote }: BranchLayoutProps) {
  return (
    <div className="no-scrollbar -mx-4 overflow-x-auto px-4 sm:-mx-6 sm:px-6">
      <div className="flex w-max items-start gap-4 pb-2">
        {roots.map((root, index) => (
          <BranchColumn key={root.id} root={root} rank={index + 1} onVote={onVote} />
        ))}
      </div>
    </div>
  );
}

interface BranchColumnProps {
  root: CommentNode;
  rank: number;
  onVote: VoteHandler;
}

function BranchColumn({ root, rank, onVote }: BranchColumnProps) {
  const [isOpen, setIsOpen] = useState(false);
  const replyCount = root.size - 1;

  return (
    <motion.div
      layout="position"
      className="flex w-72 shrink-0 flex-col gap-3 rounded-2xl border border-[var(--foreground)]/10 p-4"
    >
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--foreground)]/40">#{rank}</span>
      <VotedComment comment={root} onVote={onVote} />

      {replyCount > 0 && (
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Hide replies' : `Show ${replyCount} replies`}
          className="flex w-full flex-col items-center text-[var(--foreground)]/40 transition-colors hover:text-[var(--theme-primary-glow)]"
        >
          <span className="text-xs">{replyCount}</span>
          <ChevronDown aria-hidden className={`h-4 w-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      )}

      {isOpen && <BranchLine start={root} onVote={onVote} withoutStart />}
    </motion.div>
  );
}
