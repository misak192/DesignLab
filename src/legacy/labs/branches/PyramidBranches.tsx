/**
 * File: src/legacy/labs/branches/PyramidBranches.tsx
 * Description: Branches Lab 05. The conversation grows downward from the post. Each level shows sibling replies
 * side by side with the chosen one in the middle; choosing another sends the path below through it.
 */
"use client";
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { followPath, type CommentNode, type PathStep } from '@/legacy/master-lab/commentTree';
import VoteControl, { type VoteHandler } from '@/legacy/master-lab/VoteControl';
import { laneColor } from './BranchLine';
import type { BranchLayoutProps } from './types';

// Chosen comment in the middle, the others fanning out by rank on alternating sides.
function arrangeAroundChosen(options: CommentNode[], chosenId: string): CommentNode[] {
  const chosen = options.filter((option) => option.id === chosenId);
  const others = options.filter((option) => option.id !== chosenId);
  const left = others.filter((_, index) => index % 2 === 1).reverse();
  const right = others.filter((_, index) => index % 2 === 0);
  return [...left, ...chosen, ...right];
}

export default function PyramidBranches({ roots, onVote }: BranchLayoutProps) {
  // The reply picked under each parent. Levels without a pick follow the best reply.
  const [picks, setPicks] = useState<Record<string, string>>({});
  const levels = followPath(roots, picks);

  const pick = (parentId: string, commentId: string) =>
    setPicks((prev) => ({ ...prev, [parentId]: commentId }));

  return (
    <div className="flex flex-col items-center">
      <span className="rounded-full border border-[var(--foreground)]/15 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--foreground)]/50">
        Post
      </span>

      {levels.map((level, depth) => (
        <div key={depth} className="flex w-full flex-col items-center">
          <span aria-hidden className="h-6 w-px bg-[var(--foreground)]/20" />
          <PyramidRow
            level={level}
            depth={depth}
            onPick={(commentId) => pick(level.parentId, commentId)}
            onVote={onVote}
          />
        </div>
      ))}
    </div>
  );
}

interface PyramidRowProps {
  level: PathStep;
  depth: number;
  onPick: (commentId: string) => void;
  onVote: VoteHandler;
}

function PyramidRow({ level, depth, onPick, onVote }: PyramidRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const arranged = arrangeAroundChosen(level.options, level.chosen.id);
  const color = laneColor(depth);

  // When a row is wider than the screen, keep the chosen comment centred in view.
  useEffect(() => {
    const row = rowRef.current;
    const chosen = row?.querySelector<HTMLElement>('[data-chosen="true"]');
    if (!row || !chosen) return;
    row.scrollTo({ left: chosen.offsetLeft + chosen.offsetWidth / 2 - row.clientWidth / 2, behavior: 'smooth' });
  }, [level.chosen.id]);

  return (
    <div ref={rowRef} className="no-scrollbar relative w-full overflow-x-auto">
      <div className="mx-auto flex w-max items-start gap-3 px-2 py-1">
        {arranged.map((node) => {
          const isChosen = node.id === level.chosen.id;

          return (
            <motion.div
              layout="position"
              key={node.id}
              data-chosen={isChosen}
              className={`flex w-44 shrink-0 flex-col gap-2 rounded-2xl border p-3 transition-opacity sm:w-52 ${
                isChosen ? 'bg-[var(--foreground)]/5' : 'border-[var(--foreground)]/10 opacity-55 hover:opacity-100'
              }`}
              style={isChosen ? { borderColor: color } : undefined}
            >
              <button type="button" onClick={() => onPick(node.id)} aria-pressed={isChosen} className="flex flex-col gap-1 text-left">
                <span className="text-[13px] font-semibold text-[var(--foreground)]">
                  {node.profiles?.display_name || "Observer"}
                </span>
                <span className={`text-xs leading-relaxed text-[var(--foreground)]/75 ${isChosen ? '' : 'line-clamp-3'}`}>
                  {node.content}
                </span>
              </button>

              <div className="flex items-center justify-between">
                <VoteControl direction="row" score={node.score} onVote={(delta) => onVote(node.id, delta)} />
                {node.children.length > 0 && (
                  <span className="text-[10px] text-[var(--foreground)]/40">{node.size - 1} below</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
