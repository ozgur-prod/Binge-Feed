import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeftIcon, StarIcon, BellIcon, BarChartIcon, PaletteIcon,
  MessageCircleIcon, RocketIcon, GiftIcon, LockIcon, CheckIcon,
} from '../components/icons';
import './PremiumPage.css';

const BASE_URL = 'http://localhost:8080/api';

const FEATURES = [
  { icon: StarIcon, title: 'Ad-free experience', desc: 'No interruptions, ever.' },
  { icon: BellIcon, title: 'Episode notifications', desc: 'Get notified when new episodes drop.' },
  { icon: BarChartIcon, title: 'Advanced stats', desc: 'Deep analytics on your watching habits.' },
  { icon: PaletteIcon, title: 'Custom profile themes', desc: 'Stand out with exclusive profile styles.' },
  { icon: MessageCircleIcon, title: 'Priority in discussions', desc: 'Your comments are highlighted in Hot Discussions.' },
  { icon: RocketIcon, title: 'Early access', desc: 'Be first to try new BingeFeed features.' },
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
          <ChevronLeftIcon />
          Back to Feed
        </button>
      </header>

      <main className="premium-main">
        <div className="premium-hero">
          <div className="premium-badge">PREMIUM</div>
          <h1 className="premium-title">Upgrade your BingeFeed experience</h1>
          <p className="premium-subtitle">First month free. Then €3.99/month. Cancel anytime.</p>
        </div>

        <div className="premium-grid">
          {FEATURES.map((f) => (
            <div className="premium-feature" key={f.title}>
              <f.icon className="premium-feature-icon" size={24} />
              <div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="premium-cta">
          <div className="premium-price">
            <span className="premium-amount">€3.99</span>
            <span className="premium-period">/month</span>
          </div>
          <p className="premium-free-month"><GiftIcon size={16} /> First month free</p>

          {user.tier === 'premium' ? (
            <div className="premium-already"><CheckIcon size={16} /> You already have Premium</div>
          ) : (
            <>
              <button className="premium-btn" onClick={handleUpgrade} disabled={loading}>
                {loading ? 'Redirecting to payment…' : 'Upgrade to Premium'}
              </button>
              {error && <p className="premium-error">{error}</p>}
              <p className="premium-secure"><LockIcon size={14} /> Secure payment via Stripe</p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
