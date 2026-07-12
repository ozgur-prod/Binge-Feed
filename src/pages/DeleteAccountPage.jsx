import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usersAPI } from '../services/api';
import { AlertTriangleIcon } from '../components/icons';

export default function DeleteAccountPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleDelete() {
    if (!password) return setError('Enter your password to confirm.');
    setLoading(true);
    setError('');
    try {
      await usersAPI.deleteAccount(password);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      navigate('/');
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
    gap: '1.5rem',
    padding: '2rem',
    textAlign: 'center',
  };

  return (
    <div style={pageStyle}>
      <AlertTriangleIcon size={44} color="#ff6b6b" />
      <h1 style={{ fontSize: '2.2rem', fontWeight: 800, maxWidth: '520px', lineHeight: 1.2 }}>
        Delete your account?
      </h1>
      <p style={{ color: '#888', maxWidth: '420px' }}>
        This permanently removes your profile, reviews, comments, likes, follows, favorites,
        lists and watch history. This can't be undone.
      </p>

      <input
        type="password"
        placeholder="Enter your password to confirm"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{
          width: '100%',
          maxWidth: '320px',
          fontFamily: 'inherit',
          fontSize: '0.95rem',
          padding: '0.75rem 1rem',
          borderRadius: '10px',
          border: '1.5px solid #333',
          background: '#151515',
          color: '#fff',
          outline: 'none',
        }}
      />

      {error && <p style={{ color: '#ff6b6b', fontSize: '0.9rem' }}>{error}</p>}

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={handleDelete}
          disabled={loading}
          style={{
            background: '#a3324a',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            padding: '0.85rem 2.2rem',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? 'Deleting…' : 'Delete My Account'}
        </button>
        <button
          onClick={() => navigate('/profile')}
          disabled={loading}
          style={{
            background: '#222',
            color: '#aaa',
            border: '1.5px solid #333',
            borderRadius: '10px',
            padding: '0.85rem 2.2rem',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
