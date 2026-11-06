import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';
const memoryStore = new Map<string, string>();

let mmkvInstance: any = null;
let mmkvInitAttempted = false;

function getMMKV(): any | null {
  if (isWeb) return null;
  if (mmkvInitAttempted) return mmkvInstance;
  mmkvInitAttempted = true;
  try {
    const { MMKV } = require('react-native-mmkv');
    if (MMKV) {
      const instance = new MMKV({ id: 'nuracare-mobile-storage' });
      // Verify native read/write without crashing
      instance.set('__test_probe__', '1');
      instance.getString('__test_probe__');
      instance.delete('__test_probe__');
      mmkvInstance = instance;
    }
  } catch (err) {
    console.warn('[Storage] Native MMKV unavailable, falling back to memoryStore:', err);
    mmkvInstance = null;
  }
  return mmkvInstance;
}

export const storage = {
  set: (k: string, v: string) => {
    if (isWeb) {
      try { localStorage.setItem(k, v); return; } catch (e) {}
    }
    const inst = getMMKV();
    if (inst) {
      try {
        inst.set(k, v);
        return;
      } catch (e) {
        console.warn('[Storage] MMKV.set runtime error, using memoryStore:', e);
        mmkvInstance = null;
      }
    }
    memoryStore.set(k, v);
  },
  getString: (k: string): string | null => {
    if (isWeb) {
      try { return localStorage.getItem(k); } catch (e) { return null; }
    }
    const inst = getMMKV();
    if (inst) {
      try {
        return inst.getString(k) ?? null;
      } catch (e) {
        console.warn('[Storage] MMKV.getString runtime error, using memoryStore:', e);
        mmkvInstance = null;
      }
    }
    return memoryStore.get(k) ?? null;
  },
  delete: (k: string) => {
    if (isWeb) {
      try { localStorage.removeItem(k); return; } catch (e) {}
    }
    const inst = getMMKV();
    if (inst) {
      try {
        inst.delete(k);
        return;
      } catch (e) {
        mmkvInstance = null;
      }
    }
    memoryStore.delete(k);
  },
  clearAll: () => {
    if (isWeb) {
      try { localStorage.clear(); return; } catch (e) {}
    }
    const inst = getMMKV();
    if (inst) {
      try {
        inst.clearAll();
        return;
      } catch (e) {
        mmkvInstance = null;
      }
    }
    memoryStore.clear();
  },
  contains: (k: string): boolean => {
    if (isWeb) {
      try { return localStorage.getItem(k) !== null; } catch (e) { return false; }
    }
    const inst = getMMKV();
    if (inst) {
      try {
        return inst.contains(k);
      } catch (e) {
        mmkvInstance = null;
      }
    }
    return memoryStore.has(k);
  },
  getAllKeys: (): string[] => {
    const inst = getMMKV();
    if (inst) {
      try {
        return inst.getAllKeys();
      } catch (e) {
        mmkvInstance = null;
      }
    }
    return Array.from(memoryStore.keys());
  },
  getBoolean: (k: string): boolean => {
    const val = storage.getString(k);
    return val === 'true';
  },
  getNumber: (k: string): number => {
    const val = storage.getString(k);
    return Number(val) || 0;
  }
};

export function cacheData(key: string, data: any) {
  try {
    storage.set(key, JSON.stringify(data));
  } catch (e) {}
}

export function getCachedData<T>(key: string): T | null {
  try {
    const data = storage.getString(key);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
}
