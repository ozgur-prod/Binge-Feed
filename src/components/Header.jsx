import { useNavigate } from 'react-router-dom';
import './Header.css';

function Header({ active }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
  const isPremium = user.tier === 'premium';

  return (
    <header className="feed-nav">
      <div className={`feed-logo${isPremium ? ' feed-logo--premium' : ''}`} onClick={() => navigate('/feed')} style={{ cursor: 'pointer' }}>
        Binge<span>Feed</span>
        {isPremium && <span className="logo-premium"> | Premium</span>}
        <svg className="play" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
      </div>

      <nav className="feed-nav-icons">
        <button className={`nav-icon ${active === 'home' ? 'active' : ''}`} title="Home" onClick={() => navigate('/feed')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </button>
        <button className={`nav-icon ${active === 'search' ? 'active' : ''}`} title="Search" onClick={() => navigate('/search')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
        <button className={`nav-icon ${active === 'profile' ? 'active' : ''}`} title="Profile" onClick={() => navigate('/profile')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </button>
        <button className={`nav-icon ${active === 'help' ? 'active' : ''}`} title="Help">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </button>
      </nav>

      <div className="header-actions">
        {isPremium ? (
          <button className="get-premium-btn" onClick={() => navigate('/premium')}>Enjoy Premium</button>
        ) : (
          <button className="get-premium-btn" onClick={() => navigate('/premium')}>Get Premium</button>
        )}
        <button className="logout-btn" onClick={() => { localStorage.clear(); sessionStorage.clear(); navigate('/'); }}>Log Out</button>
      </div>
    </header>
  );
}

export default Header;