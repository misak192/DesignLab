/**
 * File: src/legacy/labs/comments/RepliesThread.tsx
 * Description: Lab 03. Instagram / Facebook style: top comments, with every deeper reply
 * flattened into one list behind "View replies".
 */
"use client";
import { useState } from 'react';
import { CommentNode, countComments, flattenTree } from '@/legacy/master-lab/commentTree';
import CommentBody from '@/legacy/labs/shared/CommentBody';
import ThreadButton from '@/legacy/labs/shared/ThreadButton';

const VISIBLE_TOP_COMMENTS = 3;

export default function RepliesThread({ roots }: { roots: CommentNode[] }) {
  const [showAll, setShowAll] = useState(false);
  const visibleRoots = showAll ? roots : roots.slice(0, VISIBLE_TOP_COMMENTS);

  return (
    <div className="flex flex-col gap-6">
      {visibleRoots.map((root) => (
        <TopComment key={root.id} comment={root} />
      ))}
      {visibleRoots.length < roots.length && (
        <ThreadButton onClick={() => setShowAll(true)}>
          View all {countComments(roots)} comments
        </ThreadButton>
      )}
    </div>
  );
}

function TopComment({ comment }: { comment: CommentNode }) {
  const [showReplies, setShowReplies] = useState(false);
  const replies = flattenTree(comment.children);
  const authorNames = new Map(
    [comment, ...replies].map((node): [string, string] => [node.id, node.profiles?.display_name || "Observer"])
  );

  return (
    <div className="flex flex-col gap-3">
      <CommentBody comment={comment} />

      {replies.length > 0 && (
        <div className="flex flex-col gap-3 pl-6">
          <ThreadButton onClick={() => setShowReplies((open) => !open)}>
            <span aria-hidden className="h-px w-6 bg-current" />
            {showReplies ? 'Hide replies' : `View ${replies.length} ${replies.length === 1 ? 'reply' : 'replies'}`}
          </ThreadButton>

          {showReplies && replies.map((reply) => (
            <div key={reply.id} className="flex flex-col gap-1">
              {reply.parent_comment_id && reply.parent_comment_id !== comment.id && (
                <span className="text-[11px] text-[var(--foreground)]/40">
                  ↳ replying to {authorNames.get(reply.parent_comment_id)}
                </span>
              )}
              <CommentBody comment={reply} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
