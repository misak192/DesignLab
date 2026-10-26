/**
 * File: src/components/cards/variants.tsx
 * Description: Five designs for the experiment cards (the page selector on the home page). All follow the poster
 * rules: no box, no fill and no border behind text; hairlines, big thin type and the skin colours do the work. All
 * read the MOTION level, so OFF is a still poster and OTT is wild. The home page draws whichever one is chosen on
 * /cards (saved with the other display settings).
 */
"use client";
import { useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import type { Experiment } from '@/lib/experiments';
import type { CardStyle } from '@/lib/display/settings';
import { useMotion } from '@/components/display/DisplayProvider';
import { transitionFor } from '@/lib/motion/presets';

export interface CardProps {
  experiment: Experiment;
  index: number;
  /** On the design page: look and move like the card, but don't navigate. */
  preview?: boolean;
}

const pad = (i: number) => String(i + 1).padStart(2, '0');

function CardLink({ experiment, preview, className, children }: { experiment: Experiment; preview?: boolean; className?: string; children: ReactNode }) {
  if (preview) {
    return (
      <div tabIndex={0} className={className}>
        {children}
      </div>
    );
  }
  return (
    <Link href={experiment.href} className={className}>
      {children}
    </Link>
  );
}

/** The arrival of a card: rises out of a blur, one after another. */
function useArrival(index: number) {
  const m = useMotion();
  return {
    initial: m.scale ? { opacity: 0, y: m.rise, filter: `blur(${m.blur}px)` } : false,
    animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
    transition: transitionFor(m, 0.7, 0.1 + index * m.stagger),
  } as const;
}

/* 1 · LINE: a number, a title, a sentence, and a hairline that fills with colour. */
export function LineCard({ experiment, index, preview }: CardProps) {
  const m = useMotion();
  const arrival = useArrival(index);
  return (
    <motion.li {...arrival}>
      <motion.div initial="rest" whileHover="hover" whileFocus="hover" animate="rest" className="h-full">
        <CardLink experiment={experiment} preview={preview} className="flex h-full min-h-[48px] flex-col gap-5 py-2 outline-offset-8">
          <div className="flex items-baseline gap-3">
            <span className="fw-kicker fw-tabular text-t1">{pad(index)}</span>
            <span className="fw-kicker text-ink-2">{experiment.tag}</span>
          </div>
          <h2 className="fw-big text-[29px] font-light leading-[1.15] text-ink">{experiment.title}</h2>
          <p className="max-w-[44ch] text-[1.0625rem] font-light leading-[1.5] text-ink-2">{experiment.blurb}</p>
          <div className="mt-auto flex items-center gap-4 pt-3">
            <span className="relative block h-px flex-1 bg-rail">
              <motion.span
                className="absolute inset-y-0 left-0 block bg-t1"
                variants={{ rest: { width: '14%' }, hover: { width: '100%' } }}
                transition={transitionFor(m, 0.6)}
              />
            </span>
            <motion.span
              aria-hidden
              className="fw-big text-[22px] font-light text-t1"
              variants={{ rest: { x: 0 }, hover: { x: 6 * Math.min(m.parallax, 3) } }}
              transition={transitionFor(m, 0.4)}
            >
              →
            </motion.span>
          </div>
        </CardLink>
      </motion.div>
    </motion.li>
  );
}

/* 2 · INDEX: a huge thin number beside the words, like a contents page. The number lights up and slides. */
export function IndexCard({ experiment, index, preview }: CardProps) {
  const m = useMotion();
  const arrival = useArrival(index);
  return (
    <motion.li {...arrival}>
      <motion.div initial="rest" whileHover="hover" whileFocus="hover" animate="rest">
        <CardLink experiment={experiment} preview={preview} className="flex min-h-[48px] items-center gap-6 py-4 outline-offset-8">
          <motion.span
            aria-hidden
            className="fw-big fw-tabular text-[clamp(72px,13vw,140px)] font-extralight leading-none text-ink-3"
            variants={{
              rest: { x: 0, color: 'var(--ink-3)' },
              hover: { x: 10 * m.parallax, color: 'var(--t1)', skewX: m.glitch ? -8 : 0 },
            }}
            transition={transitionFor(m, 0.5)}
          >
            {pad(index)}
          </motion.span>
          <span className="flex min-w-0 flex-col gap-2">
            <span className="fw-kicker text-ink-2">{experiment.tag}</span>
            <motion.span
              className="fw-big text-[29px] font-light leading-[1.15] text-ink"
              variants={{ rest: { x: 0 }, hover: { x: 6 * m.parallax } }}
              transition={transitionFor(m, 0.5, 0.04)}
            >
              {experiment.title}
            </motion.span>
            <span className="max-w-[40ch] text-[1.0625rem] font-light leading-[1.45] text-ink-2">{experiment.blurb}</span>
            <span className="relative mt-2 block h-px w-full bg-rail">
              <motion.span
                className="absolute inset-y-0 left-0 block bg-t1"
                variants={{ rest: { width: '0%' }, hover: { width: '100%' } }}
                transition={transitionFor(m, 0.7)}
              />
            </span>
          </span>
        </CardLink>
      </motion.div>
    </motion.li>
  );
}

/* 3 · SPOTLIGHT: a soft glow in the skin colour follows the pointer; the words lift into it. */
export function SpotlightCard({ experiment, index, preview }: CardProps) {
  const m = useMotion();
  const arrival = useArrival(index);
  const [hot, setHot] = useState(false);
  const x = useMotionValue(50);
  const y = useMotionValue(50);
  const sx = useSpring(x, { stiffness: 160, damping: 22 });
  const sy = useSpring(y, { stiffness: 160, damping: 22 });
  const bg = useTransform([sx, sy], ([px, py]) => `radial-gradient(circle at ${px}% ${py}%, color-mix(in srgb, var(--t1) ${m.colour ? 30 : 16}%, transparent), transparent 62%)`);

  return (
    <motion.li {...arrival}>
      <div
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          x.set(((e.clientX - r.left) / r.width) * 100);
          y.set(((e.clientY - r.top) / r.height) * 100);
        }}
        onPointerEnter={() => setHot(true)}
        onPointerLeave={() => setHot(false)}
        onFocus={() => setHot(true)}
        onBlur={() => setHot(false)}
        className="relative"
      >
        {m.scale > 0 && (
          <motion.span
            aria-hidden
            style={{ backgroundImage: bg }}
            animate={{ opacity: hot ? 1 : 0 }}
            transition={transitionFor(m, 0.5)}
            className="pointer-events-none absolute -inset-x-8 -inset-y-6"
          />
        )}
        <CardLink experiment={experiment} preview={preview} className="relative flex min-h-[48px] flex-col gap-4 py-3 outline-offset-8">
          <span className="fw-kicker text-t1">
            <span className="fw-tabular">{pad(index)}</span> <span className="text-ink-2">{experiment.tag}</span>
          </span>
          <motion.span
            animate={{ y: hot && m.scale ? -4 * m.parallax : 0 }}
            transition={transitionFor(m, 0.5)}
            className="fw-big text-[29px] font-light leading-[1.15] text-ink"
          >
            {experiment.title}
          </motion.span>
          <motion.span
            animate={{ y: hot && m.scale ? -2 * m.parallax : 0 }}
            transition={transitionFor(m, 0.5, 0.03)}
            className="max-w-[44ch] text-[1.0625rem] font-light leading-[1.5] text-ink-2"
          >
            {experiment.blurb}
          </motion.span>
        </CardLink>
      </div>
    </motion.li>
  );
}

/* 4 · TILT: the words sit on separate layers in 3D; the card leans toward the pointer and the layers part. */
export function TiltCard({ experiment, index, preview }: CardProps) {
  const m = useMotion();
  const arrival = useArrival(index);
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, m.spring ?? { stiffness: 140, damping: 18 });
  const sy = useSpring(py, m.spring ?? { stiffness: 140, damping: 18 });
  const rotY = useTransform(sx, [-0.5, 0.5], [-m.tilt * 1.6, m.tilt * 1.6]);
  const rotX = useTransform(sy, [-0.5, 0.5], [m.tilt * 1.6, -m.tilt * 1.6]);
  const ref = useRef<HTMLDivElement>(null);

  return (
    <motion.li {...arrival} className="[perspective:900px]">
      <motion.div
        ref={ref}
        onPointerMove={(e) => {
          const r = ref.current?.getBoundingClientRect();
          if (!r || !m.scale) return;
          px.set((e.clientX - r.left) / r.width - 0.5);
          py.set((e.clientY - r.top) / r.height - 0.5);
        }}
        onPointerLeave={() => {
          px.set(0);
          py.set(0);
        }}
        style={{ rotateX: rotX, rotateY: rotY, transformStyle: 'preserve-3d' }}
      >
        <CardLink experiment={experiment} preview={preview} className="flex min-h-[48px] flex-col gap-4 py-3 outline-offset-8 [transform-style:preserve-3d]">
          <span className="fw-kicker text-t1" style={{ transform: 'translateZ(30px)' }}>
            <span className="fw-tabular">{pad(index)}</span> <span className="text-ink-2">{experiment.tag}</span>
          </span>
          <span className="fw-big text-[29px] font-light leading-[1.15] text-ink" style={{ transform: 'translateZ(70px)' }}>
            {experiment.title}
          </span>
          <span className="max-w-[44ch] text-[1.0625rem] font-light leading-[1.5] text-ink-2" style={{ transform: 'translateZ(40px)' }}>
            {experiment.blurb}
          </span>
          <span aria-hidden className="block h-px w-2/3 bg-t1" style={{ transform: 'translateZ(10px)' }} />
        </CardLink>
      </motion.div>
    </motion.li>
  );
}

/* 5 · ECHO: the title is repeated as faint outlines that fan out behind it on hover; tracking opens up. */
export function EchoCard({ experiment, index, preview }: CardProps) {
  const m = useMotion();
  const arrival = useArrival(index);
  return (
    <motion.li {...arrival}>
      <motion.div initial="rest" whileHover="hover" whileFocus="hover" animate="rest">
        <CardLink experiment={experiment} preview={preview} className="flex min-h-[48px] flex-col gap-4 py-3 outline-offset-8">
          <span className="fw-kicker text-t1">
            <span className="fw-tabular">{pad(index)}</span> <span className="text-ink-2">{experiment.tag}</span>
          </span>

          <span className="relative block">
            {[3, 2, 1].map((n) => (
              <motion.span
                key={n}
                aria-hidden
                className="fw-vogue pointer-events-none absolute inset-0 text-[1.5rem] leading-[1.2] text-transparent"
                style={{ WebkitTextStroke: '1px var(--t3)', textShadow: 'none' }}
                variants={{
                  rest: { x: 0, y: 0, opacity: 0 },
                  hover: { x: n * 9 * m.parallax, y: n * 7 * m.parallax, opacity: 0.8 - n * 0.18 },
                }}
                transition={transitionFor(m, 0.5, n * 0.03)}
              >
                {experiment.title}
              </motion.span>
            ))}
            <motion.span
              className="fw-vogue relative block text-[1.5rem] leading-[1.2] text-ink"
              variants={{ rest: { letterSpacing: '0.35em' }, hover: { letterSpacing: m.scale ? '0.5em' : '0.35em' } }}
              transition={transitionFor(m, 0.6)}
            >
              {experiment.title}
            </motion.span>
          </span>

          <span className="max-w-[44ch] pt-4 text-[1.0625rem] font-light leading-[1.5] text-ink-2">{experiment.blurb}</span>
        </CardLink>
      </motion.div>
    </motion.li>
  );
}

export const CARD_COMPONENTS: Record<CardStyle, (props: CardProps) => ReactNode> = {
  line: LineCard,
  index: IndexCard,
  spotlight: SpotlightCard,
  tilt: TiltCard,
  echo: EchoCard,
};

export const CARD_INFO: Record<CardStyle, { name: string; note: string }> = {
  line: { name: 'Line', note: 'A number, a title, a sentence; a hairline fills with colour and the arrow leans.' },
  index: { name: 'Index', note: 'A huge thin number beside the words, like a contents page. It lights up and slides.' },
  spotlight: { name: 'Spotlight', note: 'A soft glow in the skin colour follows the pointer; the words lift into it.' },
  tilt: { name: 'Tilt', note: 'The words sit on separate layers in 3D. The card leans toward the pointer and the layers part.' },
  echo: { name: 'Echo', note: 'The title is repeated as faint outlines that fan out behind it; the tracking opens up.' },
};
