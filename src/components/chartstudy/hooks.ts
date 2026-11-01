/**
 * File: src/components/chartstudy/hooks.ts
 * Description: Two hooks both study pages use: `useMounted` (false on the server and during hydration, true after) and
 * `useSeen` (true while an element is on screen).
 */
"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { RefObject } from 'react';

const noop = () => () => {};

/**
 * False on the server and during hydration, true afterwards. The artwork is drawn with computed fractions of a pixel
 * (angles, particle positions) that the server and the browser print differently, so it is drawn on the client only;
 * the boxes keep their size, so nothing moves when it appears.
 */
export const useMounted = () => useSyncExternalStore(noop, () => true, () => false);

/** True while the element is on screen: entries wait for it, loops pause when it leaves. */
export function useSeen(): [RefObject<HTMLLIElement | null>, boolean] {
  const ref = useRef<HTMLLIElement | null>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setSeen(true);
      return;
    }
    const io = new IntersectionObserver(([e]) => setSeen(e.isIntersecting), { rootMargin: '60px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, seen];
}
