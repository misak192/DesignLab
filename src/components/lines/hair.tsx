/**
 * File: src/components/lines/hair.tsx
 * Description: Group H of the Lines page (H01 to H10): hairlines and lit lines. Thin lines are what most of a timeline is made of, so these
 * are the quiet ones: a hairline, a gradient hairline, one with a light that travels along it, beads, a ruler, a double line, the event stem
 * of the timeline (with its dot), the "now" line that crosses the whole chart, a lit dash sequence and a glass line.
 */
import type { CSSProperties, FC } from 'react';
import { anim, tint } from '@/components/chartstudy/shared';
import { Root, Runner, Sheet, WHITE, acrossDir, alongDir, band, bell, ends, glowDot, gr, isH, tail } from './kit';
import type { RayProps } from './kit';
import { glassN } from '@/components/chartstudy/dots/blends';

/** H01 Hairline: one pixel, fading out at both ends. */
export const H01: FC<RayProps> = (p) => (
  <Root p={p}>
    <Sheet p={p} th={1} bg={tint(p.c, 0.9)} masks={[ends(p, 6, 94)]} />
  </Root>
);

/** H02 Gradient hairline: the shifted gradient, one colour to its cousin. */
export const H02: FC<RayProps> = (p) => (
  <Root p={p}>
    <Sheet p={p} th={1.6} bg={gr(p, p.hi, p.lo)} masks={[ends(p, 6, 94)]} />
  </Root>
);

/** H03 Travelling light: a faint hairline with a bright spark running along it. */
export const H03: FC<RayProps> = (p) => {
  const m = `linear-gradient(${acrossDir(p)}, transparent 34%, #000 46%, #000 54%, transparent 66%)`;
  return (
    <Root p={p}>
      <Sheet p={p} th={1} bg={tint(p.c, 0.4)} masks={[ends(p, 4, 96)]} />
      <Runner p={p} seg={p.len * 0.2} dur={2400}>
        <span aria-hidden style={{ position: 'absolute', inset: 0, background: `linear-gradient(${alongDir(p)}, transparent, ${tint(p.hi, 0.9)} 70%, ${WHITE(1)})`, maskImage: m, WebkitMaskImage: m }} />
      </Runner>
    </Root>
  );
};

/** H04 Beads: a hairline strung with small beads of light. */
export const H04: FC<RayProps> = (p) => {
  const bead = `radial-gradient(circle, ${tint(p.hi, 1)} 0 1.5px, ${tint(p.hi, 0.25)} 2.5px, transparent 3.6px)`;
  return (
    <Root p={p}>
      <Sheet p={p} th={1} bg={tint(p.c, 0.35)} masks={[ends(p, 4, 96)]} />
      <Sheet p={p} th={8} bg={bead} masks={[ends(p, 6, 94)]} extra={{ backgroundSize: isH(p) ? '14px 100%' : '100% 14px', backgroundRepeat: isH(p) ? 'repeat-x' : 'repeat-y' }} />
    </Root>
  );
};

/** H05 Ruler: a hairline with ticks, a long one every fifth. */
export const H05: FC<RayProps> = (p) => (
  <Root p={p}>
    <Sheet p={p} th={1} bg={tint(p.c, 0.7)} masks={[ends(p, 3, 97)]} />
    <Sheet p={p} th={p.t * 1.2} bg={tint(p.c, 0.8)} masks={[`repeating-linear-gradient(${alongDir(p)}, #000 0 1px, transparent 1px 8px)`, ends(p, 4, 96)]} />
    <Sheet p={p} th={p.t * 2.6} bg={tint(p.hi, 0.95)} masks={[`repeating-linear-gradient(${alongDir(p)}, #000 0 1px, transparent 1px 40px)`, ends(p, 4, 96)]} />
  </Root>
);

/** H06 Double line: two hairlines close together, the lighter and the deeper cousin. */
export const H06: FC<RayProps> = (p) => (
  <Root p={p}>
    <Sheet p={p} th={1} off={-p.t * 0.75} bg={tint(p.hi, 0.95)} masks={[ends(p, 6, 94)]} />
    <Sheet p={p} th={1} off={p.t * 0.75} bg={tint(p.lo, 0.9)} masks={[ends(p, 6, 94)]} />
  </Root>
);

/** H07 Event stem: the timeline's line from a date up to its words, with the dot it grows from and a faint glow along it. */
export const H07: FC<RayProps> = (p) => (
  <Root p={p}>
    <Sheet p={p} th={p.t * 3.4} bg={tint(p.c, 0.18)} masks={[bell(p, 0.4), tail(p, 20, 100)]} />
    <Sheet p={p} th={1.2} bg={gr(p, tint(p.hi, 0.95), tint(p.lo, 0.4))} />
    <span style={glowDot(p, 0, p.t * 4.6, p.hi)} />
    <span style={glowDot(p, 0, p.t * 1.9, WHITE(1))} />
  </Root>
);

/** H08 Now line: the thin line that crosses the whole chart at today, with a soft glow beside it and a diamond at its head. */
export const H08: FC<RayProps> = (p) => {
  const h = isH(p);
  const diamond: CSSProperties = h
    ? { position: 'absolute', right: -3, top: '50%', width: 7, height: 7, marginTop: -3.5, transform: 'rotate(45deg)' }
    : { position: 'absolute', top: -3, left: '50%', width: 7, height: 7, marginLeft: -3.5, transform: 'rotate(45deg)' };
  return (
    <Root p={p}>
      <Sheet p={p} th={p.t * 5} bg={tint(p.c, 0.22)} masks={[bell(p, 0.2)]} />
      <Sheet p={p} th={1} bg={tint(p.hi, 0.97)} />
      <span aria-hidden style={{ ...diamond, background: tint(p.hi, 1), boxShadow: `0 0 8px ${tint(p.hi, 0.8)}` }} />
    </Root>
  );
};

/** H09 Lit dashes: a row of dashes that light up one after another, like a runway. */
export const H09: FC<RayProps> = (p) => {
  const n = 9;
  const gap = 4;
  const each = (100 - gap * (n - 1)) / n;
  return (
    <Root p={p}>
      {Array.from({ length: n }, (_, i) => {
        const from = i * (each + gap);
        return <Sheet key={i} p={p} th={p.t * 1.1} bg={tint(p.hi, 0.95)} radius from={from} to={from + each} extra={p.live ? { ...anim(p.live, 'fw-ce-step', 3000, { loop: true, delay: i * 170, ease: 'ease-out' }) } : { opacity: 0.35 + (i % 3) * 0.2 }} />;
      })}
      <Sheet p={p} th={1} bg={tint(p.c, 0.22)} masks={[ends(p, 3, 97)]} />
    </Root>
  );
};

/** H10 Glass line: a pale glass tube with the colour bleeding into it along its length and a sheen on top. */
export const H10: FC<RayProps> = (p) => (
  <Root p={p}>
    <Sheet p={p} th={p.t * 3.4} bg={glassN(0.14)} radius masks={[ends(p, 2, 98)]} />
    <Sheet p={p} th={p.t * 1.1} bg={gr(p, tint(p.c, 0.04), p.c)} radius masks={[ends(p, 2, 98)]} />
    <Sheet p={p} th={p.t * 0.5} off={-p.t * 0.9} bg={glassN(0.4)} radius masks={[ends(p, 8, 92)]} />
  </Root>
);

export const HAIR_LINES: Record<string, FC<RayProps>> = { H01, H02, H03, H04, H05, H06, H07, H08, H09, H10 };
export { band, bell };
