import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import CommentAuthor from '../components/CommentAuthor';
import { ChevronLeftIcon, HeartIcon, TrashIcon, CheckIcon, XIcon } from '../components/icons';
import { showsAPI, liveCommentsAPI } from '../services/api';
import './LiveCommentsPage.css';

const POSTER_BASE = 'https://image.tmdb.org/t/p/w92';

function currentUser() {
  return JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
}

function isLoggedIn() {
  return !!(localStorage.getItem('token') || sessionStorage.getItem('token'));
}

function formatTimestamp(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const ss = String(s).padStart(2, '0');
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${ss}`;
  return `${m}:${ss}`;
}

function sanitizeSegment(raw) {
  return raw.replace(/\D/g, '').slice(0, 2);
}

function timeAgo(isoString) {
  const minutes = Math.floor((Date.now() - new Date(isoString).getTime()) / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

function LiveCommentRow({ item, me, onLikeToggled, onDelete }) {
  const isMine = me.id === item.createdBy?._id;
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  async function toggleLike() {
    if (!isLoggedIn()) return;
    const wasLiked = item.likedByMe;
    onLikeToggled(item.id, !wasLiked); // optimistic - flip immediately, revert only if the request fails
    try {
      if (wasLiked) await liveCommentsAPI.unlike(item.id);
      else await liveCommentsAPI.like(item.id);
    } catch {
      onLikeToggled(item.id, wasLiked);
    }
  }

  return (
    <div className="lc-row">
      <span className="lc-timestamp">{formatTimestamp(item.timestampSeconds)}</span>

      <div className="lc-body">
        <div className="lc-row-top">
          <CommentAuthor user={item.createdBy} />
          <span className="lc-posted-time">{timeAgo(item.createdAt)}</span>
        </div>

        <p className="lc-text">{item.text}</p>

        <div className="lc-actions">
          <button
            className={`lc-like-btn ${item.likedByMe ? 'active' : ''}`}
            onClick={toggleLike}
            disabled={!isLoggedIn()}
          >
            <HeartIcon fill={item.likedByMe ? 'currentColor' : 'none'} />
            {item.likeCount > 0 && <span>{item.likeCount}</span>}
          </button>
          {isMine && (
            confirmingDelete ? (
              <span className="lc-delete-confirm">
                <span className="lc-delete-confirm-text">Delete?</span>
                <button
                  className="lc-delete-yes"
                  onClick={() => { setConfirmingDelete(false); onDelete(item.id); }}
                  aria-label="Confirm delete"
                >
                  <CheckIcon size={14} />
                </button>
                <button className="lc-delete-no" onClick={() => setConfirmingDelete(false)} aria-label="Cancel delete">
                  <XIcon size={14} />
                </button>
              </span>
            ) : (
              <button className="lc-delete-btn" onClick={() => setConfirmingDelete(true)} aria-label="Delete live comment">
                <TrashIcon size={14} />
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default function LiveCommentsPage() {
  const { id, season, episode: episodeNumber } = useParams();
  const me = useMemo(() => currentUser(), []);

  const [show, setShow] = useState(null);
  const [episodeRuntimeMin, setEpisodeRuntimeMin] = useState(null);
  const [items, setItems] = useState([]);
  const [loadedKey, setLoadedKey] = useState(null);
  const paramsKey = `${id}/${season}/${episodeNumber}`;
  const loading = loadedKey !== paramsKey;
  const [error, setError] = useState('');

  // Hide the hours segment only when we know for sure the episode is under an hour -
  // when TMDB has no runtime data, default to showing it rather than silently capping
  // everyone at 59:59 (the backend allows up to 4h when runtime is unknown).
  const showHours = episodeRuntimeMin == null || episodeRuntimeMin >= 60;

  const [hh, setHh] = useState('');
  const [mm, setMm] = useState('');
  const [ss, setSs] = useState('');
  const hhRef = useRef(null);
  const mmRef = useRef(null);
  const ssRef = useRef(null);

  // Typing 2 digits into a space moves you to the next one
  function handleHhChange(e) {
    const digits = sanitizeSegment(e.target.value);
    setHh(digits);
    if (digits.length === 2) mmRef.current?.focus();
  }
  function handleMmChange(e) {
    const digits = sanitizeSegment(e.target.value);
    setMm(digits);
    if (digits.length === 2) ssRef.current?.focus();
  }
  function handleSsChange(e) {
    setSs(sanitizeSegment(e.target.value));
  }

  // Move between the input spaces, delete to go one bigger
  function handleMmKeyDown(e) {
    if (e.key === 'Backspace' && mm === '' && showHours) hhRef.current?.focus();
  }
  function handleSsKeyDown(e) {
    if (e.key === 'Backspace' && ss === '') mmRef.current?.focus();
  }

  const [textInput, setTextInput] = useState('');
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState('');

  useEffect(() => {
    Promise.all([
      showsAPI.getDetails(id),
      showsAPI.getSeason(id, season),
      liveCommentsAPI.list({ showId: id, season, episode: episodeNumber }),
    ])
      .then(([showData, seasonData, lcData]) => {
        setShow(showData);
        const ep = (seasonData.episodes || []).find((e) => e.episode_number === Number(episodeNumber));
        setEpisodeRuntimeMin(ep?.runtime ?? null);
        setItems(lcData.liveComments || []);
      })
      .catch(() => setError('Failed to load live comments.'))
      .finally(() => setLoadedKey(`${id}/${season}/${episodeNumber}`));
  }, [id, season, episodeNumber]);

  async function handlePost(e) {
    e.preventDefault();
    setPostError('');
    if (!textInput.trim() || !mm) return;
    setPosting(true);
    // Blank second/hour segments default to 0 - only the minute is required.
    const timestamp = showHours ? `${hh || '0'}:${mm}:${ss || '0'}` : `${mm}:${ss || '0'}`;
    try {
      const { liveComment } = await liveCommentsAPI.create({
        showId: id,
        season,
        episode: episodeNumber,
        text: textInput.trim(),
        timestamp,
      });
      const normalized = {
        id: liveComment._id,
        text: liveComment.text,
        timestampSeconds: liveComment.timestampSeconds,
        createdAt: liveComment.createdAt,
        likeCount: 0,
        likedByMe: false,
        createdBy: liveComment.createdBy,
      };
      setItems((prev) => [...prev, normalized].sort((a, b) => a.timestampSeconds - b.timestampSeconds));
      setHh('');
      setMm('');
      setSs('');
      setTextInput('');
    } catch (err) {
      setPostError(err.message);
    } finally {
      setPosting(false);
    }
  }

  function handleLikeToggled(itemId, liked) {
    setItems((its) => its.map((it) => (
      it.id === itemId ? { ...it, likedByMe: liked, likeCount: it.likeCount + (liked ? 1 : -1) } : it
    )));
  }

  async function handleDelete(itemId) {
    try {
      await liveCommentsAPI.remove(itemId);
      setItems((its) => its.filter((it) => it.id !== itemId));
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return (
    <div className="live-comments-page">
      <Header />
      <p className="lc-loading">Loading…</p>
    </div>
  );

  if (error) return (
    <div className="live-comments-page">
      <Header />
      <p className="lc-loading">{error}</p>
    </div>
  );

  return (
    <div className="live-comments-page">
      <Header />

      <main className="lc-main">
        <Link className="back-link" to={`/show/${id}/season/${season}/episode/${episodeNumber}`}>
          <ChevronLeftIcon size={16} /> Back to episode
        </Link>

        {show && (
          <div className="lc-show-header">
            {show.poster_path && (
              <img className="lc-show-poster" src={`${POSTER_BASE}${show.poster_path}`} alt={show.name} />
            )}
            <div>
              <p className="lc-show-label">Live Comments for</p>
              <h1 className="lc-show-name">{show.name} · S{season}E{episodeNumber}</h1>
            </div>
          </div>
        )}

        {isLoggedIn() && (
          <form className="lc-post-form" onSubmit={handlePost}>
            <div className="lc-timestamp-group">
              {showHours && (
                <>
                  <input
                    ref={hhRef}
                    className="lc-time-segment"
                    type="text"
                    inputMode="numeric"
                    placeholder="HH"
                    maxLength={2}
                    value={hh}
                    onChange={handleHhChange}
                  />
                  <span className="lc-time-colon">:</span>
                </>
              )}
              <input
                ref={mmRef}
                className="lc-time-segment"
                type="text"
                inputMode="numeric"
                placeholder="MM"
                maxLength={2}
                value={mm}
                onChange={handleMmChange}
                onKeyDown={handleMmKeyDown}
              />
              <span className="lc-time-colon">:</span>
              <input
                ref={ssRef}
                className="lc-time-segment"
                type="text"
                inputMode="numeric"
                placeholder="SS"
                maxLength={2}
                value={ss}
                onChange={handleSsChange}
                onKeyDown={handleSsKeyDown}
              />
            </div>
            <input
              className="lc-text-input"
              type="text"
              placeholder="What are you thinking now?"
              maxLength={500}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
            />
            <button
              className="lc-post-btn"
              type="submit"
              disabled={posting || !textInput.trim() || !mm}
            >
              {posting ? 'Posting…' : 'Post'}
            </button>
          </form>
        )}
        {postError && <p className="lc-post-error">{postError}</p>}

        <div className="lc-list">
          {items.length === 0 ? (
            <p className="lc-empty">No live comments yet. Be the first to drop one!</p>
          ) : (
            items.map((item) => (
              <LiveCommentRow key={item.id} item={item} me={me} onLikeToggled={handleLikeToggled} onDelete={handleDelete} />
            ))
          )}
        </div>
      </main>
    </div>
  );
}
