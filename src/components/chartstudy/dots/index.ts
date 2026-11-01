/**
 * File: src/components/chartstudy/dots/index.ts
 * Description: Dot id ("01" to "36") to the component that draws it.
 */
import type { FC } from 'react';
import { CUTOUT_DOTS } from './cutouts';
import { GLASS3D_DOTS } from './glass3d';
import type { DotProps } from './kit';
import { LIGHT_DOTS } from './light';

export const DOT_DESIGNS: Record<string, FC<DotProps>> = { ...LIGHT_DOTS, ...CUTOUT_DOTS, ...GLASS3D_DOTS };
