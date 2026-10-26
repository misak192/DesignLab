/**
 * File: src/components/backgrounds/GlowFrame.tsx
 * Description: Lights up a box (a comment composer) while something inside it has focus. No border, no fill that
 * reads as a box: the light comes from behind the text and fades out past the edges. Seven ways to do it
 * (src/lib/display/settings.ts, GLOW_STYLES); `stars` is LoreLyst's constellation, which blows apart when `burst`
 * rises (a post) and re-forms. All of them follow MOTION: OFF lights the box instantly and nothing drifts.
 */
"use client";
import { useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react';
import { useMotion } from '@/components/display/DisplayProvider';
import type { GlowStyle } from '@/lib/display/settings';
import ConstellationField from './ConstellationField';

interface GlowFrameProps {
  glow: GlowStyle;
  /** Raised by the composer after a post. */
  burst?: number;
  /** Where the stars burst from. */
  originRef?: RefObject<HTMLElement | null>;
  children: ReactNode;
  className?: string;
}

export default function GlowFrame({ glow, burst = 0, originRef, children, className = '' }: GlowFrameProps) {
  const m = useMotion();
  const [lit, setLit] = useState(false);
  const frame = useRef<HTMLDivElement>(null);

  const fadeMs = Math.round(600 * m.scale);
  const fade: CSSProperties = { opacity: lit ? 1 : 0, transition: `opacity ${fadeMs}ms var(--ease)` };

  // The spotlight follows the pointer while it is over the box; with the keyboard it sits in the middle.
  const onMove = (e: React.PointerEvent) => {
    if (glow !== 'spotlight' || !frame.current) return;
    const r = frame.current.getBoundingClientRect();
    frame.current.style.setProperty('--mx', `${e.clientX - r.left}px`);
    frame.current.style.setProperty('--my', `${e.clientY - r.top}px`);
  };

  return (
    <div
      ref={frame}
      onFocusCapture={() => setLit(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setLit(false);
      }}
      onPointerMove={onMove}
      className={`relative isolate ${className}`}
      style={{ '--mx': '50%', '--my': '50%' } as CSSProperties}
    >
      {glow === 'line' && (
        <>
          <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-16" style={{ ...fade, background: 'linear-gradient(to top, color-mix(in srgb, var(--t1) 16%, transparent), transparent)' }} />
          <span
            aria-hidden
            className="pointer-events-none absolute bottom-0 left-1/2 h-px -translate-x-1/2 bg-t1"
            style={{ width: lit ? '100%' : '0%', transition: `width ${fadeMs}ms var(--ease)`, boxShadow: '0 0 12px 1px var(--t1)' }}
          />
        </>
      )}

      {glow === 'spotlight' && (
        <span
          aria-hidden
          className="pointer-events-none absolute -inset-x-8 -inset-y-6 -z-10"
          style={{ ...fade, background: 'radial-gradient(280px circle at var(--mx) var(--my), color-mix(in srgb, var(--t1) 26%, transparent), transparent 70%)' }}
        />
      )}

      {glow === 'mesh' && (
        <span aria-hidden className="pointer-events-none absolute -inset-x-6 -inset-y-5 -z-10 overflow-hidden" style={{ ...fade, maskImage: 'radial-gradient(ellipse at center, #000 35%, transparent 78%)', WebkitMaskImage: 'radial-gradient(ellipse at center, #000 35%, transparent 78%)' }}>
          <i className="fw-mesh-blob fw-mesh-a" style={{ background: 'var(--node-1)' }} />
          <i className="fw-mesh-blob fw-mesh-b" style={{ background: 'var(--node-3)' }} />
          <i className="fw-mesh-blob fw-mesh-c" style={{ background: 'var(--node-5)' }} />
          {/* The mesh itself: a very faint lattice of hairlines over the blobs. */}
          <i
            className="absolute inset-0"
            style={{
              opacity: 0.22,
              backgroundImage: 'linear-gradient(var(--ink) 1px, transparent 1px), linear-gradient(90deg, var(--ink) 1px, transparent 1px)',
              backgroundSize: '22px 22px',
              mixBlendMode: 'overlay',
            }}
          />
        </span>
      )}

      {glow === 'gradient' && (
        <span
          aria-hidden
          className="fw-gradient-glow pointer-events-none absolute -inset-x-6 -inset-y-4 -z-10"
          style={{ ...fade, maskImage: 'radial-gradient(ellipse at center, #000 30%, transparent 75%)', WebkitMaskImage: 'radial-gradient(ellipse at center, #000 30%, transparent 75%)' }}
        />
      )}

      {glow === 'aurora' && (
        <span aria-hidden className="pointer-events-none absolute -inset-x-8 -inset-y-6 -z-10 overflow-hidden" style={{ ...fade, maskImage: 'radial-gradient(ellipse at center, #000 30%, transparent 80%)', WebkitMaskImage: 'radial-gradient(ellipse at center, #000 30%, transparent 80%)' }}>
          <i className="fw-aurora-band fw-aurora-a" />
          <i className="fw-aurora-band fw-aurora-b" />
        </span>
      )}

      {glow === 'stars' && <ConstellationField lit={lit} burst={burst} originRef={originRef} />}

      {children}
    </div>
  );
}
