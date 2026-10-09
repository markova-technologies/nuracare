import React from 'react';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/store';
import { useAuth } from '../src/context/AuthContext';
import { getProfile } from '../src/storage/profileStorage';

export default function Index() {
  const { user: authUser, loading } = useAuth();
  const { user: storeUser } = useAuthStore();
  const currentUser = authUser || storeUser;

  if (loading) return null;

  // If user has an active session AND finished onboarding, open tabs
  if (currentUser) {
    const profile = getProfile();
    if (profile?.onboardingCompleted) {
      return <Redirect href="/(tabs)" />;
    }
    // Has account/session but hasn't completed onboarding steps
    return <Redirect href="/(auth)/onboarding/step1" />;
  }

  // Brand new or unauthenticated user: show Welcome, Login & Sign-up
  return <Redirect href="/(auth)/login" />;
}
