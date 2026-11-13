/**
 * File: src/components/hero/HomeHero.tsx
 * Description: The home page's header with a hero title behind it, drawn in the TITLES design and size (see SizedHero).
 */
"use client";
import type { ReactNode } from 'react';
import SizedHero from './SizedHero';

export default function HomeHero({ children }: { children: ReactNode }) {
  return (
    <SizedHero word="Frissonworks" base={150} overlap={0.1} className="pb-10 sm:pb-12">
      {children}
    </SizedHero>
  );
}
