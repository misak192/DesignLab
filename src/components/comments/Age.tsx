/**
 * File: src/components/comments/Age.tsx
 * Description: "5h" for a timestamp. Read from a ticking clock through useSyncExternalStore, so the server and the
 * first client render both show nothing and the real age appears right after hydration, never a mismatch.
 */
"use client";
import { useSyncExternalStore } from 'react';

const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;

function subscribe(listener: () => void) {
  listeners.add(listener);
  timer ??= setInterval(() => listeners.forEach((l) => l()), 30_000);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = undefined;
    }
  };
}

// Whole minutes, so the snapshot only changes when the label could.
const minuteNow = () => Math.floor(Date.now() / 60_000) * 60_000;

function format(ms: number): string {
  const minutes = Math.floor(ms / 60_000);
  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export default function Age({ at }: { at: number }) {
  const now = useSyncExternalStore(subscribe, minuteNow, () => 0);
  return <time dateTime={now === 0 ? undefined : new Date(at).toISOString()}>{now === 0 ? '' : format(now - at)}</time>;
}
