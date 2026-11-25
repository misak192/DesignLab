/**
 * File: src/components/brand/BrandIntro.tsx
 * Description: The FrissonWorks intro. "FW" appears with the W raised; the W sinks to the baseline while "risson" and
 * "orks" unfold around it; "presents" arrives below; then the BrandReel lands on the current app. Twenty variants of the
 * motion and style live in src/lib/brand/intros.ts. Stages are timed with timeouts (0 FW, 1 unfold, 2 presents, 3 reel).
 * With reduced motion or MOTION off it shows the end state at once.
 */
"use client";
import { useEffect, useState, type CSSProperties } from 'react';
import { motion, type TargetAndTransition } from 'framer-motion';
import type { AppId } from '@/lib/brand/apps';
import { useBrandPalette } from './palette';
import { INTROS, type EnterKind, type GrowKind, type IntroVariant, type PresentsKind } from '@/lib/brand/intros';
import { REEL_VARIANTS } from '@/lib/brand/reel';
import BrandReel from './BrandReel';
import { EASE, useCalm } from './kit';

const enterFrom = (k: EnterKind): TargetAndTransition => {
  switch (k) {
    case 'rise': return { opacity: 0, y: '0.35em' };
    case 'blur': return { opacity: 0, filter: 'blur(14px)' };
    case 'zoom': return { opacity: 0, scale: 2.2, filter: 'blur(6px)' };
    case 'drop': return { opacity: 0, y: '-0.8em' };
    case 'slit': return { opacity: 0, clipPath: 'inset(48% 0 48% 0)' };
    case 'tracking': return { opacity: 0, letterSpacing: '0.8em' };
    default: return { opacity: 0 };
  }
};
const enterTo: TargetAndTransition = { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', clipPath: 'inset(0% 0 0% 0)', letterSpacing: '0em' };

const letterFrom = (k: GrowKind, i: number): TargetAndTransition => {
  const side = i % 2 ? 1 : -1;
  switch (k) {
    case 'roll': return { opacity: 0, rotateX: -90, y: '0.4em' };
    case 'scatter': return { opacity: 0, x: `${side * (0.6 + (i % 3) * 0.4)}em`, y: `${(i % 2 ? -1 : 1) * 0.5}em`, filter: 'blur(6px)' };
    case 'type': return { opacity: 0 };
    case 'blur': return { opacity: 0, filter: 'blur(10px)', scale: 1.3 };
    case 'drop': return { opacity: 0, y: '-1em' };
    case 'wave': return { opacity: 0, y: '0.5em' };
    case 'rise': return { opacity: 0, y: '1.1em' };
    case 'tracking': return { opacity: 0, x: '-0.4em' };
    default: return { opacity: 0 };
  }
};
const letterTo: TargetAndTransition = { opacity: 1, rotateX: 0, x: 0, y: 0, scale: 1, filter: 'blur(0px)' };
const CLIPPED: GrowKind[] = ['roll', 'drop', 'rise', 'wave'];

function Grow({ text, kind, on, dur, calm, colour }: { text: string; kind: GrowKind; on: boolean; dur: number; calm: boolean; colour?: string }) {
  const clipped = CLIPPED.includes(kind);
  return (
    <motion.span
      aria-hidden={false}
      initial={calm ? false : { width: 0 }}
      animate={{ width: on ? 'auto' : 0 }}
      transition={{ duration: dur, ease: kind === 'type' ? 'linear' : EASE }}
      style={{ display: 'inline-flex', whiteSpace: 'nowrap', overflow: clipped || !on ? 'hidden' : 'visible', perspective: 400, paddingBlock: '0.12em', marginBlock: '-0.12em', color: colour }}
    >
      {[...text].map((ch, i) => (
        <motion.span
          key={i}
          style={{ display: 'inline-block' }}
          initial={calm ? false : letterFrom(kind, i)}
          animate={on ? letterTo : letterFrom(kind, i)}
          transition={{ duration: dur * 0.75, delay: on ? (kind === 'type' ? i * (dur / text.length) : i * 0.05) : 0, ease: EASE }}
        >
          {ch}
        </motion.span>
      ))}
    </motion.span>
  );
}

function Presents({ kind, on, calm }: { kind: PresentsKind; on: boolean; calm: boolean }) {
  const text = 'presents';
  const style: CSSProperties = { fontSize: '0.3em', fontWeight: 300, letterSpacing: '0.35em', textTransform: 'uppercase', color: 'var(--ink-2)', display: 'inline-flex', whiteSpace: 'nowrap', minHeight: '1.2em' };
  if (kind === 'type') {
    return (
      <span style={style} aria-label={text}>
        {[...text].map((ch, i) => (
          <motion.span key={i} initial={calm ? false : { opacity: 0 }} animate={{ opacity: on ? 1 : 0 }} transition={{ duration: 0.05, delay: on ? i * 0.07 : 0 }}>
            {ch}
          </motion.span>
        ))}
      </span>
    );
  }
  const from: TargetAndTransition =
    kind === 'track' ? { opacity: 0, letterSpacing: '0.9em' } : kind === 'rise' ? { opacity: 0, y: '0.8em' } : kind === 'blur' ? { opacity: 0, filter: 'blur(8px)' } : { opacity: 0 };
  return (
    <motion.span
      style={style}
      initial={calm ? false : from}
      animate={on ? { opacity: 1, y: 0, filter: 'blur(0px)', letterSpacing: '0.35em' } : from}
      transition={{ duration: 0.8, ease: EASE }}
    >
      {text}
    </motion.span>
  );
}

export interface BrandIntroProps {
  app: AppId;
  variant?: IntroVariant;
  /** CSS font size of "FrissonWorks". */
  size?: string;
  playKey?: number;
}

export default function BrandIntro(props: BrandIntroProps) {
  const v = props.variant ?? INTROS[0];
  return <IntroInner key={`${props.playKey ?? 0}-${v.id}-${props.app}`} {...props} variant={v} />;
}

function IntroInner({ app, variant: v, size = '46px' }: BrandIntroProps & { variant: IntroVariant }) {
  const calm = useCalm();
  const [stage, setStage] = useState(calm ? 3 : 0);
  const a = useBrandPalette().byId(app);

  useEffect(() => {
    if (calm) return;
    const [t0, t1, t2] = v.t;
    const ts = [setTimeout(() => setStage(1), t0 * 1000), setTimeout(() => setStage(2), (t0 + t1) * 1000), setTimeout(() => setStage(3), (t0 + t1 + t2) * 1000)];
    return () => ts.forEach(clearTimeout);
  }, [calm, v]);

  const unfolded = stage >= 1;
  const [, t1] = v.t;
  const weight = v.thin ? 200 : 500;
  const tracking = v.thin ? '0.14em' : '0';
  const tone = (part: 'F' | 'mid' | 'W') => (v.tone === 'ink' ? 'var(--ink)' : v.tone === 'app' ? a.colour : part === 'F' ? 'var(--ink)' : part === 'W' ? 'var(--fw-cyan)' : 'var(--ink)');
  const wTop = v.travel === 'arc' ? ['-0.95em', '-2.2em', '0em'] : ['-0.95em', '0em'];
  const wTransition =
    v.travel === 'spring' ? { type: 'spring' as const, stiffness: 170, damping: 11 } : { duration: t1, ease: EASE, times: v.travel === 'arc' ? [0, 0.45, 1] : undefined };

  return (
    <div className="flex flex-col items-center gap-3 py-2" style={{ fontSize: size }}>
      <motion.div
        initial={calm ? false : enterFrom(v.enter)}
        animate={enterTo}
        transition={{ duration: v.t[0] + 0.3, ease: EASE }}
        style={{ fontWeight: weight, letterSpacing: tracking, lineHeight: 1.1, whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'baseline' }}
        aria-label="FrissonWorks"
      >
        <span style={{ color: tone('F') }}>F</span>
        <Grow text="risson" kind={v.grow} on={unfolded} dur={t1} calm={calm} colour={tone('mid')} />
        <motion.span
          style={{ display: 'inline-block', position: 'relative', color: tone('W'), marginLeft: '0.04em' }}
          initial={calm ? false : { fontSize: '0.42em', top: wTop[0] }}
          animate={unfolded ? { fontSize: '1em', top: wTop } : { fontSize: '0.42em', top: wTop[0] }}
          transition={wTransition}
        >
          W
        </motion.span>
        <Grow text="orks" kind={v.grow} on={unfolded} dur={t1} calm={calm} colour={tone('mid')} />
      </motion.div>
      <Presents kind={v.presents} on={stage >= 2} calm={calm} />
      <div style={{ minHeight: '1.3em', fontSize: '0.8em', opacity: stage >= 3 ? 1 : 0, transition: calm ? 'none' : 'opacity 0.5s' }}>
        {stage >= 3 && <BrandReel app={app} variant={REEL_VARIANTS.find((r) => r.id === v.reel) ?? REEL_VARIANTS[0]} duration={2.2} size="1em" />}
      </div>
    </div>
  );
}
