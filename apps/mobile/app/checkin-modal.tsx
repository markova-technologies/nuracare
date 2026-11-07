import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWellnessStore } from '../src/store';
import { useProfile } from '../src/context/ProfileContext';
import { useTheme } from '../src/context/ThemeContext';
import { compute5CoreWellness } from '../src/lib/wellnessEngine';
import { ChevronRight, ChevronLeft, CheckCircle, Smartphone } from 'lucide-react-native';

const TOTAL_STEPS = 5;

export default function CheckInModal() {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const { setScore, addCheckIn, checkIns } = useWellnessStore();
  const { profile } = useProfile();
  const [step, setStep] = useState(1);
  
  // State for Step 1: Physical
  const [painLevel, setPainLevel] = useState(0);
  const [stiffness, setStiffness] = useState(0);
  const [activity, setActivity] = useState(30);

  // State for Step 2: Mental
  const [stress, setStress] = useState(5);
  const [mood, setMood] = useState(5);
  const [sleep, setSleep] = useState(7);

  // State for Step 3: Nutrition
  const [meals, setMeals] = useState(3);
  const [portion, setPortion] = useState('Moderate');
  const [hydration, setHydration] = useState(5);

  // State for Step 4: Context, Digital Wellness & Burnout Quick Check
  const [wearableSynced, setWearableSynced] = useState(false);
  const [phoneStrain, setPhoneStrain] = useState<'Draining' | 'Neutral' | 'Restorative'>('Neutral');
  const [workDrain, setWorkDrain] = useState(5); // 0-10
  const [canDisconnect, setCanDisconnect] = useState<'Easily' | 'With effort' | 'Cannot'>('With effort');
  const [screenTimeEstHours, setScreenTimeEstHours] = useState(4);

  const handleSyncWearable = async () => {
    try {
      setTimeout(() => {
        setWearableSynced(true);
        Alert.alert("Success", "Wearable data synced successfully.");
      }, 1000);
    } catch (err) {
      Alert.alert("Error", "Could not sync wearables.");
    }
  };

  const handleSubmit = () => {
    const entry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      timestamp: Date.now(),
      painLevel,
      stiffness,
      activity,
      energy: Math.round(activity / 12),
      stress,
      mood,
      sleep,
      meals,
      portion,
      hydration,
      wearableSynced,
      phoneStrain,
      workDrain,
      canDisconnect,
      screenTimeEstHours,
      tension: stiffness > 5 ? 'High' : 'None',
      urgency: painLevel > 7 ? 'high' : 'low',
      tags: []
    } as any;

    addCheckIn(entry);
    
    const newScore = compute5CoreWellness(entry, profile || {});
    setScore(newScore.total);

    router.back();
  };

  const renderSlider = (label: string, value: number, setValue: (val: number) => void, max: number = 10, min: number = 0) => (
    <View style={styles.inputGroup} key={label}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, { color: theme.textPrimary }]}>{label}</Text>
        <Text style={[styles.valueText, { color: theme.accent }]}>{value} / {max}</Text>
      </View>
      <View style={styles.stepperRow}>
        <TouchableOpacity
          style={[styles.stepperBtn, { backgroundColor: theme.surfaceElevated }]}
          onPress={() => setValue(Math.max(min, value - 1))}
          activeOpacity={0.7}
        >
          <Text style={[styles.stepperIcon, { color: theme.textPrimary }]}>-</Text>
        </TouchableOpacity>
        <View style={[styles.track, { backgroundColor: theme.inputBorder }]}>
          <View style={[styles.fill, { width: `${(value / max) * 100}%`, backgroundColor: theme.accent }]} />
        </View>
        <TouchableOpacity
          style={[styles.stepperBtn, { backgroundColor: theme.surfaceElevated }]}
          onPress={() => setValue(Math.min(max, value + 1))}
          activeOpacity={0.7}
        >
          <Text style={[styles.stepperIcon, { color: theme.textPrimary }]}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: theme.textPrimary }]}>Physical Well-being</Text>
      <Text style={[styles.stepSubtitle, { color: theme.textSecondary }]}>How is your body feeling?</Text>
      {renderSlider('Pain Level', painLevel, setPainLevel, 10)}
      {renderSlider('Joint Stiffness', stiffness, setStiffness, 10)}
      {renderSlider('Activity (Minutes)', activity, setActivity, 120, 0)}
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: theme.textPrimary }]}>Mental State</Text>
      <Text style={[styles.stepSubtitle, { color: theme.textSecondary }]}>Check in with your mind.</Text>
      {renderSlider('Stress Level', stress, setStress, 10)}
      {renderSlider('Mood Valence', mood, setMood, 10)}
      {renderSlider('Sleep (Hours)', sleep, setSleep, 12, 0)}
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: theme.textPrimary }]}>Nourishment</Text>
      <Text style={[styles.stepSubtitle, { color: theme.textSecondary }]}>Fueling your vitality.</Text>
      {renderSlider('Main Meals', meals, setMeals, 6, 0)}
      {renderSlider('Hydration (Glasses)', hydration, setHydration, 15, 0)}
      
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.textPrimary, marginBottom: 12 }]}>Portion Scale</Text>
        <View style={styles.chipsRow}>
          {['Light', 'Moderate', 'Substantial'].map(p => (
            <TouchableOpacity 
              key={p} 
              style={[
                styles.chip,
                { backgroundColor: theme.surfaceElevated, borderColor: theme.border },
                portion === p && { backgroundColor: theme.accentDeep, borderColor: theme.accent }
              ]} 
              onPress={() => setPortion(p)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.chipText,
                { color: theme.textSecondary },
                portion === p && { color: theme.accent, fontWeight: '700' }
              ]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: theme.textPrimary }]}>Context & Digital Load</Text>
      <Text style={[styles.stepSubtitle, { color: theme.textSecondary }]}>Protecting your cognitive flow.</Text>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.textPrimary, marginBottom: 8 }]}>Daily Screen Load (Hours)</Text>
        {renderSlider('Est. Screen Time', screenTimeEstHours, setScreenTimeEstHours, 16, 1)}
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.textPrimary, marginBottom: 12 }]}>Device Stress Impact</Text>
        <View style={styles.chipsRow}>
          {(['Restorative', 'Neutral', 'Draining'] as const).map(s => (
            <TouchableOpacity 
              key={s} 
              style={[
                styles.chip,
                { backgroundColor: theme.surfaceElevated, borderColor: theme.border },
                phoneStrain === s && { backgroundColor: theme.accentDeep, borderColor: theme.accent }
              ]} 
              onPress={() => setPhoneStrain(s)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.chipText,
                { color: theme.textSecondary },
                phoneStrain === s && { color: theme.accent, fontWeight: '700' }
              ]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.textPrimary, marginBottom: 12 }]}>Ability to Disconnect</Text>
        <View style={styles.chipsRow}>
          {(['Easily', 'With effort', 'Cannot'] as const).map(d => (
            <TouchableOpacity 
              key={d} 
              style={[
                styles.chip,
                { backgroundColor: theme.surfaceElevated, borderColor: theme.border },
                canDisconnect === d && { backgroundColor: theme.accentDeep, borderColor: theme.accent }
              ]} 
              onPress={() => setCanDisconnect(d)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.chipText,
                { color: theme.textSecondary },
                canDisconnect === d && { color: theme.accent, fontWeight: '700' }
              ]}>{d}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={[styles.syncCard, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
        <Smartphone size={32} color={theme.accent} />
        <Text style={[styles.syncTitle, { color: theme.textPrimary }]}>Device Integration</Text>
        <Text style={[styles.syncDesc, { color: theme.textSecondary }]}>Sync health data directly from your device sensor hub.</Text>
        <TouchableOpacity 
          style={[
            styles.syncBtn,
            { backgroundColor: wearableSynced ? theme.accentDeep : theme.surface },
            wearableSynced && { borderColor: theme.accent, borderWidth: 1 }
          ]} 
          onPress={handleSyncWearable}
          activeOpacity={0.8}
        >
          <Text style={[
            styles.syncBtnText,
            { color: theme.textSecondary },
            wearableSynced && { color: theme.accent, fontWeight: '700' }
          ]}>
            {wearableSynced ? 'Sensors Synchronized' : 'Sync Wearable Data'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep5 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.successIcon}>
        <CheckCircle size={64} color="#16a34a" />
      </View>
      <Text style={[styles.stepTitle, { textAlign: 'center', color: theme.textPrimary }]}>Daily Check-in Ready</Text>
      <Text style={[styles.stepSubtitle, { textAlign: 'center', color: theme.textSecondary }]}>Your 5-Core Wellness Index is updating.</Text>

      <View style={[styles.summaryBox, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryItemLabel, { color: theme.textSecondary }]}>Physical Energy:</Text>
          <Text style={[styles.summaryItemVal, { color: theme.textPrimary }]}>{Math.round(activity / 12)} / 10</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryItemLabel, { color: theme.textSecondary }]}>Cognitive Stress:</Text>
          <Text style={[styles.summaryItemVal, { color: theme.textPrimary }]}>{stress} / 10</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryItemLabel, { color: theme.textSecondary }]}>Mood Valence:</Text>
          <Text style={[styles.summaryItemVal, { color: theme.textPrimary }]}>{mood} / 10</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryItemLabel, { color: theme.textSecondary }]}>Restorative Sleep:</Text>
          <Text style={[styles.summaryItemVal, { color: theme.textPrimary }]}>{sleep} hrs</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryItemLabel, { color: theme.textSecondary }]}>Digital Load:</Text>
          <Text style={[styles.summaryItemVal, { color: theme.textPrimary }]}>{screenTimeEstHours}h ({phoneStrain})</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
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
        {step > 1 ? (
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => setStep(s => s - 1)}
            activeOpacity={0.7}
          >
            <ChevronLeft size={24} color={theme.textPrimary} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={[styles.cancelText, { color: theme.textSecondary }]}>Cancel</Text>
          </TouchableOpacity>
        )}
        
        <View style={styles.progressWrap}>
          {[1, 2, 3, 4, 5].map(i => (
            <View 
              key={i} 
              style={[
                styles.progressDot,
                { backgroundColor: theme.inputBorder },
                step === i && [styles.progressDotActive, { backgroundColor: theme.accent }]
              ]} 
            />
          ))}
        </View>

        <View style={styles.iconBtnSpacer} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentInner}
        showsVerticalScrollIndicator={false}
      >
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
        {step === 5 && renderStep5()}
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            paddingBottom: Math.max(insets.bottom, 16) + 16,
            backgroundColor: theme.surface,
            borderTopColor: theme.border,
          },
        ]}
      >
        {step < TOTAL_STEPS ? (
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: theme.accent }]}
            onPress={() => setStep(s => s + 1)}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>Continue</Text>
            <ChevronRight size={20} color="#ffffff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: theme.accent }]}
            onPress={handleSubmit}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>Finish</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  iconBtn: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  iconBtnSpacer: { width: 44 },
  cancelText: { fontSize: 16, fontWeight: '500' },
  progressWrap: { flexDirection: 'row', gap: 6 },
  progressDot: { width: 8, height: 8, borderRadius: 4 },
  progressDotActive: { width: 24 },
  content: { flex: 1 },
  contentInner: { padding: 24 },
  stepContainer: { flex: 1 },
  stepTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  stepSubtitle: { fontSize: 15, marginBottom: 28 },
  inputGroup: { marginBottom: 26 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  label: { fontSize: 16, fontWeight: '600' },
  valueText: { fontSize: 16, fontWeight: '700' },
  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  stepperBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  stepperIcon: { fontSize: 24, fontWeight: '500' },
  track: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%' },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  chip: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1 },
  chipText: { fontWeight: '500' },
  syncCard: { padding: 24, borderRadius: 18, alignItems: 'center', borderWidth: 1, marginTop: 8 },
  syncTitle: { fontSize: 18, fontWeight: '700', marginTop: 14, marginBottom: 6 },
  syncDesc: { fontSize: 13, textAlign: 'center', marginBottom: 20 },
  syncBtn: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 },
  syncBtnText: { fontWeight: '600' },
  successIcon: { alignItems: 'center', marginBottom: 20, marginTop: 24 },
  summaryBox: { borderRadius: 18, padding: 18, borderWidth: 1, gap: 10, marginTop: 12 },
  summaryItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  summaryItemLabel: { fontSize: 14, fontWeight: '500' },
  summaryItemVal: { fontSize: 15, fontWeight: '700' },
  footer: { padding: 20, borderTopWidth: 1 },
  primaryBtn: {
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryBtnText: { color: '#ffffff', fontSize: 17, fontWeight: 'bold' }
});
