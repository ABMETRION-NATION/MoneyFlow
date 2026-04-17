import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { useApp } from '../src/context/AppContext';

export default function Index() {
  const { state } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!state.hydrated) return;
    if (state.firstLaunch) {
      router.replace('/currency-picker');
    }
  }, [state.hydrated, state.firstLaunch, router]);

  if (!state.hydrated) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0A0C10', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#0057FF" />
      </View>
    );
  }

  if (state.firstLaunch) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0A0C10' }} />
    );
  }

  return <Redirect href="/(tabs)/dashboard" />;
}
