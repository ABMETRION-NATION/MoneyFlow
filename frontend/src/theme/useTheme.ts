import { useApp } from '../context/AppContext';
import { darkColors, lightColors, ThemeColors } from './colors';

export const useTheme = (): { colors: ThemeColors; mode: 'dark' | 'light' } => {
  const { state } = useApp();
  const colors = state.theme === 'dark' ? darkColors : lightColors;
  return { colors, mode: state.theme };
};
