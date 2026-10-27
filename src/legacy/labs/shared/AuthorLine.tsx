/**
 * File: src/legacy/labs/shared/AuthorLine.tsx
 * Description: Minimal identity for posts and comments: name · occupation · place · time. No avatar.
 */
"use client";
import RelativeTime from '@/legacy/master-lab/RelativeTime';

interface AuthorLineProps {
  name: string;
  occupation?: string;
  place?: string;
  createdAt: string;
  size?: 'post' | 'comment';
}

export default function AuthorLine({ name, occupation, place, createdAt, size = 'comment' }: AuthorLineProps) {
  const details = [occupation, place].filter((detail): detail is string => Boolean(detail));

  return (
    <div className="flex flex-wrap items-baseline gap-x-1.5 text-xs text-[var(--foreground)]/50">
      <span className={`font-semibold text-[var(--foreground)] ${size === 'post' ? 'text-[15px]' : 'text-[13px]'}`}>
        {name}
      </span>
      {details.map((detail) => (
        <span key={detail}>· {detail}</span>
      ))}
      <span>
        · <RelativeTime date={createdAt} className="" />
      </span>
    </div>
  );
}
