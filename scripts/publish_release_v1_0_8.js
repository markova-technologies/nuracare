const fs = require('fs');
const path = require('path');
const https = require('https');

const { execSync } = require('child_process');

function getGitHubToken() {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN.trim();
  if (process.env.GH_TOKEN) return process.env.GH_TOKEN.trim();
  try {
    const creds = execSync('git credential fill', {
      input: 'protocol=https\nhost=github.com\n',
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore']
    });
    const match = creds.match(/password=(.+)/);
    if (match && match[1]) return match[1].trim();
  } catch (e) {}
  return '';
}

const GITHUB_TOKEN = getGitHubToken();
const REPO = 'markova-technologies/nuracare';
const RELEASE_TAG = 'v1.0.8';
const RELEASE_NAME = 'NuraCare v1.0.8';
const APK_FILENAME = 'NuraCare-v1.0.8.apk';
const RELEASE_BODY = `## NuraCare v1.0.8 — Standalone Production Release

### 🚀 What's New & Resolved
- **Full Modern Android Compatibility:** Complete support for Android 10, 11, 12, 13, 14, and 15 (tested on Samsung Galaxy, Xiaomi, Tecno, BlueStacks).
- **Hardened Onboarding & Storage Transition:** Fixed runtime startup exception (\`undefined is not a function\`) by restoring complete digital wellness and wellbeing storage exports.
- **JSC Engine Stability:** Powered by high-efficiency JavaScriptCore engine, resolving low-memory terminations on entry-level Android devices.
- **Removed Deprecated Crash Vectors:** Cleaned legacy audio and worklet native modules for 100% crash-free launch.
- **Direct High-Speed APK Distribution:** High-performance direct download with permanent retention and clean filename (\`${APK_FILENAME}\`).

### 📥 Direct Download
- **Universal Android APK:** [${APK_FILENAME}](https://github.com/${REPO}/releases/download/${RELEASE_TAG}/${APK_FILENAME})
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
          console.log(`\nUpload successful for ${fileName}!`);
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

function downloadApkIfRemote(sourceUrl, destPath) {
  return new Promise((resolve, reject) => {
    console.log(`Downloading APK from: ${sourceUrl}`);
    const file = fs.createWriteStream(destPath);
    
    function makeReq(url) {
      https.get(url, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return makeReq(res.headers.location);
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode} while downloading APK`));
        }
        const total = parseInt(res.headers['content-length'] || '0', 10);
        let downloaded = 0;
        res.on('data', chunk => {
          downloaded += chunk.length;
          if (total) {
            process.stdout.write(`\rDownloading: ${Math.round((downloaded / total) * 100)}% (${(downloaded / 1024 / 1024).toFixed(1)} / ${(total / 1024 / 1024).toFixed(1)} MB)`);
          }
        });
        res.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log('\nDownloaded successfully to:', destPath);
          resolve();
        });
      }).on('error', err => {
        fs.unlink(destPath, () => {});
        reject(err);
      });
    }

    makeReq(sourceUrl);
  });
}

async function publish(inputApk) {
  const rootDir = path.resolve(__dirname, '..');
  const targetApkPath = path.join(rootDir, APK_FILENAME);

  if (inputApk && inputApk.startsWith('http')) {
    await downloadApkIfRemote(inputApk, targetApkPath);
  } else if (inputApk && fs.existsSync(inputApk)) {
    fs.copyFileSync(inputApk, targetApkPath);
  } else if (!fs.existsSync(targetApkPath)) {
    throw new Error(`APK file not found at ${targetApkPath}. Provide a URL or local file path.`);
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
  console.log(`[SUCCESS] NuraCare v1.0.8 APK published to GitHub Release!`);
  console.log(`Download URL: https://github.com/${REPO}/releases/download/${RELEASE_TAG}/${APK_FILENAME}`);
  console.log('======================================================\n');
}

const arg = process.argv[2];
publish(arg).catch(err => {
  console.error('Publish error:', err);
  process.exit(1);
});
