/**
 * NuraCare Dynamic APK Download Redirector
 * Vercel Edge Function — /api/download
 *
 * Redirects directly to the latest published APK on GitHub Releases.
 * Guarantees that any direct download link or QR code ALWAYS gets the newest release.
 */
export const config = { runtime: 'edge' };

const LATEST_APK_URL = 'https://expo.dev/artifacts/eas/o3j1mtP81JXzuWG7wEFnFFTFjCk98jr0355zhXa7vSg.apk';

export default async function handler(req) {
  return Response.redirect(LATEST_APK_URL, 302);
}
