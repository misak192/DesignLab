/**
 * File: src/legacy/labs/comments/BranchesThread.tsx
 * Description: Lab 01. Conversations shown like git branches: each thread reads as one main line
 * (always following the most-discussed reply), with the other replies waiting as side branches.
 */
"use client";
import { useState } from 'react';
import { GitBranch, GitFork } from 'lucide-react';
import { CommentNode, getMainLine } from '@/legacy/master-lab/commentTree';
import CommentBody from '@/legacy/labs/shared/CommentBody';
import ThreadButton from '@/legacy/labs/shared/ThreadButton';

const VISIBLE_THREADS = 3;
const VISIBLE_COMMITS = 3;

// Each nesting level takes the next colour of the active theme, like the lanes of a git graph.
const laneColor = (depth: number) => `var(--node-${(depth % 5) + 1})`;

export default function BranchesThread({ roots }: { roots: CommentNode[] }) {
  const [showAllThreads, setShowAllThreads] = useState(false);
  const visibleRoots = showAllThreads ? roots : roots.slice(0, VISIBLE_THREADS);
  const hiddenThreads = roots.length - visibleRoots.length;

  return (
    <div className="flex flex-col gap-10">
      {visibleRoots.map((root) => (
        <BranchLane key={root.id} start={root} depth={0} />
      ))}
      {hiddenThreads > 0 && (
        <ThreadButton onClick={() => setShowAllThreads(true)}>
          Show {hiddenThreads} more {hiddenThreads === 1 ? 'thread' : 'threads'}
        </ThreadButton>
      )}
    </div>
  );
}

function BranchLane({ start, depth }: { start: CommentNode; depth: number }) {
  const [isFullyOpen, setIsFullyOpen] = useState(false);
  const line = getMainLine(start);
  const commits = isFullyOpen ? line : line.slice(0, VISIBLE_COMMITS);
  const hiddenCommits = line.length - commits.length;
  const color = laneColor(depth);

  return (
    <div className="flex flex-col gap-4">
      <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color }}>
        <GitBranch className="h-3 w-3" aria-hidden />
        {depth === 0 ? 'main' : 'branch'} · {start.size} {start.size === 1 ? 'comment' : 'comments'}
      </span>

      <ol className="relative flex flex-col gap-5">
        {/* The rail: one continuous line through every comment on this branch */}
        <span aria-hidden className="absolute bottom-2 left-[4px] top-2 w-px opacity-40" style={{ backgroundColor: color }} />
        {commits.map((commit, index) => (
          <BranchCommit key={commit.id} commit={commit} next={line[index + 1]} depth={depth} color={color} />
        ))}
      </ol>

      {hiddenCommits > 0 && (
        <div className="pl-6">
          <ThreadButton onClick={() => setIsFullyOpen(true)}>
            Continue this branch · {hiddenCommits} more
          </ThreadButton>
        </div>
      )}
    </div>
  );
}

interface BranchCommitProps {
  commit: CommentNode;
  // The reply that continues this branch; every other reply is a side branch.
  next?: CommentNode;
  depth: number;
  color: string;
}

function BranchCommit({ commit, next, depth, color }: BranchCommitProps) {
  const [showSideBranches, setShowSideBranches] = useState(false);
  const sideBranches = commit.children.filter((child) => child !== next);

  return (
    <li className="relative flex flex-col gap-3 pl-6">
      <span aria-hidden className="absolute left-0 top-1 h-[9px] w-[9px] rounded-full border-2 bg-[var(--background)]" style={{ borderColor: color }} />
      <CommentBody comment={commit} />

      {sideBranches.length > 0 && (
        <ThreadButton onClick={() => setShowSideBranches((open) => !open)}>
          <GitFork className="h-3 w-3" aria-hidden />
          {showSideBranches ? 'Hide' : 'Open'} {sideBranches.length} side {sideBranches.length === 1 ? 'branch' : 'branches'}
        </ThreadButton>
      )}

      {showSideBranches && (
        <div
          className="flex flex-col gap-8 border-l-2 py-1 pl-4"
          style={{ borderColor: `color-mix(in srgb, ${laneColor(depth + 1)} 40%, transparent)` }}
        >
          {sideBranches.map((branch) => (
            <BranchLane key={branch.id} start={branch} depth={depth + 1} />
          ))}
        </div>
      )}
    </li>
  );
}
