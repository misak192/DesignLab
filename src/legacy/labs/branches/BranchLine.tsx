/**
 * File: src/legacy/labs/branches/BranchLine.tsx
 * Description: One branch as a git-style lane: the best-voted reply chain on a coloured rail, with the
 * other replies tucked behind a small "more" where they split off. Shared by several variations.
 */
"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, GitFork } from 'lucide-react';
import { getMainLine, type CommentNode } from '@/legacy/master-lab/commentTree';
import ThreadButton from '@/legacy/labs/shared/ThreadButton';
import VotedComment from '@/legacy/labs/shared/VotedComment';
import type { VoteHandler } from '@/legacy/master-lab/VoteControl';

const VISIBLE_COMMENTS = 3;

// Each nesting level takes the next colour of the active theme, like the lanes of a git graph.
export const laneColor = (depth: number) => `var(--node-${(depth % 5) + 1})`;

interface BranchLineProps {
  start: CommentNode;
  onVote: VoteHandler;
  depth?: number;
  // Leave out the first comment when a header above already shows it (columns, rows).
  withoutStart?: boolean;
}

export default function BranchLine({ start, onVote, depth = 0, withoutStart = false }: BranchLineProps) {
  const [showAll, setShowAll] = useState(false);
  const mainLine = getMainLine(start);
  const line = withoutStart ? mainLine.slice(1) : mainLine;
  const visible = showAll ? line : line.slice(0, VISIBLE_COMMENTS);
  const hiddenCount = line.length - visible.length;
  const color = laneColor(depth);

  return (
    <div className="flex flex-col gap-3">
      {withoutStart && <SideBranches parent={start} next={mainLine[1]} depth={depth} onVote={onVote} />}

      {visible.length > 0 && (
        <ol className="relative flex flex-col gap-5">
          {/* The rail: one continuous line through every comment on this branch */}
          <span aria-hidden className="absolute bottom-2 left-[4px] top-2 w-px opacity-40" style={{ backgroundColor: color }} />
          {visible.map((node) => (
            <motion.li layout="position" key={node.id} className="relative flex flex-col gap-2 pl-6">
              <span
                aria-hidden
                className="absolute left-0 top-1 h-[9px] w-[9px] rounded-full border-2 bg-[var(--background)]"
                style={{ borderColor: color }}
              />
              <VotedComment comment={node} onVote={onVote} />
              <SideBranches parent={node} next={mainLine[mainLine.indexOf(node) + 1]} depth={depth} onVote={onVote} />
            </motion.li>
          ))}
        </ol>
      )}

      {hiddenCount > 0 && (
        <div className="pl-6">
          <ThreadButton onClick={() => setShowAll(true)}>
            {hiddenCount} more
            <ChevronDown className="h-3 w-3" aria-hidden />
          </ThreadButton>
        </div>
      )}
    </div>
  );
}

interface SideBranchesProps {
  parent: CommentNode;
  // The reply that continues the main line; every other reply is a side branch.
  next?: CommentNode;
  depth: number;
  onVote: VoteHandler;
}

// The replies that did not make the main line, one tap away.
function SideBranches({ parent, next, depth, onVote }: SideBranchesProps) {
  const [isOpen, setIsOpen] = useState(false);
  const branches = parent.children.filter((child) => child.id !== next?.id);
  if (branches.length === 0) return null;

  return (
    <>
      <ThreadButton onClick={() => setIsOpen((open) => !open)}>
        <GitFork className="h-3 w-3" aria-hidden />
        {isOpen ? 'less' : `${branches.length} more`}
      </ThreadButton>

      {isOpen && (
        <div
          className="flex flex-col gap-6 border-l-2 py-1 pl-4"
          style={{ borderColor: `color-mix(in srgb, ${laneColor(depth + 1)} 40%, transparent)` }}
        >
          {branches.map((branch) => (
            <BranchLine key={branch.id} start={branch} depth={depth + 1} onVote={onVote} />
          ))}
        </div>
      )}
    </>
  );
}
