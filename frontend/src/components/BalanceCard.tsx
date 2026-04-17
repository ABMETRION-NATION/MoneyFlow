import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../theme/useTheme';
import { typography, spacing, radius } from '../theme/typography';
import { formatAmount } from '../utils/currency';

type Props = {
  balance: number;
  income: number;
  expense: number;
  currency: string;
  onAdd?: () => void;
};

export const BalanceCard: React.FC<Props> = ({ balance, income, expense, currency, onAdd }) => {
  const { colors } = useTheme();
  const isNeg = balance < 0;
  return (
    <View
      style={[styles.card, { backgroundColor: colors.background.surface, borderColor: colors.borders.subtle }]}
      testID="balance-card"
    >
      <View style={styles.glow} pointerEvents="none">
        <View style={[styles.glowDot, { backgroundColor: colors.brand.accentMuted }]} />
      </View>
      <Text style={[typography.labelSm, { color: colors.text.secondary }]}>Total Balance</Text>
      <Text
        style={[typography.balanceDisplay, { color: colors.text.primary, marginTop: 8 }]}
        testID="balance-amount"
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {isNeg ? '-' : ''}
        {formatAmount(balance, currency)}
      </Text>
      <View style={styles.footer}>
        <View style={styles.stat}>
          <View style={[styles.pill, { backgroundColor: 'rgba(16, 185, 129, 0.14)' }]}>
            <Feather name="arrow-down-left" size={14} color={colors.semantic.income} />
          </View>
          <View>
            <Text style={[typography.labelSm, { color: colors.text.secondary }]}>Income</Text>
            <Text style={[typography.h3Card, { color: colors.text.primary }]} testID="balance-income">
              {formatAmount(income, currency)}
            </Text>
          </View>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.borders.subtle }]} />
        <View style={styles.stat}>
          <View style={[styles.pill, { backgroundColor: 'rgba(244, 63, 94, 0.14)' }]}>
            <Feather name="arrow-up-right" size={14} color={colors.semantic.expense} />
          </View>
          <View>
            <Text style={[typography.labelSm, { color: colors.text.secondary }]}>Expense</Text>
            <Text style={[typography.h3Card, { color: colors.text.primary }]} testID="balance-expense">
              {formatAmount(expense, currency)}
            </Text>
          </View>
        </View>
      </View>
      {onAdd ? (
        <TouchableOpacity
          onPress={onAdd}
          style={[styles.cta, { backgroundColor: colors.brand.accent }]}
          testID="balance-card-add-btn"
          accessibilityRole="button"
        >
          <Feather name="plus" size={16} color="#fff" />
          <Text style={[typography.bodyMd, { color: '#fff', fontWeight: '600' }]}>New Transaction</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.screenPadding,
    padding: spacing.cardPadding,
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  glow: { position: 'absolute', top: -40, right: -40 },
  glowDot: { width: 160, height: 160, borderRadius: 80, opacity: 0.9 },
  footer: { flexDirection: 'row', alignItems: 'center', marginTop: 20, gap: 16 },
  stat: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  pill: { width: 28, height: 28, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  divider: { width: 1, height: 32 },
  cta: {
    marginTop: 20,
    height: 44,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});
