import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { PieChart, BarChart } from 'react-native-gifted-charts';
import { Screen } from '../../src/components/Screen';
import { Header } from '../../src/components/Header';
import { Empty } from '../../src/components/Empty';
import { useApp } from '../../src/context/AppContext';
import { useTheme } from '../../src/theme/useTheme';
import { typography, spacing, radius } from '../../src/theme/typography';
import { categoryBreakdown, sumByType, monthlyBuckets, sameMonth } from '../../src/utils/selectors';
import { formatAmount } from '../../src/utils/currency';

type Period = 'month' | 'all';

export default function Insights() {
  const { state } = useApp();
  const { colors } = useTheme();
  const [period, setPeriod] = useState<Period>('month');

  const catMap = useMemo(() => new Map(state.categories.map((c) => [c.id, c])), [state.categories]);
  const list = useMemo(
    () => (period === 'month' ? state.transactions.filter((t) => sameMonth(t.date)) : state.transactions),
    [state.transactions, period]
  );

  const { income, expense } = useMemo(() => sumByType(list), [list]);
  const expenseBreakdown = useMemo(() => categoryBreakdown(list, 'expense'), [list]);
  const totalExpense = Math.max(1, expense);
  const pieData = expenseBreakdown.slice(0, 6).map((b) => {
    const cat = catMap.get(b.categoryId);
    return {
      value: b.total,
      color: cat?.color || '#94A3B8',
      text: cat?.name || 'Other',
      focused: false,
    };
  });

  const months = useMemo(() => monthlyBuckets(state.transactions), [state.transactions]);
  const barData = useMemo(() => {
    const data: { value: number; label?: string; frontColor: string; spacing?: number; labelWidth?: number }[] = [];
    months.forEach((m) => {
      data.push({ value: m.income, label: m.label, frontColor: colors.semantic.income, spacing: 2, labelWidth: 40 });
      data.push({ value: m.expense, frontColor: colors.semantic.expense });
    });
    return data;
  }, [months, colors]);

  const hasData = list.length > 0;
  const incomeExpenseMax = Math.max(income, expense, 1);
  const incomePct = (income / incomeExpenseMax) * 100;
  const expensePct = (expense / incomeExpenseMax) * 100;

  return (
    <Screen testID="insights-screen">
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <Header
          title="Insights"
          subtitle="Understand your money"
          right={
            <View style={[styles.toggle, { backgroundColor: colors.background.surfaceElevated }]}>
              {(['month', 'all'] as Period[]).map((p) => {
                const active = period === p;
                return (
                  <TouchableOpacity
                    key={p}
                    onPress={() => setPeriod(p)}
                    style={[styles.toggleBtn, active && { backgroundColor: colors.brand.accent }]}
                    testID={`insights-period-${p}`}
                  >
                    <Text
                      style={{
                        color: active ? '#fff' : colors.text.secondary,
                        fontSize: 11,
                        fontWeight: '600',
                      }}
                    >
                      {p === 'month' ? 'This Month' : 'All Time'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          }
        />

        {!hasData ? (
          <Empty
            icon="pie-chart"
            title="No insights yet"
            subtitle="Add transactions to see spending breakdown and trends."
          />
        ) : (
          <>
            {/* Income vs Expense bar */}
            <View
              style={[
                styles.card,
                { backgroundColor: colors.background.surface, borderColor: colors.borders.subtle },
              ]}
            >
              <Text style={[typography.labelSm, { color: colors.text.secondary }]}>Income vs Expense</Text>
              <View style={styles.ieRow}>
                <View style={styles.ieCol}>
                  <Text style={[typography.bodyMd, { color: colors.text.secondary }]}>Income</Text>
                  <Text style={[typography.h3Card, { color: colors.semantic.income, marginTop: 4 }]}>
                    {formatAmount(income, state.currency)}
                  </Text>
                  <View style={[styles.bar, { backgroundColor: colors.background.surfaceElevated }]}>
                    <View style={[styles.barFill, { backgroundColor: colors.semantic.income, width: `${incomePct}%` }]} />
                  </View>
                </View>
                <View style={styles.ieCol}>
                  <Text style={[typography.bodyMd, { color: colors.text.secondary }]}>Expense</Text>
                  <Text style={[typography.h3Card, { color: colors.semantic.expense, marginTop: 4 }]}>
                    {formatAmount(expense, state.currency)}
                  </Text>
                  <View style={[styles.bar, { backgroundColor: colors.background.surfaceElevated }]}>
                    <View style={[styles.barFill, { backgroundColor: colors.semantic.expense, width: `${expensePct}%` }]} />
                  </View>
                </View>
              </View>
              <View style={[styles.netRow, { borderTopColor: colors.borders.subtle }]}>
                <Text style={[typography.bodyMd, { color: colors.text.secondary }]}>Net Savings</Text>
                <Text
                  style={[
                    typography.h3Card,
                    { color: income - expense >= 0 ? colors.semantic.income : colors.semantic.expense },
                  ]}
                  testID="insights-net-savings"
                >
                  {formatAmount(income - expense, state.currency)}
                </Text>
              </View>
            </View>

            {/* Category Pie */}
            {expenseBreakdown.length > 0 ? (
              <View
                style={[
                  styles.card,
                  { backgroundColor: colors.background.surface, borderColor: colors.borders.subtle },
                ]}
              >
                <Text style={[typography.labelSm, { color: colors.text.secondary }]}>Spending by Category</Text>
                <View style={{ alignItems: 'center', marginTop: 12 }}>
                  <PieChart
                    data={pieData}
                    donut
                    radius={90}
                    innerRadius={62}
                    innerCircleColor={colors.background.surface}
                    centerLabelComponent={() => (
                      <View style={{ alignItems: 'center' }}>
                        <Text style={[typography.labelSm, { color: colors.text.secondary }]}>Total</Text>
                        <Text style={[typography.h3Card, { color: colors.text.primary, marginTop: 2 }]}>
                          {formatAmount(expense, state.currency)}
                        </Text>
                      </View>
                    )}
                  />
                </View>
                <View style={{ marginTop: 16, gap: 10 }}>
                  {expenseBreakdown.map((b) => {
                    const cat = catMap.get(b.categoryId);
                    const pct = Math.round((b.total / totalExpense) * 100);
                    return (
                      <View key={b.categoryId} style={styles.legendRow} testID={`insights-cat-${b.categoryId}`}>
                        <View style={[styles.dot, { backgroundColor: cat?.color || '#94A3B8' }]} />
                        <Text style={{ color: colors.text.primary, flex: 1, fontSize: 14, fontWeight: '500' }}>
                          {cat?.name || 'Other'}
                        </Text>
                        <Text style={{ color: colors.text.secondary, fontSize: 12, marginRight: 10 }}>{pct}%</Text>
                        <Text style={{ color: colors.text.primary, fontSize: 14, fontWeight: '600' }}>
                          {formatAmount(b.total, state.currency)}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            ) : null}

            {/* Monthly trend */}
            <View
              style={[
                styles.card,
                { backgroundColor: colors.background.surface, borderColor: colors.borders.subtle },
              ]}
            >
              <Text style={[typography.labelSm, { color: colors.text.secondary }]}>6-Month Trend</Text>
              <View style={{ flexDirection: 'row', gap: 16, marginTop: 8, marginBottom: 4 }}>
                <View style={styles.legend}>
                  <View style={[styles.dot, { backgroundColor: colors.semantic.income }]} />
                  <Text style={{ color: colors.text.secondary, fontSize: 11 }}>Income</Text>
                </View>
                <View style={styles.legend}>
                  <View style={[styles.dot, { backgroundColor: colors.semantic.expense }]} />
                  <Text style={{ color: colors.text.secondary, fontSize: 11 }}>Expense</Text>
                </View>
              </View>
              <View style={{ marginTop: 8 }}>
                <BarChart
                  data={barData}
                  height={160}
                  barWidth={14}
                  hideRules
                  yAxisThickness={0}
                  xAxisThickness={0}
                  hideYAxisText
                  xAxisLabelTextStyle={{ color: colors.text.secondary, fontSize: 10 }}
                  barBorderRadius={4}
                  initialSpacing={10}
                  spacing={16}
                  disableScroll
                />
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  toggle: { flexDirection: 'row', borderRadius: 999, padding: 3 },
  toggleBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  card: {
    marginTop: 14,
    marginHorizontal: spacing.screenPadding,
    padding: spacing.cardPadding,
    borderWidth: 1,
    borderRadius: radius.lg,
  },
  ieRow: { flexDirection: 'row', gap: 16, marginTop: 14 },
  ieCol: { flex: 1 },
  bar: { marginTop: 10, height: 8, borderRadius: 999, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 999 },
  netRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
