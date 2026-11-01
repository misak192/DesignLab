/**
 * File: src/components/lines/best.tsx
 * Description: Group R of the Lines page (R01 to R10): the ones I would use. Each is a combination: the airbrush haze with a breathing second
 * gradient (Aurora), a thin prism of the colour's cousins, the ES Employment bar made premium (Silk), the event stem with a halo dot, a
 * cinematic light leak, a glass beam, a soft saber, a line that dissolves through dashes and dots into stars, a breathing line with a pulse
 * in it, and a ray of stars inside a glow.
 */
import type { CSSProperties, FC } from 'react';
import { Sparkle, anim, bright, tint } from '@/components/chartstudy/shared';
import { mask } from '@/components/chartstudy/dots/kit';
import { glassN, shadowBlob } from '@/components/chartstudy/dots/blends';
import { Root, Runner, Sheet, WHITE, acrossDir, alongDir, bell, dashes, ends, glowDot, gr, hot, isH, slab, starField, starLayer, tail } from './kit';
import type { RayProps } from './kit';

/** R01 Aurora ray: the airbrush ray whose colours slowly trade places: the lighter cousin drifts into the deeper one and back. */
export const R01: FC<RayProps> = (p) => (
  <Root p={p}>
    <Sheet p={p} th={p.t * 7.5} bg={gr(p, tint(p.hi, 0.5), tint(p.lo, 0.5))} masks={[bell(p, 0.3), ends(p, 10, 90)]} />
    <Sheet p={p} th={p.t * 7.5} bg={gr(p, tint(p.lo, 0.5), tint(p.hi, 0.5))} masks={[bell(p, 0.3), ends(p, 10, 90)]} extra={anim(p.live, 'fw-ce-lit', 5200, { loop: true })} />
    <Sheet p={p} th={p.t * 2} bg={WHITE(0.9)} masks={[bell(p, 0.55), ends(p, 8, 92)]} />
  </Root>
);

/** R02 Prism: three hair-thin lines, the deeper cousin, the colour and the lighter cousin, laid side by side with a hot core between. */
export const R02: FC<RayProps> = (p) => (
  <Root p={p}>
    <Sheet p={p} th={p.t * 7} bg={tint(p.c, 0.2)} masks={[bell(p, 0.25), ends(p, 8, 92)]} />
    <Sheet p={p} th={p.t * 0.9} off={-p.t * 1.1} bg={tint(p.lo, 0.95)} masks={[ends(p, 5, 95)]} />
    <Sheet p={p} th={p.t * 0.9} off={p.t * 1.1} bg={tint(p.hi, 0.95)} masks={[ends(p, 5, 95)]} />
    <Sheet p={p} th={p.t * 1.1} bg={hot(p.c)} masks={[ends(p, 5, 95)]} radius />
  </Root>
);

/** R03 Silk: the pale bar of ES Employment made premium: a soft pillow tinted by the shifted gradient, with a brighter stretch in the middle. */
export const R03: FC<RayProps> = (p) => (
  <Root p={p}>
    <Sheet p={p} th={p.box * 1.1} bg={gr(p, tint(p.hi, 0.3), tint(p.lo, 0.3))} masks={[bell(p, 0.5), ends(p, 2, 98)]} />
    <Sheet p={p} th={p.box * 0.82} bg={tint(bright(p.c, 0.78), 0.5)} masks={[bell(p, 0.55), ends(p, 4, 96)]} />
    <Sheet p={p} th={p.box * 0.55} bg={WHITE(0.5)} masks={[bell(p, 0.55), ends(p, 32, 68)]} />
  </Root>
);

/** R04 Event stem: an airbrushed stem that thins as it rises, with a halo dot at its base. The timeline's event line, made soft. */
export const R04: FC<RayProps> = (p) => (
  <Root p={p}>
    <Sheet p={p} th={p.t * 6} bg={tint(p.hi, 0.4)} masks={[bell(p, 0.3), tail(p, 0, 100)]} />
    <Sheet p={p} th={p.t * 1.6} bg={gr(p, tint(p.hi, 0.95), tint(p.lo, 0.3))} masks={[bell(p, 0.7), tail(p, 20, 100)]} />
    <Sheet p={p} th={1} bg={WHITE(0.9)} masks={[tail(p, 10, 80)]} />
    <span style={glowDot(p, 0, p.t * 7, p.hi, anim(p.live, 'fw-ce-breath', 3600, { loop: true }))} />
    <span style={glowDot(p, 0, p.t * 2.4, WHITE(1))} />
  </Root>
);

/** R05 Light leak: an anamorphic streak with a hot centre and soft ghosts either side, as a lens catches a lamp. */
export const R05: FC<RayProps> = (p) => {
  const h = isH(p);
  const streak: CSSProperties = h
    ? { position: 'absolute', left: '4%', width: '92%', top: '50%', height: p.t * 5, marginTop: -p.t * 2.5 }
    : { position: 'absolute', bottom: '4%', height: '92%', left: '50%', width: p.t * 5, marginLeft: -p.t * 2.5 };
  return (
    <Root p={p}>
      <span aria-hidden style={{ ...streak, background: `radial-gradient(ellipse at center, ${WHITE(0.95)} 0, ${tint(p.hi, 0.6)} 14%, ${tint(p.c, 0.22)} 42%, ${tint(p.c, 0)} 72%)` }} />
      <Sheet p={p} th={1.2} bg={WHITE(0.8)} masks={[ends(p, 18, 82)]} />
      {[14, 28, 76, 90].map((at, i) => (
        <span key={at} style={glowDot(p, at, p.t * (3.4 - i * 0.5), i % 2 ? p.hi : p.lo, { opacity: 0.5 })} />
      ))}
    </Root>
  );
};

/** R06 Glass beam: a pale glass tube with the colour bleeding in along its length, a sheen on top and a soft shadow under it. */
export const R06: FC<RayProps> = (p) => (
  <Root p={p}>
    <Sheet p={p} th={p.t * 5} off={p.t * 2.4} bg={tint(p.lo, 0.3)} masks={[bell(p, 0.2), ends(p, 6, 94)]} />
    <Sheet p={p} th={p.t * 4} bg={glassN(0.16)} radius masks={[ends(p, 2, 98)]} />
    <Sheet p={p} th={p.t * 1.5} bg={gr(p, tint(p.c, 0.04), tint(p.hi, 0.97))} radius masks={[ends(p, 2, 98)]} />
    <Sheet p={p} th={p.t * 0.6} off={-p.t * 1.1} bg={glassN(0.45)} radius masks={[ends(p, 8, 92)]} />
  </Root>
);

/** R07 Cutlass: a saber without hard edges: the blade is an airbrush with a soft white-hot core, a slim hilt, and a gentle hum. */
export const R07: FC<RayProps> = (p) => {
  const metal = `linear-gradient(${acrossDir(p)}, #3b4252, #d7dce5 38%, #8f98a8 60%, #2f3542)`;
  const hum = anim(p.live, 'fw-ce-lit', 1700, { loop: true });
  return (
    <Root p={p}>
      <Sheet p={p} th={p.t * 12} bg={tint(p.c, 0.3)} masks={[bell(p, 0.22), ends(p, 18, 100)]} from={12} extra={hum} />
      <Sheet p={p} th={p.t * 5} bg={gr(p, tint(p.hi, 0.6), tint(p.lo, 0.6))} masks={[bell(p, 0.35)]} from={12} />
      <Sheet p={p} th={p.t * 2.4} bg={gr(p, hot(p.hi), hot(p.c, 0.9))} radius from={12} />
      <Sheet p={p} th={p.t * 1.2} bg={WHITE(1)} radius from={12} />
      <Sheet p={p} th={p.t * 2.4} bg={metal} to={12} extra={{ borderRadius: 2 }} />
    </Root>
  );
};

/** R08 Full dissolve: a solid line that breaks into dashes, then dots, then a drift of stars, and then is gone. */
export const R08: FC<RayProps> = (p) => (
  <Root p={p}>
    <Sheet p={p} th={p.t * 5} bg={tint(p.c, 0.22)} masks={[bell(p, 0.3), tail(p, 20, 100)]} to={60} />
    <Sheet p={p} th={p.t * 1.5} bg={gr(p, p.hi, p.c)} radius to={32} />
    <Sheet p={p} th={p.t * 1.4} bg={tint(p.c, 0.9)} masks={[dashes(p, 14, 6)]} from={32} to={52} />
    <Sheet p={p} th={p.t * 1.2} bg={tint(p.c, 0.75)} masks={[dashes(p, 3, 9)]} from={52} to={68} />
    <span aria-hidden style={slab(p, { ...starLayer(p, starField(p, { n: 40, tile: p.len * 0.34, spread: p.box * 0.4, seed: p.seed + 9, tintEvery: 3 }), p.len * 0.34), ...mask(tail(p, 0, 100)) }, 66, 100)} />
  </Root>
);

/** R09 Breathing line: an airbrush line that brightens and dims slowly, with a soft pulse of light passing through it. */
export const R09: FC<RayProps> = (p) => (
  <Root p={p}>
    <Sheet p={p} th={p.t * 6.5} bg={gr(p, tint(p.hi, 0.45), tint(p.lo, 0.45))} masks={[bell(p, 0.3), ends(p, 8, 92)]} extra={anim(p.live, 'fw-ce-lit', 3800, { loop: true })} />
    <Sheet p={p} th={p.t * 1.8} bg={gr(p, hot(p.hi, 0.9), hot(p.lo, 0.9))} masks={[bell(p, 0.55), ends(p, 6, 94)]} />
    <Runner p={p} seg={p.len * 0.3} dur={4200} style={{ ...mask(ends(p, 8, 92)) }}>
      <span aria-hidden style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at center, ${WHITE(0.85)} 0, ${tint(p.hi, 0.4)} 34%, ${tint(p.hi, 0)} 70%)` }} />
    </Runner>
  </Root>
);

/** R10 Starlit ray: an airbrush glow with a dense field of stars through it, a thread of dust, and a couple of stars that glint. */
export const R10: FC<RayProps> = (p) => (
  <Root p={p}>
    <Sheet p={p} th={p.t * 7} bg={gr(p, tint(p.hi, 0.42), tint(p.lo, 0.42))} masks={[bell(p, 0.3), ends(p, 8, 92)]} />
    <span aria-hidden style={starLayer(p, starField(p, { n: 90, tile: p.len, spread: p.box * 0.4, seed: p.seed + 21, tintEvery: 4 }), p.len, 0, mask(ends(p, 8, 92)))} />
    <Sheet p={p} th={p.t * 1.1} bg={WHITE(0.7)} masks={[bell(p, 0.6), ends(p, 14, 86)]} />
    {[34, 68].map((at, i) => {
      const x = isH(p) ? `${at}%` : '50%';
      const y = isH(p) ? '50%' : `${100 - at}%`;
      return <Sparkle key={at} size={p.t * 4} hue={p.hi} x={x} y={y} style={{ transform: 'scale(0.9)', ...anim(p.live, 'fw-ce-twinkle-slow', 3000, { loop: true, delay: -i * 1400 }) }} />;
    })}
  </Root>
);

export const BEST_LINES: Record<string, FC<RayProps>> = { R01, R02, R03, R04, R05, R06, R07, R08, R09, R10 };
export { shadowBlob, alongDir };
