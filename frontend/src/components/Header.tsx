import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../theme/useTheme';
import { typography, spacing } from '../theme/typography';

type Props = {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onBack?: () => void;
  testID?: string;
};

export const Header: React.FC<Props> = ({ title, subtitle, right, onBack, testID }) => {
  const { colors } = useTheme();
  return (
    <View style={styles.wrap} testID={testID}>
      <View style={styles.row}>
        {onBack ? (
          <TouchableOpacity
            onPress={onBack}
            style={[styles.back, { backgroundColor: colors.background.surface, borderColor: colors.borders.subtle }]}
            testID="header-back-button"
            accessibilityRole="button"
          >
            <Feather name="arrow-left" size={20} color={colors.text.primary} />
          </TouchableOpacity>
        ) : null}
        <View style={{ flex: 1 }}>
          {subtitle ? (
            <Text style={[typography.labelSm, { color: colors.text.secondary, marginBottom: 4 }]}>{subtitle}</Text>
          ) : null}
          <Text style={[typography.h2Section, { color: colors.text.primary }]} testID="header-title">
            {title}
          </Text>
        </View>
        {right}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: spacing.screenPadding, paddingTop: 8, paddingBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
