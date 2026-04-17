import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LineChart } from 'react-native-gifted-charts';
import { Screen } from '../../src/components/Screen';
import { Header } from '../../src/components/Header';
import { BalanceCard } from '../../src/components/BalanceCard';
import { TransactionRow } from '../../src/components/TransactionRow';
import { Empty } from '../../src/components/Empty';
import { Fab } from '../../src/components/Fab';
import { useApp } from '../../src/context/AppContext';
import { useTheme } from '../../src/theme/useTheme';
import { typography, spacing, radius } from '../../src/theme/typography';
import { sumByType, weeklyBuckets, monthlyBuckets, sameMonth } from '../../src/utils/selectors';
import { formatAmount } from '../../src/utils/currency';

export default function Dashboard() {
  const { state } = useApp();
  const { colors } = useTheme();
  const router = useRouter();
  const [range, setRange] = useState<'week' | 'month'>('week');

  const catMap = useMemo(() => new Map(state.categories.map((c) => [c.id, c])), [state.categories]);

  const { income, expense, balance } = useMemo(() => sumByType(state.transactions), [state.transactions]);

  const thisMonthTx = useMemo(
    () => state.transactions.filter((t) => sameMonth(t.date)),
    [state.transactions]
  );
  const monthStats = useMemo(() => sumByType(thisMonthTx), [thisMonthTx]);

  const weekly = useMemo(() => weeklyBuckets(state.transactions), [state.transactions]);
  const monthly = useMemo(() => monthlyBuckets(state.transactions), [state.transactions]);

  const lineData = useMemo(() => {
    if (range === 'week') {
      return weekly.map((d) => ({ value: d.value, label: d.label }));
    }
    return monthly.map((d) => ({ value: d.expense, label: d.label }));
  }, [range, weekly, monthly]);

  const maxVal = Math.max(1, ...lineData.map((d) => d.value));

  const recent = useMemo(
    () => [...state.transactions].sort((a, b) => +new Date(b.date) - +new Date(a.date)).slice(0, 5),
    [state.transactions]
  );

  return (
    <Screen testID="dashboard-screen">
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <Header
          title="Dashboard"
          subtitle="Your money, at a glance"
          right={
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/settings')}
              style={[styles.iconBtn, { backgroundColor: colors.background.surface, borderColor: colors.borders.subtle }]}
              testID="dashboard-settings-btn"
            >
              <Feather name="sliders" size={18} color={colors.text.primary} />
            </TouchableOpacity>
          }
        />

        <BalanceCard
          balance={balance}
          income={income}
          expense={expense}
          currency={state.currency}
          onAdd={() => router.push('/transaction')}
        />

        {/* Quick cards */}
        <View style={styles.quickRow}>
          <View
            style={[styles.quickCard, { backgroundColor: colors.background.surface, borderColor: colors.borders.subtle }]}
          >
            <Feather name="calendar" size={18} color={colors.brand.accent} />
            <Text style={[typography.labelSm, { color: colors.text.secondary, marginTop: 10 }]}>This Month</Text>
            <Text style={[typography.h3Card, { color: colors.text.primary, marginTop: 2 }]}>
              {formatAmount(monthStats.balance, state.currency)}
            </Text>
          </View>
          <View
            style={[styles.quickCard, { backgroundColor: colors.background.surface, borderColor: colors.borders.subtle }]}
          >
            <Feather name="hash" size={18} color={colors.brand.accent} />
            <Text style={[typography.labelSm, { color: colors.text.secondary, marginTop: 10 }]}>Transactions</Text>
            <Text style={[typography.h3Card, { color: colors.text.primary, marginTop: 2 }]}>
              {thisMonthTx.length}
            </Text>
          </View>
        </View>

        {/* Chart */}
        <View
          style={[
            styles.chartCard,
            { backgroundColor: colors.background.surface, borderColor: colors.borders.subtle },
          ]}
        >
          <View style={styles.chartHeader}>
            <View>
              <Text style={[typography.labelSm, { color: colors.text.secondary }]}>Spending</Text>
              <Text style={[typography.h3Card, { color: colors.text.primary, marginTop: 2 }]}>
                {range === 'week' ? 'Last 7 days' : 'Last 6 months'}
              </Text>
            </View>
            <View style={[styles.rangeToggle, { backgroundColor: colors.background.surfaceElevated }]}>
              {(['week', 'month'] as const).map((r) => {
                const active = r === range;
                return (
                  <TouchableOpacity
                    key={r}
                    onPress={() => setRange(r)}
                    style={[
                      styles.rangeBtn,
                      active && { backgroundColor: colors.brand.accent },
                    ]}
                    testID={`range-${r}`}
                  >
                    <Text
                      style={{
                        color: active ? '#fff' : colors.text.secondary,
                        fontWeight: '600',
                        fontSize: 12,
                      }}
                    >
                      {r === 'week' ? 'Week' : 'Month'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {lineData.every((d) => d.value === 0) ? (
            <View style={{ height: 160, alignItems: 'center', justifyContent: 'center' }}>
              <Feather name="bar-chart-2" size={28} color={colors.text.tertiary} />
              <Text style={[typography.bodyMd, { color: colors.text.secondary, marginTop: 8 }]}>
                No spending data yet
              </Text>
            </View>
          ) : (
            <View style={{ marginTop: 12 }}>
              <LineChart
                data={lineData}
                height={160}
                maxValue={maxVal * 1.2}
                noOfSections={3}
                hideRules
                hideYAxisText
                yAxisThickness={0}
                xAxisThickness={0}
                color={colors.brand.accent}
                thickness={2.5}
                curved
                areaChart
                startFillColor={colors.brand.accent}
                startOpacity={0.35}
                endFillColor={colors.brand.accent}
                endOpacity={0.02}
                dataPointsColor={colors.brand.accent}
                xAxisLabelTextStyle={{ color: colors.text.secondary, fontSize: 10 }}
                initialSpacing={12}
                endSpacing={12}
                disableScroll
              />
            </View>
          )}
        </View>

        {/* Recent */}
        <View style={styles.sectionHeader}>
          <Text style={[typography.h3Card, { color: colors.text.primary }]}>Recent Activity</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/transactions')} testID="dashboard-see-all">
            <Text style={{ color: colors.brand.accent, fontWeight: '600' }}>See all</Text>
          </TouchableOpacity>
        </View>

        <View style={{ paddingHorizontal: spacing.screenPadding }}>
          {recent.length === 0 ? (
            <Empty icon="inbox" title="No transactions yet" subtitle="Tap the + button to add your first one." />
          ) : (
            recent.map((tx, idx) => (
              <TransactionRow
                key={tx.id}
                tx={tx}
                category={catMap.get(tx.categoryId)}
                currency={state.currency}
                onPress={() => router.push({ pathname: '/transaction', params: { id: tx.id } })}
                testID={`recent-tx-${idx}`}
              />
            ))
          )}
        </View>
      </ScrollView>

      <Fab onPress={() => router.push('/transaction')} testID="dashboard-fab" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  iconBtn: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  quickRow: { flexDirection: 'row', gap: 12, paddingHorizontal: spacing.screenPadding, marginTop: 16 },
  quickCard: { flex: 1, padding: 16, borderRadius: radius.md, borderWidth: 1 },
  chartCard: {
    marginTop: 16,
    marginHorizontal: spacing.screenPadding,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: 16,
  },
  chartHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rangeToggle: { flexDirection: 'row', borderRadius: 999, padding: 3 },
  rangeBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenPadding,
    marginTop: 28,
    marginBottom: 8,
  },
});
