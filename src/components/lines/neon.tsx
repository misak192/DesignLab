/**
 * File: src/components/lines/neon.tsx
 * Description: Groups N (N01 to N10, neon and cyberpunk) and L (L01 to L10, lasers and sabers) of the Lines page. Neon is a hard bright
 * tube with a halo of stacked soft layers; the cyberpunk ones split it into colours, scan it or glitch it; a laser is a thin hot core with
 * a flare where it lands; a saber is a white blade in a coloured glow with a hilt. The halo is always soft layers, never a blur filter.
 */
import type { CSSProperties, FC } from 'react';
import { anim, tint, PALETTE, rand } from '@/components/chartstudy/shared';
import { Root, Runner, Sheet, WHITE, acrossDir, alongDir, band, bell, dashes, ends, glowDot, gr, hot, isH, slab, tail } from './kit';
import type { RayProps } from './kit';

/** The halo of a tube: three soft layers, wide and faint to narrow. */
function Halo({ p, c, c2, k = 1, style }: { p: RayProps; c: string; c2?: string; k?: number; style?: CSSProperties }) {
  // With a second colour the halo runs from one cousin to the other along the line, so Shift shows.
  const fill = (a: number) => (c2 ? gr(p, tint(c, a), tint(c2, a)) : tint(c, a));
  return (
    <>
      <Sheet p={p} th={p.t * 10 * k} bg={fill(0.16)} masks={[bell(p, 0.15), ends(p, 4, 96)]} extra={style} />
      <Sheet p={p} th={p.t * 5 * k} bg={fill(0.3)} masks={[bell(p, 0.3), ends(p, 3, 97)]} extra={style} />
    </>
  );
}

/** A tube: a coloured pill with a white-hot core. */
function Tube({ p, c, c2, th = 1.7, off = 0, from, to, style }: { p: RayProps; c: string; c2?: string; th?: number; off?: number; from?: number; to?: number; style?: CSSProperties }) {
  return (
    <>
      <Sheet p={p} th={p.t * th} bg={c2 ? gr(p, tint(c, 0.95), tint(c2, 0.95)) : tint(c, 0.95)} radius off={off} from={from} to={to} extra={style} />
      <Sheet p={p} th={p.t * th * 0.42} bg={WHITE(0.97)} radius off={off} from={from} to={to} extra={style} />
    </>
  );
}

/* ── N: neon and cyberpunk ──────────────────────────────────────────────────────────────────────────────────────── */

/** N01 Neon tube: a coloured tube, a white-hot core, a halo. */
export const N01: FC<RayProps> = (p) => (
  <Root p={p}>
    <Halo p={p} c={p.hi} c2={p.lo} />
    <Tube p={p} c={p.hi} c2={p.lo} />
  </Root>
);

/** N02 Double neon: two tubes side by side, the lighter and the deeper cousin. */
export const N02: FC<RayProps> = (p) => (
  <Root p={p}>
    <Halo p={p} c={p.hi} c2={p.lo} />
    <Tube p={p} c={p.hi} th={1.2} off={-p.t * 1.5} />
    <Tube p={p} c={p.lo} th={1.2} off={p.t * 1.5} />
  </Root>
);

/** N03 Flicker: a neon tube whose halo stutters like a failing transformer. */
export const N03: FC<RayProps> = (p) => (
  <Root p={p}>
    <Halo p={p} c={p.hi} c2={p.lo} style={anim(p.live, 'fw-ce-zap', 3400, { loop: true })} />
    <Tube p={p} c={p.hi} c2={p.lo} style={anim(p.live, 'fw-ce-zap', 3400, { loop: true, delay: -300 })} />
  </Root>
);

/** N04 Magenta and cyan: the cyberpunk split, with a halo of each colour on its own side. */
export const N04: FC<RayProps> = (p) => (
  <Root p={p}>
    <Sheet p={p} th={p.t * 8} off={-p.t * 1.2} bg={tint(PALETTE.magenta, 0.28)} masks={[bell(p, 0.25), ends(p, 4, 96)]} />
    <Sheet p={p} th={p.t * 8} off={p.t * 1.2} bg={tint(PALETTE.cyan, 0.28)} masks={[bell(p, 0.25), ends(p, 4, 96)]} />
    <Sheet p={p} th={p.t * 1.6} bg={gr(p, PALETTE.magenta, PALETTE.cyan)} radius />
    <Sheet p={p} th={p.t * 0.7} bg={WHITE(0.97)} radius />
  </Root>
);

/** N05 Glitch: the colour channels pull apart, and two stretches jump sideways now and then. */
export const N05: FC<RayProps> = (p) => {
  const h = isH(p);
  const jump = (n: number): CSSProperties =>
    ({ '--gx': `${h ? 0 : n}px`, '--gy': `${h ? n : 0}px`, ...anim(p.live, 'fw-ln-glitch', 2600, { loop: true, delay: -n * 90, ease: 'steps(1)' }) }) as CSSProperties;
  return (
    <Root p={p}>
      <Sheet p={p} th={p.t * 0.9} off={-p.t * 0.9} bg={tint(PALETTE.magenta, 0.9)} masks={[ends(p, 3, 97)]} />
      <Sheet p={p} th={p.t * 0.9} off={p.t * 0.9} bg={tint(PALETTE.cyan, 0.9)} masks={[ends(p, 3, 97)]} />
      <Sheet p={p} th={p.t * 0.7} bg={WHITE(0.95)} masks={[ends(p, 3, 97)]} />
      <Sheet p={p} th={p.t * 1.1} off={-p.t * 1.7} bg={tint(PALETTE.cyan, 0.95)} from={22} to={36} extra={jump(6)} />
      <Sheet p={p} th={p.t * 1.1} off={p.t * 1.7} bg={tint(PALETTE.magenta, 0.95)} from={58} to={74} extra={jump(-7)} />
    </Root>
  );
};

/** N06 Hologram: a band of light cut by scanlines, flickering faintly. */
export const N06: FC<RayProps> = (p) => (
  <Root p={p}>
    <Sheet
      p={p}
      th={p.t * 4.4}
      bg={gr(p, tint(p.hi, 0.85), tint(p.lo, 0.85))}
      masks={[bell(p, 0.5), ends(p, 8, 92), `repeating-linear-gradient(${acrossDir(p)}, #000 0 2px, transparent 2px 4px)`]}
      extra={anim(p.live, 'fw-ce-lit', 2200, { loop: true })}
    />
    <Sheet p={p} th={1} bg={WHITE(0.9)} masks={[ends(p, 6, 94)]} />
  </Root>
);

/** N07 Circuit trace: a line of dashes that ends in nodes. */
export const N07: FC<RayProps> = (p) => (
  <Root p={p}>
    <Sheet p={p} th={p.t * 0.8} bg={tint(p.c, 0.95)} masks={[dashes(p, 16, 5)]} />
    {[3, 42, 97].map((at) => (
      <span key={at} style={glowDot(p, at, p.t * 3.6, p.hi)} />
    ))}
    {[3, 42, 97].map((at) => (
      <span key={`c${at}`} style={glowDot(p, at, p.t * 1.1, WHITE(1))} />
    ))}
  </Root>
);

/** N08 HUD line: a thin line with end blocks and a ruler of ticks. */
export const N08: FC<RayProps> = (p) => {
  const h = isH(p);
  const end = (at: number): CSSProperties =>
    h ? { position: 'absolute', left: `${at}%`, top: '50%', width: 3, height: p.t * 4, marginLeft: -1.5, marginTop: -p.t * 2, background: tint(p.hi, 0.95) } : { position: 'absolute', bottom: `${at}%`, left: '50%', height: 3, width: p.t * 4, marginBottom: -1.5, marginLeft: -p.t * 2, background: tint(p.hi, 0.95) };
  return (
    <Root p={p}>
      <Sheet p={p} th={1.5} bg={tint(p.hi, 0.9)} />
      <Sheet p={p} th={p.t * 2} off={p.t * 1.5} bg={tint(p.c, 0.7)} masks={[`repeating-linear-gradient(${alongDir(p)}, #000 0 1px, transparent 1px 10px)`, ends(p, 10, 90)]} />
      <span aria-hidden style={end(0)} />
      <span aria-hidden style={end(100)} />
    </Root>
  );
};

/** N09 Neon pulse: a neon tube with a bright charge running along it. */
export const N09: FC<RayProps> = (p) => (
  <Root p={p}>
    <Halo p={p} c={p.hi} c2={p.lo} />
    <Tube p={p} c={p.hi} c2={p.lo} />
    <Runner p={p} seg={p.len * 0.22} dur={2600}>
      <span style={{ position: 'absolute', inset: 0, background: `linear-gradient(${alongDir(p)}, transparent, ${WHITE(0.9)} 70%, transparent)`, ...bandMask(p) }} />
    </Runner>
  </Root>
);

/** A thin strip across the middle of a runner, so only the line is lit, not the whole box. */
function bandMask(p: RayProps): CSSProperties {
  const m = `linear-gradient(${acrossDir(p)}, transparent 36%, #000 46%, #000 54%, transparent 64%)`;
  return { maskImage: m, WebkitMaskImage: m };
}

/** N10 Gradient neon: the shifted gradient as a tube, so one tube runs from one cousin to the other. */
export const N10: FC<RayProps> = (p) => (
  <Root p={p}>
    <Sheet p={p} th={p.t * 9} bg={gr(p, tint(p.hi, 0.2), tint(p.lo, 0.2))} masks={[bell(p, 0.15), ends(p, 4, 96)]} />
    <Sheet p={p} th={p.t * 4.6} bg={gr(p, tint(p.hi, 0.34), tint(p.lo, 0.34))} masks={[bell(p, 0.3), ends(p, 3, 97)]} />
    <Sheet p={p} th={p.t * 1.7} bg={gr(p, p.hi, p.lo)} radius />
    <Sheet p={p} th={p.t * 0.7} bg={WHITE(0.95)} radius />
  </Root>
);

/* ── L: lasers and sabers ───────────────────────────────────────────────────────────────────────────────────────── */

/** A hilt: a short metal cylinder with two dark rings, between `from` and `to` percent. */
function Hilt({ p, from, to }: { p: RayProps; from: number; to: number }) {
  const metal = `linear-gradient(${acrossDir(p)}, #3b4252, #d7dce5 38%, #8f98a8 60%, #2f3542)`;
  return (
    <>
      <Sheet p={p} th={p.t * 2.8} bg={metal} from={from} to={to} extra={{ borderRadius: 2 }} />
      <Sheet p={p} th={p.t * 3} bg={`repeating-linear-gradient(${alongDir(p)}, transparent 0 ${Math.max(4, p.len * 0.014)}px, rgba(10,12,18,0.85) ${Math.max(4, p.len * 0.014)}px ${Math.max(6, p.len * 0.02)}px)`} from={from} to={to} />
    </>
  );
}

/** A blade of light between `from` and `to` percent: glow, coloured body, white core. */
function Blade({ p, c, c2, from, to, soft = false }: { p: RayProps; c: string; c2?: string; from: number; to: number; soft?: boolean }) {
  const fill = (a: number) => (c2 ? gr(p, tint(c, a), tint(c2, a)) : tint(c, a));
  return (
    <>
      <Sheet p={p} th={p.t * 11} bg={fill(0.16)} masks={[bell(p, 0.2)]} from={from} to={to} />
      <Sheet p={p} th={p.t * 6} bg={fill(0.32)} masks={[bell(p, 0.35)]} from={from} to={to} />
      <Sheet p={p} th={p.t * 2.8} bg={fill(0.95)} radius from={from} to={to} extra={soft ? { opacity: 0.85 } : undefined} />
      <Sheet p={p} th={p.t * 1.5} bg={WHITE(0.98)} radius from={from} to={to} />
    </>
  );
}

/** L01 Lightsaber: a hilt and a blade, a white core in a coloured glow. */
export const L01: FC<RayProps> = (p) => (
  <Root p={p}>
    <Blade p={p} c={p.hi} c2={p.lo} from={14} to={100} />
    <Hilt p={p} from={0} to={14} />
  </Root>
);

/** L02 Double saber: a hilt in the middle and a blade out of each end, in the colour and its lighter cousin. */
export const L02: FC<RayProps> = (p) => (
  <Root p={p}>
    <Blade p={p} c={p.lo} from={0} to={43} />
    <Blade p={p} c={p.hi} from={57} to={100} />
    <Hilt p={p} from={43} to={57} />
  </Root>
);

/** L03 Laser: a thin hot beam that lands with a flare at its end. */
export const L03: FC<RayProps> = (p) => (
  <Root p={p}>
    <Sheet p={p} th={p.t * 4} bg={tint(p.c, 0.28)} masks={[bell(p, 0.3), tail(p, 70, 100)]} to={96} />
    <Sheet p={p} th={p.t * 0.9} bg={tint(p.c, 0.95)} radius to={97} />
    <Sheet p={p} th={p.t * 0.4} bg={WHITE(0.98)} radius to={97} />
    <span style={glowDot(p, 97, p.t * 7, p.hi)} />
    <span style={glowDot(p, 97, p.t * 2.4, WHITE(1))} />
  </Root>
);

/** L04 Anamorphic flare: a hairline with a wide streak of light across its middle and ghosts of the lens. */
export const L04: FC<RayProps> = (p) => {
  const h = isH(p);
  const streak: CSSProperties = h
    ? { position: 'absolute', left: '18%', width: '64%', top: '50%', height: p.t * 3, marginTop: -p.t * 1.5 }
    : { position: 'absolute', bottom: '18%', height: '64%', left: '50%', width: p.t * 3, marginLeft: -p.t * 1.5 };
  return (
    <Root p={p}>
      <Sheet p={p} th={1.2} bg={tint(p.c, 0.8)} masks={[ends(p, 8, 92)]} />
      <span aria-hidden style={{ ...streak, background: `radial-gradient(ellipse at center, ${WHITE(0.95)} 0, ${tint(p.hi, 0.55)} 28%, ${tint(p.c, 0)} 70%)` }} />
      {[24, 70, 86].map((at, i) => (
        <span key={at} style={glowDot(p, at, p.t * (3 - i * 0.6), p.lo, { opacity: 0.6 })} />
      ))}
    </Root>
  );
};

/** L05 Bolt train: short bolts of light shot along a faint rail, one after another. */
export const L05: FC<RayProps> = (p) => (
  <Root p={p}>
    <Sheet p={p} th={1} bg={tint(p.c, 0.35)} masks={[ends(p, 4, 96)]} />
    {[0, 1, 2].map((i) => (
      <Runner key={i} p={p} seg={p.len * 0.14} dur={2400} delay={-i * 800} rest={0.2 + i * 0.3}>
        <span style={{ position: 'absolute', inset: 0, background: `linear-gradient(${alongDir(p)}, transparent, ${tint(p.hi, 0.9)} 55%, ${WHITE(1)})`, ...bandMask(p) }} />
      </Runner>
    ))}
  </Root>
);

/** L06 Plasma: a thick beam whose light surges in bands as it passes. */
export const L06: FC<RayProps> = (p) => (
  <Root p={p}>
    <Sheet p={p} th={p.t * 6} bg={gr(p, tint(p.hi, 0.8), tint(p.lo, 0.8))} masks={[bell(p, 0.35), `repeating-linear-gradient(${alongDir(p)}, #000 0, rgba(0,0,0,0.35) 11px, #000 22px)`, ends(p, 3, 97)]} extra={anim(p.live, 'fw-ce-lit', 1800, { loop: true })} />
    <Sheet p={p} th={p.t * 1.6} bg={WHITE(0.9)} radius masks={[ends(p, 4, 96)]} />
  </Root>
);

/** L07 Scanner: a line of light that sweeps back and forth across its own width, leaving a trail. */
export const L07: FC<RayProps> = (p) => {
  const h = isH(p);
  const r = p.box * 0.6;
  const sweep = { '--sx0': h ? '0px' : `${-r}px`, '--sy0': h ? `${-r}px` : '0px', '--sx1': h ? '0px' : `${r}px`, '--sy1': h ? `${r}px` : '0px', position: 'absolute', inset: 0, ...anim(p.live, 'fw-ln-sweep', 3200, { loop: true }) } as CSSProperties;
  return (
    <Root p={p}>
      <span aria-hidden style={sweep}>
        <Sheet p={p} th={p.t * 6} bg={`linear-gradient(${acrossDir(p)}, ${tint(p.c, 0)}, ${tint(p.c, 0.28)} 90%, ${tint(p.c, 0)})`} masks={[ends(p, 6, 94)]} />
        <Sheet p={p} th={p.t * 1.2} bg={tint(p.hi, 0.97)} radius masks={[ends(p, 4, 96)]} />
        <Sheet p={p} th={p.t * 0.5} bg={WHITE(0.98)} radius masks={[ends(p, 4, 96)]} />
      </span>
    </Root>
  );
};

/** L08 Spotlight: a cone of light that widens as it travels and thins out. */
export const L08: FC<RayProps> = (p) => {
  const h = isH(p);
  const cone = h ? 'polygon(0% 44%, 100% 0%, 100% 100%, 0% 56%)' : 'polygon(44% 100%, 0% 0%, 100% 0%, 56% 100%)';
  return (
    <Root p={p}>
      <span aria-hidden style={{ ...slab(p), clipPath: cone, background: `linear-gradient(${alongDir(p)}, ${tint(p.hi, 0.7)}, ${tint(p.lo, 0.12)} 85%, transparent)` }} />
      <Sheet p={p} th={p.t * 0.7} bg={WHITE(0.95)} radius masks={[tail(p, 0, 70)]} />
      <span style={glowDot(p, 0, p.t * 4, p.hi)} />
    </Root>
  );
};

/** L09 God rays: thin beams fanning out from one point, each of its own length and strength. */
export const L09: FC<RayProps> = (p) => {
  const h = isH(p);
  const rays = [-17, -10, -4, 0, 5, 11, 18];
  return (
    <Root p={p}>
      {rays.map((deg, i) => {
        const k = 0.55 + rand(i, p.seed) * 0.45;
        const style: CSSProperties = h
          ? { position: 'absolute', left: 0, top: '50%', width: p.len * k, height: p.t * 1.1, marginTop: -p.t * 0.55, transformOrigin: '0 50%', transform: `rotate(${deg}deg)` }
          : { position: 'absolute', left: '50%', bottom: 0, height: p.len * k, width: p.t * 1.1, marginLeft: -p.t * 0.55, transformOrigin: '50% 100%', transform: `rotate(${deg}deg)` };
        return <span key={i} aria-hidden style={{ ...style, background: `linear-gradient(${alongDir(p)}, ${tint(i % 2 ? p.hi : p.c, 0.85)}, transparent)`, borderRadius: 99 }} />;
      })}
      <span style={glowDot(p, 0, p.t * 4, WHITE(1))} />
    </Root>
  );
};

/** L10 Blade: a thin tapered blade of light with a sharp bright edge, like a katana catching a lamp. */
export const L10: FC<RayProps> = (p) => {
  const h = isH(p);
  const taper = h ? 'polygon(0% 12%, 90% 40%, 100% 50%, 90% 60%, 0% 88%)' : 'polygon(12% 100%, 40% 10%, 50% 0%, 60% 10%, 88% 100%)';
  return (
    <Root p={p}>
      <Sheet p={p} th={p.t * 7} bg={tint(p.c, 0.2)} masks={[bell(p, 0.15), ends(p, 2, 90)]} />
      <span aria-hidden style={{ ...band(p, p.t * 2.8), clipPath: taper, background: `linear-gradient(${acrossDir(p)}, ${WHITE(1)} 0 14%, ${tint(p.hi, 0.97)} 14% 52%, ${tint(p.deep, 0.97)})` }} />
    </Root>
  );
};

export const NEON_LINES: Record<string, FC<RayProps>> = { N01, N02, N03, N04, N05, N06, N07, N08, N09, N10, L01, L02, L03, L04, L05, L06, L07, L08, L09, L10 };
// `hot` and `dashes` are re-exported for the groups that follow.
export { hot };
