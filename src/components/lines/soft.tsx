/**
 * File: src/components/lines/soft.tsx
 * Description: Group S of the Lines page (S01 to S08): soft lines and airbrush. No edge anywhere: every line is a gradient cut by a bell
 * mask across and a fade along, so it is a haze of light with a hotter core, like the airbrush dots and charts. S08 is the pale blurred
 * bar of the timeline's ES Employment ray.
 */
import type { FC } from 'react';
import { anim, bright, tint } from '@/components/chartstudy/shared';
import { Root, Sheet, WHITE, alongDir, acrossDir, bell, ends, gr, hot, tail } from './kit';
import type { RayProps } from './kit';

/** S01 Airbrush ray: a wide soft haze in the shifted gradient and a hot core. The default look. */
export const S01: FC<RayProps> = (p) => (
  <Root p={p}>
    <Sheet p={p} th={p.t * 7} bg={gr(p, tint(p.hi, 0.5), tint(p.lo, 0.5))} masks={[bell(p, 0.3), ends(p, 12, 88)]} />
    <Sheet p={p} th={p.t * 2.2} bg={gr(p, hot(p.hi, 0.9), hot(p.lo, 0.9))} masks={[bell(p, 0.55), ends(p, 8, 92)]} />
  </Root>
);

/** S02 Mist: very wide and faint, no core: a breath of colour along the line. */
export const S02: FC<RayProps> = (p) => (
  <Root p={p}>
    <Sheet p={p} th={p.t * 10} bg={tint(p.c, 0.3)} masks={[bell(p, 0.5), ends(p, 18, 82)]} />
    <Sheet p={p} th={p.t * 4} bg={gr(p, tint(p.hi, 0.35), tint(p.lo, 0.35))} masks={[bell(p, 0.4), ends(p, 24, 76)]} />
  </Root>
);

/** S03 Feather: it tapers to a point at both ends, thickest in the middle. */
export const S03: FC<RayProps> = (p) => (
  <Root p={p}>
    <Sheet p={p} th={p.t * 6} bg={gr(p, tint(p.hi, 0.6), tint(p.lo, 0.6))} masks={[bell(p, 0.4), ends(p, 34, 66)]} />
    <Sheet p={p} th={p.t * 1.5} bg={WHITE(0.9)} masks={[bell(p, 0.6), ends(p, 26, 74)]} />
  </Root>
);

/** S04 Ember fade: strong where it starts, gone before it ends. */
export const S04: FC<RayProps> = (p) => (
  <Root p={p}>
    <Sheet p={p} th={p.t * 7} bg={gr(p, tint(p.hi, 0.55), tint(p.lo, 0.3))} masks={[bell(p, 0.3), tail(p, 18, 100)]} />
    <Sheet p={p} th={p.t * 1.8} bg={gr(p, hot(p.hi), tint(p.lo, 0.5))} masks={[bell(p, 0.55), tail(p, 12, 92)]} />
  </Root>
);

/** S05 Glow stack: four pills of one colour, each narrower and brighter than the last, so the glow has steps of its own. */
export const S05: FC<RayProps> = (p) => (
  <Root p={p}>
    {[
      [9, 0.08],
      [5.5, 0.15],
      [3, 0.32],
      [1.3, 0.95],
    ].map(([k, a]) => (
      <Sheet key={k} p={p} th={p.t * k} bg={gr(p, tint(p.hi, a), tint(p.lo, a))} radius masks={[ends(p, 3, 97)]} />
    ))}
  </Root>
);

/** S06 Nebula: two airbrush clouds, the lighter and the deeper cousin, laid across each other off-centre. */
export const S06: FC<RayProps> = (p) => (
  <Root p={p}>
    <Sheet p={p} th={p.t * 7} off={-p.t * 1.1} bg={gr(p, tint(p.hi, 0.6), tint(p.c, 0.4))} masks={[bell(p, 0.3), ends(p, 10, 90)]} />
    <Sheet p={p} th={p.t * 7} off={p.t * 1.1} bg={gr(p, tint(p.c, 0.4), tint(p.lo, 0.6))} masks={[bell(p, 0.3), ends(p, 10, 90)]} />
    <Sheet p={p} th={p.t * 1.2} bg={WHITE(0.8)} masks={[bell(p, 0.6), ends(p, 20, 80)]} />
  </Root>
);

/** S07 Halftone ray: a haze made of dots, dense in the middle and thinning out to the edges. */
export const S07: FC<RayProps> = (p) => (
  <Root p={p}>
    <Sheet
      p={p}
      th={p.t * 8}
      bg={gr(p, p.hi, p.lo)}
      masks={['radial-gradient(circle, #000 0 38%, transparent 46%)', bell(p, 0.1), ends(p, 10, 90)]}
      extra={{ maskSize: '5px 5px, 100% 100%, 100% 100%', WebkitMaskSize: '5px 5px, 100% 100%, 100% 100%', maskRepeat: 'repeat, no-repeat, no-repeat', WebkitMaskRepeat: 'repeat, no-repeat, no-repeat' }}
    />
  </Root>
);

/** S08 Pillow: the pale blurred bar of the timeline (ES Employment), with a brighter stretch in the middle. */
export const S08: FC<RayProps> = (p) => (
  <Root p={p}>
    <Sheet p={p} th={p.box * 0.95} bg={tint(bright(p.c, 0.8), 0.42)} masks={[bell(p, 0.6), ends(p, 3, 97)]} />
    <Sheet p={p} th={p.box * 0.7} bg={WHITE(0.5)} masks={[bell(p, 0.55), ends(p, 30, 70)]} />
  </Root>
);

/** An animation-friendly name, kept for the other groups: a line breathing between two states. */
export const breathe = (p: RayProps, ms = 3600, delay = 0) => anim(p.live, 'fw-ce-lit', ms, { loop: true, delay });

export const SOFT_LINES: Record<string, FC<RayProps>> = { S01, S02, S03, S04, S05, S06, S07, S08 };
export { alongDir, acrossDir };
