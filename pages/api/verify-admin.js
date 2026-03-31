// File location: pages/api/verify-admin.js
import { createRemoteJWKSet, jwtVerify } from 'jose';

const TEAM_DOMAIN = 'https://kapilpandey2068.cloudflareaccess.com';
const AUD_TAG = '0a419b6b4c925924769d0a1322b7c7c4dafe0b45c8770ee9285b017c2f98a282';

export default async function handler(req, res) {
  // Check both cookies and headers for the Cloudflare token
  const token = req.cookies['CF_Authorization'] || req.headers['cf-access-jwt-assertion'];

  // If no token exists, user hasn't logged in via Cloudflare Access
  if (!token) {
    return res.status(401).json({ authorized: false, reason: 'No token found' });
  }

  try {
    // Fetch Cloudflare's public keys to verify the token
    const JWKS = createRemoteJWKSet(
      new URL(`${TEAM_DOMAIN}/cdn-cgi/access/certs`)
    );

    // Verify the token is valid and was issued by your Cloudflare Access app
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: TEAM_DOMAIN,
      audience: AUD_TAG,
    });

    // Token is valid — return the user's email from the token
    return res.status(200).json({
      authorized: true,
      email: payload.email,
    });

  } catch (err) {
    // Token is invalid or expired
    console.error('CF Access JWT verification failed:', err.message);
    return res.status(401).json({ authorized: false, reason: 'Invalid token' });
  }
}