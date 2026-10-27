/**
 * File: src/legacy/labs/shared/LabPostCard.tsx
 * Description: The post at the top of a lab experiment, with the arrow under it that opens the comments.
 */
"use client";
import { ChevronDown } from 'lucide-react';
import AuthorLine from '@/legacy/labs/shared/AuthorLine';
import type { ObservationEntity } from '@/legacy/master-lab/types';

interface LabPostCardProps {
  observation: ObservationEntity;
  commentCount: number;
  isOpen: boolean;
  onToggle: () => void;
}

export default function LabPostCard({ observation, commentCount, isOpen, onToggle }: LabPostCardProps) {
  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-[var(--foreground)]/10 px-5 pt-5">
      <AuthorLine
        size="post"
        name={observation.profiles?.display_name || "Observer"}
        occupation={observation.profiles?.occupation}
        place={observation.neighborhood}
        createdAt={observation.created_at}
      />
      <p className="text-[15px] leading-relaxed text-[var(--foreground)]/90">{observation.content}</p>

      {commentCount > 0 ? (
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          className="flex w-full flex-col items-center gap-0.5 pb-3 pt-2 text-[var(--foreground)]/40 transition-colors hover:text-[var(--theme-primary-glow)]"
        >
          <span className="text-xs">{isOpen ? 'Hide comments' : `${commentCount} comments`}</span>
          <ChevronDown aria-hidden className={`h-4 w-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      ) : (
        <div className="pb-5" />
      )}
    </article>
  );
}
