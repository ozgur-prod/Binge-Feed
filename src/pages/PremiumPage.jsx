import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PremiumPage.css';

const BASE_URL = 'http://localhost:8080/api';

const FEATURES = [
  { icon: '⭐', title: 'Ad-free experience', desc: 'No interruptions, ever.' },
  { icon: '🔔', title: 'Episode notifications', desc: 'Get notified when new episodes drop.' },
  { icon: '📊', title: 'Advanced stats', desc: 'Deep analytics on your watching habits.' },
  { icon: '🎨', title: 'Custom profile themes', desc: 'Stand out with exclusive profile styles.' },
  { icon: '💬', title: 'Priority in discussions', desc: 'Your comments are highlighted in Hot Discussions.' },
  { icon: '🚀', title: 'Early access', desc: 'Be first to try new BingeFeed features.' },
];

export default function PremiumPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');

  async function handleUpgrade() {
    if (!token) return navigate('/login');
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/payments/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Something went wrong.');
      window.location.href = data.url;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="premium-page">
      <header className="premium-nav">
        <button className="premium-back" onClick={() => navigate('/feed')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to Feed
        </button>
      </header>

      <main className="premium-main">
        <div className="premium-hero">
          <div className="premium-badge">PREMIUM</div>
          <h1 className="premium-title">Upgrade your BingeFeed experience</h1>
          <p className="premium-subtitle">One-time payment. Lifetime access. No subscriptions.</p>
        </div>

        <div className="premium-grid">
          {FEATURES.map((f) => (
            <div className="premium-feature" key={f.title}>
              <span className="premium-feature-icon">{f.icon}</span>
              <div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="premium-cta">
          <div className="premium-price">
            <span className="premium-amount">€4.99</span>
            <span className="premium-period">one-time</span>
          </div>

          {user.tier === 'premium' ? (
            <div className="premium-already">You already have Premium ✓</div>
          ) : (
            <>
              <button className="premium-btn" onClick={handleUpgrade} disabled={loading}>
                {loading ? 'Redirecting to payment…' : 'Upgrade to Premium'}
              </button>
              {error && <p className="premium-error">{error}</p>}
              <p className="premium-secure">🔒 Secure payment via Stripe</p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
