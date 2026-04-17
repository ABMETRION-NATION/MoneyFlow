import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp, genId } from '../src/context/AppContext';
import { useTheme } from '../src/theme/useTheme';
import { typography, spacing, radius } from '../src/theme/typography';
import { Recurring, TxType } from '../src/context/types';
import { getCurrency } from '../src/utils/currency';
import { format } from 'date-fns';

export default function TransactionModal() {
  const { state, dispatch } = useApp();
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const existing = params.id ? state.transactions.find((t) => t.id === params.id) : undefined;
  const isEdit = !!existing;

  const [type, setType] = useState<TxType>(existing?.type || 'expense');
  const [amount, setAmount] = useState<string>(existing ? String(existing.amount) : '');
  const [categoryId, setCategoryId] = useState<string>(
    existing?.categoryId || (state.categories.find((c) => c.id !== 'cat-income')?.id ?? 'cat-other')
  );
  const [date, setDate] = useState<Date>(existing ? new Date(existing.date) : new Date());
  const [note, setNote] = useState<string>(existing?.note || '');
  const [recurring, setRecurring] = useState<Recurring>(existing?.recurring || 'none');

  // when switching to income, default category to income category if current isn't appropriate
  useEffect(() => {
    if (type === 'income') {
      const inc = state.categories.find((c) => c.id === 'cat-income') || state.categories[0];
      if (inc && !state.categories.find((c) => c.id === categoryId)?.name.toLowerCase().includes('income')) {
        // keep whatever user picks; only auto-switch if currently the default expense
        if (!existing && categoryId !== 'cat-income') setCategoryId(inc.id);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const currency = getCurrency(state.currency);

  const filteredCategories = useMemo(() => {
    if (type === 'income') {
      // Any category can receive income; keep all but prioritize "Income"
      return state.categories;
    }
    return state.categories;
  }, [state.categories, type]);

  const onSave = () => {
    const num = parseFloat(amount.replace(',', '.'));
    if (!amount || isNaN(num) || num <= 0) {
      Alert.alert('Invalid amount', 'Please enter a positive amount.');
      return;
    }
    const payload = {
      id: existing?.id || genId('tx'),
      amount: Math.round(num * 100) / 100,
      type,
      categoryId,
      date: date.toISOString(),
      note: note.trim() || undefined,
      recurring,
      parentId: existing?.parentId,
    };
    if (isEdit) {
      dispatch({ type: 'UPDATE_TRANSACTION', payload });
    } else {
      dispatch({ type: 'ADD_TRANSACTION', payload });
      // materialize any resulting recurring after adding
      if (recurring !== 'none') {
        setTimeout(() => dispatch({ type: 'MATERIALIZE_RECURRING' }), 0);
      }
    }
    router.back();
  };

  const onDelete = () => {
    if (!existing) return;
    Alert.alert('Delete transaction?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          dispatch({ type: 'DELETE_TRANSACTION', payload: existing.id });
          router.back();
        },
      },
    ]);
  };

  const shiftDate = (days: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    setDate(d);
  };

  const recurOptions: { key: Recurring; label: string }[] = [
    { key: 'none', label: 'One-time' },
    { key: 'daily', label: 'Daily' },
    { key: 'weekly', label: 'Weekly' },
    { key: 'monthly', label: 'Monthly' },
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background.default }]} testID="transaction-modal">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.iconBtn, { backgroundColor: colors.background.surface, borderColor: colors.borders.subtle }]}
            testID="transaction-close"
          >
            <Feather name="x" size={18} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={[typography.h3Card, { color: colors.text.primary }]}>
            {isEdit ? 'Edit Transaction' : 'New Transaction'}
          </Text>
          {isEdit ? (
            <TouchableOpacity
              onPress={onDelete}
              style={[styles.iconBtn, { backgroundColor: colors.background.surface, borderColor: colors.borders.subtle }]}
              testID="transaction-delete"
            >
              <Feather name="trash-2" size={18} color={colors.semantic.expense} />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 120 }} keyboardShouldPersistTaps="handled">
          {/* Type Toggle */}
          <View style={[styles.typeToggle, { backgroundColor: colors.background.surfaceElevated }]}>
            {(['expense', 'income'] as TxType[]).map((t) => {
              const active = type === t;
              const bg =
                active && t === 'expense'
                  ? colors.semantic.expense
                  : active && t === 'income'
                  ? colors.semantic.income
                  : 'transparent';
              return (
                <TouchableOpacity
                  key={t}
                  onPress={() => setType(t)}
                  style={[styles.typeBtn, { backgroundColor: bg }]}
                  testID={`type-${t}`}
                >
                  <Feather
                    name={t === 'income' ? 'arrow-down-left' : 'arrow-up-right'}
                    size={16}
                    color={active ? '#fff' : colors.text.secondary}
                  />
                  <Text
                    style={{
                      color: active ? '#fff' : colors.text.secondary,
                      fontWeight: '700',
                      fontSize: 13,
                    }}
                  >
                    {t === 'income' ? 'Income' : 'Expense'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Amount */}
          <View style={styles.amountWrap}>
            <Text style={[typography.labelSm, { color: colors.text.secondary }]}>Amount</Text>
            <View style={styles.amountRow}>
              <Text style={[typography.h1Hero, { color: colors.text.tertiary, fontSize: 40, marginRight: 4 }]}>
                {currency.symbol}
              </Text>
              <TextInput
                value={amount}
                onChangeText={(v) => setAmount(v.replace(/[^0-9.,]/g, ''))}
                placeholder="0"
                placeholderTextColor={colors.text.tertiary}
                keyboardType="decimal-pad"
                style={[styles.amountInput, { color: colors.text.primary }]}
                testID="transaction-amount-input"
              />
            </View>
          </View>

          {/* Category */}
          <View style={styles.section}>
            <Text style={[typography.labelSm, { color: colors.text.secondary, paddingHorizontal: spacing.screenPadding }]}>
              Category
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: spacing.screenPadding, paddingVertical: 10, gap: 8 }}
            >
              {filteredCategories.map((c) => {
                const active = categoryId === c.id;
                return (
                  <TouchableOpacity
                    key={c.id}
                    onPress={() => setCategoryId(c.id)}
                    style={[
                      styles.catChip,
                      {
                        backgroundColor: active ? c.color : colors.background.surface,
                        borderColor: active ? c.color : colors.borders.subtle,
                      },
                    ]}
                    testID={`tx-cat-${c.id}`}
                  >
                    <Feather name={c.icon as any} size={14} color={active ? '#fff' : c.color} />
                    <Text
                      style={{
                        color: active ? '#fff' : colors.text.primary,
                        fontWeight: '600',
                        fontSize: 13,
                      }}
                    >
                      {c.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity
                onPress={() => router.push('/categories')}
                style={[styles.catChip, { backgroundColor: colors.background.surface, borderColor: colors.borders.subtle }]}
                testID="tx-cat-manage"
              >
                <Feather name="plus" size={14} color={colors.brand.accent} />
                <Text style={{ color: colors.brand.accent, fontWeight: '600', fontSize: 13 }}>Manage</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Date */}
          <View style={styles.section}>
            <Text style={[typography.labelSm, { color: colors.text.secondary, paddingHorizontal: spacing.screenPadding }]}>
              Date
            </Text>
            <View
              style={[
                styles.dateRow,
                { backgroundColor: colors.background.surface, borderColor: colors.borders.subtle },
              ]}
            >
              <TouchableOpacity onPress={() => shiftDate(-1)} style={styles.dateBtn} testID="tx-date-prev">
                <Feather name="chevron-left" size={20} color={colors.text.primary} />
              </TouchableOpacity>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={[typography.bodyLg, { color: colors.text.primary, fontWeight: '600' }]}>
                  {format(date, 'EEE, MMM d, yyyy')}
                </Text>
                <TouchableOpacity onPress={() => setDate(new Date())} testID="tx-date-today">
                  <Text style={{ color: colors.brand.accent, fontSize: 12, fontWeight: '600', marginTop: 2 }}>
                    Today
                  </Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={() => shiftDate(1)} style={styles.dateBtn} testID="tx-date-next">
                <Feather name="chevron-right" size={20} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Recurring */}
          <View style={styles.section}>
            <Text style={[typography.labelSm, { color: colors.text.secondary, paddingHorizontal: spacing.screenPadding }]}>
              Repeat
            </Text>
            <View style={[styles.recurRow, { paddingHorizontal: spacing.screenPadding }]}>
              {recurOptions.map((r) => {
                const active = recurring === r.key;
                return (
                  <TouchableOpacity
                    key={r.key}
                    onPress={() => setRecurring(r.key)}
                    style={[
                      styles.recurBtn,
                      {
                        backgroundColor: active ? colors.brand.accentMuted : colors.background.surface,
                        borderColor: active ? colors.brand.accent : colors.borders.subtle,
                      },
                    ]}
                    testID={`tx-recur-${r.key}`}
                  >
                    <Text
                      style={{
                        color: active ? colors.brand.accent : colors.text.primary,
                        fontSize: 12,
                        fontWeight: '600',
                      }}
                    >
                      {r.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Note */}
          <View style={styles.section}>
            <Text style={[typography.labelSm, { color: colors.text.secondary, paddingHorizontal: spacing.screenPadding }]}>
              Note (optional)
            </Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="e.g. Coffee with team"
              placeholderTextColor={colors.text.tertiary}
              multiline
              style={[
                styles.noteInput,
                {
                  backgroundColor: colors.background.surface,
                  borderColor: colors.borders.subtle,
                  color: colors.text.primary,
                },
              ]}
              testID="tx-note-input"
            />
          </View>
        </ScrollView>

        <View style={[styles.saveBar, { backgroundColor: colors.background.default, borderTopColor: colors.borders.subtle }]}>
          <TouchableOpacity
            onPress={onSave}
            style={[styles.saveBtn, { backgroundColor: colors.brand.accent }]}
            testID="transaction-save"
          >
            <Feather name="check" size={18} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
              {isEdit ? 'Save Changes' : 'Add Transaction'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: 12,
  },
  iconBtn: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  typeToggle: {
    flexDirection: 'row',
    marginHorizontal: spacing.screenPadding,
    borderRadius: 14,
    padding: 4,
  },
  typeBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  amountWrap: { paddingHorizontal: spacing.screenPadding, marginTop: 28, alignItems: 'center' },
  amountRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  amountInput: { fontSize: 56, fontWeight: '800', letterSpacing: -2, minWidth: 80, padding: 0 },
  section: { marginTop: 20 },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    height: 38,
    borderRadius: 999,
    borderWidth: 1,
  },
  dateRow: {
    marginHorizontal: spacing.screenPadding,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.md,
    padding: 8,
  },
  dateBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  recurRow: { flexDirection: 'row', gap: 8, marginTop: 8, flexWrap: 'wrap' },
  recurBtn: { paddingHorizontal: 14, height: 36, borderRadius: 999, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  noteInput: {
    marginHorizontal: spacing.screenPadding,
    marginTop: 8,
    minHeight: 80,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: 14,
    fontSize: 15,
    textAlignVertical: 'top',
  },
  saveBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.screenPadding,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  saveBtn: {
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});
