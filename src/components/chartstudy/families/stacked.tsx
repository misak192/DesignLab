/**
 * File: src/components/chartstudy/families/stacked.tsx
 * Description: Family C, the ten stacked segments (C01 to C10). A stack has `value` segments of `px` pitch climbing from
 * the baseline; each segment takes its hue from its height on the ramp, so a tall stack runs cyan to amber. A gapped
 * stack is blurred as ONE layer cut by a mask (the same gaps as the segments) instead of one blur per segment, so 240
 * segments cost one backdrop filter per column. Not tetris: segments are hairline-thin and translucent, with a bright top edge.
 */
import type { CSSProperties, FC, ReactNode } from 'react';
import ElementBase from '../ElementBase';
import { Box, PALETTE, Sparkle, Zap, anim, bright, jagged, ramp, rampValue, rand, tint } from '../shared';
import type { ElementProps } from '../types';

const delayOf = (p: ElementProps) => (p.sample ? 0 : p.index * 70);
const blurOf = (p: ElementProps) => (p.sample ? 7 : 5);

function geometry(p: ElementProps, gapless = false) {
  const gap = gapless ? 0 : p.px >= 8 ? 3 : 2;
  const n = Math.round(p.value);
  return { gap, seg: p.px - gap, n, H: n * p.px - gap };
}

/** A clip that travels light inside the column. */
const clipStyle = (radius = 2): CSSProperties => ({ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: radius, pointerEvents: 'none' });

/** The stack: one blur layer (cut into segments by a mask), the segments and overlays. No outline. */
function Stack({
  p,
  gapless = false,
  perSeg,
  children,
}: {
  p: ElementProps;
  gapless?: boolean;
  perSeg?: (k: number, hue: string, seg: number) => ReactNode;
  children?: ReactNode;
}) {
  const { seg, n, H } = geometry(p, gapless);
  const blur = `blur(${blurOf(p)}px)`;
  const mask = gapless ? undefined : `repeating-linear-gradient(to top, #000 0, #000 ${seg}px, transparent ${seg}px, transparent ${p.px}px)`;
  return (
    <Box w={p.w} h={H}>
      {/* ── EFFECT: blur behind the segments (removable) ── */}
      <span aria-hidden style={{ position: 'absolute', inset: 0, borderRadius: 2, backdropFilter: blur, WebkitBackdropFilter: blur, maskImage: mask, WebkitMaskImage: mask }} />
      {Array.from({ length: n }, (_, k) => {
        const h = ramp(k / 19);
        // Each segment is a soft gradient, lit at its top. No edge line; the only hairline is the faint divider of the gapless bar.
        const bg = gapless
          ? `linear-gradient(to top, ${tint(bright(h, 0.8), 0.14)} 0, ${tint(bright(h, 0.8), 0.14)} 1px, transparent 1px), linear-gradient(to bottom, ${tint(bright(h, 0.55), 0.4)}, ${tint(h, 0.16)})`
          : `linear-gradient(to bottom, ${tint(bright(h, 0.55), 0.44)}, ${tint(h, 0.14)})`;
        return (
          <span
            key={k}
            aria-hidden
            style={{ position: 'absolute', left: 0, width: p.w, bottom: k * p.px, height: seg, borderRadius: gapless ? 0 : 1, background: bg, boxShadow: gapless ? undefined : `0 0 5px ${tint(h, 0.25)}` }}
          >
            {perSeg?.(k, h, seg)}
          </span>
        );
      })}
      {children}
    </Box>
  );
}

/** C01 Plain segments: thin, translucent, a 2px gap. */
export const C01: FC<ElementProps> = (p) => <Stack p={p} />;

/** C02 Continuous bar: the same stack with no gaps, hairline dividers only. */
export const C02: FC<ElementProps> = (p) => <Stack p={p} gapless />;

/** C03 Ignition rise: segments light from the baseline upward on entry. */
export const C03: FC<ElementProps> = (p) => {
  const n = Math.round(p.value);
  const step = Math.min(40, 600 / n);
  return (
    <Stack
      p={p}
      perSeg={(k, h) =>
        // ── EFFECT: segment ignition (removable) ──
        p.live ? (
          <span
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              background: tint(bright(h, 0.85), 0.85),
              boxShadow: `0 0 8px ${tint(h, 0.9)}`,
              opacity: 0,
              ...anim(p.live, 'fw-ce-rise-lit', 560, { delay: delayOf(p) + k * step }),
            }}
          />
        ) : null
      }
    />
  );
};

/** C04 Electric stack: a thin arc runs up the stack edge and flickers. */
export const C04: FC<ElementProps> = (p) => {
  const { H } = geometry(p);
  const hue = rampValue(p.value);
  const amp = p.sample ? 2.4 : 1.4;
  const step = p.sample ? 6 : 5;
  const x = p.w + 1.5;
  return (
    <Stack p={p}>
      {/* ── EFFECT: electric edge arc (removable) ── */}
      <Zap
        width={p.w + 4}
        height={H}
        hue={hue}
        a={[jagged(x, H, x, 0, 5 + p.index, amp, step)]}
        b={[jagged(x, H, x, 0, 37 + p.index, amp, step)]}
        live={p.live}
        period={1000 + rand(p.index, 4) * 500}
        phase={rand(p.index, 8) * 1500}
      />
    </Stack>
  );
};

/** C05 Glass column: one blurred translucent column with a light streak. */
export const C05: FC<ElementProps> = (p) => {
  const { H } = geometry(p, true);
  const hue = rampValue(p.value);
  return (
    <Box w={p.w} h={H}>
      <ElementBase
        hue={hue}
        w={p.w}
        h={H}
        radius={3}
        blur={p.sample ? 8 : 6}
        glow={4}
        background={`linear-gradient(to top, ${tint(PALETTE.cyan, 0.1)}, ${tint(bright(hue, 0.4), 0.26)})`}
      >
        {/* ── EFFECT: rising light streak (removable) ── */}
        <span aria-hidden style={clipStyle(3)}>
          <span
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: '45%',
              background: `linear-gradient(to bottom, ${tint('#ffffff', 0)}, ${tint('#ffffff', 0.3)} 50%, ${tint('#ffffff', 0)})`,
              transform: 'translateY(-30%)',
              ...anim(p.live, 'fw-ce-streak-up', 4000, { loop: true, delay: -p.index * 350 }),
            }}
          />
        </span>
      </ElementBase>
    </Box>
  );
};

/** C06 Sparkle top: a 4-point sparkle sits on the top segment. */
export const C06: FC<ElementProps> = (p) => {
  const hue = rampValue(p.value);
  return (
    <Stack p={p}>
      {/* ── EFFECT: top sparkle (removable) ── */}
      <Sparkle
        size={p.sample ? 26 : Math.max(10, Math.min(p.w * 0.95, 20))}
        hue={hue}
        x={p.w / 2}
        y={0}
        style={{ transform: 'scale(0.95)', ...anim(p.live, 'fw-ce-twinkle-slow', 3600, { loop: true, delay: -p.index * 310 }) }}
      />
    </Stack>
  );
};

/** C07 Gradient fill: cyan to violet over the whole scale, no segments. */
export const C07: FC<ElementProps> = (p) => {
  const { H } = geometry(p, true);
  const hue = rampValue(p.value);
  // The gradient spans the full scale of 20, so a tall column is the one that reaches violet. The sample spans itself.
  const span = p.sample ? H : 20 * p.px;
  return (
    <Box w={p.w} h={H}>
      {/* ── EFFECT: soft light behind the column (removable) ── */}
      <span aria-hidden style={{ position: 'absolute', inset: -2, borderRadius: 4, background: tint(PALETTE.violet, 0.3), filter: 'blur(6px)', ...anim(p.live, 'fw-ce-lit', 3600, { loop: true, delay: -p.index * 250 }) }} />
      <ElementBase
        hue={hue}
        w={p.w}
        h={H}
        radius={3}
        blur={blurOf(p)}
        glow={4}
        background={`linear-gradient(to top, ${tint(PALETTE.cyan, 0.26)}, ${tint(PALETTE.violet, 0.26)}) bottom / 100% ${span}px no-repeat`}
      />
    </Box>
  );
};

/** C08 Pulse climb: a light pulse climbs the stack, then fades out. */
export const C08: FC<ElementProps> = (p) => {
  const { H } = geometry(p);
  const hue = rampValue(p.value);
  const band = p.sample ? 14 : 10;
  return (
    <Stack p={p}>
      {/* ── EFFECT: climbing pulse (removable) ── */}
      {p.live && (
        <span aria-hidden style={clipStyle()}>
          <span
            style={
              {
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                height: band,
                background: `linear-gradient(to top, ${tint(hue, 0)}, ${tint(bright(hue, 0.8), 0.8)} 60%, ${tint(hue, 0)})`,
                opacity: 0,
                '--ce-up': `${-Math.max(0, H - band)}px`,
                ...anim(p.live, 'fw-ce-climb', 3600, { loop: true, delay: p.index * 110, ease: 'ease-in-out' }),
              } as CSSProperties
            }
          />
        </span>
      )}
    </Stack>
  );
};

/** C09 Dust column: fine particles rise off the top of the column. */
export const C09: FC<ElementProps> = (p) => {
  const { H } = geometry(p, true);
  const hue = rampValue(p.value);
  const n = p.sample ? 7 : 4;
  return (
    <Box w={p.w} h={H}>
      <ElementBase
        hue={hue}
        w={p.w}
        h={H}
        radius={3}
        blur={blurOf(p)}
        glow={4}
        background={`linear-gradient(to top, ${tint(bright(hue, 0.3), 0.26)}, ${tint(hue, 0.04)})`}
      />
      {/* ── EFFECT: rising dust (removable) ── */}
      {Array.from({ length: n }, (_, k) => {
        const dur = 2400 + rand(k, p.index + 3) * 1600;
        return (
          <span
            key={k}
            aria-hidden
            style={
              {
                position: 'absolute',
                left: 1 + rand(k + p.index * 5, 4) * Math.max(1, p.w - 3),
                top: -1,
                width: p.sample ? 2 : 1.5,
                height: p.sample ? 2 : 1.5,
                borderRadius: '50%',
                background: bright(hue, 0.8),
                boxShadow: `0 0 3px ${tint(hue, 0.9)}`,
                opacity: p.live ? 0 : 0.8,
                '--dx': `${((rand(k, p.index + 6) - 0.5) * 6).toFixed(1)}px`,
                '--dy': `${p.sample ? -26 : -18}px`,
                ...anim(p.live, 'fw-ce-rise', dur, { loop: true, delay: -rand(k, p.index + 8) * dur, ease: 'linear' }),
              } as CSSProperties
            }
          />
        );
      })}
    </Box>
  );
};

/** C10 Thin needles: the stack is 1px lines of light, like a spectrum. */
export const C10: FC<ElementProps> = (p) => {
  const n = Math.round(p.value);
  const H = (n - 1) * p.px + 1;
  return (
    <Box w={p.w} h={H}>
      {Array.from({ length: n }, (_, k) => {
        const h = ramp(k / 19);
        const shimmer = k >= n - 3;
        return (
          <span
            key={k}
            aria-hidden
            style={{
              position: 'absolute',
              left: 0,
              width: p.w,
              bottom: k * p.px,
              height: 1,
              background: `linear-gradient(to right, ${tint(bright(h, 0.6), 0)}, ${tint(bright(h, 0.7), 0.9)} 22%, ${tint(bright(h, 0.7), 0.9)} 78%, ${tint(bright(h, 0.6), 0)})`,
              boxShadow: `0 0 4px ${tint(h, 0.6)}`,
              ...(shimmer ? anim(p.live, 'fw-ce-lit', 2400, { loop: true, delay: -k * 230 - p.index * 120 }) : {}),
            }}
          />
        );
      })}
    </Box>
  );
};

export const STACKS: Record<string, FC<ElementProps>> = { C01, C02, C03, C04, C05, C06, C07, C08, C09, C10 };
