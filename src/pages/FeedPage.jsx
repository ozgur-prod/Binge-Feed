import { useEffect, useState } from 'react';
import { showsAPI } from '../services/api';
import Header from '../components/Header';
import './FeedPage.css';

const POSTER_BASE = 'https://image.tmdb.org/t/p/w154';

const FEED_POSTS = [
  { username: 'achillessehne', label: 'General', rating: 3, text: 'Carmy is so corny 😅', time: '17 min ago', likes: 1, comments: 0 },
  { username: 'oe.yilmaz', label: 'Season 2, Episode 4', rating: 5, text: 'Gabagool? ova here!!', time: '2 hours ago', likes: 32, comments: 5 },
  { username: 'batukalayci', label: 'General', rating: 4, text: 'Just started this one, already hooked. The pacing is insane 🔥', time: '5 hours ago', likes: 14, comments: 3 },
];

const DISCUSSION_POSTS = [
  { username: 'user1', label: 'Season 1, Episode 1', rating: 5, text: 'The pilot episode completely blew me away. Cannot believe this show isn\'t talked about more.', time: '3 min ago', likes: 87, comments: 24, replies: 12 },
  { username: 'user2', label: 'General', rating: 2, text: 'Honestly overhyped. The writing drops off hard after episode 3.', time: '21 min ago', likes: 45, comments: 61, replies: 38 },
  { username: 'user3', label: 'Season 2, Episode 7', rating: 5, text: 'That finale scene had me pausing every 5 seconds. Absolute cinema.', time: '1 hour ago', likes: 210, comments: 99, replies: 57 },
  { username: 'user4', label: 'General', rating: 3, text: 'Good but not great. The side characters carry the whole show tbh.', time: '2 hours ago', likes: 33, comments: 18, replies: 9 },
];

function Stars({ count, max = 5 }) {
  return (
    <span className="stars">
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < count ? 'star filled' : 'star'}>★</span>
      ))}
    </span>
  );
}

function FeedCard({ show, post }) {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  return (
    <article className="feed-card">
      <button className="bookmark-btn" onClick={() => setBookmarked((v) => !v)}>
        <svg viewBox="0 0 24 24" fill={bookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      </button>

      <div className="card-body">
        {show?.poster_path ? (
          <img className="poster" src={`${POSTER_BASE}${show.poster_path}`} alt={show.name} />
        ) : (
          <div className="poster poster-placeholder" />
        )}

        <div className="card-content">
          <div className="card-meta">
            <span className="user-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </span>
            <span className="username">{post.username}</span>
          </div>

          <div className="rating-row">
            <span className="rating-label">{post.label}</span>
            <Stars count={post.rating} />
          </div>

          <p className="post-text">{post.text}</p>
          {show && <p className="show-name">{show.name}</p>}
          <p className="post-time">{post.time}</p>
        </div>
      </div>

      <div className="card-actions">
        <button className={`action-btn like-btn ${liked ? 'active' : ''}`} onClick={() => setLiked((v) => !v)}>
          <svg viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          {post.likes + (liked ? 1 : 0) > 0 && <span>{post.likes + (liked ? 1 : 0)}</span>}
        </button>

        <button className="action-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          {post.comments > 0 && <span>{post.comments}</span>}
        </button>

        <button className="action-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
        </button>
      </div>
    </article>
  );
}

function DiscussionCard({ show, post }) {
  const [liked, setLiked] = useState(false);

  return (
    <article className="disc-card">
      <div className="disc-header">
        {show?.poster_path && (
          <img className="disc-poster" src={`${POSTER_BASE}${show.poster_path}`} alt={show.name} />
        )}
        <div className="disc-show-info">
          {show && <p className="disc-show-name">{show.name}</p>}
          <span className="disc-label">{post.label}</span>
        </div>
        <span className="disc-heat">🔥 Trending</span>
      </div>

      <div className="disc-body">
        <div className="disc-user">
          <span className="disc-avatar">{post.username[0].toUpperCase()}</span>
          <span className="disc-username">{post.username}</span>
          <Stars count={post.rating} />
          <span className="disc-time">{post.time}</span>
        </div>
        <p className="disc-text">{post.text}</p>
      </div>

      <div className="disc-footer">
        <button className={`action-btn like-btn ${liked ? 'active' : ''}`} onClick={() => setLiked((v) => !v)}>
          <svg viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <span>{post.likes + (liked ? 1 : 0)}</span>
        </button>

        <button className="action-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span>{post.comments} comments</span>
        </button>

        <button className="action-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="17 1 21 5 17 9" />
            <path d="M3 11V9a4 4 0 0 1 4-4h14" />
            <polyline points="7 23 3 19 7 15" />
            <path d="M21 13v2a4 4 0 0 1-4 4H3" />
          </svg>
          <span>{post.replies} replies</span>
        </button>
      </div>
    </article>
  );
}

function FeedPage() {
  const [popularShows, setPopularShows] = useState([]);
  const [trendingShows, setTrendingShows] = useState([]);
  const [activeTab, setActiveTab] = useState('feed');

  useEffect(() => {
    showsAPI.getPopular().then((d) => setPopularShows(d.results.slice(0, 3))).catch(console.error);
    showsAPI.getTrending().then((d) => setTrendingShows(d.results.slice(0, 4))).catch(console.error);
  }, []);

  return (
    <div className="feed-page">
      {/* Header is moved to be reusable */}
      <Header active="home" />

      <main className="feed-main">
        <div className="tab-bar">
          <button className={`tab ${activeTab === 'feed' ? 'active' : ''}`} onClick={() => setActiveTab('feed')}>Feed</button>
          <button className={`tab ${activeTab === 'discussions' ? 'active' : ''}`} onClick={() => setActiveTab('discussions')}>Hot Discussions</button>
        </div>

        {activeTab === 'feed' && (
          <div className="feed-list">
            {popularShows.length === 0 ? (
              <p className="feed-loading">Loading shows…</p>
            ) : (
              popularShows.map((show, i) => (
                <FeedCard key={show.id} show={show} post={FEED_POSTS[i]} />
              ))
            )}
          </div>
        )}

        {activeTab === 'discussions' && (
          <div className="disc-list">
            {trendingShows.length === 0 ? (
              <p className="feed-loading">Loading discussions…</p>
            ) : (
              trendingShows.map((show, i) => (
                <DiscussionCard key={show.id} show={show} post={DISCUSSION_POSTS[i]} />
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default FeedPage;
