/**
 * File: src/components/lines/veils/light.tsx
 * Description: Groups F, G and H of the Veils page (V37 to V56). F is light and colour: sunrise, light leak, prism, aurora curtains, god
 * rays, bokeh, film burn and a glowing bar. G is stars: starlit, dust, twinkling and drifting veils, and V49, a veil of stars you can press
 * to dissipate. H is the ones I would use: silk, aurora silk, glass aurora, ember, a soft highlighter, dusk glass and a halftone aurora.
 */
"use client";
import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, FC, KeyboardEvent } from 'react';
import { Sparkle, PALETTE, anim, bright, rand, tint } from '@/components/chartstudy/shared';
import { SHEEN, SHEEN_SOFT, glassN } from '@/components/chartstudy/dots/blends';
import { V, VRoot, Vp, WHITE, dots, fx, fy, gh, oval, starBlock, tiles, toB, toT } from './kit';
import type { VeilProps } from './kit';

const body = (p: VeilProps, a = 0.55) => gh(tint(p.hi, a), tint(p.lo, a));

/* ── F: light and colour ────────────────────────────────────────────────────────────────────────────────── */

/** V37 Sunrise: bands of amber, magenta and violet rising out of the bottom edge into nothing. */
export const V37: FC<VeilProps> = (p) => (
  <VRoot p={p}>
    <V bg={`linear-gradient(to top, ${tint(PALETTE.amber, 0.82)}, ${tint(PALETTE.magenta, 0.5)} 38%, ${tint(PALETTE.violet, 0.3)} 70%, transparent)`} masks={[fx(6, 94)]} />
  </VRoot>
);

/** V38 Light leak: warm light spilling in from the left edge, with a thin streak across it, as film is lit by a crack in the camera. */
export const V38: FC<VeilProps> = (p) => (
  <VRoot p={p}>
    <V bg={`radial-gradient(ellipse 62% 130% at 0% 50%, ${tint(PALETTE.amber, 0.82)}, ${tint(PALETTE.magenta, 0.38)} 42%, transparent 74%)`} />
    <Vp x={0} y={30} w={60} h={3} bg={WHITE(0.6)} masks={[`linear-gradient(to right, #000, transparent)`]} />
  </VRoot>
);

/** V39 Prism: three copies of the veil, the deeper cousin, the colour and the lighter cousin, laid a little apart. */
export const V39: FC<VeilProps> = (p) => (
  <VRoot p={p}>
    {[
      [-16, p.lo],
      [0, p.c],
      [16, p.hi],
    ].map(([dx, c]) => (
      <V key={String(dx)} bg={tint(String(c), 0.42)} masks={[fx(10, 90), fy(18, 82)]} inset={[18, 8]} extra={{ transform: `translateX(${dx}px)` }} />
    ))}
  </VRoot>
);

/** V40 Aurora curtains: soft vertical bands of changing colour hanging from the top, swaying a little. */
export const V40: FC<VeilProps> = (p) => (
  <VRoot p={p}>
    <V bg={`repeating-linear-gradient(90deg, ${tint(p.hi, 0.6)} 0 16px, ${tint(p.lo, 0.22)} 16px 34px, ${tint(p.c, 0.45)} 34px 52px)`} masks={[toB(0, 100), fx(4, 96)]} extra={anim(p.live, 'fw-ce-lit', 4800, { loop: true })} />
    <V bg={`repeating-linear-gradient(90deg, ${tint(p.lo, 0.45)} 0 12px, transparent 12px 40px)`} masks={[toB(0, 86), fx(8, 92)]} extra={anim(p.live, 'fw-ce-lit', 4800, { loop: true, delay: -2400 })} />
  </VRoot>
);

/** V41 God rays: slanting beams of light through a soft glow, strongest at the top. */
export const V41: FC<VeilProps> = (p) => (
  <VRoot p={p}>
    <V bg={tint(p.hi, 0.2)} masks={[toB(0, 100), fx(8, 92)]} />
    <V bg={`repeating-linear-gradient(105deg, ${WHITE(0.34)} 0 5px, transparent 5px 34px)`} masks={[toB(0, 100), fx(10, 90)]} />
  </VRoot>
);

/** V42 Bokeh: soft discs of out-of-focus light in the colour and its cousins. */
export const V42: FC<VeilProps> = (p) => {
  const discs = Array.from({ length: 10 }, (_, i) => {
    const x = 6 + rand(i, p.seed) * 88;
    const y = 18 + rand(i, p.seed + 1) * 64;
    const r = 8 + rand(i, p.seed + 2) * 20;
    const col = i % 3 === 0 ? p.hi : i % 3 === 1 ? p.lo : p.c;
    const a = 0.22 + rand(i, p.seed + 3) * 0.34;
    return `radial-gradient(circle at ${x.toFixed(1)}% ${y.toFixed(1)}%, ${tint(col, a)} 0, ${tint(col, a)} ${(r * 0.62).toFixed(1)}px, ${tint(col, 0)} ${r.toFixed(1)}px)`;
  });
  return (
    <VRoot p={p}>
      <V bg={discs.join(', ')} masks={[fx(2, 98)]} />
    </VRoot>
  );
};

/** V43 Film burn: the film's edge scorched orange and yellow, thinning into the picture. */
export const V43: FC<VeilProps> = (p) => (
  <VRoot p={p}>
    <V bg={`linear-gradient(to left, ${tint('#ff5a1f', 0.85)}, ${tint(PALETTE.amber, 0.5)} 30%, transparent 76%)`} masks={[fy(8, 92)]} />
    <Vp x={92} y={0} w={8} h={100} bg={tint('#fff2a8', 0.7)} masks={[fy(10, 90)]} />
  </VRoot>
);

/** V44 Glow bar: a lit block of colour with its light spilling all round it, like a neon sign without letters. */
export const V44: FC<VeilProps> = (p) => (
  <VRoot p={p}>
    <V bg={tint(p.c, 0.34)} inset={[14, 26]} radius={8} extra={{ boxShadow: `0 0 34px ${tint(p.c, 0.6)}, inset 0 0 24px ${tint(p.hi, 0.5)}` }} />
  </VRoot>
);

/* ── G: stars ───────────────────────────────────────────────────────────────────────────────────────────── */

/** V45 Starlit veil: a soft veil with a field of stars through it. */
export const V45: FC<VeilProps> = (p) => (
  <VRoot p={p}>
    <V bg={body(p, 0.4)} masks={[fx(10, 90), fy(18, 82)]} />
    <V bg={starBlock(p, { n: 90, seed: p.seed, tintEvery: 4 })} masks={[fx(8, 92), fy(14, 86)]} />
  </VRoot>
);

/** V46 Dust: a haze of hundreds of tiny grains, thick in the middle. One element. */
export const V46: FC<VeilProps> = (p) => (
  <VRoot p={p}>
    <V bg={starBlock(p, { n: 190, seed: p.seed + 3, size: [0.5, 1.1] })} masks={[oval(26, 84)]} />
    <V bg={tint(p.c, 0.1)} masks={[oval(20, 80)]} />
  </VRoot>
);

/** V47 Twinkle: two star fields that take turns, and a couple of stars that flash with a glint. */
export const V47: FC<VeilProps> = (p) => (
  <VRoot p={p}>
    <V bg={tint(p.c, 0.18)} masks={[fx(8, 92), fy(16, 84)]} />
    <V bg={starBlock(p, { n: 64, seed: p.seed })} masks={[fx(6, 94), fy(12, 88)]} extra={anim(p.live, 'fw-ce-lit', 2600, { loop: true })} />
    <V bg={starBlock(p, { n: 64, seed: p.seed + 30, tintEvery: 3 })} masks={[fx(6, 94), fy(12, 88)]} extra={anim(p.live, 'fw-ce-lit', 2600, { loop: true, delay: -1300 })} />
    {[26, 70].map((x, i) => (
      <Sparkle key={x} size={14} hue={p.hi} x={`${x}%`} y={`${34 + i * 24}%`} style={{ transform: 'scale(0.9)', ...anim(p.live, 'fw-ce-twinkle-slow', 2800, { loop: true, delay: -i * 1100 }) }} />
    ))}
  </VRoot>
);

/** V48 Drift: two layers of stars slide past behind a glow, with no seam. */
export const V48: FC<VeilProps> = (p) => {
  const layer = (tile: number, n: number, seed: number, size: [number, number], dur: number): CSSProperties =>
    ({
      position: 'absolute',
      left: 0,
      top: 0,
      width: p.w + tile,
      height: '100%',
      background: starBlock({ ...p, w: tile }, { n, seed, size, tintEvery: 4 }),
      backgroundSize: `${tile}px 100%`,
      backgroundRepeat: 'repeat-x',
      '--tile': `${tile}px`,
      ...anim(p.live, 'fw-ln-drift-h', dur, { loop: true, ease: 'linear' }),
    }) as unknown as CSSProperties;
  const m = `linear-gradient(to right, transparent, #000 12%, #000 88%, transparent)`;
  return (
    <VRoot p={p}>
      <V bg={body(p, 0.3)} masks={[fx(8, 92), fy(16, 84)]} />
      <span aria-hidden style={{ position: 'absolute', inset: 0, overflow: 'hidden', maskImage: m, WebkitMaskImage: m }}>
        <span style={layer(110, 22, p.seed, [0.6, 1.2], 9000)} />
        <span style={layer(170, 16, p.seed + 7, [1.1, 2.1], 15000)} />
      </span>
    </VRoot>
  );
};

/** A veil of star elements you can press: the stars fly apart and fade, then gather again. */
function StarVeil({ p, children }: { p: VeilProps; children?: React.ReactNode }) {
  const [gone, setGone] = useState(false);
  const timer = useRef<number | null>(null);
  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);
  const stars = useMemo(
    () =>
      Array.from({ length: 96 }, (_, i) => {
        const x = rand(i, p.seed) * p.w;
        const y = p.h / 2 + ((rand(i, p.seed + 1) + rand(i, p.seed + 2)) / 2 - 0.5) * p.h * 0.95;
        const cx = x - p.w / 2;
        const cy = y - p.h / 2;
        const out = Math.hypot(cx, cy) || 1;
        const by = 40 + rand(i, p.seed + 3) * 80;
        return {
          x,
          y,
          size: 1.4 + rand(i, p.seed + 4) * 2.4,
          a: 0.5 + rand(i, p.seed + 5) * 0.5,
          dx: (cx / out) * by + (rand(i, p.seed + 6) - 0.5) * 50,
          dy: (cy / out) * by + (rand(i, p.seed + 7) - 0.5) * 50,
          delay: Math.round((out / (p.w / 2)) * 300),
          dur: 3200 + rand(i, p.seed + 8) * 3000,
          fx: (rand(i, p.seed + 9) - 0.5) * 6,
          fy: (rand(i, p.seed + 10) - 0.5) * 6,
        };
      }),
    [p.w, p.h, p.seed]
  );
  const press = () => {
    setGone(true);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setGone(false), 2300);
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      press();
    }
  };
  return (
    <span role="button" tabIndex={0} aria-label="Press to dissipate the veil of stars" onClick={press} onKeyDown={onKey} style={{ position: 'relative', display: 'block', width: p.w, height: p.h, cursor: 'pointer', outlineOffset: 6 }}>
      <V bg={tint(p.c, 0.16)} masks={[fx(8, 92), fy(18, 82)]} extra={{ opacity: gone ? 0 : 1, transition: 'opacity 1100ms ease' }} />
      {stars.map((s, i) => (
        <span
          key={i}
          aria-hidden
          style={
            {
              position: 'absolute',
              left: s.x,
              top: s.y,
              width: s.size,
              height: s.size,
              marginLeft: -s.size / 2,
              marginTop: -s.size / 2,
              borderRadius: '50%',
              background: WHITE(1),
              boxShadow: `0 0 ${s.size * 2.4}px ${tint(i % 3 ? p.hi : WHITE(1), 0.8)}`,
              opacity: gone ? 0 : s.a,
              transform: gone ? `translate(${s.dx}px, ${s.dy}px) scale(0.2)` : 'translate(0, 0) scale(1)',
              transition: gone ? `transform 1300ms cubic-bezier(0.22, 1, 0.36, 1) ${s.delay}ms, opacity 1100ms ease ${s.delay}ms` : `transform 1200ms cubic-bezier(0.22, 1, 0.36, 1) ${s.delay}ms, opacity 1000ms ease ${s.delay}ms`,
              '--fx': `${s.fx}px`,
              '--fy': `${s.fy}px`,
              ...(!gone && p.live ? anim(true, 'fw-ln-float', s.dur, { loop: true, delay: -s.dur * rand(i, p.seed + 11) }) : {}),
            } as unknown as CSSProperties
          }
        />
      ))}
      {children}
    </span>
  );
}

/** V49 Press: a veil of nothing but stars. Press it and the stars fly apart and the glow goes out; then they gather again. */
export const V49: FC<VeilProps> = (p) => <StarVeil p={p} />;

/* ── H: recommended ─────────────────────────────────────────────────────────────────────────────────────── */

/** V50 Silk: the pale blurred bar of the timeline, big: a pillow of light tinted by the shifted gradient, brighter in the middle. */
export const V50: FC<VeilProps> = (p) => (
  <VRoot p={p}>
    <V bg={body(p, 0.28)} masks={[fx(2, 98), fy(6, 94)]} inset={[-6, -8]} />
    <V bg={tint(bright(p.c, 0.8), 0.4)} masks={[fx(4, 96), fy(14, 86)]} />
    <V bg={WHITE(0.42)} masks={[fx(30, 70), fy(30, 70)]} />
  </VRoot>
);

/** V51 Aurora silk: the aurora veil with a pale silk heart. */
export const V51: FC<VeilProps> = (p) => (
  <VRoot p={p}>
    <V bg={body(p, 0.5)} masks={[fx(8, 92), fy(14, 86)]} />
    <V bg={gh(tint(p.lo, 0.5), tint(p.hi, 0.5))} masks={[fx(8, 92), fy(14, 86)]} extra={anim(p.live, 'fw-ce-lit', 5400, { loop: true })} />
    <V bg={WHITE(0.4)} masks={[fx(26, 74), fy(30, 70)]} />
  </VRoot>
);

/** V52 Glass aurora: a pane of glass laid over the aurora veil, offset from it. */
export const V52: FC<VeilProps> = (p) => (
  <VRoot p={p}>
    <V bg={body(p, 0.62)} masks={[fx(8, 92), fy(14, 86)]} extra={{ transform: 'translate(-18px, -4px)' }} />
    <V bg={gh(tint(p.lo, 0.62), tint(p.hi, 0.62))} masks={[fx(8, 92), fy(14, 86)]} extra={{ transform: 'translate(-18px, -4px)', ...anim(p.live, 'fw-ce-lit', 5400, { loop: true }) }} />
    <V bg={`${SHEEN}, linear-gradient(160deg, ${glassN(0.46)}, ${glassN(0.16)})`} inset={[34, 12]} radius={14} extra={{ boxShadow: `0 12px 26px ${tint(p.lo, 0.28)}` }} />
  </VRoot>
);

/** V53 Ember: dusk rising from the bottom edge, with a hot line along it and sparks lifting off. */
export const V53: FC<VeilProps> = (p) => (
  <VRoot p={p}>
    <V bg={`linear-gradient(to bottom, ${tint(p.hi, 0)}, ${tint(p.hi, 0.38)} 55%, ${tint(p.lo, 0.8)})`} masks={[fx(6, 94), toT(0, 100)]} />
    <Vp x={6} y={90} w={88} h={3} bg={`linear-gradient(to right, transparent, ${WHITE(0.8)}, transparent)`} />
    {Array.from({ length: 9 }, (_, i) => {
      const style = { '--dx': `${(rand(i, p.seed) - 0.5) * 26}px`, '--dy': `${-p.h * (0.4 + rand(i, p.seed + 1) * 0.4)}px`, ...(p.live ? anim(p.live, 'fw-ln-shed', 2600 + rand(i, p.seed + 2) * 1600, { loop: true, delay: -rand(i, p.seed + 3) * 3000, ease: 'ease-out' }) : { opacity: 0.6 }) } as unknown as CSSProperties;
      return <span key={i} aria-hidden style={{ position: 'absolute', left: `${8 + rand(i, p.seed + 4) * 84}%`, top: '88%', width: 2.4, height: 2.4, borderRadius: '50%', background: WHITE(1), boxShadow: `0 0 6px ${tint(p.hi, 0.9)}`, ...style }} />;
    })}
  </VRoot>
);

/** V54 Soft highlighter: a highlighter stroke made airbrush: rounded, the gradient inside it, its ends and edges breathing out. */
export const V54: FC<VeilProps> = (p) => (
  <VRoot p={p}>
    <V bg={body(p, 0.55)} inset={[6, 22]} radius={16} masks={[fx(3, 97), fy(6, 94)]} />
    <V bg={`linear-gradient(to bottom, ${WHITE(0.3)}, transparent)`} inset={[14, 24]} radius={12} masks={[fx(14, 86)]} extra={{ bottom: '56%' }} />
  </VRoot>
);

/** V55 Dusk glass: clear glass over a dusk of colour, the colour showing through its lower half. */
export const V55: FC<VeilProps> = (p) => (
  <VRoot p={p}>
    <V bg={`linear-gradient(to bottom, ${tint(p.hi, 0.1)}, ${tint(p.lo, 0.7)})`} masks={[fx(6, 94), 'linear-gradient(to bottom, transparent, #000 30%, #000 92%, transparent)']} />
    <V bg={`${SHEEN_SOFT}, linear-gradient(165deg, ${glassN(0.3)}, ${glassN(0.08)})`} inset={[10, 10]} radius={16} />
  </VRoot>
);

/** V56 Halftone aurora: a halftone veil whose colours trade places slowly, with a soft glow beneath it. */
export const V56: FC<VeilProps> = (p) => (
  <VRoot p={p}>
    <V bg={body(p, 0.26)} masks={[fx(10, 90), fy(18, 82)]} />
    <V bg={gh(p.hi, p.lo)} masks={[dots(42), fx(14, 86), fy(20, 80)]} extra={tiles(6, 2)} />
    <V bg={gh(p.lo, p.hi)} masks={[dots(42), fx(14, 86), fy(20, 80)]} extra={{ ...tiles(6, 2), ...anim(p.live, 'fw-ce-lit', 5200, { loop: true }) }} />
  </VRoot>
);

export const LIGHT_VEILS: Record<string, FC<VeilProps>> = { V37, V38, V39, V40, V41, V42, V43, V44, V45, V46, V47, V48, V49, V50, V51, V52, V53, V54, V55, V56 };
