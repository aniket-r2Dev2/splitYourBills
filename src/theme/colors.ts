/**
 * Color Definitions for Light and Dark Themes
 */

export const LightColors = {
  // Primary colors
  primary: '#007AFF',
  primaryLight: '#4DA2FF',
  primaryDark: '#0051D5',
  
  // Background colors
  background: '#FFFFFF',
  backgroundSecondary: '#F5F5F5',
  backgroundTertiary: '#EEEEEE',
  
  // Surface colors (cards, modals)
  surface: '#FFFFFF',
  surfaceSecondary: '#F9F9F9',
  
  // Text colors
  text: '#000000',
  textSecondary: '#666666',
  textTertiary: '#999999',
  textInverse: '#FFFFFF',
  
  // Border colors
  border: '#E0E0E0',
  borderLight: '#F0F0F0',
  
  // Semantic colors
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  info: '#5AC8FA',
  
  // Specific UI elements
  card: '#FFFFFF',
  cardShadow: 'rgba(0, 0, 0, 0.1)',
  overlay: 'rgba(0, 0, 0, 0.5)',
  
  // Input colors
  inputBackground: '#F5F5F5',
  inputBorder: '#DDDDDD',
  inputText: '#000000',
  inputPlaceholder: '#999999',
  
  // Tab bar
  tabBarBackground: '#FFFFFF',
  tabBarActive: '#007AFF',
  tabBarInactive: '#999999',
  
  // Status colors
  settled: '#34C759',
  pending: '#FF9500',
  overdue: '#FF3B30',
};

export const DarkColors = {
  // Primary colors
  primary: '#0A84FF',
  primaryLight: '#5EADFF',
  primaryDark: '#0066CC',
  
  // Background colors
  background: '#000000',
  backgroundSecondary: '#1C1C1E',
  backgroundTertiary: '#2C2C2E',
  
  // Surface colors (cards, modals)
  surface: '#1C1C1E',
  surfaceSecondary: '#2C2C2E',
  
  // Text colors
  text: '#FFFFFF',
  textSecondary: '#EBEBF5',
  textTertiary: '#8E8E93',
  textInverse: '#000000',
  
  // Border colors
  border: '#38383A',
  borderLight: '#48484A',
  
  // Semantic colors
  success: '#32D74B',
  warning: '#FF9F0A',
  error: '#FF453A',
  info: '#64D2FF',
  
  // Specific UI elements
  card: '#1C1C1E',
  cardShadow: 'rgba(0, 0, 0, 0.3)',
  overlay: 'rgba(0, 0, 0, 0.7)',
  
  // Input colors
  inputBackground: '#1C1C1E',
  inputBorder: '#48484A',
  inputText: '#FFFFFF',
  inputPlaceholder: '#8E8E93',
  
  // Tab bar
  tabBarBackground: '#1C1C1E',
  tabBarActive: '#0A84FF',
  tabBarInactive: '#8E8E93',
  
  // Status colors
  settled: '#32D74B',
  pending: '#FF9F0A',
  overdue: '#FF453A',
};

export type ColorTheme = typeof LightColors;
