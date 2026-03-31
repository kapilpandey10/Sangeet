// File location: pages/api/verify-turnstile.js
// Verifies the Turnstile widget token on the server side.
// Called from AdminLogin.js after the user completes the Turnstile challenge.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ success: false, error: 'Missing Turnstile token' });
  }

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret:   process.env.TURNSTILE_SECRET_KEY,
        response: token,
        // Optionally pass the user's IP for extra security:
        // remoteip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      }),
    });

    const data = await response.json();

    if (data.success) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(400).json({
        success: false,
        error:   'Turnstile verification failed',
        codes:   data['error-codes'],
      });
    }

  } catch (err) {
    console.error('[verify-turnstile] Error:', err.message);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}