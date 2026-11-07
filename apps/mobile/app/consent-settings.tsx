import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../src/context/ThemeContext';
import { ArrowLeft, Sliders, ShieldCheck } from 'lucide-react-native';
import { useConsentStore } from '../src/store/consentStore';
import { CONSENT_PURPOSES } from '../src/privacy/consent/consentTypes';

export default function ConsentSettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const { consent, loadConsent, updateConsent, revokeAllOptional } = useConsentStore();

  useEffect(() => {
    loadConsent();
  }, []);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingBottom: Math.max(insets.bottom, 16) + 36 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Bar */}
      <View
        style={[
          styles.topNav,
          {
            paddingTop: Math.max(insets.top, 16) + 10,
            backgroundColor: theme.surface,
            borderBottomColor: theme.border,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: theme.surfaceElevated }]}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={22} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.topNavTitle, { color: theme.textPrimary }]}>Consent Settings</Text>
        <View style={{ width: 44 }} />
      </View>

      <View
        style={[
          styles.infoBanner,
          {
            backgroundColor: isDark ? theme.surface : '#f0fdf4',
            borderColor: isDark ? theme.border : '#dcfce7',
          },
        ]}
      >
        <Text style={[styles.infoBannerText, { color: theme.textSecondary }]}>
          In accordance with Ethiopia's Data Protection Proclamation No. 1321/2024, you have the right to withdraw optional consent at any time without affecting your core account access.
        </Text>
      </View>

      {/* Purpose Toggles */}
      <View style={[styles.cardGroup, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        {CONSENT_PURPOSES.map((purpose, index) => {
          const isChecked = Boolean(consent[purpose.key]);
          const isLast = index === CONSENT_PURPOSES.length - 1;

          return (
            <View
              key={purpose.key}
              style={[
                styles.purposeItem,
                !isLast && { borderBottomColor: theme.borderSubtle, borderBottomWidth: 1 },
              ]}
            >
              <View style={{ flex: 1, paddingRight: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <Text style={[styles.purposeTitle, { color: theme.textPrimary }]}>{purpose.title}</Text>
                  {purpose.isMandatory && (
                    <View style={[styles.requiredPill, { backgroundColor: theme.accentGlow }]}>
                      <Text style={[styles.requiredText, { color: theme.accent }]}>Core</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.purposeDesc, { color: theme.textSecondary }]}>{purpose.description}</Text>
                <Text style={[styles.lawRef, { color: theme.textTertiary }]}>{purpose.ethiopianLawRef}</Text>
              </View>

              <Switch
                value={isChecked}
                onValueChange={(val) => {
                  if (!purpose.isMandatory) {
                    updateConsent(purpose.key, val);
                  }
                }}
                disabled={purpose.isMandatory}
                trackColor={{ false: theme.inputBorder, true: theme.accent }}
                thumbColor={isChecked ? '#ffffff' : theme.textTertiary}
              />
            </View>
          );
        })}
      </View>

      {/* Revoke All Optional Button */}
      <TouchableOpacity
        style={[
          styles.revokeAllBtn,
          {
            backgroundColor: isDark ? theme.surfaceElevated : '#f8fafc',
            borderColor: theme.border,
          },
        ]}
        onPress={revokeAllOptional}
        activeOpacity={0.8}
      >
        <Text style={[styles.revokeAllText, { color: theme.textSecondary }]}>Withdraw All Optional Consents</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { paddingBottom: 40 },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topNavTitle: { fontSize: 18, fontWeight: '800' },
  infoBanner: {
    margin: 16,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  infoBannerText: { fontSize: 13, lineHeight: 18 },
  cardGroup: {
    marginHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    overflow: 'hidden',
  },
  purposeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  purposeTitle: { fontSize: 15, fontWeight: '700' },
  requiredPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  requiredText: { fontSize: 10, fontWeight: '700' },
  purposeDesc: { fontSize: 13, lineHeight: 18, marginBottom: 4 },
  lawRef: { fontSize: 11, fontStyle: 'italic' },
  revokeAllBtn: {
    marginHorizontal: 16,
    marginTop: 20,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  revokeAllText: { fontSize: 14, fontWeight: '600' },
});
