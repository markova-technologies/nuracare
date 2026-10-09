/**
 * NuraCare Dynamic APK Download Redirector
 * Vercel Edge Function — /api/download
 *
 * Redirects directly to the latest published APK on GitHub Releases.
 * Guarantees that any direct download link or QR code ALWAYS gets the newest release.
 */
export const config = { runtime: 'edge' };

const REPO = 'markova-technologies/nuracare';
const FALLBACK_APK_URL = `https://expo.dev/artifacts/eas/o3j1mtP81JXzuWG7wEFnFFTFjCk98jr0355zhXa7vSg.apk`;

export default async function handler(req) {
  try {
    const headers = {
      'User-Agent': 'NuraCare-Web-Downloader',
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
      const apkAsset = release.assets?.find(a => a.name.toLowerCase().endsWith('.apk'));
      if (apkAsset?.browser_download_url) {
        return Response.redirect(apkAsset.browser_download_url, 302);
      }
      if (release.tag_name) {
        return Response.redirect(
          `https://github.com/${REPO}/releases/download/${release.tag_name}/NuraCare-${release.tag_name}.apk`,
          302
        );
      }
    }
  } catch (err) {
    console.error('[Download API] Error resolving latest release redirect:', err);
  }

  // Fallback to latest known release
  return Response.redirect(FALLBACK_APK_URL, 302);
}
