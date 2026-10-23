/**
 * NuraCare Dynamic APK Download Redirector
 * Vercel Edge Function â€” /api/download
 *
 * Redirects directly to the latest published APK on GitHub Releases.
 * Guarantees that any direct download link or QR code ALWAYS downloads with the clean filename NuraCare-vX.Y.Z.apk
 */
export const config = { runtime: 'edge' };

const GITHUB_RELEASE_APK_URL = 'https://github.com/markova-technologies/nuracare/releases/download/v1.0.8/NuraCare-v1.0.8.apk';

export default async function handler(req) {
  // Direct redirect to the verified v1.0.8 APK on GitHub Releases
  return Response.redirect(GITHUB_RELEASE_APK_URL, 302);
}

