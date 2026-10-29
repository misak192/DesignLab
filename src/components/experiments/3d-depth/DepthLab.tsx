/**
 * File: src/components/experiments/3d-depth/DepthLab.tsx
 * Description: Scroll-driven 3D depth: physical UI layers that tilt and separate along the Z-axis
 * as you scroll, with letter-coded typography floating weightlessly between them.
 */
"use client";

import { useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { useMotion } from '@/components/display/DisplayProvider';

export default function DepthLab() {
  const m = useMotion();
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [driveWithScroll, setDriveWithScroll] = useState(true);
  const [manualTilt, setManualTilt] = useState(18);
  const [manualSeparation, setManualSeparation] = useState(1.0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    if (driveWithScroll && m.scale !== 0) {
      setManualTilt(Math.round(8 + latest * 26));
      setManualSeparation(Number((0.6 + latest * 1.2).toFixed(2)));
    }
  });

  const activeRotateX = m.scale === 0 ? 0 : manualTilt;
  const activeSeparation = m.scale === 0 ? 0 : manualSeparation;

  return (
    <main className="mx-auto flex w-full max-w-[1100px] flex-1 flex-col px-7 pb-40 pt-10 sm:pt-14">
      <header className="flex flex-col gap-8 pb-10">
        <Link href="/" className="fw-kicker w-fit text-ink-2 hover:text-ink transition-colors">
          ← Design Lab
        </Link>
        <h1 className="fw-vogue text-[clamp(30px,7vw,64px)] leading-[1.1] text-ink">
          Scroll-Driven 3D Depth
        </h1>
        <p className="fw-big max-w-[32ch] text-[29px] font-light leading-[1.25] text-ink">
          Layers that tilt and separate as you scroll, with letter-coded type floating between them.
        </p>
        <p className="max-w-[62ch] text-[1.0625rem] font-light leading-[1.5] text-ink-2">
          Spatial interface architecture in real 3D depth (`transform-style: preserve-3d`).
          As you scroll past this chamber, perspective planes drift apart along the Z-axis, revealing the
          dimensional relationship between typography, background fields, and UI telemetry.
        </p>
      </header>

      {/* 3D Depth Chamber */}
      <section ref={containerRef} className="flex flex-col gap-8 pt-4">
        <div
          className="relative h-[560px] w-full overflow-hidden border border-[var(--rail)] flex items-center justify-center select-none"
          style={{
            perspective: '1200px',
            perspectiveOrigin: '50% 50%',
          }}
        >
          {/* Depth Rig */}
          <motion.div
            style={{
              transformStyle: 'preserve-3d',
              rotateX: activeRotateX,
              rotateY: -10,
            }}
            className="relative size-[340px] sm:size-[460px] transition-transform duration-300"
          >
            {/* Layer 0 · Deep Ground (Z: -160px) */}
            <div
              className="absolute inset-0 border border-[var(--rail)]/60 bg-[var(--canvas)]/40 p-6 flex flex-col justify-between"
              style={{
                transform: `translateZ(${-160 * activeSeparation}px)`,
                transformStyle: 'preserve-3d',
              }}
            >
              <div className="flex justify-between text-[11px] text-ink-3">
                <span className="fw-kicker text-t3">LAYER 00 &bull; GROUND</span>
                <span className="fw-tabular">Z: {-160 * activeSeparation}PX</span>
              </div>
              <div className="size-full opacity-15 bg-[radial-gradient(#00f2fe_1px,transparent_1px)] [background-size:16px_16px]" />
              <span className="text-[10px] text-ink-3 font-mono">COORDINATES [X, Y, -160]</span>
            </div>

            {/* Layer 1 · Mid Wireframe Grid (Z: -60px) */}
            <div
              className="absolute inset-6 border border-t1/30 p-6 flex flex-col justify-between"
              style={{
                transform: `translateZ(${-60 * activeSeparation}px)`,
                transformStyle: 'preserve-3d',
              }}
            >
              <div className="flex justify-between text-[11px] text-t1">
                <span className="fw-kicker">LAYER 01 &bull; TOPOLOGY</span>
                <span className="fw-tabular">Z: {-60 * activeSeparation}PX</span>
              </div>
              <div className="flex items-center justify-center">
                <div className="size-36 border border-dashed border-t1/40 rounded-full animate-spin [animation-duration:24s]" />
              </div>
              <span className="text-[10px] text-t1/60 font-mono">RESONANCE MATRIX L1</span>
            </div>

            {/* Layer 2 · Floating Typographic Plane (Z: +60px) */}
            <div
              className="absolute inset-10 p-6 flex flex-col justify-center items-center text-center gap-3"
              style={{
                transform: `translateZ(${60 * activeSeparation}px)`,
                transformStyle: 'preserve-3d',
              }}
            >
              <span className="fw-kicker text-[11px] text-t1 tracking-[3px]">
                FLOATING TYPE LAYER
              </span>
              <h2 className="fw-vogue text-[clamp(26px,4vw,40px)] text-ink leading-[1.15]">
                TRUTH IS INTERNAL
              </h2>
              <p className="fw-big text-[15px] font-light text-ink-2 max-w-[24ch]">
                Never a vanity badge &bull; Weightless in space
              </p>
            </div>

            {/* Layer 3 · Foreground Telemetry (Z: +160px) */}
            <div
              className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between"
              style={{
                transform: `translateZ(${160 * activeSeparation}px)`,
                transformStyle: 'preserve-3d',
              }}
            >
              <div className="flex justify-between text-[11px] text-t1">
                <span className="fw-kicker border-b border-t1 pb-0.5">LAYER 03 &bull; FOREGROUND HUD</span>
                <span className="fw-tabular">Z: +{160 * activeSeparation}PX</span>
              </div>
              <div className="flex justify-between items-end text-[10px] text-ink-3">
                <span className="fw-tabular">PITCH: {activeRotateX}&deg;</span>
                <span className="fw-tabular text-t1">SEPARATION: {activeSeparation.toFixed(1)}&times;</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Controls */}
        <div className="grid gap-8 sm:grid-cols-3 border-t border-[var(--rail)]/50 pt-6">
          <div className="flex flex-col gap-2 justify-center">
            <span className="fw-kicker text-[11px] text-ink-2">Input Mode</span>
            <button
              type="button"
              onClick={() => setDriveWithScroll((v) => !v)}
              className="fw-big text-[15px] font-light text-left text-ink hover:text-t1 transition-colors min-h-[36px]"
            >
              {driveWithScroll ? '● SCROLL-DRIVEN ACTIVE' : '○ MANUAL SLIDERS ONLY'}
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-baseline">
              <span className="fw-kicker text-[11px] text-ink-2">Perspective Pitch Tilt</span>
              <span className="fw-tabular text-[12px] text-t1">{manualTilt}&deg;</span>
            </div>
            <input
              type="range"
              min="0"
              max="45"
              step="1"
              value={manualTilt}
              onChange={(e) => {
                setDriveWithScroll(false);
                setManualTilt(parseInt(e.target.value));
              }}
              className="w-full accent-[var(--t1)] cursor-pointer"
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-baseline">
              <span className="fw-kicker text-[11px] text-ink-2">Layer Z-Axis Separation</span>
              <span className="fw-tabular text-[12px] text-t1">{manualSeparation.toFixed(1)}&times;</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="2.5"
              step="0.1"
              value={manualSeparation}
              onChange={(e) => {
                setDriveWithScroll(false);
                setManualSeparation(parseFloat(e.target.value));
              }}
              className="w-full accent-[var(--t1)] cursor-pointer"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
