import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../src/context/AppContext';
import { useTheme } from '../src/theme/useTheme';
import { typography, spacing, radius } from '../src/theme/typography';
import { CURRENCIES } from '../src/utils/currency';

export default function CurrencyPicker() {
  const { state, dispatch } = useApp();
  const { colors } = useTheme();
  const router = useRouter();
  const [selected, setSelected] = useState(state.currency || 'INR');

  const isFirstLaunch = state.firstLaunch;

  const onContinue = () => {
    dispatch({ type: 'SET_CURRENCY', payload: selected });
    if (isFirstLaunch) dispatch({ type: 'SET_FIRST_LAUNCH_DONE' });
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/dashboard');
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background.default }]} testID="currency-picker-screen">
      <View style={styles.header}>
        {!isFirstLaunch ? (
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.back, { backgroundColor: colors.background.surface, borderColor: colors.borders.subtle }]}
            testID="currency-picker-close"
          >
            <Feather name="x" size={20} color={colors.text.primary} />
          </TouchableOpacity>
        ) : (
          <View style={[styles.logo, { backgroundColor: colors.brand.accentMuted }]}>
            <Feather name="trending-up" size={20} color={colors.brand.accent} />
          </View>
        )}
      </View>
      <View style={{ paddingHorizontal: spacing.screenPadding }}>
        <Text style={[typography.h1Hero, { color: colors.text.primary, fontSize: 32, lineHeight: 40 }]}>
          {isFirstLaunch ? 'Welcome to MoneyFlow' : 'Select Currency'}
        </Text>
        <Text style={[typography.bodyLg, { color: colors.text.secondary, marginTop: 8 }]}>
          {isFirstLaunch
            ? 'Pick your primary currency to get started. You can change this later in Settings.'
            : 'All amounts will display in the selected currency.'}
        </Text>
      </View>

      <ScrollView style={{ marginTop: 24 }} contentContainerStyle={{ paddingHorizontal: spacing.screenPadding, paddingBottom: 120 }}>
        {CURRENCIES.map((c) => {
          const active = selected === c.code;
          return (
            <TouchableOpacity
              key={c.code}
              onPress={() => setSelected(c.code)}
              style={[
                styles.row,
                {
                  backgroundColor: active ? colors.brand.accentMuted : colors.background.surface,
                  borderColor: active ? colors.brand.accent : colors.borders.subtle,
                },
              ]}
              testID={`currency-option-${c.code}`}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
            >
              <View style={[styles.symbolWrap, { backgroundColor: colors.background.surfaceElevated }]}>
                <Text style={{ color: colors.text.primary, fontSize: 18, fontWeight: '700' }}>{c.symbol}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[typography.bodyLg, { color: colors.text.primary, fontWeight: '600' }]}>{c.code}</Text>
                <Text style={[typography.bodyMd, { color: colors.text.secondary }]}>{c.label}</Text>
              </View>
              {active ? <Feather name="check-circle" size={22} color={colors.brand.accent} /> : null}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.background.default, borderTopColor: colors.borders.subtle }]}>
        <TouchableOpacity
          onPress={onContinue}
          style={[styles.cta, { backgroundColor: colors.brand.accent }]}
          testID="currency-picker-continue"
          accessibilityRole="button"
        >
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
            {isFirstLaunch ? 'Get Started' : 'Save'}
          </Text>
          <Feather name="arrow-right" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: spacing.screenPadding, paddingTop: 8, paddingBottom: 16, flexDirection: 'row' },
  back: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  logo: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 10,
  },
  symbolWrap: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.screenPadding,
    paddingTop: 12,
    paddingBottom: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  cta: {
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});
