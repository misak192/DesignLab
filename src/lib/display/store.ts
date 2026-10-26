/**
 * File: src/lib/display/store.ts
 * Description: Where the Sovereign settings live. A tiny external store read with useSyncExternalStore, so the server
 * and the first client render both use the defaults and the saved choice arrives right after hydration, with no
 * mismatch. Display preferences only (skin, motion, ...) are kept in localStorage; no comment or lab data ever is.
 */
import { DEFAULT_SETTINGS, sanitizeSettings, type DisplaySettings } from './settings';

const KEY = 'fwlab_display_v1';

let state: DisplaySettings = DEFAULT_SETTINGS;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === 'undefined') return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) state = sanitizeSettings(JSON.parse(raw));
  } catch {
    // A blocked or corrupt store just means the defaults.
  }
}

export const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export function getSnapshot(): DisplaySettings {
  load();
  return state;
}

export const getServerSnapshot = (): DisplaySettings => DEFAULT_SETTINGS;

export function updateSettings(patch: Partial<DisplaySettings>) {
  load();
  state = { ...state, ...patch };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Not saved, still applied for this visit.
  }
  listeners.forEach((l) => l());
}
