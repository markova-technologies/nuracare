import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../src/context/ThemeContext';
import { ArrowLeft, Camera, Mic, MapPin, Bell, Activity, Bluetooth, CheckCircle2, XCircle } from 'lucide-react-native';
import { PermissionType, PERMISSION_RATIONALES } from '../src/permissions/permissionTypes';
import { permissionService } from '../src/permissions/permissionService';
import PermissionExplanationModal from '../src/permissions/components/PermissionExplanationModal';

export default function PermissionsManagementScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const [selectedType, setSelectedType] = useState<PermissionType | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const permissionsList: PermissionType[] = [
    'camera',
    'microphone',
    'location',
    'notifications',
    'health_connect',
    'bluetooth'
  ];

  const getIcon = (type: PermissionType) => {
    switch (type) {
      case 'camera': return <Camera size={20} color={theme.accent} />;
      case 'microphone': return <Mic size={20} color={theme.accent} />;
      case 'location': return <MapPin size={20} color={theme.accent} />;
      case 'notifications': return <Bell size={20} color={theme.accent} />;
      case 'health_connect': return <Activity size={20} color={theme.accent} />;
      case 'bluetooth': return <Bluetooth size={20} color={theme.accent} />;
    }
  };

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
        <Text style={[styles.topNavTitle, { color: theme.textPrimary }]}>Device Permissions</Text>
        <View style={{ width: 44 }} />
      </View>

      <View
        style={[
          styles.introBanner,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
        ]}
      >
        <Text style={[styles.introText, { color: theme.textSecondary }]}>
          NuraCare follows the principle of data minimization. We only request permissions contextually when you choose to use an active feature.
        </Text>
      </View>

      <View style={[styles.cardGroup, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        {permissionsList.map((type, index) => {
          const rationale = PERMISSION_RATIONALES[type];
          const status = permissionService.getStatus(type);
          const isGranted = status === 'granted';
          const isLast = index === permissionsList.length - 1;

          return (
            <TouchableOpacity 
              key={type} 
              style={[
                styles.permissionRow,
                !isLast && { borderBottomColor: theme.borderSubtle, borderBottomWidth: 1 },
              ]}
              onPress={() => setSelectedType(type)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconCircle, { backgroundColor: theme.accentGlow }]}>
                {getIcon(type)}
              </View>
              <View style={{ flex: 1, marginLeft: 12, paddingRight: 8 }}>
                <Text style={[styles.permissionTitle, { color: theme.textPrimary }]}>{rationale.title}</Text>
                <Text style={[styles.permissionFeature, { color: theme.accent }]}>{rationale.featureUsingIt}</Text>
                <Text style={[styles.permissionDesc, { color: theme.textSecondary }]} numberOfLines={2}>
                  {rationale.explanation}
                </Text>
              </View>

              <View
                style={[
                  styles.statusBadge,
                  isGranted
                    ? { backgroundColor: isDark ? '#14532d30' : '#dcfce7' }
                    : { backgroundColor: theme.surfaceElevated },
                ]}
              >
                {isGranted ? (
                  <CheckCircle2 size={14} color="#16a34a" />
                ) : (
                  <XCircle size={14} color={theme.textTertiary} />
                )}
                <Text
                  style={[
                    styles.statusText,
                    isGranted ? { color: '#16a34a' } : { color: theme.textTertiary },
                  ]}
                >
                  {isGranted ? 'Active' : 'Off'}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Explanation Dialog */}
      {selectedType && (
        <PermissionExplanationModal
          visible={Boolean(selectedType)}
          type={selectedType}
          onCancel={() => setSelectedType(null)}
          onContinue={async () => {
            await permissionService.requestPermission(selectedType);
            setSelectedType(null);
            setRefreshKey((k) => k + 1);
          }}
        />
      )}
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
  introBanner: {
    margin: 16,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  introText: { fontSize: 13, lineHeight: 18 },
  cardGroup: {
    marginHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    overflow: 'hidden',
  },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    minHeight: 64,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionTitle: { fontSize: 15, fontWeight: '700' },
  permissionFeature: { fontSize: 12, fontWeight: '600', marginBottom: 2 },
  permissionDesc: { fontSize: 12, lineHeight: 16 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: { fontSize: 11, fontWeight: '700' },
});
