import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../src/context/ThemeContext';
import { Button } from '../src/components/ui';
import { useLocalSearchParams, router } from 'expo-router';

export default function CheckupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.background,
          paddingTop: Math.max(insets.top, 16) + 20,
          paddingBottom: Math.max(insets.bottom, 16) + 20,
        },
      ]}
    >
      <Text style={[styles.title, { color: theme.textPrimary }]}>Checkup Details</Text>
      <Text style={[styles.description, { color: theme.textSecondary }]}>Details for checkup ID: {id}</Text>
      
      <Button 
        title="Close" 
        onPress={() => router.back()} 
        style={styles.closeBtn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    marginBottom: 24,
  },
  closeBtn: {
    width: '100%',
    minHeight: 48,
  }
});
