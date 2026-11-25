/**
 * File: src/components/master/ElementsB.tsx
 * Description: Lab Master samples, part two: sliders, knobs, timers, up and down, voting and the comment box, in the way of the chosen
 * motion style. They are live: drag, press, count. A changing number leaves and arrives by the style's Swap (sliced strips, a roll, a
 * dissolve, a zoom); the slider track and the timer's progress are the style's thin lens-shaped line (kit.tsx).
 */
"use client";
import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';
import GlowFrame from '@/components/backgrounds/GlowFrame';
import { useMotion } from '@/components/display/DisplayProvider';
import type { MotionStyle } from '@/lib/display/settings';
import { LabLine, Mirrored, Sliced, Swap } from './kit';

const clamp = (v: number, a = 0, b = 100) => Math.min(b, Math.max(a, v));

/* ---- sliders ---- */

/** A four-ray star made of gradients, the way the stars buttons draw one. */
const STAR = 'radial-gradient(circle, #fff 0 14%, var(--t1) 28%, transparent 62%), linear-gradient(90deg, transparent 8%, var(--t1) 50%, transparent 92%) center / 100% 7% no-repeat, linear-gradient(0deg, transparent 8%, var(--t1) 50%, transparent 92%) center / 7% 100% no-repeat';

function Dot({ size }: { size: number }) {
  return <span className="block rounded-full" style={{ width: size, height: size, background: 'var(--t1)', boxShadow: '0 0 10px var(--t1)' }} />;
}

/** The ball of the slider, by style: mirrored, springy, sliced (joined while it is held), a star, or growing toward you. */
function Thumb({ mode, drag }: { mode: MotionStyle; drag: boolean }) {
  const off = useMotion().scale === 0;
  if (off) return <Dot size={14} />;
  if (mode === 'plain')
    return (
      <Mirrored on>
        <Dot size={13} />
      </Mirrored>
    );
  if (mode === 'kinetic')
    return (
      <motion.span className="block" animate={{ scale: drag ? 1.7 : 1 }} transition={{ type: 'spring', stiffness: 420, damping: 16 }}>
        <Dot size={14} />
      </motion.span>
    );
  if (mode === 'slice')
    return (
      <Sliced sliced={!drag} amp={4}>
        <Dot size={20} />
      </Sliced>
    );
  if (mode === 'stars') return <span className="block" style={{ width: 28, height: 28, background: STAR }} />;
  return (
    <motion.span className="block" animate={{ scale: drag ? 2.3 : 1 }} transition={{ duration: 0.35 }}>
      <Dot size={12} />
    </motion.span>
  );
}

export function StyleSlider({ mode, label, start }: { mode: MotionStyle; label: string; start: number }) {
  const [v, setV] = useState(start);
  const [drag, setDrag] = useState(false);
  const track = useRef<HTMLDivElement>(null);
  const move = (x: number) => {
    const r = track.current?.getBoundingClientRect();
    if (r) setV(Math.round(clamp(((x - r.left) / r.width) * 100)));
  };
  return (
    <div className="flex w-[300px] max-w-full flex-col gap-1">
      <div className="flex items-baseline justify-between">
        <span className="fw-kicker text-ink-2">{label}</span>
        <span className="fw-tabular text-[0.875rem] text-t1">{v}</span>
      </div>
      <div
        ref={track}
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={v}
        className="relative h-12 w-full cursor-pointer touch-none select-none"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          setDrag(true);
          move(e.clientX);
        }}
        onPointerMove={(e) => drag && move(e.clientX)}
        onPointerUp={() => setDrag(false)}
        onPointerCancel={() => setDrag(false)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
            e.preventDefault();
            setV((x) => clamp(x + 5));
          } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
            e.preventDefault();
            setV((x) => clamp(x - 5));
          }
        }}
      >
        <div className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2">
          <LabLine mode={mode} len={300} />
        </div>
        <span className="pointer-events-none absolute top-1/2" style={{ left: `${v}%`, transform: 'translate(-50%, -50%)' }}>
          <Thumb mode={mode} drag={drag} />
        </span>
      </div>
    </div>
  );
}

export function StyleSliders({ mode }: { mode: MotionStyle }) {
  return (
    <div className="flex flex-wrap gap-x-12 gap-y-4 pb-4">
      <StyleSlider mode={mode} label="Level" start={40} />
      <StyleSlider mode={mode} label="Depth" start={75} />
    </div>
  );
}

/* ---- knobs ---- */

const A0 = 135; // the dial starts at the lower left and sweeps 270 degrees clockwise
const SWEEP = 270;
const R = 34;
const C = 48;
// Rounded, so the server's markup and the browser's agree to the last digit.
const round2 = (n: number) => Math.round(n * 100) / 100;
const pt = (deg: number, r = R): [number, number] => [round2(C + r * Math.cos((deg * Math.PI) / 180)), round2(C + r * Math.sin((deg * Math.PI) / 180))];
const arc = (from: number, to: number) => {
  const [x1, y1] = pt(from);
  const [x2, y2] = pt(to);
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${R} ${R} 0 ${to - from > 180 ? 1 : 0} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
};

function Dial({ mode, v, drag }: { mode: MotionStyle; v: number; drag: boolean }) {
  const uid = useId().replace(/:/g, '');
  const end = A0 + (SWEEP * v) / 100;
  const track = <path d={arc(A0, A0 + SWEEP)} fill="none" style={{ stroke: 'var(--rail)' }} strokeWidth={1.2} strokeLinecap="round" />;
  const value = v > 0 ? <path d={arc(A0, end)} fill="none" style={{ stroke: 'var(--t1)' }} strokeWidth={2} strokeLinecap="round" /> : null;
  const [px, py] = pt(end, R - 9);
  const [qx, qy] = pt(end, R + 4);
  const pointer = <line x1={px} y1={py} x2={qx} y2={qy} style={{ stroke: 'var(--ink)' }} strokeWidth={1.5} strokeLinecap="round" />;

  if (mode === 'kinetic') {
    const N = 28;
    return (
      <>
        {Array.from({ length: N }, (_, i) => {
          const deg = A0 + (SWEEP * i) / (N - 1);
          const lit = i / (N - 1) <= v / 100;
          return (
            <g key={i} transform={`rotate(${deg - 270} ${C} ${C})`}>
              <line x1={C} y1={C - R - 3} x2={C} y2={C - R + 3} strokeWidth={1.6} strokeLinecap="round" style={{ stroke: lit ? 'var(--t1)' : 'var(--ink-3)', transform: lit ? 'scaleY(1.9)' : 'scaleY(1)', transformOrigin: `${C}px ${C - R - 3}px`, transition: 'transform 0.3s var(--ease), stroke 0.3s' }} />
            </g>
          );
        })}
      </>
    );
  }
  if (mode === 'slice') {
    // The ring is cut in three strips that slide apart; held, they join.
    return (
      <>
        <defs>
          {[0, 1, 2].map((i) => (
            <clipPath key={i} id={`${uid}s${i}`}>
              <rect x={0} y={i * 32} width={96} height={32} />
            </clipPath>
          ))}
        </defs>
        {[0, 1, 2].map((i) => (
          <g key={i} clipPath={`url(#${uid}s${i})`}>
            <g style={{ transform: `translateX(${drag ? 0 : [-4, 4, -2.5][i]}px)`, transition: 'transform 0.5s var(--ease)' }}>
              {track}
              {value}
              {pointer}
            </g>
          </g>
        ))}
      </>
    );
  }
  if (mode === 'stars') {
    const N = 30;
    return (
      <>
        {Array.from({ length: N }, (_, i) => {
          const [x, y] = pt(A0 + (SWEEP * i) / (N - 1));
          const lit = i / (N - 1) <= v / 100;
          return <circle key={i} cx={x} cy={y} r={lit ? 1.9 : 1.1} style={{ fill: lit ? 'var(--t1)' : 'var(--ink-3)', filter: lit ? 'drop-shadow(0 0 3px var(--t1))' : undefined, transition: 'r 0.3s' }} />;
        })}
        <circle cx={pt(end)[0]} cy={pt(end)[1]} r={3.6} style={{ fill: 'var(--ink)', filter: 'drop-shadow(0 0 4px var(--t1))' }} />
      </>
    );
  }
  return (
    <>
      {track}
      {value}
      {pointer}
    </>
  );
}

export function StyleKnob({ mode, label, start }: { mode: MotionStyle; label: string; start: number }) {
  const [v, setV] = useState(start);
  const [drag, setDrag] = useState(false);
  const from = useRef({ y: 0, v: 0 });
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={v}
        className="relative size-24 cursor-ns-resize touch-none select-none"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          from.current = { y: e.clientY, v };
          setDrag(true);
        }}
        onPointerMove={(e) => drag && setV(Math.round(clamp(from.current.v + (from.current.y - e.clientY) * 0.7)))}
        onPointerUp={() => setDrag(false)}
        onPointerCancel={() => setDrag(false)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
            e.preventDefault();
            setV((x) => clamp(x + 5));
          } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
            e.preventDefault();
            setV((x) => clamp(x - 5));
          }
        }}
      >
        <svg viewBox="0 0 96 96" className="pointer-events-none size-full" aria-hidden>
          <Dial mode={mode} v={v} drag={drag} />
        </svg>
        <motion.span className="fw-tabular pointer-events-none absolute inset-0 grid place-items-center text-[1rem] font-light text-ink" animate={{ scale: mode === 'zoom' && drag ? 1.8 : 1 }} transition={{ duration: 0.3 }}>
          {v}
        </motion.span>
      </div>
      <span className="fw-kicker text-ink-2">{label}</span>
    </div>
  );
}

export function StyleKnobs({ mode }: { mode: MotionStyle }) {
  return (
    <div className="flex flex-wrap gap-x-12 gap-y-6">
      <StyleKnob mode={mode} label="Gain" start={25} />
      <StyleKnob mode={mode} label="Tone" start={60} />
      <StyleKnob mode={mode} label="Drive" start={90} />
    </div>
  );
}

/* ---- timers ---- */

const pad2 = (n: number) => String(n).padStart(2, '0');

/** MM:SS, each digit its own Swap in a fixed-width cell, so only the digit that changes moves. */
function Clock({ s, mode, hot }: { s: number; mode: MotionStyle; hot?: boolean }) {
  const chars = [...pad2(Math.floor(s / 60)), ':', ...pad2(s % 60)];
  return (
    <span className={`fw-big fw-tabular inline-flex text-[40px] font-extralight leading-[1.2] ${hot ? 'text-t1' : 'text-ink'}`}>
      {chars.map((c, i) =>
        c === ':' ? (
          <span key={i} className="px-[0.08em]">
            :
          </span>
        ) : (
          <span key={i} className="relative inline-flex w-[0.62em] justify-center">
            <Swap value={c} mode={mode} />
          </span>
        )
      )}
    </span>
  );
}

function Progress({ mode, pct }: { mode: MotionStyle; pct: number }) {
  return (
    <span aria-hidden className="relative block h-6 w-[300px] max-w-full">
      <span className="absolute inset-y-0 left-0 block overflow-hidden" style={{ width: `${pct}%`, transition: 'width 1s linear' }}>
        <LabLine mode={mode} len={300} />
      </span>
    </span>
  );
}

export function StyleTimers({ mode }: { mode: MotionStyle }) {
  const [down, setDown] = useState(272);
  const [up, setUp] = useState(15);
  const [run, setRun] = useState(true);
  useEffect(() => {
    if (!run) return;
    const id = window.setInterval(() => {
      setDown((s) => (s <= 0 ? 272 : s - 1));
      setUp((s) => (s >= 599 ? 0 : s + 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [run]);
  return (
    <div className="flex flex-wrap items-start gap-x-14 gap-y-8">
      <div className="flex flex-col gap-1">
        <span className="fw-kicker text-ink-2">Counting down</span>
        <Clock s={down} mode={mode} />
        <Progress mode={mode} pct={(down / 272) * 100} />
      </div>
      <div className="flex flex-col gap-1">
        <span className="fw-kicker text-ink-2">Counting up</span>
        <Clock s={up} mode={mode} hot />
        <Progress mode={mode} pct={(up / 600) * 100} />
      </div>
      <button type="button" className="fw-sk-btn" data-kind="primary" onClick={() => setRun((r) => !r)}>
        {run ? 'Pause' : 'Start'}
      </button>
    </div>
  );
}

/* ---- up and down ---- */

function Stepper({ mode, start, vertical }: { mode: MotionStyle; start: number; vertical?: boolean }) {
  const [n, setN] = useState(start);
  const down = (
    <button type="button" className="fw-sk-btn" aria-label="Down" onClick={() => setN((x) => Math.max(0, x - 1))}>
      <ChevronDown size={22} strokeWidth={1.5} />
    </button>
  );
  const up = (
    <button type="button" className="fw-sk-btn" aria-label="Up" onClick={() => setN((x) => Math.min(99, x + 1))}>
      <ChevronUp size={22} strokeWidth={1.5} />
    </button>
  );
  const value = (
    <span className="fw-big fw-tabular inline-flex min-w-[2.4ch] justify-center text-[29px] font-light text-ink" aria-live="polite">
      <Swap value={n} mode={mode} />
    </span>
  );
  return vertical ? (
    <div className="flex flex-col items-center">
      {up}
      {value}
      {down}
    </div>
  ) : (
    <div className="flex items-center gap-1">
      {down}
      {value}
      {up}
    </div>
  );
}

export function StyleSteppers({ mode }: { mode: MotionStyle }) {
  return (
    <div className="flex flex-wrap items-center gap-x-14 gap-y-4">
      <Stepper mode={mode} start={7} />
      <Stepper mode={mode} start={12} vertical />
    </div>
  );
}

/* ---- voting ---- */

export function StyleVotes({ mode }: { mode: MotionStyle }) {
  const [vote, setVote] = useState<'up' | 'down' | null>(null);
  const items = [
    { id: 'up' as const, label: '+ Up', n: 12 },
    { id: 'down' as const, label: '− Down', n: 3 },
  ];
  return (
    <div role="radiogroup" aria-label="Vote" className="flex flex-wrap items-center gap-x-8 gap-y-2">
      {items.map((i) => (
        <button key={i.id} type="button" role="radio" aria-checked={vote === i.id} className="fw-sk-btn" onClick={() => setVote(vote === i.id ? null : i.id)}>
          <span>{i.label}</span>
          <Swap value={i.n + (vote === i.id ? 1 : 0)} mode={mode} className="fw-tabular" />
        </button>
      ))}
    </div>
  );
}

/* ---- the comment box ---- */

/** The comment box with the stars glow (the only glow Michal liked): it lights while you write, and the stars blow apart when you post. */
export function StyleComposer() {
  const [burst, setBurst] = useState(0);
  const [text, setText] = useState('');
  const post = useRef<HTMLButtonElement>(null);
  return (
    <GlowFrame glow="stars" burst={burst} originRef={post} className="max-w-[560px] px-8 py-6">
      <textarea
        aria-label="Write a comment"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={2}
        placeholder="Say something kind…"
        className="w-full resize-none bg-transparent text-[1.0625rem] font-light leading-[1.5] outline-none placeholder:text-ink-3"
      />
      <div className="flex justify-end">
        <button
          ref={post}
          type="button"
          className="fw-sk-btn"
          data-kind="primary"
          onClick={() => {
            setBurst((b) => b + 1);
            setText('');
          }}
        >
          Post
        </button>
      </div>
    </GlowFrame>
  );
}
