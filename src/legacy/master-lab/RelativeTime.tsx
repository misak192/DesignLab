/**
 * File: src/legacy/master-lab/RelativeTime.tsx
 * Description: Relative timestamp (2m, 4h). Defaults to StatusBadge styling; pass className to restyle.
 */
"use client";
import { getRelativeTime } from './time';

interface RelativeTimeProps {
  date: string;
  className?: string;
}

export default function RelativeTime({
  date,
  className = "font-mono text-[9px] tracking-[0.2em] uppercase transition-colors text-[var(--foreground)]/40",
}: RelativeTimeProps) {
  // The server and the browser read the clock a moment apart, so "0s" can become "1s" during hydration.
  return (
    <time dateTime={date} suppressHydrationWarning className={className}>
      {getRelativeTime(date)}
    </time>
  );
}
