/**
 * File: src/components/display/SovereignHeader.tsx
 * Description: The Sovereign header from LoreLyst, for the Design Lab: a profile glyph top right that opens a panel
 * of plain settings rows (label small on the left, value large on the right, nothing behind either). Each row
 * cycles its setting when tapped: LIGHT, COLOUR, MOTION (the amount), TEXT (size), SHADOW. Then a link to ALL SETTINGS (the
 * /settings page: LOOK, TEXT, MOTION) and links to Home and to every category of the lab. No accounts here, so no sign-in. The
 * settings are saved in this browser only.
 */
"use client";
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { useDisplay, useMotion } from './DisplayProvider';
import { transitionFor } from '@/lib/motion/presets';
import { CATEGORIES } from '@/lib/experiments';
import { MOTION_LABEL, MOTION_LEVELS, SKINS, TEXT_SCALES, nextOf } from '@/lib/display/settings';

/** Home, then the categories: each opens a page listing its experiments. */
const PAGES = [{ href: '/', label: 'Home' }, ...CATEGORIES.map((c) => ({ href: `/category/${c.id}`, label: c.name }))];

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
              {/* The quick settings: what people change in the moment, and the accessibility opt-outs (motion, text size, shadow).
                  Everything else is on /settings, in three groups: LOOK, TEXT, MOTION. */}
              <Row label="LIGHT" value={settings.light ? 'LIGHT' : 'DARK'} onClick={() => set({ light: !settings.light })} />
              <Row label="COLOUR" value={settings.skin.toUpperCase()} onClick={() => set({ skin: nextOf(SKINS, settings.skin) })} />
              <Row label="MOTION" value={MOTION_LABEL[settings.motion]} onClick={() => set({ motion: nextOf(MOTION_LEVELS, settings.motion) })} />
              <Row label="TEXT" value={settings.text.toUpperCase()} onClick={() => set({ text: nextOf(TEXT_SCALES, settings.text) })} />
              <Row label="SHADOW" value={settings.shadow ? 'ON' : 'OFF'} onClick={() => set({ shadow: !settings.shadow })} />

              <Link href="/settings" onClick={() => setOpen(false)} className="fw-sov__all">
                ALL SETTINGS →
              </Link>

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
