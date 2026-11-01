/**
 * File: src/components/lines/veils/index.ts
 * Description: Veil id ("V01" to "V56") to the component that draws it.
 */
import type { FC } from 'react';
import { GLASS_VEILS } from './glass';
import type { VeilProps } from './kit';
import { LIGHT_VEILS } from './light';
import { MARKER_VEILS } from './marker';
import { SOFT_VEILS } from './soft';

export const VEIL_DESIGNS: Record<string, FC<VeilProps>> = { ...SOFT_VEILS, ...GLASS_VEILS, ...MARKER_VEILS, ...LIGHT_VEILS };
