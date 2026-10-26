/**
 * File: src/components/backgrounds/BackgroundsLab.tsx
 * Description: The /backgrounds page: how light behaves in the lab. Tab one, Threads: seven ways a comment box lights
 * up while you write in it (click into a field; post to see it react), each a real composer; "Use in comments" saves
 * the choice for the Comments Room. Tab two, Page: the page backgrounds from the Sovereign header, with their own
 * chooser, so a background can be compared without opening the panel.
 */
"use client";
import Link from 'next/link';
import { motion } from 'framer-motion';
import Composer from '@/components/comments/Composer';
import { Option, Row } from '@/components/comments/Controls';
import { useDisplay, useMotion } from '@/components/display/DisplayProvider';
import { BG_ENGINES, BG_INTENSITIES, BG_LABEL } from '@/lib/display/background/engines';
import { GLOW_STYLES, type GlowStyle } from '@/lib/display/settings';
import { transitionFor } from '@/lib/motion/presets';
import { useUrlTab } from '@/lib/useUrlTab';

const TAB_IDS = ['threads', 'page'] as const;
type TabId = (typeof TAB_IDS)[number];
const TABS: { id: TabId; label: string }[] = [
  { id: 'threads', label: 'Threads' },
  { id: 'page', label: 'Page' },
];

const GLOW_INFO: Record<GlowStyle, { name: string; note: string }> = {
  none: { name: 'None', note: 'No light at all, only a hairline that brightens. The baseline to compare against.' },
  line: { name: 'Line', note: 'A line of the skin colour grows out from the middle, with a soft wash rising from it.' },
  spotlight: { name: 'Spotlight', note: 'A soft pool of the skin colour that follows the pointer across the field.' },
  mesh: { name: 'Mesh', note: 'Three slow blobs of the skin colours drifting under a faint lattice of hairlines. Subtle.' },
  gradient: { name: 'Theme gradient', note: "The skin's own gradient, sliding slowly behind the text and fading out at the edges." },
  aurora: { name: 'Aurora', note: 'Two curtains of light swaying side to side, like the Aurora Waves page background.' },
  stars: { name: 'Stars', note: "LoreLyst's constellation button as a background: a cluster of stars that brightens as you write and blows apart when you post, then re-forms." },
};

export default function BackgroundsLab() {
  const [tab, selectTab] = useUrlTab<TabId>(TAB_IDS);
  const { settings, set } = useDisplay();
  const m = useMotion();

  return (
    <main className="mx-auto flex w-full max-w-[1000px] flex-1 flex-col px-7 pb-40 pt-10 sm:pt-14">
      <header className="flex flex-col gap-8 pb-10">
        <Link href="/" className="fw-kicker w-fit text-ink-2 hover:text-ink">
          ← Design Lab
        </Link>
        <h1 className="fw-vogue text-[clamp(30px,7vw,56px)] leading-[1.1] text-ink">Backgrounds</h1>
        <p className="fw-big max-w-[30ch] text-[29px] font-light leading-[1.25] text-ink">
          {tab === 'threads' ? 'How a box lights up when you write in it.' : 'What the whole page sits on.'}
        </p>
      </header>

      <div role="tablist" aria-label="Backgrounds" className="mb-12 flex flex-wrap gap-x-10 gap-y-1">
        {TABS.map((t) => {
          const selected = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => selectTab(t.id)}
              className="fw-big relative min-h-[48px] text-[22px] font-light uppercase tracking-[0.08em] transition-colors hover:text-t1"
              style={{ color: selected ? 'var(--t1)' : 'var(--ink)', fontWeight: selected ? 400 : 300 }}
            >
              {t.label}
              {selected && (
                <motion.span
                  layoutId="backgrounds-tab-line"
                  aria-hidden
                  transition={transitionFor(m, 0.5)}
                  className="absolute inset-x-0 bottom-1 h-px bg-t1"
                />
              )}
            </button>
          );
        })}
      </div>

      {tab === 'threads' && (
        <div role="tabpanel" className="flex flex-col gap-16">
          <p className="max-w-[58ch] text-[1.0625rem] font-light leading-[1.5] text-ink-2">
            Click into a field to light it. Post to see it react. The one marked in use is what the Comments Room uses; change
            MOTION in the header to feel each one at OFF, NORMAL, COLOUR and OTT.
          </p>

          <div className="grid gap-x-16 gap-y-20 sm:grid-cols-2">
            {GLOW_STYLES.map((glow, i) => {
              const chosen = settings.glow === glow;
              return (
                <section key={glow} aria-labelledby={`glow-${glow}`} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-baseline gap-3">
                      <span className="fw-kicker fw-tabular text-t1">{String(i + 1).padStart(2, '0')}</span>
                      <h2 id={`glow-${glow}`} className="fw-kicker text-ink">
                        {GLOW_INFO[glow].name}
                      </h2>
                    </div>
                    <p className="text-[0.875rem] font-normal text-t3">{GLOW_INFO[glow].note}</p>
                  </div>

                  <Composer glow={glow} placeholder="Say something…" submitLabel="Post" onSubmit={() => {}} accent="var(--t1)" />

                  <button
                    type="button"
                    onClick={() => set({ glow })}
                    aria-pressed={chosen}
                    className="fw-big min-h-[48px] w-fit border-b text-[1.125rem] font-light uppercase tracking-[0.08em] transition-colors"
                    style={{ color: chosen ? 'var(--t1)' : 'var(--ink)', borderColor: chosen ? 'var(--t1)' : 'transparent' }}
                  >
                    {chosen ? 'In use in comments ✓' : 'Use in comments'}
                  </button>
                </section>
              );
            })}
          </div>
        </div>
      )}

      {tab === 'page' && (
        <div role="tabpanel" className="flex flex-col gap-3">
          <p className="max-w-[58ch] pb-6 text-[1.0625rem] font-light leading-[1.5] text-ink-2">
            The same backgrounds as the BG setting in the header (LoreLyst&apos;s own engines). They are still until something
            happens: click, change page, change skin. MOTION decides how far they move.
          </p>
          <Row label="Background" hint="One WebGL canvas behind everything">
            {BG_ENGINES.filter((e) => e !== 'scenery').map((engine) => (
              <Option key={engine} selected={settings.bgEngine === engine} onSelect={() => set({ bgEngine: engine })}>
                {BG_LABEL[engine]}
              </Option>
            ))}
          </Row>
          <Row label="Intensity" hint="How much of it shows over the page">
            {BG_INTENSITIES.map((level) => (
              <Option key={level} selected={settings.bgIntensity === level} onSelect={() => set({ bgIntensity: level })}>
                {level.toUpperCase()}
              </Option>
            ))}
          </Row>
        </div>
      )}
    </main>
  );
}
