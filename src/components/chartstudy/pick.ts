/**
 * File: src/components/chartstudy/pick.ts
 * Description: The favourites of the Chart Elements Study, kept in localStorage and read through useSyncExternalStore.
 * `createPickStore(key)` makes one store per key: "fw-chart-element" for the 30 chart elements and "fw-chart-dot" for the
 * 36 dots. Every storage access is wrapped in try/catch; if storage is unavailable the pick lives in memory for the
 * visit, so the page still works.
 */
export function createPickStore(key: string) {
  let memory: string | null = null;
  const listeners = new Set<() => void>();

  function subscribe(cb: () => void): () => void {
    listeners.add(cb);
    const onStorage = (e: StorageEvent) => {
      if (e.key === key || e.key === null) {
        memory = null;
        cb();
      }
    };
    window.addEventListener('storage', onStorage);
    return () => {
      listeners.delete(cb);
      window.removeEventListener('storage', onStorage);
    };
  }

  function getSnapshot(): string | null {
    try {
      const stored = window.localStorage.getItem(key);
      if (stored !== null) return stored;
    } catch {
      /* storage blocked: fall through to memory */
    }
    return memory;
  }

  const getServerSnapshot = (): string | null => null;

  /** Pass null to clear. */
  function setPick(id: string | null): void {
    memory = id;
    try {
      if (id === null) window.localStorage.removeItem(key);
      else window.localStorage.setItem(key, id);
    } catch {
      /* storage blocked: the memory copy carries the pick */
    }
    listeners.forEach((cb) => cb());
  }

  return { subscribe, getSnapshot, getServerSnapshot, setPick };
}

export const PICK_KEY = 'fw-chart-element';
export const { subscribe, getSnapshot, getServerSnapshot, setPick } = createPickStore(PICK_KEY);
