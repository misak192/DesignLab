/**
 * File: src/components/hero/HeroTitle.tsx
 * Description: The hero title: the huge name set behind a list or a page. The letters themselves are the light: every
 * design is FILL only (gradients and transparency, never an outline), so it reads as haze, glass, metal or beams
 * instead of line art. Thirteen designs (see src/lib/hero/heroes.ts).
 *
 * It is SVG so gradients, masks and filters follow the real glyph shapes. The word is measured once (the viewBox hugs
 * the capitals), then drawn at a chosen font size: list size (about 88px, as behind a Nexus list, cropped by its
 * column and sliding sideways as you scroll) or page size (up to 160px, shrinking to fit). Every design reads its feel
 * from the MOTION level: OFF paints it once and still, NORMAL is calm, COLOUR lets colour drift, OTT is over the top.
 *
 * Decoration only: aria-hidden, no pointer events, so the text on top keeps every tap. Children are drawn over the
 * title, pulled up so they start `overlap` of the cap height above the baseline.
 */
"use client";
import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type SVGProps,
} from 'react';
import {
  motion,
  motionValue,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import { useDisplay, useMotion } from '@/components/display/DisplayProvider';
import { SKIN_TINT, type HeroTint } from '@/lib/hero/heroes';
import type { HeroStyle } from '@/lib/display/settings';
import type { MotionPreset } from '@/lib/motion/presets';

/* ---- geometry ----------------------------------------------------------------------------------------------------- */

/** Font size in viewBox units. Every blur and offset below is in the same units, so a design scales as one piece. */
const SIZE = 200;
/** Room around the letters for blooms and rays. */
const PAD = 60;
/** Jost's cap height as a share of the em: the viewBox hugs the capitals, not the line box. */
const CAP = 0.7;
const CAP_H = SIZE * CAP;

const TEXT_STYLE: CSSProperties = {
  fontFamily: 'var(--fw-font)',
  fontWeight: 300,
  fontSize: SIZE,
  letterSpacing: '0.06em',
  // The page's halo and edge belong to reading text; art draws its own light.
  textShadow: 'none',
  WebkitTextStroke: '0',
  paintOrder: 'normal',
};

interface Geom {
  vx: number;
  vy: number;
  vw: number;
  vh: number;
  /** The word's own width, without the padding. */
  textW: number;
  capTop: number;
  baseline: number;
  /** Extra room below the baseline (a reflection needs it). */
  below: number;
  glyphs: { ch: string; x: number }[];
}

function makeGeom(text: string, textW: number, xs: number[] | null, below: number): Geom {
  const capTop = SIZE * (1 - CAP);
  return {
    vx: -PAD,
    vy: capTop - PAD,
    vw: textW + PAD * 2,
    vh: CAP_H + PAD * 2 + below,
    textW,
    capTop,
    baseline: SIZE,
    below,
    glyphs: [...text].map((ch, i) => ({ ch, x: xs?.[i] ?? (textW * i) / text.length })),
  };
}

/** Measure the word once the face is loaded: total width and where each letter starts. */
function useGeom(text: string, below: number) {
  const probe = useRef<SVGTextElement>(null);
  const [measured, setMeasured] = useState<{ text: string; w: number; xs: number[] } | null>(null);

  useLayoutEffect(() => {
    const measure = () => {
      const el = probe.current;
      if (!el) return;
      const bb = el.getBBox();
      if (!bb.width) return;
      const xs = Array.from({ length: el.getNumberOfChars() }, (_, i) => el.getStartPositionOfChar(i).x);
      // The box includes the spacing after the last letter; the visible word does not.
      setMeasured({ text, w: bb.width - SIZE * 0.06, xs });
    };
    measure();
    document.fonts?.ready.then(measure);
    document.fonts?.addEventListener('loadingdone', measure);
    return () => document.fonts?.removeEventListener('loadingdone', measure);
  }, [text]);

  // A new word shows a guess until it is measured.
  const hit = measured && measured.text === text ? measured : null;
  const geom = makeGeom(text, hit ? hit.w : text.length * SIZE * 0.7, hit ? hit.xs : null, below);
  return { probe, geom, ready: hit !== null };
}

/* ---- the pointer, shared ------------------------------------------------------------------------------------------ */

const rawX = motionValue(0);
const rawY = motionValue(0);
let pointerUsers = 0;
const onPointer = (e: PointerEvent) => {
  rawX.set(e.clientX / window.innerWidth - 0.5);
  rawY.set(e.clientY / window.innerHeight - 0.5);
};

/** One window listener for every hero on the page; -0.5 to 0.5 from the centre of the viewport, smoothed. */
function usePointer(m: MotionPreset) {
  useEffect(() => {
    if (pointerUsers++ === 0) window.addEventListener('pointermove', onPointer, { passive: true });
    return () => {
      if (--pointerUsers === 0) window.removeEventListener('pointermove', onPointer);
    };
  }, []);
  const cfg = m.spring ?? { stiffness: 90, damping: 22, mass: 1 };
  return { px: useSpring(rawX, cfg), py: useSpring(rawY, cfg) };
}

/* ---- drawing helpers ---------------------------------------------------------------------------------------------- */

interface WordProps {
  text: string;
  x?: number;
  /** Always a fill: a colour, or url(#gradient). */
  fill: string;
  op?: number;
  filter?: string;
  style?: CSSProperties;
}

/** The word (or one letter of it) at the common baseline. Colours go through style so CSS variables work everywhere. */
function Word({ text, x = 0, fill, op, filter, style }: WordProps) {
  return (
    <text x={x} y={SIZE} style={{ ...TEXT_STYLE, fill, stroke: 'none', opacity: op, filter, ...style }}>
      {text}
    </text>
  );
}

const vars = (v: Record<string, string | number>) => v as CSSProperties;
/** A CSS animation, or nothing when MOTION is OFF. */
const anim = (m: MotionPreset, css: string): CSSProperties => (m.scale ? { animation: css } : { animation: 'none' });
const mix = (a: string, pct: number, b: string) => `color-mix(in oklab, ${a} ${pct}%, ${b})`;
const url = (id: string) => `url(#${id})`;
/** The bright end of a tint: near white on a dark page, a deepened colour on a light one. */
const bright = (tint: HeroTint, light: boolean) => (light ? mix(tint.c1, 62, '#000') : mix(tint.c1, 34, '#fff'));

interface VP {
  text: string;
  g: Geom;
  id: string;
  tint: HeroTint;
  m: MotionPreset;
  light: boolean;
  live: boolean;
  px: MotionValue<number>;
  py: MotionValue<number>;
  progress: MotionValue<number>;
}

type Stop = [offset: number, colour: string, opacity: number];

/** A vertical gradient across the capitals (top of the letters to the baseline), colours with their own transparency. */
function VGrad({ id, g, stops }: { id: string; g: Geom; stops: Stop[] }) {
  return (
    <linearGradient id={id} gradientUnits="userSpaceOnUse" x1={0} x2={0} y1={g.capTop} y2={g.baseline}>
      {stops.map(([o, c, a], i) => (
        <stop key={i} offset={o} style={{ stopColor: c, stopOpacity: a }} />
      ))}
    </linearGradient>
  );
}

const Full = ({ g, ...rest }: { g: Geom } & SVGProps<SVGRectElement>) => (
  <rect x={g.vx} y={g.vy} width={g.vw} height={g.vh} {...rest} />
);

const Blur = ({ id, g, sd }: { id: string; g: Geom; sd: number }) => (
  <filter id={id} filterUnits="userSpaceOnUse" x={g.vx} y={g.vy} width={g.vw} height={g.vh}>
    <feGaussianBlur stdDeviation={sd} />
  </filter>
);

/** A band of light that passes through the letters now and then (clipped to the letter shapes). */
function Sheen({ text, g, id, m, colour, band, opacity, secs, blur = 0, delays = [0] }: {
  text: string; g: Geom; id: string; m: MotionPreset; colour: string; band: number; opacity: number; secs: number; blur?: number; delays?: number[];
}) {
  if (!m.scale) return null;
  return (
    <>
      <defs>
        <mask id={`${id}sm`} maskUnits="userSpaceOnUse" x={g.vx} y={g.vy} width={g.vw} height={g.vh}>
          <Word text={text} fill="#fff" />
        </mask>
        <linearGradient id={`${id}sg`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" style={{ stopColor: colour, stopOpacity: 0 }} />
          <stop offset="0.5" style={{ stopColor: colour, stopOpacity: opacity }} />
          <stop offset="1" style={{ stopColor: colour, stopOpacity: 0 }} />
        </linearGradient>
      </defs>
      <g mask={url(`${id}sm`)}>
        {delays.map((d, i) => (
          <rect key={i} x={0} y={g.vy} width={band} height={g.vh} fill={url(`${id}sg`)}
            style={{
              ...vars({ '--a': `${g.vx - band * 1.6}px`, '--b': `${g.vx + g.vw + band * 0.6}px` }),
              filter: blur ? `blur(${blur}px)` : undefined,
              ...anim(m, `fw-h-sweep ${secs}s cubic-bezier(0.4,0,0.2,1) ${d}s infinite`),
            }} />
        ))}
      </g>
    </>
  );
}

/* ---- 1 · Mist: airbrushed haze, barely there --------------------------------------------------------------------- */

function Mist({ text, g, id, tint, m, light }: VP) {
  const ott = m.level === 'ott';
  const hi = bright(tint, light);
  return (
    <>
      <defs>
        <VGrad id={`${id}f`} g={g} stops={[[0, hi, 0.46], [0.55, tint.c1, 0.16], [1, tint.c1, 0.02]]} />
        <Blur id={`${id}b1`} g={g} sd={ott ? 26 : 20} />
        <Blur id={`${id}b2`} g={g} sd={5} />
        <Blur id={`${id}b3`} g={g} sd={1.3} />
      </defs>
      <g style={anim(m, `fw-h-breathe ${ott ? 3 : 6}s ease-in-out infinite alternate${m.colour ? `, fw-h-hue ${ott ? 6 : 12}s ease-in-out infinite alternate` : ''}`)}>
        <Word text={text} fill={url(`${id}f`)} filter={url(`${id}b1`)} op={0.75} />
        <Word text={text} fill={url(`${id}f`)} filter={url(`${id}b2`)} op={0.55} />
        <Word text={text} fill={url(`${id}f`)} filter={url(`${id}b3`)} />
      </g>
      {m.colour && <Sheen text={text} g={g} id={id} m={m} colour={hi} band={Math.max(160, g.vw * 0.22)} opacity={0.4} secs={ott ? 6 : 13} blur={12} />}
    </>
  );
}

/* ---- 2 · Radiance: the letters are the rays ---------------------------------------------------------------------- */

function Radiance({ text, g, id, tint, m, light, live, px }: VP) {
  const ott = m.level === 'ott';
  const hi = bright(tint, light);
  const idle = useMotionValue(0);
  useAnimationFrame((t) => {
    if (live && m.scale) idle.set(Math.sin(t / 3400) * (m.colour ? 14 : 9));
  });
  // The beams are the letters smeared straight down (a vertical-only blur), then leaned: the pointer and a slow sway
  // tilt them about a source above the word.
  const lean = useTransform([px, idle], ([a, b]: number[]) => a * 38 * Math.min(m.parallax, 1.6) + b);
  const beams = [
    { sd: "1.2 26", o: 0.5, t: 5 },
    { sd: "2 64", o: 0.34, t: 7 },
    { sd: "3 130", o: 0.22, t: 9 },
    ...(ott ? [{ sd: "5 200", o: 0.16, t: 4 }] : []),
  ];
  return (
    <>
      <defs>
        <VGrad id={`${id}r`} g={g} stops={[[0, hi, 0.95], [0.55, tint.c1, 0.5], [1, tint.c2, 0.2]]} />
        {beams.map((b, i) => (
          <filter key={i} id={`${id}b${i}`} filterUnits="userSpaceOnUse" x={g.vx - 200} y={g.vy - 40} width={g.vw + 400} height={g.vh + 320}>
            <feGaussianBlur stdDeviation={b.sd} />
          </filter>
        ))}
        <Blur id={`${id}s`} g={g} sd={1.2} />
      </defs>
      <g style={m.colour ? anim(m, `fw-h-hue ${ott ? 6 : 12}s ease-in-out infinite alternate`) : undefined}>
        <motion.g style={{ skewX: lean, originX: 0.5, originY: 0 }}>
          {beams.map((b, i) => (
            <g key={i} style={anim(m, `fw-h-breathe ${b.t}s ease-in-out ${i * 0.7}s infinite alternate`)}>
              <Word text={text} fill={url(`${id}r`)} filter={url(`${id}b${i}`)} op={b.o} />
            </g>
          ))}
        </motion.g>
        <Word text={text} fill={url(`${id}r`)} filter={url(`${id}s`)} op={0.7} />
      </g>
    </>
  );
}

/* ---- 3 · Airbrush: spray grain, dense on top, thinning to nothing ------------------------------------------------ */

function Airbrush({ text, g, id, tint, m, light }: VP) {
  const ott = m.level === 'ott';
  const hi = bright(tint, light);
  const passes = [
    { c: hi, seed: 3, gain: 3.2, o: 0.95 },
    ...(m.colour ? [{ c: tint.c2, seed: 11, gain: 2.1, o: 0.8 }] : []),
    ...(ott ? [{ c: tint.c3, seed: 23, gain: 1.6, o: 0.7 }] : []),
  ];
  return (
    <>
      <defs>
        <VGrad id={`${id}f`} g={g} stops={[[0, '#fff', 1], [0.5, '#fff', 0.62], [1, '#fff', 0]]} />
        <VGrad id={`${id}h`} g={g} stops={[[0, tint.c1, 0.5], [1, tint.c1, 0]]} />
        <Blur id={`${id}b`} g={g} sd={14} />
        {passes.map((p, i) => (
          <filter key={i} id={`${id}s${i}`} filterUnits="userSpaceOnUse" x={g.vx} y={g.vy} width={g.vw} height={g.vh}>
            <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="2" seed={p.seed} result="n" />
            <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1 0 0 0 0" result="na" />
            <feComposite in="SourceAlpha" in2="na" operator="arithmetic" k1="0" k2={p.gain} k3={-p.gain} k4="0" result="dots" />
            <feFlood style={{ floodColor: p.c }} />
            <feComposite in2="dots" operator="in" />
          </filter>
        ))}
      </defs>
      <g style={anim(m, `fw-h-breathe ${ott ? 3 : 7}s ease-in-out infinite alternate`)}>
        <Word text={text} fill={url(`${id}h`)} filter={url(`${id}b`)} op={0.55} />
        {passes.map((p, i) => (
          <Word key={i} text={text} fill={url(`${id}f`)} filter={url(`${id}s${i}`)} op={p.o} />
        ))}
      </g>
    </>
  );
}

/* ---- 4 · Smoke: soft letters that ripple like smoke -------------------------------------------------------------- */

function Smoke({ text, g, id, tint, m, light, live }: VP) {
  const ott = m.level === 'ott';
  const hi = bright(tint, light);
  const turb = useRef<SVGFETurbulenceElement>(null);
  const disp = useRef<SVGFEDisplacementMapElement>(null);
  useAnimationFrame((t) => {
    if (!live || !m.scale) return;
    const k = ott ? 1.8 : 1;
    turb.current?.setAttribute('baseFrequency', `${0.011 + 0.003 * Math.sin((t * k) / 4200)} ${0.028 + 0.004 * Math.cos((t * k) / 5300)}`);
    disp.current?.setAttribute('scale', String((ott ? 74 : 44) + 14 * Math.sin((t * k) / 3100)));
  });
  return (
    <>
      <defs>
        <VGrad id={`${id}f`} g={g} stops={[[0, hi, 0.46], [0.6, tint.c1, 0.16], [1, tint.c1, 0.02]]} />
        <Blur id={`${id}b`} g={g} sd={16} />
        <filter id={`${id}sm`} filterUnits="userSpaceOnUse" x={g.vx} y={g.vy} width={g.vw} height={g.vh}>
          <feTurbulence ref={turb} type="fractalNoise" baseFrequency="0.011 0.028" numOctaves="2" seed="4" result="t" />
          <feDisplacementMap ref={disp} in="SourceGraphic" in2="t" scale="44" xChannelSelector="R" yChannelSelector="G" result="d" />
          <feGaussianBlur in="d" stdDeviation="2.2" />
        </filter>
      </defs>
      <Word text={text} fill={url(`${id}f`)} filter={url(`${id}b`)} op={0.6} />
      <Word text={text} fill={url(`${id}f`)} filter={url(`${id}sm`)} />
    </>
  );
}

/* ---- 5 · Veil: letters surface out of the mist, then keep breathing ---------------------------------------------- */

function Veil({ g, id, tint, m, light }: VP) {
  const ott = m.level === 'ott';
  const hi = bright(tint, light);
  const step = ott ? 0.08 : 0.16;
  const dur = ott ? 1.1 : 1.9;
  return (
    <>
      <defs>
        <VGrad id={`${id}f`} g={g} stops={[[0, hi, 0.52], [0.6, tint.c1, 0.2], [1, tint.c1, 0.04]]} />
      </defs>
      {g.glyphs.map((gl, i) => (
        <g
          key={i}
          style={{
            transformBox: 'fill-box',
            transformOrigin: 'center',
            ...vars({ '--ry': `${ott ? 70 : 34}px` }),
            ...anim(m, `fw-h-veil ${dur}s ${ott ? 'cubic-bezier(0.16,1,0.3,1)' : 'cubic-bezier(0.22,1,0.36,1)'} ${i * step}s both`),
          }}
        >
          <g style={anim(m, `fw-h-wave ${ott ? 3 : 6}s ease-in-out ${g.glyphs.length * step + dur + i * 0.35}s infinite alternate`)}>
            <Word text={gl.ch} x={gl.x} fill={url(`${id}f`)} />
          </g>
        </g>
      ))}
    </>
  );
}

/* ---- 6 · Glass: frosted letters with a gloss, a little thickness and a highlight passing through ------------------ */

function Glass({ text, g, id, tint, m, light }: VP) {
  const ott = m.level === 'ott';
  const hi = bright(tint, light);
  return (
    <>
      <defs>
        <VGrad id={`${id}f`} g={g} stops={[[0, hi, 0.42], [0.22, hi, 0.17], [0.5, tint.c1, 0.1], [1, tint.c3, 0.03]]} />
        <VGrad id={`${id}t`} g={g} stops={[[0, tint.c3, 0.2], [1, tint.c3, 0.04]]} />
        <Blur id={`${id}b`} g={g} sd={12} />
      </defs>
      <g style={m.colour ? anim(m, `fw-h-hue ${ott ? 5 : 10}s ease-in-out infinite alternate`) : undefined}>
        <Word text={text} fill={url(`${id}f`)} filter={url(`${id}b`)} op={0.55} />
        <g transform="translate(0 3.5)">
          <Word text={text} fill={url(`${id}t`)} />
        </g>
        <Word text={text} fill={url(`${id}f`)} />
      </g>
      <Sheen text={text} g={g} id={id} m={m} colour={light ? tint.c1 : '#fff'} band={Math.max(100, g.vw * 0.1)} opacity={0.75} secs={ott ? 4.6 : 8} blur={1.5} delays={ott ? [0, 0.9] : [0]} />
    </>
  );
}

/* ---- 7 · Satin: brushed metal in the project colour -------------------------------------------------------------- */

function Satin({ text, g, id, tint, m, light }: VP) {
  const ott = m.level === 'ott';
  const hi = bright(tint, light);
  const deep = mix(tint.c1, 48, '#000');
  const lit = light ? mix(tint.c1, 80, '#fff') : '#fff';
  return (
    <>
      <defs>
        <VGrad id={`${id}f`} g={g} stops={[[0, hi, 0.72], [0.28, tint.c1, 0.56], [0.5, deep, 0.5], [0.72, tint.c1, 0.54], [1, hi, 0.3]]} />
        <Blur id={`${id}b`} g={g} sd={10} />
      </defs>
      <Word text={text} fill={url(`${id}f`)} filter={url(`${id}b`)} op={0.45} />
      <g transform="translate(0 2)"><Word text={text} fill="#000" op={light ? 0.18 : 0.38} /></g>
      <g transform="translate(0 -1.6)"><Word text={text} fill={lit} op={0.26} /></g>
      <Word text={text} fill={url(`${id}f`)} />
      <Sheen text={text} g={g} id={id} m={m} colour={lit} band={Math.max(260, g.vw * 0.3)} opacity={0.34} secs={ott ? 5 : 12} blur={9} />
    </>
  );
}

/* ---- 8 · Mirror: the word stands on a floor and fades away underneath -------------------------------------------- */

function Mirror({ text, g, id, tint, m, light }: VP) {
  const hi = bright(tint, light);
  const gap = 10;
  return (
    <>
      <defs>
        <VGrad id={`${id}f`} g={g} stops={[[0, hi, 0.5], [0.6, tint.c1, 0.2], [1, tint.c1, 0.06]]} />
        {/* Local to the flipped copy: the baseline end is the near end of the reflection. */}
        <VGrad id={`${id}r`} g={g} stops={[[0, tint.c2, 0], [1, tint.c2, 0.26]]} />
        <Blur id={`${id}b`} g={g} sd={14} />
        <Blur id={`${id}b2`} g={g} sd={1.6} />
      </defs>
      <ellipse cx={g.textW / 2} cy={SIZE + gap * 0.6} rx={g.textW * 0.46} ry={13} filter={url(`${id}b`)}
        style={{ fill: tint.c1, opacity: 0.3, ...anim(m, 'fw-h-breathe 6s ease-in-out infinite alternate') }} />
      <g transform={`translate(0 ${SIZE * 2 + gap}) scale(1 -1)`}>
        <Word text={text} fill={url(`${id}r`)} filter={url(`${id}b2`)} />
      </g>
      <Word text={text} fill={url(`${id}f`)} />
    </>
  );
}

/* ---- 9 · Aurora: clouds of colour drifting inside the letters ---------------------------------------------------- */

function Aurora({ text, g, id, tint, m }: VP) {
  const ott = m.level === 'ott';
  const speed = ott ? 2 : 1;
  const cy = g.capTop + CAP_H / 2;
  const r = CAP_H * 0.85;
  const clouds = [
    { c: tint.c1, x: g.vx + g.vw * 0.16, a: 'fw-h-cloud-a', t: 13 },
    { c: tint.c2, x: g.vx + g.vw * 0.5, a: 'fw-h-cloud-b', t: 17 },
    { c: tint.c3, x: g.vx + g.vw * 0.84, a: 'fw-h-cloud-c', t: 11 },
  ];
  return (
    <>
      <defs>
        <VGrad id={`${id}a`} g={g} stops={[[0, '#fff', 1], [0.55, '#fff', 0.55], [1, '#fff', 0.12]]} />
        <Blur id={`${id}b`} g={g} sd={14} />
        <mask id={`${id}m`} maskUnits="userSpaceOnUse" x={g.vx} y={g.vy} width={g.vw} height={g.vh}>
          <Word text={text} fill={url(`${id}a`)} />
        </mask>
      </defs>
      <g mask={url(`${id}m`)}>
        <Full g={g} style={{ fill: mix(tint.c1, 50, tint.c3), opacity: 0.55 }} />
        {clouds.map((c, i) => (
          <circle key={i} cx={c.x} cy={cy} r={r}
            style={{ fill: c.c, opacity: 0.85, filter: 'blur(30px)', transformBox: 'fill-box', transformOrigin: 'center', ...(m.colour ? anim(m, `${c.a} ${c.t / speed}s ease-in-out infinite alternate`) : {}) }} />
        ))}
      </g>
      {ott && (
        <g filter={url(`${id}b`)} style={{ opacity: 0.5 }}>
          <g mask={url(`${id}m`)}>
            {clouds.map((c, i) => (
              <circle key={i} cx={c.x} cy={cy} r={r * 0.7}
                style={{ fill: c.c, filter: 'blur(30px)', transformBox: 'fill-box', transformOrigin: 'center', ...anim(m, `${c.a} ${c.t / speed}s ease-in-out infinite alternate`) }} />
            ))}
          </g>
        </g>
      )}
    </>
  );
}

/* ---- 10 · Prism: three fills out of register; where they overlap the light adds up ------------------------------- */

function PrismLayer({ text, g, id, c, dx, dy, k, amp, px, py, blend, sway, m }: {
  text: string; g: Geom; id: string; c: string; dx: number; dy: number; k: number; amp: number; px: MotionValue<number>; py: MotionValue<number>;
  blend: string; sway: number; m: MotionPreset;
}) {
  const x = useTransform(px, (v) => v * amp * k + dx);
  const y = useTransform(py, (v) => v * amp * 0.6 * k + dy);
  return (
    <motion.g style={{ x, y, mixBlendMode: blend as CSSProperties['mixBlendMode'] }}>
      <defs>
        <VGrad id={id} g={g} stops={[[0, c, 0.62], [0.6, c, 0.26], [1, c, 0.05]]} />
      </defs>
      <g style={{ ...vars({ '--sx': `${sway * k * 9}px`, '--sy': `${sway * k * -4}px` }), ...(sway ? anim(m, `fw-h-sway ${7 + k * 1.5}s ease-in-out infinite`) : {}) }}>
        <Word text={text} fill={url(id)} />
      </g>
    </motion.g>
  );
}

function Prism({ text, g, id, tint, m, light, px, py }: VP) {
  const ott = m.level === 'ott';
  const amp = 30 * m.parallax;
  const blend = light ? 'multiply' : 'screen';
  const sway = m.colour ? 1 : 0;
  const common = { text, g, amp, px, py, blend, m };
  return (
    <>
      <g style={{ isolation: 'isolate' }}>
        <PrismLayer {...common} id={`${id}1`} c={tint.c1} dx={-5} dy={-2} k={-1} sway={sway} />
        <PrismLayer {...common} id={`${id}2`} c={tint.c2} dx={0} dy={0} k={0} sway={0} />
        <PrismLayer {...common} id={`${id}3`} c={tint.c3} dx={5} dy={2} k={1} sway={sway} />
      </g>
      {ott && (
        <>
          <defs>
            <clipPath id={`${id}t`}>
              <rect x={g.vx} y={g.capTop} width={g.vw} height={16} style={anim(m, 'fw-h-tear 3.2s steps(1,end) infinite')} />
            </clipPath>
          </defs>
          <g clipPath={url(`${id}t`)} style={{ transform: 'translateX(18px)' }}>
            <Word text={text} fill={tint.c2} op={0.7} />
          </g>
        </>
      )}
    </>
  );
}

/* ---- 11 · Slice: cut on one line, the halves slide against each other -------------------------------------------- */

function Slice({ text, g, id, tint, m, light, px, progress }: VP) {
  const hi = bright(tint, light);
  const cut = g.capTop + CAP_H * 0.52;
  const lim = Math.min(110 * m.parallax, 300);
  const top = useTransform([progress, px], ([p, x]: number[]) => (p - 0.5) * 2 * lim + x * 24 * m.parallax);
  const bottom = useTransform(top, (v) => -v);
  return (
    <>
      <defs>
        <clipPath id={`${id}u`}><rect x={g.vx - 400} y={g.vy} width={g.vw + 800} height={cut - 1.5 - g.vy} /></clipPath>
        <clipPath id={`${id}d`}><rect x={g.vx - 400} y={cut + 1.5} width={g.vw + 800} height={g.vy + g.vh - cut - 1.5} /></clipPath>
        <VGrad id={`${id}tf`} g={g} stops={[[0, hi, 0.6], [0.52, tint.c1, 0.4], [1, tint.c1, 0.4]]} />
        <VGrad id={`${id}bf`} g={g} stops={[[0, tint.c3, 0.34], [0.52, tint.c3, 0.3], [1, tint.c3, 0.04]]} />
      </defs>
      <g clipPath={url(`${id}u`)}>
        <motion.g style={{ x: top }}><Word text={text} fill={url(`${id}tf`)} /></motion.g>
      </g>
      <g clipPath={url(`${id}d`)}>
        <motion.g style={{ x: bottom }}><Word text={text} fill={url(`${id}bf`)} /></motion.g>
      </g>
    </>
  );
}

/* ---- 12 · Depth: layers at different distances; the far ones are out of focus ------------------------------------ */

function DepthLayer({ text, g, id, d, tint, m, light, px, py, progress }: {
  text: string; g: Geom; id: string; d: number; tint: HeroTint; m: MotionPreset; light: boolean; px: MotionValue<number>; py: MotionValue<number>; progress: MotionValue<number>;
}) {
  const p = m.parallax;
  const ampP = (0.12 + d) * 64 * p;
  const ampS = d * 150 * p;
  const x = useTransform([px, progress], ([a, b]: number[]) => -a * ampP + (0.5 - b) * 2 * ampS);
  const y = useTransform(py, (v) => -v * ampP * 0.6);
  const colour = mix(tint.c1, 100 * d, tint.c3);
  const top = d === 1 ? bright(tint, light) : colour;
  const blur = (1 - d) * 3.4 * Math.min(Math.max(p, 0.6), 1.5);
  return (
    <motion.g style={{ x, y, scale: 1 - (1 - d) * 0.045 * Math.min(p, 1.6), filter: blur > 0.2 ? `blur(${blur}px)` : undefined }}>
      <defs>
        <VGrad id={id} g={g} stops={[[0, top, 0.5], [0.6, colour, 0.28], [1, colour, 0.08]]} />
      </defs>
      <Word text={text} fill={url(id)} op={0.2 + 0.8 * Math.pow(d, 1.5)} />
    </motion.g>
  );
}

function Depth(p: VP) {
  const n = p.m.level === 'ott' ? 7 : 5;
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        <DepthLayer key={i} text={p.text} g={p.g} id={`${p.id}d${i}`} d={i / (n - 1)} tint={p.tint} m={p.m} light={p.light} px={p.px} py={p.py} progress={p.progress} />
      ))}
    </>
  );
}

/* ---- 13 · Long shadow: a soft shadow trailing from the letters; the pointer turns the light ---------------------- */

function ShadeCopy({ text, k, step, ang, range, px, fill, a }: {
  text: string; k: number; step: number; ang: number; range: number; px: MotionValue<number>; fill: string; a: number;
}) {
  const rad = (v: number) => ((ang + v * range) * Math.PI) / 180;
  const x = useTransform(px, (v) => Math.cos(rad(v)) * k * step);
  const y = useTransform(px, (v) => Math.sin(rad(v)) * k * step);
  return (
    <motion.g style={{ x, y }}>
      <Word text={text} fill={fill} op={a} />
    </motion.g>
  );
}

function Longshade({ text, g, id, tint, m, light, px }: VP) {
  const ott = m.level === 'ott';
  const hi = bright(tint, light);
  const n = ott ? 34 : 24;
  // Each copy is faint, and they overlap: the shadow is dense at the letters and thins out along its length.
  return (
    <>
      <defs>
        <VGrad id={`${id}f`} g={g} stops={[[0, hi, 0.62], [0.6, tint.c1, 0.4], [1, tint.c1, 0.26]]} />
      </defs>
      <g>
        {Array.from({ length: n }, (_, i) => n - i).map((k) => (
          <ShadeCopy key={k} text={text} k={k} step={2.3} ang={52} range={m.scale ? 70 * Math.min(m.parallax, 1.6) : 0} px={px} fill={tint.c3} a={0.05} />
        ))}
      </g>
      <Word text={text} fill={url(`${id}f`)} />
    </>
  );
}

const VARIANTS: Record<HeroStyle, (p: VP) => ReactNode> = {
  mist: Mist, radiance: Radiance, airbrush: Airbrush, smoke: Smoke, veil: Veil, glass: Glass, satin: Satin,
  mirror: Mirror, aurora: Aurora, prism: Prism, slice: Slice, depth: Depth, longshade: Longshade,
};

/** Designs that already move with the scroll, so the title does not also slide sideways. */
const OWN_SCROLL: HeroStyle[] = ['slice', 'depth'];

/* ---- the component ------------------------------------------------------------------------------------------------ */

interface HeroTitleProps {
  word: string;
  variant: HeroStyle;
  tint?: HeroTint;
  /** Font size in px: about 88 behind a list (as in the Nexus), up to 160 for a page title. */
  size?: number;
  /** Let the column crop the word (and slide it sideways with the scroll), as the Nexus does; otherwise it shrinks to fit. */
  crop?: boolean;
  /** Bump to play the arrival again. */
  replay?: number;
  /** How much of the cap height the children reach up into (0 to 1). */
  overlap?: number;
  className?: string;
  children?: ReactNode;
}

export default function HeroTitle({ word, variant, tint = SKIN_TINT, size = 88, crop = true, replay = 0, overlap = 0.38, className = '', children }: HeroTitleProps) {
  const m = useMotion();
  const { settings } = useDisplay();
  const outer = useRef<HTMLDivElement>(null);
  const inView = useInView(outer, { margin: '200px' });
  const { px, py } = usePointer(m);
  const { scrollYProgress } = useScroll({ target: outer, offset: ['start end', 'end start'] });
  const id = useId().replace(/:/g, '');
  const text = word.toUpperCase();
  const below = variant === 'mirror' ? CAP_H + 10 : 0;
  const { probe, geom, ready } = useGeom(text, below);

  // The display scale: list size is fixed (the column crops it); page size shrinks to the width it is given.
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = outer.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const k = crop || !width ? size / SIZE : Math.min(size / SIZE, width / geom.textW);

  const slideAmp = crop && !OWN_SCROLL.includes(variant) ? 90 * m.parallax : 0;
  const slideX = useTransform(scrollYProgress, (p) => (0.5 - p) * 2 * slideAmp);

  const Variant = VARIANTS[variant];
  const key = `${replay}-${ready}-${m.level}-${variant}-${word}`;

  return (
    <div
      ref={outer}
      className={`fw-hero ${className}`}
      data-live={inView}
      data-variant={variant}
      style={{ clipPath: crop ? 'inset(-90px 0 -30px 0)' : undefined }}
    >
      <motion.div
        aria-hidden
        className="pointer-events-none relative z-0 select-none"
        style={{ x: slideX, width: geom.vw * k, marginLeft: -PAD * k }}
      >
        <svg
          viewBox={`${geom.vx} ${geom.vy} ${geom.vw} ${geom.vh}`}
          width="100%"
          focusable="false"
          style={{ display: 'block', overflow: 'visible', opacity: ready ? 1 : 0, transition: 'opacity 0.6s ease' }}
        >
          <text ref={probe} x={0} y={SIZE} style={{ ...TEXT_STYLE, visibility: 'hidden' }}>{text}</text>
          <Variant
            key={key}
            text={text}
            g={geom}
            id={id}
            tint={tint}
            m={m}
            light={settings.light}
            live={inView}
            px={px}
            py={py}
            progress={scrollYProgress}
          />
        </svg>
      </motion.div>
      {children !== undefined && (
        <div className="relative z-[1]" style={{ marginTop: -(PAD + below + overlap * CAP_H) * k }}>
          {children}
        </div>
      )}
    </div>
  );
}
