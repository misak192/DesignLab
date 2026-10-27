/**
 * File: src/legacy/labs/branches/StoryBranches.tsx
 * Description: Branches Lab 04. Press play and the best dialogue of each top branch writes itself out line by line.
 * Respects the MOTION setting: with motion off, lines appear without typing.
 */
"use client";
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { FastForward, Play, RotateCcw } from 'lucide-react';
import { useResonanceEngine } from '@/legacy/master-lab/engine';
import AuthorLine from '@/legacy/labs/shared/AuthorLine';
import { getMainLine } from '@/legacy/master-lab/commentTree';
import ThreadButton from '@/legacy/labs/shared/ThreadButton';
import VotedComment from '@/legacy/labs/shared/VotedComment';
import { laneColor } from './BranchLine';
import type { BranchLayoutProps } from './types';

const STORY_BRANCHES = 3;
const CHARACTERS_PER_TICK = 2;
const TICK_MS = 20;
const PAUSE_BETWEEN_LINES_MS = 450;

type StoryStatus = 'idle' | 'playing' | 'done';

export default function StoryBranches({ roots, onVote }: BranchLayoutProps) {
  const { kinematicLevel } = useResonanceEngine();
  const [status, setStatus] = useState<StoryStatus>('idle');
  const [lineIndex, setLineIndex] = useState(0);
  const [typedLength, setTypedLength] = useState(0);
  const branchCount = Math.min(STORY_BRANCHES, roots.length);

  // The script: the best dialogue (main line) of each top branch, one branch after another.
  const lines = useMemo(
    () =>
      roots.slice(0, STORY_BRANCHES).flatMap((root, branchIndex) =>
        getMainLine(root).map((node, position) => ({ node, branchIndex, startsBranch: position === 0 }))
      ),
    [roots]
  );

  useEffect(() => {
    if (status !== 'playing') return;

    const current = lines[lineIndex];
    const textLength = current?.node.content.length ?? 0;
    const isTyping = Boolean(current) && typedLength < textLength;
    const typesInstantly = kinematicLevel === 'off';

    const delay = !current ? 0 : isTyping ? (typesInstantly ? 0 : TICK_MS) : PAUSE_BETWEEN_LINES_MS;
    const timer = setTimeout(() => {
      if (!current) {
        setStatus('done');
      } else if (isTyping) {
        setTypedLength(typesInstantly ? textLength : typedLength + CHARACTERS_PER_TICK);
      } else {
        setLineIndex(lineIndex + 1);
        setTypedLength(0);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [status, lines, lineIndex, typedLength, kinematicLevel]);

  const play = () => {
    setLineIndex(0);
    setTypedLength(0);
    setStatus('playing');
  };

  if (status === 'idle') {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[var(--foreground)]/15 px-6 py-10 text-center">
        <button
          type="button"
          onClick={play}
          className="flex items-center gap-2 rounded-full bg-[var(--theme-primary-glow)] px-5 py-2.5 text-sm font-semibold text-black transition-transform hover:scale-105"
        >
          <Play className="h-4 w-4" aria-hidden />
          Play the best dialogues
        </button>
        <p className="text-xs text-[var(--foreground)]/50">The top {branchCount} branches, told line by line.</p>
      </div>
    );
  }

  const shownLines = status === 'done' ? lines : lines.slice(0, lineIndex + 1);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--foreground)]/40">
          {status === 'playing' ? 'Playing…' : `Top ${branchCount} branches`}
        </span>
        {status === 'playing' ? (
          <ThreadButton onClick={() => setStatus('done')}>
            <FastForward className="h-3 w-3" aria-hidden />
            skip
          </ThreadButton>
        ) : (
          <ThreadButton onClick={play}>
            <RotateCcw className="h-3 w-3" aria-hidden />
            replay
          </ThreadButton>
        )}
      </div>

      <ol className="flex flex-col gap-4">
        {shownLines.map(({ node, branchIndex, startsBranch }, index) => {
          const isTyping = status === 'playing' && index === lineIndex;
          const color = laneColor(branchIndex);

          return (
            <motion.li
              key={node.id}
              layout="position"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex flex-col gap-3 ${startsBranch && index > 0 ? 'pt-6' : ''}`}
            >
              {startsBranch && (
                <span className="font-mono text-[10px] uppercase tracking-[0.3em]" style={{ color }}>
                  Branch {branchIndex + 1}
                </span>
              )}

              <div className="border-l-2 pl-4" style={{ borderColor: color }}>
                {status === 'done' ? (
                  <VotedComment comment={node} onVote={onVote} />
                ) : (
                  <div className="flex flex-col gap-1">
                    <AuthorLine
                      name={node.profiles?.display_name || "Observer"}
                      occupation={node.profiles?.occupation}
                      createdAt={node.created_at}
                    />
                    <p className="text-sm leading-relaxed text-[var(--foreground)]/85">
                      {isTyping ? node.content.slice(0, typedLength) : node.content}
                      {isTyping && (
                        <span aria-hidden className="ml-0.5 inline-block h-3.5 w-px animate-pulse bg-[var(--theme-primary-glow)] align-middle" />
                      )}
                    </p>
                  </div>
                )}
              </div>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}
