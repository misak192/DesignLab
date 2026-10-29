/**
 * File: src/components/display/SovereignHeader.tsx
 * Description: The Sovereign header from LoreLyst, for the Design Lab: a profile glyph top right that opens a panel
 * of plain settings rows (label small on the left, value large on the right, nothing behind either). Each row
 * cycles its setting when tapped: LIGHT, SKIN, MOTION, TEXT, TYPE, BG (intensity + background), SHADOW. Then links
 * to every page of the lab. No accounts here, so no sign-in. The settings are saved in this browser only.
 */
"use client";
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { useDisplay, useMotion } from './DisplayProvider';
import { transitionFor } from '@/lib/motion/presets';
import { BG_ENGINES, BG_INTENSITIES, BG_LABEL } from '@/lib/display/background/engines';
import { MOTION_LEVELS, SKINS, TEXT_SCALES, TYPE_STYLES, nextOf } from '@/lib/display/settings';

const PAGES = [
  { href: '/', label: 'Home' },
  { href: '/comments', label: 'Comments' },
  { href: '/motion', label: 'Motion' },
  { href: '/cards', label: 'Cards' },
  { href: '/hero-titles', label: 'Hero titles' },
  { href: '/backgrounds', label: 'Backgrounds' },
  { href: '/notifications', label: 'Notifications' },
  { href: '/fluid-smoke', label: 'Fluid Shaders' },
  { href: '/shared-elements', label: 'Shared Elements' },
  { href: '/type-dissolve', label: 'Type Dissolve' },
  { href: '/charts', label: 'Letter Charts' },
  { href: '/gestures', label: 'Spring Gestures' },
  { href: '/glass', label: 'Glass Refraction' },
  { href: '/3d-depth', label: '3D Depth' },
  { href: '/trails', label: 'Touch Trails' },
  { href: '/page-transitions', label: 'Page Transitions' },
];

/* The profile glyph, as drawn in the Claude Design files: a head and shoulders, 1.4 stroke. */
function ProfileGlyph() {
  return (
    <svg width="24" height="24" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
      <circle cx="11" cy="8" r="3.6" />
      <path d="M3.5 19c1-4 4-5.6 7.5-5.6s6.5 1.6 7.5 5.6" />
    </svg>
  );
}

function Row({ label, value, onClick }: { label: string; value: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="fw-sov__row">
      <span className="fw-sov__label">{label}</span>
      <span className="fw-sov__value">{value}</span>
    </button>
  );
}

export default function SovereignHeader() {
  const { settings, set } = useDisplay();
  const preset = useMotion();
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const enter = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const leave = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 300);
  };

  const typeLabel = settings.type.toUpperCase();

  return (
    <nav aria-label="Settings and pages" className="fw-sov">
      <div className="fw-sov__wrap" onMouseEnter={enter} onMouseLeave={leave}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="fw-icon-btn"
          title="Settings and pages"
          aria-label="Settings and pages"
          aria-expanded={open}
          data-lit={open ? 'true' : 'false'}
        >
          <ProfileGlyph />
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -15 * Math.min(1, preset.scale), scale: preset.scale ? 0.95 : 1 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15 * Math.min(1, preset.scale), scale: preset.scale ? 0.95 : 1 }}
              transition={preset.scale ? { type: 'spring', duration: 0.4, bounce: preset.spring ? 0.4 : 0.2 } : transitionFor(preset)}
              className="fw-sov__panel"
            >
              <Row label="LIGHT" value={settings.light ? 'LIGHT' : 'DARK'} onClick={() => set({ light: !settings.light })} />
              <Row label="SKIN" value={settings.skin.toUpperCase()} onClick={() => set({ skin: nextOf(SKINS, settings.skin) })} />
              <Row label="MOTION" value={settings.motion.toUpperCase()} onClick={() => set({ motion: nextOf(MOTION_LEVELS, settings.motion) })} />
              <Row label="TEXT" value={settings.text.toUpperCase()} onClick={() => set({ text: nextOf(TEXT_SCALES, settings.text) })} />
              <Row label="TYPE" value={typeLabel} onClick={() => set({ type: nextOf(TYPE_STYLES, settings.type) })} />

              {/* BG reads "CORE MARBLE": the first word is the intensity, the second the background; two tap targets. */}
              <div className="fw-sov__row fw-sov__row--dual">
                <span className="fw-sov__label">BG</span>
                <span className="fw-sov__duo">
                  {settings.bgEngine !== 'off' && (
                    <button
                      type="button"
                      className="fw-sov__value fw-sov__part"
                      onClick={() => set({ bgIntensity: nextOf(BG_INTENSITIES, settings.bgIntensity) })}
                    >
                      {settings.bgIntensity.toUpperCase()}
                    </button>
                  )}
                  <button
                    type="button"
                    className="fw-sov__value fw-sov__part"
                    onClick={() => set({ bgEngine: nextOf(BG_ENGINES.filter((e) => e !== 'scenery'), settings.bgEngine) })}
                  >
                    {BG_LABEL[settings.bgEngine]}
                  </button>
                </span>
              </div>

              <Row label="SHADOW" value={settings.shadow ? 'ON' : 'OFF'} onClick={() => set({ shadow: !settings.shadow })} />

              <div className="fw-sov__apps">
                {PAGES.map((page) => (
                  <Link key={page.href} href={page.href} onClick={() => setOpen(false)} className="fw-sov__link">
                    {page.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
