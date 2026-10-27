/**
 * File: src/legacy/labs/comments/NestedThread.tsx
 * Description: Lab 02. The classic Reddit-style tree: replies indented under what they answer,
 * foldable by tapping the thread line, with deep threads waiting behind "Continue this thread".
 */
"use client";
import { useState } from 'react';
import { CommentNode } from '@/legacy/master-lab/commentTree';
import CommentBody from '@/legacy/labs/shared/CommentBody';
import ThreadButton from '@/legacy/labs/shared/ThreadButton';

// Levels shown before the rest of a thread waits behind "Continue this thread".
const MAX_VISIBLE_DEPTH = 4;

export default function NestedThread({ roots }: { roots: CommentNode[] }) {
  return (
    <div className="flex flex-col gap-6">
      {roots.map((root) => (
        <NestedComment key={root.id} node={root} depth={1} />
      ))}
    </div>
  );
}

function NestedComment({ node, depth }: { node: CommentNode; depth: number }) {
  const [isFolded, setIsFolded] = useState(false);
  const [isContinued, setIsContinued] = useState(false);
  const replyCount = node.size - 1;

  if (isFolded) {
    return (
      <ThreadButton onClick={() => setIsFolded(false)}>
        <span className="font-mono">[+]</span>
        {node.profiles?.display_name || "Observer"} · {replyCount} {replyCount === 1 ? 'reply' : 'replies'} folded
      </ThreadButton>
    );
  }

  const waitsBehindContinue = depth >= MAX_VISIBLE_DEPTH && !isContinued;

  return (
    <div className="flex flex-col gap-3">
      <CommentBody comment={node} />

      {node.children.length > 0 && (
        <div className="flex">
          {/* The thread line doubles as the fold button */}
          <button
            type="button"
            aria-label="Fold this thread"
            onClick={() => setIsFolded(true)}
            className="group flex w-4 shrink-0 justify-center"
          >
            <span className="w-px self-stretch bg-[var(--foreground)]/15 transition-colors group-hover:bg-[var(--theme-primary-glow)]" />
          </button>

          <div className="flex min-w-0 flex-1 flex-col gap-4 pl-3">
            {waitsBehindContinue ? (
              <ThreadButton onClick={() => setIsContinued(true)}>
                Continue this thread · {replyCount} more
              </ThreadButton>
            ) : (
              node.children.map((child) => (
                <NestedComment key={child.id} node={child} depth={depth + 1} />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
