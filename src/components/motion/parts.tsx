/**
 * File: src/components/motion/parts.tsx
 * Description: The small kinetic building blocks of the /motion page. Every one reads its feel from the current MOTION
 * level (src/lib/motion/presets.ts), so switching OFF / NORMAL / COLOUR / OTT in the Sovereign header, or on the
 * page, changes all of them the same way. They are plain building blocks: copy one into a component when it works.
 */
"use client";
import { useRef, useState, type ReactNode } from 'react';
import {
  AnimatePresence,
  motion,
  useAnimationFrame,
  type MotionValue,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from 'framer-motion';
import { useMotion } from '@/components/display/DisplayProvider';
import { transitionFor } from '@/lib/motion/presets';

/** A numbered section header: kicker number in T1, word in ink, one statement under it. */
export function Section({ n, title, statement, children }: { n: string; title: string; statement: string; children: ReactNode }) {
  return (
    <section aria-labelledby={`s-${n}`} className="flex flex-col gap-8 pt-24">
      <div className="flex flex-col gap-3">
        <div className="flex items-baseline gap-3">
          <span className="fw-kicker fw-tabular text-t1">{n}</span>
          <h2 id={`s-${n}`} className="fw-kicker text-ink">
            {title}
          </h2>
        </div>
        <p className="fw-big max-w-[34ch] text-[29px] font-light leading-[1.25] text-ink">{statement}</p>
      </div>
      {children}
    </section>
  );
}

/** Replay button, quiet. */
export function Replay({ onClick, label = 'Replay' }: { onClick: () => void; label?: string }) {
  return (
    <button type="button" onClick={onClick} className="fw-kicker min-h-[48px] w-fit text-t1 transition-colors hover:text-ink">
      ↻ {label}
    </button>
  );
}

/** Words that rise out of a blur one after another. The travel, blur, stagger and spring are the level's. */
export function KineticWords({ text, replay, className = '' }: { text: string; replay: number; className?: string }) {
  const m = useMotion();
  return (
    <span key={`${replay}-${m.level}`} className={className}>
      {text.split(' ').map((word, i) => (
        <motion.span
          key={i}
          className={`inline-block ${m.glitch ? 'fw-fringe' : ''}`}
          style={m.glitch ? { animationDelay: `${i * m.stagger}s` } : undefined}
          initial={m.scale ? { opacity: 0, y: m.rise, filter: `blur(${m.blur}px)` } : false}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={transitionFor(m, 0.8, i * m.stagger)}
        >
          {word}&nbsp;
        </motion.span>
      ))}
    </span>
  );
}

/** A Vogue title whose tracking opens up when you hover or focus it. */
export function SpreadTitle({ text }: { text: string }) {
  const m = useMotion();
  const [on, setOn] = useState(false);
  return (
    <motion.h3
      tabIndex={0}
      onHoverStart={() => setOn(true)}
      onHoverEnd={() => setOn(false)}
      onFocus={() => setOn(true)}
      onBlur={() => setOn(false)}
      animate={{
        letterSpacing: on && m.scale ? '0.55em' : '0.35em',
        skewX: on && m.glitch ? -10 : 0,
        x: on && m.scale ? 6 * m.parallax : 0,
      }}
      transition={transitionFor(m, 0.7)}
      className={`fw-vogue w-fit cursor-default max-w-full overflow-hidden text-[clamp(24px,5vw,56px)] leading-[1.15] text-ink ${m.glitch ? 'fw-fringe-hover' : ''}`}
    >
      {text}
    </motion.h3>
  );
}

/** Letters that lean away from the pointer. Strength follows the level's parallax; colour and ott also light the letters. */
export function ProximityText({ text }: { text: string }) {
  const m = useMotion();
  const box = useRef<HTMLDivElement>(null);

  const onMove = (e: React.PointerEvent) => {
    if (!m.parallax || !box.current) return;
    const R = 150;
    box.current.querySelectorAll<HTMLElement>('[data-l]').forEach((el) => {
      const r = el.getBoundingClientRect();
      const dx = r.left + r.width / 2 - e.clientX;
      const dy = r.top + r.height / 2 - e.clientY;
      const d = Math.hypot(dx, dy);
      const f = Math.max(0, 1 - d / R);
      const push = f * 26 * m.parallax;
      el.style.transform = `translate(${(dx / (d || 1)) * push}px, ${(dy / (d || 1)) * push}px) scale(${1 + f * 0.5 * Math.min(m.parallax, 1.6)})`;
      el.style.color = m.colour && f > 0.05 ? `color-mix(in srgb, var(--t1) ${Math.round(f * 100)}%, var(--ink))` : '';
    });
  };
  const onLeave = () => {
    box.current?.querySelectorAll<HTMLElement>('[data-l]').forEach((el) => {
      el.style.transform = '';
      el.style.color = '';
    });
  };

  return (
    <div
      ref={box}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      aria-label={text}
      className="fw-big flex w-fit flex-wrap py-8 text-[clamp(34px,8vw,88px)] font-extralight leading-[1.1] text-ink"
    >
      {text.split('').map((ch, i) => (
        <span
          key={i}
          data-l
          aria-hidden
          className="inline-block whitespace-pre transition-[transform,color] duration-300 ease-out"
        >
          {ch}
        </span>
      ))}
    </div>
  );
}

const wrap = (min: number, max: number, v: number) => {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
};

/** A ticker that drifts, speeds up with scroll velocity and leans into it. */
export function VelocityMarquee({ text }: { text: string }) {
  const m = useMotion();
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, { damping: 50, stiffness: 400 });
  const skew = useTransform(smooth, [-3000, 3000], [-16 * m.parallax, 16 * m.parallax]);
  const base = useMotionValue(0);
  const x = useTransform(base, (v) => `${wrap(-25, 0, v)}%`);

  useAnimationFrame((_, delta) => {
    if (!m.scale) return;
    const v = smooth.get();
    const dir = v < 0 ? -1 : 1;
    base.set(base.get() - (0.8 * m.scale + Math.abs(v) * 0.0009 * m.parallax * dir) * (delta / 16));
  });

  const line = `${text} · `.repeat(4);
  return (
    <div className="overflow-hidden py-6" aria-label={text} role="img">
      <motion.div style={{ x, skewX: skew }} className="fw-vogue flex w-max whitespace-nowrap text-[clamp(30px,6vw,72px)] text-ink-2">
        <span aria-hidden>{line}</span>
        <span aria-hidden>{line}</span>
        <span aria-hidden>{line}</span>
        <span aria-hidden>{line}</span>
      </motion.div>
    </div>
  );
}

/** Layers that slide at different speeds as the section scrolls through the viewport. */
export function ScrollParallax() {
  const m = useMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const p = m.parallax;
  const back = useTransform(scrollYProgress, [0, 1], [-70 * p, 70 * p]);
  const mid = useTransform(scrollYProgress, [0, 1], [-170 * p, 170 * p]);
  const front = useTransform(scrollYProgress, [0, 1], [-320 * p, 320 * p]);
  const drift = useTransform(scrollYProgress, [0, 1], [-120 * p, 120 * p]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1 - 0.06 * p, 1, 1 + 0.06 * p]);
  const driftBack = useTransform(drift, (v) => -v);

  return (
    <div ref={ref} className="relative h-[78vh] min-h-[460px] overflow-hidden">
      <motion.div style={{ y: back, scale }} className="fw-big pointer-events-none absolute inset-0 grid place-items-center">
        <span className="select-none text-[clamp(90px,24vw,300px)] font-extralight leading-none tracking-[-0.02em] text-ink-3">DEPTH</span>
      </motion.div>

      <motion.div style={{ x: drift }} aria-hidden className="absolute inset-x-0 top-[34%] h-px bg-rail" />
      <motion.div style={{ x: driftBack }} aria-hidden className="absolute inset-x-0 top-[62%] h-px bg-rail" />

      <motion.div style={{ y: mid }} aria-hidden className="pointer-events-none absolute inset-0">
        {[
          ['14%', '22%', 8],
          ['72%', '30%', 5],
          ['40%', '58%', 11],
          ['86%', '66%', 6],
          ['26%', '80%', 5],
        ].map(([left, top, size], i) => (
          <span
            key={i}
            className="absolute rounded-full bg-t1"
            style={{ left: left as string, top: top as string, width: size as number, height: size as number }}
          />
        ))}
      </motion.div>

      <motion.p
        style={{ y: front }}
        className="fw-big absolute left-0 top-1/2 max-w-[18ch] text-[29px] font-light leading-[1.25] text-ink"
      >
        Near things move fast. Far things barely move.
      </motion.p>
      <motion.span style={{ y: front }} className="fw-kicker absolute bottom-[14%] right-0 text-t1">
        Scroll ↕
      </motion.span>
    </div>
  );
}

function useLayer(sx: MotionValue<number>, sy: MotionValue<number>, depth: number, p: number) {
  return {
    x: useTransform(sx, [-0.5, 0.5], [-depth * p, depth * p]),
    y: useTransform(sy, [-0.5, 0.5], [-depth * p * 0.7, depth * p * 0.7]),
  };
}

/** A composition that follows the pointer layer by layer, and tilts. COLOUR and OTT add a glow under the pointer. */
export function PointerParallax() {
  const m = useMotion();
  const ref = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, m.spring ?? { stiffness: 120, damping: 20 });
  const sy = useSpring(py, m.spring ?? { stiffness: 120, damping: 20 });
  const p = m.parallax;

  const rotY = useTransform(sx, [-0.5, 0.5], [-m.tilt, m.tilt]);
  const rotX = useTransform(sy, [-0.5, 0.5], [m.tilt, -m.tilt]);
  const l1 = useLayer(sx, sy, 18, p);
  const l2 = useLayer(sx, sy, 44, p);
  const l3 = useLayer(sx, sy, 84, p);
  const glowX = useTransform(sx, [-0.5, 0.5], ['0%', '100%']);
  const glowY = useTransform(sy, [-0.5, 0.5], ['0%', '100%']);

  const onMove = (e: React.PointerEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r || !m.scale) return;
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    px.set(0);
    py.set(0);
  };

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className="relative grid h-[420px] place-items-center overflow-hidden [perspective:900px]"
    >
      {m.colour && (
        <motion.span
          aria-hidden
          style={{ left: glowX, top: glowY }}
          className="pointer-events-none absolute h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--t1)_28%,transparent),transparent)]"
        />
      )}
      <motion.div style={{ rotateX: rotX, rotateY: rotY, transformStyle: 'preserve-3d' }} className="relative grid size-full place-items-center">
        <motion.span aria-hidden style={l1} className="absolute size-[300px] rounded-full border border-rail" />
        <motion.span aria-hidden style={l2} className="absolute size-[180px] rounded-full border border-t3" />
        <motion.h3 style={l3} className="fw-vogue relative text-[clamp(28px,5vw,52px)] leading-none text-ink">
          Pointer
        </motion.h3>
        <motion.span aria-hidden style={l3} className="absolute right-[18%] top-[22%] size-2 rounded-full bg-t1" />
        <motion.span aria-hidden style={l2} className="fw-kicker absolute bottom-[16%] left-[16%] text-t1">
          Layers
        </motion.span>
      </motion.div>
    </div>
  );
}

/** A number that rolls when it changes. */
export function RollingCount() {
  const m = useMotion();
  const [n, setN] = useState(11);
  const [dir, setDir] = useState(1);
  const bump = (d: 1 | -1) => {
    setDir(d);
    setN((v) => v + d);
  };
  return (
    <div className="flex items-center gap-6">
      <PressText onClick={() => bump(-1)}>− Down</PressText>
      <span className="relative grid h-[64px] min-w-[3ch] place-items-center overflow-hidden text-[40px] font-light leading-none text-t2">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={n}
            initial={m.scale ? { y: 28 * dir * Math.max(1, m.parallax), opacity: 0, filter: `blur(${m.blur / 2}px)` } : false}
            animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
            exit={m.scale ? { y: -28 * dir, opacity: 0 } : { opacity: 0 }}
            transition={transitionFor(m, 0.35)}
            className="fw-tabular"
          >
            {n}
          </motion.span>
        </AnimatePresence>
      </span>
      <PressText onClick={() => bump(1)}>Up +</PressText>
    </div>
  );
}

/** A text button with press feedback: it lifts on hover and sinks on press (a spring that overshoots in OTT). */
export function PressText({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  const m = useMotion();
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={m.scale ? { y: -3 * Math.min(m.parallax, 2), letterSpacing: '0.12em' } : undefined}
      whileTap={m.scale ? { scale: m.spring ? 0.82 : 0.94 } : undefined}
      transition={m.scale ? (m.spring ? { type: 'spring', ...m.spring } : { duration: 0.3, ease: m.ease as unknown as [number, number, number, number] }) : { duration: 0 }}
      className="fw-big min-h-[48px] text-[22px] font-light uppercase tracking-[0.08em] text-ink transition-colors hover:text-t1"
    >
      {children}
    </motion.button>
  );
}

/** Rows that arrive one by one, and travel when hovered. */
export function StaggerList({ replay }: { replay: number }) {
  const m = useMotion();
  const rows = ['Read it slowly', 'Say it in your own words', 'Come back to it later', 'Watch it connect', 'Keep what matters'];
  return (
    <ul key={`${replay}-${m.level}`} className="flex flex-col">
      {rows.map((row, i) => (
        <motion.li
          key={row}
          initial={m.scale ? { opacity: 0, x: -m.rise * 2, filter: `blur(${m.blur}px)` } : false}
          animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
          transition={transitionFor(m, 0.6, i * m.stagger)}
          whileHover={m.scale ? { x: 10 * Math.min(m.parallax, 2.6) } : undefined}
          className="fw-big flex min-h-[48px] cursor-default items-center gap-4 text-[22px] font-light text-ink"
        >
          <span className="fw-kicker fw-tabular w-8 text-t1">{String(i + 1).padStart(2, '0')}</span>
          {row}
        </motion.li>
      ))}
    </ul>
  );
}

/** Colour drift: a gradient that slides through the skin's own colours. Only COLOUR and OTT; otherwise plain ink. */
export function ColourDrift({ text }: { text: string }) {
  const m = useMotion();
  return (
    <p
      className={`text-[clamp(34px,8vw,88px)] font-extralight leading-[1.1] ${m.colour ? 'fw-gradient-text fw-drift' : 'fw-big text-ink'}`}
    >
      {text}
    </p>
  );
}
