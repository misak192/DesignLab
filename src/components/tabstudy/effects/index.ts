/**
 * File: src/components/tabstudy/effects/index.ts
 * Description: Option id to its drawing. The data (name, category, description) is in src/lib/tabstudy/options.ts.
 */
import type { Effect } from '../types';
import { DropBounce, Float, OrbitDot, SlideIn, UnderlineDraw, UnderlineSlide } from './motion';
import { ColourBleed, ColourPop, GradientText, HueCycle, ShadowColour, TwoToneSplit } from './colour';
import { DimNeighbours, Halo, LensFlare, LightSweep, NeonFlicker, SoftGlow } from './light';
import { DigitalWipe, NoiseFlicker, RgbSplit, ScanLine, SliceJitter, Stutter } from './glitch';
import { LetterCodedBar, LetterLift, LetterSpread, LetterStaggerIn, LetterWave, LetterWeightWave } from './kinetic';
import { BreathingBrightness, BreathingScale, Heartbeat, IdleDrift } from './idle';
import { DepthLift, DustDissolve } from './spatial';

export const EFFECTS: Record<string, Effect> = {
  '01': UnderlineDraw,
  '02': UnderlineSlide,
  '03': Float,
  '04': SlideIn,
  '05': OrbitDot,
  '06': DropBounce,
  '07': ColourPop,
  '08': HueCycle,
  '09': GradientText,
  '10': ColourBleed,
  '11': TwoToneSplit,
  '12': ShadowColour,
  '13': SoftGlow,
  '14': NeonFlicker,
  '15': Halo,
  '16': LightSweep,
  '17': LensFlare,
  '18': DimNeighbours,
  '19': RgbSplit,
  '20': SliceJitter,
  '21': ScanLine,
  '22': NoiseFlicker,
  '23': Stutter,
  '24': DigitalWipe,
  '25': LetterWave,
  '26': LetterStaggerIn,
  '27': LetterSpread,
  '28': LetterWeightWave,
  '29': LetterCodedBar,
  '30': LetterLift,
  '31': BreathingScale,
  '32': BreathingBrightness,
  '33': IdleDrift,
  '34': Heartbeat,
  '35': DepthLift,
  '36': DustDissolve,
};
