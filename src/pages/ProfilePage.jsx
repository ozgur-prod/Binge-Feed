import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usersAPI, favoritesAPI, listsAPI } from '../services/api';
import Header from '../components/Header';
import EditProfileModal from '../components/EditProfileModal';
import FollowListModal from '../components/FollowListModal';
import FavoritesModal from '../components/FavoritesModal';
import ListsModal from '../components/ListsModal';
import './ProfilePage.css';

const LIST_THUMBS_PREVIEW = 3;
const LISTS_PREVIEW = 5;

// Mock data until the diary gets its own model
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

function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [lists, setLists] = useState([]);
  const [showEdit, setShowEdit] = useState(false);
  const [followModal, setFollowModal] = useState(null);
  const [showAllFavorites, setShowAllFavorites] = useState(false);
  const [showLists, setShowLists] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
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
        listsAPI
          .list(data.user.id)
          .then((l) => setLists(l.lists))
          .catch(console.error);
      })
      .catch((err) => {
        if (err.message.toLowerCase().includes('token') || err.message.toLowerCase().includes('auth')) {
          navigate('/login');
        } else {
          setError(err.message);
        }
      });
  }, [navigate]);

  async function removeFavorite(showId) {
    await favoritesAPI.remove(showId);
    setFavorites((prev) => prev.filter((f) => f.showId !== showId));
  }

  async function addFavorite(show) {
    await favoritesAPI.add({ showId: show.id });
    setFavorites((prev) => [
      {
        showId: show.id,
        showName: show.name,
        posterUrl: show.poster_path ? `https://image.tmdb.org/t/p/w300${show.poster_path}` : null,
      },
      ...prev,
    ]);
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
              <button className="pill-btn pill-btn-small" onClick={() => setShowAllFavorites(true)}>
                {favorites.length === 0 ? 'Add' : 'Edit'}
              </button>
            </div>
            {favorites.length === 0 ? (
              <button
                className="favorites-cta favorites-cta-empty"
                onClick={() => setShowAllFavorites(true)}
              >
                + Add shows to your favorites
              </button>
            ) : (
              <div className="favorites-row">
                {favorites.map((fav) => (
                  <div className="favorite-tile" key={fav.showId}>
                    <img
                      className="favorite-poster clickable"
                      src={fav.posterUrl}
                      alt={fav.showName}
                      title={fav.showName}
                      onClick={() => navigate(`/show/${fav.showId}`)}
                    />
                    <span className="favorite-tile-name">{fav.showName}</span>
                  </div>
                ))}
              </div>
            )}
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
              <button className="pill-btn pill-btn-small" onClick={() => setShowLists(true)} disabled={!user}>
                {lists.length === 0 ? 'Create' : 'Edit'}
              </button>
            </div>
            {lists.length === 0 ? (
              <button className="lists-empty" onClick={() => setShowLists(true)} disabled={!user}>
                + Create your first list
              </button>
            ) : (
              <div className="lists-grid">
                {lists.slice(0, LISTS_PREVIEW).map((list) => (
                  <button className="list-card" key={list.id} onClick={() => setShowLists(true)}>
                    <div className="list-card-posters">
                      {list.shows.length === 0 ? (
                        <span className="list-card-empty">Empty</span>
                      ) : (
                        list.shows.slice(0, LIST_THUMBS_PREVIEW).map((show) => (
                          <img
                            key={show.showId}
                            src={show.posterUrl}
                            alt={show.showName}
                            title={show.showName}
                          />
                        ))
                      )}
                    </div>
                    <p className="list-card-name">{list.title}</p>
                    <p className="list-card-count">
                      {list.showCount} {list.showCount === 1 ? 'show' : 'shows'}
                    </p>
                  </button>
                ))}
                {lists.length > LISTS_PREVIEW && (
                  <button className="list-card-more" onClick={() => setShowLists(true)}>
                    <span className="list-card-more-count">+{lists.length - LISTS_PREVIEW}</span>
                    <span className="list-card-more-title">View all</span>
                  </button>
                )}
              </div>
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
          onAdd={addFavorite}
          onRemove={removeFavorite}
          onClose={() => setShowAllFavorites(false)}
        />
      )}

      {showLists && <ListsModal lists={lists} setLists={setLists} onClose={() => setShowLists(false)} />}
    </div>
  );
}

export default ProfilePage;
