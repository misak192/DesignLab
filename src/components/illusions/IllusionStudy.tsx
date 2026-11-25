/**
 * File: src/components/illusions/IllusionStudy.tsx
 * Description: The /illusions page: ten optical-illusion backgrounds in a gallery (each live), and a full-screen view
 * per design with its settings, a time control for the clock-driven ones, a frosted-glass card to check that text
 * stays readable, and (design 10) buttons that simulate actions. Everything is in memory; nothing is saved.
 */
"use client";
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ILLUSIONS, defaultsOf, type Illusion } from '@/lib/illusions/illusions';
import { hhmm } from '@/lib/illusions/colour';
import IllusionCanvas from './IllusionCanvas';

const pad = (n: number) => String(n).padStart(2, '0');

export default function IllusionStudy({ number }: { number: number }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, Record<string, number>>>({});
  const open = ILLUSIONS.find((i) => i.id === openId) ?? null;
  const valuesOf = (i: Illusion) => values[i.id] ?? defaultsOf(i);
  const groups = ['Static', 'Time and actions'] as const;

  return (
    <main className="mx-auto flex w-full max-w-[1700px] flex-1 flex-col px-7 pb-40 pt-10 sm:pt-14">
      <header className="flex flex-col gap-8 pb-12">
        <Link href="/" className="fw-kicker w-fit text-ink-2 transition-colors hover:text-ink">
          ← Design Lab
        </Link>
        <div className="flex flex-col gap-6">
          <p className="fw-kicker fw-tabular text-t1">{number > 0 ? pad(number) : '··'} Experiments</p>
          <h1 className="fw-vogue text-[clamp(30px,7vw,64px)] leading-[1.1] text-ink">Illusion backgrounds</h1>
        </div>
        <p className="fw-big max-w-[32ch] text-[29px] font-light leading-[1.25] text-ink">Ten backgrounds that trick the eye.</p>
        <p className="max-w-[62ch] text-[1.0625rem] font-light leading-[1.5] text-ink-2">
          Five static illusions and five that follow the clock or react to what you do. Each one is a single drawing
          function of a few numbers, so it can be ported to Android as it is. Tap a picture to see it full screen with
          its settings and a frosted-glass card to check that text stays readable. The clock designs sweep a whole day
          in the gallery; full screen lets you use the real time or scrub it.
        </p>
      </header>

      {groups.map((g) => (
        <section key={g} className="pb-16">
          <p className="fw-kicker pb-6 text-ink-2">{g}</p>
          <ul className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
            {ILLUSIONS.filter((i) => i.group === g).map((i) => (
              <li key={i.id} className="flex min-w-0 flex-col gap-3 border-t border-[var(--rail)] pt-5">
                <p className="fw-kicker">
                  <span className="fw-tabular text-t1">{i.id}</span>
                </p>
                <h2 className="fw-big text-[20px] font-light leading-[1.2] text-ink">{i.name}</h2>
                <button type="button" onClick={() => setOpenId(i.id)} aria-label={`Open ${i.name} full screen`} className="block aspect-[16/10] w-full cursor-pointer overflow-hidden">
                  <IllusionCanvas illusion={i} params={valuesOf(i)} minutes={null} demo />
                </button>
                <p className="flex-1 text-[0.875rem] font-normal leading-[1.45] text-ink-2">{i.blurb}</p>
                <div className="flex min-h-[48px] items-baseline">
                  <button type="button" className="fw-pick" onClick={() => setOpenId(i.id)}>
                    Full screen
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {open && (
        <FullScreen
          key={open.id}
          illusion={open}
          params={valuesOf(open)}
          onChange={(k, v) => setValues((s) => ({ ...s, [open.id]: { ...(s[open.id] ?? defaultsOf(open)), [k]: v } }))}
          onReset={() => setValues((s) => ({ ...s, [open.id]: defaultsOf(open) }))}
          onClose={() => setOpenId(null)}
        />
      )}
    </main>
  );
}

function FullScreen({ illusion, params, onChange, onReset, onClose }: { illusion: Illusion; params: Record<string, number>; onChange: (k: string, v: number) => void; onReset: () => void; onClose: () => void }) {
  const [minutes, setMinutes] = useState<number | null>(null);
  const [label, setLabel] = useState('');
  const [panel, setPanel] = useState(true);
  const stateRef = useRef<Record<string, any>>({});
  const timed = illusion.group === 'Time and actions' && illusion.id !== 'I10';

  useEffect(() => {
    const key = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', key);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', key);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const act = (e: React.MouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    (stateRef.current.hits ??= []).push({ x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + r.height / 2) / window.innerHeight });
  };
  const shown = minutes ?? 0;

  return (
    <div className="fixed inset-0 z-[1000]" role="dialog" aria-label={illusion.name}>
      <div className="absolute inset-0">
        <IllusionCanvas illusion={illusion} params={params} minutes={minutes} onLabel={setLabel} stateRef={stateRef} />
      </div>

      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between gap-6 p-6 sm:p-10">
        <div className="pointer-events-auto flex flex-wrap items-baseline justify-between gap-4">
          <p className="fw-kicker text-ink">
            <span className="fw-tabular text-t1">{illusion.id}</span> · {illusion.name}
          </p>
          <div className="flex gap-6">
            <button type="button" className="fw-pick" onClick={() => setPanel((p) => !p)}>
              {panel ? 'Hide settings' : 'Settings'}
            </button>
            <button type="button" className="fw-pick" onClick={onClose}>
              Close
            </button>
          </div>
        </div>

        {/* The frosted-glass test card: the one place a surface sits behind text, to prove readability on the illusion. */}
        <div className="pointer-events-none mx-auto w-full max-w-[420px] rounded-[20px] px-7 py-6" style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)' }}>
          <p className="fw-kicker text-ink-2">Readability check</p>
          <p className="fw-big pt-2 text-[24px] font-light leading-[1.25] text-ink">Tomorrow, 09:30 · Review the plan</p>
          <p className="pt-2 text-[0.9375rem] font-light leading-[1.5] text-ink-2">Body text on frosted glass. If this is easy to read, the background is quiet enough.</p>
        </div>

        <div className="pointer-events-auto flex flex-col gap-5">
          {label && (
            <p className="mx-auto w-fit rounded-full px-5 py-2 text-[0.875rem] font-light text-ink" style={{ background: 'rgba(255,255,255,0.14)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' }}>
              {label}
            </p>
          )}
          {illusion.id === 'I10' && (
            <div className="flex flex-wrap justify-center gap-x-8">
              {['Tick', 'Swipe', 'Save'].map((a, n) => (
                <button key={a} type="button" className="fw-pick" style={{ marginLeft: n === 2 ? 'auto' : undefined }} onClick={act}>
                  {a}
                </button>
              ))}
            </div>
          )}
          {panel && (
            <div className="grid max-w-[900px] grid-cols-1 gap-x-10 gap-y-3 sm:grid-cols-2">
              {illusion.controls.map((c) => (
                <label key={c.key} className="flex items-baseline gap-4 text-[0.875rem] font-light text-ink">
                  <span className="w-[170px] shrink-0 text-ink-2">{c.label}</span>
                  <input type="range" min={c.min} max={c.max} step={c.step} value={params[c.key]} onChange={(e) => onChange(c.key, Number(e.target.value))} className="min-h-[32px] flex-1" />
                  <span className="fw-tabular w-12 text-right">{params[c.key]}</span>
                </label>
              ))}
              {timed && (
                <div className="flex items-baseline gap-4 text-[0.875rem] font-light text-ink sm:col-span-2">
                  <span className="w-[170px] shrink-0 text-ink-2">Time of day</span>
                  <input type="range" min={0} max={1439} step={1} value={minutes ?? 0} onChange={(e) => setMinutes(Number(e.target.value))} className="min-h-[32px] flex-1" />
                  <span className="fw-tabular w-12 text-right">{minutes === null ? 'live' : hhmm(shown)}</span>
                  <button type="button" className="fw-pick" onClick={() => setMinutes((m) => ((m ?? new Date().getHours() * 60) + 60) % 1440)}>
                    +1h
                  </button>
                  <button type="button" className="fw-pick" onClick={() => setMinutes(null)}>
                    Live
                  </button>
                </div>
              )}
              <div className="sm:col-span-2">
                <button type="button" className="fw-pick" onClick={onReset}>
                  Reset settings
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
