import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Stars from '../components/Stars';
import RatePopup from '../components/RatePopup.jsx';
import { HeartIcon, TrashIcon, UserIcon, ChevronDownIcon, PlayIcon, CheckIcon, StarIcon } from '../components/icons';
import { showsAPI, commentsAPI, reviewsAPI, progressAPI } from '../services/api';
import './EpisodePage.css';

const STILL_BASE = 'https://image.tmdb.org/t/p/w780';

function formatDate(dateOnly) {
  const [y, m, d] = dateOnly.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  });
}

// Floors to the largest unit, e.g. 2h45m elapsed reads "2 hours ago", not "3 hours ago".
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

function currentUser() {
  return JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
}

function isLoggedIn() {
  return !!(localStorage.getItem('token') || sessionStorage.getItem('token'));
}

// Normalizes a raw create comment to display structure
function normalizeCreated(raw, mentionHandle) {
  return {
    id: raw._id,
    createdAt: raw.createdAt,
    likeCount: 0,
    likedByMe: false,
    text: raw.text,
    createdBy: raw.createdBy,
    ...(raw.replyTo ? { replyTo: { id: raw.replyTo, handle: mentionHandle } } : {}),
  };
}

function CommentRow({
  comment, isTopLevel, me, onReply, onToggleLike, onDelete,
  replyingTo, setReplyingTo, replyText, setReplyText, onSubmitReply,
  repliesCount, expanded, onToggleReplies,
}) {
  const isDeleted = comment.createdBy === null;
  const isMine = !isDeleted && me.id === comment.createdBy?._id;
  const isPremium = !isDeleted && comment.createdBy?.tier === 'premium';
  const isReplying = replyingTo === comment.id;

  return (
    <div className={`comment-row ${isDeleted ? 'deleted' : ''}`}>
      <div className="comment-row-top">
        <div className="comment-identity">
          {isDeleted ? (
            <span className="comment-avatar placeholder"><UserIcon /></span>
          ) : comment.createdBy.avatarUrl ? (
            <img className="comment-avatar" src={comment.createdBy.avatarUrl} alt={comment.createdBy.handle} />
          ) : (
            <span className="comment-avatar placeholder">
              <UserIcon />
            </span>
          )}
          <span className={`comment-author ${isDeleted ? 'muted' : ''} ${isPremium ? 'premium' : ''}`}>
            {isDeleted ? 'unknown user' : comment.createdBy.handle}
          </span>
          {isPremium && <PlayIcon className="premium-badge" size={14} />}
        </div>

        <div className="comment-row-top-right">
          {!isDeleted && (
            <>
              <span className="like-count">{comment.likeCount > 0 ? comment.likeCount : ''}</span>
              <button
                className={`heart-btn ${comment.likedByMe ? 'active' : ''}`}
                onClick={() => onToggleLike(comment.id, comment.likedByMe)}
                disabled={!isLoggedIn()}
                aria-label="Like"
              >
                <HeartIcon fill={comment.likedByMe ? 'currentColor' : 'none'} />
              </button>
            </>
          )}
          <span className="comment-timestamp">{timeAgo(comment.createdAt)}</span>
        </div>
      </div>

      <p className="comment-text">
        {isDeleted ? (
          <span className="muted">[deleted]</span>
        ) : (
          <>
            {comment.replyTo && <span className="mention">@{comment.replyTo.handle} </span>}
            {comment.text}
          </>
        )}
      </p>

      <div className="comment-row-footer">
        {isTopLevel ? (
          <button
            type="button"
            className={`replies-toggle-btn ${expanded ? 'expanded' : ''}`}
            onClick={onToggleReplies}
          >
            <ChevronDownIcon className="replies-arrow" />
            Replies ({repliesCount})
          </button>
        ) : <span />}

        <div className="comment-row-actions">
          {isMine && (
            <button className="icon-btn danger" onClick={() => onDelete(comment.id, isTopLevel)} aria-label="Delete comment">
              <TrashIcon />
            </button>
          )}
          {isLoggedIn() && (
            <button className="reply-btn" onClick={() => onReply(comment.id)}>Reply</button>
          )}
        </div>
      </div>

      {isReplying && (
        <form
          className="reply-form"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmitReply(comment.id);
          }}
        >
          <input
            className="reply-input"
            type="text"
            maxLength={1000}
            autoFocus
            placeholder={`Reply to ${comment.createdBy?.handle || 'this comment'}...`}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
          />
          <button className="reply-submit" type="submit">Post</button>
          <button type="button" className="reply-cancel" onClick={() => setReplyingTo(null)}>Cancel</button>
        </form>
      )}
    </div>
  );
}

export default function EpisodePage() {
  const { id, season, episode: episodeNumber } = useParams();
  const me = useMemo(() => currentUser(), []);

  const [showName, setShowName] = useState('');
  const [episode, setEpisode] = useState(null);
  const [comments, setComments] = useState([]);
  const [loadedKey, setLoadedKey] = useState(null);
  const paramsKey = `${id}/${season}/${episodeNumber}`;
  const loading = loadedKey !== paramsKey;
  const [error, setError] = useState('');

  const [newText, setNewText] = useState('');
  const [posting, setPosting] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [expandedIds, setExpandedIds] = useState(() => new Set());

  function toggleReplies(commentId) {
    setExpandedIds((ids) => {
      const next = new Set(ids);
      if (next.has(commentId)) next.delete(commentId);
      else next.add(commentId);
      return next;
    });
  }

  const [showRateModal, setShowRateModal] = useState(false);
  const [myRating, setMyRating] = useState(null);
  const [myReviewId, setMyReviewId] = useState(null);

  const [watched, setWatched] = useState(false);

  useEffect(() => {
    Promise.all([
      showsAPI.getDetails(id),
      showsAPI.getSeason(id, season),
      commentsAPI.list({ showId: id, season, episode: episodeNumber }),
      isLoggedIn() ? reviewsAPI.list({ showId: id, season, episode: episodeNumber }) : Promise.resolve(null),
      isLoggedIn() ? progressAPI.get({ showId: id, season }) : Promise.resolve(null),
    ])
      .then(([show, seasonData, commentsData, reviewsData, progressData]) => {
        setShowName(show.name);
        const ep = (seasonData.episodes || []).find((e) => e.episode_number === Number(episodeNumber));
        setEpisode(ep || null);
        setComments(commentsData.comments || []);
        const mine = reviewsData?.reviews.find((r) => r.createdBy?._id === me.id);
        setMyRating(mine ? mine.rating : null);
        setMyReviewId(mine ? mine._id : null);
        setWatched(!!progressData?.watched.includes(Number(episodeNumber)));
      })
      .catch(() => setError('Failed to load this episode.'))
      .finally(() => setLoadedKey(`${id}/${season}/${episodeNumber}`));
  }, [id, season, episodeNumber, me.id]);

  async function toggleWatched() {
    const wasWatched = watched;
    setWatched(!wasWatched); // optimistic - flip immediately, revert only if the request fails
    try {
      if (wasWatched) await progressAPI.unmark({ showId: id, season, episode: episodeNumber });
      else await progressAPI.mark({ showId: id, season, episode: episodeNumber });
    } catch (err) {
      setWatched(wasWatched);
      setError(err.message);
    }
  }

  function findNode(nodeId) {
    for (const c of comments) {
      if (c.id === nodeId) return c;
      const r = c.replies.find((x) => x.id === nodeId);
      if (r) return r;
    }
    return null;
  }

  async function handlePostTopLevel(e) {
    e.preventDefault();
    if (!newText.trim()) return;
    setPosting(true);
    try {
      const { comment: raw } = await commentsAPI.create({ showId: id, season, episode: episodeNumber, text: newText.trim() });
      setComments((cs) => [{ ...normalizeCreated(raw), replies: [] }, ...cs]);
      setNewText('');
    } catch (err) {
      setError(err.message);
    } finally {
      setPosting(false);
    }
  }

  async function handleSubmitReply(parentId) {
    if (!replyText.trim()) return;
    try {
      const { comment: raw } = await commentsAPI.create({
        showId: id,
        season,
        episode: episodeNumber,
        text: replyText.trim(),
        parentId,
      });
      const topId = raw.parent;
      const mentionTarget = raw.replyTo ? findNode(raw.replyTo) : null;
      const normalized = normalizeCreated(raw, mentionTarget?.createdBy?.handle);
      setComments((cs) => cs.map((c) => (c.id === topId ? { ...c, replies: [normalized, ...c.replies] } : c)));
      setReplyingTo(null);
      setReplyText('');
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleToggleLike(commentId, currentlyLiked) {
    try {
      if (currentlyLiked) await commentsAPI.unlike(commentId);
      else await commentsAPI.like(commentId);
      const bump = (c) => (c.id === commentId ? { ...c, likedByMe: !currentlyLiked, likeCount: c.likeCount + (currentlyLiked ? -1 : 1) } : c);
      setComments((cs) => cs.map((c) => ({ ...bump(c), replies: c.replies.map(bump) })));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(commentId, isTopLevel) {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await commentsAPI.remove(commentId);
      if (isTopLevel) {
        setComments((cs) => cs.map((c) => (c.id === commentId ? { ...c, text: '[deleted]', createdBy: null } : c)));
      } else {
        setComments((cs) => cs.map((c) => ({ ...c, replies: c.replies.filter((r) => r.id !== commentId) })));
      }
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return (
    <div className="episode-page">
      <Header />
      <p className="detail-loading">Loading…</p>
    </div>
  );

  if (error || !episode) return (
    <div className="episode-page">
      <Header />
      <p className="detail-error">{error || 'Episode not found.'}</p>
    </div>
  );

  return (
    <div className="episode-page">
      <Header />

      <div className="episode-content">
        <Link className="back-link" to={`/show/${id}`}>← Back to {showName}</Link>

        <div className="episode-hero">
          {episode.still_path && (
            <img className="episode-still" src={`${STILL_BASE}${episode.still_path}`} alt={episode.name} />
          )}
          <div className="episode-info">
            <h1 className="episode-title">{showName} Season {season} Episode {episodeNumber}</h1>

            <div className="episode-subheader">
              <div className="episode-name-date">
                <p className="episode-name">{episode.name}</p>
                {episode.air_date && <p className="episode-date">{formatDate(episode.air_date)}</p>}
                {isLoggedIn() && (
                  <button
                    type="button"
                    className={`watched-btn ${watched ? 'active' : ''}`}
                    onClick={toggleWatched}
                  >
                    <CheckIcon/>
                    {watched ? 'Watched' : 'Mark as Watched'}
                  </button>
                )}
              </div>
              <div className="episode-rating-block">
                {episode.vote_average > 0 && <Stars value={episode.vote_average} />}
                {isLoggedIn() && (
                  <button type="button" className="rate-btn" onClick={() => setShowRateModal(true)}>
                    <StarIcon fill={myRating ? 'currentColor' : 'none'} />
                    {myRating ? `Rated ${myRating / 2}` : 'Rate'}
                  </button>
                )}
              </div>
            </div>

            {episode.overview && <p className="episode-overview">{episode.overview}</p>}
          </div>
        </div>

        {isLoggedIn() && (
        <div className="comments-section">
          <h2>Discussion</h2>

          <form className="comment-form" onSubmit={handlePostTopLevel}>
            <textarea
              className="comment-input"
              maxLength={1000}
              placeholder="Share your thoughts on this episode..."
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
            />
            <button className="comment-submit" type="submit" disabled={posting || !newText.trim()}>
              {posting ? 'Posting…' : 'Post'}
            </button>
          </form>

          {comments.length === 0 && <p className="no-comments">No comments yet. Be the first!</p>}

          <div className="comment-list">
            {comments.map((c) => (
              <div key={c.id} className="comment-thread">
                <CommentRow
                  comment={c}
                  isTopLevel
                  me={me}
                  onReply={setReplyingTo}
                  onToggleLike={handleToggleLike}
                  onDelete={handleDelete}
                  replyingTo={replyingTo}
                  setReplyingTo={setReplyingTo}
                  replyText={replyText}
                  setReplyText={setReplyText}
                  onSubmitReply={handleSubmitReply}
                  repliesCount={c.replies.length}
                  expanded={expandedIds.has(c.id)}
                  onToggleReplies={() => toggleReplies(c.id)}
                />
                {expandedIds.has(c.id) && c.replies.length > 0 && (
                  <div className="comment-replies">
                    {c.replies.map((r) => (
                      <CommentRow
                        key={r.id}
                        comment={r}
                        isTopLevel={false}
                        me={me}
                        onReply={setReplyingTo}
                        onToggleLike={handleToggleLike}
                        onDelete={handleDelete}
                        replyingTo={replyingTo}
                        setReplyingTo={setReplyingTo}
                        replyText={replyText}
                        setReplyText={setReplyText}
                        onSubmitReply={handleSubmitReply}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        )}
      </div>

      {showRateModal && (
        <RatePopup
          showId={id}
          season={season}
          episode={episodeNumber}
          reviewId={myReviewId}
          initialRating={myRating}
          onClose={() => setShowRateModal(false)}
          onRated={(review) => {
            setMyRating(review.rating);
            setMyReviewId(review._id);
          }}
          onDeleted={() => {
            setMyRating(null);
            setMyReviewId(null);
          }}
        />
      )}
    </div>
  );
}
