/**
 * File: src/components/arrivals/ArrivalsLab.tsx
 * Description: The /arrivals page. One stage of layered pieces (panels, words, lines) in real 3D; pick how they arrive
 * (nine designs in src/lib/arrivals/arrivals.ts), when (together, delayed, chaotic), and set the duration, the signed
 * start depth (negative = from the back) and the rest depth. The pointer moves the camera, so the layers parallax.
 */
"use client";

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { useMotionValue, useMotionValueEvent, useSpring } from 'framer-motion';
import { useMotion } from '@/components/display/DisplayProvider';
import {
  ARRIVALS,
  ITEMS,
  PERSPECTIVE,
  TIMINGS,
  calmRandoms,
  poseFor,
  randoms,
  rigFx,
  windows,
  type ArrivalId,
  type Pose,
  type Rand,
  type TimingId,
} from '@/lib/arrivals/arrivals';

interface Run {
  design: ArrivalId;
  timing: TimingId;
  duration: number;
  zStart: number;
  rands: Rand[];
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const zLabel = (v: number) => `${v < 0 ? '−' : '+'}${Math.abs(Math.round(v))}`;

/** A pose as inline style. Anything at or behind the camera is hidden. */
function styleOf(po: Pose): CSSProperties {
  return {
    transform: `translate3d(${po.x}px, ${po.y}px, ${po.z}px) rotateX(${po.rx}deg) rotateY(${po.ry}deg) rotateZ(${po.rz}deg) scale(${po.s})`,
    transformOrigin: po.origin,
    opacity: PERSPECTIVE - po.z < 60 ? 0 : po.o,
    filter: po.blur > 0.05 ? `blur(${po.blur}px)` : undefined,
    clipPath: po.clip < 1 ? `inset(${(1 - po.clip) * 100}% -40px -40px -40px)` : undefined,
  };
}

const optionName = 'fw-big w-fit border-b text-[20px] font-light uppercase tracking-[0.08em] transition-colors';

export default function ArrivalsLab() {
  const m = useMotion();
  const stageRef = useRef<HTMLDivElement | null>(null);

  const [design, setDesign] = useState<ArrivalId>('depth');
  const [timing, setTiming] = useState<TimingId>('delayed');
  const [duration, setDuration] = useState(6);
  const [zStart, setZStart] = useState(6);
  const [restDepth, setRestDepth] = useState(0.4);
  const [parallax, setParallax] = useState(1);
  const [run, setRun] = useState<Run | null>(null);
  const [elapsed, setElapsed] = useState(0);

  /* The clock: one rAF loop per run. */
  useEffect(() => {
    if (!run || run.duration === 0) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const e = (now - start) / 1000;
      if (e >= run.duration) {
        setElapsed(run.duration);
        return;
      }
      setElapsed(e);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run]);

  const play = (over: { design?: ArrivalId; timing?: TimingId } = {}) => {
    const d = m.scale === 0 ? 0 : duration;
    setElapsed(0);
    setRun({ design: over.design ?? design, timing: over.timing ?? timing, duration: d, zStart, rands: randoms() });
  };

  /* Pointer parallax: the camera's vanishing point follows the pointer, so near layers move more than far ones. */
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 60, damping: 18 });
  const sy = useSpring(py, { stiffness: 60, damping: 18 });
  const strength = useRef(0);
  strength.current = Math.min(parallax * m.parallax, 3);
  const aim = () => {
    const el = stageRef.current;
    if (el) el.style.perspectiveOrigin = `${50 + sx.get() * 80 * strength.current}% ${50 + sy.get() * 60 * strength.current}%`;
  };
  useMotionValueEvent(sx, 'change', aim);
  useMotionValueEvent(sy, 'change', aim);
  useEffect(aim); // eslint-disable-line react-hooks/exhaustive-deps

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    px.set(((e.clientX - r.left) / r.width - 0.5) * 2);
    py.set(((e.clientY - r.top) / r.height - 0.5) * 2);
  };
  const onPointerLeave = () => {
    px.set(0);
    py.set(0);
  };

  /* The poses, this frame. Idle = landed. */
  const k = { zStart: run?.zStart ?? zStart, restDepth };
  const shown = run?.design ?? design;
  const T = run && run.duration > 0 ? clamp01(elapsed / run.duration) : 1;
  const win = run && run.duration > 0 ? windows(run.timing, run.duration, run.rands) : null;
  const rands = run?.rands ?? calmRandoms();
  const poses = ITEMS.map((item, i) => {
    const p = !run || !win ? 1 : win.length <= 0 ? 1 : clamp01((elapsed - win.delay[i]) / win.length);
    return poseFor(shown, p, item, rands[i], k);
  });
  const rig = rigFx(shown, T, poses, k);
  const playing = run !== null && run.duration > 0 && elapsed < run.duration;
  const P = Object.fromEntries(ITEMS.map((it, i) => [it.id, poses[i]])) as Record<string, Pose>;
  const glow = (po: Pose): CSSProperties => ({
    ...styleOf(po),
    textShadow: m.colour && po.hit >= 0 ? `0 0 ${34 * Math.exp(-5 * po.hit)}px var(--t1), var(--halo-lg)` : undefined,
  });
  const ring = (po: Pose) =>
    po.hit >= 0 && (
      <span
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 rounded-[50%] border border-t1"
        style={{
          width: '130%',
          height: '240%',
          transform: `translate(-50%, -50%) scale(${0.55 + po.hit})`,
          opacity: Math.pow(1 - po.hit, 2) * 0.8,
        }}
      />
    );

  const designName = ARRIVALS.find((a) => a.id === shown)?.name ?? '';
  const timingName = TIMINGS.find((t) => t.id === (run?.timing ?? timing))?.name ?? '';

  return (
    <main className="mx-auto flex w-full max-w-[1100px] flex-1 flex-col px-7 pb-40 pt-10 sm:pt-14">
      <header className="flex flex-col gap-8 pb-10">
        <Link href="/" className="fw-kicker w-fit text-ink-2 transition-colors hover:text-ink">
          ← Design Lab
        </Link>
        <h1 className="fw-vogue text-[clamp(30px,7vw,64px)] leading-[1.1] text-ink">Arrivals</h1>
        <p className="fw-big max-w-[32ch] text-[29px] font-light leading-[1.25] text-ink">
          Nine ways for a page to arrive, in real depth.
        </p>
        <p className="max-w-[62ch] text-[1.0625rem] font-light leading-[1.5] text-ink-2">
          Every piece of the stage is its own layer in space. Choose how they arrive, whether together, one by one or in
          chaos, how far away they start (negative Z arrives from behind) and how long it all takes. Move the pointer over
          the stage: the nearer a layer, the more it shifts.
        </p>
      </header>

      <div className="grid gap-12 lg:grid-cols-[300px_1fr]">
        {/* The designs */}
        <div className="order-2 flex flex-col gap-2 lg:order-1">
          <span className="fw-kicker text-ink-2">Arrival</span>
          <div role="radiogroup" aria-label="Arrival design" className="flex flex-col">
            {ARRIVALS.map((a) => {
              const selected = design === a.id;
              return (
                <button
                  key={a.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => {
                    setDesign(a.id);
                    play({ design: a.id });
                  }}
                  className="flex min-h-[48px] flex-col gap-1 py-3 text-left"
                >
                  <span
                    className={optionName}
                    style={{ color: selected ? 'var(--t1)' : 'var(--ink)', borderColor: selected ? 'var(--t1)' : 'transparent' }}
                  >
                    {a.name}
                  </span>
                  <span className="max-w-[40ch] text-[0.875rem] font-normal text-ink-2">{a.blurb}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* The stage and its controls */}
        <div className="order-1 flex min-w-0 flex-col gap-8 lg:order-2 lg:sticky lg:top-6 lg:self-start">
          <div
            ref={stageRef}
            onPointerMove={onPointerMove}
            onPointerLeave={onPointerLeave}
            className="relative flex h-[520px] w-full select-none items-center justify-center overflow-hidden border border-[var(--rail)]"
            style={{ perspective: `${PERSPECTIVE}px`, touchAction: 'pan-y' }}
          >
            <div
              className="relative h-[400px] w-[min(92%,660px)]"
              style={{
                transformStyle: 'preserve-3d',
                transform: `translate3d(${rig.shakeX}px, ${rig.shakeY}px, ${rig.z}px)`,
              }}
            >
              {/* Layer 00 · ground */}
              <div className="absolute inset-0 flex flex-col justify-between border border-[var(--rail)]/60 bg-[var(--canvas)]/40 p-6" style={styleOf(P.ground)}>
                <div className="flex justify-between text-[11px] text-ink-3">
                  <span className="fw-kicker text-t3">LAYER 00 &bull; GROUND</span>
                  <span className="fw-tabular">Z {zLabel(P.ground.z)}PX</span>
                </div>
                <div className="size-full bg-[radial-gradient(#00f2fe_1px,transparent_1px)] opacity-15 [background-size:16px_16px]" />
              </div>

              {/* Layer 01 · topology */}
              <div className="absolute inset-6 flex flex-col justify-between border border-t1/30 p-6" style={styleOf(P.topology)}>
                <div className="flex justify-between text-[11px] text-t1">
                  <span className="fw-kicker">LAYER 01 &bull; TOPOLOGY</span>
                  <span className="fw-tabular">Z {zLabel(P.topology.z)}PX</span>
                </div>
                <div className="flex items-center justify-center">
                  <div className="size-32 animate-spin rounded-full border border-dashed border-t1/40 [animation-duration:24s]" />
                </div>
                <span className="font-mono text-[10px] text-t1/60">RESONANCE MATRIX L1</span>
              </div>

              {/* The type: kicker, three words, a line */}
              <div
                className="pointer-events-none absolute inset-x-0 bottom-[14%] top-[20%] flex flex-col items-center justify-center gap-2 text-center"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <span className="fw-kicker relative text-[11px] tracking-[3px] text-t1" style={styleOf(P.kicker)}>
                  FLOATING TYPE LAYER
                </span>
                <span className="fw-vogue relative block text-[clamp(28px,6.5vw,52px)] leading-[1.1] text-ink" style={glow(P.truth)}>
                  Truth
                  {ring(P.truth)}
                </span>
                <span className="fw-vogue relative block text-[clamp(28px,6.5vw,52px)] leading-[1.1] text-ink" style={glow(P.is)}>
                  Is
                  {ring(P.is)}
                </span>
                <span className="fw-vogue relative block text-[clamp(28px,6.5vw,52px)] leading-[1.1] text-ink" style={glow(P.internal)}>
                  Internal
                  {ring(P.internal)}
                </span>
                <p className="fw-big relative max-w-[26ch] text-[15px] font-light text-ink-2" style={styleOf(P.sub)}>
                  Never a vanity badge &bull; Weightless in space
                </p>
              </div>

              {/* Layer 03 · foreground HUD */}
              <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-6" style={styleOf(P.hud)}>
                <div className="flex justify-between text-[11px] text-t1">
                  <span className="fw-kicker border-b border-t1 pb-0.5">LAYER 03 &bull; FOREGROUND HUD</span>
                  <span className="fw-tabular">Z {zLabel(P.hud.z)}PX</span>
                </div>
                <div className="flex items-end justify-between text-[10px] text-ink-3">
                  <span className="fw-kicker text-[10px]">
                    {designName} &middot; {timingName}
                  </span>
                  <span className="fw-tabular text-t1">
                    {(run ? elapsed : 0).toFixed(1)} / {(run?.duration ?? duration).toFixed(1)} s
                  </span>
                </div>
              </div>
            </div>

            {/* Cinematic: light streak and letterbox bars, over everything */}
            {rig.streak > 0 && (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-1/2 h-px"
                style={{
                  background: 'linear-gradient(90deg, transparent, var(--t1), #fff, var(--t1), transparent)',
                  boxShadow: '0 0 26px 2px var(--t1)',
                  transform: `scaleX(${rig.streak})`,
                  opacity: rig.streak,
                }}
              />
            )}
            {rig.bars > 0 && (
              <>
                <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 bg-black" style={{ height: `${rig.bars * 14}%` }} />
                <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 bg-black" style={{ height: `${rig.bars * 14}%` }} />
              </>
            )}
          </div>

          {/* Play */}
          <div className="flex flex-wrap items-baseline gap-x-8">
            <button
              type="button"
              onClick={() => play()}
              className="fw-kicker min-h-[48px] w-fit text-t1 transition-colors hover:text-ink"
            >
              {playing ? '↻ Restart' : run ? '↻ Replay' : '▶ Play'}
            </button>
            {run && (
              <button
                type="button"
                onClick={() => setRun(null)}
                className="fw-kicker min-h-[48px] w-fit text-ink-2 transition-colors hover:text-t1"
              >
                ■ Reset
              </button>
            )}
          </div>

          {/* Timing */}
          <div className="flex flex-col gap-2">
            <span className="fw-kicker text-ink-2">Timing</span>
            <div role="radiogroup" aria-label="Arrival timing" className="grid gap-x-8 sm:grid-cols-3">
              {TIMINGS.map((t) => {
                const selected = timing === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => {
                      setTiming(t.id);
                      play({ timing: t.id });
                    }}
                    className="flex min-h-[48px] flex-col gap-1 py-2 text-left"
                  >
                    <span
                      className={optionName}
                      style={{ color: selected ? 'var(--t1)' : 'var(--ink)', borderColor: selected ? 'var(--t1)' : 'transparent' }}
                    >
                      {t.name}
                    </span>
                    <span className="text-[0.875rem] font-normal text-ink-2">{t.blurb}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Knobs */}
          <div className="grid gap-x-10 gap-y-7 border-t border-[var(--rail)]/50 pt-6 sm:grid-cols-2">
            <Knob
              label="Duration"
              shown={`${duration.toFixed(1)} s`}
              min={0}
              max={10}
              step={0.1}
              value={duration}
              onChange={setDuration}
              onCommit={() => play()}
            />
            <Knob
              label="Start Z"
              shown={`${zStart > 0 ? '+' : zStart < 0 ? '−' : ''}${Math.abs(zStart).toFixed(1)}×`}
              min={-8}
              max={7}
              step={0.5}
              value={zStart}
              onChange={setZStart}
              onCommit={() => play()}
              hint={['from the back', 'from the front']}
            />
            <Knob
              label="Rest depth"
              shown={`${restDepth.toFixed(2)}×`}
              min={0}
              max={1}
              step={0.05}
              value={restDepth}
              onChange={setRestDepth}
              hint={['lands flat', 'keeps its layer']}
            />
            <Knob
              label="Parallax"
              shown={`${parallax.toFixed(1)}×`}
              min={0}
              max={2}
              step={0.1}
              value={parallax}
              onChange={setParallax}
              hint={['off', 'deep']}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

function Knob({
  label,
  shown,
  min,
  max,
  step,
  value,
  onChange,
  onCommit,
  hint,
}: {
  label: string;
  shown: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  /** Called when the knob is let go: the arrival replays with the new value. */
  onCommit?: () => void;
  hint?: [string, string];
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <span className="fw-kicker text-[11px] text-ink-2">{label}</span>
        <span className="fw-tabular text-[12px] text-t1">{shown}</span>
      </div>
      <input
        type="range"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        onPointerUp={onCommit}
        onKeyUp={onCommit}
        className="w-full cursor-pointer accent-[var(--t1)]"
      />
      {hint && (
        <div className="flex justify-between text-[11px] text-ink-3">
          <span>{hint[0]}</span>
          <span>{hint[1]}</span>
        </div>
      )}
    </div>
  );
}
