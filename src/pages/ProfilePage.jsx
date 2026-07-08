import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usersAPI, showsAPI, favoritesAPI } from '../services/api';
import Header from '../components/Header';
import EditProfileModal from '../components/EditProfileModal';
import FollowListModal from '../components/FollowListModal';
import FavoritesModal from '../components/FavoritesModal';
import './ProfilePage.css';

const POSTER_BASE = 'https://image.tmdb.org/t/p/w154';
const FAVORITES_PREVIEW = 5;

// Mock data until diary and lists get their own models
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
  const [followModal, setFollowModal] = useState(null);
  const [showAllFavorites, setShowAllFavorites] = useState(false);
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
      .then((data) => {
        setUser(data.user);
        favoritesAPI
          .list(data.user.id)
          .then((f) => setFavorites(f.favorites))
          .catch(console.error);
      })
      .catch((err) => {
        if (err.message.toLowerCase().includes('token') || err.message.toLowerCase().includes('auth')) {
          navigate('/login');
        } else {
          setError(err.message);
        }
      });

    Promise.all(
      LISTS.map(async (list) => {
        const results = await Promise.all(list.titles.map((title) => showsAPI.search(title)));
        return { name: list.name, shows: results.map((r) => r.results[0]).filter(Boolean) };
      })
    )
      .then(setLists)
      .catch(console.error);
  }, [navigate]);

  async function removeFavorite(showId) {
    await favoritesAPI.remove(showId);
    setFavorites((prev) => prev.filter((f) => f.showId !== showId));
  }

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
              {user && (
                <p className="profile-follow-counts">
                  <button className="follow-count-btn" onClick={() => setFollowModal('following')}>
                    <strong>{user.followingCount ?? 0}</strong> Following
                  </button>
                  <span className="follow-dot">·</span>
                  <button className="follow-count-btn" onClick={() => setFollowModal('followers')}>
                    <strong>{user.followersCount ?? 0}</strong> Followers
                  </button>
                </p>
              )}
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
                <p className="favorites-empty">No favorites yet. Add shows from their page.</p>
              ) : (
                <>
                  {(favorites.length > FAVORITES_PREVIEW
                    ? favorites.slice(0, FAVORITES_PREVIEW - 1)
                    : favorites
                  ).map((fav) => (
                    <img
                      key={fav.showId}
                      className="favorite-poster clickable"
                      src={fav.posterUrl}
                      alt={fav.showName}
                      title={fav.showName}
                      onClick={() => navigate(`/show/${fav.showId}`)}
                    />
                  ))}
                  {favorites.length > FAVORITES_PREVIEW && (
                    <button className="favorites-more" onClick={() => setShowAllFavorites(true)}>
                      +{favorites.length - (FAVORITES_PREVIEW - 1)} more
                    </button>
                  )}
                </>
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

          {user?.tier === 'premium' && (
            <button
              className="cancel-premium-btn"
              onClick={() => navigate('/premium/cancel')}
            >
              Cancel Premium
            </button>
          )}
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

      {followModal && user && (
        <FollowListModal userId={user.id} type={followModal} onClose={() => setFollowModal(null)} />
      )}

      {showAllFavorites && (
        <FavoritesModal
          favorites={favorites}
          onRemove={removeFavorite}
          onClose={() => setShowAllFavorites(false)}
        />
      )}
    </div>
  );
}

export default ProfilePage;
