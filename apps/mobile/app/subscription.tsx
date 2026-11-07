import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../src/context/ThemeContext';
import * as WebBrowser from 'expo-web-browser';
import { Check, Star, X, ShieldCheck } from 'lucide-react-native';

const CHAPA_URL = 'https://checkout.chapa.co/checkout/payment/1234567890';
const STRIPE_URL = 'https://buy.stripe.com/test_1234567890';

export default function SubscriptionModal() {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();

  const handleSubscribe = async (provider: 'chapa' | 'stripe') => {
    const url = provider === 'chapa' ? CHAPA_URL : STRIPE_URL;
    await WebBrowser.openBrowserAsync(url);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[
        styles.contentContainer,
        {
          paddingTop: Math.max(insets.top, 16) + 8,
          paddingBottom: Math.max(insets.bottom, 16) + 30,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.closeBtn, { backgroundColor: theme.surfaceElevated }]}
          activeOpacity={0.7}
        >
          <X size={22} color={theme.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.hero}>
        <Star size={48} color="#f59e0b" fill="#f59e0b" />
        <Text style={[styles.heroTitle, { color: theme.textPrimary }]}>Upgrade to Premium</Text>
        <Text style={[styles.heroSubtitle, { color: theme.textSecondary }]}>
          Unlock the full potential of your AI Health Companion
        </Text>
      </View>

      <View style={styles.features}>
        {[
          'Unlimited AI Medical Consultations',
          'Priority Doctor Appointments',
          'Advanced Biometric Analytics',
          'Custom Lifestyle & Diet Coaching',
          'Family Health Sharing'
        ].map((feat, idx) => (
          <View key={idx} style={styles.featRow}>
            <Check size={20} color="#16a34a" />
            <Text style={[styles.featText, { color: theme.textPrimary }]}>{feat}</Text>
          </View>
        ))}
      </View>

      <View
        style={[
          styles.planCard,
          {
            backgroundColor: isDark ? theme.surface : '#f0fdf4',
            borderColor: theme.accent,
          },
        ]}
      >
        <Text style={[styles.planName, { color: theme.accent }]}>Nura Premium</Text>
        <Text style={[styles.planPrice, { color: theme.textPrimary }]}>
          $9.99<Text style={[styles.planPeriod, { color: theme.textSecondary }]}> / month</Text>
        </Text>
        <Text style={[styles.planDesc, { color: theme.textSecondary }]}>
          Everything you need to take control of your health.
        </Text>
      </View>

      <Text style={[styles.paymentTitle, { color: theme.textPrimary }]}>Choose Payment Method</Text>

      <TouchableOpacity
        style={[styles.payBtn, { backgroundColor: '#16a34a' }]}
        onPress={() => handleSubscribe('stripe')}
        activeOpacity={0.85}
      >
        <ShieldCheck size={20} color="#ffffff" />
        <Text style={styles.payBtnText}>Pay with Card (Stripe)</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.payBtn, { backgroundColor: '#0ea5e9' }]}
        onPress={() => handleSubscribe('chapa')}
        activeOpacity={0.85}
      >
        <ShieldCheck size={20} color="#ffffff" />
        <Text style={styles.payBtnText}>Pay with Telebirr / Local (Chapa)</Text>
      </TouchableOpacity>

      <Text style={[styles.disclaimer, { color: theme.textTertiary }]}>
        By subscribing, you agree to our Terms of Service. You can cancel anytime.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { paddingHorizontal: 20 },
  header: { alignItems: 'flex-end', paddingBottom: 10 },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: { alignItems: 'center', marginVertical: 24 },
  heroTitle: { fontSize: 26, fontWeight: 'bold', marginTop: 14, marginBottom: 8 },
  heroSubtitle: { fontSize: 15, textAlign: 'center', paddingHorizontal: 20 },
  features: { marginBottom: 28 },
  featRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  featText: { fontSize: 15, fontWeight: '500' },
  planCard: {
    borderWidth: 2,
    borderRadius: 18,
    padding: 22,
    alignItems: 'center',
    marginBottom: 28,
  },
  planName: { fontSize: 18, fontWeight: '800', marginBottom: 6 },
  planPrice: { fontSize: 32, fontWeight: '900', marginBottom: 8 },
  planPeriod: { fontSize: 16, fontWeight: '500' },
  planDesc: { fontSize: 13, textAlign: 'center' },
  paymentTitle: { fontSize: 16, fontWeight: '700', marginBottom: 14 },
  payBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 52,
    borderRadius: 14,
    marginBottom: 12,
  },
  payBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  disclaimer: { fontSize: 12, textAlign: 'center', marginTop: 14 },
});
