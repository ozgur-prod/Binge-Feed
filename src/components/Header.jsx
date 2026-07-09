import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { PlayIcon, UserIcon } from './icons';
import './Header.css';

function LogoutModal({ onConfirm, onCancel }) {
  return createPortal(
    <div className="logout-overlay" onClick={onCancel}>
      <div className="logout-dialog" onClick={(e) => e.stopPropagation()}>
        <h2 className="logout-title">Log out?</h2>
        <p className="logout-subtitle">Are you sure you want to log out of BingeFeed?</p>
        <div className="logout-actions">
          <button className="logout-cancel" onClick={onCancel}>Cancel</button>
          <button className="logout-confirm" onClick={onConfirm}>Log out</button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function Header({ active }) {
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);

  const isLoggedIn = !!(localStorage.getItem('token') || sessionStorage.getItem('token'));
  const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
  const isPremium = user.tier === 'premium';

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.clear();
    setShowLogout(false);
    navigate('/');
  }

  return (
    <>
      <header className="feed-nav">
        <div className={`feed-logo${isPremium ? ' feed-logo--premium' : ''}`} onClick={() => navigate('/feed')} style={{ cursor: 'pointer' }}>
          Binge<span>Feed</span>
          {isPremium && <span className="logo-premium"> | Premium</span>}
          <PlayIcon className="play" />
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
            <UserIcon />
          </button>
          <button className={`nav-icon ${active === 'help' ? 'active' : ''}`} title="Help">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </button>
          {isLoggedIn && (
            <button className="nav-icon nav-icon-logout" title="Log out" onClick={() => setShowLogout(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          )}
        </nav>

        <div className="header-actions">
          <button className="get-premium-btn" onClick={() => navigate('/premium')}>
            {isPremium ? 'Enjoy Premium' : 'Get Premium'}
          </button>
        </div>
      </header>

      {showLogout && <LogoutModal onConfirm={handleLogout} onCancel={() => setShowLogout(false)} />}
    </>
  );
}

export default Header;
