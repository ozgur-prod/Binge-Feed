import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import Stars from '../components/Stars';
import { showsAPI, reviewsAPI } from '../services/api';
import './ReviewsPage.css';

const POSTER_BASE = 'https://image.tmdb.org/t/p/w92';

function isLoggedIn() {
  return !!(localStorage.getItem('token') || sessionStorage.getItem('token'));
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function Avatar({ user }) {
  if (user?.avatarUrl) {
    return <img className="rv-avatar" src={user.avatarUrl} alt={user.handle} />;
  }
  return (
    <span className="rv-avatar rv-avatar-placeholder">
      {(user?.handle || '?')[0].toUpperCase()}
    </span>
  );
}

const HeartSVG = ({ filled }) => (
  <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" width="16" height="16">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

function ReviewCard({ review, loggedIn, navigate }) {
  const [likeCount, setLikeCount] = useState(review.likeCount || 0);
  const [likedByMe, setLikedByMe] = useState(review.likedByMe || false);
  const [liking, setLiking] = useState(false);

  async function toggleLike() {
    if (!loggedIn) { navigate('/login'); return; }
    if (liking) return;
    setLiking(true);
    try {
      const data = likedByMe
        ? await reviewsAPI.unlike(review._id)
        : await reviewsAPI.like(review._id);
      setLikedByMe(data.likedByMe);
      setLikeCount(data.likeCount);
    } finally {
      setLiking(false);
    }
  }

  return (
    <div className="rv-card">
      <div className="rv-card-top">
        <div className="rv-author-info">
          <Avatar user={review.createdBy} />
          <div>
            <span className="rv-handle">{review.createdBy?.handle || 'unknown'}</span>
            {review.createdBy?.displayName && (
              <span className="rv-display-name">{review.createdBy.displayName}</span>
            )}
            <Stars value={review.rating} />
          </div>
        </div>
        <div className="rv-meta">
          <span className="rv-time">{timeAgo(review.createdAt)}</span>
          <div className="rv-like-group">
            <span className="rv-like-count">{likeCount > 0 ? likeCount : ''}</span>
            <button
              className={`rv-like-btn ${likedByMe ? 'active' : ''}`}
              onClick={toggleLike}
              disabled={liking}
              aria-label="Like"
            >
              <HeartSVG filled={likedByMe} />
            </button>
          </div>
        </div>
      </div>

      {review.text && <p className="rv-text">{review.text}</p>}
    </div>
  );
}

export default function ReviewsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState('public');
  const [sort, setSort] = useState('newest');
  const [show, setShow] = useState(null);
  const [publicReviews, setPublicReviews] = useState([]);
  const [friendReviews, setFriendReviews] = useState([]);
  const [loadedPublicId, setLoadedPublicId] = useState(null);
  const [loadedFriendsId, setLoadedFriendsId] = useState(null);
  const loggedIn = isLoggedIn();
  const loadingPublic = id !== loadedPublicId;
  const friendsLoaded = id === loadedFriendsId;
  const loadingFriends = loggedIn && !friendsLoaded;

  useEffect(() => {
    showsAPI.getDetails(id).then(setShow).catch(() => {});

    reviewsAPI.list({ showId: id })
      .then((data) => setPublicReviews(data.reviews || []))
      .catch(() => {})
      .finally(() => setLoadedPublicId(id));
  }, [id]);

  useEffect(() => {
    if (!loggedIn || friendsLoaded) return;
    reviewsAPI.list({ showId: id, friends: true })
      .then((data) => setFriendReviews(data.reviews || []))
      .catch(() => {})
      .finally(() => setLoadedFriendsId(id));
  }, [id, loggedIn, friendsLoaded]);

  const baseReviews = tab === 'friends' ? friendReviews : publicReviews;
  const reviews = [...baseReviews].sort((a, b) =>
    sort === 'popular'
      ? (b.likeCount || 0) - (a.likeCount || 0)
      : new Date(b.createdAt) - new Date(a.createdAt)
  );
  const loading = tab === 'friends' ? loadingFriends : loadingPublic;

  return (
    <div className="reviews-page">
      <Header />
      {show?.backdrop_path && (
        <div className="backdrop" style={{ backgroundImage: `url(https://image.tmdb.org/t/p/w1280${show.backdrop_path})` }} />
      )}

      <main className="rv-main">
        <Link className="back-link" to={`/show/${id}`}>
          ← Back to {show?.name || 'series'}
        </Link>

        {show && (
          <div className="rv-show-header">
            {show.poster_path && (
              <img className="rv-show-poster" src={`${POSTER_BASE}${show.poster_path}`} alt={show.name} />
            )}
            <div>
              <p className="rv-show-label">Reviews for</p>
              <h1 className="rv-show-name">{show.name}</h1>
            </div>
          </div>
        )}

        <div className="rv-tabs">
          <button
            className={`rv-tab ${tab === 'public' ? 'active' : ''}`}
            onClick={() => setTab('public')}
          >
            Public
            {!loadingPublic && <span className="rv-tab-count">{publicReviews.length}</span>}
          </button>
          <button
            className={`rv-tab ${tab === 'friends' ? 'active' : ''}`}
            onClick={() => { if (!loggedIn) { navigate('/login'); return; } setTab('friends'); }}
          >
            Friends
            {friendsLoaded && <span className="rv-tab-count">{friendReviews.length}</span>}
          </button>
        </div>

        {tab === 'public' && !loadingPublic && publicReviews.length > 1 && (
          <div className="rv-sort">
            <button
              className={`rv-sort-btn ${sort === 'newest' ? 'active' : ''}`}
              onClick={() => setSort('newest')}
            >
              Newest
            </button>
            <button
              className={`rv-sort-btn ${sort === 'popular' ? 'active' : ''}`}
              onClick={() => setSort('popular')}
            >
              Most Liked
            </button>
          </div>
        )}

        <div className="rv-list">
          {loading ? (
            <p className="rv-empty">Loading…</p>
          ) : reviews.length === 0 ? (
            <p className="rv-empty">
              {tab === 'friends'
                ? 'Nobody you follow has reviewed this show yet.'
                : 'No reviews yet. Be the first!'}
            </p>
          ) : (
            reviews.map((r) => (
              <ReviewCard
                key={r._id}
                review={r}
                loggedIn={loggedIn}
                navigate={navigate}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
}
