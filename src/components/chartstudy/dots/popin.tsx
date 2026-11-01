/**
 * File: src/components/chartstudy/dots/popin.tsx
 * Description: Row 3 of the Blends page (13 to 16): a layered dot that arrives. The smallest core pops out of nothing, then
 * each layer outside it pops out in turn, and finally one surface fades in over them while the layers fade away, so the
 * cutouts only exist for the transition in and the dot rests as a shifted gradient (or airbrush, or glass). Transform and
 * opacity only; six layers, a surface and two wrappers. Not live, the resting dot is drawn straight away.
 */
import type { CSSProperties, FC, ReactNode } from 'react';
import { anim, mixHex, tint } from '../shared';
import { Wrap, at } from './kit';
import type { DotProps } from './kit';
import { SHEEN, airAt, glassN, grad, shadowBlob } from './blends';

const LAYERS = 6;
const STEP = 110; // ms between one layer and the next
const POP = 560; // ms for one layer to pop out
const MERGE_AT = (LAYERS - 1) * STEP + 420; // when the surface starts to fade in

function PopIn({ p, layer, surface }: { p: DotProps; layer: (i: number, size: number) => CSSProperties; surface: ReactSurface }) {
  const { s, live } = p;
  return (
    <Wrap s={s}>
      {/* ── EFFECT: the layers popping out, innermost first, and fading away under the surface (removable) ── */}
      {live && (
        <Wrap s={s} style={{ position: 'absolute', left: 0, top: 0, ...anim(live, 'fw-cd-gone', 700, { delay: MERGE_AT, ease: 'ease-in-out' }) }}>
          {Array.from({ length: LAYERS }, (_, i) => {
            const size = s * (1 - i * 0.16);
            return <span key={i} aria-hidden style={at(size, { ...layer(i, size), opacity: 0, ...anim(live, 'fw-cd-popin', POP, { delay: (LAYERS - 1 - i) * STEP, ease: 'ease-out' }) })} />;
          })}
        </Wrap>
      )}
      {/* The resting dot: one surface. */}
      {surface(p, live ? { opacity: 0, ...anim(live, 'fw-cd-surface', 700, { delay: MERGE_AT, ease: 'ease-in-out' }) } : {})}
    </Wrap>
  );
}

type ReactSurface = (p: DotProps, extra: CSSProperties) => ReactNode;

const stepped = (p: DotProps) => (i: number, size: number): CSSProperties => ({
  background: mixHex(p.hi, p.deep, i / (LAYERS - 1)),
  boxShadow: `0 ${size * 0.05}px ${size * 0.08}px ${tint(p.deep, 0.85)}`,
});

/** 13 Pop-in to a shifted gradient. */
export const D13: FC<DotProps> = (p) => (
  <PopIn p={p} layer={stepped(p)} surface={({ hi, lo, s }, extra) => <span aria-hidden style={at(s, { background: grad(hi, lo), ...extra })} />} />
);

/** 14 Pop-in to an airbrush. */
export const D14: FC<DotProps> = (p) => (
  <PopIn p={p} layer={stepped(p)} surface={({ hi, lo, s }, extra) => <span aria-hidden style={airAt(s, grad(hi, lo), extra)} />} />
);

/** 15 Pop-in to a shifted gradient with soft shadow and glow. */
export const D15: FC<DotProps> = (p) => (
  <PopIn
    p={p}
    layer={stepped(p)}
    surface={({ hi, lo, s }, extra) => (
      <span aria-hidden style={at(s, { background: grad(hi, lo), boxShadow: `0 ${s * 0.28}px ${s * 0.5}px ${tint(lo, 0.6)}, 0 0 ${s * 0.42}px ${tint(hi, 0.6)}`, ...extra })} />
    )}
  />
);

/** 16 Pop-in of glass layers, resting as a pearl: tint-bleed glass with a sheen and a soft shadow. */
export const D16: FC<DotProps> = (p) => (
  <PopIn
    p={p}
    layer={(i, size) => ({ background: tint(mixHex('#e8eef9', p.c, 0.15 + (i / (LAYERS - 1)) * 0.7), 0.5), boxShadow: `0 ${size * 0.06}px ${size * 0.16}px ${tint(p.lo, 0.3)}` })}
    surface={({ c, hi, lo, s }, extra) => (
      <>
        <span aria-hidden style={{ ...shadowBlob(s, lo, 0.55), ...extra }} />
        <span aria-hidden style={at(s * 0.92, { background: `${SHEEN}, linear-gradient(120deg, ${glassN(0.7)} 0%, ${glassN(0.34)} 40%, ${tint(c, 0.7)} 72%, ${tint(hi, 0.95)})`, ...extra })} />
      </>
    )}
  />
);

export const POPIN_DOTS: Record<string, FC<DotProps>> = { '13': D13, '14': D14, '15': D15, '16': D16 };
