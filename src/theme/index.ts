/**
 * Theme System
 * Central theme management
 */

import { LightColors, DarkColors, ColorTheme } from './colors';

export type ThemeMode = 'light' | 'dark' | 'auto';

export interface Theme {
  mode: ThemeMode;
  colors: ColorTheme;
  isDark: boolean;
}

export const LightTheme: Theme = {
  mode: 'light',
  colors: LightColors,
  isDark: false,
};

export const DarkTheme: Theme = {
  mode: 'dark',
  colors: DarkColors,
  isDark: true,
};

/**
 * Get theme based on mode and system preference
 */
export function getTheme(mode: ThemeMode, systemIsDark: boolean): Theme {
  if (mode === 'auto') {
    return systemIsDark ? DarkTheme : LightTheme;
  }
  return mode === 'dark' ? DarkTheme : LightTheme;
}

export { LightColors, DarkColors };
export type { ColorTheme };
