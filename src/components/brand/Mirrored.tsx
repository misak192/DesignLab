/**
 * File: src/components/brand/Mirrored.tsx
 * Description: Draws a row of type and, optionally, its reflection under the baseline (scaleY -1, masked 50 % → 0 over about
 * 60 px). The reflection is a second copy of the same children, so it plays the same animation. Removable: pass show={false}.
 */
"use client";
import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

/** `angle`: lean of the reflection in degrees (0 = straight, ± up to 45). `gap`: how far below the baseline it starts, in px. */
export default function Mirrored({ show, size, rowStyle, children, angle = 0, gap = 0 }: { show: boolean; size: number; rowStyle: CSSProperties; children: ReactNode; angle?: number; gap?: number }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLElement>(null);
  const [B, setB] = useState(size);
  useLayoutEffect(() => {
    const measure = () => {
      const w = wrapRef.current?.getBoundingClientRect();
      const m = markRef.current?.getBoundingClientRect();
      if (w && m) setB(m.bottom - w.top);
    };
    measure();
    document.fonts?.ready.then(measure);
  }, [size, show]);
  const u = size / 120;
  const tan = Math.tan((angle * Math.PI) / 180);
  const PAD = 120; // room for the lean: the reflection may shift sideways
  return (
    <div style={{ position: 'relative', display: 'inline-block', paddingBottom: show ? 64 * u + gap : 0 }}>
      <div ref={wrapRef} style={{ display: 'inline-flex', alignItems: 'baseline', ...rowStyle }}>
        {children}
        <i ref={markRef} style={{ display: 'inline-block', width: 0, height: 0 }} />
      </div>
      {/* ── ELEMENT: mirror (removable) ── */}
      {show && (
        <div aria-hidden style={{ position: 'absolute', left: -PAD, top: B + gap, width: `calc(100% + ${2 * PAD}px)`, height: 60 * u, overflow: 'hidden', pointerEvents: 'none', WebkitMaskImage: 'linear-gradient(to bottom, rgb(0 0 0 / 0.5), transparent)', maskImage: 'linear-gradient(to bottom, rgb(0 0 0 / 0.5), transparent)' }}>
          <div style={{ position: 'absolute', left: PAD, top: 0, transformOrigin: '0 0', transform: `translateY(${B}px) scaleY(-1) translateX(${-B * tan}px) skewX(${angle}deg)`, display: 'inline-flex', alignItems: 'baseline', ...rowStyle }}>{children}</div>
        </div>
      )}
      {/* ── END ELEMENT: mirror ── */}
    </div>
  );
}
