/**
 * File: src/components/chartstudy/families/square.tsx
 * Description: Family B, the ten squares (B01 to B10). A tile is `w` wide and `h` tall: a small square in the large
 * sample, a bar rising from the shared baseline in the series. Every tile is an ElementBase (tint, blur, bright inner
 * edge); the effects are light layers inside it, clipped to its shape where they travel.
 */
import type { CSSProperties, FC, ReactNode } from 'react';
import ElementBase from '../ElementBase';
import { Box, PALETTE, Sparkle, Zap, anim, bright, jaggedRect, mixHex, rampValue, rand, tint } from '../shared';
import type { ElementProps } from '../types';

const blurOf = (p: ElementProps) => (p.sample ? 7 : 5);
const delayOf = (p: ElementProps) => (p.sample ? 0 : p.index * 70);
const radiusOf = (p: ElementProps) => Math.min(4, p.w * 0.22);

/** The tile: a see-through gradient with blur and a little light around it. No border. */
function Tile({ p, hue, fill = 0.22, glow = 10, blur, background, children }: { p: ElementProps; hue: string; fill?: number; glow?: number; blur?: number; background?: string; children?: ReactNode }) {
  return (
    <ElementBase hue={hue} w={p.w} h={p.h} radius={radiusOf(p)} fill={fill} blur={blur ?? blurOf(p)} glow={glow} background={background}>
      {children}
    </ElementBase>
  );
}

/** A layer that fills the tile and clips what travels inside it. */
const clip: CSSProperties = { position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: 'inherit', pointerEvents: 'none' };

/** B01 Plain tile: a see-through gradient tile, no border. */
export const B01: FC<ElementProps> = (p) => (
  <Box w={p.w} h={p.h}>
    <Tile p={p} hue={rampValue(p.value)} />
  </Box>
);

/** B02 Lit edge: the top of the tile is backlit, like a panel with light behind it. Light, not a line. */
export const B02: FC<ElementProps> = (p) => {
  const hue = rampValue(p.value);
  return (
    <Box w={p.w} h={p.h}>
      <Tile p={p} hue={hue} fill={0.12} glow={0}>
        {/* ── EFFECT: backlight at the top (removable) ── */}
        <span aria-hidden style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none', ...anim(p.live, 'fw-ce-lit', 3200, { loop: true, delay: -p.index * 240 }) }}>
          <span
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              height: Math.min(p.h * 0.7, p.sample ? 30 : 22),
              borderRadius: 'inherit',
              background: `linear-gradient(to bottom, ${tint(bright(hue, 0.6), 0.55)}, ${tint(hue, 0)})`,
            }}
          />
        </span>
      </Tile>
      {/* ── EFFECT: light spilling above the tile (removable) ── */}
      <span
        aria-hidden
        style={{
          position: 'absolute',
          left: '10%',
          right: '10%',
          top: -3,
          height: 6,
          borderRadius: 6,
          background: tint(hue, 0.55),
          filter: 'blur(5px)',
          pointerEvents: 'none',
          ...anim(p.live, 'fw-ce-lit', 3200, { loop: true, delay: -p.index * 240 }),
        }}
      />
    </Box>
  );
};

/** B03 Ignition bar: the tile flashes bright on entry, then settles to tint. */
export const B03: FC<ElementProps> = (p) => {
  const hue = rampValue(p.value);
  return (
    <Box w={p.w} h={p.h}>
      {/* ── EFFECT: flash bloom (removable) ── */}
      {p.live && (
        <span
          aria-hidden
          style={{ position: 'absolute', inset: -4, borderRadius: radiusOf(p) + 4, background: tint(hue, 0.9), filter: 'blur(7px)', opacity: 0, ...anim(p.live, 'fw-ce-hot', 800, { delay: delayOf(p) }) }}
        />
      )}
      <Tile p={p} hue={hue} glow={6}>
        {/* ── EFFECT: flash fill (removable) ── */}
        {p.live && <span aria-hidden style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', background: tint(bright(hue, 0.8), 0.65), opacity: 0, ...anim(p.live, 'fw-ce-hot', 650, { delay: delayOf(p) }) }} />}
      </Tile>
    </Box>
  );
};

/** B04 Scan: a thin light line sweeps down through the tile once. */
export const B04: FC<ElementProps> = (p) => {
  const hue = rampValue(p.value);
  return (
    <Box w={p.w} h={p.h}>
      <Tile p={p} hue={hue}>
        {/* ── EFFECT: scan line (removable) ── */}
        {p.live && (
          <span aria-hidden style={clip}>
            <span
              style={
                {
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 0,
                  height: 2,
                  background: `linear-gradient(to right, ${tint(bright(hue, 0.8), 0)}, ${bright(hue, 0.85)} 30%, ${bright(hue, 0.85)} 70%, ${tint(bright(hue, 0.8), 0)})`,
                  boxShadow: `0 0 8px ${tint(hue, 0.9)}`,
                  opacity: 0,
                  '--ce-h': `${Math.max(0, p.h - 2)}px`,
                  ...anim(p.live, 'fw-ce-scan', 900, { delay: delayOf(p) }),
                } as CSSProperties
              }
            />
          </span>
        )}
      </Tile>
    </Box>
  );
};

/** B05 Electric edge: a thin jagged arc flickers along the outline; the tile itself has no border. */
export const B05: FC<ElementProps> = (p) => {
  const hue = rampValue(p.value);
  const amp = p.sample ? 2 : 1.1;
  const step = p.sample ? 5 : 4;
  return (
    <Box w={p.w} h={p.h}>
      <Tile p={p} hue={hue} glow={5} />
      {/* ── EFFECT: electric outline (removable) ── */}
      <Zap
        width={p.w}
        height={p.h}
        hue={hue}
        a={[jaggedRect(p.w, p.h, 3 + p.index, amp, step)]}
        b={[jaggedRect(p.w, p.h, 29 + p.index, amp, step)]}
        live={p.live}
        period={1000 + rand(p.index, 4) * 500}
        phase={rand(p.index, 8) * 1500}
      />
    </Box>
  );
};

/** B06 Glass pane: a blurred, translucent tile with a diagonal light streak. */
export const B06: FC<ElementProps> = (p) => {
  const hue = rampValue(p.value);
  return (
    <Box w={p.w} h={p.h}>
      <Tile p={p} hue={hue} fill={0.13} blur={p.sample ? 8 : 6} glow={4}>
        {/* ── EFFECT: diagonal light streak (removable) ── */}
        <span aria-hidden style={clip}>
          <span
            style={{
              position: 'absolute',
              top: '-10%',
              left: 0,
              width: '45%',
              height: '120%',
              background: `linear-gradient(to right, ${tint('#ffffff', 0)}, ${tint('#ffffff', 0.3)} 50%, ${tint('#ffffff', 0)})`,
              transform: 'translateX(70%) skewX(-20deg)',
              ...anim(p.live, 'fw-ce-streak', 4200, { loop: true, delay: -p.index * 380 }),
            }}
          />
        </span>
      </Tile>
    </Box>
  );
};

/** B07 Pulse stack: tiles light one after another along the series. */
export const B07: FC<ElementProps> = (p) => {
  const hue = rampValue(p.value);
  return (
    <Box w={p.w} h={p.h}>
      <Tile p={p} hue={hue}>
        {/* ── EFFECT: travelling pulse (removable) ── */}
        {p.live && (
          <span
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 'inherit',
              background: tint(bright(hue, 0.7), 0.5),
              boxShadow: `0 0 10px ${tint(hue, 0.8)}`,
              opacity: 0,
              ...anim(p.live, 'fw-ce-step', 3200, { loop: true, delay: p.index * 150, ease: 'ease-out' }),
            }}
          />
        )}
      </Tile>
    </Box>
  );
};

/** B08 Sparkle corner: a 4-point sparkle sits on one corner, twinkling slowly. */
export const B08: FC<ElementProps> = (p) => {
  const hue = rampValue(p.value);
  return (
    <Box w={p.w} h={p.h}>
      <Tile p={p} hue={hue} />
      {/* ── EFFECT: corner sparkle (removable) ── */}
      <Sparkle
        size={p.sample ? 26 : Math.max(10, Math.min(p.w * 0.9, 20))}
        hue={hue}
        x={p.w}
        y={0}
        style={{ transform: 'scale(0.95)', ...anim(p.live, 'fw-ce-twinkle-slow', 3600, { loop: true, delay: -p.index * 310 }) }}
      />
    </Box>
  );
};

/** B09 Heat: the tile tints from cool to warm as its value rises. */
export const B09: FC<ElementProps> = (p) => {
  const t = (p.value - 2) / 18;
  const hue = mixHex(PALETTE.cyan, PALETTE.amber, t);
  return (
    <Box w={p.w} h={p.h}>
      {/* ── EFFECT: heat bloom (removable) ── */}
      <span
        aria-hidden
        style={{
          position: 'absolute',
          inset: -3,
          borderRadius: radiusOf(p) + 3,
          background: tint(hue, 0.25 + 0.35 * t),
          filter: 'blur(6px)',
          ...anim(p.live, 'fw-ce-lit', 2200 + t * 900, { loop: true, delay: -p.index * 200 }),
        }}
      />
      <Tile p={p} hue={hue} glow={3 + 9 * t} background={`linear-gradient(to top, ${tint(PALETTE.cyan, 0.1)}, ${tint(hue, 0.14 + 0.16 * t)})`} />
    </Box>
  );
};

/** B10 Dust fill: the tint fills from the bottom, with fine particles at the top edge. */
export const B10: FC<ElementProps> = (p) => {
  const hue = rampValue(p.value);
  const n = p.sample ? 8 : 4;
  return (
    <Box w={p.w} h={p.h}>
      <Tile p={p} hue={hue} fill={0.1}>
        {/* ── EFFECT: tint that fills from the bottom (removable) ── */}
        <span aria-hidden style={clip}>
          <span
            style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(to top, ${tint(hue, 0.3)}, ${tint(hue, 0.14)})`,
              transformOrigin: '50% 100%',
              ...anim(p.live, 'fw-ce-fill', 900, { delay: delayOf(p) }),
            }}
          />
        </span>
      </Tile>
      {/* ── EFFECT: dust at the top edge (removable) ── */}
      {Array.from({ length: n }, (_, k) => {
        const x = 1 + rand(k + p.index * 7, 2) * Math.max(1, p.w - 3);
        const dur = 2200 + rand(k, p.index + 1) * 1400;
        return (
          <span
            key={k}
            aria-hidden
            style={
              {
                position: 'absolute',
                left: x,
                top: -2 - rand(k, p.index + 5) * 3,
                width: p.sample ? 2 : 1.5,
                height: p.sample ? 2 : 1.5,
                borderRadius: '50%',
                background: bright(hue, 0.8),
                boxShadow: `0 0 3px ${tint(hue, 0.9)}`,
                opacity: p.live ? 0 : 0.8,
                '--dx': `${((rand(k, p.index + 9) - 0.5) * 8).toFixed(1)}px`,
                ...anim(p.live, 'fw-ce-dust', dur, { loop: true, delay: -rand(k, p.index + 2) * dur, ease: 'linear' }),
              } as CSSProperties
            }
          />
        );
      })}
    </Box>
  );
};

export const SQUARES: Record<string, FC<ElementProps>> = { B01, B02, B03, B04, B05, B06, B07, B08, B09, B10 };
