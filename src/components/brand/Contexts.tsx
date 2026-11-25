/**
 * File: src/components/brand/Contexts.tsx
 * Description: One monogram style seen where it will really live: as a 16 and a 32 px favicon, in a browser tab, as a 48dp
 * Android adaptive icon on a dark and a light fake home screen (all six apps), and as the monochrome themed icon. Everything
 * is drawn from the same AppMonogram, so what you pick on the abbreviations tab is exactly what you see here. Colours come
 * from the brand tokens only; the wallpapers are mixes of them.
 */
"use client";
import type { AppId } from '@/lib/brand/apps';
import { IconPlate, MONOGRAMS } from './AppMonogram';
import { useBrandPalette } from './palette';

const Label = ({ children }: { children: string }) => <span className="fw-kicker text-[0.6875rem] text-ink-3">{children}</span>;

const WALL_DARK = 'linear-gradient(160deg, color-mix(in srgb, var(--fw-lavender) 22%, var(--fw-night)), var(--fw-night) 60%, color-mix(in srgb, var(--fw-purple) 22%, var(--fw-night)))';
const WALL_LIGHT = 'linear-gradient(160deg, color-mix(in srgb, var(--fw-cyan) 22%, var(--fw-white)), color-mix(in srgb, var(--fw-violet) 8%, var(--fw-white)) 55%, color-mix(in srgb, var(--fw-pink) 18%, var(--fw-white)))';

export function HomeScreen({ id, mode, mono }: { id: number; mode: 'dark' | 'light'; mono?: boolean }) {
  const { apps } = useBrandPalette();
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-end justify-around gap-1 rounded-[22px] px-3 pb-3 pt-14" style={{ background: mode === 'dark' ? WALL_DARK : WALL_LIGHT, width: 6 * 52 + 24, height: 112 }}>
        {apps.map((a) => (
          <div key={a.id} className="flex flex-col items-center gap-1.5">
            <IconPlate app={a} variant={id} size={48} mono={mono} />
            <span className="text-[10px] font-normal" style={{ color: mode === 'dark' ? 'var(--fw-white)' : 'var(--fw-night)', textShadow: mode === 'dark' ? '0 1px 2px rgb(0 0 0 / 0.8)' : 'none' }}>
              {a.abbr}
            </span>
          </div>
        ))}
      </div>
      <Label>{mono ? 'Themed icon, one colour' : mode === 'dark' ? '48dp, dark wallpaper' : '48dp, light wallpaper'}</Label>
    </div>
  );
}

/** Favicons and the browser tab for one monogram style and one app. */
export function Favicons({ id, app }: { id: number; app: AppId }) {
  const { byId } = useBrandPalette();
  const a = byId(app);
  return (
    <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-end gap-3">
          <IconPlate app={a} variant={id} size={16} shape="squircle" />
          <IconPlate app={a} variant={id} size={32} shape="squircle" />
        </div>
        <Label>Favicon 16 and 32</Label>
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2 px-3 pb-2 pt-2" style={{ width: 210, borderRadius: '10px 10px 0 0', border: '1px solid color-mix(in srgb, var(--ink) 15%, transparent)', borderBottomColor: 'color-mix(in srgb, var(--ink) 20%, transparent)' }}>
          <IconPlate app={a} variant={id} size={16} shape="squircle" />
          <span className="truncate text-[0.8125rem] font-light text-ink">{a.prefix}Lyst</span>
          <span className="ml-auto text-[0.8125rem] font-light text-ink-3">×</span>
        </div>
        <Label>Browser tab</Label>
      </div>
    </div>
  );
}

export default function Context({ id, app }: { id: number; app: AppId }) {
  const def = MONOGRAMS.find((m) => m.id === id) ?? MONOGRAMS[0];
  return (
    <div className="flex w-full flex-col gap-5" data-variant={def.id}>
      <Favicons id={id} app={app} />
      <div className="flex flex-wrap gap-x-6 gap-y-4">
        <HomeScreen id={id} mode="dark" />
        <HomeScreen id={id} mode="light" />
        <HomeScreen id={id} mode="light" mono />
      </div>
    </div>
  );
}
