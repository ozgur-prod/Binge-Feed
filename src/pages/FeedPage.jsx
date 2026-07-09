import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { showsAPI } from '../services/api';
import Header from '../components/Header';
import { BookmarkIcon, UserIcon, HeartIcon, MessageSquareIcon, ShareIcon, RepeatIcon, StarIcon } from '../components/icons';
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
        <StarIcon key={i} className={i < count ? 'star filled' : 'star'} fill={i < count ? 'currentColor' : 'none'} />
      ))}
    </span>
  );
}

function FeedCard({ show, post }) {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const goToShow = () => show?.id && navigate(`/show/${show.id}`);

  return (
    <article className="feed-card">
      <button className="bookmark-btn" onClick={() => setBookmarked((v) => !v)}>
        <BookmarkIcon fill={bookmarked ? 'currentColor' : 'none'} />
      </button>

      <div className="card-body">
        {show?.poster_path ? (
          <img className="poster clickable" src={`${POSTER_BASE}${show.poster_path}`} alt={show.name} onClick={goToShow} />
        ) : (
          <div className="poster poster-placeholder" />
        )}

        <div className="card-content">
          <div className="card-meta">
            <span className="user-icon">
              <UserIcon />
            </span>
            <span className="username">{post.username}</span>
          </div>

          <div className="rating-row">
            <span className="rating-label">{post.label}</span>
            <Stars count={post.rating} />
          </div>

          <p className="post-text">{post.text}</p>
          {show && <p className="show-name clickable" onClick={goToShow}>{show.name}</p>}
          <p className="post-time">{post.time}</p>
        </div>
      </div>

      <div className="card-actions">
        <button className={`action-btn like-btn ${liked ? 'active' : ''}`} onClick={() => setLiked((v) => !v)}>
          <HeartIcon fill={liked ? 'currentColor' : 'none'} />
          {post.likes + (liked ? 1 : 0) > 0 && <span>{post.likes + (liked ? 1 : 0)}</span>}
        </button>

        <button className="action-btn">
          <MessageSquareIcon />
          {post.comments > 0 && <span>{post.comments}</span>}
        </button>

        <button className="action-btn">
          <ShareIcon />
        </button>
      </div>
    </article>
  );
}

function DiscussionCard({ show, post }) {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const goToShow = () => show?.id && navigate(`/show/${show.id}`);

  return (
    <article className="disc-card">
      <div className="disc-header">
        {show?.poster_path && (
          <img className="disc-poster clickable" src={`${POSTER_BASE}${show.poster_path}`} alt={show.name} onClick={goToShow} />
        )}
        <div className="disc-show-info">
          {show && <p className="disc-show-name clickable" onClick={goToShow}>{show.name}</p>}
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
          <HeartIcon fill={liked ? 'currentColor' : 'none'} />
          <span>{post.likes + (liked ? 1 : 0)}</span>
        </button>

        <button className="action-btn">
          <MessageSquareIcon />
          <span>{post.comments} comments</span>
        </button>

        <button className="action-btn">
          <RepeatIcon />
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
