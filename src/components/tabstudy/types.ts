/**
 * File: src/components/tabstudy/types.ts
 * Description: What an effect receives. An effect draws the inside of one tab; TabItem draws the button around it.
 */
import type { ComponentType } from 'react';

export interface EffectProps {
  label: string;
  selected: boolean;
  /** The option id: keeps shared layout ids (the sliding line) apart between cells. */
  scope: string;
}

export type Effect = ComponentType<EffectProps>;
