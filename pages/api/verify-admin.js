// File location: pages/api/verify-admin.js
// Validates the Cloudflare Access JWT from the CF_Authorization cookie.
// Called by AdminDashboard.jsx on mount to get the admin's email.

import jwt from 'jsonwebtoken';
import jwkToPem from 'jwk-to-pem';

const TEAM_DOMAIN = process.env.CF_ACCESS_TEAM_DOMAIN;
const CERTS_URL   = `https://${TEAM_DOMAIN}/cdn-cgi/access/certs`;

// Cache public keys so we don't fetch on every request
let cachedKeys = null;
let cacheTime  = 0;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

async function getPublicKeys() {
  if (cachedKeys && Date.now() - cacheTime < CACHE_TTL) return cachedKeys;

  const res  = await fetch(CERTS_URL);
  const data = await res.json();

  cachedKeys = {};
  for (const key of data.keys) {
    cachedKeys[key.kid] = key;
  }
  cacheTime = Date.now();
  return cachedKeys;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ authorized: false, error: 'Method not allowed' });
  }

  const token = req.cookies['CF_Authorization'];

  // ── TEMPORARY DEBUG — remove after confirming it works ────────────────────
  if (req.query.debug === '1') {
    if (!token) {
      return res.status(200).json({ hasToken: false, message: 'No CF_Authorization cookie found' });
    }
    const decoded = jwt.decode(token, { complete: true });
    const audInToken = decoded?.payload?.aud;
    const audEnv     = process.env.CF_ACCESS_AUD;
    // AUD from CF is always an array — check with includes()
    const audMatch   = Array.isArray(audInToken)
      ? audInToken.includes(audEnv)
      : audInToken === audEnv;

    return res.status(200).json({
      hasToken:      true,
      emailInToken:  decoded?.payload?.email,
      audInToken,
      audInEnv:      audEnv,
      teamDomain:    TEAM_DOMAIN,
      allowedEmails: process.env.CF_ALLOWED_EMAILS,
      match: {
        aud:   audMatch,
        email: (process.env.CF_ALLOWED_EMAILS || '')
                 .split(',').map(e => e.trim())
                 .includes(decoded?.payload?.email),
      },
    });
  }
  // ── END DEBUG ─────────────────────────────────────────────────────────────

  if (!token) {
    return res.status(401).json({ authorized: false, error: 'No token found' });
  }

  try {
    const decoded = jwt.decode(token, { complete: true });
    if (!decoded) throw new Error('Invalid token format');

    const { kid } = decoded.header;
    const keys    = await getPublicKeys();
    const jwk     = keys[kid];
    if (!jwk) throw new Error('Public key not found for kid: ' + kid);

    const publicKey = jwkToPem(jwk);

    // ── KEY FIX: pass AUD as array so jwt.verify handles it correctly ────────
    const payload = jwt.verify(token, publicKey, {
      algorithms: ['RS256'],
      audience:   [process.env.CF_ACCESS_AUD],   // ← wrap in array to match CF token
      issuer:     `https://${TEAM_DOMAIN}`,
    });

    // Check allowed emails (leave CF_ALLOWED_EMAILS empty to allow ALL CF-verified users)
    const ALLOWED_EMAILS = (process.env.CF_ALLOWED_EMAILS || '')
      .split(',')
      .map(e => e.trim())
      .filter(Boolean);

    if (ALLOWED_EMAILS.length > 0 && !ALLOWED_EMAILS.includes(payload.email)) {
      return res.status(403).json({ authorized: false, error: 'Email not permitted' });
    }

    return res.status(200).json({
      authorized: true,
      email:      payload.email,
    });

  } catch (err) {
    console.error('[verify-admin] JWT error:', err.message);
    return res.status(401).json({ authorized: false, error: err.message });
  }
}