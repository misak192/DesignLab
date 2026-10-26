/**
 * File: src/legacy/master-lab/engine.ts
 * Description: Stand-in for ObservaLyst's KineticResonanceProvider. The old thread only reads the active skin and the
 * MOTION level from it; here both are fixed to ObservaLyst's defaults so the lab renders the same way every time.
 */
import type { ThemeLevel } from './themes';

export function useResonanceEngine(): { activeTheme: ThemeLevel; kinematicLevel: 'off' | 'normal' } {
  return { activeTheme: 'theme-aurora', kinematicLevel: 'normal' };
}
