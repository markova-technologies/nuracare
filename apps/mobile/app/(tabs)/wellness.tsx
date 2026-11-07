import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/context/ThemeContext';
import { LineChart } from 'react-native-chart-kit';
import { Activity, Brain, Moon, Droplets, Shield, Flame, Sparkles } from 'lucide-react-native';
import { useWellnessStore } from '../../src/store';
import { useProfile } from '../../src/context/ProfileContext';
import { computeBurnoutRisk, compute5CoreWellness, getRecoveryRecommendations } from '../../src/lib/wellnessEngine';

const screenWidth = Dimensions.get('window').width;

export default function WellnessScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const { checkIns } = useWellnessStore();
  const { profile } = useProfile();
  
  const recentCheckins = checkIns.slice(0, 7).reverse();
  const latest = recentCheckins.length > 0 ? recentCheckins[recentCheckins.length - 1] : null;

  const burnout = computeBurnoutRisk(latest);
  const wellness = compute5CoreWellness(latest, profile);
  const recommendations = getRecoveryRecommendations(recentCheckins);

  const getChartData = (metric: 'mood' | 'energy' | 'sleep' | 'stress') => {
    if (recentCheckins.length < 2) {
      return {
        labels: ['No Data'],
        datasets: [{ data: [0] }]
      };
    }
    
    return {
      labels: recentCheckins.map(c => new Date(c.date).toLocaleDateString('en-US', { weekday: 'short' })),
      datasets: [{ data: recentCheckins.map(c => c[metric] || 0) }]
    };
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[
        styles.contentInner,
        {
          paddingTop: Math.max(insets.top, 16) + 12,
          paddingBottom: Math.max(insets.bottom, 16) + 95,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Wellness Intelligence</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Your AI-powered health & burnout tracker</Text>
        </View>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: theme.accent }]}
          onPress={() => router.push('/checkin-modal')}
          activeOpacity={0.8}
        >
          <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 20 }}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.gridContainer}>
        {/* 5-Core Wellness */}
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.cardHeader, { color: theme.textSecondary }]}>5-CORE WELLNESS SCORE</Text>
          <View style={[styles.circleContainer, { borderColor: isDark ? theme.surfaceElevated : '#f0fdf4' }]}>
            <Text style={[styles.circleText, { color: wellness.color }]}>{wellness.total}</Text>
          </View>
          <Text style={[styles.cardLabel, { color: wellness.color }]}>{wellness.label}</Text>
        </View>

        {/* Burnout Risk */}
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.cardHeader, { color: theme.textSecondary }]}>BURNOUT RISK TIER</Text>
          <View style={[styles.circleContainer, { borderColor: isDark ? theme.surfaceElevated : '#fff1f2' }]}>
            <Text style={[styles.circleText, { color: burnout.color }]}>{burnout.label}</Text>
          </View>
          <Text style={[styles.cardLabel, { color: burnout.color }]}>{burnout.score} / 100</Text>
        </View>
      </View>

      {/* Insight Summary */}
      <View
        style={[
          styles.insightSummary,
          {
            backgroundColor: isDark ? theme.surface : '#f0fdf4',
            borderColor: theme.accent,
          },
        ]}
      >
        <Sparkles size={24} color={theme.accent} style={{ marginRight: 12, marginTop: 2 }} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.insightTitle, { color: theme.accent }]}>Nura Recovery Assessment</Text>
          <Text style={[styles.insightDesc, { color: theme.textSecondary }]}>
            {burnout.label ? `Burnout indicator: ${burnout.label}. Complete regular check-ins to track recovery.` : 'Complete regular check-ins to unlock deep biometric correlation and restorative recovery suggestions.'}
          </Text>
        </View>
      </View>

      {/* Core Breakdown */}
      <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Core System Breakdown</Text>
      <View style={[styles.breakdownCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <StatRow icon={<Moon size={18} color="#6366f1" />} label="Sleep Restoration" value={wellness.cores.recovery} color="#6366f1" theme={theme} isDark={isDark} />
        <StatRow icon={<Brain size={18} color="#0ea5e9" />} label="Cognitive Resilience" value={wellness.cores.mental} color="#0ea5e9" theme={theme} isDark={isDark} />
        <StatRow icon={<Activity size={18} color="#16a34a" />} label="Physical Vitality" value={wellness.cores.physical} color="#16a34a" theme={theme} isDark={isDark} />
        <StatRow icon={<Flame size={18} color="#f59e0b" />} label="Preventive Balance" value={wellness.cores.preventive} color="#f59e0b" theme={theme} isDark={isDark} />
        <StatRow icon={<Droplets size={18} color="#14b8a6" />} label="Hydration & Fuel" value={wellness.cores.nutrition} color="#14b8a6" theme={theme} isDark={isDark} isLast />
      </View>

      {/* Recovery Recommendations */}
      <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Proactive Restorative Actions</Text>
      {recommendations.length === 0 ? (
        <Text style={[styles.emptyState, { color: theme.textTertiary }]}>No critical actions needed right now. System in equilibrium.</Text>
      ) : (
        recommendations.map((rec, i) => (
          <View key={i} style={[styles.recCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Shield size={20} color={theme.accent} />
            <Text style={[styles.recText, { color: theme.textPrimary }]}>{rec}</Text>
          </View>
        ))
      )}

      {/* 7-Day Trend Chart */}
      <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>7-Day Energy & Recovery Trajectory</Text>
      <View style={[styles.chartCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <MetricChart label="Daily Energy" data={getChartData('energy')} color={theme.accent} theme={theme} isDark={isDark} />
      </View>
    </ScrollView>
  );
}

function StatRow({ icon, label, value, color, theme, isDark, isLast }: { icon: any; label: string; value: number; color: string; theme: any; isDark: boolean; isLast?: boolean }) {
  return (
    <View style={[styles.coreStatContainer, !isLast && { borderBottomColor: theme.borderSubtle, borderBottomWidth: 1, paddingBottom: 14 }]}>
      <View style={[styles.coreStatIconBg, { backgroundColor: isDark ? theme.surfaceElevated : `${color}15` }]}>
        {icon}
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={[styles.statLabel, { color: theme.textPrimary }]}>{label}</Text>
        <View style={[styles.progressBar, { backgroundColor: theme.inputBorder }]}>
          <View style={[styles.progressFill, { width: `${value}%`, backgroundColor: color }]} />
        </View>
      </View>
      <Text style={[styles.statValue, { color }]}>{value}%</Text>
    </View>
  );
}

function MetricChart({ label, data, color, theme, isDark }: { label: string; data: any; color: string; theme: any; isDark: boolean }) {
  return (
    <View style={{ width: '100%', alignItems: 'center' }}>
      <Text style={[styles.chartLabel, { color: theme.textSecondary }]}>{label}</Text>
      <LineChart
        data={data}
        width={screenWidth - 72}
        height={180}
        chartConfig={{
          backgroundColor: isDark ? theme.surface : '#ffffff',
          backgroundGradientFrom: isDark ? theme.surface : '#ffffff',
          backgroundGradientTo: isDark ? theme.surface : '#ffffff',
          decimalPlaces: 0,
          color: (opacity = 1) => color,
          labelColor: (opacity = 1) => theme.textTertiary,
          style: { borderRadius: 16 },
          propsForDots: { r: '4', strokeWidth: '2', stroke: color }
        }}
        bezier
        style={{ borderRadius: 16 }}
        withVerticalLines={false}
        withHorizontalLines={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentInner: { paddingHorizontal: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 22, fontWeight: '800' },
  subtitle: { fontSize: 13, marginTop: 2 },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridContainer: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  card: {
    flex: 1,
    padding: 16,
    borderRadius: 18,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8, marginBottom: 10, textAlign: 'center' },
  circleContainer: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  circleText: { fontSize: 20, fontWeight: '800' },
  cardLabel: { fontSize: 13, fontWeight: '700' },
  insightSummary: {
    borderWidth: 1.5,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    marginBottom: 24,
  },
  insightTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  insightDesc: { fontSize: 13, lineHeight: 18 },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 12, marginTop: 4 },
  breakdownCard: {
    borderRadius: 18,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
  },
  coreStatContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  coreStatIconBg: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  progressBar: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  statValue: { fontSize: 14, fontWeight: '700', marginLeft: 12 },
  chartCard: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
  },
  chartLabel: { fontSize: 13, fontWeight: '600', marginBottom: 10 },
  recCard: {
    padding: 16,
    borderRadius: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderLeftWidth: 4,
    borderLeftColor: '#16a34a',
  },
  recText: { fontSize: 13.5, flex: 1, lineHeight: 19 },
  emptyState: { textAlign: 'center', fontStyle: 'italic', marginBottom: 20 },
});
