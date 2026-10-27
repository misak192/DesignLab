/**
 * File: src/legacy/labs/comments/ChatThread.tsx
 * Description: Lab 05. WhatsApp / Discord style: every comment in time order, replies quote what they answer.
 */
"use client";
import { CommentNode, flattenTree } from '@/legacy/master-lab/commentTree';
import CommentBody from '@/legacy/labs/shared/CommentBody';

export default function ChatThread({ roots }: { roots: CommentNode[] }) {
  const messages = flattenTree(roots);
  const messagesById = new Map(messages.map((message): [string, CommentNode] => [message.id, message]));

  return (
    <ol className="flex flex-col gap-3">
      {messages.map((message) => {
        const quoted = message.parent_comment_id ? messagesById.get(message.parent_comment_id) : undefined;

        return (
          <li key={message.id} className="flex max-w-[90%] flex-col gap-2 rounded-2xl bg-[var(--foreground)]/5 px-4 py-3">
            {quoted && (
              <div className="border-l-2 border-[var(--theme-primary-glow)] pl-3 text-xs text-[var(--foreground)]/50">
                <span className="font-semibold">{quoted.profiles?.display_name || "Observer"}</span>
                <p className="truncate">{quoted.content}</p>
              </div>
            )}
            <CommentBody comment={message} />
          </li>
        );
      })}
    </ol>
  );
}
