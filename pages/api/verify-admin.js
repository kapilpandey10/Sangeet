// File location: pages/api/verify-admin.js
// Verifies the Cloudflare Access JWT from either the cookie or request header.
// Returns detailed reason strings to help diagnose auth failures.

import { createRemoteJWKSet, jwtVerify } from 'jose';

const TEAM_DOMAIN = 'https://kapilpandey2068.cloudflareaccess.com';
const AUD_TAG     = '0a419b6b4c925924769d0a1322b7c7c4dafe0b45c8770ee9285b017c2f98a282';

export default async function handler(req, res) {
  // CF Access sends the JWT as either a cookie or a request header.
  // Check both — whichever arrives first wins.
  const token =
    req.cookies['CF_Authorization'] ||
    req.headers['cf-access-jwt-assertion'];

  // ── Debug: log what we actually received ──
  // Remove this block once auth is confirmed working.
  console.log('[verify-admin] cookies:', Object.keys(req.cookies));
  console.log('[verify-admin] cf header present:', !!req.headers['cf-access-jwt-assertion']);
  console.log('[verify-admin] token found:', !!token);

  if (!token) {
    return res.status(401).json({
      authorized: false,
      reason: 'No CF_Authorization cookie and no cf-access-jwt-assertion header found. ' +
              'Cloudflare Access may not be protecting this route, or the cookie is not ' +
              'being forwarded to the API route.',
    });
  }

  try {
    const JWKS = createRemoteJWKSet(
      new URL(`${TEAM_DOMAIN}/cdn-cgi/access/certs`)
    );

    const { payload } = await jwtVerify(token, JWKS, {
      issuer:   TEAM_DOMAIN,
      audience: AUD_TAG,
    });

    return res.status(200).json({
      authorized: true,
      email:      payload.email,
    });

  } catch (err) {
    console.error('[verify-admin] JWT verification failed:', err.message);
    return res.status(401).json({
      authorized: false,
      reason: `JWT verification failed: ${err.message}`,
    });
  }
}