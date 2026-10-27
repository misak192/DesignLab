/**
 * File: src/legacy/labs/branches/RowBranches.tsx
 * Description: Branches Lab 03. Main branches as compact rows in a matrix; the arrow opens a branch under its row.
 */
"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import AuthorLine from '@/legacy/labs/shared/AuthorLine';
import type { CommentNode } from '@/legacy/master-lab/commentTree';
import VoteControl, { type VoteHandler } from '@/legacy/master-lab/VoteControl';
import BranchLine from './BranchLine';
import type { BranchLayoutProps } from './types';

export default function RowBranches({ roots, onVote }: BranchLayoutProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--foreground)]/10">
      {roots.map((root, index) => (
        <BranchRow key={root.id} root={root} rank={index + 1} onVote={onVote} />
      ))}
    </div>
  );
}

interface BranchRowProps {
  root: CommentNode;
  rank: number;
  onVote: VoteHandler;
}

function BranchRow({ root, rank, onVote }: BranchRowProps) {
  const [isOpen, setIsOpen] = useState(false);
  const replyCount = root.size - 1;

  return (
    <motion.div layout="position" className="border-b border-[var(--foreground)]/10 last:border-b-0">
      <div className="grid grid-cols-[1.5rem_auto_minmax(0,1fr)_2.5rem] items-center gap-3 px-4 py-3">
        <span className="font-mono text-[10px] text-[var(--foreground)]/40">#{rank}</span>
        <VoteControl score={root.score} onVote={(delta) => onVote(root.id, delta)} />
        <div className="flex min-w-0 flex-col gap-0.5">
          <AuthorLine
            name={root.profiles?.display_name || "Observer"}
            occupation={root.profiles?.occupation}
            createdAt={root.created_at}
          />
          <p className={`text-sm text-[var(--foreground)]/85 ${isOpen ? '' : 'truncate'}`}>{root.content}</p>
        </div>

        {replyCount > 0 ? (
          <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            aria-expanded={isOpen}
            aria-label={isOpen ? 'Hide replies' : `Show ${replyCount} replies`}
            className="flex items-center justify-end gap-0.5 text-xs text-[var(--foreground)]/40 transition-colors hover:text-[var(--theme-primary-glow)]"
          >
            {replyCount}
            <ChevronDown aria-hidden className={`h-4 w-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        ) : (
          <span />
        )}
      </div>

      {isOpen && (
        <div className="px-4 pb-5 sm:pl-[5.5rem]">
          <BranchLine start={root} onVote={onVote} withoutStart />
        </div>
      )}
    </motion.div>
  );
}
