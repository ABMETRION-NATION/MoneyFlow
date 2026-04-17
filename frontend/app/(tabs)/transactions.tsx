import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Screen } from '../../src/components/Screen';
import { Header } from '../../src/components/Header';
import { TransactionRow } from '../../src/components/TransactionRow';
import { Empty } from '../../src/components/Empty';
import { Fab } from '../../src/components/Fab';
import { useApp } from '../../src/context/AppContext';
import { useTheme } from '../../src/theme/useTheme';
import { typography, spacing, radius } from '../../src/theme/typography';
import { Transaction } from '../../src/context/types';

type TypeFilter = 'all' | 'income' | 'expense';
type SortKey = 'newest' | 'oldest' | 'highest';

export default function Transactions() {
  const { state } = useApp();
  const { colors } = useTheme();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>('newest');

  const catMap = useMemo(() => new Map(state.categories.map((c) => [c.id, c])), [state.categories]);

  const filtered = useMemo(() => {
    let list: Transaction[] = [...state.transactions];
    if (typeFilter !== 'all') list = list.filter((t) => t.type === typeFilter);
    if (categoryFilter) list = list.filter((t) => t.categoryId === categoryFilter);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((t) => {
        const catName = catMap.get(t.categoryId)?.name.toLowerCase() || '';
        return (
          (t.note && t.note.toLowerCase().includes(q)) ||
          catName.includes(q) ||
          String(t.amount).includes(q)
        );
      });
    }
    if (sort === 'newest') list.sort((a, b) => +new Date(b.date) - +new Date(a.date));
    if (sort === 'oldest') list.sort((a, b) => +new Date(a.date) - +new Date(b.date));
    if (sort === 'highest') list.sort((a, b) => b.amount - a.amount);
    return list;
  }, [state.transactions, typeFilter, categoryFilter, query, sort, catMap]);

  const types: { key: TypeFilter; label: string; icon: any }[] = [
    { key: 'all', label: 'All', icon: 'grid' },
    { key: 'income', label: 'Income', icon: 'arrow-down-left' },
    { key: 'expense', label: 'Expense', icon: 'arrow-up-right' },
  ];

  const sorts: { key: SortKey; label: string }[] = [
    { key: 'newest', label: 'Newest' },
    { key: 'oldest', label: 'Oldest' },
    { key: 'highest', label: 'Highest' },
  ];

  return (
    <Screen testID="transactions-screen">
      <Header title="Transactions" subtitle={`${state.transactions.length} total`} />
      <View style={{ paddingHorizontal: spacing.screenPadding }}>
        <View
          style={[
            styles.search,
            { backgroundColor: colors.background.surface, borderColor: colors.borders.subtle },
          ]}
        >
          <Feather name="search" size={18} color={colors.text.secondary} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search notes, category, amount"
            placeholderTextColor={colors.text.tertiary}
            style={[styles.searchInput, { color: colors.text.primary }]}
            testID="transactions-search-input"
          />
          {query.length > 0 ? (
            <TouchableOpacity onPress={() => setQuery('')} testID="transactions-search-clear">
              <Feather name="x" size={16} color={colors.text.secondary} />
            </TouchableOpacity>
          ) : null}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 12 }}
          contentContainerStyle={{ gap: 8, paddingRight: spacing.screenPadding }}
        >
          {types.map((t) => {
            const active = typeFilter === t.key;
            return (
              <TouchableOpacity
                key={t.key}
                onPress={() => setTypeFilter(t.key)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? colors.brand.accent : colors.background.surfaceElevated,
                    borderColor: active ? colors.brand.accent : colors.borders.subtle,
                  },
                ]}
                testID={`type-filter-${t.key}`}
              >
                <Feather name={t.icon} size={14} color={active ? '#fff' : colors.text.secondary} />
                <Text style={{ color: active ? '#fff' : colors.text.primary, fontSize: 12, fontWeight: '600' }}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            );
          })}
          <View style={{ width: 1, backgroundColor: colors.borders.subtle, marginHorizontal: 4 }} />
          <TouchableOpacity
            onPress={() => setCategoryFilter(null)}
            style={[
              styles.chip,
              {
                backgroundColor: !categoryFilter ? colors.brand.accent : colors.background.surfaceElevated,
                borderColor: !categoryFilter ? colors.brand.accent : colors.borders.subtle,
              },
            ]}
            testID="cat-filter-all"
          >
            <Text style={{ color: !categoryFilter ? '#fff' : colors.text.primary, fontSize: 12, fontWeight: '600' }}>
              All Categories
            </Text>
          </TouchableOpacity>
          {state.categories.map((c) => {
            const active = categoryFilter === c.id;
            return (
              <TouchableOpacity
                key={c.id}
                onPress={() => setCategoryFilter(c.id)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? c.color : colors.background.surfaceElevated,
                    borderColor: active ? c.color : colors.borders.subtle,
                  },
                ]}
                testID={`cat-filter-${c.id}`}
              >
                <Feather name={c.icon as any} size={14} color={active ? '#fff' : c.color} />
                <Text style={{ color: active ? '#fff' : colors.text.primary, fontSize: 12, fontWeight: '600' }}>
                  {c.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.sortRow}>
          <Text style={[typography.labelSm, { color: colors.text.secondary }]}>Sort by</Text>
          <View style={[styles.sortToggle, { backgroundColor: colors.background.surfaceElevated }]}>
            {sorts.map((s) => {
              const active = sort === s.key;
              return (
                <TouchableOpacity
                  key={s.key}
                  onPress={() => setSort(s.key)}
                  style={[styles.sortBtn, active && { backgroundColor: colors.brand.accent }]}
                  testID={`sort-${s.key}`}
                >
                  <Text
                    style={{
                      color: active ? '#fff' : colors.text.secondary,
                      fontSize: 11,
                      fontWeight: '600',
                    }}
                  >
                    {s.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(t) => t.id}
        contentContainerStyle={{
          paddingHorizontal: spacing.screenPadding,
          paddingBottom: 140,
          paddingTop: 8,
        }}
        ListEmptyComponent={
          <Empty
            icon="search"
            title={state.transactions.length === 0 ? 'No transactions yet' : 'No results'}
            subtitle={
              state.transactions.length === 0
                ? 'Add your first transaction with the + button.'
                : 'Try a different search or filter.'
            }
          />
        }
        renderItem={({ item, index }) => (
          <TransactionRow
            tx={item}
            category={catMap.get(item.categoryId)}
            currency={state.currency}
            onPress={() => router.push({ pathname: '/transaction', params: { id: item.id } })}
            testID={`tx-row-${index}`}
          />
        )}
      />

      <Fab onPress={() => router.push('/transaction')} testID="transactions-fab" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    height: 44,
  },
  searchInput: { flex: 1, fontSize: 14, paddingVertical: 0 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    height: 32,
    borderRadius: 999,
    borderWidth: 1,
  },
  sortRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  sortToggle: { flexDirection: 'row', borderRadius: 999, padding: 3 },
  sortBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
});
