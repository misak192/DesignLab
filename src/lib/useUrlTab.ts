/**
 * File: src/lib/useUrlTab.ts
 * Description: A tab kept in the URL (?tab=room), read through an external store so the server render and the first
 * client render agree (the first tab) and the real one arrives right after hydration. The first id is the default
 * and is never written to the URL.
 */
"use client";
import { useCallback, useSyncExternalStore } from 'react';

const subscribe = (listener: () => void) => {
  window.addEventListener('popstate', listener);
  window.addEventListener('fwtab', listener);
  return () => {
    window.removeEventListener('popstate', listener);
    window.removeEventListener('fwtab', listener);
  };
};

export function useUrlTab<T extends string>(ids: readonly T[]): [T, (tab: T) => void] {
  const getSnapshot = (): T => {
    const t = new URLSearchParams(window.location.search).get('tab');
    return (ids as readonly string[]).includes(t ?? '') ? (t as T) : ids[0];
  };
  const tab = useSyncExternalStore(subscribe, getSnapshot, () => ids[0]);

  const select = useCallback(
    (next: T) => {
      const url = new URL(window.location.href);
      if (next === ids[0]) url.searchParams.delete('tab');
      else url.searchParams.set('tab', next);
      window.history.replaceState(null, '', url);
      window.dispatchEvent(new Event('fwtab'));
    },
    [ids]
  );

  return [tab, select];
}
