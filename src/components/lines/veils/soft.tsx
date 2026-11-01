/**
 * File: src/components/lines/veils/soft.tsx
 * Description: Groups A and B of the Veils page (V01 to V14): airbrush, mist, cloud, aurora, nebula, dusk, horizon and spotlight veils, and
 * veils given a texture: halftone with a faded edge, big dots, dust, scanlines, hatching and a mosaic. Every one is a big soft area of colour
 * with no edge: a gradient cut by masks that fade its sides.
 */
import type { FC } from 'react';
import { anim, tint } from '@/components/chartstudy/shared';
import { V, VRoot, Vp, WHITE, dots, fx, fy, gh, oval, tiles, toB } from './kit';
import type { VeilProps } from './kit';

const body = (p: VeilProps, a = 0.55) => gh(tint(p.hi, a), tint(p.lo, a));

/** V01 Airbrush veil: a big soft area in the shifted gradient with a lighter heart. The default look. */
export const V01: FC<VeilProps> = (p) => (
  <VRoot p={p}>
    <V bg={body(p)} masks={[fx(18, 82), fy(28, 72)]} />
    <V bg={WHITE(0.16)} masks={[fx(26, 74), fy(34, 66)]} />
  </VRoot>
);

/** V02 Mist: very wide and faint, spilling past its box, with no heart. */
export const V02: FC<VeilProps> = (p) => (
  <VRoot p={p}>
    <V bg={tint(p.c, 0.26)} masks={[fx(4, 96), fy(8, 92)]} inset={[-12, -16]} />
    <V bg={body(p, 0.3)} masks={[fx(14, 86), fy(22, 78)]} />
  </VRoot>
);

/** V03 Cloud: two soft clouds, the lighter and the deeper cousin, drifting into each other. */
export const V03: FC<VeilProps> = (p) => (
  <VRoot p={p}>
    <V
      bg={`radial-gradient(ellipse 46% 72% at 28% 50%, ${tint(p.hi, 0.62)}, transparent 72%), radial-gradient(ellipse 46% 72% at 72% 52%, ${tint(p.lo, 0.62)}, transparent 72%), radial-gradient(ellipse 30% 50% at 50% 46%, ${WHITE(0.18)}, transparent 70%)`}
      masks={[fx(2, 98)]}
    />
  </VRoot>
);

/** V04 Aurora veil: two gradients that slowly trade places, so the colours move through the haze. */
export const V04: FC<VeilProps> = (p) => (
  <VRoot p={p}>
    <V bg={body(p, 0.52)} masks={[fx(10, 90), fy(16, 84)]} />
    <V bg={gh(tint(p.lo, 0.52), tint(p.hi, 0.52))} masks={[fx(10, 90), fy(16, 84)]} extra={anim(p.live, 'fw-ce-lit', 5200, { loop: true })} />
    <V bg={WHITE(0.14)} masks={[fx(30, 70), fy(36, 64)]} />
  </VRoot>
);

/** V05 Nebula: three blobs of colour and a few bright knots, like a gas cloud. */
export const V05: FC<VeilProps> = (p) => (
  <VRoot p={p}>
    <V
      bg={`radial-gradient(ellipse 40% 70% at 22% 56%, ${tint(p.lo, 0.6)}, transparent 70%), radial-gradient(ellipse 44% 80% at 52% 40%, ${tint(p.hi, 0.55)}, transparent 70%), radial-gradient(ellipse 38% 66% at 82% 58%, ${tint(p.c, 0.55)}, transparent 70%), radial-gradient(circle at 40% 46%, ${WHITE(0.5)}, transparent 12%), radial-gradient(circle at 70% 52%, ${WHITE(0.4)}, transparent 10%)`}
      masks={[fx(4, 96), fy(8, 92)]}
    />
  </VRoot>
);

/** V06 Dusk: strong along the bottom and rising into nothing, like the sky just after sunset. */
export const V06: FC<VeilProps> = (p) => (
  <VRoot p={p}>
    <V bg={`linear-gradient(to bottom, ${tint(p.hi, 0)}, ${tint(p.hi, 0.42)} 50%, ${tint(p.lo, 0.78)})`} masks={[fx(6, 94), 'linear-gradient(to bottom, transparent, #000 36%, #000 90%, transparent)']} />
  </VRoot>
);

/** V07 Horizon: a bright band low in the box, glowing up and down from a thin line of light. */
export const V07: FC<VeilProps> = (p) => (
  <VRoot p={p}>
    <V bg={`radial-gradient(ellipse 72% 44% at 50% 70%, ${tint(p.hi, 0.78)}, ${tint(p.lo, 0.3)} 55%, transparent 100%)`} />
    <Vp x={14} y={69} w={72} h={2.5} bg={WHITE(0.85)} masks={[fx(10, 90)]} />
  </VRoot>
);

/** V08 Spotlight: a pool of light, white at the centre and the colour out to the rim. */
export const V08: FC<VeilProps> = (p) => (
  <VRoot p={p}>
    <V bg={`radial-gradient(ellipse at 50% 50%, ${WHITE(0.42)}, ${tint(p.c, 0.42)} 38%, transparent 72%)`} />
  </VRoot>
);

/** V09 Halftone, faded edge: a grid of dots that dissolves toward every side. */
export const V09: FC<VeilProps> = (p) => (
  <VRoot p={p}>
    <V bg={gh(p.hi, p.lo)} masks={[dots(42), fx(14, 86), fy(20, 80)]} extra={tiles(6, 2)} />
  </VRoot>
);

/** V10 Big dots: a coarse halftone, dots the size of peas, thinning to an oval. */
export const V10: FC<VeilProps> = (p) => (
  <VRoot p={p}>
    <V bg={gh(p.hi, p.lo)} masks={[dots(46), oval(30, 80)]} extra={tiles(13, 1)} />
  </VRoot>
);

/** V11 Dust: a fine mist of grains, thick in the middle and thin at the rim. */
export const V11: FC<VeilProps> = (p) => (
  <VRoot p={p}>
    <V bg={tint(p.c, 0.95)} masks={[dots(30), oval(26, 82)]} extra={tiles(3, 1)} />
    <V bg={tint(p.c, 0.14)} masks={[oval(22, 78)]} />
  </VRoot>
);

/** V12 Scanlines: a veil cut by fine horizontal lines, like a screen. */
export const V12: FC<VeilProps> = (p) => (
  <VRoot p={p}>
    <V bg={body(p, 0.8)} masks={['repeating-linear-gradient(to bottom, #000 0 2px, transparent 2px 5px)', fx(8, 92), fy(14, 86)]} />
    <V bg={body(p, 0.16)} masks={[fx(10, 90), fy(16, 84)]} />
  </VRoot>
);

/** V13 Hatch: diagonal pen strokes that fade out toward the edges. */
export const V13: FC<VeilProps> = (p) => (
  <VRoot p={p}>
    <V bg={body(p, 0.85)} masks={['repeating-linear-gradient(135deg, #000 0 2px, transparent 2px 8px)', fx(12, 88), fy(18, 82)]} />
  </VRoot>
);

/** V14 Mosaic: square tiles with hairline gaps, the colour thinning out at the edges. */
export const V14: FC<VeilProps> = (p) => (
  <VRoot p={p}>
    <V
      bg={body(p, 0.7)}
      masks={['linear-gradient(to right, transparent 0 1.5px, #000 1.5px)', 'linear-gradient(to bottom, transparent 0 1.5px, #000 1.5px)', fx(14, 86), fy(20, 80)]}
      extra={{ maskSize: '12px 100%, 100% 12px, 100% 100%, 100% 100%', WebkitMaskSize: '12px 100%, 100% 12px, 100% 100%, 100% 100%', maskRepeat: 'repeat-x, repeat-y, no-repeat, no-repeat', WebkitMaskRepeat: 'repeat-x, repeat-y, no-repeat, no-repeat' }}
    />
  </VRoot>
);

export const SOFT_VEILS: Record<string, FC<VeilProps>> = { V01, V02, V03, V04, V05, V06, V07, V08, V09, V10, V11, V12, V13, V14 };
export { toB };
