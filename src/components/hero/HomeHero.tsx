/**
 * File: src/components/hero/HomeHero.tsx
 * Description: The home page's header with a hero title behind it, drawn in whichever design was chosen on /hero-titles.
 */
"use client";
import type { ReactNode } from 'react';
import { useDisplay } from '@/components/display/DisplayProvider';
import HeroTitle from './HeroTitle';

export default function HomeHero({ children }: { children: ReactNode }) {
  const { settings } = useDisplay();
  return (
    <HeroTitle word="Frissonworks" variant={settings.hero} size={150} crop={false} overlap={0.1} className="pb-20 sm:pb-28">
      {children}
    </HeroTitle>
  );
}
