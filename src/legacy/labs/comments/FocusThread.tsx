/**
 * File: src/legacy/labs/comments/FocusThread.tsx
 * Description: Lab 04. X / Threads style: one comment and its direct replies at a time,
 * with a trail back to where you came from.
 */
"use client";
import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { CommentNode } from '@/legacy/master-lab/commentTree';
import CommentBody from '@/legacy/labs/shared/CommentBody';
import ThreadButton from '@/legacy/labs/shared/ThreadButton';

export default function FocusThread({ roots }: { roots: CommentNode[] }) {
  const [trail, setTrail] = useState<CommentNode[]>([]);
  const focused = trail.length > 0 ? trail[trail.length - 1] : undefined;
  const replies = focused ? focused.children : roots;

  return (
    <div className="flex flex-col gap-5">
      {focused && (
        <>
          <nav aria-label="Conversation trail" className="flex flex-wrap items-center gap-1 text-xs text-[var(--foreground)]/50">
            <button type="button" onClick={() => setTrail([])} className="transition-colors hover:text-[var(--theme-primary-glow)]">
              All comments
            </button>
            {trail.map((node, index) => (
              <span key={node.id} className="flex items-center gap-1">
                <ChevronRight className="h-3 w-3" aria-hidden />
                {index === trail.length - 1 ? (
                  <span className="font-medium text-[var(--foreground)]">{node.profiles?.display_name || "Observer"}</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setTrail(trail.slice(0, index + 1))}
                    className="transition-colors hover:text-[var(--theme-primary-glow)]"
                  >
                    {node.profiles?.display_name || "Observer"}
                  </button>
                )}
              </span>
            ))}
          </nav>

          <div className="border-l-2 border-[var(--theme-primary-glow)] pl-4">
            <CommentBody comment={focused} emphasis />
          </div>
        </>
      )}

      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--foreground)]/40">
        {focused
          ? `${replies.length} direct ${replies.length === 1 ? 'reply' : 'replies'}`
          : `${roots.length} top comments`}
      </span>

      <ul className="flex flex-col gap-5">
        {replies.map((reply) => (
          <li key={reply.id} className="flex flex-col gap-2">
            <CommentBody comment={reply} />
            {reply.children.length > 0 && (
              <ThreadButton onClick={() => setTrail([...trail, reply])}>
                Step into {reply.size - 1} {reply.size - 1 === 1 ? 'reply' : 'replies'}
                <ChevronRight className="h-3 w-3" aria-hidden />
              </ThreadButton>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
