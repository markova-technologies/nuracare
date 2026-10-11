/**
 * NuraCare Dynamic APK Download Redirector
 * Vercel Edge Function â€” /api/download
 *
 * Redirects directly to the latest published APK on GitHub Releases.
 * Guarantees that any direct download link or QR code ALWAYS downloads with the clean filename NuraCare-vX.Y.Z.apk
 */
export const config = { runtime: 'edge' };

const CANONICAL_APK_URL = 'https://expo.dev/artifacts/eas/GALJ94iUE3yNo0QNMrJgEHtHNSpNRnORrSOufA-kJdM.apk';

export default async function handler(req) {
  // Direct redirect to the verified 124MB Hermes APK on Expo CDN
  return Response.redirect(CANONICAL_APK_URL, 302);
}

