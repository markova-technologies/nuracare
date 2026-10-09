import { storage } from './mmkv';

const PROFILE_KEY = 'user_profile';

export function saveProfile(profile: any) {
  try {
    if (!profile) {
      storage.delete(PROFILE_KEY);
      return;
    }
    storage.set(PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.warn('[ProfileStorage] Failed to save profile:', e);
  }
}

export function getProfile(): any | null {
  try {
    const data = storage.getString(PROFILE_KEY);
    if (!data || data === 'undefined' || data === 'null') return null;
    return JSON.parse(data);
  } catch (e) {
    console.warn('[ProfileStorage] Corrupted profile in storage, resetting:', e);
    try {
      storage.delete(PROFILE_KEY);
    } catch {}
    return null;
  }
}

export function clearProfile() {
  try {
    storage.delete(PROFILE_KEY);
  } catch (e) {
    console.warn('[ProfileStorage] Failed to clear profile:', e);
  }
}
