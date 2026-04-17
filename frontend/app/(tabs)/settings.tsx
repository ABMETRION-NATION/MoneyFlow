import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Screen } from '../../src/components/Screen';
import { Header } from '../../src/components/Header';
import { useApp } from '../../src/context/AppContext';
import { useTheme } from '../../src/theme/useTheme';
import { typography, spacing, radius } from '../../src/theme/typography';
import { getCurrency } from '../../src/utils/currency';
import { exportTransactionsToCSV } from '../../src/utils/csv';

export default function Settings() {
  const { state, dispatch } = useApp();
  const { colors } = useTheme();
  const router = useRouter();
  const currency = getCurrency(state.currency);

  const toggleTheme = () => {
    dispatch({ type: 'SET_THEME', payload: state.theme === 'dark' ? 'light' : 'dark' });
  };

  const onExport = async () => {
    try {
      const res = await exportTransactionsToCSV(state.transactions, state.categories, state.currency);
      if (!res.success) Alert.alert('Export', res.message);
    } catch (e: any) {
      Alert.alert('Export failed', e?.message || 'Unknown error');
    }
  };

  const onClearData = () => {
    Alert.alert(
      'Clear all data?',
      'This will delete all transactions, custom categories, and your budget. Currency and theme will be kept.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            dispatch({ type: 'CLEAR_ALL' });
            Alert.alert('Cleared', 'All data has been removed.');
          },
        },
      ]
    );
  };

  const Row: React.FC<{
    icon: any;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    right?: React.ReactNode;
    danger?: boolean;
    testID?: string;
  }> = ({ icon, title, subtitle, onPress, right, danger, testID }) => (
    <TouchableOpacity
      activeOpacity={onPress ? 0.7 : 1}
      onPress={onPress}
      style={[styles.row, { borderBottomColor: colors.borders.subtle }]}
      testID={testID}
    >
      <View
        style={[
          styles.icon,
          {
            backgroundColor: danger ? 'rgba(244, 63, 94, 0.12)' : colors.background.surfaceElevated,
          },
        ]}
      >
        <Feather name={icon} size={18} color={danger ? colors.semantic.expense : colors.text.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={[typography.bodyLg, { color: danger ? colors.semantic.expense : colors.text.primary, fontWeight: '600' }]}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text style={[typography.bodyMd, { color: colors.text.secondary, marginTop: 2 }]}>{subtitle}</Text>
        ) : null}
      </View>
      {right ||
        (onPress ? <Feather name="chevron-right" size={18} color={colors.text.tertiary} /> : null)}
    </TouchableOpacity>
  );

  return (
    <Screen testID="settings-screen">
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <Header title="Settings" subtitle="Your preferences" />

        <View style={[styles.group, { backgroundColor: colors.background.surface, borderColor: colors.borders.subtle }]}>
          <Text style={[styles.groupLabel, { color: colors.text.secondary }]}>PREFERENCES</Text>
          <Row
            icon={state.theme === 'dark' ? 'moon' : 'sun'}
            title="Dark Theme"
            subtitle="Use dark color palette"
            right={
              <Switch
                value={state.theme === 'dark'}
                onValueChange={toggleTheme}
                trackColor={{ true: colors.brand.accent, false: colors.background.surfaceElevated }}
                thumbColor="#fff"
                testID="settings-theme-switch"
              />
            }
          />
          <Row
            icon="dollar-sign"
            title="Currency"
            subtitle={`${currency.code} · ${currency.label}`}
            onPress={() => router.push('/currency-picker')}
            testID="settings-currency"
          />
          <Row
            icon="grid"
            title="Categories"
            subtitle={`${state.categories.length} categories`}
            onPress={() => router.push('/categories')}
            testID="settings-categories"
          />
        </View>

        <View style={[styles.group, { backgroundColor: colors.background.surface, borderColor: colors.borders.subtle }]}>
          <Text style={[styles.groupLabel, { color: colors.text.secondary }]}>DATA</Text>
          <Row
            icon="share"
            title="Export to CSV"
            subtitle={`${state.transactions.length} transactions`}
            onPress={onExport}
            testID="settings-export-csv"
          />
          <Row
            icon="trash-2"
            title="Clear all data"
            subtitle="Remove all transactions and reset categories"
            onPress={onClearData}
            danger
            testID="settings-clear-data"
          />
        </View>

        <View style={[styles.group, { backgroundColor: colors.background.surface, borderColor: colors.borders.subtle }]}>
          <Text style={[styles.groupLabel, { color: colors.text.secondary }]}>ACCOUNT</Text>
          <Row
            icon="user"
            title="Sign in with Google"
            subtitle="Coming soon · sync across devices"
            onPress={() =>
              Alert.alert('Coming soon', 'Cloud sync with Google sign-in will be available in a future update.')
            }
            testID="settings-google"
          />
          <Row
            icon="facebook"
            title="Sign in with Facebook"
            subtitle="Coming soon"
            onPress={() =>
              Alert.alert('Coming soon', 'Facebook sign-in will be available in a future update.')
            }
            testID="settings-facebook"
          />
        </View>

        <View style={[styles.group, { backgroundColor: colors.background.surface, borderColor: colors.borders.subtle }]}>
          <Text style={[styles.groupLabel, { color: colors.text.secondary }]}>ABOUT</Text>
          <Row icon="info" title="MoneyFlow" subtitle="Version 1.0.0 · Local-first" />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  group: {
    marginTop: 14,
    marginHorizontal: spacing.screenPadding,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderRadius: radius.lg,
  },
  groupLabel: {
    fontSize: 11,
    letterSpacing: 1.2,
    fontWeight: '700',
    marginTop: 14,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  icon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
});
