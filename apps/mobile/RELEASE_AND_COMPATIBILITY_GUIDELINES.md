# NuraCare Mobile — Universal Compatibility & Release Guidelines

## 1. Overview & Core Philosophy
NuraCare is a critical healthcare companion designed for users across diverse hardware and socioeconomic environments.
A crash on launch or failure to install leads directly to loss of user trust, critical care interruption, and financial loss.

**The Universal Compatibility Rule:**
> NuraCare must be compatible across all Android versions from **Android 7.0 (API 24)** up through the latest **Android 15+ (API 36)** on all chipset architectures (`arm64-v8a`, `armeabi-v7a`, `x86_64`). No platform-specific or cutting-edge beta module should ever be introduced without strict backward-compatible fallbacks.

---

## 2. Key Incident Post-Mortem (v1.0.8 -> v1.0.9 Fixes)

### A. The Fatal Native Startup Crash (`NoClassDefFoundError: LazyKType`)
- **What Occurred:**
  In v1.0.8, the app crashed instantly on device launch with the Samsung One UI dialog: *"Clear cache for NuraCare? NuraCare closed because this app has a bug."*
  ADB crash log revealed:
  ```text
  FATAL EXCEPTION: pool-3-thread-1
  Process: com.darikab71.nuracaremobile, PID: 25190
  java.lang.NoClassDefFoundError: Failed resolution of: Lexpo/modules/kotlin/types/LazyKType;
      at expo.modules.av.video.VideoViewModule.definition(VideoViewModule.kt:118)
  Caused by: java.lang.ClassNotFoundException: expo.modules.kotlin.types.LazyKType
  ```
- **Root Cause:**
  `expo-av` 16.0.8 relies on an internal Kotlin binding (`LazyKType`) that Expo deprecated and removed in recent SDK core packages. When `ExpoModulesPackage.createNativeModules()` executed during Android Application startup, `VideoViewModule` crashed the process **before React Native, JavaScript, or any UI code could mount**.
- **Permanent Prevention Rule:**
  - **Never use `expo-av`:** Expo officially deprecated `expo-av`. Any audio/video playback must use `expo-video` and `expo-audio`.
  - Background visual animations (such as floating nature particles in `FloatingNatureBackground.tsx`) must rely on pure React Native Reanimated / SVG rather than loading heavy video native modules.
  - Avoid experimental/unsupported packages like `@expo/ui`, `expo-glass-effect`, and `expo-symbols` in production Android builds.

---

### B. Defensive Native Storage Fallback (MMKV Isolation)
- **What Occurred:**
  Native C++ storage engines (like MMKV) can fail on older Android versions, custom ROMs, or restricted enterprise work profiles if native libraries fail to link or encryption keys fail to initialize.
- **Permanent Prevention Rule:**
  - `apps/mobile/src/storage/mmkv.ts` must maintain lazy initialization wrapped in try/catch with an automatic in-memory Map fallback.
  - **Zero-Crash Invariant:** Storage failure must degrade to an in-memory session rather than throwing a native crash that terminates the app.

---

### C. Monorepo Archive Compression & Disk Space (`ENOSPC`)
- **What Occurred:**
  When executing `eas build`, the EAS CLI compresses the workspace into the OS temporary directory (`%TEMP%`, usually on Drive C:). If Drive C: has low disk space (<1 GB), the compression silently terminates halfway (`ENOSPC`), sending a corrupt or incomplete archive missing `apps/mobile/package.json` to EAS Cloud.
- **Permanent Prevention Rule:**
  - Always execute EAS builds using `scripts/build_android_eas.bat`, which explicitly routes `TEMP=D:\Temp` and `TMP=D:\Temp` where sufficient storage is guaranteed.
  - Keep `.easignore` updated to ignore non-mobile monorepo directories (`apps/backend/node_modules`, `tests`, `docs`, `artifacts`, `dist`, `.git`).

---

### D. Device Storage Thresholds (`INSTALL_FAILED_INSUFFICIENT_STORAGE`)
- **What Occurred:**
  Android's `PackageInstallerService` blocks app installations and updates whenever internal usable storage on `/data` is below `mLowBytes` (typically 1.0 GB), throwing:
  ```text
  INSTALL_FAILED_INSUFFICIENT_STORAGE: Requested internal only, but not enough space
  ```
- **Permanent Prevention Rule:**
  - Keep the APK lean by stripping unused native libraries.
  - On test devices, verify available storage using `adb shell df -h /data` before testing deployment.

---

## 3. Pre-Release Checklist (Required for Every Build)

Before bumping the version or initiating an EAS build, complete each step:

1. **Verify Expo Package Health:**
   ```bash
   cd apps/mobile
   npx expo-doctor
   ```
   *Action:* Resolve any peer dependency conflicts or deprecated packages before proceeding.

2. **Increment Version & VersionCode in `apps/mobile/app.json`:**
   ```json
   {
     "expo": {
       "version": "1.0.X",
       "android": {
         "versionCode": <previous_code + 1>
       }
     }
   }
   ```

3. **Verify EAS Ownership & Project ID:**
   - Account: `@z01a`
   - Project ID: `49bdada9-81ea-438e-8a45-48ad954ecf49`
   - Command: `eas whoami`

4. **Trigger Cloud Build with Scratch Routing:**
   ```bash
   # From repository root
   scripts\build_android_eas.bat
   ```

---

## 4. Post-Release Verification Protocol (Physical / Virtual Device)

After the APK artifact is compiled and downloaded:

1. **Install to Device:**
   ```bash
   adb install -r NuraCare-v1.0.X.apk
   ```
   *Expectation:* `Success`.

2. **Clear and Monitor Crash Buffer:**
   ```bash
   adb logcat -c
   adb shell am start -n com.darikab71.nuracaremobile/.MainActivity
   adb logcat -d -b crash
   ```
   *Expectation:* Zero crash entries returned.

3. **Inspect Interactive Flows via `scrcpy`:**
   - Welcome Screen rendered with smooth ambient particle motion.
   - Guest Mode Onboarding navigation responsive across all steps.
   - Sign In and Sign Up screens responsive.

