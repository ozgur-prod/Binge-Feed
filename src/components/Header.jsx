import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { PlayIcon, UserIcon, HomeIcon, SearchIcon, CircleHelpIcon, LogOutIcon } from './icons';
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
            <HomeIcon />
          </button>
          <button className={`nav-icon ${active === 'search' ? 'active' : ''}`} title="Search" onClick={() => navigate('/search')}>
            <SearchIcon />
          </button>
          <button className={`nav-icon ${active === 'profile' ? 'active' : ''}`} title="Profile" onClick={() => navigate('/profile')}>
            <UserIcon />
          </button>
          <button className={`nav-icon ${active === 'help' ? 'active' : ''}`} title="Help">
            <CircleHelpIcon />
          </button>
          {isLoggedIn && (
            <button className="nav-icon nav-icon-logout" title="Log out" onClick={() => setShowLogout(true)}>
              <LogOutIcon />
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
