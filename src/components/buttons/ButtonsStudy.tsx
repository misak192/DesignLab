/**
 * File: src/components/buttons/ButtonsStudy.tsx
 * Description: The /buttons page: fifty kinetic buttons in ten rows of five (BUTTON_ROWS). Every button is a bare word, no border
 * and no fill; it rests in a look of light and answers a press with a move (pulse, jump, scatter, slice, zoom to nothing...).
 * Shared settings: Colour and Shift (as on the dot pages), the label, its case, the playback speed (for watching a move slowly) and
 * "Press all". Each cell shows its real element count at rest. The favourite is saved in localStorage ("fw-button-design").
 */
"use client";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useMotion } from '@/components/display/DisplayProvider';
import { useMounted, useSeen } from '@/components/chartstudy/hooks';
import { createPickStore } from '@/components/chartstudy/pick';
import { COLOURS, CYCLE, Options, SHIFTS, palette } from '@/components/chartstudy/dots/DotStudy';
import { BUTTON_LABELS, BUTTON_OPTIONS, BUTTON_ROWS, type ButtonOption } from '@/lib/buttons/options';
import KButton from './KButton';

const { subscribe, getSnapshot, getServerSnapshot, setPick } = createPickStore('fw-button-design');

const SPEEDS = [
  { id: '1', label: 'Normal', v: 1 },
  { id: '0.4', label: 'Slow', v: 0.4 },
  { id: '0.2', label: 'Very slow', v: 0.2 },
] as const;
const CASES = [
  { id: 'upper', label: 'Upper' },
  { id: 'sentence', label: 'Sentence' },
] as const;
const LABELS = BUTTON_LABELS.map((l) => ({ id: l.id, label: l.label }));

interface Settings {
  colour: (typeof COLOURS)[number]['id'];
  shift: (typeof SHIFTS)[number]['id'];
  label: (typeof BUTTON_LABELS)[number]['id'];
  case: (typeof CASES)[number]['id'];
  speed: (typeof SPEEDS)[number]['id'];
}

function Cell({ option, index, settings, live, amp, picked, all }: { option: ButtonOption; index: number; settings: Settings; live: boolean; amp: number; picked: boolean; all: number }) {
  const [ref, seen] = useSeen();
  const mounted = useMounted();
  const area = useRef<HTMLDivElement | null>(null);
  const [nodes, setNodes] = useState<number | null>(null);

  const fixed = COLOURS.find((x) => x.id === settings.colour)?.hex ?? null;
  const amt = SHIFTS.find((x) => x.id === settings.shift)?.amt ?? 48;
  const pal = palette(fixed ?? CYCLE[index % CYCLE.length], amt);
  const tones = useMemo(() => ({ c: pal.c, hi: pal.hi, lo: pal.lo }), [pal.c, pal.hi, pal.lo]);
  const label = BUTTON_LABELS.find((l) => l.id === settings.label)?.label ?? 'Continue';
  const speed = SPEEDS.find((s) => s.id === settings.speed)?.v ?? 1;

  // How many elements the button is made of at rest, counted from the page.
  useEffect(() => {
    if (mounted && area.current) setNodes(area.current.querySelectorAll('*').length);
  }, [mounted, option.id, label]);

  return (
    <li ref={ref} data-seen={seen} className="fw-ce flex min-w-0 flex-col gap-3">
      <p className="fw-kicker">
        <span className="fw-tabular text-t1">{option.id}</span>
      </p>
      <h3 className="fw-big text-[20px] font-light leading-[1.2] text-ink">{option.name}</h3>
      <div ref={area} className="flex min-h-[132px] items-center justify-center">
        <KButton
          option={option}
          label={label}
          upper={settings.case === 'upper'}
          tones={tones}
          live={live}
          amp={amp}
          speed={speed}
          auto={all}
          autoDelay={index * 60}
        />
      </div>
      <p className="min-h-[4.4em] text-[0.875rem] font-normal leading-[1.45] text-ink-2">{option.description}</p>
      <div className="flex min-h-[48px] flex-wrap items-baseline gap-x-5">
        <button type="button" className="fw-pick" aria-pressed={picked} onClick={() => setPick(option.id)}>
          Pick
        </button>
        {picked && <span className="fw-kicker text-t1">Picked</span>}
        {nodes !== null && <span className="fw-tabular text-[0.8125rem] font-light text-ink-3">{nodes === 1 ? '1 element' : `${nodes} elements`}</span>}
      </div>
    </li>
  );
}

export default function ButtonsStudy() {
  const m = useMotion();
  const live = m.scale > 0;
  const amp = m.level === 'ott' ? 1.5 : 1;
  const [settings, setSettings] = useState<Settings>({ colour: 'mix', shift: 'medium', label: 'continue', case: 'upper', speed: '1' });
  const [all, setAll] = useState(0);
  const picked = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const pickedOption = BUTTON_OPTIONS.find((o) => o.id === picked);
  const set = <K extends keyof Settings>(key: K) => (v: Settings[K]) => setSettings((s) => ({ ...s, [key]: v }));

  return (
    <main className="mx-auto flex w-full max-w-[1700px] flex-1 flex-col px-7 pb-40 pt-10 sm:pt-14">
      <header className="flex flex-col gap-8 pb-12">
        <Link href="/category/controls" className="fw-kicker w-fit text-ink-2 transition-colors hover:text-ink">
          ← Controls
        </Link>
        <div className="flex flex-col gap-6">
          <p className="fw-kicker text-t1">Controls · Buttons</p>
          <h1 className="fw-vogue text-[clamp(30px,7vw,64px)] leading-[1.1] text-ink">Buttons</h1>
        </div>
        <p className="fw-big max-w-[32ch] text-[29px] font-light leading-[1.25] text-ink">Fifty ways to press a word.</p>
        <p className="max-w-[62ch] text-[1.0625rem] font-light leading-[1.5] text-ink-2">
          No border and no fill: a button is the word, resting in a little light. Press it (a click, a tap, Enter): it pulses, jumps,
          scatters into stars, is sliced by a line of light, or zooms into nothing and comes back. Each press starts from the point you
          touched. The light at rest is gradients only, the particles live for about a second, and the count under each is how many
          elements it really is. Pick a favourite, or tell me which row to go deeper in.
        </p>
        <div className="flex flex-col">
          <Options label="Colour" items={COLOURS} current={settings.colour} onPick={set('colour')} />
          <Options label="Shift" items={SHIFTS} current={settings.shift} onPick={set('shift')} />
          <Options label="Label" items={LABELS} current={settings.label} onPick={set('label')} />
          <Options label="Case" items={CASES} current={settings.case} onPick={set('case')} />
          <Options label="Speed" items={SPEEDS} current={settings.speed} onPick={set('speed')} />
        </div>
        <div className="flex min-h-[48px] flex-wrap items-baseline gap-x-6">
          <button type="button" className="fw-sk-btn" data-kind="primary" onClick={() => setAll((n) => n + 1)}>
            Press all
          </button>
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
            MOTION is off, or your device asks for reduced motion: the buttons rest still and a press only brightens the word. Turn MOTION on in the
            header to see them move.
          </p>
        )}
      </header>

      <div className="flex flex-col gap-12">
        {BUTTON_ROWS.map((row, r) => (
          <section key={row.title} aria-labelledby={`btn-${r}`} className="border-t border-[var(--rail)] pt-6">
            <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1 pb-6">
              <h2 id={`btn-${r}`} className="fw-kicker">
                <span className="text-t1">{r + 1}</span>
                <span className="text-ink"> · {row.title}</span>
              </h2>
              <p className="text-[0.9375rem] font-light text-ink-2">{row.note}</p>
            </div>
            <ul className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 md:grid-cols-3 md:gap-x-10 xl:grid-cols-5">
              {BUTTON_OPTIONS.filter((o) => o.row === r).map((option) => (
                <Cell key={option.id} option={option} index={BUTTON_OPTIONS.indexOf(option)} settings={settings} live={live} amp={amp} picked={picked === option.id} all={all} />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
