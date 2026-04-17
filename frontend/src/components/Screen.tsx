import React from 'react';
import { View, StyleSheet, ViewStyle, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/useTheme';

type Props = { children: React.ReactNode; style?: ViewStyle; testID?: string; edges?: ('top' | 'bottom' | 'left' | 'right')[] };

export const Screen: React.FC<Props> = ({ children, style, testID, edges = ['top', 'left', 'right'] }) => {
  const { colors, mode } = useTheme();
  return (
    <SafeAreaView
      edges={edges}
      style={[styles.safe, { backgroundColor: colors.background.default }, style]}
      testID={testID}
    >
      <StatusBar
        barStyle={mode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background.default}
      />
      <View style={styles.container}>{children}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1 },
});
