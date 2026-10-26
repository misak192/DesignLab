/**
 * File: src/components/display/DisplayProvider.tsx
 * Description: Hooks and the one effect that turns the Sovereign settings into the page: skin and light mode on
 * <body>, text size and typeface on <html>, the halo switch, and the MOTION level (as data-kinematics, which the
 * background and CSS read). The values live in src/lib/display/store.ts.
 */
"use client";
import { useEffect, useSyncExternalStore } from 'react';
import { getServerSnapshot, getSnapshot, subscribe, updateSettings } from '@/lib/display/store';
import { SKINS, type DisplaySettings } from '@/lib/display/settings';
import { MOTION_PRESETS, type MotionPreset } from '@/lib/motion/presets';

export function useDisplay(): { settings: DisplaySettings; set: (patch: Partial<DisplaySettings>) => void } {
  const settings = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return { settings, set: updateSettings };
}

/** The feel of the current MOTION level (see src/lib/motion/presets.ts). Also off when the visitor asks for reduced motion. */
export function useMotion(): MotionPreset {
  const { settings } = useDisplay();
  const reduced = useSyncExternalStore(
    (cb) => {
      const q = window.matchMedia('(prefers-reduced-motion: reduce)');
      q.addEventListener('change', cb);
      return () => q.removeEventListener('change', cb);
    },
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    () => false
  );
  return MOTION_PRESETS[reduced ? 'off' : settings.motion];
}

/** Mounted once in the root layout. Draws nothing. */
export function DisplayEffects() {
  const { settings } = useDisplay();

  useEffect(() => {
    const body = document.body;
    const html = document.documentElement;
    SKINS.forEach((s) => body.classList.remove(`theme-${s}`));
    body.classList.add(`theme-${settings.skin}`);
    body.classList.toggle('light-mode', settings.light);
    body.setAttribute('data-kinematics', settings.motion);
    body.setAttribute('data-shadow', settings.shadow ? 'on' : 'off');
    html.setAttribute('data-text-scale', settings.text);
    html.setAttribute('data-type-style', settings.type);
    html.style.colorScheme = settings.light ? 'light' : 'dark';
  }, [settings]);

  return null;
}
