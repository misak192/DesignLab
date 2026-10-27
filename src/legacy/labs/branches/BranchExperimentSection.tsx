/**
 * File: src/legacy/labs/branches/BranchExperimentSection.tsx
 * Description: One Branches Lab experiment: note, post, and the branching variation with live voting.
 */
"use client";
import { useMemo, useState } from 'react';
import { MotionConfig } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { useResonanceEngine } from '@/legacy/master-lab/engine';
import { buildCommentTree, countComments, type CommentNode } from '@/legacy/master-lab/commentTree';
import type { BranchExperiment, BranchLayout } from './mockBranchLab';
import LabNote from '@/legacy/labs/shared/LabNote';
import LabPostCard from '@/legacy/labs/shared/LabPostCard';
import ThreadButton from '@/legacy/labs/shared/ThreadButton';
import type { VoteHandler } from '@/legacy/master-lab/VoteControl';
import RankedBranches from './RankedBranches';
import ColumnBranches from './ColumnBranches';
import RowBranches from './RowBranches';
import StoryBranches from './StoryBranches';
import PyramidBranches from './PyramidBranches';
import SwitcherBranches from './SwitcherBranches';
import { useLabVotes } from '@/legacy/master-lab/useLabVotes';

// Layouts that spread sideways get the full lab width; the rest keep a readable column.
const WIDE_LAYOUTS: BranchLayout[] = ['columns', 'pyramid'];

export default function BranchExperimentSection({ experiment }: { experiment: BranchExperiment }) {
  const [isOpen, setIsOpen] = useState(false);
  const { scores, vote, reset, hasVoted } = useLabVotes(experiment.votes);
  const roots = useMemo(() => buildCommentTree(experiment.comments, scores), [experiment.comments, scores]);
  const { kinematicLevel } = useResonanceEngine();
  const isWide = WIDE_LAYOUTS.includes(experiment.layout);

  // MOTION: OFF in the FWID menu also switches off the reordering animations.
  return (
    <MotionConfig reducedMotion={kinematicLevel === 'off' ? 'always' : 'user'}>
      <section className="flex flex-col gap-6 py-12 first:pt-0">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
          <LabNote
            label={experiment.label}
            title={experiment.title}
            howItWorks={experiment.howItWorks}
            whyItWorks={experiment.whyItWorks}
            watchOut={experiment.watchOut}
          />
          <LabPostCard
            observation={experiment.observation}
            commentCount={countComments(roots)}
            isOpen={isOpen}
            onToggle={() => setIsOpen((open) => !open)}
          />
        </div>

        {isOpen && (
          <div className={`mx-auto flex w-full flex-col gap-4 ${isWide ? '' : 'max-w-2xl'}`}>
            {hasVoted && (
              <div className="flex justify-end">
                <ThreadButton onClick={reset}>
                  <RotateCcw className="h-3 w-3" aria-hidden />
                  reset votes
                </ThreadButton>
              </div>
            )}
            <BranchLayoutView layout={experiment.layout} roots={roots} onVote={vote} />
          </div>
        )}
      </section>
    </MotionConfig>
  );
}

interface BranchLayoutViewProps {
  layout: BranchLayout;
  roots: CommentNode[];
  onVote: VoteHandler;
}

function BranchLayoutView({ layout, roots, onVote }: BranchLayoutViewProps) {
  switch (layout) {
    case 'ranked':
      return <RankedBranches roots={roots} onVote={onVote} />;
    case 'columns':
      return <ColumnBranches roots={roots} onVote={onVote} />;
    case 'rows':
      return <RowBranches roots={roots} onVote={onVote} />;
    case 'story':
      return <StoryBranches roots={roots} onVote={onVote} />;
    case 'pyramid':
      return <PyramidBranches roots={roots} onVote={onVote} />;
    case 'switcher':
      return <SwitcherBranches roots={roots} onVote={onVote} />;
  }
}
