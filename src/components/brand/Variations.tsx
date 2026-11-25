/**
 * File: src/components/brand/Variations.tsx
 * Description: The Tick-fold reference hero (`TickFoldHero`) and its twenty numbered variations (`VARIATIONS`), each on its own
 * stage. Every variation uses brand tokens only (through the app map), has a Replay (from the Cell around it) and shows its
 * final state under reduced motion. Static icons (variation 04) always use the final state.
 */
"use client";
import { useState, type ComponentProps, type CSSProperties, type ReactNode } from 'react';
import type { AppId, BrandApp } from '@/lib/brand/apps';
import { REEL_VARIANTS } from '@/lib/brand/reel';
import { REFERENCE_OPTIONS, SCHEDULES, frame, totalOf, type Glyph } from '@/lib/brand/tickfold';
import BrandReel from './BrandReel';
import { Favicons, HomeScreen } from './Contexts';
import { useCalm } from './kit';
import { useBrandPalette } from './palette';
import CarouselHero, { CAROUSEL_TOTAL } from './CarouselHero';
import RollWordmark, { ROLL_TOTAL, SUP_SCALES, type SupSize } from './RollWordmark';
import TickMonogram, { FWTickMark, GlassPill, LystTip, LystWordmark, TickGlyph, useClock } from './TickMark';

const NIGHT: CSSProperties = { ['--ink' as string]: 'var(--fw-white)', background: 'radial-gradient(ellipse at 50% 25%, color-mix(in srgb, var(--fw-violet) 16%, var(--fw-night)), var(--fw-night) 72%)', color: 'var(--fw-white)' };
const DAY: CSSProperties = { ['--ink' as string]: 'var(--fw-night)', background: 'color-mix(in srgb, var(--fw-lavender) 7%, var(--fw-white))', color: 'var(--fw-night)' };

/** The dark stage (or the light one) every hero plays on. */
export function Stage({ theme = 'dark', children, minH = 320 }: { theme?: 'dark' | 'light'; children: ReactNode; minH?: number }) {
  return (
    <div className="flex w-full items-center justify-center overflow-hidden px-6 py-10" style={{ ...(theme === 'dark' ? NIGHT : DAY), borderRadius: 20, minHeight: minH }}>
      {children}
    </div>
  );
}

function WithApp({ app, children }: { app: AppId; children: (a: BrandApp) => ReactNode }) {
  const { byId } = useBrandPalette();
  return <>{children(byId(app))}</>;
}

/* ─────────────────────────────── the reference ─────────────────────────────── */

function Option({ on, label, onClick }: { on: boolean; label: string; onClick: () => void }) {
  return (
    <button type="button" role="radio" aria-checked={on} onClick={onClick} className="fw-ts-tab min-h-[48px]" data-plain="true">
      {label}
    </button>
  );
}

type HeroMode = 'tick' | 'carousel';
const MODES: { id: HeroMode; label: string; total: number; text: string }[] = [
  {
    id: 'tick',
    label: '1 · Tick rolls out',
    total: ROLL_TOTAL,
    text: 'The capital letter appears; a tick is drawn, folds into an L and turns upright as one gesture (draw, fold and turn overlap at near constant speed, no stops). Then the rest of the name rolls out to the right of the capital letter and, at the same time, “yst” rolls out to the right of the L. The word stays centred, so the capital letter is pushed to the left as it grows.',
  },
  {
    id: 'carousel',
    label: '2 · Carousel',
    total: CAROUSEL_TOTAL,
    text: '“Lyst” rolls up into its place at the top right and stays still, while the app names carousel through the slot on its left (two full passes over every app, so each name is readable), slow down and creep up the last bit into place, with no overshoot. ',
  },
];

/** The main hero: two animations, one switcher. App switcher, options, Replay and a scrub bar. */
export function TickFoldHero({ app, onApp }: { app: AppId; onApp: (a: AppId) => void }) {
  const { apps } = useBrandPalette();
  const [k, setK] = useState(0);
  const [scrub, setScrub] = useState<number | null>(null);
  const [sup, setSup] = useState<SupSize>('small');
  const [mirror, setMirror] = useState(false);
  const [weight, setWeight] = useState(500);
  const [spacing, setSpacing] = useState(0);
  const [stroke, setStroke] = useState(8);
  const [angle, setAngle] = useState(0);
  const [gap, setGap] = useState(0);
  const [mode, setMode] = useState<HeroMode>('tick');
  const calm = useCalm();
  const m = MODES.find((x) => x.id === mode) ?? MODES[0];
  const replay = () => {
    setScrub(null);
    setK((x) => x + 1);
  };
  return (
    <div className="flex flex-col gap-2">
      <div role="radiogroup" aria-label="Animation" className="flex flex-wrap items-center gap-x-8">
        {MODES.map((x) => (
          <Option key={x.id} on={mode === x.id} label={x.label} onClick={() => { setMode(x.id); replay(); }} />
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-x-8 gap-y-0">
        <div role="radiogroup" aria-label="App" className="flex gap-1">
          {apps.map((a) => (
            <button key={a.id} type="button" role="radio" aria-checked={a.id === app} aria-label={`${a.prefix}Lyst`} onClick={() => { onApp(a.id); replay(); }} className="fw-ts-tab min-h-[48px] min-w-[40px] text-[1.5rem]" data-plain="true">
              {a.prefix[0]}
            </button>
          ))}
        </div>
        <button type="button" onClick={replay} className="fw-kicker min-h-[48px] text-t1 transition-colors hover:text-ink">
          ↻ Replay
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-x-8">
        <div role="radiogroup" aria-label="Weight" className="flex items-center gap-4">
          <span className="fw-kicker text-[0.6875rem] text-ink-3">Jost</span>
          {([[200, 'Thin', 3], [300, 'Light', 4.5], [400, 'Regular', 6], [500, 'Medium', 8]] as const).map(([w, label, st]) => (
            <Option key={w} on={weight === w} label={label} onClick={() => { setWeight(w); setStroke(st); }} />
          ))}
        </div>
        <label className="flex items-center gap-3">
          <span className="fw-kicker text-[0.6875rem] text-ink-3">Tick stroke</span>
          <input type="range" min={2} max={12} step={0.5} value={stroke} onChange={(e) => setStroke(Number(e.target.value))} aria-label="Tick stroke" className="min-h-[48px] w-32" />
          <span className="fw-tabular w-8 text-[0.8125rem] font-light text-ink-2">{stroke}</span>
        </label>
        <label className="flex items-center gap-3">
          <span className="fw-kicker text-[0.6875rem] text-ink-3">Spacing</span>
          <input type="range" min={-0.04} max={0.3} step={0.01} value={spacing} onChange={(e) => setSpacing(Number(e.target.value))} aria-label="Letter spacing" className="min-h-[48px] w-32" />
          <span className="fw-tabular w-14 text-[0.8125rem] font-light text-ink-2">{spacing.toFixed(2)}em</span>
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-x-8">
        <div role="radiogroup" aria-label="Size of Lyst" className="flex items-center gap-4">
          <span className="fw-kicker text-[0.6875rem] text-ink-3">Lyst size</span>
          {(Object.keys(SUP_SCALES) as SupSize[]).map((s) => (
            <Option key={s} on={sup === s} label={s[0].toUpperCase() + s.slice(1)} onClick={() => setSup(s)} />
          ))}
        </div>
        <div role="radiogroup" aria-label="Mirror" className="flex items-center gap-4">
          <span className="fw-kicker text-[0.6875rem] text-ink-3">Mirror</span>
          <Option on={!mirror} label="Off" onClick={() => setMirror(false)} />
          <Option on={mirror} label="On" onClick={() => setMirror(true)} />
        </div>
        {mirror && (
          <>
            <label className="flex items-center gap-3">
              <span className="fw-kicker text-[0.6875rem] text-ink-3">Mirror angle</span>
              <input type="range" min={-45} max={45} step={1} value={angle} onChange={(e) => setAngle(Number(e.target.value))} aria-label="Mirror angle" className="min-h-[48px] w-36" />
              <span className="fw-tabular w-10 text-[0.8125rem] font-light text-ink-2">{angle}°</span>
            </label>
            <label className="flex items-center gap-3">
              <span className="fw-kicker text-[0.6875rem] text-ink-3">Mirror distance</span>
              <input type="range" min={0} max={120} step={1} value={gap} onChange={(e) => setGap(Number(e.target.value))} aria-label="Mirror distance" className="min-h-[48px] w-36" />
              <span className="fw-tabular w-12 text-[0.8125rem] font-light text-ink-2">{gap}px</span>
            </label>
          </>
        )}
        {!calm && (
          <label className="flex items-center gap-3">
            <span className="fw-kicker text-[0.6875rem] text-ink-3">Scrub</span>
            <input type="range" min={0} max={m.total} step={10} value={scrub ?? 0} onChange={(e) => setScrub(Number(e.target.value))} aria-label="Scrub the timeline" className="min-h-[48px] w-48" />
            {scrub !== null && (
              <button type="button" onClick={() => setScrub(null)} className="fw-kicker text-[0.6875rem] text-ink-2">
                play
              </button>
            )}
          </label>
        )}
      </div>
      <Stage minH={420}>
        {mode === 'tick' ? (
          <RollWordmark key={`t-${k}-${app}-${sup}-${mirror}`} app={app} sup={sup} mirror={mirror} mirrorAngle={angle} mirrorGap={gap} weight={weight} spacing={spacing} tickStroke={stroke} t={scrub ?? undefined} />
        ) : (
          <CarouselHero key={`c-${k}-${app}-${sup}-${mirror}`} app={app} sup={sup} mirror={mirror} mirrorAngle={angle} mirrorGap={gap} weight={weight} spacing={spacing} tickStroke={stroke} t={scrub ?? undefined} />
        )}
      </Stage>
      <p className="text-[0.8125rem] font-light text-ink-2">{m.text} The name is in the app gradient; Lyst (and the tick) is white in every app.</p>
    </div>
  );
}

/* ─────────────────────────────── single-purpose pieces ─────────────────────────────── */

/** Only the tick, big: it arrives, folds and stands up as an L. */
function TickOnly({ app }: { app: BrandApp }) {
  const calm = useCalm();
  const sched = SCHEDULES.reference;
  const clock = useClock(totalOf(sched), calm);
  const t = calm ? Infinity : clock;
  const f = frame(t, REFERENCE_OPTIONS);
  return (
    <div>
      <TickGlyph k={f.k} rot={f.rot} colour={app.colour} colour2={app.colour2} height="150px" verticalAlign="baseline" draw={f.draw} />
    </div>
  );
}

function ReelHandoff({ app }: { app: AppId }) {
  const [landed, setLanded] = useState(false);
  return (
    <WithApp app={app}>
      {(a) => <BrandReel app={app} variant={REEL_VARIANTS[0]} duration={2.2} size="clamp(40px, 6vw, 64px)" onDone={() => setLanded(true)} lyst={<LystTip app={a} start={landed} />} />}
    </WithApp>
  );
}

function IconSet({ app }: { app: AppId }) {
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
        <Favicons id={21} app={app} />
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-5">
        <HomeScreen id={21} mode="dark" />
        <HomeScreen id={21} mode="light" />
        <HomeScreen id={21} mode="light" mono />
      </div>
    </div>
  );
}

const glyphLabel: Record<Glyph, string> = { tick: 'true tick', lean12: 'right-angle L leaning 12°', upright: 'upright L' };

export interface VariationDef {
  id: number;
  name: string;
  note: string;
  stage: 'dark' | 'light' | 'none';
  minH?: number;
  render: (app: AppId, k: number) => ReactNode;
}

const mono = (app: AppId, props: Partial<ComponentProps<typeof TickMonogram>>, key: number) => (
  <WithApp app={app}>{(a) => <TickMonogram key={key} app={a} {...props} />}</WithApp>
);

export const VARIATIONS: VariationDef[] = [
  { id: 1, name: 'Action✓yst: true tick', note: `The wordmark ends with ${glyphLabel.tick}: the L of Lyst becomes the tick itself. Judge: does it still read as “Lyst”?`, stage: 'dark', minH: 420, render: (app, k) => <WithApp app={app}>{(a) => <LystWordmark key={k} app={a} glyph="tick" />}</WithApp> },
  { id: 2, name: 'Action✓yst: leaning L', note: `Ends with a ${glyphLabel.lean12}: halfway between a tick and a letter.`, stage: 'dark', minH: 420, render: (app, k) => <WithApp app={app}>{(a) => <LystWordmark key={k} app={a} glyph="lean12" />}</WithApp> },
  { id: 3, name: 'Action✓yst: upright L', note: `Ends with the ${glyphLabel.upright}: the safest read, the tick lives only in the animation.`, stage: 'dark', minH: 420, render: (app, k) => <WithApp app={app}>{(a) => <LystWordmark key={k} app={a} glyph="upright" />}</WithApp> },
  { id: 4, name: 'Icon set, final state', note: 'A O L C R E (letter + tick-L) as favicon 16/32, browser tab, 48dp on a dark and a light home screen, and the one-colour themed icon. Always the final state.', stage: 'none', minH: 360, render: (app) => <IconSet app={app} /> },
  { id: 5, name: 'FW parent: W from two ticks', note: 'F with a raised W drawn as two joined ticks (✓✓), in the full pink → aqua spectrum; the W draws in.', stage: 'dark', minH: 380, render: (_a, k) => <ParentMark key={k} mirror="fade" /> },
  { id: 6, name: 'FW parent, keep mirror', note: 'The same parent mark with the mirror kept, for a header.', stage: 'dark', minH: 380, render: (_a, k) => <ParentMark key={k} mirror="keep" /> },
  { id: 7, name: 'Ignition', note: 'A spark with a light trail runs along the short stroke while it folds.', stage: 'dark', minH: 380, render: (app, k) => mono(app, { spark: true }, k) },
  { id: 8, name: 'Bar-chart name', note: 'The name fills letter by letter from the bottom, like bars, in the colour each position has on the gradient.', stage: 'dark', minH: 380, render: (app, k) => mono(app, { name: 'bars' }, k) },
  { id: 9, name: 'Glass pill', note: 'The monogram inside a glassmorphism pill (the Android pill icon in brand gradients instead of RAG).', stage: 'dark', minH: 280, render: (app, k) => <GlassHero key={k} app={app} /> },
  { id: 10, name: 'Glass pill + ignition', note: 'The glass pill with the spark along the fold.', stage: 'dark', minH: 280, render: (app, k) => <GlassHero key={k} app={app} spark /> },
  { id: 11, name: 'Parallax', note: 'Letter, tick and mirror on three depth layers following the pointer (the gyro on a phone).', stage: 'dark', minH: 380, render: (app, k) => mono(app, { parallax: true }, k) },
  { id: 12, name: 'Reel hand-off', note: 'The app-name reel lands, then the L in “Lyst” tips into the tick and back.', stage: 'dark', minH: 220, render: (app, k) => <ReelHandoff key={k} app={app} /> },
  { id: 13, name: 'Daily, 1.8 s', note: 'The short once-a-day version: the steps overlap.', stage: 'dark', minH: 380, render: (app, k) => mono(app, { schedule: 'daily' }, k) },
  { id: 14, name: 'Light theme', note: 'Dark letters, a lighter mirror, the name in night.', stage: 'light', minH: 380, render: (app, k) => mono(app, { theme: 'light' }, k) },
  { id: 15, name: 'Keep the mirror', note: 'For hero headers: the mirror stays under the monogram (no fade).', stage: 'dark', minH: 380, render: (app, k) => mono(app, { mirror: 'keep' }, k) },
  { id: 16, name: 'No mirror', note: 'Mirror off entirely: letter, tick-L and the name.', stage: 'dark', minH: 380, render: (app, k) => mono(app, { mirror: 'none' }, k) },
  { id: 17, name: 'Tick only', note: 'Just the mark: the tick is drawn, folds and stands up as an L.', stage: 'dark', minH: 320, render: (app, k) => <WithApp app={app}>{(a) => <TickOnly key={k} app={a} />}</WithApp> },
  { id: 18, name: 'Cinematic', note: 'The reference at 1.7× the length, for a film title.', stage: 'dark', minH: 380, render: (app, k) => mono(app, { speed: 1.7 }, k) },
  { id: 19, name: 'Springy', note: 'A much bigger overshoot when the L stands up (easeOutBack 2.4).', stage: 'dark', minH: 380, render: (app, k) => mono(app, { overshoot: 2.4 }, k) },
  { id: 20, name: 'One colour', note: 'Flat white: the tick-fold as a monochrome mark (themed icon, merch, one-colour print).', stage: 'dark', minH: 380, render: (app, k) => mono(app, { theme: 'mono' }, k) },
];

function ParentMark({ mirror }: { mirror: 'fade' | 'keep' }) {
  const { parent } = useBrandPalette();
  return <FWTickMark parent={parent} mirror={mirror} />;
}

function GlassHero({ app, spark = false }: { app: AppId; spark?: boolean }) {
  return (
    <WithApp app={app}>
      {(a) => (
        <GlassPill app={a} width={280} height={150}>
          <TickMonogram app={a} size={84} compact spark={spark} />
        </GlassPill>
      )}
    </WithApp>
  );
}
