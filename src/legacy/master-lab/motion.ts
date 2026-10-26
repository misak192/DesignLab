/**
 * File: src/legacy/master-lab/motion.ts
 * Description: Shared motion settings for the Master Lab thread.
 */
import { useResonanceEngine } from './engine';

// Quick start, long gentle settle.
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

// 0 when MOTION is OFF in the FWID menu, so every duration and delay multiplied by it becomes instant.
export function useMotionScale() {
  const { kinematicLevel } = useResonanceEngine();
  return kinematicLevel === 'off' ? 0 : 1;
}
