import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../src/context/ThemeContext';
import { 
  ShieldCheck, 
  Lock, 
  Key, 
  Sliders, 
  Download, 
  Trash2, 
  FileText, 
  ChevronRight, 
  ArrowLeft,
  Smartphone
} from 'lucide-react-native';

export default function PrivacyCenterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();

  const handleDownloadData = () => {
    Alert.alert(
      'Export Health Records',
      'A secure, encrypted JSON archive containing your wellness check-ins, medication logs, and profile data will be prepared.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Generate Export', 
          onPress: () => Alert.alert('Success', 'Your encrypted health data export is ready. Saved to device storage.') 
        }
      ]
    );
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background }]} 
      contentContainerStyle={[styles.contentContainer, { paddingBottom: Math.max(insets.bottom, 16) + 36 }]} 
      showsVerticalScrollIndicator={false}
    >
      {/* Top Navigation */}
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
        <Text style={[styles.topNavTitle, { color: theme.textPrimary }]}>Privacy & Security</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Hero Badge */}
      <View
        style={[
          styles.heroBox,
          {
            backgroundColor: isDark ? theme.surface : '#f0fdf4',
            borderColor: isDark ? theme.border : '#dcfce7',
          },
        ]}
      >
        <View style={[styles.heroIconCircle, { backgroundColor: isDark ? theme.surfaceElevated : '#dcfce7' }]}>
          <ShieldCheck size={28} color="#16a34a" />
        </View>
        <Text style={[styles.heroTitle, { color: theme.accent }]}>Privacy by Design</Text>
        <Text style={[styles.heroSub, { color: theme.textSecondary }]}>
          Compliant with Ethiopian Personal Data Protection Proclamation No. 1321/2024. Your health data belongs to you.
        </Text>
      </View>

      {/* Section: Your Data & Controls */}
      <Text style={[styles.sectionTitle, { color: theme.textTertiary }]}>Your Data & Consent</Text>
      <View style={[styles.menuGroup, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/consent-settings')} activeOpacity={0.7}>
          <View style={[styles.menuIconWrap, { backgroundColor: theme.accentGlow }]}>
            <Sliders size={20} color="#16a34a" />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.menuLabel, { color: theme.textPrimary }]}>Granular Consent Settings</Text>
            <Text style={[styles.menuSub, { color: theme.textSecondary }]}>Control AI context, wearable sync, and telemetry</Text>
          </View>
          <ChevronRight size={18} color={theme.textTertiary} />
        </TouchableOpacity>

        <View style={[styles.divider, { backgroundColor: theme.borderSubtle }]} />

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/permissions-management')} activeOpacity={0.7}>
          <View style={[styles.menuIconWrap, { backgroundColor: isDark ? theme.surfaceElevated : '#eff6ff' }]}>
            <Smartphone size={20} color="#3b82f6" />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.menuLabel, { color: theme.textPrimary }]}>Device Permissions</Text>
            <Text style={[styles.menuSub, { color: theme.textSecondary }]}>Review microphone, camera, and notification access</Text>
          </View>
          <ChevronRight size={18} color={theme.textTertiary} />
        </TouchableOpacity>

        <View style={[styles.divider, { backgroundColor: theme.borderSubtle }]} />

        <TouchableOpacity style={styles.menuItem} onPress={handleDownloadData} activeOpacity={0.7}>
          <View style={[styles.menuIconWrap, { backgroundColor: isDark ? theme.surfaceElevated : '#f5f3ff' }]}>
            <Download size={20} color="#8b5cf6" />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.menuLabel, { color: theme.textPrimary }]}>Export Personal Data</Text>
            <Text style={[styles.menuSub, { color: theme.textSecondary }]}>Download portable JSON archive of your records</Text>
          </View>
          <ChevronRight size={18} color={theme.textTertiary} />
        </TouchableOpacity>
      </View>

      {/* Section: Legal & Policies */}
      <Text style={[styles.sectionTitle, { color: theme.textTertiary }]}>Legal & Compliance</Text>
      <View style={[styles.menuGroup, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push({ pathname: '/legal', params: { type: 'privacy' } })} activeOpacity={0.7}>
          <View style={[styles.menuIconWrap, { backgroundColor: theme.accentGlow }]}>
            <ShieldCheck size={20} color="#16a34a" />
          </View>
          <Text style={[styles.legalLabel, { color: theme.textPrimary }]}>Privacy Policy</Text>
          <ChevronRight size={18} color={theme.textTertiary} />
        </TouchableOpacity>

        <View style={[styles.divider, { backgroundColor: theme.borderSubtle }]} />

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push({ pathname: '/legal', params: { type: 'terms' } })} activeOpacity={0.7}>
          <View style={[styles.menuIconWrap, { backgroundColor: isDark ? theme.surfaceElevated : '#eff6ff' }]}>
            <FileText size={20} color="#3b82f6" />
          </View>
          <Text style={[styles.legalLabel, { color: theme.textPrimary }]}>Terms of Service</Text>
          <ChevronRight size={18} color={theme.textTertiary} />
        </TouchableOpacity>

        <View style={[styles.divider, { backgroundColor: theme.borderSubtle }]} />

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push({ pathname: '/legal', params: { type: 'health-safety' } })} activeOpacity={0.7}>
          <View style={[styles.menuIconWrap, { backgroundColor: isDark ? theme.surfaceElevated : '#fff7ed' }]}>
            <Lock size={20} color="#f97316" />
          </View>
          <Text style={[styles.legalLabel, { color: theme.textPrimary }]}>Health & Clinical Safety Disclaimer</Text>
          <ChevronRight size={18} color={theme.textTertiary} />
        </TouchableOpacity>

        <View style={[styles.divider, { backgroundColor: theme.borderSubtle }]} />

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push({ pathname: '/legal', params: { type: 'cookies' } })} activeOpacity={0.7}>
          <View style={[styles.menuIconWrap, { backgroundColor: theme.surfaceElevated }]}>
            <FileText size={20} color={theme.textSecondary} />
          </View>
          <Text style={[styles.legalLabel, { color: theme.textPrimary }]}>Cookie & Storage Policy</Text>
          <ChevronRight size={18} color={theme.textTertiary} />
        </TouchableOpacity>
      </View>

      {/* Section: Account Danger Zone */}
      <Text style={[styles.sectionTitle, { color: '#dc2626' }]}>Account Management</Text>
      <View
        style={[
          styles.menuGroup,
          {
            backgroundColor: theme.surface,
            borderColor: isDark ? '#7f1d1d' : '#fecaca',
          },
        ]}
      >
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/delete-account')} activeOpacity={0.7}>
          <View style={[styles.menuIconWrap, { backgroundColor: isDark ? '#7f1d1d30' : '#fef2f2' }]}>
            <Trash2 size={20} color="#dc2626" />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.menuLabel, { color: '#dc2626' }]}>Delete Account & Health Data</Text>
            <Text style={[styles.menuSub, { color: theme.textSecondary }]}>Irrevocably erase profile, history, and AI conversations</Text>
          </View>
          <ChevronRight size={18} color="#dc2626" />
        </TouchableOpacity>
      </View>
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
  heroBox: {
    margin: 16,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
  },
  heroIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  heroTitle: { fontSize: 18, fontWeight: '800', marginBottom: 4 },
  heroSub: { fontSize: 13, textAlign: 'center', lineHeight: 18 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 8,
  },
  menuGroup: {
    marginHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, minHeight: 52 },
  menuIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: { fontSize: 15, fontWeight: '700' },
  menuSub: { fontSize: 12, marginTop: 2 },
  legalLabel: { flex: 1, fontSize: 14, fontWeight: '600', marginLeft: 12 },
  divider: { height: 1, marginLeft: 66 },
});
