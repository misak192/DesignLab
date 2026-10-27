/**
 * File: src/legacy/labs/comments/LabExperimentSection.tsx
 * Description: One Comments Lab experiment: the note explaining the comment layout, the post,
 * and the arrow under the post that opens its comments.
 */
"use client";
import { useMemo, useState } from 'react';
import { buildCommentTree, countComments, type CommentNode } from '@/legacy/master-lab/commentTree';
import type { CommentLayout, LabExperiment } from './mockCommentLab';
import LabNote from '@/legacy/labs/shared/LabNote';
import LabPostCard from '@/legacy/labs/shared/LabPostCard';
import BranchesThread from './BranchesThread';
import NestedThread from './NestedThread';
import RepliesThread from './RepliesThread';
import FocusThread from './FocusThread';
import ChatThread from './ChatThread';

export default function LabExperimentSection({ experiment }: { experiment: LabExperiment }) {
  const [isOpen, setIsOpen] = useState(false);
  const roots = useMemo(() => buildCommentTree(experiment.comments), [experiment.comments]);

  return (
    <section className="flex flex-col gap-6 py-12 first:pt-0">
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
      {isOpen && <CommentLayoutView layout={experiment.layout} roots={roots} />}
    </section>
  );
}

function CommentLayoutView({ layout, roots }: { layout: CommentLayout; roots: CommentNode[] }) {
  switch (layout) {
    case 'branches':
      return <BranchesThread roots={roots} />;
    case 'nested':
      return <NestedThread roots={roots} />;
    case 'replies':
      return <RepliesThread roots={roots} />;
    case 'focus':
      return <FocusThread roots={roots} />;
    case 'chat':
      return <ChatThread roots={roots} />;
  }
}
