import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useProfile } from '../src/context/ProfileContext';
import { useTheme } from '../src/context/ThemeContext';
import { ChevronLeft, ClipboardList, Calendar, TrendingUp, Activity, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react-native';

export default function RecordsScreen() {
  const insets = useSafeAreaInsets();
  const { profile } = useProfile();
  const { theme, isDark } = useTheme();
  const records = profile?.records || [];

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
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.7}
        >
          <ChevronLeft size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Medical Records</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Your historical health vault</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[
          styles.contentInner,
          { paddingBottom: Math.max(insets.bottom, 16) + 30 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {(!records || records.length === 0) ? (
          <View style={styles.emptyState}>
            <ClipboardList size={64} color={theme.textTertiary} />
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No records yet.</Text>
            <Text style={[styles.emptyDesc, { color: theme.textSecondary }]}>
              Complete a symptom check in the chat to see your history here.
            </Text>
          </View>
        ) : (
          <View style={styles.recordsList}>
            {[...records].reverse().map(r => (
              <ExpandableRecordCard key={r.id} r={r} />
            ))}
          </View>
        )}

        {profile?.medicalNotes && (
          <View style={[styles.notesCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.notesTitle, { color: theme.textPrimary }]}>Extracted Medical Notes</Text>
            <View style={[styles.notesBox, { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSubtle }]}>
              <Text style={[styles.notesText, { color: theme.textSecondary }]}>{profile.medicalNotes}</Text>
            </View>
          </View>
        )}
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function ExpandableRecordCard({ r }: { r: any }) {
  const [expanded, setExpanded] = useState(false);
  const { theme, isDark } = useTheme();
  
  const statusMap: Record<string, string> = { low: 'Improving', mid: 'Monitoring', high: 'Needs Attention' };
  
  const renderIcon = (urgency: string) => {
    switch (urgency) {
      case 'low': return <TrendingUp size={14} color="#16a34a" />;
      case 'mid': return <Activity size={14} color="#d97706" />;
      case 'high': return <AlertTriangle size={14} color="#dc2626" />;
      default: return <Activity size={14} color={theme.textTertiary} />;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch(urgency) {
      case 'low': return { bg: isDark ? '#14532d30' : '#dcfce7', text: '#22c55e', border: isDark ? '#166534' : '#bbf7d0' };
      case 'mid': return { bg: isDark ? '#78350f30' : '#fef3c7', text: '#f59e0b', border: isDark ? '#92400e' : '#fde68a' };
      case 'high': return { bg: isDark ? '#7f1d1d30' : '#fee2e2', text: '#ef4444', border: isDark ? '#991b1b' : '#fecaca' };
      default: return { bg: theme.surfaceElevated, text: theme.textSecondary, border: theme.border };
    }
  };

  const uColors = getUrgencyColor(r.urgency);

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
      ]}
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.dateRow}>
          <Calendar size={14} color={theme.textTertiary} />
          <Text style={[styles.dateText, { color: theme.textSecondary }]}>{r.dateStr}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: uColors.bg, borderColor: uColors.border }]}>
          <Text style={[styles.badgeText, { color: uColors.text }]}>
            {r.urgency ? r.urgency.toUpperCase() : 'UNKNOWN'}
          </Text>
        </View>
      </View>
      
      <Text style={[styles.symptomText, { color: theme.textPrimary }]}>{r.summary}</Text>
      
      <View style={styles.metaRow}>
        <View style={[styles.statusPill, { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSubtle }]}>
          {renderIcon(r.urgency)}
          <Text style={[styles.statusText, { color: theme.textSecondary }]}>{statusMap[r.urgency] || 'Logged'}</Text>
        </View>
        
        <View style={styles.actionHintWrap}>
          {!expanded && r.action && (
            <Text style={[styles.actionHint, { color: theme.textTertiary }]} numberOfLines={1}>
              {r.action.slice(0, 30)}...
            </Text>
          )}
          {expanded ? <ChevronUp size={16} color={theme.textTertiary} /> : <ChevronDown size={16} color={theme.textTertiary} />}
        </View>
      </View>

      {expanded && (
        <View style={[styles.expandedContent, { borderTopColor: theme.borderSubtle }]}>
          <View style={styles.expandedSection}>
            <Text style={[styles.expandedLabel, { color: theme.textPrimary }]}>Action Plan:</Text>
            <Text style={[styles.expandedText, { color: theme.textSecondary }]}>{r.action}</Text>
          </View>
          
          {r.natural && r.natural.length > 0 && (
            <View style={styles.expandedSection}>
              <Text style={[styles.expandedLabel, { color: theme.textPrimary }]}>Natural Remedies:</Text>
              <Text style={[styles.expandedText, { color: theme.textSecondary }]}>{r.natural.join(', ')}</Text>
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },
  headerTextWrap: { flex: 1, alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold' },
  subtitle: { fontSize: 13, marginTop: 2 },
  
  content: { flex: 1 },
  contentInner: { padding: 20 },
  
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
  emptyDesc: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
  
  recordsList: { gap: 16 },
  
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dateText: { fontSize: 14, fontWeight: '500' },
  badge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12, borderWidth: 1 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  
  symptomText: { fontSize: 16, fontWeight: '600', marginBottom: 16, lineHeight: 22 },
  
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  statusText: { fontSize: 13, fontWeight: '600' },
  
  actionHintWrap: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1, justifyContent: 'flex-end', marginLeft: 16 },
  actionHint: { fontSize: 13, flexShrink: 1 },
  
  expandedContent: { marginTop: 16, paddingTop: 16, borderTopWidth: 1 },
  expandedSection: { marginBottom: 12 },
  expandedLabel: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  expandedText: { fontSize: 14, lineHeight: 20 },
  
  notesCard: { marginTop: 32, padding: 20, borderRadius: 16, borderWidth: 1 },
  notesTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  notesBox: { padding: 16, borderRadius: 12, borderWidth: 1 },
  notesText: { fontSize: 14, lineHeight: 22 },
});
