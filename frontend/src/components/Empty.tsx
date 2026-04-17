import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../theme/useTheme';
import { typography } from '../theme/typography';

type Props = { icon?: any; title: string; subtitle?: string };

export const Empty: React.FC<Props> = ({ icon = 'inbox', title, subtitle }) => {
  const { colors } = useTheme();
  return (
    <View style={styles.wrap}>
      <View style={[styles.icon, { backgroundColor: colors.background.surface, borderColor: colors.borders.subtle }]}>
        <Feather name={icon} size={26} color={colors.text.tertiary} />
      </View>
      <Text style={[typography.h3Card, { color: colors.text.primary, marginTop: 16 }]}>{title}</Text>
      {subtitle ? (
        <Text style={[typography.bodyMd, { color: colors.text.secondary, textAlign: 'center', marginTop: 6 }]}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48, paddingHorizontal: 24 },
  icon: { width: 64, height: 64, borderRadius: 32, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});
