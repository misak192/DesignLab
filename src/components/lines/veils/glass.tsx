/**
 * File: src/components/lines/veils/glass.tsx
 * Description: Group C of the Veils page (V15 to V20): glass veils. Glass is the theme's own neutral (see --dot-glass), pale on the dark
 * page and grey-blue on the light one, with a tint of the colour. The glass end is almost clear and dissolves into the page; the colour end
 * is solid. No blur filter and no backdrop-filter: it is made of gradients.
 */
import type { FC } from 'react';
import { bright, tint } from '@/components/chartstudy/shared';
import { SHEEN, SHEEN_SOFT, glassN } from '@/components/chartstudy/dots/blends';
import { V, VRoot, Vp, WHITE, fx, fy, gh, toL } from './kit';
import type { VeilProps } from './kit';

/** V15 Glass veil: a pane of pale glass with the colour gathering at its foot, a sheen across the top, and a soft shadow. */
export const V15: FC<VeilProps> = (p) => (
  <VRoot p={p}>
    <V bg={tint(p.lo, 0.4)} masks={[fx(10, 90), fy(30, 100)]} inset={[14, 12]} extra={{ transform: 'translateY(10px)' }} />
    <V bg={`${SHEEN}, linear-gradient(165deg, ${glassN(0.4)}, ${glassN(0.14)} 52%, ${tint(p.c, 0.5)})`} inset={[8, 6]} radius={16} />
  </VRoot>
);

/** V16 Tint bleed: clear glass on the left with the colour bleeding in from the right; the clear end dissolves into the page. */
export const V16: FC<VeilProps> = (p) => (
  <VRoot p={p}>
    <V
      bg={`${SHEEN_SOFT}, linear-gradient(100deg, ${glassN(0.2)} 0%, ${glassN(0.07)} 40%, ${tint(p.c, 0.8)} 78%, ${tint(p.hi, 0.95)} 100%)`}
      masks={['linear-gradient(100deg, rgba(0,0,0,0.25) 0%, #000 55%)', fy(8, 92)]}
      inset={[4, 4]}
    />
  </VRoot>
);

/** V17 Frosted: a faint milky pane with a lighter heart, the edges gone. */
export const V17: FC<VeilProps> = (p) => (
  <VRoot p={p}>
    <V bg={glassN(0.22)} masks={[fx(6, 94), fy(12, 88)]} />
    <V bg={`radial-gradient(ellipse at 50% 40%, ${WHITE(0.3)}, transparent 70%)`} masks={[fx(10, 90)]} />
    <V bg={tint(p.hi, 0.18)} masks={[fx(18, 82), fy(30, 70)]} />
  </VRoot>
);

/** V18 Glass over colour: a pane of glass laid over a cloud of colour and offset from it, so the overlap shows tinted. */
export const V18: FC<VeilProps> = (p) => (
  <VRoot p={p}>
    <V bg={gh(tint(p.hi, 0.7), tint(p.lo, 0.7))} masks={[fx(10, 90), fy(16, 84)]} inset={[0, 4]} extra={{ transform: 'translate(-22px, -6px)' }} />
    <V bg={`${SHEEN}, linear-gradient(160deg, ${glassN(0.5)}, ${glassN(0.2)})`} inset={[30, 14]} radius={14} extra={{ boxShadow: `0 12px 26px ${tint(p.lo, 0.3)}` }} />
  </VRoot>
);

/** V19 Ice: a cold, clear pane, brightened toward blue-white, with a bright edge of light along the top. */
export const V19: FC<VeilProps> = (p) => (
  <VRoot p={p}>
    <V
      bg={`linear-gradient(160deg, ${tint(bright(p.c, 0.78), 0.5)}, ${tint(bright(p.hi, 0.6), 0.16)} 60%, ${tint(bright(p.lo, 0.7), 0.4)})`}
      masks={[fx(4, 96), fy(8, 92)]}
    />
    <Vp x={8} y={14} w={84} h={3} bg={`linear-gradient(to bottom, ${WHITE(0.7)}, transparent)`} masks={[fx(10, 90)]} />
  </VRoot>
);

/** V20 Pane stack: three panes of glass, each a little off the one behind, so the light builds up where they overlap. */
export const V20: FC<VeilProps> = (p) => (
  <VRoot p={p}>
    <V bg={`linear-gradient(160deg, ${glassN(0.3)}, ${glassN(0.1)})`} inset={[6, 20]} radius={14} extra={{ transform: 'translate(-12px, -6px)' }} />
    <V bg={`linear-gradient(160deg, ${tint(p.hi, 0.22)}, ${tint(p.hi, 0.06)})`} inset={[16, 14]} radius={14} extra={{ transform: 'translate(2px, 2px)' }} />
    <V bg={`${SHEEN_SOFT}, linear-gradient(160deg, ${glassN(0.36)}, ${tint(p.lo, 0.22)})`} inset={[26, 10]} radius={14} extra={{ transform: 'translate(10px, 8px)' }} />
  </VRoot>
);

export const GLASS_VEILS: Record<string, FC<VeilProps>> = { V15, V16, V17, V18, V19, V20 };
export { toL };
