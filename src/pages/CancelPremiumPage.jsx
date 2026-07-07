import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BASE_URL = 'http://localhost:8080/api';

export default function CancelPremiumPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [error, setError] = useState('');

  async function handleCancel() {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) return navigate('/login');

    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${BASE_URL}/payments/cancel`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Something went wrong.');

      const storage = localStorage.getItem('token') ? localStorage : sessionStorage;
      const user = JSON.parse(storage.getItem('user') || '{}');
      storage.setItem('user', JSON.stringify({ ...user, tier: 'free' }));

      setCancelled(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const pageStyle = {
    minHeight: '100vh',
    background: '#0d0d0d',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Poppins, sans-serif',
    gap: '2rem',
    padding: '2rem',
    textAlign: 'center',
  };

  if (cancelled) {
    return (
      <div style={pageStyle}>
        <div style={{ fontSize: '3.5rem' }}>👋</div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff' }}>
          Premium membership cancelled.
        </h1>
        <p style={{ color: '#888', maxWidth: '420px' }}>
          We're sorry to see you go. You can always re-subscribe whenever you're ready.
        </p>
        <button
          onClick={() => navigate('/feed')}
          style={{
            background: '#222',
            color: '#aaa',
            border: '1.5px solid #333',
            borderRadius: '10px',
            padding: '0.85rem 2.5rem',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Back to Feed
        </button>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <h1 style={{ fontSize: '2.4rem', fontWeight: 800, maxWidth: '520px', lineHeight: 1.2 }}>
        Are you really sure about this?
      </h1>
      <p style={{ color: '#888', maxWidth: '400px' }}>
        You'll lose access to all Premium features immediately.
      </p>
      {error && <p style={{ color: '#ff6b6b', fontSize: '0.9rem' }}>{error}</p>}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={handleCancel}
          disabled={loading}
          style={{
            background: 'transparent',
            color: '#ff6b6b',
            border: '1.5px solid #ff6b6b',
            borderRadius: '10px',
            padding: '0.85rem 2.2rem',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? 'Cancelling…' : 'Cancel Premium'}
        </button>
        <button
          onClick={() => navigate('/feed')}
          disabled={loading}
          style={{
            background: '#b8860b',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            padding: '0.85rem 2.2rem',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Keep Premium
        </button>
      </div>
    </div>
  );
}
