const fs = require('fs');
const path = require('path');
const https = require('https');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
const REPO = 'markova-technologies/nuracare';
const RELEASE_TAG = 'v1.0.6';
const APK_FILENAME = 'NuraCare-v1.0.6.apk';

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    console.log(`Downloading APK from: ${url}`);
    const file = fs.createWriteStream(destPath);
    
    function makeRequest(currentUrl) {
      https.get(currentUrl, (response) => {
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          return makeRequest(response.headers.location);
        }
        if (response.statusCode !== 200) {
          return reject(new Error(`Failed to download APK: HTTP ${response.statusCode}`));
        }
        
        let downloadedBytes = 0;
        const totalBytes = parseInt(response.headers['content-length'] || '0', 10);
        
        response.on('data', (chunk) => {
          downloadedBytes += chunk.length;
          if (totalBytes > 0) {
            const pct = Math.round((downloadedBytes / totalBytes) * 100);
            process.stdout.write(`\rDownloading: ${pct}% (${(downloadedBytes / 1024 / 1024).toFixed(1)} / ${(totalBytes / 1024 / 1024).toFixed(1)} MB)`);
          }
        });
        
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log('\nDownload complete! Saved to:', destPath);
          resolve();
        });
      }).on('error', (err) => {
        fs.unlink(destPath, () => {});
        reject(err);
      });
    }

    makeRequest(url);
  });
}

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
      req.write(data);
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

async function publish(apkUrl) {
  const rootDir = path.resolve(__dirname, '..');
  const targetApkPath = path.join(rootDir, APK_FILENAME);
  const webPublicApk = path.join(rootDir, 'apps', 'web', 'public', APK_FILENAME);
  const webLegacyApk = path.join(rootDir, 'apps', 'web', 'public', 'nuracare.apk');

  // 1. Download the new APK if URL provided
  if (apkUrl) {
    await downloadFile(apkUrl, targetApkPath);
  }

  if (!fs.existsSync(targetApkPath)) {
    throw new Error(`APK file not found at ${targetApkPath}`);
  }

  // Copy to web public paths
  console.log('Copying APK to web public directories...');
  fs.copyFileSync(targetApkPath, webPublicApk);
  fs.copyFileSync(targetApkPath, webLegacyApk);
  console.log('Copied to:', webPublicApk);
  console.log('Copied to:', webLegacyApk);

  // 2. Fetch existing release
  console.log(`Fetching release info for tag ${RELEASE_TAG}...`);
  const release = await githubRequest({
    hostname: 'api.github.com',
    path: `/repos/${REPO}/releases/tags/${RELEASE_TAG}`,
    method: 'GET'
  });

  console.log(`Release found: ID ${release.id}, Title: "${release.name}"`);

  // 3. Delete existing asset if present
  const existingAsset = release.assets.find(a => a.name === APK_FILENAME);
  if (existingAsset) {
    console.log(`Deleting previous asset ID ${existingAsset.id} (${existingAsset.name})...`);
    await githubRequest({
      hostname: 'api.github.com',
      path: `/repos/${REPO}/releases/assets/${existingAsset.id}`,
      method: 'DELETE'
    });
    console.log('Previous asset deleted.');
  }

  // 4. Upload updated APK
  await uploadReleaseAsset(release.upload_url, targetApkPath, APK_FILENAME);

  console.log('\n======================================================');
  console.log(`[SUCCESS] NuraCare v1.0.6 APK published to GitHub Release!`);
  console.log(`Download URL: https://github.com/${REPO}/releases/download/${RELEASE_TAG}/${APK_FILENAME}`);
  console.log('======================================================\n');
}

if (require.main === module) {
  const apkUrl = process.argv[2];
  publish(apkUrl).catch(err => {
    console.error('Publish error:', err);
    process.exit(1);
  });
}

module.exports = { publish, downloadFile };
