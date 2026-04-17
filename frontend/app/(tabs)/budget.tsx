import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Screen } from '../../src/components/Screen';
import { Header } from '../../src/components/Header';
import { useApp } from '../../src/context/AppContext';
import { useTheme } from '../../src/theme/useTheme';
import { typography, spacing, radius } from '../../src/theme/typography';
import { sumByType, sameMonth, categoryBreakdown } from '../../src/utils/selectors';
import { formatAmount, getCurrency } from '../../src/utils/currency';

export default function Budget() {
  const { state, dispatch } = useApp();
  const { colors } = useTheme();
  const [value, setValue] = useState<string>(state.budget.monthly ? String(state.budget.monthly) : '');
  const [editing, setEditing] = useState<boolean>(!state.budget.monthly);

  useEffect(() => {
    if (state.budget.monthly !== null) {
      setValue(String(state.budget.monthly));
      setEditing(false);
    } else {
      setEditing(true);
    }
  }, [state.budget.monthly]);

  const monthTx = useMemo(() => state.transactions.filter((t) => sameMonth(t.date)), [state.transactions]);
  const { expense } = useMemo(() => sumByType(monthTx), [monthTx]);

  const budget = state.budget.monthly || 0;
  const spentPct = budget > 0 ? Math.min(1, expense / budget) : 0;
  const remaining = Math.max(0, budget - expense);
  const over = expense > budget && budget > 0;

  const progressColor = over
    ? colors.semantic.expense
    : spentPct > 0.8
    ? colors.semantic.warning
    : spentPct > 0.5
    ? colors.brand.accentStrong
    : colors.semantic.income;

  const catMap = useMemo(() => new Map(state.categories.map((c) => [c.id, c])), [state.categories]);
  const breakdown = useMemo(() => categoryBreakdown(monthTx, 'expense'), [monthTx]);
  const currency = getCurrency(state.currency);

  const saveBudget = () => {
    const num = parseFloat(value.replace(',', '.'));
    if (!value || isNaN(num) || num <= 0) {
      Alert.alert('Invalid amount', 'Please enter a positive monthly budget.');
      return;
    }
    dispatch({ type: 'SET_BUDGET', payload: { monthly: Math.round(num * 100) / 100 } });
    setEditing(false);
  };

  const clearBudget = () => {
    Alert.alert('Clear budget?', 'This will remove your monthly budget.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () => {
          dispatch({ type: 'SET_BUDGET', payload: { monthly: null } });
          setValue('');
          setEditing(true);
        },
      },
    ]);
  };

  return (
    <Screen testID="budget-screen">
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <Header title="Budget" subtitle="Monthly spending limit" />

        <View style={[styles.card, { backgroundColor: colors.background.surface, borderColor: colors.borders.subtle }]}>
          {!editing && budget > 0 ? (
            <>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={[typography.labelSm, { color: colors.text.secondary }]}>Monthly Budget</Text>
                <TouchableOpacity onPress={() => setEditing(true)} testID="budget-edit-btn">
                  <Text style={{ color: colors.brand.accent, fontSize: 12, fontWeight: '600' }}>Edit</Text>
                </TouchableOpacity>
              </View>
              <Text
                style={[typography.balanceDisplay, { color: colors.text.primary, marginTop: 8 }]}
                numberOfLines={1}
                adjustsFontSizeToFit
                testID="budget-amount"
              >
                {formatAmount(budget, state.currency)}
              </Text>
              <View style={[styles.progress, { backgroundColor: colors.background.surfaceElevated }]}>
                <View style={[styles.progressFill, { backgroundColor: progressColor, width: `${spentPct * 100}%` }]} />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
                <View>
                  <Text style={[typography.labelSm, { color: colors.text.secondary }]}>Spent</Text>
                  <Text style={[typography.h3Card, { color: colors.text.primary, marginTop: 2 }]} testID="budget-spent">
                    {formatAmount(expense, state.currency)}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[typography.labelSm, { color: colors.text.secondary }]}>
                    {over ? 'Over Budget' : 'Remaining'}
                  </Text>
                  <Text
                    style={[
                      typography.h3Card,
                      { color: over ? colors.semantic.expense : colors.semantic.income, marginTop: 2 },
                    ]}
                    testID="budget-remaining"
                  >
                    {over
                      ? `-${formatAmount(expense - budget, state.currency)}`
                      : formatAmount(remaining, state.currency)}
                  </Text>
                </View>
              </View>
              {over ? (
                <View style={[styles.warnBox, { backgroundColor: 'rgba(244, 63, 94, 0.12)' }]}>
                  <Feather name="alert-triangle" size={14} color={colors.semantic.expense} />
                  <Text style={{ color: colors.semantic.expense, fontSize: 12, fontWeight: '600' }}>
                    You&apos;ve exceeded your monthly budget.
                  </Text>
                </View>
              ) : null}
              <TouchableOpacity onPress={clearBudget} style={styles.clearRow} testID="budget-clear">
                <Feather name="trash-2" size={14} color={colors.text.secondary} />
                <Text style={{ color: colors.text.secondary, fontSize: 12 }}>Clear budget</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={[typography.labelSm, { color: colors.text.secondary }]}>Set monthly budget</Text>
              <Text style={[typography.bodyMd, { color: colors.text.secondary, marginTop: 6, marginBottom: 12 }]}>
                Enter how much you want to spend this month. You can change it anytime.
              </Text>
              <View style={[styles.inputRow, { backgroundColor: colors.background.surfaceElevated }]}>
                <Text style={[typography.h2Section, { color: colors.text.tertiary }]}>{currency.symbol}</Text>
                <TextInput
                  value={value}
                  onChangeText={(v) => setValue(v.replace(/[^0-9.,]/g, ''))}
                  placeholder="0"
                  placeholderTextColor={colors.text.tertiary}
                  keyboardType="decimal-pad"
                  style={[styles.budgetInput, { color: colors.text.primary }]}
                  testID="budget-input"
                />
              </View>
              <TouchableOpacity
                onPress={saveBudget}
                style={[styles.saveBtn, { backgroundColor: colors.brand.accent }]}
                testID="budget-save"
              >
                <Text style={{ color: '#fff', fontWeight: '700' }}>Save Budget</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Category breakdown */}
        {budget > 0 && breakdown.length > 0 ? (
          <View style={[styles.card, { backgroundColor: colors.background.surface, borderColor: colors.borders.subtle }]}>
            <Text style={[typography.labelSm, { color: colors.text.secondary }]}>Where your money went</Text>
            <View style={{ marginTop: 12, gap: 14 }}>
              {breakdown.map((b) => {
                const cat = catMap.get(b.categoryId);
                const pct = Math.min(1, b.total / Math.max(1, budget));
                return (
                  <View key={b.categoryId} testID={`budget-breakdown-${b.categoryId}`}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <View
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 14,
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: `${cat?.color || '#94A3B8'}22`,
                        }}
                      >
                        <Feather name={(cat?.icon || 'grid') as any} size={14} color={cat?.color || '#94A3B8'} />
                      </View>
                      <Text style={{ color: colors.text.primary, flex: 1, fontWeight: '600' }}>
                        {cat?.name || 'Other'}
                      </Text>
                      <Text style={{ color: colors.text.primary, fontWeight: '700' }}>
                        {formatAmount(b.total, state.currency)}
                      </Text>
                    </View>
                    <View style={[styles.microBar, { backgroundColor: colors.background.surfaceElevated }]}>
                      <View
                        style={[styles.microFill, { backgroundColor: cat?.color || '#94A3B8', width: `${pct * 100}%` }]}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 14,
    marginHorizontal: spacing.screenPadding,
    padding: spacing.cardPadding,
    borderWidth: 1,
    borderRadius: radius.lg,
  },
  progress: { marginTop: 16, height: 10, borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 999 },
  warnBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    padding: 10,
    borderRadius: 10,
  },
  clearRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14, alignSelf: 'flex-start' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    height: 60,
    borderRadius: radius.md,
  },
  budgetInput: { flex: 1, fontSize: 28, fontWeight: '700' },
  saveBtn: {
    marginTop: 14,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  microBar: { marginTop: 8, height: 6, borderRadius: 999, overflow: 'hidden' },
  microFill: { height: '100%' },
});
