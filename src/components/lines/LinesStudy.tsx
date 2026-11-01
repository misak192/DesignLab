/**
 * File: src/components/lines/LinesStudy.tsx
 * Description: The /lines page: 66 designs for a line of light, in seven groups. Each is drawn twice, the way the timeline needs it: as an
 * event stem rising from a dot with its date and words beside it, and as a horizontal ray with a label on it (the ES Employment bar). The
 * colour and the Shift (how far the colour's cousins are moved in RGB) are shared by all. Two of them can be pressed and dissipate. Each cell
 * shows its real element count. The favourite is saved in localStorage ("fw-line-design"). No cell has a background or border.
 */
"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useMotion } from '@/components/display/DisplayProvider';
import { useMounted, useSeen } from '@/components/chartstudy/hooks';
import { createPickStore } from '@/components/chartstudy/pick';
import { COLOURS, CYCLE, Options, SHIFTS, palette } from '@/components/chartstudy/dots/DotStudy';
import type { DotSettings } from '@/components/chartstudy/dots/DotStudy';
import { LINE_DESIGNS } from './index';
import { LINE_GROUPS, LINE_OPTIONS } from './options';
import type { LineOption } from './options';

const { subscribe, getSnapshot, getServerSnapshot, setPick } = createPickStore('fw-line-design');

const STEM = 118; // length of the stem in px
const RAY = 190; // length of the ray in px
const BOX = 30; // the box across a line, in px

function Cell({ option, index, settings, live, picked }: { option: LineOption; index: number; settings: DotSettings; live: boolean; picked: boolean }) {
  const [ref, seen] = useSeen();
  const mounted = useMounted();
  const area = useRef<HTMLDivElement | null>(null);
  const [nodes, setNodes] = useState<number | null>(null);
  const Design = LINE_DESIGNS[option.id];

  const fixed = COLOURS.find((x) => x.id === settings.colour)?.hex ?? null;
  const amt = SHIFTS.find((x) => x.id === settings.shift)?.amt ?? 48;
  const base = { ...palette(fixed ?? CYCLE[index % CYCLE.length], amt), live, t: 4, box: BOX, seed: index + 3 };

  // How many elements the line is made of (both drawings), counted from the page.
  useEffect(() => {
    if (mounted && area.current) setNodes(area.current.querySelectorAll('*').length);
  }, [mounted, option.id]);

  return (
    <li ref={ref} data-seen={seen} className="fw-ce flex min-w-0 flex-col gap-3">
      <p className="fw-kicker">
        <span className="fw-tabular text-t1">{option.id}</span>
      </p>
      <h3 className="fw-big text-[20px] font-light leading-[1.2] text-ink">{option.name}</h3>

      <div ref={area} className="flex min-h-[150px] flex-wrap items-end gap-x-10 gap-y-8">
        {mounted && (
          <>
            {/* The event stem: rises from its dot, with a date and words beside it, like the timeline. */}
            <div className="relative" style={{ width: 150, height: STEM + 14 }}>
              <div style={{ position: 'absolute', left: 0, bottom: 8 }}>
                <Design {...base} o="v" len={STEM} />
              </div>
              {!option.ownDot && (
                <span
                  aria-hidden
                  style={{ position: 'absolute', left: BOX / 2 - 5, bottom: 3, width: 10, height: 10, borderRadius: '50%', background: `radial-gradient(circle, #fff 0 30%, ${base.hi} 70%)`, boxShadow: `0 0 8px ${base.hi}` }}
                />
              )}
              <span className="pointer-events-none absolute flex flex-col whitespace-nowrap" style={{ left: BOX + 8, top: 0 }}>
                <span className="fw-kicker text-[0.6875rem] tracking-[2px] text-ink-2">19 May 2021</span>
                <span className="fw-big text-[1rem] font-light leading-[1.25] text-ink">ES First Day</span>
              </span>
            </div>

            {/* The ray: the ES Employment bar, with its label on it. */}
            <div className="relative" style={{ width: RAY, height: BOX }}>
              <Design {...base} o="h" len={RAY} />
              {option.id !== 'T06' && (
                <span className={`pointer-events-none absolute left-3 whitespace-nowrap text-[0.9375rem] font-normal text-ink ${option.bar ? 'top-1/2 -translate-y-1/2' : '-top-6'}`}>ES Employment</span>
              )}
            </div>
          </>
        )}
      </div>

      <p className="min-h-[4.4em] text-[0.875rem] font-normal leading-[1.45] text-ink-2">{option.description}</p>
      <div className="flex min-h-[48px] flex-wrap items-baseline gap-x-5">
        <button type="button" className="fw-pick" aria-pressed={picked} onClick={() => setPick(option.id)}>
          Pick
        </button>
        {option.interactive && <span className="fw-kicker text-t1">Press it</span>}
        {picked && <span className="fw-kicker text-t1">Picked</span>}
        {nodes !== null && <span className="fw-tabular text-[0.8125rem] font-light text-ink-3">{nodes === 1 ? '1 element' : `${nodes} elements`}</span>}
      </div>
    </li>
  );
}

export default function LinesStudy() {
  const live = useMotion().scale > 0;
  const [settings, setSettings] = useState<DotSettings>({ colour: 'mix', shift: 'medium' });
  const picked = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const pickedOption = LINE_OPTIONS.find((o) => o.id === picked);

  return (
    <main className="mx-auto flex w-full max-w-[1700px] flex-1 flex-col px-7 pb-40 pt-10 sm:pt-14">
      <header className="flex flex-col gap-8 pb-12">
        <Link href="/category/light" className="fw-kicker w-fit text-ink-2 transition-colors hover:text-ink">
          ← Light
        </Link>
        <div className="flex flex-col gap-6">
          <p className="fw-kicker text-t1">Light · Lines</p>
          <h1 className="fw-vogue text-[clamp(30px,7vw,64px)] leading-[1.1] text-ink">Lines</h1>
        </div>
        <p className="fw-big max-w-[32ch] text-[29px] font-light leading-[1.25] text-ink">Sixty-six ways to draw a line of light.</p>
        <p className="max-w-[62ch] text-[1.0625rem] font-light leading-[1.5] text-ink-2">
          Every design is drawn twice, the way a timeline needs it: as an event stem rising from its dot, with a date and words beside it, and as a
          horizontal ray with a label on it, like the ES Employment bar. Soft airbrush, neon, cyberpunk, lasers and sabers, light that dissipates, rays
          made only of stars, hairlines, and the ones I would use. Two of them can be pressed. All are gradients, masks and tiny elements, with no blur
          filter and no backdrop-filter; the count under each is how many elements it really is.
        </p>
        <div className="flex flex-col">
          <Options label="Colour" items={COLOURS} current={settings.colour} onPick={(colour) => setSettings((s) => ({ ...s, colour }))} />
          <Options label="Shift" items={SHIFTS} current={settings.shift} onPick={(shift) => setSettings((s) => ({ ...s, shift }))} />
        </div>
        <div className="flex min-h-[48px] flex-wrap items-baseline gap-x-6">
          <span className="fw-kicker text-ink-2">Favourite</span>
          {pickedOption ? (
            <>
              <span className="fw-big text-[20px] font-light text-t1">
                {pickedOption.id} · {pickedOption.name}
              </span>
              <button type="button" className="fw-pick" onClick={() => setPick(null)}>
                Clear
              </button>
            </>
          ) : (
            <span className="text-[0.9375rem] font-light text-ink-3">None yet</span>
          )}
        </div>
        {!live && (
          <p className="max-w-[62ch] text-[0.9375rem] font-light text-ink-2">
            MOTION is off, or your device asks for reduced motion: the lights that travel, flicker and breathe are drawn still, and the star rays dissipate
            at once. Turn MOTION on in the header to see them move.
          </p>
        )}
      </header>

      <div className="flex flex-col gap-14">
        {LINE_GROUPS.map((group, g) => (
          <section key={group.letter} aria-labelledby={`lines-${group.letter}`} className="border-t border-[var(--rail)] pt-6">
            <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1 pb-6">
              <h2 id={`lines-${group.letter}`} className="fw-kicker">
                <span className="text-t1">{group.letter}</span>
                <span className="text-ink"> · {group.title}</span>
              </h2>
              <p className="text-[0.9375rem] font-light text-ink-2">{group.note}</p>
            </div>
            <ul className="grid grid-cols-1 gap-x-10 gap-y-14 md:grid-cols-2 xl:grid-cols-3">
              {LINE_OPTIONS.filter((o) => o.group === g).map((option) => (
                <Cell key={option.id} option={option} index={LINE_OPTIONS.indexOf(option)} settings={settings} live={live} picked={picked === option.id} />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
