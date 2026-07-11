import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usersAPI, favoritesAPI, listsAPI, progressAPI } from '../services/api';
import Header from '../components/Header';
import EditProfileModal from '../components/EditProfileModal';
import FollowListModal from '../components/FollowListModal';
import FavoritesModal from '../components/FavoritesModal';
import ListsModal from '../components/ListsModal';
import DiaryEntries from '../components/DiaryEntries';
import DiaryModal from '../components/DiaryModal';
import LogModal from '../components/LogModal';
import { UserIcon, PlayIcon } from '../components/icons';
import AdBox from '../components/AdBox';
import './ProfilePage.css';

const LIST_THUMBS_PREVIEW = 3;
const LISTS_PREVIEW = 5;
const DIARY_PREVIEW = 4; // max # of entries directly shown on the profile before "View all"

function relativeDay(date) {
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const now = new Date();
  const diffDays = Math.round((startOfDay(now) - startOfDay(date)) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return date.toLocaleDateString('en-US', { weekday: 'long' });
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(date.getFullYear() !== now.getFullYear() ? { year: 'numeric' } : {}),
  });
}

// group the flat watch history (newest first) into ordered day->show blocks, each holding
// that show's seasons/episodes watched on that day. Keeps chronology and stays compact.
function buildDiary(entries) {
  const blocks = [];
  const byKey = new Map();
  for (const e of entries) {
    const d = new Date(e.watchedAt);
    const dayKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    const key = `${dayKey}|${e.showId}`;
    let block = byKey.get(key);
    if (!block) {
      block = {
        dayKey,
        dayLabel: relativeDay(d),
        dateISO: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
        showId: e.showId,
        showName: e.showName,
        posterUrl: e.posterUrl,
        count: 0,
        seasons: [],
        seasonMap: new Map(),
      };
      byKey.set(key, block);
      blocks.push(block);
    }
    block.count += 1;
    let season = block.seasonMap.get(e.season);
    if (!season) {
      season = { season: e.season, episodes: [] };
      block.seasonMap.set(e.season, season);
      block.seasons.push(season);
    }
    season.episodes.push(e.episode);
  }
  for (const block of blocks) {
    block.seasons.sort((a, b) => a.season - b.season);
    for (const s of block.seasons) s.episodes.sort((a, b) => a - b);
  }
  return blocks;
}

function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [lists, setLists] = useState([]);
  const [diaryEntries, setDiaryEntries] = useState([]);
  const [diaryTotal, setDiaryTotal] = useState(0);
  const [diaryShowCount, setDiaryShowCount] = useState(0);
  const [diaryHasMore, setDiaryHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [followModal, setFollowModal] = useState(null);
  const [showAllFavorites, setShowAllFavorites] = useState(false);
  const [showLists, setShowLists] = useState(false);
  const [showDiary, setShowDiary] = useState(false);
  const [diaryStartManage, setDiaryStartManage] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [editEntry, setEditEntry] = useState(null);
  const [error, setError] = useState('');

  const diaryBlocks = useMemo(() => buildDiary(diaryEntries), [diaryEntries]);

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
        loadDiary();
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

  function loadDiary() {
    progressAPI
      .history()
      .then((h) => {
        setDiaryEntries(h.diary);
        setDiaryTotal(h.total);
        setDiaryShowCount(h.showCount);
        setDiaryHasMore(h.hasMore);
      })
      .catch(console.error);
  }

  async function deleteEntry(entry) {
    try {
      await progressAPI.unmark({ showId: entry.showId, season: entry.season, episode: entry.episode });
      loadDiary();
    } catch (err) {
      console.error(err);
    }
  }

  async function loadMoreDiary() {
    setLoadingMore(true);
    try {
      const h = await progressAPI.history({ skip: diaryEntries.length });
      setDiaryEntries((prev) => [...prev, ...h.diary]);
      setDiaryHasMore(h.hasMore);
      setDiaryTotal(h.total);
      setDiaryShowCount(h.showCount);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  }

  function handleSaved(updatedUser) {
    setUser(updatedUser);
    const storage = localStorage.getItem('user') ? localStorage : sessionStorage;
    storage.setItem('user', JSON.stringify(updatedUser));
  }

  return (
    <div className="profile-page">
      <Header active="profile" />

      <div className="profile-layout">
        <div className="feed-ad-col">
          <AdBox className="feed-ad" />
          <AdBox className="feed-ad" text="Another ad could be here." />
        </div>

      <main className="profile-main">
        <div className="profile-content">
          <section className="profile-header">
            {user?.avatarUrl ? (
              <img className="profile-avatar" src={user.avatarUrl} alt={user.handle} />
            ) : (
              <span className="profile-avatar profile-avatar-placeholder">
                <UserIcon strokeWidth={1.5} />
              </span>
            )}
            <div className="profile-identity">
              <h1 className={`profile-handle${user?.tier === 'premium' ? ' profile-handle--premium' : ''}`}>
                {user ? user.handle : '…'}
                {user?.tier === 'premium' && <PlayIcon size={20} className="profile-handle-play" />}
              </h1>
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
              <div className="section-head-btns">
                {diaryBlocks.length > 0 && (
                  <button
                    className="pill-btn pill-btn-small"
                    onClick={() => { setDiaryStartManage(true); setShowDiary(true); }}
                    disabled={!user}
                  >
                    Edit
                  </button>
                )}
                <button className="pill-btn pill-btn-small" onClick={() => setShowLog(true)} disabled={!user}>
                  Log
                </button>
              </div>
            </div>
            <div className="diary">
              {diaryBlocks.length === 0 ? (
                <p className="diary-empty">No episodes logged yet.</p>
              ) : (
                <>
                  <DiaryEntries blocks={diaryBlocks.slice(0, DIARY_PREVIEW)} />
                  {(diaryBlocks.length > DIARY_PREVIEW || diaryHasMore) && (
                    <button
                      className="diary-view-all"
                      onClick={() => { setDiaryStartManage(false); setShowDiary(true); }}
                    >
                      View all ({diaryTotal} episode{diaryTotal === 1 ? '' : 's'} across {diaryShowCount} show
                      {diaryShowCount === 1 ? '' : 's'})
                    </button>
                  )}
                </>
              )}
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

          {user && (
            <button
              className="delete-account-btn"
              onClick={() => navigate('/account/delete')}
            >
              Delete Account
            </button>
          )}
        </div>

        <aside className="profile-sidebar">
          <AdBox />

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

        <div className="feed-ad-col">
          <AdBox className="feed-ad" />
          <AdBox className="feed-ad" text="Another ad could be here." />
        </div>
      </div>

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

      {showDiary && (
        <DiaryModal
          blocks={diaryBlocks}
          total={diaryTotal}
          showCount={diaryShowCount}
          hasMore={diaryHasMore}
          loadingMore={loadingMore}
          onLoadMore={loadMoreDiary}
          onEditEpisode={setEditEntry}
          onDeleteEpisode={deleteEntry}
          initialManage={diaryStartManage}
          onClose={() => setShowDiary(false)}
        />
      )}

      {(showLog || editEntry) && (
        <LogModal
          initial={editEntry}
          onSaved={loadDiary}
          onClose={() => { setShowLog(false); setEditEntry(null); }}
        />
      )}
    </div>
  );
}

export default ProfilePage;
