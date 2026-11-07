const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT_DIR = path.resolve(__dirname, '..');
const MOBILE_DIR = path.join(ROOT_DIR, 'apps', 'mobile');
const APK_DEST = path.join(ROOT_DIR, 'NuraCare-v1.0.9.apk');
const ADB_PATH = 'C:\\Program Files\\scrcpy\\adb.exe';

let BUILD_ID = process.argv[2] || '';

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    console.log(`[Download] Starting download from: ${url}`);
    const file = fs.createWriteStream(dest);
    
    function get(reqUrl) {
      https.get(reqUrl, res => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          console.log(`[Download] Redirecting to: ${res.headers.location}`);
          return get(res.headers.location);
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode} while downloading APK`));
        }
        const total = parseInt(res.headers['content-length'] || '0', 10);
        let downloaded = 0;
        res.on('data', chunk => {
          downloaded += chunk.length;
          if (total) {
            const pct = Math.round((downloaded / total) * 100);
            const mbDown = (downloaded / 1024 / 1024).toFixed(1);
            const mbTotal = (total / 1024 / 1024).toFixed(1);
            process.stdout.write(`\r[Download] Progress: ${pct}% (${mbDown} / ${mbTotal} MB)`);
          }
        });
        res.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log('\n[Download] Complete! Saved to:', dest);
          resolve();
        });
      }).on('error', err => {
        fs.unlink(dest, () => {});
        reject(err);
      });
    }
    get(url);
  });
}

function checkBuild(id) {
  try {
    const raw = execSync(`eas build:view ${id} --json`, {
      cwd: MOBILE_DIR,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      maxBuffer: 10 * 1024 * 1024,
      env: { ...process.env, TEMP: 'D:\\Temp', TMP: 'D:\\Temp' }
    });
    const jsonStart = raw.indexOf('{');
    if (jsonStart === -1) return null;
    return JSON.parse(raw.slice(jsonStart));
  } catch (e) {
    return null;
  }
}

async function main() {
  if (!BUILD_ID) {
    console.log('[Monitor] No BUILD_ID passed; querying latest build from EAS...');
    try {
      const rawList = execSync(`eas build:list --platform android --limit 1 --json`, {
        cwd: MOBILE_DIR,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
        maxBuffer: 10 * 1024 * 1024,
        env: { ...process.env, TEMP: 'D:\\Temp', TMP: 'D:\\Temp' }
      });
      const jsonStart = rawList.indexOf('[');
      if (jsonStart !== -1) {
        const list = JSON.parse(rawList.slice(jsonStart));
        if (list.length > 0) {
          BUILD_ID = list[0].id;
          console.log(`[Monitor] Found latest Build ID: ${BUILD_ID}`);
        }
      }
    } catch (e) {}
  }

  if (!BUILD_ID) {
    throw new Error('Unable to determine EAS Build ID to monitor.');
  }

  console.log(`[Monitor] Tracking EAS Build ID: ${BUILD_ID}`);
  let startTime = Date.now();

  while (true) {
    const info = checkBuild(BUILD_ID);
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    
    if (info) {
      console.log(`[${elapsed}s] Build Status: ${info.status}`);
      
      if (info.status === 'FINISHED') {
        const apkUrl = info.artifacts?.buildUrl || info.artifacts?.applicationArchiveUrl;
        console.log(`\n======================================================`);
        console.log(`[SUCCESS] EAS Build Finished!`);
        console.log(`APK URL: ${apkUrl}`);
        console.log(`======================================================\n`);
        
        if (!apkUrl) {
          throw new Error('Build finished but no artifact URL found!');
        }

        // 1. Download APK
        await downloadFile(apkUrl, APK_DEST);

        // 2. Install to connected device via ADB
        console.log('\n[ADB] Installing v1.0.9 APK to connected Android device...');
        const installOutput = execSync(`"${ADB_PATH}" install -r "${APK_DEST}"`, { encoding: 'utf8' });
        console.log('[ADB Install Result]:', installOutput.trim());

        // 3. Clear logcat and launch
        console.log('[ADB] Clearing logcat buffer...');
        execSync(`"${ADB_PATH}" logcat -c`, { stdio: 'inherit' });

        console.log('[ADB] Launching com.darikab71.nuracaremobile/.MainActivity...');
        const launchOutput = execSync(`"${ADB_PATH}" shell am start -n com.darikab71.nuracaremobile/.MainActivity`, { encoding: 'utf8' });
        console.log('[ADB Launch Result]:', launchOutput.trim());

        // 4. Verify runtime stability
        console.log('[ADB] Verifying runtime stability for 5 seconds...');
        await new Promise(r => setTimeout(r, 5000));
        
        const crashLogs = execSync(`"${ADB_PATH}" logcat -d -b crash`, { encoding: 'utf8' });
        if (crashLogs && crashLogs.includes('FATAL EXCEPTION')) {
          console.error('\n[ADB Warning] Fatal crash detected:\n', crashLogs);
        } else {
          console.log('\n======================================================');
          console.log('🎉 [VERIFIED] ZERO CRASHES DETECTED! App is running stably on device!');
          console.log('======================================================\n');
        }
        break;
      } else if (info.status === 'ERRORED' || info.status === 'CANCELED') {
        console.error(`\n[ERROR] EAS Build failed with status: ${info.status}`);
        console.error(`See logs: https://expo.dev/accounts/z01a/projects/nuracare/builds/${BUILD_ID}`);
        process.exit(1);
      }
    } else {
      console.log(`[${elapsed}s] Polling EAS build status...`);
    }

    await new Promise(r => setTimeout(r, 20000));
  }
}

main().catch(err => {
  console.error('[Fatal Error]:', err.message);
  process.exit(1);
});
