import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../theme/useTheme';

type Props = { onPress: () => void; testID?: string; icon?: any };

export const Fab: React.FC<Props> = ({ onPress, testID, icon = 'plus' }) => {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        styles.fab,
        { backgroundColor: colors.brand.accent, borderColor: colors.background.default },
      ]}
      testID={testID || 'fab-button'}
      accessibilityRole="button"
    >
      <Feather name={icon} size={26} color="#fff" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
});
