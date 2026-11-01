/**
 * File: src/components/chartstudy/families/dot.tsx
 * Description: Family A, the ten dots (A01 to A10), drawn as stars: no outline anywhere. A star is a glassy halo that
 * fades out by itself (a backdrop blur under a radial mask), faint rays that taper to nothing, and a soft core. The
 * glass lens (A07) is the one defined disc, and its rim is far fainter than its inside. A dot is placed by its centre;
 * the series container sets its height from the value. Entries run once and hold their last frame; loops run
 * forever; with `live` false the static look is drawn instead.
 */
import type { CSSProperties, FC, ReactNode } from 'react';
import { Box, Flare, Sparkle, Zap, anim, bright, jagged, rampValue, rand, tint } from '../shared';
import type { ElementProps } from '../types';

const delayOf = (p: ElementProps) => (p.sample ? 0 : p.index * 70);

/** A layer centred on the dot. */
const centred = (size: number): CSSProperties => ({
  position: 'absolute',
  left: '50%',
  top: '50%',
  width: size,
  height: size,
  marginLeft: -size / 2,
  marginTop: -size / 2,
  pointerEvents: 'none',
});

/** One ray: a line of light that tapers to nothing at both ends. `deg` turns it; `a` is its strength. */
function Ray({ len, hue, deg, a }: { len: number; hue: string; deg: number; a: number }) {
  return (
    <span
      aria-hidden
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: len,
        height: 1,
        marginLeft: -len / 2,
        marginTop: -0.5,
        transform: `rotate(${deg}deg)`,
        background: `linear-gradient(to right, ${tint(hue, 0)}, ${tint(bright(hue, 0.85), a)} 50%, ${tint(hue, 0)})`,
        pointerEvents: 'none',
      }}
    />
  );
}

/**
 * The star. Halo: glass (blurred backdrop) whose edge is dissolved by a radial mask, so there is no outline to see.
 * Rays: a cross and a shorter diagonal glint. Core: a radial point of light.
 */
function Star({ p, hue, halo = 2.5, children }: { p: ElementProps; hue: string; halo?: number; children?: ReactNode }) {
  const blur = `blur(${p.sample ? 6 : 4}px)`;
  const size = p.w * halo;
  const len = p.sample ? p.w * 3 : p.w * 2.1;
  return (
    <>
      {/* ── EFFECT: glass halo, edge dissolved by a mask (removable) ── */}
      <span
        aria-hidden
        style={{
          ...centred(size),
          borderRadius: '50%',
          background: `radial-gradient(circle, ${tint(bright(hue, 0.3), 0.34)} 0%, ${tint(hue, 0.14)} 45%, ${tint(hue, 0)} 72%)`,
          backdropFilter: blur,
          WebkitBackdropFilter: blur,
          maskImage: 'radial-gradient(circle, #000 28%, transparent 68%)',
          WebkitMaskImage: 'radial-gradient(circle, #000 28%, transparent 68%)',
        }}
      />
      {/* ── EFFECT: tapering rays (removable) ── */}
      <Ray len={len} hue={hue} deg={0} a={0.55} />
      <Ray len={len} hue={hue} deg={90} a={0.55} />
      <Ray len={len * 0.55} hue={hue} deg={45} a={0.28} />
      <Ray len={len * 0.55} hue={hue} deg={135} a={0.28} />
      {/* ── EFFECT: soft core (removable) ── */}
      <span
        aria-hidden
        style={{
          ...centred(p.w * 0.62),
          borderRadius: '50%',
          background: `radial-gradient(circle, ${bright(hue, 0.92)} 0%, ${tint(bright(hue, 0.55), 0.85)} 32%, ${tint(hue, 0)} 100%)`,
        }}
      />
      {children}
    </>
  );
}

/** A01 Plain core: the baseline reference, a still star. */
export const A01: FC<ElementProps> = (p) => {
  const hue = rampValue(p.value);
  return (
    <Box w={p.w} h={p.w}>
      <Star p={p} hue={hue} />
    </Box>
  );
};

/** A02 Sparkle: a 4-point star flashes on the dot once on entry, then the dot is still. */
export const A02: FC<ElementProps> = (p) => {
  const hue = rampValue(p.value);
  return (
    <Box w={p.w} h={p.w}>
      <Star p={p} hue={hue} />
      {/* ── EFFECT: entry sparkle (removable) ── */}
      {p.live && <Sparkle size={p.w * 2.8} hue={hue} x="50%" y="50%" style={{ opacity: 0, ...anim(p.live, 'fw-ce-sparkle', 800, { delay: delayOf(p) }) }} />}
    </Box>
  );
};

/** A03 Twinkle: the star flickers, with a random 3 to 6 second gap between pulses. */
export const A03: FC<ElementProps> = (p) => {
  const hue = rampValue(p.value);
  const dur = 3000 + rand(p.index, 3) * 3000;
  return (
    <Box w={p.w} h={p.w}>
      {/* ── EFFECT: twinkle flare (removable) ── */}
      {p.live && <Flare size={p.w * 3.4} hue={hue} a={0.6} style={{ opacity: 0, ...anim(p.live, 'fw-ce-twinkle', dur, { loop: true, delay: -rand(p.index, 4) * dur }) }} />}
      <Star p={p} hue={hue} />
    </Box>
  );
};

/** A04 Ignition: the star flares bright, then cools to a steady glow over 600ms. */
export const A04: FC<ElementProps> = (p) => {
  const hue = rampValue(p.value);
  return (
    <Box w={p.w} h={p.w}>
      {/* ── EFFECT: steady glow that the flare cools into (removable) ── */}
      <Flare size={p.w * 2} hue={hue} a={0.55} style={{ opacity: 0.5, transform: 'scale(1.3)', ...anim(p.live, 'fw-ce-ignite-glow', 600, { delay: delayOf(p) }) }} />
      <Star p={p} hue={hue}>
        {/* ── EFFECT: hot white-out at the moment of ignition (removable) ── */}
        <span
          aria-hidden
          style={{
            ...centred(p.w * 1.6),
            borderRadius: '50%',
            background: `radial-gradient(circle, ${tint('#ffffff', 0.9)} 0%, ${tint(bright(hue, 0.8), 0.5)} 40%, ${tint(hue, 0)} 75%)`,
            opacity: 0,
            ...anim(p.live, 'fw-ce-hot', 600, { delay: delayOf(p) }),
          }}
        />
      </Star>
    </Box>
  );
};

/** A05 Electric core: two or three thin jagged arcs jump off the star and flicker. */
export const A05: FC<ElementProps> = (p) => {
  const hue = rampValue(p.value);
  const size = p.w * 3.4;
  const c = size / 2;
  const arcs = [0, 1, 2].map((k) => {
    const ang = (rand(p.index * 3 + k, 5) + k / 3) * Math.PI * 2;
    const r0 = p.w * 0.32;
    const r1 = p.w * (0.95 + 0.3 * rand(k, p.index + 7));
    const amp = Math.max(0.8, p.w * 0.07);
    const step = Math.max(3, p.w * 0.16);
    const [x1, y1, x2, y2] = [c + Math.cos(ang) * r0, c + Math.sin(ang) * r0, c + Math.cos(ang) * r1, c + Math.sin(ang) * r1];
    return { a: jagged(x1, y1, x2, y2, 11 + k * 5 + p.index, amp, step), b: jagged(x1, y1, x2, y2, 41 + k * 7 + p.index, amp, step) };
  });
  return (
    <Box w={p.w} h={p.w}>
      <Star p={p} hue={hue} />
      {/* ── EFFECT: electric arcs (removable) ── */}
      <Zap
        width={size}
        height={size}
        left={(p.w - size) / 2}
        top={(p.w - size) / 2}
        hue={hue}
        a={arcs.map((x) => x.a)}
        b={arcs.map((x) => x.b)}
        live={p.live}
        period={1100 + rand(p.index, 9) * 500}
        phase={rand(p.index, 2) * 1500}
      />
    </Box>
  );
};

/** A06 Halo ring: a soft ring of light expands out of the star once, then fades. It is feathered, not a line. */
export const A06: FC<ElementProps> = (p) => {
  const hue = rampValue(p.value);
  return (
    <Box w={p.w} h={p.w}>
      <Star p={p} hue={hue} />
      {/* ── EFFECT: expanding soft ring (removable) ── */}
      {p.live && (
        <span
          aria-hidden
          style={{
            ...centred(p.w * 1.4),
            borderRadius: '50%',
            background: `radial-gradient(circle, ${tint(hue, 0)} 42%, ${tint(bright(hue, 0.7), 0.5)} 62%, ${tint(hue, 0)} 82%)`,
            opacity: 0,
            ...anim(p.live, 'fw-ce-ring', 1000, { delay: delayOf(p) }),
          }}
        />
      )}
    </Box>
  );
};

/** A07 Glass lens: a translucent disc with blur behind it. Its rim is far fainter than its inside. */
export const A07: FC<ElementProps> = (p) => {
  const hue = rampValue(p.value);
  const blur = `blur(${p.sample ? 8 : 6}px)`;
  return (
    <Box w={p.w} h={p.w}>
      <span
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: `linear-gradient(160deg, ${tint(bright(hue, 0.55), 0.3)}, ${tint(hue, 0.1)})`,
          backdropFilter: blur,
          WebkitBackdropFilter: blur,
          boxShadow: `0 0 ${p.w * 0.5}px ${tint(hue, 0.22)}`,
        }}
      >
        {/* ── EFFECT: breathing inner light, faint at the rim (removable) ── */}
        <span
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            boxShadow: `inset 0 0 ${Math.max(4, p.w * 0.36)}px ${tint(bright(hue, 0.7), 0.16)}`,
            ...anim(p.live, 'fw-ce-lit', 3600, { loop: true, delay: -p.index * 260 }),
          }}
        />
      </span>
    </Box>
  );
};

/** A08 Comet: the star with a short fading trail in the direction of the series (back toward the previous value). */
export const A08: FC<ElementProps> = (p) => {
  const hue = rampValue(p.value);
  const dy = p.prev === undefined ? 0 : (p.value - p.prev) * p.px;
  const angle = (Math.atan2(dy, -p.pitch) * 180) / Math.PI;
  const len = p.sample ? p.w * 2.6 : Math.min(Math.hypot(p.pitch, dy) * 0.9, 30);
  return (
    <Box w={p.w} h={p.w}>
      {/* ── EFFECT: comet trail (removable) ── */}
      <span aria-hidden style={{ position: 'absolute', left: '50%', top: '50%', width: 0, height: 0, transform: `rotate(${angle}deg)` }}>
        <span
          style={{
            position: 'absolute',
            left: 0,
            top: -p.w * 0.3,
            width: len,
            height: p.w * 0.6,
            background: `linear-gradient(to right, ${tint(bright(hue, 0.4), 0.55)}, ${tint(hue, 0)})`,
            clipPath: 'polygon(0 0, 100% 42%, 100% 58%, 0 100%)',
            transformOrigin: '0 50%',
            ...anim(p.live, 'fw-ce-trail', 2600, { loop: true, delay: -p.index * 230 }),
          }}
        />
      </span>
      <Star p={p} hue={hue} />
    </Box>
  );
};

/** A09 Breath: the star's halo grows and shrinks on a slow 4s cycle. */
export const A09: FC<ElementProps> = (p) => {
  const hue = rampValue(p.value);
  return (
    <Box w={p.w} h={p.w}>
      {/* ── EFFECT: breathing halo (removable) ── */}
      <Flare
        size={p.w * 2.4}
        hue={hue}
        a={0.55}
        style={{ opacity: 0.55, transform: 'scale(1.2)', ...anim(p.live, 'fw-ce-breath', 4000, { loop: true, delay: -p.index * 280 }) }}
      />
      <Star p={p} hue={hue} />
    </Box>
  );
};

/** A10 Spark burst: six tiny particles leave the star once on entry, then fade. */
export const A10: FC<ElementProps> = (p) => {
  const hue = rampValue(p.value);
  const dist = p.sample ? p.w * 1.1 : Math.max(13, p.w * 1.3);
  const size = p.sample ? 3 : 2;
  return (
    <Box w={p.w} h={p.w}>
      <Star p={p} hue={hue} />
      {/* ── EFFECT: spark particles (removable) ── */}
      {p.live &&
        [0, 1, 2, 3, 4, 5].map((k) => {
          const ang = ((k + rand(p.index + k, 6) * 0.6) / 6) * Math.PI * 2;
          const d = dist * (0.8 + rand(k, p.index + 3) * 0.5);
          return (
            <span
              key={k}
              aria-hidden
              style={
                {
                  ...centred(size),
                  borderRadius: '50%',
                  background: bright(hue, 0.8),
                  boxShadow: `0 0 4px ${tint(hue, 0.9)}`,
                  opacity: 0,
                  '--bx': `${(Math.cos(ang) * d).toFixed(1)}px`,
                  '--by': `${(Math.sin(ang) * d).toFixed(1)}px`,
                  ...anim(p.live, 'fw-ce-burst', 750, { delay: delayOf(p) }),
                } as CSSProperties
              }
            />
          );
        })}
    </Box>
  );
};

export const DOTS: Record<string, FC<ElementProps>> = { A01, A02, A03, A04, A05, A06, A07, A08, A09, A10 };
