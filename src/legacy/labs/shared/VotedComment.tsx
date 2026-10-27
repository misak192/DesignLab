/**
 * File: src/legacy/labs/shared/VotedComment.tsx
 * Description: A comment with its vote control on the right.
 */
"use client";
import type { CommentNode } from '@/legacy/master-lab/commentTree';
import CommentBody from './CommentBody';
import VoteControl, { type VoteHandler } from '@/legacy/master-lab/VoteControl';

interface VotedCommentProps {
  comment: CommentNode;
  onVote: VoteHandler;
}

export default function VotedComment({ comment, onVote }: VotedCommentProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="min-w-0 flex-1">
        <CommentBody comment={comment} />
      </div>
      <VoteControl score={comment.score} onVote={(delta) => onVote(comment.id, delta)} />
    </div>
  );
}
