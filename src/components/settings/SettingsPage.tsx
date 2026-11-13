/**
 * File: src/components/settings/SettingsPage.tsx
 * Description: The /settings page: every display setting in one place, in three groups kept in the URL (?tab=text, ?tab=motion).
 * LOOK (light, colour, background, titles), TEXT (size, type, shadow) and MOTION (style and amount). Each group has a live
 * preview under its options. The Sovereign header keeps only the quick ones (light, colour, motion, text size, shadow) and links here.
 * Everything is saved in this browser only, with the other display settings.
 */
"use client";
import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useDisplay } from '@/components/display/DisplayProvider';
import SizedHero from '@/components/hero/SizedHero';
import { KineticWords, Replay } from '@/components/motion/parts';
import { BG_ENGINES, BG_INTENSITIES, BG_LABEL } from '@/lib/display/background/engines';
import {
  HERO_CHOICES,
  HERO_SIZES,
  MOTION_LABEL,
  MOTION_LEVELS,
  MOTION_STYLES,
  SKINS,
  TEXT_SCALES,
  TYPE_STYLES,
  resolveHero,
  type HeroSetting,
} from '@/lib/display/settings';
import { HERO_INFO } from '@/lib/hero/heroes';
import { useUrlTab } from '@/lib/useUrlTab';

const GROUPS = [
  { id: 'look', name: 'Look', blurb: 'How the page is lit and coloured.' },
  { id: 'text', name: 'Text', blurb: 'How the words read.' },
  { id: 'motion', name: 'Motion', blurb: 'The style of the movement, and how much of it.' },
] as const;
type GroupId = (typeof GROUPS)[number]['id'];
const GROUP_IDS = GROUPS.map((g) => g.id);

const upper = (s: string) => s.toUpperCase();
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

interface Opt {
  id: string;
  label: string;
}

/** One setting: a label, a line on what it does, and every option as a button. */
function Setting({ label, hint, options, current, onPick }: { label: string; hint?: string; options: Opt[]; current: string; onPick: (id: string) => void }) {
  return (
    <div className="grid items-start gap-x-6 border-t border-[var(--rail)] py-3 sm:grid-cols-[140px_1fr]">
      <span className="fw-kicker flex min-h-[48px] items-center text-ink-2">{label}</span>
      <div className="flex flex-col">
        <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-x-1">
          {options.map((o) => (
            <button key={o.id} type="button" role="radio" aria-checked={o.id === current} className="fw-opt" onClick={() => onPick(o.id)}>
              {o.label}
            </button>
          ))}
        </div>
        {hint && <p className="max-w-[60ch] pb-1 text-[0.875rem] font-normal text-ink-3">{hint}</p>}
      </div>
    </div>
  );
}

function Preview({ children }: { children: ReactNode }) {
  return (
    <div className="mt-10 flex flex-col gap-4 border-t border-[var(--rail)] pt-6">
      <h2 className="fw-kicker text-ink-2">Preview</h2>
      {children}
    </div>
  );
}

function LookGroup() {
  const { settings, set } = useDisplay();
  const resolved = resolveHero(settings);
  return (
    <>
      <Setting label="Light" options={[{ id: 'dark', label: 'Dark' }, { id: 'light', label: 'Light' }]} current={settings.light ? 'light' : 'dark'} onPick={(id) => set({ light: id === 'light' })} />
      <Setting label="Colour" options={SKINS.map((s) => ({ id: s, label: upper(s) }))} current={settings.skin} onPick={(skin) => set({ skin: skin as (typeof SKINS)[number] })} />
      <Setting
        label="Background"
        options={BG_ENGINES.filter((e) => e !== 'scenery').map((e) => ({ id: e, label: BG_LABEL[e] }))}
        current={settings.bgEngine}
        onPick={(bgEngine) => set({ bgEngine: bgEngine as typeof settings.bgEngine })}
      />
      <Setting
        label="Intensity"
        hint={settings.bgEngine === 'off' ? 'Choose a background first.' : undefined}
        options={BG_INTENSITIES.map((i) => ({ id: i, label: upper(i) }))}
        current={settings.bgIntensity}
        onPick={(bgIntensity) => set({ bgIntensity: bgIntensity as typeof settings.bgIntensity })}
      />
      <Setting
        label="Titles"
        hint={settings.hero === 'auto' ? `Auto follows the motion style: ${HERO_INFO[resolved].name} for ${cap(settings.style)}.` : 'Every design is on the Hero titles page.'}
        options={HERO_CHOICES.map((h) => ({ id: h, label: h === 'auto' ? 'AUTO' : upper(HERO_INFO[h].name) }))}
        current={settings.hero}
        onPick={(hero) => set({ hero: hero as HeroSetting })}
      />
      <Setting
        label="Title size"
        hint="Huge is the size on the home page. Off draws a plain title with no huge word behind it."
        options={HERO_SIZES.map((s) => ({ id: s, label: upper(s) }))}
        current={settings.heroSize}
        onPick={(heroSize) => set({ heroSize: heroSize as (typeof HERO_SIZES)[number] })}
      />

      <Preview>
        <SizedHero word="Frissonworks" base={150} overlap={0.1} className="pb-10">
          <div className="flex flex-col gap-4 pt-2">
            <p className="fw-vogue text-[clamp(26px,5vw,44px)] leading-[1.1] text-ink">Design Lab</p>
            <p className="fw-big max-w-[28ch] text-[22px] font-light leading-[1.25] text-ink">Try it before any app has to live with it.</p>
          </div>
        </SizedHero>
      </Preview>

      <div className="mt-10 flex flex-col gap-2">
        <h2 className="fw-kicker text-ink-2">Chosen on their own pages</h2>
        <ul className="flex flex-wrap gap-x-8">
          {[
            { href: '/cards', label: 'Card design' },
            { href: '/backgrounds', label: 'Comment glow' },
            { href: '/landing', label: 'Home layout and welcome' },
            { href: '/hero-titles', label: 'All hero titles' },
          ].map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="fw-sk-btn" data-kind="primary">
                {l.label} →
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

function TextGroup() {
  const { settings, set } = useDisplay();
  return (
    <>
      <Setting label="Size" hint="Reading text scales. Titles and statements keep their size." options={TEXT_SCALES.map((s) => ({ id: s, label: upper(s) }))} current={settings.text} onPick={(text) => set({ text: text as (typeof TEXT_SCALES)[number] })} />
      <Setting label="Type" options={TYPE_STYLES.map((s) => ({ id: s, label: upper(s) }))} current={settings.type} onPick={(type) => set({ type: type as (typeof TYPE_STYLES)[number] })} />
      <Setting
        label="Shadow"
        hint="The soft halo behind every word. Turn it off if it makes text harder to read."
        options={[{ id: 'on', label: 'ON' }, { id: 'off', label: 'OFF' }]}
        current={settings.shadow ? 'on' : 'off'}
        onPick={(id) => set({ shadow: id === 'on' })}
      />

      <Preview>
        <p className="fw-kicker text-t1">01 · Kicker</p>
        <p className="fw-vogue text-[clamp(26px,5vw,44px)] leading-[1.1] text-ink">Vogue title</p>
        <p className="fw-big max-w-[30ch] text-[29px] font-light leading-[1.25] text-ink">A statement, the one sentence on a page.</p>
        <p className="max-w-[56ch] text-[1.0625rem] font-light leading-[1.5] text-ink-2">
          Reading text sits at normal weight and size, and it is the part that grows and shrinks with Size above.
        </p>
      </Preview>
    </>
  );
}

function MotionGroup() {
  const { settings, set } = useDisplay();
  const [replay, setReplay] = useState(0);
  return (
    <>
      <Setting
        label="Style"
        hint="The character of the movement. Saved now, but the designs for each style are still being chosen on Lab Master, so nothing changes yet."
        options={MOTION_STYLES.map((s) => ({ id: s, label: upper(s) }))}
        current={settings.style}
        onPick={(style) => set({ style: style as (typeof MOTION_STYLES)[number] })}
      />
      <Setting
        label="Amount"
        hint="How much anything moves. Off is nothing moving, and it also follows your device's reduced-motion setting."
        options={MOTION_LEVELS.map((l) => ({ id: l, label: MOTION_LABEL[l] }))}
        current={settings.motion}
        onPick={(motion) => set({ motion: motion as (typeof MOTION_LEVELS)[number] })}
      />
      <p className="border-t border-[var(--rail)] pt-4">
        <Link href="/master" className="fw-sk-btn" data-kind="primary">
          Choose the designs on Lab Master →
        </Link>
      </p>

      <Preview>
        <KineticWords text="Words that arrive" replay={replay} className="fw-vogue text-[clamp(26px,5vw,44px)] leading-[1.1] text-ink" />
        <div>
          <Replay onClick={() => setReplay((n) => n + 1)} />
        </div>
      </Preview>
    </>
  );
}

export default function SettingsPage() {
  const [tab, selectTab] = useUrlTab<GroupId>(GROUP_IDS);
  const active = GROUPS.find((g) => g.id === tab) ?? GROUPS[0];

  return (
    <main className="mx-auto flex w-full max-w-[1000px] flex-1 flex-col px-7 pb-40 pt-10 sm:pt-14">
      <header className="flex flex-col gap-8 pb-10">
        <Link href="/" className="fw-kicker w-fit text-ink-2 transition-colors hover:text-ink">
          ← Design Lab
        </Link>
        <h1 className="fw-vogue text-[clamp(30px,7vw,64px)] leading-[1.1] text-ink">Settings</h1>
        <p className="fw-big max-w-[30ch] text-[29px] font-light leading-[1.25] text-ink">Everything that can change, in three groups.</p>
      </header>

      <div role="tablist" aria-label="Settings groups" className="mb-2 flex flex-wrap gap-x-8">
        {GROUPS.map((g) => (
          <button key={g.id} type="button" role="tab" aria-selected={g.id === tab} className="fw-ts-tab" onClick={() => selectTab(g.id)}>
            <span className="relative whitespace-nowrap">
              {g.name}
              {g.id === tab && <span aria-hidden className="absolute inset-x-0 -bottom-1 block h-px bg-t1" />}
            </span>
          </button>
        ))}
      </div>
      <p className="mb-6 text-[0.9375rem] font-light text-ink-2">{active.blurb}</p>

      <div role="tabpanel" aria-label={active.name}>
        {tab === 'look' && <LookGroup />}
        {tab === 'text' && <TextGroup />}
        {tab === 'motion' && <MotionGroup />}
      </div>
    </main>
  );
}
