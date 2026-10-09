const fs = require('fs');
const path = require('path');
const https = require('https');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || process.argv[2];
if (!GITHUB_TOKEN) {
  console.error('ERROR: GITHUB_TOKEN environment variable is required.');
  process.exit(1);
}

const REPO = 'markova-technologies/nuracare';
const RELEASE_TAG = 'v1.0.7';
const RELEASE_NAME = 'NuraCare v1.0.7';
const APK_FILENAME = 'NuraCare-v1.0.7.apk';
const RELEASE_BODY = `## NuraCare v1.0.7

### 🚀 What's New & Fixed
- **Startup Crash Resolution:** Fixed native background audio exception on Android 14 devices (Samsung Galaxy A05s and similar).
- **Fault-Tolerant Error Boundary:** Added top-level application recovery boundary so runtime UI exceptions do not crash the app.
- **Onboarding & Auth Flow:** Ensured clean first-launch navigation to onboarding and login screens.
- **Defensive Storage Engine:** Hardened local MMKV storage reads and writes.
- **Standalone Android APK:** Fully standalone preview build (Build 8) — no Expo Go required.

### 📥 Direct Download
- Download: [${APK_FILENAME}](https://github.com/${REPO}/releases/download/${RELEASE_TAG}/${APK_FILENAME})
`;

function githubRequest(options, data) {
  return new Promise((resolve, reject) => {
    const defaultHeaders = {
      'User-Agent': 'NuraCare-Publisher',
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json'
    };

    const reqOptions = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...(options.headers || {})
      }
    };

    const req = https.request(reqOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(body ? JSON.parse(body) : null);
          } catch {
            resolve(body);
          }
        } else {
          reject(new Error(`GitHub API Error: ${res.statusCode} - ${body}`));
        }
      });
    });

    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

function uploadReleaseAsset(uploadUrl, filePath, fileName) {
  return new Promise((resolve, reject) => {
    const stats = fs.statSync(filePath);
    const cleanUploadUrl = uploadUrl.split('{')[0];
    const urlObj = new URL(`${cleanUploadUrl}?name=${encodeURIComponent(fileName)}`);

    console.log(`Uploading ${fileName} (${(stats.size / 1024 / 1024).toFixed(1)} MB) to GitHub Releases...`);

    const req = https.request({
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'User-Agent': 'NuraCare-Publisher',
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/vnd.android.package-archive',
        'Content-Length': stats.size
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 201) {
          console.log(`Upload successful for ${fileName}!`);
          resolve(JSON.parse(body));
        } else {
          reject(new Error(`Asset upload failed: HTTP ${res.statusCode} - ${body}`));
        }
      });
    });

    req.on('error', reject);

    const stream = fs.createReadStream(filePath);
    let uploaded = 0;
    stream.on('data', chunk => {
      uploaded += chunk.length;
      process.stdout.write(`\rUploading: ${Math.round((uploaded / stats.size) * 100)}% (${(uploaded / 1024 / 1024).toFixed(1)} / ${(stats.size / 1024 / 1024).toFixed(1)} MB)`);
    });
    stream.pipe(req);
  });
}

async function publish() {
  const rootDir = path.resolve(__dirname, '..');
  const targetApkPath = path.join(rootDir, APK_FILENAME);

  if (!fs.existsSync(targetApkPath)) {
    throw new Error(`APK file not found at ${targetApkPath}`);
  }

  // 1. Check if release already exists or create new release
  console.log(`Checking if release ${RELEASE_TAG} exists...`);
  let release;
  try {
    release = await githubRequest({
      hostname: 'api.github.com',
      path: `/repos/${REPO}/releases/tags/${RELEASE_TAG}`,
      method: 'GET'
    });
    console.log(`Existing release found: ID ${release.id}`);
  } catch (err) {
    console.log(`Creating new release for ${RELEASE_TAG}...`);
    release = await githubRequest({
      hostname: 'api.github.com',
      path: `/repos/${REPO}/releases`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      tag_name: RELEASE_TAG,
      target_commitish: 'main',
      name: RELEASE_NAME,
      body: RELEASE_BODY,
      draft: false,
      prerelease: false
    });
    console.log(`Created new release: ID ${release.id}`);
  }

  // 2. Delete existing asset if present with same name
  const existingAsset = release.assets && release.assets.find(a => a.name === APK_FILENAME);
  if (existingAsset) {
    console.log(`Deleting previous asset ID ${existingAsset.id}...`);
    await githubRequest({
      hostname: 'api.github.com',
      path: `/repos/${REPO}/releases/assets/${existingAsset.id}`,
      method: 'DELETE'
    });
    console.log('Previous asset deleted.');
  }

  // 3. Upload APK asset
  await uploadReleaseAsset(release.upload_url, targetApkPath, APK_FILENAME);

  console.log('\n======================================================');
  console.log(`[SUCCESS] NuraCare v1.0.7 APK published to GitHub Release!`);
  console.log(`Download URL: https://github.com/${REPO}/releases/download/${RELEASE_TAG}/${APK_FILENAME}`);
  console.log('======================================================\n');
}

publish().catch(err => {
  console.error('Publish error:', err);
  process.exit(1);
});
