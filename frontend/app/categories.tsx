import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Screen } from '../src/components/Screen';
import { Header } from '../src/components/Header';
import { useApp, genId } from '../src/context/AppContext';
import { useTheme } from '../src/theme/useTheme';
import { typography, spacing, radius } from '../src/theme/typography';
import { AVAILABLE_ICONS, AVAILABLE_COLORS } from '../src/utils/defaults';

export default function Categories() {
  const { state, dispatch } = useApp();
  const { colors } = useTheme();
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState<string>(AVAILABLE_ICONS[0]);
  const [color, setColor] = useState<string>(AVAILABLE_COLORS[0]);

  const resetForm = () => {
    setName('');
    setIcon(AVAILABLE_ICONS[0]);
    setColor(AVAILABLE_COLORS[0]);
    setShowForm(false);
  };

  const createCategory = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert('Invalid name', 'Please enter a category name.');
      return;
    }
    if (state.categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      Alert.alert('Duplicate', 'A category with this name already exists.');
      return;
    }
    dispatch({
      type: 'ADD_CATEGORY',
      payload: { id: genId('cat'), name: trimmed, icon, color },
    });
    resetForm();
  };

  const onDelete = (id: string, n: string, isDefault?: boolean) => {
    if (isDefault) {
      Alert.alert('Cannot delete', 'Default categories cannot be deleted.');
      return;
    }
    Alert.alert('Delete category?', `"${n}" will be removed. Existing transactions will move to "Other".`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => dispatch({ type: 'DELETE_CATEGORY', payload: id }),
      },
    ]);
  };

  return (
    <Screen testID="categories-screen">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <Header
          title="Categories"
          subtitle={`${state.categories.length} total`}
          onBack={() => router.back()}
          right={
            !showForm ? (
              <TouchableOpacity
                onPress={() => setShowForm(true)}
                style={[styles.addBtn, { backgroundColor: colors.brand.accent }]}
                testID="categories-add-btn"
              >
                <Feather name="plus" size={18} color="#fff" />
              </TouchableOpacity>
            ) : null
          }
        />

        <ScrollView contentContainerStyle={{ paddingBottom: 140 }} keyboardShouldPersistTaps="handled">
          {showForm ? (
            <View
              style={[
                styles.formCard,
                { backgroundColor: colors.background.surface, borderColor: colors.borders.subtle },
              ]}
            >
              <Text style={[typography.labelSm, { color: colors.text.secondary }]}>New Category</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g. Health"
                placeholderTextColor={colors.text.tertiary}
                style={[
                  styles.input,
                  { backgroundColor: colors.background.surfaceElevated, color: colors.text.primary },
                ]}
                testID="category-name-input"
              />

              <Text style={[typography.labelSm, { color: colors.text.secondary, marginTop: 14 }]}>Icon</Text>
              <View style={styles.iconGrid}>
                {AVAILABLE_ICONS.map((ic) => {
                  const active = icon === ic;
                  return (
                    <TouchableOpacity
                      key={ic}
                      onPress={() => setIcon(ic)}
                      style={[
                        styles.iconOption,
                        {
                          backgroundColor: active ? color : colors.background.surfaceElevated,
                          borderColor: active ? color : colors.borders.subtle,
                        },
                      ]}
                      testID={`cat-icon-${ic}`}
                    >
                      <Feather name={ic as any} size={18} color={active ? '#fff' : colors.text.primary} />
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={[typography.labelSm, { color: colors.text.secondary, marginTop: 14 }]}>Color</Text>
              <View style={styles.colorRow}>
                {AVAILABLE_COLORS.map((c) => {
                  const active = color === c;
                  return (
                    <TouchableOpacity
                      key={c}
                      onPress={() => setColor(c)}
                      style={[
                        styles.colorDot,
                        { backgroundColor: c, borderWidth: active ? 3 : 0, borderColor: '#fff' },
                      ]}
                      testID={`cat-color-${c}`}
                    />
                  );
                })}
              </View>

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
                <TouchableOpacity
                  onPress={resetForm}
                  style={[styles.secondaryBtn, { borderColor: colors.borders.subtle }]}
                  testID="cat-cancel"
                >
                  <Text style={{ color: colors.text.primary, fontWeight: '600' }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={createCategory}
                  style={[styles.primaryBtn, { backgroundColor: colors.brand.accent }]}
                  testID="cat-save"
                >
                  <Text style={{ color: '#fff', fontWeight: '700' }}>Create</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}

          <View style={{ paddingHorizontal: spacing.screenPadding, marginTop: 8 }}>
            {state.categories.map((c) => (
              <View
                key={c.id}
                style={[styles.catRow, { borderBottomColor: colors.borders.subtle }]}
                testID={`cat-row-${c.id}`}
              >
                <View style={[styles.catIcon, { backgroundColor: `${c.color}22` }]}>
                  <Feather name={c.icon as any} size={18} color={c.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[typography.bodyLg, { color: colors.text.primary, fontWeight: '600' }]}>{c.name}</Text>
                  <Text style={[typography.bodyMd, { color: colors.text.secondary, marginTop: 2 }]}>
                    {c.isDefault ? 'Default' : 'Custom'}
                  </Text>
                </View>
                {!c.isDefault ? (
                  <TouchableOpacity
                    onPress={() => onDelete(c.id, c.name, c.isDefault)}
                    style={styles.deleteBtn}
                    testID={`cat-delete-${c.id}`}
                  >
                    <Feather name="trash-2" size={16} color={colors.semantic.expense} />
                  </TouchableOpacity>
                ) : (
                  <Feather name="lock" size={14} color={colors.text.tertiary} />
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  addBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  formCard: {
    marginHorizontal: spacing.screenPadding,
    padding: spacing.cardPadding,
    borderWidth: 1,
    borderRadius: radius.lg,
    marginTop: 8,
  },
  input: {
    marginTop: 8,
    paddingHorizontal: 14,
    height: 44,
    borderRadius: radius.md,
    fontSize: 14,
  },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  iconOption: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8 },
  colorDot: { width: 30, height: 30, borderRadius: 15 },
  secondaryBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtn: { flex: 1, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  catIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  deleteBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
});
