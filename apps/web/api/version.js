/**
 * NuraCare Dynamic Version & Release API
 * Vercel Edge Function — /api/version
 *
 * Automatically fetches the latest release and APK asset from GitHub Releases
 * so the web platform ALWAYS serves the latest published version without manual edits.
 */
export const config = { runtime: 'edge' };

const REPO = 'markova-technologies/nuracare';
const FALLBACK_VERSION = '1.0.7';
const FALLBACK_DOWNLOAD_URL = `https://github.com/${REPO}/releases/download/v1.0.7/NuraCare-v1.0.7.apk`;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Cache-Control',
};

// In-memory cache for edge instances (60 seconds TTL)
let cachedRelease = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 60 * 1000;

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405, headers: CORS_HEADERS });
  }

  const now = Date.now();
  if (cachedRelease && (now - lastFetchTime) < CACHE_TTL_MS) {
    return new Response(JSON.stringify(cachedRelease), {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60, s-maxage=60, stale-while-revalidate=120',
      },
    });
  }

  try {
    const headers = {
      'User-Agent': 'NuraCare-Web-Version-Checker',
      'Accept': 'application/vnd.github.v3+json',
    };
    if (process.env.GITHUB_TOKEN || process.env.GH_TOKEN) {
      headers['Authorization'] = `token ${process.env.GITHUB_TOKEN || process.env.GH_TOKEN}`;
    }

    const ghRes = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`, {
      headers,
    });

    if (ghRes.ok) {
      const release = await ghRes.json();
      const tagName = release.tag_name || 'v1.0.7';
      const cleanVersion = tagName.replace(/^v/i, '');
      
      // Locate APK asset in release
      const apkAsset = release.assets?.find(a => a.name.toLowerCase().endsWith('.apk'));
      const downloadUrl = apkAsset?.browser_download_url || 
        `https://github.com/${REPO}/releases/download/${tagName}/NuraCare-${tagName}.apk`;
      const apkFileName = apkAsset?.name || `NuraCare-${tagName}.apk`;

      cachedRelease = {
        appVersion: cleanVersion,
        tag: tagName,
        releaseName: release.name || `NuraCare ${tagName}`,
        releaseNotes: release.body || '',
        downloadUrl,
        apkFileName,
        publishedAt: release.published_at || new Date().toISOString(),
        sizeBytes: apkAsset?.size || 0,
        source: 'github-releases-live'
      };
      lastFetchTime = now;

      return new Response(JSON.stringify(cachedRelease), {
        status: 200,
        headers: {
          ...CORS_HEADERS,
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=60, s-maxage=60, stale-while-revalidate=120',
        },
      });
    }
  } catch (err) {
    console.error('[Version API] Failed to fetch latest GitHub release:', err);
  }

  // Graceful fallback if GitHub is unreachable or rate-limited
  const fallbackPayload = {
    appVersion: FALLBACK_VERSION,
    tag: `v${FALLBACK_VERSION}`,
    releaseName: `NuraCare v${FALLBACK_VERSION}`,
    releaseNotes: 'Performance improvements and bug fixes.',
    downloadUrl: FALLBACK_DOWNLOAD_URL,
    apkFileName: `NuraCare-v${FALLBACK_VERSION}.apk`,
    publishedAt: new Date().toISOString(),
    source: 'fallback'
  };

  return new Response(JSON.stringify(fallbackPayload), {
    status: 200,
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=30, stale-while-revalidate=60',
    },
  });
}
