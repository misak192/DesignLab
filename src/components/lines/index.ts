/**
 * File: src/components/lines/index.ts
 * Description: Line id ("S01" to "R10") to the component that draws it.
 */
import type { FC } from 'react';
import { BEST_LINES } from './best';
import { DISSOLVE_LINES } from './dissolve';
import { HAIR_LINES } from './hair';
import type { RayProps } from './kit';
import { NEON_LINES } from './neon';
import { SOFT_LINES } from './soft';
import { STAR_LINES } from './stars';

export const LINE_DESIGNS: Record<string, FC<RayProps>> = { ...SOFT_LINES, ...NEON_LINES, ...DISSOLVE_LINES, ...STAR_LINES, ...HAIR_LINES, ...BEST_LINES };
