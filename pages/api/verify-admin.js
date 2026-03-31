// File location: pages/api/verify-admin.js
// Temporarily dumps ALL cookies and headers so we can see what CF is sending.
// Remove the debug block once auth is confirmed working.

import { createRemoteJWKSet, jwtVerify } from 'jose';

const TEAM_DOMAIN = 'https://kapilpandey2068.cloudflareaccess.com';
const AUD_TAG     = '0a419b6b4c925924769d0a1322b7c7c4dafe0b45c8770ee9285b017c2f98a282';

export default async function handler(req, res) {
  // ── TEMPORARY DEBUG BLOCK ──────────────────────────────────────────────────
  // Visit /api/verify-admin directly in your browser while logged into CF,
  // then check what cookies and headers are listed in the response.
  // This tells us exactly what CF is (or isn't) forwarding.
  const debugInfo = {
    allCookieKeys:    Object.keys(req.cookies),
    hasCFCookie:      !!req.cookies['CF_Authorization'],
    hasCFHeader:      !!req.headers['cf-access-jwt-assertion'],
    // Show ALL headers so we can spot any CF-related ones
    allHeaders:       Object.keys(req.headers),
    // Show full cookie string (safe — no passwords, just CF tokens)
    rawCookieHeader:  req.headers['cookie'] || '(none)',
  };
  console.log('[verify-admin] debug:', JSON.stringify(debugInfo, null, 2));
  // ── END DEBUG BLOCK ────────────────────────────────────────────────────────

  const token =
    req.cookies['CF_Authorization'] ||
    req.headers['cf-access-jwt-assertion'];

  if (!token) {
    return res.status(401).json({
      authorized:    false,
      reason:        'No CF_Authorization cookie and no cf-access-jwt-assertion header found.',
      // Return full debug info to the browser so you can see it on screen
      debug:         debugInfo,
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
      reason:     `JWT verification failed: ${err.message}`,
      debug:      debugInfo,
    });
  }
}