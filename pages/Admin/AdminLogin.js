// File location: pages/Admin/AdminLogin.js
// Custom login page shown BEFORE Cloudflare Access.
// Embeds the Turnstile widget — only redirects to CF Access after bot check passes.

import { useEffect, useRef, useState } from 'react';
import Head from 'next/head';

export default function AdminLogin() {
  const widgetRef        = useRef(null);
  const [status, setStatus] = useState('idle'); // 'idle' | 'verifying' | 'error'
  const [errorMsg, setErrorMsg] = useState('');

  // Load Turnstile script once
  useEffect(() => {
    if (document.getElementById('cf-turnstile-script')) return;
    const script   = document.createElement('script');
    script.id      = 'cf-turnstile-script';
    script.src     = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async   = true;
    script.defer   = true;
    document.head.appendChild(script);
  }, []);

  // Called by Turnstile widget when user completes the challenge
  const handleTurnstileSuccess = async (token) => {
    setStatus('verifying');
    setErrorMsg('');

    try {
      const res  = await fetch('/api/verify-turnstile', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ token }),
      });
      const data = await res.json();

      if (data.success) {
        // Bot check passed → now go to Cloudflare Access for OTP login
        window.location.href =
          `https://${process.env.NEXT_PUBLIC_CF_ACCESS_TEAM_DOMAIN}/cdn-cgi/access/login` +
          `?redirect_url=${encodeURIComponent(window.location.origin + '/Admin')}`;
      } else {
        setStatus('error');
        setErrorMsg('Bot verification failed. Please try again.');
        // Reset the widget so user can retry
        if (window.turnstile) window.turnstile.reset(widgetRef.current);
      }
    } catch {
      setStatus('error');
      setErrorMsg('Something went wrong. Please refresh and try again.');
    }
  };

  // Expose callback globally for Turnstile widget
  useEffect(() => {
    window.__onTurnstileSuccess = handleTurnstileSuccess;
    return () => { delete window.__onTurnstileSuccess; };
  }, []);

  return (
    <>
      <Head>
        <title>Admin Login — Dynabeat</title>
      </Head>

      <div style={styles.page}>
        <div style={styles.card}>

          {/* Logo / brand */}
          <div style={styles.brand}>
            <p style={styles.eyebrow}>Command Studio</p>
            <h1 style={styles.title}>DYNABEAT</h1>
            <p style={styles.subtitle}>Admin Access</p>
          </div>

          <div style={styles.divider} />

          {/* Instructions */}
          <p style={styles.instruction}>
            Complete the security check below, then sign in with your verified email.
            A one-time PIN will be sent to your inbox.
          </p>

          {/* Turnstile widget */}
          <div style={styles.widgetWrap}>
            <div
              ref={widgetRef}
              className="cf-turnstile"
              data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
              data-callback="__onTurnstileSuccess"
              data-theme="dark"
            />
          </div>

          {/* States */}
          {status === 'verifying' && (
            <p style={styles.verifying}>Verifying… redirecting to login</p>
          )}
          {status === 'error' && (
            <p style={styles.errorMsg}>{errorMsg}</p>
          )}

          <p style={styles.note}>
            Access is restricted to authorised administrators only.
          </p>
        </div>
      </div>
    </>
  );
}

// ─── Inline styles ────────────────────────────────────────────────────────────
const styles = {
  page: {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    minHeight:      '100vh',
    background:     '#0a0a0a',
    fontFamily:     'system-ui, sans-serif',
    padding:        '24px',
  },
  card: {
    background:   '#111',
    border:       '1px solid #222',
    borderRadius: '16px',
    padding:      '48px 40px',
    width:        '100%',
    maxWidth:     '420px',
    textAlign:    'center',
  },
  brand: {
    marginBottom: '24px',
  },
  eyebrow: {
    color:         '#f97316',
    fontSize:      '11px',
    fontWeight:    '700',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    margin:        '0 0 8px',
  },
  title: {
    color:         '#fff',
    fontSize:      '32px',
    fontWeight:    '800',
    letterSpacing: '0.1em',
    margin:        '0 0 6px',
  },
  subtitle: {
    color:  '#555',
    fontSize: '13px',
    margin: '0',
  },
  divider: {
    height:     '1px',
    background: '#222',
    margin:     '24px 0',
  },
  instruction: {
    color:      '#888',
    fontSize:   '13px',
    lineHeight: '1.7',
    margin:     '0 0 28px',
  },
  widgetWrap: {
    display:        'flex',
    justifyContent: 'center',
    margin:         '0 0 20px',
  },
  verifying: {
    color:      '#f97316',
    fontSize:   '13px',
    margin:     '0 0 16px',
  },
  errorMsg: {
    color:      '#ef4444',
    fontSize:   '13px',
    margin:     '0 0 16px',
  },
  note: {
    color:    '#444',
    fontSize: '11px',
    margin:   '16px 0 0',
  },
};