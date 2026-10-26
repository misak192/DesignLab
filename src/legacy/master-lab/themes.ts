/**
 * File: src/legacy/master-lab/themes.ts
 * Description: The Sovereign Themes. Each name matches a theme class in app/globals.css.
 */

export type ThemeLevel =
  | "theme-aurora" | "theme-ocean" | "theme-minimal" | "theme-solar"
  | "theme-lava" | "theme-nebula" | "theme-glass" | "theme-celadon"
  | "theme-forest" | "theme-obsidian";

export const THEME_TIERS: ThemeLevel[] = [
  "theme-aurora", "theme-ocean", "theme-minimal", "theme-solar",
  "theme-lava", "theme-nebula", "theme-glass", "theme-celadon",
  "theme-forest", "theme-obsidian",
];
