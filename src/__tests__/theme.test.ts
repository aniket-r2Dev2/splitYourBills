/**
 * Theme System Tests
 * Comprehensive test suite for dark mode functionality
 */

import { LightColors, DarkColors } from '../theme/colors';
import { LightTheme, DarkTheme, getTheme, ThemeMode } from '../theme';

describe('Theme Colors', () => {
  describe('Light Colors', () => {
    it('should have all required color properties', () => {
      expect(LightColors).toHaveProperty('primary');
      expect(LightColors).toHaveProperty('background');
      expect(LightColors).toHaveProperty('text');
      expect(LightColors).toHaveProperty('surface');
      expect(LightColors).toHaveProperty('border');
      expect(LightColors).toHaveProperty('success');
      expect(LightColors).toHaveProperty('warning');
      expect(LightColors).toHaveProperty('error');
    });

    it('should have valid color values', () => {
      expect(LightColors.primary).toMatch(/^#[0-9A-F]{6}$/i);
      expect(LightColors.background).toBe('#FFFFFF');
      expect(LightColors.text).toBe('#000000');
    });

    it('should have proper contrast for accessibility', () => {
      // Light theme should have dark text on light background
      expect(LightColors.background).toBe('#FFFFFF');
      expect(LightColors.text).toBe('#000000');
    });
  });

  describe('Dark Colors', () => {
    it('should have all required color properties', () => {
      expect(DarkColors).toHaveProperty('primary');
      expect(DarkColors).toHaveProperty('background');
      expect(DarkColors).toHaveProperty('text');
      expect(DarkColors).toHaveProperty('surface');
      expect(DarkColors).toHaveProperty('border');
      expect(DarkColors).toHaveProperty('success');
      expect(DarkColors).toHaveProperty('warning');
      expect(DarkColors).toHaveProperty('error');
    });

    it('should have valid color values', () => {
      expect(DarkColors.primary).toMatch(/^#[0-9A-F]{6}$/i);
      expect(DarkColors.background).toBe('#000000');
      expect(DarkColors.text).toBe('#FFFFFF');
    });

    it('should have proper contrast for accessibility', () => {
      // Dark theme should have light text on dark background
      expect(DarkColors.background).toBe('#000000');
      expect(DarkColors.text).toBe('#FFFFFF');
    });
  });

  describe('Color Parity', () => {
    it('should have same keys in Light and Dark themes', () => {
      const lightKeys = Object.keys(LightColors).sort();
      const darkKeys = Object.keys(DarkColors).sort();
      expect(lightKeys).toEqual(darkKeys);
    });

    it('should have different values for background and text', () => {
      expect(LightColors.background).not.toBe(DarkColors.background);
      expect(LightColors.text).not.toBe(DarkColors.text);
    });
  });
});

describe('Theme Objects', () => {
  describe('LightTheme', () => {
    it('should have correct mode', () => {
      expect(LightTheme.mode).toBe('light');
    });

    it('should not be dark', () => {
      expect(LightTheme.isDark).toBe(false);
    });

    it('should use LightColors', () => {
      expect(LightTheme.colors).toEqual(LightColors);
    });
  });

  describe('DarkTheme', () => {
    it('should have correct mode', () => {
      expect(DarkTheme.mode).toBe('dark');
    });

    it('should be dark', () => {
      expect(DarkTheme.isDark).toBe(true);
    });

    it('should use DarkColors', () => {
      expect(DarkTheme.colors).toEqual(DarkColors);
    });
  });
});

describe('getTheme Function', () => {
  describe('Light Mode', () => {
    it('should return LightTheme when mode is light', () => {
      const theme = getTheme('light', false);
      expect(theme).toEqual(LightTheme);
    });

    it('should return LightTheme when mode is light (system dark)', () => {
      const theme = getTheme('light', true);
      expect(theme).toEqual(LightTheme);
    });
  });

  describe('Dark Mode', () => {
    it('should return DarkTheme when mode is dark', () => {
      const theme = getTheme('dark', false);
      expect(theme).toEqual(DarkTheme);
    });

    it('should return DarkTheme when mode is dark (system light)', () => {
      const theme = getTheme('dark', false);
      expect(theme).toEqual(DarkTheme);
    });
  });

  describe('Auto Mode', () => {
    it('should return LightTheme when auto mode and system is light', () => {
      const theme = getTheme('auto', false);
      expect(theme).toEqual(LightTheme);
      expect(theme.isDark).toBe(false);
    });

    it('should return DarkTheme when auto mode and system is dark', () => {
      const theme = getTheme('auto', true);
      expect(theme).toEqual(DarkTheme);
      expect(theme.isDark).toBe(true);
    });
  });
});

describe('Theme Mode Types', () => {
  it('should accept valid theme modes', () => {
    const validModes: ThemeMode[] = ['light', 'dark', 'auto'];
    validModes.forEach(mode => {
      expect(['light', 'dark', 'auto']).toContain(mode);
    });
  });
});

describe('Semantic Colors', () => {
  describe('Status Colors', () => {
    it('should have success color in both themes', () => {
      expect(LightColors.success).toBeDefined();
      expect(DarkColors.success).toBeDefined();
    });

    it('should have warning color in both themes', () => {
      expect(LightColors.warning).toBeDefined();
      expect(DarkColors.warning).toBeDefined();
    });

    it('should have error color in both themes', () => {
      expect(LightColors.error).toBeDefined();
      expect(DarkColors.error).toBeDefined();
    });

    it('should have info color in both themes', () => {
      expect(LightColors.info).toBeDefined();
      expect(DarkColors.info).toBeDefined();
    });
  });

  describe('Settlement Status Colors', () => {
    it('should have settled color in both themes', () => {
      expect(LightColors.settled).toBeDefined();
      expect(DarkColors.settled).toBeDefined();
    });

    it('should have pending color in both themes', () => {
      expect(LightColors.pending).toBeDefined();
      expect(DarkColors.pending).toBeDefined();
    });

    it('should have overdue color in both themes', () => {
      expect(LightColors.overdue).toBeDefined();
      expect(DarkColors.overdue).toBeDefined();
    });
  });
});

describe('UI Element Colors', () => {
  describe('Input Colors', () => {
    it('should have all input colors in light theme', () => {
      expect(LightColors.inputBackground).toBeDefined();
      expect(LightColors.inputBorder).toBeDefined();
      expect(LightColors.inputText).toBeDefined();
      expect(LightColors.inputPlaceholder).toBeDefined();
    });

    it('should have all input colors in dark theme', () => {
      expect(DarkColors.inputBackground).toBeDefined();
      expect(DarkColors.inputBorder).toBeDefined();
      expect(DarkColors.inputText).toBeDefined();
      expect(DarkColors.inputPlaceholder).toBeDefined();
    });
  });

  describe('Card Colors', () => {
    it('should have card colors in both themes', () => {
      expect(LightColors.card).toBeDefined();
      expect(LightColors.cardShadow).toBeDefined();
      expect(DarkColors.card).toBeDefined();
      expect(DarkColors.cardShadow).toBeDefined();
    });
  });

  describe('Tab Bar Colors', () => {
    it('should have tab bar colors in both themes', () => {
      expect(LightColors.tabBarBackground).toBeDefined();
      expect(LightColors.tabBarActive).toBeDefined();
      expect(LightColors.tabBarInactive).toBeDefined();
      expect(DarkColors.tabBarBackground).toBeDefined();
      expect(DarkColors.tabBarActive).toBeDefined();
      expect(DarkColors.tabBarInactive).toBeDefined();
    });
  });
});

describe('Color Variants', () => {
  it('should have primary color variants', () => {
    expect(LightColors.primaryLight).toBeDefined();
    expect(LightColors.primaryDark).toBeDefined();
    expect(DarkColors.primaryLight).toBeDefined();
    expect(DarkColors.primaryDark).toBeDefined();
  });

  it('should have background variants', () => {
    expect(LightColors.backgroundSecondary).toBeDefined();
    expect(LightColors.backgroundTertiary).toBeDefined();
    expect(DarkColors.backgroundSecondary).toBeDefined();
    expect(DarkColors.backgroundTertiary).toBeDefined();
  });

  it('should have text variants', () => {
    expect(LightColors.textSecondary).toBeDefined();
    expect(LightColors.textTertiary).toBeDefined();
    expect(LightColors.textInverse).toBeDefined();
    expect(DarkColors.textSecondary).toBeDefined();
    expect(DarkColors.textTertiary).toBeDefined();
    expect(DarkColors.textInverse).toBeDefined();
  });
});

describe('Theme Consistency', () => {
  it('should have at least 30 colors defined', () => {
    const lightCount = Object.keys(LightColors).length;
    const darkCount = Object.keys(DarkColors).length;
    expect(lightCount).toBeGreaterThanOrEqual(30);
    expect(darkCount).toBeGreaterThanOrEqual(30);
  });

  it('should have consistent color count between themes', () => {
    const lightCount = Object.keys(LightColors).length;
    const darkCount = Object.keys(DarkColors).length;
    expect(lightCount).toBe(darkCount);
  });
});
