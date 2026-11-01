/**
 * File: src/components/chartstudy/families/index.ts
 * Description: Element id ("A01" to "C10") to the component that draws it.
 */
import type { FC } from 'react';
import type { ElementProps } from '../types';
import { DOTS } from './dot';
import { SQUARES } from './square';
import { STACKS } from './stacked';

export const ELEMENTS: Record<string, FC<ElementProps>> = { ...DOTS, ...SQUARES, ...STACKS };
