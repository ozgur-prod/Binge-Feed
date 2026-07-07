import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const BASE_URL = 'http://localhost:8080/api';

export default function PremiumSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!sessionId || !token) { setStatus('error'); return; }

    fetch(`${BASE_URL}/payments/confirm/${sessionId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          const storage = localStorage.getItem('token') ? localStorage : sessionStorage;
          const user = JSON.parse(storage.getItem('user') || '{}');
          storage.setItem('user', JSON.stringify({ ...user, tier: 'premium' }));
          setStatus('success');
        } else {
          setStatus('error');
        }
      })
      .catch(() => setStatus('error'));
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d0d', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Poppins, sans-serif', gap: '1.5rem', padding: '2rem' }}>
      {status === 'loading' && <p style={{ color: '#888' }}>Confirming your payment…</p>}

      {status === 'success' && (
        <>
          <div style={{ fontSize: '4rem' }}>🎉</div>
          <h1 style={{ color: '#d63bdf', fontSize: '2rem', fontWeight: 800 }}>Welcome to Premium!</h1>
          <p style={{ color: '#cbb8d4', textAlign: 'center', maxWidth: '400px' }}>Your free trial has started. Enjoy all premium features for 30 days — then €3.99/month, cancel anytime.</p>
          <button onClick={() => navigate('/feed')} style={{ background: '#d63bdf', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.85rem 2.5rem', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            Go to Feed
          </button>
        </>
      )}

      {status === 'error' && (
        <>
          <div style={{ fontSize: '3rem' }}>⚠️</div>
          <h1 style={{ color: '#ff6b6b', fontSize: '1.5rem' }}>Something went wrong</h1>
          <p style={{ color: '#888', textAlign: 'center' }}>We couldn't confirm your payment. If you were charged, please contact support.</p>
          <button onClick={() => navigate('/premium')} style={{ background: 'transparent', color: '#d63bdf', border: '1.5px solid #d63bdf', borderRadius: '10px', padding: '0.75rem 2rem', fontSize: '1rem', cursor: 'pointer', fontFamily: 'inherit' }}>
            Try again
          </button>
        </>
      )}
    </div>
  );
}
