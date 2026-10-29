/**
 * File: src/components/experiments/glass/GlassLab.tsx
 * Description: Glass and refraction: frosted panels that bend and refract the background beneath them
 * using backdrop-filter blur and SVG displacement map refraction with chromatic dispersion.
 */
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function GlassLab() {
  const [refractionScale, setRefractionScale] = useState(24);
  const [blurAmount, setBlurAmount] = useState(22);
  const [chromatic, setChromatic] = useState(true);

  return (
    <main className="mx-auto flex w-full max-w-[1100px] flex-1 flex-col px-7 pb-40 pt-10 sm:pt-14">
      {/* SVG Displacement Filter definition */}
      <svg className="hidden" aria-hidden="true">
        <defs>
          <filter id="fw-glass-displacement" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.035"
              numOctaves="3"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={refractionScale}
              xChannelSelector="R"
              yChannelSelector="G"
              result="displaced"
            />
          </filter>
        </defs>
      </svg>

      <header className="flex flex-col gap-8 pb-10">
        <Link href="/" className="fw-kicker w-fit text-ink-2 hover:text-ink transition-colors">
          ← Design Lab
        </Link>
        <h1 className="fw-vogue text-[clamp(30px,7vw,64px)] leading-[1.1] text-ink">
          Glass & Refraction
        </h1>
        <p className="fw-big max-w-[32ch] text-[29px] font-light leading-[1.25] text-ink">
          Frosted panels that physically bend the background beneath them.
        </p>
        <p className="max-w-[62ch] text-[1.0625rem] font-light leading-[1.5] text-ink-2">
          Beyond standard translucent overlays. By combining backdrop-filter blur with SVG displacement maps
          and chromatic aberration, the glass pane exerts genuine optical refraction on the type and graphics beneath.
        </p>
      </header>

      {/* Interactive Refraction Stage */}
      <section className="flex flex-col gap-8 pt-4">
        <div className="relative h-[480px] w-full overflow-hidden border border-[var(--rail)] select-none">
          {/* Background Graphic Field Being Refracted */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 gap-6 pointer-events-none">
            {/* High-contrast geometric grid lines */}
            <div className="absolute inset-0 opacity-20">
              <div className="size-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]" />
            </div>

            {/* Radiant glowing orbs */}
            <div className="absolute -top-12 -left-12 size-72 rounded-full bg-[var(--t1)]/30 blur-[60px]" />
            <div className="absolute -bottom-16 -right-16 size-80 rounded-full bg-[var(--t2)]/30 blur-[70px]" />
            <div className="absolute top-1/3 left-1/4 size-44 rounded-full bg-[#FF2FA6]/25 blur-[50px]" />

            {/* Poster typography beneath the glass */}
            <span className="fw-kicker text-[13px] tracking-[0.45em] text-t1">
              OPTICAL LENS SPECIFICATION
            </span>
            <h2 className="fw-vogue text-[clamp(36px,6vw,72px)] tracking-[0.25em] text-center text-ink">
              REFRACTION FIELD
            </h2>
            <p className="fw-big max-w-[32ch] text-[22px] font-light text-center text-ink-2">
              Drag the frosted glass lens across these words to observe optical distortion.
            </p>
            <div className="flex gap-8 text-[12px] font-mono text-ink-3">
              <span>N: 1.5168</span>
              <span>&bull;</span>
              <span>ABBE: 64.2</span>
              <span>&bull;</span>
              <span>DISPERSION: TRUE</span>
            </div>
          </div>

          {/* Draggable Frosted Glass Lens */}
          <motion.div
            drag
            dragConstraints={{ left: -140, right: 140, top: -100, bottom: 100 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[420px] p-8 cursor-grab active:cursor-grabbing"
            style={{
              backdropFilter: `blur(${blurAmount}px)`,
              WebkitBackdropFilter: `blur(${blurAmount}px)`,
              background: 'color-mix(in srgb, var(--canvas) 32%, transparent)',
              border: '1px solid color-mix(in srgb, var(--ink) 25%, transparent)',
              boxShadow: chromatic
                ? '0 24px 60px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.1), 0 0 20px rgba(0,242,254,0.15)'
                : '0 24px 60px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.08)',
              filter: refractionScale > 0 ? 'url(#fw-glass-displacement)' : 'none',
            }}
          >
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-baseline">
                <span className="fw-kicker text-[10px] text-t1">FROSTED LENS</span>
                <span className="fw-tabular text-[11px] text-ink-3">DRAG ME</span>
              </div>
              <h3 className="fw-big text-[20px] font-light text-ink">
                Refractive Lens Panel
              </h3>
              <p className="text-[13px] font-light leading-[1.45] text-ink-2">
                This panel bends and displaces the background light rays in real time as you move it across the canvas.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Refraction Controls */}
        <div className="grid gap-8 sm:grid-cols-3 border-t border-[var(--rail)]/50 pt-6">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-baseline">
              <span className="fw-kicker text-[11px] text-ink-2">Refraction Displacement</span>
              <span className="fw-tabular text-[12px] text-t1">{refractionScale}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="45"
              step="1"
              value={refractionScale}
              onChange={(e) => setRefractionScale(parseInt(e.target.value))}
              className="w-full accent-[var(--t1)] cursor-pointer"
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-baseline">
              <span className="fw-kicker text-[11px] text-ink-2">Frost Blur Amount</span>
              <span className="fw-tabular text-[12px] text-t1">{blurAmount}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              step="1"
              value={blurAmount}
              onChange={(e) => setBlurAmount(parseInt(e.target.value))}
              className="w-full accent-[var(--t1)] cursor-pointer"
            />
          </div>

          <div className="flex flex-col gap-2 justify-center">
            <span className="fw-kicker text-[11px] text-ink-2">Chromatic Dispersion</span>
            <button
              type="button"
              onClick={() => setChromatic((v) => !v)}
              className="fw-big text-[15px] font-light text-left text-ink hover:text-t1 transition-colors min-h-[36px]"
            >
              {chromatic ? '● CHROMATIC GLOW ON' : '○ NEUTRAL REFRACTION'}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
