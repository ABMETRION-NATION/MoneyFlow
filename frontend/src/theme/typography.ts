import { TextStyle } from 'react-native';

export const typography: Record<string, TextStyle> = {
  h1Hero: { fontSize: 40, fontWeight: '800', letterSpacing: -1.5, lineHeight: 48 },
  h2Section: { fontSize: 24, fontWeight: '700', letterSpacing: -0.5, lineHeight: 32 },
  h3Card: { fontSize: 18, fontWeight: '600', letterSpacing: -0.3, lineHeight: 24 },
  bodyLg: { fontSize: 16, fontWeight: '500', letterSpacing: 0, lineHeight: 24 },
  bodyMd: { fontSize: 14, fontWeight: '400', letterSpacing: 0, lineHeight: 20 },
  labelSm: { fontSize: 12, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' },
  balanceDisplay: { fontSize: 44, fontWeight: '800', letterSpacing: -2, lineHeight: 52 },
};

export const spacing = {
  screenPadding: 20,
  cardPadding: 20,
  itemGap: 16,
  sectionGap: 28,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 20,
  xl: 28,
  pill: 999,
};
