import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useProfile } from '../../../src/context/ProfileContext';
import { useTheme } from '../../../src/context/ThemeContext';
import { getProfile, saveProfile } from '../../../src/storage/profileStorage';
import { ArrowLeft, ArrowRight, User } from 'lucide-react-native';

const COUNTRIES = ['Ethiopia', 'Kenya', 'Nigeria', 'South Africa', 'United States', 'United Kingdom', 'Other'];
const LANGUAGES = ['English', 'Amharic', 'Oromiffa'];

export default function OnboardingStep1() {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const { profile, setProfile } = useProfile();
  const existingStored = getProfile() || {};
  const [name, setName] = useState(profile?.name || existingStored?.name || '');
  const [age, setAge] = useState(profile?.age ? String(profile.age) : (existingStored?.age ? String(existingStored.age) : ''));
  const [gender, setGender] = useState<'female' | 'male'>((profile?.gender || existingStored?.gender) === 'male' ? 'male' : 'female');
  const [country, setCountry] = useState(profile?.culturalHeritage || existingStored?.culturalHeritage || 'Ethiopia');
  const [language, setLanguage] = useState(profile?.langPref || existingStored?.langPref || 'English');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      if (profile.name) setName(profile.name);
      if (profile.age) setAge(profile.age.toString());
      if (profile.gender) setGender(profile.gender === 'male' ? 'male' : 'female');
      if (profile.culturalHeritage) setCountry(profile.culturalHeritage);
      if (profile.langPref) setLanguage(profile.langPref);
    }
  }, [profile]);

  const handleNext = async () => {
    setLoading(true);
    const updates = {
      name: name.trim() || 'Wellness Friend',
      age: parseInt(age, 10) || 28,
      gender,
      culturalHeritage: country,
      langPref: language,
    };
    await setProfile(updates);
    const existing = getProfile() || {};
    saveProfile({ ...existing, ...updates });
    setLoading(false);
    router.push('/(auth)/onboarding/step2');
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={[
            styles.content,
            {
              paddingTop: Math.max(insets.top, 16) + 12,
              paddingBottom: Math.max(insets.bottom, 16) + 24,
            },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace('/(auth)/login');
                }
              }}
              style={[styles.backBtn, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}
            >
              <ArrowLeft size={22} color={theme.textPrimary} />
            </TouchableOpacity>
            <View style={[styles.stepPill, { backgroundColor: theme.accentGlow }]}>
              <Text style={[styles.stepText, { color: theme.accent }]}>Step 1 of 4</Text>
            </View>
          </View>

          <View style={styles.titleSection}>
            <Text style={[styles.title, { color: theme.textPrimary }]}>Let's get acquainted</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Personalize your natural health companion with your language and cultural preferences.
            </Text>
          </View>

          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>What should we call you?</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.inputText }]}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Sarah or Abebe"
              placeholderTextColor={theme.placeholderText}
              autoCapitalize="words"
            />

            <Text style={[styles.label, { color: theme.textSecondary }]}>How old are you?</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.inputText }]}
              value={age}
              onChangeText={setAge}
              placeholder="e.g. 28"
              placeholderTextColor={theme.placeholderText}
              keyboardType="numeric"
            />

            <Text style={[styles.label, { color: theme.textSecondary }]}>Gender (Personalizes your Nura companion appearance)</Text>
            <View style={styles.chipContainer}>
              <TouchableOpacity
                style={[styles.chip, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }, gender === 'female' && { backgroundColor: `${theme.accent}15`, borderColor: theme.accent }]}
                onPress={() => setGender('female')}
              >
                <Text style={[styles.chipText, { color: theme.textSecondary }, gender === 'female' && { color: theme.accent, fontWeight: '800' }]}>
                  👩 Female
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.chip, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }, gender === 'male' && { backgroundColor: `${theme.accent}15`, borderColor: theme.accent }]}
                onPress={() => setGender('male')}
              >
                <Text style={[styles.chipText, { color: theme.textSecondary }, gender === 'male' && { color: theme.accent, fontWeight: '800' }]}>
                  👨 Male
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.label, { color: theme.textSecondary }]}>Cultural Heritage & Wellness Background</Text>
            <View style={styles.chipContainer}>
              {COUNTRIES.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.chip, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }, country === c && { backgroundColor: `${theme.accent}15`, borderColor: theme.accent }]}
                  onPress={() => setCountry(c)}
                >
                  <Text style={[styles.chipText, { color: theme.textSecondary }, country === c && { color: theme.accent, fontWeight: '800' }]}>
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { color: theme.textSecondary }]}>Preferred Language</Text>
            <View style={styles.chipContainer}>
              {LANGUAGES.map((l) => (
                <TouchableOpacity
                  key={l}
                  style={[styles.chip, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }, language === l && { backgroundColor: `${theme.accent}15`, borderColor: theme.accent }]}
                  onPress={() => setLanguage(l)}
                >
                  <Text style={[styles.chipText, { color: theme.textSecondary }, language === l && { color: theme.accent, fontWeight: '800' }]}>
                    {l}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={[styles.nextBtn, { backgroundColor: theme.accent }]} onPress={handleNext} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <View style={styles.btnRow}>
                  <Text style={styles.nextBtnText}>Continue</Text>
                  <ArrowRight size={18} color="#ffffff" />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  stepPill: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
  },
  stepText: { fontSize: 12, fontWeight: '700', color: '#16a34a' },
  titleSection: { marginBottom: 20 },
  title: { fontSize: 26, fontWeight: '900', color: '#0f172a' },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 4, lineHeight: 19 },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  label: { fontSize: 12, fontWeight: '700', color: '#334155', marginTop: 12, marginBottom: 8 },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
  },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  chipActive: {
    backgroundColor: '#dcfce7',
    borderColor: '#16a34a',
  },
  chipText: { fontSize: 12, fontWeight: '600', color: '#64748b' },
  chipTextActive: { color: '#16a34a', fontWeight: '800' },
  nextBtn: {
    backgroundColor: '#16a34a',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  btnRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  nextBtnText: { color: '#ffffff', fontSize: 15, fontWeight: '800' },
});
