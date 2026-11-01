/**
 * File: src/components/master/Samples.tsx
 * Description: The placeholder components of the Lab Master page, one per section. Skeleton only: the buttons do nothing,
 * nothing reads the selected motion, and the dials and timers are still. Each is plain poster style (no box, no fill,
 * hairlines only) so a motion can be attached to it later without redrawing it.
 */
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';

/** A row of samples that wraps. */
const row = 'flex flex-wrap items-center gap-x-8 gap-y-2';

export function TitlesSample() {
  return (
    <div className="flex flex-col gap-6">
      <p className="fw-kicker text-t1">01 · Kicker</p>
      <p className="fw-vogue text-[clamp(26px,5vw,48px)] leading-[1.1] text-ink">Vogue title</p>
      <p className="fw-big text-[29px] font-light leading-[1.25] text-ink">A hero line, the one sentence on a page.</p>
      <p className="max-w-[56ch] text-[1.0625rem] font-light leading-[1.5] text-ink-2">
        Reading text sits at normal weight and size. It scales with TEXT; the titles above do not.
      </p>
    </div>
  );
}

export function ButtonsSample() {
  return (
    <div className={row}>
      <button type="button" className="fw-sk-btn" data-kind="primary">
        Primary
      </button>
      <button type="button" className="fw-sk-btn">
        Quiet
      </button>
      <button type="button" className="fw-sk-btn" disabled>
        Disabled
      </button>
      <button type="button" className="fw-sk-btn" aria-label="Add">
        <Plus size={20} strokeWidth={1.5} />
      </button>
    </div>
  );
}

function SliderSample({ label, value }: { label: string; value: number }) {
  return (
    <label className="flex min-w-[220px] flex-1 flex-col gap-2">
      <span className="flex items-baseline justify-between">
        <span className="fw-kicker text-ink-2">{label}</span>
        <span className="fw-tabular text-[0.875rem] text-t1">{value}</span>
      </span>
      <input type="range" min={0} max={100} defaultValue={value} className="w-full cursor-pointer accent-[var(--t1)]" />
    </label>
  );
}

export function SlidersSample() {
  return (
    <div className="flex flex-wrap gap-x-10 gap-y-6">
      <SliderSample label="Level" value={40} />
      <SliderSample label="Depth" value={75} />
    </div>
  );
}

/** A still dial: a hairline ring, a coloured arc for the value, a tick for the pointer. */
function KnobSample({ label, value }: { label: string; value: number }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  const sweep = 0.75; // three quarters of the ring, open at the bottom
  const arc = c * sweep;
  const angle = 135 + value * 2.7; // degrees, 0 = right, clockwise
  const tick = (a: number, from: number, to: number) => {
    const rad = (a * Math.PI) / 180;
    return { x1: 40 + from * Math.cos(rad), y1: 40 + from * Math.sin(rad), x2: 40 + to * Math.cos(rad), y2: 40 + to * Math.sin(rad) };
  };
  const t = tick(angle, 10, r - 4);
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={80} height={80} viewBox="0 0 80 80" aria-hidden fill="none">
        <circle cx={40} cy={40} r={r} stroke="var(--rail)" strokeWidth={1} strokeDasharray={`${arc} ${c}`} transform="rotate(135 40 40)" />
        <circle
          cx={40}
          cy={40}
          r={r}
          stroke="var(--t1)"
          strokeWidth={1.5}
          strokeDasharray={`${arc * (value / 100)} ${c}`}
          transform="rotate(135 40 40)"
        />
        <line {...t} stroke="var(--ink)" strokeWidth={1.5} strokeLinecap="round" />
      </svg>
      <span className="fw-kicker text-ink-2">{label}</span>
      <span className="fw-tabular text-[0.875rem] text-t1">{value}</span>
    </div>
  );
}

export function KnobsSample() {
  return (
    <div className="flex flex-wrap gap-x-12 gap-y-6">
      <KnobSample label="Gain" value={25} />
      <KnobSample label="Tone" value={60} />
      <KnobSample label="Drive" value={90} />
    </div>
  );
}

export function TimersSample() {
  return (
    <div className="flex flex-wrap gap-x-14 gap-y-8">
      <div className="flex flex-col gap-3">
        <span className="fw-kicker text-ink-2">Counting down</span>
        <span className="fw-big fw-tabular text-[40px] font-extralight leading-none text-ink">04:32</span>
        <span className="relative block h-px w-full bg-rail">
          <span className="absolute inset-y-0 left-0 block w-[60%] bg-t1" />
        </span>
      </div>
      <div className="flex flex-col gap-3">
        <span className="fw-kicker text-ink-2">Counting up</span>
        <span className="fw-big fw-tabular text-[40px] font-extralight leading-none text-t1">00:15</span>
        <span className="relative block h-px w-full bg-rail">
          <span className="absolute inset-y-0 left-0 block w-[12%] bg-t1" />
        </span>
      </div>
      <div className={row}>
        <button type="button" className="fw-sk-btn" data-kind="primary">
          Start
        </button>
        <button type="button" className="fw-sk-btn">
          Pause
        </button>
      </div>
    </div>
  );
}

export function SteppersSample() {
  return (
    <div className="flex flex-wrap items-center gap-x-12 gap-y-4">
      <div className="flex items-center gap-1">
        <button type="button" className="fw-sk-btn" aria-label="Down">
          <ChevronDown size={22} strokeWidth={1.5} />
        </button>
        <span className="fw-big fw-tabular min-w-[2ch] text-center text-[29px] font-light text-ink">7</span>
        <button type="button" className="fw-sk-btn" aria-label="Up">
          <ChevronUp size={22} strokeWidth={1.5} />
        </button>
      </div>
      <div className="flex flex-col items-center">
        <button type="button" className="fw-sk-btn" aria-label="Up">
          <ChevronUp size={22} strokeWidth={1.5} />
        </button>
        <span className="fw-big fw-tabular text-[29px] font-light text-ink">12</span>
        <button type="button" className="fw-sk-btn" aria-label="Down">
          <ChevronDown size={22} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}

export function VotingSample() {
  return (
    <div className="flex flex-wrap gap-x-14 gap-y-4">
      <div role="radiogroup" aria-label="Vote, nothing chosen" className={row}>
        <button type="button" role="radio" aria-checked={false} className="fw-sk-btn">
          + Up <span className="fw-tabular">12</span>
        </button>
        <button type="button" role="radio" aria-checked={false} className="fw-sk-btn">
          − Down <span className="fw-tabular">3</span>
        </button>
      </div>
      <div role="radiogroup" aria-label="Vote, up chosen" className={row}>
        <button type="button" role="radio" aria-checked className="fw-sk-btn">
          + Up <span className="fw-tabular">13</span>
        </button>
        <button type="button" role="radio" aria-checked={false} className="fw-sk-btn">
          − Down <span className="fw-tabular">3</span>
        </button>
      </div>
    </div>
  );
}

export function TabsSample() {
  return (
    <div role="tablist" aria-label="Sample tabs" className="flex flex-wrap gap-x-5">
      {['January', 'February', 'March', 'April'].map((m, i) => (
        <button key={m} type="button" role="tab" aria-selected={i === 0} className="fw-ts-tab">
          <span className="relative whitespace-nowrap">
            {m}
            {i === 0 && <span aria-hidden className="absolute inset-x-0 -bottom-1 block h-px bg-t1" />}
          </span>
        </button>
      ))}
    </div>
  );
}
