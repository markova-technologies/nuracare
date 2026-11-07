import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../src/context/ThemeContext';
import { ChevronLeft, Activity, Link as LinkIcon, Unlink, PlayCircle, PauseCircle, Loader2, Footprints, HeartPulse, Moon, Flame, Circle, Watch, Heart } from 'lucide-react-native';

export default function DevicesScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();

  const [isFitbitConnected, setIsFitbitConnected] = useState(false);
  const [isOuraConnected, setIsOuraConnected] = useState(false);
  const [isAppleConnected, setIsAppleConnected] = useState(false);
  const [isGarminConnected, setIsGarminConnected] = useState(false);
  
  const [isFitbitSyncActive, setIsFitbitSyncActive] = useState(false);
  const [isOuraSyncActive, setIsOuraSyncActive] = useState(false);
  const [isAppleSyncActive, setIsAppleSyncActive] = useState(false);
  const [isGarminSyncActive, setIsGarminSyncActive] = useState(false);
  
  const [readings, setReadings] = useState<any>({});

  const handleFitbitConnect = () => {
    setIsFitbitConnected(true);
    setReadings((prev: any) => ({ ...prev, steps: 8432, heart_rate: 68 }));
    Alert.alert('Success', 'Fitbit connected successfully.');
  };

  const handleFitbitDisconnect = () => {
    setIsFitbitConnected(false);
    setIsFitbitSyncActive(false);
    setReadings((prev: any) => {
      const { steps, heart_rate, ...rest } = prev;
      return rest;
    });
    Alert.alert('Disconnected', 'Fitbit disconnected successfully.');
  };

  const handleFitbitToggleSync = () => {
    setIsFitbitSyncActive(!isFitbitSyncActive);
  };

  const handleOuraConnect = () => {
    setIsOuraConnected(true);
    setReadings((prev: any) => ({ ...prev, sleep_min: 435, calories: 2450 }));
    Alert.alert('Success', 'Oura Ring connected successfully.');
  };

  const handleOuraDisconnect = () => {
    setIsOuraConnected(false);
    setIsOuraSyncActive(false);
    setReadings((prev: any) => {
      const { sleep_min, calories, ...rest } = prev;
      return rest;
    });
    Alert.alert('Disconnected', 'Oura Ring disconnected successfully.');
  };

  const handleOuraToggleSync = () => {
    setIsOuraSyncActive(!isOuraSyncActive);
  };

  const handleAppleConnect = () => {
    setIsAppleConnected(true);
    setReadings((prev: any) => ({ ...prev, steps: 9820, heart_rate: 64, calories: 2680 }));
    Alert.alert('Success', 'Apple Health connected successfully.');
  };

  const handleAppleDisconnect = () => {
    setIsAppleConnected(false);
    setIsAppleSyncActive(false);
    Alert.alert('Disconnected', 'Apple Health disconnected.');
  };

  const handleAppleToggleSync = () => {
    setIsAppleSyncActive(!isAppleSyncActive);
  };

  const handleGarminConnect = () => {
    setIsGarminConnected(true);
    setReadings((prev: any) => ({ ...prev, steps: 11240, heart_rate: 61, sleep_min: 460 }));
    Alert.alert('Success', 'Garmin device connected successfully.');
  };

  const handleGarminDisconnect = () => {
    setIsGarminConnected(false);
    setIsGarminSyncActive(false);
    Alert.alert('Disconnected', 'Garmin device disconnected.');
  };

  const handleGarminToggleSync = () => {
    setIsGarminSyncActive(!isGarminSyncActive);
  };

  const hasData = Object.keys(readings).length > 0;

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
          <Text style={[styles.title, { color: theme.textPrimary }]}>Connected Devices</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Sync your health data automatically</Text>
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
        {/* Fitbit Card */}
        <View
          style={[
            styles.deviceCard,
            {
              backgroundColor: isDark ? theme.surface : '#f0f9ff',
              borderColor: isDark ? theme.border : '#bae6fd',
            },
          ]}
        >
          <View style={styles.deviceHeaderRow}>
            <View style={[styles.deviceIconBox, { backgroundColor: isDark ? theme.surfaceElevated : '#e0f2fe' }]}>
              <Activity size={28} color="#0ea5e9" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.titleRow}>
                <Text style={[styles.deviceTitle, { color: theme.textPrimary }]}>Fitbit / Google Health</Text>
                {isFitbitConnected && (
                  <View style={styles.connectedBadge}>
                    <Text style={styles.connectedText}>Connected</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.deviceDesc, { color: theme.textSecondary }]}>Sync your daily steps, heart rate, and sleep data.</Text>
            </View>
          </View>
          
          <View style={styles.actionsRow}>
            {!isFitbitConnected ? (
              <TouchableOpacity style={styles.btnPrimary} onPress={handleFitbitConnect} activeOpacity={0.8}>
                <LinkIcon size={18} color="#ffffff" />
                <Text style={styles.btnPrimaryText}>Connect</Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity
                  style={[styles.btnSecondary, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}
                  onPress={handleFitbitToggleSync}
                  activeOpacity={0.8}
                >
                  {isFitbitSyncActive ? (
                    <>
                      <PauseCircle size={18} color={theme.accent} />
                      <Text style={[styles.btnSecondaryText, { color: theme.accent }]}>Pause Sync</Text>
                    </>
                  ) : (
                    <>
                      <PlayCircle size={18} color={theme.accent} />
                      <Text style={[styles.btnSecondaryText, { color: theme.accent }]}>Start Sync</Text>
                    </>
                  )}
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnDanger} onPress={handleFitbitDisconnect} activeOpacity={0.8}>
                  <Unlink size={18} color="#ef4444" />
                  <Text style={styles.btnDangerText}>Disconnect</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Oura Ring Card */}
        <View
          style={[
            styles.deviceCard,
            {
              backgroundColor: isDark ? theme.surface : '#faf5ff',
              borderColor: isDark ? theme.border : '#e9d5ff',
            },
          ]}
        >
          <View style={styles.deviceHeaderRow}>
            <View style={[styles.deviceIconBox, { backgroundColor: isDark ? theme.surfaceElevated : '#f3e8ff' }]}>
              <Circle size={28} color="#a855f7" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.titleRow}>
                <Text style={[styles.deviceTitle, { color: theme.textPrimary }]}>Oura Ring</Text>
                {isOuraConnected && (
                  <View style={styles.connectedBadge}>
                    <Text style={styles.connectedText}>Connected</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.deviceDesc, { color: theme.textSecondary }]}>Track readiness score, sleep stages, and body temperature.</Text>
            </View>
          </View>

          <View style={styles.actionsRow}>
            {!isOuraConnected ? (
              <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: '#a855f7' }]} onPress={handleOuraConnect} activeOpacity={0.8}>
                <LinkIcon size={18} color="#ffffff" />
                <Text style={styles.btnPrimaryText}>Connect</Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity
                  style={[styles.btnSecondary, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}
                  onPress={handleOuraToggleSync}
                  activeOpacity={0.8}
                >
                  {isOuraSyncActive ? (
                    <>
                      <PauseCircle size={18} color="#a855f7" />
                      <Text style={[styles.btnSecondaryText, { color: '#a855f7' }]}>Pause Sync</Text>
                    </>
                  ) : (
                    <>
                      <PlayCircle size={18} color="#a855f7" />
                      <Text style={[styles.btnSecondaryText, { color: '#a855f7' }]}>Start Sync</Text>
                    </>
                  )}
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnDanger} onPress={handleOuraDisconnect} activeOpacity={0.8}>
                  <Unlink size={18} color="#ef4444" />
                  <Text style={styles.btnDangerText}>Disconnect</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Apple Health Card */}
        <View
          style={[
            styles.deviceCard,
            {
              backgroundColor: isDark ? theme.surface : '#fff1f2',
              borderColor: isDark ? theme.border : '#fecdd3',
            },
          ]}
        >
          <View style={styles.deviceHeaderRow}>
            <View style={[styles.deviceIconBox, { backgroundColor: isDark ? theme.surfaceElevated : '#ffe4e6' }]}>
              <Heart size={28} color="#f43f5e" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.titleRow}>
                <Text style={[styles.deviceTitle, { color: theme.textPrimary }]}>Apple Health</Text>
                {isAppleConnected && (
                  <View style={styles.connectedBadge}>
                    <Text style={styles.connectedText}>Connected</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.deviceDesc, { color: theme.textSecondary }]}>Connect Apple HealthKit to sync vitals and activity rings.</Text>
            </View>
          </View>

          <View style={styles.actionsRow}>
            {!isAppleConnected ? (
              <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: '#f43f5e' }]} onPress={handleAppleConnect} activeOpacity={0.8}>
                <LinkIcon size={18} color="#ffffff" />
                <Text style={styles.btnPrimaryText}>Connect</Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity
                  style={[styles.btnSecondary, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}
                  onPress={handleAppleToggleSync}
                  activeOpacity={0.8}
                >
                  {isAppleSyncActive ? (
                    <>
                      <PauseCircle size={18} color="#f43f5e" />
                      <Text style={[styles.btnSecondaryText, { color: '#f43f5e' }]}>Pause Sync</Text>
                    </>
                  ) : (
                    <>
                      <PlayCircle size={18} color="#f43f5e" />
                      <Text style={[styles.btnSecondaryText, { color: '#f43f5e' }]}>Start Sync</Text>
                    </>
                  )}
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnDanger} onPress={handleAppleDisconnect} activeOpacity={0.8}>
                  <Unlink size={18} color="#ef4444" />
                  <Text style={styles.btnDangerText}>Disconnect</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Garmin Card */}
        <View
          style={[
            styles.deviceCard,
            {
              backgroundColor: isDark ? theme.surface : '#f0fdf4',
              borderColor: isDark ? theme.border : '#bbf7d0',
            },
          ]}
        >
          <View style={styles.deviceHeaderRow}>
            <View style={[styles.deviceIconBox, { backgroundColor: isDark ? theme.surfaceElevated : '#dcfce7' }]}>
              <Watch size={28} color="#16a34a" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.titleRow}>
                <Text style={[styles.deviceTitle, { color: theme.textPrimary }]}>Garmin Connect</Text>
                {isGarminConnected && (
                  <View style={styles.connectedBadge}>
                    <Text style={styles.connectedText}>Connected</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.deviceDesc, { color: theme.textSecondary }]}>High-precision athletic tracking, VO2 max, and Body Battery.</Text>
            </View>
          </View>

          <View style={styles.actionsRow}>
            {!isGarminConnected ? (
              <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: '#16a34a' }]} onPress={handleGarminConnect} activeOpacity={0.8}>
                <LinkIcon size={18} color="#ffffff" />
                <Text style={styles.btnPrimaryText}>Connect</Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity
                  style={[styles.btnSecondary, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}
                  onPress={handleGarminToggleSync}
                  activeOpacity={0.8}
                >
                  {isGarminSyncActive ? (
                    <>
                      <PauseCircle size={18} color="#16a34a" />
                      <Text style={[styles.btnSecondaryText, { color: '#16a34a' }]}>Pause Sync</Text>
                    </>
                  ) : (
                    <>
                      <PlayCircle size={18} color="#16a34a" />
                      <Text style={[styles.btnSecondaryText, { color: '#16a34a' }]}>Start Sync</Text>
                    </>
                  )}
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnDanger} onPress={handleGarminDisconnect} activeOpacity={0.8}>
                  <Unlink size={18} color="#ef4444" />
                  <Text style={styles.btnDangerText}>Disconnect</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Live Synchronized Readings */}
        {hasData && (
          <View style={{ marginTop: 24 }}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Latest Device Telemetry</Text>
            
            <View style={styles.grid}>
              {readings.steps && (
                <View style={[styles.dataCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <View style={styles.dataHeader}>
                    <Footprints size={16} color="#16a34a" />
                    <Text style={[styles.dataLabel, { color: theme.textSecondary }]}>Steps</Text>
                  </View>
                  <Text style={[styles.dataValue, { color: theme.textPrimary }]}>{readings.steps.toLocaleString()}</Text>
                </View>
              )}

              {readings.heart_rate && (
                <View style={[styles.dataCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <View style={styles.dataHeader}>
                    <HeartPulse size={16} color="#ef4444" />
                    <Text style={[styles.dataLabel, { color: theme.textSecondary }]}>Resting HR</Text>
                  </View>
                  <Text style={[styles.dataValue, { color: theme.textPrimary }]}>
                    {readings.heart_rate} <Text style={[styles.dataUnit, { color: theme.textSecondary }]}>bpm</Text>
                  </Text>
                </View>
              )}

              {readings.sleep_min && (
                <View style={[styles.dataCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <View style={styles.dataHeader}>
                    <Moon size={16} color="#6366f1" />
                    <Text style={[styles.dataLabel, { color: theme.textSecondary }]}>Sleep</Text>
                  </View>
                  <Text style={[styles.dataValue, { color: theme.textPrimary }]}>
                    {Math.floor(readings.sleep_min / 60)}h {readings.sleep_min % 60}m
                  </Text>
                </View>
              )}

              {readings.calories && (
                <View style={[styles.dataCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <View style={styles.dataHeader}>
                    <Flame size={16} color="#f59e0b" />
                    <Text style={[styles.dataLabel, { color: theme.textSecondary }]}>Calories</Text>
                  </View>
                  <Text style={[styles.dataValue, { color: theme.textPrimary }]}>
                    {readings.calories.toLocaleString()} <Text style={[styles.dataUnit, { color: theme.textSecondary }]}>kcal</Text>
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
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
  
  deviceCard: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 16 },
  deviceHeaderRow: { flexDirection: 'row', gap: 16, alignItems: 'center', marginBottom: 16 },
  deviceIconBox: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  deviceTitle: { fontSize: 18, fontWeight: '700' },
  connectedBadge: { backgroundColor: '#10b981', paddingVertical: 2, paddingHorizontal: 8, borderRadius: 12 },
  connectedText: { fontSize: 12, fontWeight: '700', color: '#ffffff' },
  deviceDesc: { fontSize: 14, lineHeight: 20 },
  
  actionsRow: { flexDirection: 'row', gap: 12 },
  btnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0ea5e9',
    padding: 14,
    borderRadius: 12,
    minHeight: 48,
  },
  btnPrimaryText: { color: '#ffffff', fontSize: 15, fontWeight: '600' },
  btnDanger: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fef2f2',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fee2e2',
    minHeight: 48,
  },
  btnDangerText: { color: '#ef4444', fontSize: 15, fontWeight: '600' },
  btnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 48,
  },
  btnSecondaryText: { fontSize: 15, fontWeight: '600' },
  
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  dataCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  dataHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  dataLabel: { fontSize: 14, fontWeight: '600' },
  dataValue: { fontSize: 24, fontWeight: '800' },
  dataUnit: { fontSize: 14, fontWeight: '600' }
});
