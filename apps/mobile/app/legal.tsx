import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../src/context/ThemeContext';
import { ArrowLeft, Shield, FileText, AlertTriangle, Cookie, HeartPulse, UserX, Users, Mail } from 'lucide-react-native';

export default function LegalScreen() {
  const { type } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  
  const getContent = () => {
    switch(type) {
      case 'privacy':
        return {
          title: 'Privacy Policy',
          icon: <Shield size={32} color="#16a34a" />,
          sections: [
            { heading: '1. Regulatory Framework', body: 'NuraCare adheres to the Federal Democratic Republic of Ethiopia Personal Data Protection Proclamation No. 1321/2024. We process personal wellness data on the basis of explicit consent and legitimate operational necessity.' },
            { heading: '2. Health Data Protection', body: 'Your sleep, recovery, and symptom metrics are classified as Sensitive Personal Data. They are encrypted at rest using AES-256 and never shared with advertisers or third-party brokers.' },
            { heading: '3. Your Rights', body: 'Under Ethiopian law, you maintain the absolute right to access, rectify, restrict processing of, and permanently delete your health data.' }
          ]
        };
      case 'terms':
        return {
          title: 'Terms of Service',
          icon: <FileText size={32} color="#3b82f6" />,
          sections: [
            { heading: '1. Agreement to Terms', body: 'By creating an account or using the NuraCare mobile application, you agree to these Terms. You must be at least 18 years of age or have parental guardian supervision.' },
            { heading: '2. User Conduct', body: 'NuraCare is designed for personal wellness and community encouragement. Users may not abuse AI interfaces or attempt unauthorized reverse-engineering.' },
            { heading: '3. Limitation of Liability', body: 'NuraCare is provided on an "as is" and "as available" basis for lifestyle guidance. We disclaim all implied warranties to the fullest extent permitted by law.' }
          ]
        };
      case 'health-safety':
      case 'disclaimer':
        return {
          title: 'Health & Clinical Safety',
          icon: <AlertTriangle size={32} color="#ea580c" />,
          sections: [
            { heading: '1. Not a Substitute for Medical Care', body: 'NuraCare is an AI-powered lifestyle and wellness companion designed solely for educational, habit-tracking, and cultural wellness guidance. It is NOT certified as a medical device (Software as a Medical Device - SaMD) under EFDA regulations.' },
            { heading: '2. Emergency Situations', body: 'If you believe you are experiencing a medical emergency (e.g. chest pain, breathing difficulties, stroke symptoms), immediately call emergency services (907 in Ethiopia) or proceed to the nearest medical emergency facility.' },
            { heading: '3. Cultural Remedies & Fasting', body: 'Herbal advice (telba, shiro, moringa) and Ethiopian Orthodox/Islamic fasting guidance are nutritional recommendations and should not replace clinical medical advice from your physician.' }
          ]
        };
      case 'ai-disclaimer':
        return {
          title: 'AI Companion Safety',
          icon: <HeartPulse size={32} color="#16a34a" />,
          sections: [
            { heading: '1. AI Transparency', body: 'Nura AI utilizes advanced large language models to converse in English, Amharic, and Afaan Oromo. AI outputs are probabilistic and may occasionally contain inaccuracies.' },
            { heading: '2. Grounded Health Context', body: 'Nura AI references your consented recovery score and fasting mode. It is explicitly constrained from fabricating clinical diagnoses or prescribing medications.' }
          ]
        };
      case 'cookies':
        return {
          title: 'Cookie & Local Storage',
          icon: <Cookie size={32} color="#f59e0b" />,
          sections: [
            { heading: '1. Local Storage on Mobile', body: 'NuraCare mobile uses encrypted MMKV local storage on your device to store cached remote configurations and offline recovery check-ins.' },
            { heading: '2. Web Cookies', body: 'Our web platform uses essential cookies for authentication sessions and optional analytics cookies subject to your explicit opt-in preferences.' }
          ]
        };
      case 'data-deletion':
        return {
          title: 'Data Deletion Policy',
          icon: <UserX size={32} color="#dc2626" />,
          sections: [
            { heading: '1. Right to Erasure', body: 'You can request immediate and permanent deletion of your profile, biometric history, and AI chat logs directly from the Privacy Center or by emailing privacy@nuracare.pro.et.' },
            { heading: '2. Timeline', body: 'Upon confirmation, all cloud database records and local cache partitions are wiped within 24 hours in compliance with global app store privacy guidelines.' }
          ]
        };
      case 'community-guidelines':
        return {
          title: 'Community Guidelines',
          icon: <Users size={32} color="#16a34a" />,
          sections: [
            { heading: '1. Respectful Dialogue', body: 'Our wellness circles and challenges exist to uplift, encourage, and support. Harassment, hate speech, or disparaging remarks will result in account suspension.' },
            { heading: '2. No Medical Prescribing', body: 'Do not attempt to prescribe pharmaceuticals or clinical regimens to other community members. Share personal habits and encouragement only.' }
          ]
        };
      default:
        return {
          title: 'Contact & Support',
          icon: <Mail size={32} color="#16a34a" />,
          sections: [
            { heading: '1. Support Inquiries', body: 'Email: support@nuracare.pro.et\nAddis Ababa, Ethiopia' },
            { heading: '2. Data Protection Officer', body: 'For privacy inquiries or compliance matters regarding Proclamation 1321/2024: privacy@nuracare.pro.et' }
          ]
        };
    }
  };

  const info = getContent();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: Math.max(insets.top, 16) + 10,
            backgroundColor: theme.surface,
            borderBottomColor: theme.border,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: theme.surfaceElevated }]}
          activeOpacity={0.7}
        >
          <ArrowLeft size={22} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.textPrimary }]}>{info.title}</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[
          styles.contentInner,
          { paddingBottom: Math.max(insets.bottom, 16) + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.iconWrap,
            {
              backgroundColor: theme.surfaceElevated,
              borderColor: theme.border,
            },
          ]}
        >
          {info.icon}
        </View>

        {info.sections.map((sec, idx) => (
          <View
            key={idx}
            style={[
              styles.sectionBlock,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
          >
            <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>{sec.heading}</Text>
            <Text style={[styles.sectionBody, { color: theme.textSecondary }]}>{sec.body}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
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
  title: { fontSize: 18, fontWeight: '800' },
  content: { flex: 1 },
  contentInner: { padding: 20 },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 20,
    borderWidth: 1,
  },
  sectionBlock: {
    padding: 18,
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
  },
  sectionHeading: { fontSize: 15, fontWeight: '700', marginBottom: 6 },
  sectionBody: { fontSize: 14, lineHeight: 22 },
});
