import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../theme/useTheme';
import { typography } from '../theme/typography';
import { Transaction, Category } from '../context/types';
import { formatAmount } from '../utils/currency';
import { format } from 'date-fns';

type Props = {
  tx: Transaction;
  category?: Category;
  currency: string;
  onPress?: () => void;
  testID?: string;
};

export const TransactionRow: React.FC<Props> = ({ tx, category, currency, onPress, testID }) => {
  const { colors } = useTheme();
  const amountColor = tx.type === 'income' ? colors.semantic.income : colors.semantic.expense;
  const sign = tx.type === 'income' ? '+' : '-';
  const icon = (category?.icon || 'grid') as any;
  const bg = category?.color ? `${category.color}22` : colors.background.surfaceElevated;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.row, { borderBottomColor: colors.borders.subtle }]}
      testID={testID}
    >
      <View style={[styles.icon, { backgroundColor: bg }]}>
        <Feather name={icon} size={20} color={category?.color || colors.text.secondary} />
      </View>
      <View style={styles.middle}>
        <Text style={[typography.bodyLg, { color: colors.text.primary }]} numberOfLines={1}>
          {category?.name || 'Other'}
        </Text>
        <View style={styles.metaRow}>
          <Text style={[typography.bodyMd, { color: colors.text.secondary }]} numberOfLines={1}>
            {format(new Date(tx.date), 'MMM d, yyyy')}
          </Text>
          {tx.recurring !== 'none' ? (
            <View style={[styles.recurPill, { backgroundColor: colors.brand.accentMuted }]}>
              <Feather name="repeat" size={10} color={colors.brand.accent} />
              <Text style={{ color: colors.brand.accent, fontSize: 10, fontWeight: '600' }}>{tx.recurring}</Text>
            </View>
          ) : null}
          {tx.note ? (
            <Text style={[typography.bodyMd, { color: colors.text.tertiary, flex: 1 }]} numberOfLines={1}>
              · {tx.note}
            </Text>
          ) : null}
        </View>
      </View>
      <Text style={[typography.bodyLg, { color: amountColor, fontWeight: '700' }]} testID={`${testID}-amount`}>
        {sign}
        {formatAmount(tx.amount, currency)}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  icon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  middle: { flex: 1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  recurPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
  },
});
