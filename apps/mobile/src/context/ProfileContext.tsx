import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase/client';
import { useAuth } from './AuthContext';
import { storage } from '../storage/mmkv';

import { useAuthStore } from '../store';
import { getProfile, saveProfile } from '../storage/profileStorage';

type ProfileContextType = {
  profile: any;
  loading: boolean;
  setProfile: (updates: any) => Promise<void>;
  clearProfile: () => void;
};

const ProfileContext = createContext<ProfileContextType>({} as ProfileContextType);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { user: storeUser } = useAuthStore();
  const currentUser = user || storeUser;
  const [profile, setProfileState] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setProfileState(null);
      setLoading(false);
      return;
    }

    if (currentUser?.id && String(currentUser.id).startsWith('guest_')) {
      const stored = getProfile() || {};
      const guestProfile = {
        id: currentUser.id,
        name: stored.name || currentUser.name || 'Guest Explorer',
        age: stored.age || 28,
        gender: stored.gender || 'female',
        culturalHeritage: stored.culturalHeritage || 'Global',
        langPref: stored.langPref || 'English',
        conditions: stored.conditions || [],
        medications: stored.medications || [],
        fastingMode: stored.fastingMode || currentUser.fastingMode || 'Orthodox Christian (Tsom)',
        medicalNotes: stored.medicalNotes || '',
        records: stored.records || [],
        onboardingCompleted: !!stored.onboardingCompleted,
      };
      setProfileState(guestProfile);
      setLoading(false);
      return;
    }

    async function fetchProfile() {
      if (!currentUser?.id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const userId = currentUser.id;
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (data) {
          const fastingMode = storage.getString(`fastingMode_${userId}`) || 'None';
          const culturalHeritage = storage.getString(`culturalHeritage_${userId}`) || 'Global';
          const langPref = storage.getString(`langPref_${userId}`) || 'English';
          const gender = storage.getString(`gender_${userId}`) || data.gender || 'female';
          const full = { ...data, medicalNotes: data.medical_notes, fastingMode, culturalHeritage, langPref, gender, onboardingCompleted: true };
          setProfileState(full);
          saveProfile(full);
        } else if (error && error.code === 'PGRST116') {
          const stored = getProfile() || {};
          const fallback = {
            id: userId,
            name: currentUser.name || currentUser.user_metadata?.full_name || stored.name || '',
            onboardingCompleted: !!stored.onboardingCompleted,
            _fallback: true
          };
          setProfileState(fallback);
          saveProfile(fallback);
        } else {
          const stored = getProfile() || {};
          const fallback = {
            id: userId,
            name: currentUser.name || currentUser.user_metadata?.full_name || stored.name || '',
            onboardingCompleted: !!stored.onboardingCompleted,
            _fallback: true
          };
          setProfileState(fallback);
          saveProfile(fallback);
        }
      } catch (err) {
        console.warn("Profile fetch error, using local fallback", err);
        const stored = getProfile() || {};
        setProfileState({ id: currentUser.id, name: currentUser.name || 'Nura Explorer', onboardingCompleted: !!stored.onboardingCompleted, _fallback: true });
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [currentUser?.id]);

  const setProfile = async (updates: any) => {
    if (!currentUser?.id) return;
    const userId = currentUser.id;
    
    const dbPayload = { ...updates };
    if ('medicalNotes' in dbPayload) {
      dbPayload.medical_notes = dbPayload.medicalNotes;
      delete dbPayload.medicalNotes;
    }
    
    if ('fastingMode' in dbPayload) {
      storage.set(`fastingMode_${userId}`, dbPayload.fastingMode);
      delete dbPayload.fastingMode;
    }

    if ('culturalHeritage' in dbPayload) {
      storage.set(`culturalHeritage_${userId}`, dbPayload.culturalHeritage);
      delete dbPayload.culturalHeritage;
    }

    if ('langPref' in dbPayload) {
      storage.set(`langPref_${userId}`, dbPayload.langPref);
      delete dbPayload.langPref;
    }

    if ('gender' in dbPayload) {
      storage.set(`gender_${userId}`, dbPayload.gender);
    }
    
    const stored = getProfile() || {};
    saveProfile({ ...stored, ...updates });

    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({ id: userId, ...dbPayload, updated_at: new Date() })
        .select()
        .single();
        
      if (!error && data) {
        const fastingMode = storage.getString(`fastingMode_${userId}`) || updates.fastingMode || 'None';
        const culturalHeritage = storage.getString(`culturalHeritage_${userId}`) || updates.culturalHeritage || 'Global';
        const langPref = storage.getString(`langPref_${userId}`) || updates.langPref || 'English';
        const gender = storage.getString(`gender_${userId}`) || data.gender || updates.gender || 'female';
        const merged = { ...data, medicalNotes: data.medical_notes, fastingMode, culturalHeritage, langPref, gender, onboardingCompleted: updates.onboardingCompleted ?? stored.onboardingCompleted };
        setProfileState(merged);
        saveProfile(merged);
      } else {
        setProfileState((prev: any) => ({ ...(prev || {}), ...updates }));
      }
    } catch (err) {
      setProfileState((prev: any) => ({ ...(prev || {}), ...updates }));
    }
  };

  const clearProfile = () => {
    setProfileState(null);
    setLoading(false);
  };

  return (
    <ProfileContext.Provider value={{ profile, setProfile, clearProfile, loading }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}
