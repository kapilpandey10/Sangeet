// File location: pages/Admin/AdminRoute.js

import { useEffect, useState } from 'react';

const AdminRoute = ({ children }) => {
  const [status, setStatus] = useState('loading');
  const [debugData, setDebugData] = useState(null);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const res  = await fetch('/api/verify-admin');
        const data = await res.json();

        if (data.authorized) {
          setStatus('authorized');
        } else {
          setDebugData(data);
          setStatus('denied');
        }
      } catch (err) {
        setDebugData({ reason: `Network error: ${err.message}` });
        setStatus('denied');
      }
    };
    checkAccess();
  }, []);

  if (status === 'loading') {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: '#07080f',
        fontFamily: "'JetBrains Mono', monospace", fontSize: '13px',
        color: 'rgba(255,255,255,0.35)', letterSpacing: '2px', gap: '12px',
      }}>
        <span style={{
          width: '16px', height: '16px',
          border: '2px solid rgba(0,229,200,0.2)', borderTopColor: '#00e5c8',
          borderRadius: '50%', animation: 'spin 0.65s linear infinite', display: 'inline-block',
        }} />
        INITIALIZING COMMAND CENTER…
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  if (status === 'denied') {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', background: '#07080f',
        fontFamily: "'JetBrains Mono', monospace", color: 'rgba(255,255,255,0.7)',
        gap: '12px', padding: '40px',
      }}>
        <div style={{ fontSize: '11px', letterSpacing: '3px', color: '#ff4d4d' }}>ACCESS DENIED</div>
        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
          {debugData?.reason}
        </div>

        {/* ── Full debug dump — screenshot this ── */}
        <div style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px', padding: '16px 20px', maxWidth: '640px', width: '100%',
          fontSize: '11px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.8',
        }}>
          <div style={{ color: '#00e5c8', marginBottom: '8px', letterSpacing: '1px' }}>
            DEBUG — screenshot and share this
          </div>

          <div><span style={{ color: 'rgba(255,255,255,0.3)' }}>CF cookie present: </span>
            <span style={{ color: debugData?.debug?.hasCFCookie ? '#4dff91' : '#ff4d4d' }}>
              {String(debugData?.debug?.hasCFCookie)}
            </span>
          </div>

          <div><span style={{ color: 'rgba(255,255,255,0.3)' }}>CF header present: </span>
            <span style={{ color: debugData?.debug?.hasCFHeader ? '#4dff91' : '#ff4d4d' }}>
              {String(debugData?.debug?.hasCFHeader)}
            </span>
          </div>

          <div style={{ marginTop: '8px' }}>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>All cookies: </span>
            <span>{debugData?.debug?.allCookieKeys?.join(', ') || '(none)'}</span>
          </div>

          <div style={{ marginTop: '4px' }}>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>Raw cookie header: </span>
            <span style={{ wordBreak: 'break-all' }}>{debugData?.debug?.rawCookieHeader}</span>
          </div>

          <div style={{ marginTop: '8px' }}>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>CF-related headers: </span>
            <span>
              {debugData?.debug?.allHeaders
                ?.filter(h => h.toLowerCase().includes('cf') || h.toLowerCase().includes('cloudflare'))
                ?.join(', ') || '(none — CF is not proxying this request)'}
            </span>
          </div>

          <div style={{ marginTop: '8px' }}>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>All headers: </span>
            <span style={{ wordBreak: 'break-all' }}>
              {debugData?.debug?.allHeaders?.join(', ')}
            </span>
          </div>
        </div>

        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', marginTop: '8px' }}>
          Also visit /api/verify-admin directly in your browser and paste the JSON here.
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminRoute;