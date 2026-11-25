/**
 * File: src/components/brand/palette.tsx
 * Description: The app colour map of the Brand page as React context. Starts as the defaults from tokens.json (pink→purple
 * for ActionLyst ...); the Brand colours tab changes a gradient pair and every sample on every tab follows. Kept in memory
 * only (a refresh starts over), like everything in the lab except the display settings.
 */
"use client";
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { APP_DEFS, resolveApps, resolveParent, type AppId, type BrandApp, type BrandParent } from '@/lib/brand/apps';
import { DEFAULT_APP_MAP, type AppMap, type BrandKey, type GradientPair } from '@/lib/brand/tokens';

interface PaletteValue {
  map: AppMap;
  setPair: (key: BrandKey, pair: GradientPair) => void;
  reset: (key?: BrandKey) => void;
  apps: BrandApp[];
  parent: BrandParent;
  byId: (id: AppId) => BrandApp;
}

const Ctx = createContext<PaletteValue | null>(null);

export function BrandPaletteProvider({ children }: { children: ReactNode }) {
  const [map, setMap] = useState<AppMap>(DEFAULT_APP_MAP);
  const value = useMemo<PaletteValue>(() => {
    const apps = resolveApps(map);
    return {
      map,
      setPair: (key, pair) => setMap((m) => ({ ...m, [key]: pair })),
      reset: (key) => setMap((m) => (key ? { ...m, [key]: DEFAULT_APP_MAP[key] } : DEFAULT_APP_MAP)),
      apps,
      parent: resolveParent(map),
      byId: (id) => apps.find((a) => a.id === id) ?? apps[0],
    };
  }, [map]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** The current apps (with their gradients), the parent brand and the setters. Falls back to the defaults outside a provider. */
export function useBrandPalette(): PaletteValue {
  const v = useContext(Ctx);
  if (v) return v;
  const apps = resolveApps();
  return { map: DEFAULT_APP_MAP, setPair: () => {}, reset: () => {}, apps, parent: resolveParent(), byId: (id) => apps.find((a) => a.id === id) ?? apps[0] };
}

export const APP_KEYS: BrandKey[] = [...APP_DEFS.map((a) => a.id as BrandKey), 'frisson'];
