/**
 * File: src/components/comments/useHeightTransition.ts
 * Description: A short height animation for a block whose content changes size when something is revealed inside it.
 * Nothing is reserved while the content is hidden; call `mark()` just before the change, and after the change is
 * painted into the DOM the block's height glides from what it was to what it is now (WAAPI, so it also works when the
 * new content wraps onto another line). Does nothing when `ms` is 0 (MOTION off or reduced motion).
 */
import { useCallback, useLayoutEffect, useRef } from 'react';

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

export function useHeightTransition<T extends HTMLElement>(change: unknown, ms: number) {
  const ref = useRef<T>(null);
  const before = useRef<number | null>(null);

  /** Remember the block's height right now; the next change animates from it. */
  const mark = useCallback(() => {
    before.current = ref.current ? ref.current.offsetHeight : null;
  }, []);

  useLayoutEffect(() => {
    const el = ref.current;
    const from = before.current;
    before.current = null;
    if (!el || from === null || ms <= 0) return;

    const to = el.offsetHeight;
    if (from === to) return;

    el.style.overflow = 'hidden';
    const animation = el.animate([{ height: `${from}px` }, { height: `${to}px` }], { duration: ms, easing: EASE });
    const done = () => {
      el.style.overflow = '';
    };
    animation.onfinish = done;
    animation.oncancel = done;
  }, [change, ms]);

  return { ref, mark };
}
