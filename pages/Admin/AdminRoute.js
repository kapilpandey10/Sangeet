// File location: pages/Admin/AdminRoute.js
// Checks Cloudflare Access JWT via /api/verify-admin before rendering children.
// IMPORTANT: Never reload or redirect on failure — that causes infinite loops.
// Instead, show an error screen so we can read the debug reason.

import { useEffect, useState } from 'react';

const AdminRoute = ({ children }) => {
  const [status, setStatus] = useState('loading'); // 'loading' | 'authorized' | 'denied'
  const [reason, setReason] = useState('');

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const res  = await fetch('/api/verify-admin');
        const data = await res.json();

        if (data.authorized) {
          setStatus('authorized');
        } else {
          // Show the deny reason on screen — do NOT reload or redirect.
          // This tells us exactly why CF auth is failing.
          setReason(data.reason || 'Unknown reason');
          setStatus('denied');
        }
      } catch (err) {
        setReason(`Network error: ${err.message}`);
        setStatus('denied');
      }
    };

    checkAccess();
  }, []);

  // ── Loading screen ──
  if (status === 'loading') {
    return (
      <div style={{
        minHeight:      '100vh',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        background:     '#07080f',
        fontFamily:     "'JetBrains Mono', monospace",
        fontSize:       '13px',
        color:          'rgba(255,255,255,0.35)',
        letterSpacing:  '2px',
        gap:            '12px',
      }}>
        <span style={{
          width:          '16px',
          height:         '16px',
          border:         '2px solid rgba(0,229,200,0.2)',
          borderTopColor: '#00e5c8',
          borderRadius:   '50%',
          animation:      'spin 0.65s linear infinite',
          display:        'inline-block',
        }} />
        INITIALIZING COMMAND CENTER…
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  // ── Denied screen — shows the reason so we can debug ──
  // Once you confirm everything works, you can replace this with a redirect.
  if (status === 'denied') {
    return (
      <div style={{
        minHeight:      '100vh',
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        background:     '#07080f',
        fontFamily:     "'JetBrains Mono', monospace",
        color:          'rgba(255,255,255,0.7)',
        gap:            '16px',
        padding:        '40px',
        textAlign:      'center',
      }}>
        <div style={{ fontSize: '11px', letterSpacing: '3px', color: '#ff4d4d' }}>
          ACCESS DENIED
        </div>
        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', maxWidth: '480px' }}>
          Cloudflare token verification failed. Debug reason:
        </div>
        <div style={{
          background:   'rgba(255,77,77,0.1)',
          border:       '1px solid rgba(255,77,77,0.3)',
          borderRadius: '6px',
          padding:      '12px 24px',
          fontSize:     '12px',
          color:        '#ff4d4d',
          maxWidth:     '480px',
          wordBreak:    'break-all',
        }}>
          {reason}
        </div>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', maxWidth: '480px' }}>
          Screenshot this and share it to diagnose the issue.
        </div>
      </div>
    );
  }

  // ── Authorized ──
  return <>{children}</>;
};

export default AdminRoute;