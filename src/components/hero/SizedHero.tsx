/**
 * File: src/components/hero/SizedHero.tsx
 * Description: A hero title that follows the TITLES settings: the design is the chosen one (or, for AUTO, the one the motion style
 * suggests) and the size is HUGE, LARGE or SMALL of the size the page asks for; with TITLES OFF no hero is drawn and the content
 * simply stands on its own. Pages that must show one fixed design (the Hero titles gallery, the Calendar) use HeroTitle directly.
 */
"use client";
import type { ReactNode } from 'react';
import { useDisplay } from '@/components/display/DisplayProvider';
import { heroPx, resolveHero } from '@/lib/display/settings';
import HeroTitle from './HeroTitle';

interface SizedHeroProps {
  word: string;
  /** Colour to lead the design with (a category's own); the skin by default. */
  tint?: Parameters<typeof HeroTitle>[0]['tint'];
  /** The font size in px at HUGE, e.g. 150 for a page, 88 for a list row. */
  base: number;
  overlap?: number;
  className?: string;
  children?: ReactNode;
}

export default function SizedHero({ word, tint, base, overlap = 0.1, className = '', children }: SizedHeroProps) {
  const { settings } = useDisplay();
  const px = heroPx(settings.heroSize, base);
  if (px === 0) return <div className={className}>{children}</div>;
  return (
    <HeroTitle word={word} variant={resolveHero(settings)} tint={tint} size={px} crop={false} overlap={overlap} className={className}>
      {children}
    </HeroTitle>
  );
}
