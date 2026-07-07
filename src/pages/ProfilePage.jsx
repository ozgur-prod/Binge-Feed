import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usersAPI, showsAPI } from '../services/api';
import Header from '../components/Header';
import EditProfileModal from '../components/EditProfileModal';
import './ProfilePage.css';

const POSTER_BASE = 'https://image.tmdb.org/t/p/w154';

// Mock data until favorites, diary and lists get their own models
const FAVORITE_TITLES = ['Invincible', 'Euphoria', 'A Knight of the Seven Kingdoms', 'Severance'];

const DIARY = [
  {
    month: 'May',
    entries: [
      { day: 16, text: 'Euphoria S3 E1' },
      { day: 9, text: 'How I Met Your Mother S3 E24' },
    ],
  },
  {
    month: 'April',
    entries: [
      { day: 30, text: 'Game of Thrones S1 E1' },
      { day: 29, text: 'How I Met Your Mother S3 E23' },
    ],
  },
];

const LISTS = [
  { name: 'makes you feel alive', titles: ['The Boys', 'Andor', 'Breaking Bad'] },
  { name: 'could watch these forever and ever', titles: ['The Sopranos', 'Modern Family', 'Friends'] },
];

function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [lists, setLists] = useState([]);
  const [showEdit, setShowEdit] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Page requires login. The mock sections still get real posters via TMDB search.
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    usersAPI
      .getMe()
      .then((data) => setUser(data.user))
      .catch((err) => {
        if (err.message.toLowerCase().includes('token') || err.message.toLowerCase().includes('auth')) {
          navigate('/login');
        } else {
          setError(err.message);
        }
      });

    Promise.all(FAVORITE_TITLES.map((title) => showsAPI.search(title)))
      .then((results) => setFavorites(results.map((r) => r.results[0]).filter(Boolean)))
      .catch(console.error);

    Promise.all(
      LISTS.map(async (list) => {
        const results = await Promise.all(list.titles.map((title) => showsAPI.search(title)));
        return { name: list.name, shows: results.map((r) => r.results[0]).filter(Boolean) };
      })
    )
      .then(setLists)
      .catch(console.error);
  }, [navigate]);

  function handleSaved(updatedUser) {
    setUser(updatedUser);
    const storage = localStorage.getItem('user') ? localStorage : sessionStorage;
    storage.setItem('user', JSON.stringify(updatedUser));
  }

  return (
    <div className="profile-page">
      <Header active="profile" />

      <main className="profile-main">
        <div className="profile-content">
          <section className="profile-header">
            {user?.avatarUrl ? (
              <img className="profile-avatar" src={user.avatarUrl} alt={user.handle} />
            ) : (
              <span className="profile-avatar profile-avatar-placeholder">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
            )}
            <div className="profile-identity">
              <h1 className="profile-handle">{user ? user.handle : '…'}</h1>
              {user?.displayName && <p className="profile-display-name">{user.displayName}</p>}
              {user?.bio && <p className="profile-bio">{user.bio}</p>}
            </div>
            <button className="pill-btn" onClick={() => setShowEdit(true)} disabled={!user}>
              Edit Profile
            </button>
          </section>

          {error && <p className="profile-error">{error}</p>}

          <section className="profile-section">
            <div className="section-head">
              <h2>Favorite Series</h2>
              <button className="pill-btn pill-btn-small">Edit</button>
            </div>
            <div className="favorites-row">
              {favorites.length === 0 ? (
                <p className="profile-loading">Loading favorites…</p>
              ) : (
                favorites.map((show) => (
                  <img
                    key={show.id}
                    className="favorite-poster clickable"
                    src={`${POSTER_BASE}${show.poster_path}`}
                    alt={show.name}
                    title={show.name}
                    onClick={() => navigate(`/show/${show.id}`)}
                  />
                ))
              )}
            </div>
          </section>

          <section className="profile-section">
            <div className="section-head">
              <h2>Diary</h2>
              <button className="pill-btn pill-btn-small">Log</button>
            </div>
            <div className="diary">
              {DIARY.map((group) => (
                <div className="diary-month" key={group.month}>
                  <div className="diary-month-label">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <span>{group.month}</span>
                  </div>
                  <ul className="diary-entries">
                    {group.entries.map((entry) => (
                      <li key={`${group.month}-${entry.day}`}>
                        <span className="diary-day">{entry.day}</span>
                        <span className="diary-text">{entry.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="profile-sidebar">
          <div className="ad-box">Your ad could be here.</div>

          <div className="lists-section">
            <div className="section-head">
              <h2>Lists</h2>
              <button className="pill-btn pill-btn-small">Create</button>
            </div>
            {lists.length === 0 ? (
              <p className="profile-loading">Loading lists…</p>
            ) : (
              lists.map((list) => (
                <div className="list-block" key={list.name}>
                  <p className="list-name">{list.name}</p>
                  <div className="list-thumbs">
                    {list.shows.map((show) => (
                      <img
                        key={show.id}
                        className="clickable"
                        src={`${POSTER_BASE}${show.poster_path}`}
                        alt={show.name}
                        title={show.name}
                        onClick={() => navigate(`/show/${show.id}`)}
                      />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>
      </main>

      {showEdit && user && (
        <EditProfileModal user={user} onClose={() => setShowEdit(false)} onSaved={handleSaved} />
      )}
    </div>
  );
}

export default ProfilePage;
