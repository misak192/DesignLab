/**
 * File: src/components/lines/veils/marker.tsx
 * Description: Groups D and E of the Veils page (V21 to V36). D is the highlighter: a thick stroke of colour behind words, from a plain
 * marker to a brush swipe with streaks, an underline swipe, a neon marker and a torn edge. E is the veil that dissipates: it fades one
 * way, dissolves into halftone dots, smokes at its edge, evaporates upward or frays into strands. All gradients and masks; the only
 * movement is transform and opacity.
 */
import type { CSSProperties, FC } from 'react';
import { anim, bright, rand, tint } from '@/components/chartstudy/shared';
import { V, VRoot, Vp, WHITE, dots, fx, fy, gh, oval, ragged, tiles, toB, toL, toR } from './kit';
import type { VeilProps } from './kit';

const body = (p: VeilProps, a = 0.55) => gh(tint(p.hi, a), tint(p.lo, a));

/* ── D: highlighter ─────────────────────────────────────────────────────────────────────────────────────────── */

/** V21 Marker: a flat thick stroke with slightly skewed ends, a little darker along its foot, as a highlighter pen lays it. */
export const V21: FC<VeilProps> = (p) => (
  <VRoot p={p}>
    <V bg={`linear-gradient(to bottom, ${tint(p.c, 0.5)}, ${tint(p.c, 0.62)})`} inset={[6, 22]} radius={5} extra={{ clipPath: 'polygon(1% 14%, 99% 0%, 100% 86%, 0% 100%)' }} />
  </VRoot>
);

/** V22 Brush swipe: an uneven edge and the streaks of the bristles running through it. */
export const V22: FC<VeilProps> = (p) => {
  const clip = 'polygon(0 22%, 3% 10%, 10% 16%, 24% 6%, 44% 13%, 64% 4%, 84% 12%, 97% 8%, 100% 30%, 98% 62%, 100% 86%, 88% 96%, 66% 90%, 44% 98%, 22% 92%, 8% 97%, 0 78%)';
  return (
    <VRoot p={p}>
      <V bg={body(p, 0.58)} inset={[4, 8]} extra={{ clipPath: clip }} />
      <V bg={`repeating-linear-gradient(100deg, ${WHITE(0.16)} 0 2px, transparent 2px 9px)`} inset={[4, 8]} extra={{ clipPath: clip }} />
    </VRoot>
  );
};

/** V23 Double swipe: two strokes, one over the other, in the lighter and the deeper cousin. */
export const V23: FC<VeilProps> = (p) => (
  <VRoot p={p}>
    <Vp x={2} y={14} w={90} h={46} bg={tint(p.hi, 0.5)} extra={{ clipPath: 'polygon(0 14%, 8% 4%, 40% 10%, 78% 2%, 100% 20%, 98% 86%, 62% 96%, 20% 92%, 2% 100%)' }} />
    <Vp x={8} y={42} w={90} h={44} bg={tint(p.lo, 0.5)} extra={{ clipPath: 'polygon(2% 20%, 30% 6%, 70% 12%, 100% 2%, 96% 82%, 70% 94%, 36% 88%, 0 100%)' }} />
  </VRoot>
);

/** V24 Underline swipe: only the lower part of the area, tilted a little, as a pen underlines a line of words. */
export const V24: FC<VeilProps> = (p) => (
  <VRoot p={p}>
    <Vp x={3} y={52} w={94} h={34} bg={body(p, 0.62)} extra={{ transform: 'rotate(-1.4deg)', clipPath: 'polygon(0 30%, 6% 8%, 30% 18%, 62% 4%, 92% 14%, 100% 36%, 96% 84%, 70% 96%, 38% 88%, 10% 98%, 2% 80%)' }} />
  </VRoot>
);

/** V25 Spotlight highlight: a softly lit rounded area with a glow around it, the words as if lit from behind. */
export const V25: FC<VeilProps> = (p) => (
  <VRoot p={p}>
    <V bg={tint(p.c, 0.2)} inset={[10, 16]} radius={14} extra={{ boxShadow: `0 0 30px ${tint(p.c, 0.5)}, inset 0 0 20px ${tint(p.hi, 0.3)}` }} />
  </VRoot>
);

/** V26 Neon marker: a bright stroke that glows past its own edge. */
export const V26: FC<VeilProps> = (p) => (
  <VRoot p={p}>
    <V bg={tint(p.hi, 0.5)} inset={[10, 24]} radius={10} extra={{ boxShadow: `0 0 36px ${tint(p.hi, 0.7)}, 0 0 8px ${tint(p.hi, 0.9)}` }} />
    <V bg={`linear-gradient(to bottom, ${WHITE(0.45)}, transparent)`} inset={[14, 26]} radius={8} masks={[fx(6, 94)]} extra={{ bottom: '58%' }} />
  </VRoot>
);

/** V27 Pastel marker: a pale, milky stroke with softened ends. */
export const V27: FC<VeilProps> = (p) => (
  <VRoot p={p}>
    <V bg={tint(bright(p.c, 0.6), 0.5)} inset={[6, 22]} radius={9} masks={[fx(3, 97)]} />
    <V bg={tint(bright(p.hi, 0.7), 0.3)} inset={[16, 30]} radius={6} masks={[fx(10, 90)]} />
  </VRoot>
);

/** V28 Torn: a stroke whose top and bottom edges are ragged, like a strip of torn paper. */
export const V28: FC<VeilProps> = (p) => (
  <VRoot p={p}>
    <V bg={`linear-gradient(to bottom, ${tint(p.hi, 0.55)}, ${tint(p.lo, 0.55)})`} inset={[4, 14]} extra={{ clipPath: ragged(p.seed, 26, 14) }} />
  </VRoot>
);

/* ── E: dissipating veils ───────────────────────────────────────────────────────────────────────────────────── */

/** V29 Fade right: full on the left, gone before the right edge. */
export const V29: FC<VeilProps> = (p) => (
  <VRoot p={p}>
    <V bg={body(p, 0.62)} masks={[toR(8, 100), fy(14, 86)]} />
    <V bg={WHITE(0.14)} masks={[toR(4, 70), fy(34, 66)]} />
  </VRoot>
);

/** V30 Fade left: the same, the other way. */
export const V30: FC<VeilProps> = (p) => (
  <VRoot p={p}>
    <V bg={body(p, 0.62)} masks={[toL(8, 100), fy(14, 86)]} />
    <V bg={WHITE(0.14)} masks={[toL(4, 70), fy(34, 66)]} />
  </VRoot>
);

/** V31 Lens: thickest in the middle, thinning to nothing on every side. */
export const V31: FC<VeilProps> = (p) => (
  <VRoot p={p}>
    <V bg={body(p, 0.62)} masks={[oval(40, 92)]} />
    <V bg={WHITE(0.18)} masks={[oval(14, 62)]} />
  </VRoot>
);

/** V32 Fade down: full along the top and gone toward the bottom, like light coming through a blind. */
export const V32: FC<VeilProps> = (p) => (
  <VRoot p={p}>
    <V bg={body(p, 0.62)} masks={[toB(8, 100), fx(6, 94)]} />
  </VRoot>
);

/** V33 Dissolve: solid at one end, then big dots, then small dots, then nothing at the other. */
export const V33: FC<VeilProps> = (p) => (
  <VRoot p={p}>
    <Vp x={0} y={0} w={36} h={100} bg={body(p, 0.6)} masks={[fy(14, 86)]} />
    <Vp x={34} y={0} w={34} h={100} bg={body(p, 0.85)} masks={[dots(44), fy(14, 86)]} extra={tiles(10, 1)} />
    <Vp x={66} y={0} w={34} h={100} bg={body(p, 0.8)} masks={[dots(34), toR(0, 96), fy(14, 86)]} extra={tiles(5, 2)} />
  </VRoot>
);

/** V34 Smoke: four layers, each shorter and fainter than the one behind, so the colour disperses in steps. */
export const V34: FC<VeilProps> = (p) => (
  <VRoot p={p}>
    {[100, 82, 64, 46].map((w, i) => (
      <Vp key={w} x={0} y={0} w={w} h={100} bg={tint(i % 2 ? p.lo : p.hi, 0.5 - i * 0.07)} masks={[toR(6, 100), fy(12 + i * 4, 88 - i * 4)]} />
    ))}
  </VRoot>
);

/** V35 Evaporate: wisps of the veil lift off it one after another, rising and thinning like heat. */
export const V35: FC<VeilProps> = (p) => (
  <VRoot p={p}>
    <V bg={body(p, 0.5)} masks={[fx(8, 92), fy(24, 76)]} inset={[0, 18]} />
    {[0, 1, 2].map((i) => {
      const style = { '--dx': '0px', '--dy': `${-p.h * (0.24 + i * 0.1)}px`, ...(p.live ? anim(p.live, 'fw-ln-shed', 3600, { loop: true, delay: -i * 1200, ease: 'ease-out' }) : { opacity: 0.18 }) } as unknown as CSSProperties;
      return <V key={i} bg={tint(p.hi, 0.34)} masks={[fx(14, 86), fy(30, 70)]} inset={[12 + i * 8, 22]} extra={style} />;
    })}
  </VRoot>
);

/** V36 Fray: the right of the veil comes apart into strands of different lengths. */
export const V36: FC<VeilProps> = (p) => (
  <VRoot p={p}>
    <Vp x={0} y={12} w={52} h={76} bg={body(p, 0.55)} masks={[toR(70, 100), fy(10, 90)]} />
    {Array.from({ length: 8 }, (_, i) => {
      const len = 30 + rand(i, p.seed) * 62;
      return <Vp key={i} x={40} y={12 + i * 9.4} w={len} h={7} bg={tint(i % 2 ? p.lo : p.hi, 0.55)} masks={[toR(10, 100)]} radius={99} />;
    })}
  </VRoot>
);

export const MARKER_VEILS: Record<string, FC<VeilProps>> = { V21, V22, V23, V24, V25, V26, V27, V28, V29, V30, V31, V32, V33, V34, V35, V36 };
