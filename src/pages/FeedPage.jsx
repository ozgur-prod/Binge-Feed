import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { showsAPI, feedAPI, commentsAPI } from '../services/api';
import Header from '../components/Header';
import { BookmarkIcon, UserIcon, HeartIcon, MessageSquareIcon, RepeatIcon, StarIcon } from '../components/icons';
import './FeedPage.css';

const POSTER_BASE = 'https://image.tmdb.org/t/p/w154';

const DISCUSSION_POSTS = [
  { username: 'user1', label: 'Season 1, Episode 1', rating: 5, text: 'The pilot episode completely blew me away. Cannot believe this show isn\'t talked about more.', time: '3 min ago', likes: 87, comments: 24, replies: 12 },
  { username: 'user2', label: 'General', rating: 2, text: 'Honestly overhyped. The writing drops off hard after episode 3.', time: '21 min ago', likes: 45, comments: 61, replies: 38 },
  { username: 'user3', label: 'Season 2, Episode 7', rating: 5, text: 'That finale scene had me pausing every 5 seconds. Absolute cinema.', time: '1 hour ago', likes: 210, comments: 99, replies: 57 },
  { username: 'user4', label: 'General', rating: 3, text: 'Good but not great. The side characters carry the whole show tbh.', time: '2 hours ago', likes: 33, comments: 18, replies: 9 },
];

function isLoggedIn() {
  return !!(localStorage.getItem('token') || sessionStorage.getItem('token'));
}

// Floors to the largest unit
function timeAgo(isoString) {
  const minutes = Math.floor((Date.now() - new Date(isoString).getTime()) / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  return new Date(isoString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function goToTarget(item, navigate) {
  if (!item.show) return;
  if (item.episode) {
    navigate(`/show/${item.show.tmdbId}/season/${item.episode.season}/episode/${item.episode.episode}`);
  } else {
    navigate(`/show/${item.show.tmdbId}`);
  }
}

function Stars({ count, max = 5 }) {
  return (
    <span className="stars">
      {Array.from({ length: max }, (_, i) => (
        <StarIcon key={i} className={i < count ? 'star filled' : 'star'} fill={i < count ? 'currentColor' : 'none'} />
      ))}
    </span>
  );
}

function ReviewFeedCard({ item }) {
  const navigate = useNavigate();
  const [bookmarked, setBookmarked] = useState(false);
  const label = item.episode ? `Season ${item.episode.season}, Episode ${item.episode.episode}` : 'General';

  return (
    <article className="feed-card">
      <button className="bookmark-btn" onClick={() => setBookmarked((v) => !v)}>
        <BookmarkIcon fill={bookmarked ? 'currentColor' : 'none'} />
      </button>

      <div className="card-body">
        {item.show?.posterUrl ? (
          <img className="poster clickable" src={item.show.posterUrl} alt={item.show.title} onClick={() => goToTarget(item, navigate)} />
        ) : (
          <div className="poster poster-placeholder" />
        )}

        <div className="card-content">
          <div className="card-meta">
            <span className="user-icon"><UserIcon /></span>
            <span className="username">{item.createdBy?.handle}</span>
          </div>

          <div className="rating-row">
            <span className="rating-label">{label}</span>
            <Stars count={Math.round((item.rating / 10) * 5)} />
          </div>

          {item.text && <p className="post-text">{item.text}</p>}
          {item.show && <p className="show-name clickable" onClick={() => goToTarget(item, navigate)}>{item.show.title}</p>}
          <p className="post-time">{timeAgo(item.createdAt)}</p>
        </div>
      </div>
    </article>
  );
}

function CommentFeedCard({ item, onLikeToggled }) {
  const navigate = useNavigate();
  const [bookmarked, setBookmarked] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replySent, setReplySent] = useState(false);
  const [posting, setPosting] = useState(false);
  const label = item.episode ? `Season ${item.episode.season}, Episode ${item.episode.episode}` : 'General';

  async function toggleLike() {
    if (!isLoggedIn()) return;
    const wasLiked = item.likedByMe;
    onLikeToggled(item.id, !wasLiked); // optimistic - flip immediately, revert only if the request fails
    try {
      if (wasLiked) await commentsAPI.unlike(item.id);
      else await commentsAPI.like(item.id);
    } catch {
      onLikeToggled(item.id, wasLiked);
    }
  }

  async function submitReply(e) {
    e.preventDefault();
    if (!replyText.trim() || !item.show || !item.episode) return;
    setPosting(true);
    try {
      await commentsAPI.create({
        showId: item.show.tmdbId,
        season: item.episode.season,
        episode: item.episode.episode,
        text: replyText.trim(),
        parentId: item.id,
      });
      setReplyText('');
      setReplyOpen(false);
      setReplySent(true);
    } catch (err) {
      console.error(err);
    } finally {
      setPosting(false);
    }
  }

  return (
    <article className="feed-card">
      <button className="bookmark-btn" onClick={() => setBookmarked((v) => !v)}>
        <BookmarkIcon fill={bookmarked ? 'currentColor' : 'none'} />
      </button>

      <div className="card-body">
        {item.show?.posterUrl ? (
          <img className="poster clickable" src={item.show.posterUrl} alt={item.show.title} onClick={() => goToTarget(item, navigate)} />
        ) : (
          <div className="poster poster-placeholder" />
        )}

        <div className="card-content">
          <div className="card-meta">
            <span className="user-icon"><UserIcon /></span>
            <span className="username">{item.createdBy?.handle}</span>
          </div>

          <p className="rating-label">{label}</p>

          <p className="post-text">
            {item.replyTo && <span className="mention">@{item.replyTo.handle} </span>}
            {item.text}
          </p>
          {item.show && <p className="show-name clickable" onClick={() => goToTarget(item, navigate)}>{item.show.title}</p>}
          <p className="post-time">{timeAgo(item.createdAt)}</p>
        </div>
      </div>

      <div className="card-actions">
        <button
          className={`action-btn like-btn ${item.likedByMe ? 'active' : ''}`}
          onClick={toggleLike}
          disabled={!isLoggedIn()}
        >
          <HeartIcon fill={item.likedByMe ? 'currentColor' : 'none'} />
          {item.likeCount > 0 && <span>{item.likeCount}</span>}
        </button>

        {isLoggedIn() && (
          <button className="action-btn" onClick={() => setReplyOpen((v) => !v)}>
            <MessageSquareIcon />
            Reply
          </button>
        )}
      </div>

      {replyOpen && (
        <form className="feed-reply-form" onSubmit={submitReply}>
          <input
            className="feed-reply-input"
            type="text"
            maxLength={1000}
            autoFocus
            placeholder={`Reply to ${item.createdBy?.handle || 'this comment'}...`}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
          />
          <button className="feed-reply-submit" type="submit" disabled={posting || !replyText.trim()}>
            Post
          </button>
        </form>
      )}
      {replySent && <p className="feed-reply-sent">Reply posted.</p>}
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
  const [trendingShows, setTrendingShows] = useState([]);
  const [activeTab, setActiveTab] = useState('feed');

  const [feedItems, setFeedItems] = useState([]);
  const [nextBefore, setNextBefore] = useState(null);
  const [loadingFeed, setLoadingFeed] = useState(isLoggedIn());
  const [loadingMore, setLoadingMore] = useState(false);
  const [feedError, setFeedError] = useState('');

  useEffect(() => {
    showsAPI.getTrending().then((d) => setTrendingShows(d.results.slice(0, 4))).catch(console.error);
  }, []);

  useEffect(() => {
    if (!isLoggedIn()) return;
    feedAPI.get()
      .then((data) => {
        setFeedItems(data.items);
        setNextBefore(data.nextBefore);
      })
      .catch((err) => setFeedError(err.message))
      .finally(() => setLoadingFeed(false));
  }, []);

  async function loadMoreFeed() {
    if (!nextBefore) return;
    setLoadingMore(true);
    try {
      const data = await feedAPI.get({ before: nextBefore });
      setFeedItems((prev) => [...prev, ...data.items]);
      setNextBefore(data.nextBefore);
    } catch (err) {
      setFeedError(err.message);
    } finally {
      setLoadingMore(false);
    }
  }

  function handleLikeToggled(commentId, liked) {
    setFeedItems((items) => items.map((it) => (
      it.type === 'comment' && it.id === commentId
        ? { ...it, likedByMe: liked, likeCount: it.likeCount + (liked ? 1 : -1) }
        : it
    )));
  }

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
            {loadingFeed ? (
              <p className="feed-loading">Loading feed…</p>
            ) : feedError ? (
              <p className="feed-loading">{feedError}</p>
            ) : feedItems.length === 0 ? (
              <p className="feed-loading">
                {isLoggedIn() ? 'Follow people to see their reviews and comments here.' : 'Log in to see your feed.'}
              </p>
            ) : (
              <>
                {feedItems.map((item) => (
                  item.type === 'review' ? (
                    <ReviewFeedCard key={`review-${item.id}`} item={item} />
                  ) : (
                    <CommentFeedCard key={`comment-${item.id}`} item={item} onLikeToggled={handleLikeToggled} />
                  )
                ))}
                {nextBefore && (
                  <button className="load-more-btn" onClick={loadMoreFeed} disabled={loadingMore}>
                    {loadingMore ? 'Loading…' : 'Load more'}
                  </button>
                )}
              </>
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
