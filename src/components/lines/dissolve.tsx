/**
 * File: src/components/lines/dissolve.tsx
 * Description: Group D of the Lines page (D01 to D10): how the light of a line dissipates. It fades, tapers, smokes, breaks into dashes and
 * dots, sheds particles, trails behind a comet, thins into sparks, rises like heat, ripples out, or frays into strands. All of it is
 * gradients, masks and tiny elements; the movement is transform and opacity only.
 */
import type { CSSProperties, FC } from 'react';
import { anim, bright, rand, tint } from '@/components/chartstudy/shared';
import { Root, Runner, Sheet, WHITE, alongDir, band, bell, dashes, ends, glowDot, gr, hot, isH, tail } from './kit';
import type { RayProps } from './kit';

/** D01 Fade out: a tube that is strong where it starts and gone before it ends. */
export const D01: FC<RayProps> = (p) => (
  <Root p={p}>
    <Sheet p={p} th={p.t * 6} bg={tint(p.hi, 0.35)} masks={[bell(p, 0.25), tail(p, 10, 100)]} />
    <Sheet p={p} th={p.t * 1.5} bg={gr(p, tint(p.hi, 0.95), tint(p.lo, 0.9))} radius masks={[tail(p, 25, 100)]} />
    <Sheet p={p} th={p.t * 0.6} bg={WHITE(0.97)} radius masks={[tail(p, 15, 70)]} />
  </Root>
);

/** D02 Lens: a hairline that is brightest in the middle and thins out at both ends. */
export const D02: FC<RayProps> = (p) => (
  <Root p={p}>
    <Sheet p={p} th={p.t * 3} bg={tint(p.c, 0.3)} masks={[bell(p, 0.3), ends(p, 40, 60)]} />
    <Sheet p={p} th={1.4} bg={WHITE(0.95)} masks={[ends(p, 38, 62)]} />
    <Sheet p={p} th={p.t * 0.7} bg={tint(p.hi, 0.9)} masks={[ends(p, 28, 72)]} />
  </Root>
);

/** D03 Smoke: four layers, each shorter and wider than the one before, so the light disperses in steps. */
export const D03: FC<RayProps> = (p) => (
  <Root p={p}>
    {[0, 1, 2, 3].map((i) => (
      <Sheet key={i} p={p} th={p.t * (1.6 + i * 2.2)} bg={tint(i % 2 ? p.lo : p.hi, 0.5 - i * 0.08)} masks={[bell(p, 0.35), tail(p, 4, 100 - i * 14)]} to={100 - i * 6} />
    ))}
    <Sheet p={p} th={p.t * 0.7} bg={WHITE(0.95)} radius masks={[tail(p, 30, 80)]} />
  </Root>
);

/** D04 Dissolve: a solid line that breaks into long dashes, short dashes, then dots, then nothing. */
export const D04: FC<RayProps> = (p) => (
  <Root p={p}>
    <Sheet p={p} th={p.t * 1.6} bg={gr(p, p.hi, p.c)} radius to={38} />
    <Sheet p={p} th={p.t * 1.5} bg={tint(p.c, 0.9)} masks={[dashes(p, 16, 6)]} from={38} to={62} />
    <Sheet p={p} th={p.t * 1.3} bg={tint(p.c, 0.75)} masks={[dashes(p, 6, 9)]} from={62} to={82} />
    <Sheet p={p} th={p.t * 1.1} bg={tint(p.c, 0.55)} masks={[dashes(p, 2, 12)]} from={82} to={100} />
  </Root>
);

/** D05 Shed: the line sheds bright particles that drift off sideways and thin out. */
export const D05: FC<RayProps> = (p) => {
  const h = isH(p);
  return (
    <Root p={p}>
      <Sheet p={p} th={p.t * 5} bg={tint(p.c, 0.28)} masks={[bell(p, 0.3), tail(p, 20, 100)]} />
      <Sheet p={p} th={p.t * 1.3} bg={tint(p.hi, 0.95)} radius masks={[tail(p, 30, 90)]} />
      {Array.from({ length: 14 }, (_, i) => {
        const at = 6 + rand(i, p.seed) * 70;
        const side = i % 2 ? 1 : -1;
        const drift = (10 + rand(i, p.seed + 1) * 16) * side;
        const run = 6 + rand(i, p.seed + 2) * 14;
        const dur = 2400 + rand(i, p.seed + 3) * 1800;
        const style = {
          '--dx': `${h ? run : drift}px`,
          '--dy': `${h ? drift : -run}px`,
          ...(p.live ? anim(p.live, 'fw-ln-shed', dur, { loop: true, delay: -rand(i, p.seed + 4) * dur, ease: 'ease-out' }) : { opacity: 0.6 }),
        } as CSSProperties;
        return <span key={i} style={glowDot(p, at, 2 + rand(i, p.seed + 5) * 2.4, WHITE(1), style)} />;
      })}
    </Root>
  );
};

/** D06 Comet: a bright head at one end and a long tail that fades behind it. */
export const D06: FC<RayProps> = (p) => (
  <Root p={p}>
    <Sheet p={p} th={p.t * 4} bg={`linear-gradient(${alongDir(p)}, transparent, ${tint(p.hi, 0.35)})`} masks={[bell(p, 0.3)]} to={94} />
    <Sheet p={p} th={p.t * 1.2} bg={`linear-gradient(${alongDir(p)}, transparent, ${tint(p.hi, 0.9)} 70%, ${WHITE(1)})`} radius to={95} />
    <span style={glowDot(p, 95, p.t * 6, p.hi, anim(p.live, 'fw-ce-lit', 2200, { loop: true }))} />
    <span style={glowDot(p, 95, p.t * 2.2, WHITE(1))} />
  </Root>
);

/** D07 Spark trail: the line thins into sparks, each smaller and fainter than the one before. */
export const D07: FC<RayProps> = (p) => (
  <Root p={p}>
    <Sheet p={p} th={1.2} bg={gr(p, tint(p.hi, 0.7), tint(p.lo, 0))} masks={[tail(p, 0, 50)]} to={55} />
    {Array.from({ length: 13 }, (_, i) => {
      const k = i / 12;
      const at = 8 + k * 88;
      const across = (rand(i, p.seed) - 0.5) * p.t * 1.6 * (0.3 + k);
      const col = tint(i % 3 ? p.hi : WHITE(1), 1 - k * 0.8);
      const style: CSSProperties = isH(p) ? { marginTop: across - (p.t * 2.2 * (1 - k * 0.7)) / 2 } : { marginLeft: across - (p.t * 2.2 * (1 - k * 0.7)) / 2 };
      return <span key={i} style={glowDot(p, at, p.t * 2.2 * (1 - k * 0.7), col, style)} />;
    })}
  </Root>
);

/** D08 Evaporate: copies of the line lift off it, one after another, and vanish like heat. */
export const D08: FC<RayProps> = (p) => {
  const h = isH(p);
  return (
    <Root p={p}>
      <Sheet p={p} th={p.t * 1.5} bg={gr(p, tint(p.hi, 0.95), tint(p.lo, 0.95))} radius masks={[ends(p, 6, 94)]} />
      <Sheet p={p} th={p.t * 5} bg={tint(p.c, 0.22)} masks={[bell(p, 0.3), ends(p, 6, 94)]} />
      {[0, 1, 2].map((i) => {
        const lift = (p.t * (3 + i * 2.4)) * (h ? -1 : 1);
        const style = { '--dx': `${h ? 0 : lift}px`, '--dy': `${h ? lift : 0}px`, ...(p.live ? anim(p.live, 'fw-ln-shed', 3000, { loop: true, delay: -i * 1000, ease: 'ease-out' }) : { opacity: 0.25 }) } as CSSProperties;
        return <Sheet key={i} p={p} th={p.t * 1.1} bg={tint(p.hi, 0.7)} radius masks={[ends(p, 14, 86)]} extra={style} />;
      })}
    </Root>
  );
};

/** D09 Ripple: a soft pulse runs along a hairline and dissolves into nothing at both ends. */
export const D09: FC<RayProps> = (p) => (
  <Root p={p}>
    <Sheet p={p} th={1} bg={tint(p.c, 0.5)} masks={[ends(p, 10, 90)]} />
    <Runner p={p} seg={p.len * 0.34} dur={3600} style={{ maskImage: ends(p, 10, 90), WebkitMaskImage: ends(p, 10, 90) }}>
      <span style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at center, ${WHITE(0.9)} 0, ${tint(p.hi, 0.5)} 30%, ${tint(p.hi, 0)} 70%)` }} />
    </Runner>
  </Root>
);

/** D10 Fray: one line that splits into thin strands, which fan out and fade. */
export const D10: FC<RayProps> = (p) => {
  const h = isH(p);
  const strands = [-13, -7, -2.5, 2.5, 7, 13];
  return (
    <Root p={p}>
      <Sheet p={p} th={p.t * 5} bg={tint(p.c, 0.28)} masks={[bell(p, 0.3), ends(p, 4, 60)]} to={64} />
      <Sheet p={p} th={p.t * 1.5} bg={gr(p, p.hi, p.c)} radius to={62} />
      {strands.map((deg, i) => {
        const len = (0.34 + rand(i, p.seed) * 0.2) * p.len;
        const style: CSSProperties = h
          ? { position: 'absolute', left: '62%', top: '50%', width: len, height: p.t * 0.9, marginTop: -p.t * 0.45, transformOrigin: '0 50%', transform: `rotate(${deg}deg)` }
          : { position: 'absolute', left: '50%', bottom: '62%', height: len, width: p.t * 0.9, marginLeft: -p.t * 0.45, transformOrigin: '50% 100%', transform: `rotate(${deg}deg)` };
        return <span key={i} aria-hidden style={{ ...style, borderRadius: 99, background: `linear-gradient(${alongDir(p)}, ${tint(i % 2 ? p.hi : bright(p.c, 0.4), 0.9)}, transparent)` }} />;
      })}
    </Root>
  );
};

export const DISSOLVE_LINES: Record<string, FC<RayProps>> = { D01, D02, D03, D04, D05, D06, D07, D08, D09, D10 };
export { band, hot };
