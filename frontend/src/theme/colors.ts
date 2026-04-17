export const darkColors = {
  background: {
    default: '#0A0C10',
    surface: '#13161C',
    surfaceElevated: '#1C2028',
    overlay: 'rgba(0,0,0,0.6)',
  },
  brand: {
    accent: '#0057FF',
    accentMuted: 'rgba(0, 87, 255, 0.15)',
    accentStrong: '#2E73FF',
  },
  semantic: {
    income: '#10B981',
    expense: '#F43F5E',
    warning: '#F59E0B',
  },
  text: {
    primary: '#F8FAFC',
    secondary: '#94A3B8',
    tertiary: '#475569',
    inverse: '#0F1115',
  },
  borders: {
    subtle: '#1E222A',
    focus: '#0057FF',
  },
};

export const lightColors = {
  background: {
    default: '#F7F8FA',
    surface: '#FFFFFF',
    surfaceElevated: '#F1F3F7',
    overlay: 'rgba(0,0,0,0.4)',
  },
  brand: {
    accent: '#0057FF',
    accentMuted: 'rgba(0, 87, 255, 0.12)',
    accentStrong: '#0047D1',
  },
  semantic: {
    income: '#059669',
    expense: '#E11D48',
    warning: '#D97706',
  },
  text: {
    primary: '#0F172A',
    secondary: '#475569',
    tertiary: '#94A3B8',
    inverse: '#FFFFFF',
  },
  borders: {
    subtle: '#E2E8F0',
    focus: '#0057FF',
  },
};

export type ThemeColors = typeof darkColors;

export const chartPalette = ['#0057FF', '#10B981', '#F59E0B', '#F43F5E', '#8B5CF6', '#06B6D4', '#EC4899', '#84CC16'];
