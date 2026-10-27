/**
 * File: src/legacy/labs/shared/CommentBody.tsx
 * Description: One comment as every lab layout shows it: author line and text, no action buttons.
 */
"use client";
import AuthorLine from '@/legacy/labs/shared/AuthorLine';
import type { CommentEntity } from '@/legacy/master-lab/types';

interface CommentBodyProps {
  comment: CommentEntity;
  emphasis?: boolean;
  // Cut long text to four lines (e.g. a closed card in the Master Lab).
  clampText?: boolean;
}

export default function CommentBody({ comment, emphasis = false, clampText = false }: CommentBodyProps) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <AuthorLine
        name={comment.profiles?.display_name || "Observer"}
        occupation={comment.profiles?.occupation}
        createdAt={comment.created_at}
        size={emphasis ? 'post' : 'comment'}
      />
      <p className={`${emphasis ? 'text-[15px]' : 'text-sm'} ${clampText ? 'line-clamp-4' : ''} break-words leading-relaxed text-[var(--foreground)]/85`}>
        {comment.content}
      </p>
    </div>
  );
}
