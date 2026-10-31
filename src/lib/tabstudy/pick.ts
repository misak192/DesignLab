/**
 * File: src/lib/tabstudy/pick.ts
 * Description: The favourite tab design on /tab-selection, kept in localStorage under "fw-tab-pick" and read through
 * useSyncExternalStore. Every storage access is wrapped in try/catch; if storage is unavailable the pick lives in memory
 * for the visit, so the page still works.
 */
export const PICK_KEY = 'fw-tab-pick';

let memory: string | null = null;
const listeners = new Set<() => void>();

export function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === PICK_KEY || e.key === null) {
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

export function getSnapshot(): string | null {
  try {
    const stored = window.localStorage.getItem(PICK_KEY);
    if (stored !== null) return stored;
  } catch {
    /* storage blocked: fall through to memory */
  }
  return memory;
}

export const getServerSnapshot = (): string | null => null;

/** Pass null to clear. */
export function setPick(id: string | null): void {
  memory = id;
  try {
    if (id === null) window.localStorage.removeItem(PICK_KEY);
    else window.localStorage.setItem(PICK_KEY, id);
  } catch {
    /* storage blocked: the memory copy carries the pick */
  }
  listeners.forEach((cb) => cb());
}
