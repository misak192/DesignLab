/**
 * File: src/components/typography/countPick.ts
 * Description: The favourite notification-count design, kept in localStorage ("fw-count-pick") and read by the Counts tab (to pick
 * it) and by the Menu tab (to draw its category counts with it).
 */
import { createPickStore } from '@/components/chartstudy/pick';

export const countPick = createPickStore('fw-count-pick');
