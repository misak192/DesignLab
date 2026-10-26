/**
 * File: src/components/display/AuraBackground.tsx
 * Description: The omnipresent background, mounted once in the root layout so it survives page changes: the
 * choice made in the BG setting, drawn behind everything. One WebGL canvas (BackgroundHost, from LoreLyst); OFF
 * draws nothing and the page keeps its own glow. SCENERY (LoreLyst's pillar photographs) is not part of the lab.
 */
"use client";
import BackgroundHost from './BackgroundHost';
import { useDisplay } from './DisplayProvider';
import { isShaderEngine } from '@/lib/display/background/engines';

export default function AuraBackground() {
  const { settings } = useDisplay();
  const on = isShaderEngine(settings.bgEngine);

  return (
    // .fw-aura is the scope the engines read their six skin colours from.
    <div aria-hidden className="fw-aura pointer-events-none fixed inset-0 z-[-100] overflow-hidden">
      {on && <BackgroundHost engine={settings.bgEngine} intensity={settings.bgIntensity} motion={settings.motion} />}
    </div>
  );
}
