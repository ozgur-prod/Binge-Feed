import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import AdBox from '../components/AdBox';
import AddToListModal from '../components/AddToListModal';
import Toast from '../components/Toast';
import Stars from '../components/Stars';
import RatePopup from '../components/RatePopup.jsx';
import CommentAuthor from '../components/CommentAuthor';
import { PlusIcon, StarIcon, CheckIcon, ChevronRightIcon } from '../components/icons';
import { showsAPI, usersAPI, favoritesAPI, progressAPI, reviewsAPI } from '../services/api';
import './ShowDetailPage.css';

function isLoggedIn() {
  return !!(localStorage.getItem('token') || sessionStorage.getItem('token'));
}

function currentUser() {
  return JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
}

const POSTER_BASE = 'https://image.tmdb.org/t/p/w342';
const BACKDROP_BASE = 'https://image.tmdb.org/t/p/w1280';



const PROVIDER_SITES = {
  'netflix':          'https://www.netflix.com',
  'prime video':      'https://www.amazon.de/gp/video/storefront',
  'disney':           'https://www.disneyplus.com',
  'apple tv':         'https://tv.apple.com',
  'max':              'https://www.max.com',
  'paramount':        'https://www.paramountplus.com',
  'wow':              'https://www.wowtv.de',
  'sky go':           'https://www.sky.de/entertainment/serien',
  'joyn':             'https://www.joyn.de',
  'magentatv':        'https://www.magenta.de/tv',
  'rtl':              'https://plus.rtl.de',
  'crunchyroll':      'https://www.crunchyroll.com',
  'mubi':             'https://mubi.com',
  'ard mediathek':    'https://www.ardmediathek.de',
  'zdf mediathek':    'https://www.zdf.de',
  'youtube premium':  'https://www.youtube.com/premium',
};

function providerUrl(name) {
  const base = name.toLowerCase()
    .replace(/^(amazon|hbo)\s+/, '')
    .replace(/\s+(basic|standard|premium|with ads?|in prime|amazon channel|apple tv channel|roku channel|season pass)\b.*/g, '')
    .replace(/\bplus\b/g, '')
    .replace(/\+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return PROVIDER_SITES[base] || null;
}

export default function ShowDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [show, setShow] = useState(null);
  const [seasons, setSeasons] = useState([]);
  const [activeSeason, setActiveSeason] = useState(1);
  const [episodes, setEpisodes] = useState([]);
  const [loadedSeason, setLoadedSeason] = useState(null);
  const loadingEpisodes = activeSeason !== loadedSeason;
  const [watchProviders, setWatchProviders] = useState([]);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showAddToList, setShowAddToList] = useState(false);
  const [favError, setFavError] = useState('');
  const [watchedEpisodes, setWatchedEpisodes] = useState(() => new Set());
  const [error, setError] = useState('');

  const [reviews, setReviews] = useState([]);
  const [showRateModal, setShowRateModal] = useState(false);
  const [myRating, setMyRating] = useState(null);
  const [myReviewText, setMyReviewText] = useState('');
  const [myReviewId, setMyReviewId] = useState(null);
  const me = useMemo(() => currentUser(), []);
  // Captured once at mount - only used to pick the initial season tab (e.g. from the profile Diary's ?season=N link).
  const [initialSeasonParam] = useState(() => Number(searchParams.get('season')));

  useEffect(() => {
    showsAPI.getDetails(id)
      .then((data) => {
        setShow(data);
        const realSeasons = (data.seasons || []).filter((s) => s.season_number > 0);
        setSeasons(realSeasons);
        if (realSeasons.length > 0) {
          const wanted = realSeasons.some((s) => s.season_number === initialSeasonParam) ? initialSeasonParam : realSeasons[0].season_number;
          setActiveSeason(wanted);
        }
      })
      .catch(() => setError('Failed to load show details.'));

    showsAPI.getWatchProviders(id)
      .then((data) => setWatchProviders(data.providers || []))
      .catch(() => {});

    reviewsAPI.list({ showId: id })
      .then((data) => {
        setReviews(data.reviews || []);
        const mine = data.reviews.find((r) => r.createdBy?._id === me.id);
        setMyRating(mine ? mine.rating : null);
        setMyReviewText(mine ? (mine.text || '') : '');
        setMyReviewId(mine ? mine._id : null);
      })
      .catch(() => {});

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      usersAPI.getMe()
        .then((data) => favoritesAPI.list(data.user.id))
        .then((data) => setIsFavorited(data.favorites.some((f) => f.showId === Number(id))))
        .catch(() => {});
    }
  }, [id, me.id, initialSeasonParam]);

  function openAddToList() {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    setShowAddToList(true);
  }

  async function toggleFavorite() {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      if (isFavorited) {
        await favoritesAPI.remove(show.id);
        setIsFavorited(false);
      } else {
        await favoritesAPI.add({ showId: show.id });
        setIsFavorited(true);
      }
      setFavError('');
    } catch (err) {
      setFavError(err.message);
    }
  }

  useEffect(() => {
    if (!activeSeason) return;
    Promise.all([
      showsAPI.getSeason(id, activeSeason),
      isLoggedIn() ? progressAPI.get({ showId: id, season: activeSeason }) : Promise.resolve(null),
    ])
      .then(([data, progressData]) => {
        setEpisodes(data.episodes || []);
        setWatchedEpisodes(new Set(progressData?.watched || []));
      })
      .catch(() => setEpisodes([]))
      .finally(() => setLoadedSeason(activeSeason));
  }, [id, activeSeason]);

  function flipWatched(episodeNumber, isWatched) {
    setWatchedEpisodes((prev) => {
      const next = new Set(prev);
      if (isWatched) next.add(episodeNumber);
      else next.delete(episodeNumber);
      return next;
    });
  }

  async function toggleWatched(e, episodeNumber) {
    e.stopPropagation();
    const wasWatched = watchedEpisodes.has(episodeNumber);
    flipWatched(episodeNumber, !wasWatched); // optimistic - flip immediately, revert only if the request fails
    try {
      if (wasWatched) await progressAPI.unmark({ showId: id, season: activeSeason, episode: episodeNumber });
      else await progressAPI.mark({ showId: id, season: activeSeason, episode: episodeNumber });
    } catch {
      flipWatched(episodeNumber, wasWatched);
    }
  }

  if (error) return (
    <div className="show-detail-page">
      <Header />
      <p className="detail-error">{error}</p>
    </div>
  );

  if (!show) return (
    <div className="show-detail-page">
      <Header />
      <p className="detail-loading">Loading…</p>
    </div>
  );

  const genres = (show.genres || []).map((g) => g.name).join(', ');
  const year = show.first_air_date ? show.first_air_date.slice(0, 4) : '';

  return (
    <div className="show-detail-page">
      <Header />

      {show.backdrop_path && (
        <div
          className="backdrop"
          style={{ backgroundImage: `url(${BACKDROP_BASE}${show.backdrop_path})` }}
        />
      )}

      <div className="detail-content">
        <div className="detail-hero">
          {show.poster_path && (
            <img
              className="detail-poster"
              src={`${POSTER_BASE}${show.poster_path}`}
              alt={show.name}
            />
          )}

          <div className="detail-info">
            <h1 className="detail-title">
              {show.name}
              {show.vote_average > 0 && <Stars value={show.vote_average} />}
            </h1>
            <p className="detail-meta">{year}{genres ? ` · ${genres}` : ''}</p>
            {show.overview && <p className="detail-overview">{show.overview}</p>}

            {watchProviders.length > 0 && (
              <div className="watch-providers">
                <span className="watch-label">Watch now on:</span>
                <div className="provider-logos">
                  {(() => {
                    const seenUrls = new Set();
                    return watchProviders.map((p) => {
                      const url = providerUrl(p.provider_name);
                      if (!url || seenUrls.has(url)) return null;
                      seenUrls.add(url);
                      return (
                        <a key={p.provider_id} href={url} target="_blank" rel="noopener noreferrer">
                          <img
                            className="provider-logo"
                            src={`https://image.tmdb.org/t/p/original${p.logo_path}`}
                            alt={p.provider_name}
                            title={p.provider_name}
                          />
                        </a>
                      );
                    });
                  })()}
                </div>
              </div>
            )}

            <div className="detail-actions">
              <button className="action-btn primary" onClick={openAddToList}>
                <PlusIcon />
                Add to List
              </button>
              <button className={`action-btn ${isFavorited ? 'active' : ''}`} onClick={toggleFavorite}>
                <StarIcon fill={isFavorited ? 'currentColor' : 'none'} />
                {isFavorited ? 'Favourited' : 'Favourite'}
              </button>
              {isLoggedIn() && (
                <button className="action-btn" onClick={() => setShowRateModal(true)}>
                  <StarIcon fill={myRating ? 'currentColor' : 'none'} />
                  {myRating ? `Rated ${myRating / 2}` : 'Rate / Review'}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="detail-body">
          <div className="seasons-episodes">
            <div className="season-tabs">
              {seasons.map((s) => (
                <button
                  key={s.season_number}
                  className={`season-tab ${activeSeason === s.season_number ? 'active' : ''}`}
                  onClick={() => setActiveSeason(s.season_number)}
                >
                  Season {s.season_number}
                </button>
              ))}
            </div>

            <div className="episode-list">
              {loadingEpisodes ? (
                <p className="detail-loading">Loading episodes…</p>
              ) : (
                episodes.map((ep) => (
                  <div
                    key={ep.id}
                    className="episode-row clickable"
                    onClick={() => navigate(`/show/${id}/season/${activeSeason}/episode/${ep.episode_number}`)}
                  >
                    <span className="ep-number">{ep.episode_number}. {ep.name}</span>
                    {ep.vote_average > 0 && (
                      <span className="ep-rating">
                        <StarIcon size={14} fill="currentColor" /> {((ep.vote_average / 10) * 5).toFixed(1)}
                      </span>
                    )}
                    {isLoggedIn() && (
                      <button
                        type="button"
                        className={`ep-check ${watchedEpisodes.has(ep.episode_number) ? 'watched' : ''}`}
                        onClick={(e) => toggleWatched(e, ep.episode_number)}
                        aria-label={watchedEpisodes.has(ep.episode_number) ? 'Mark as unwatched' : 'Mark as watched'}
                      >
                        <CheckIcon size={14} />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="latest-reviews">
            <div className="reviews-section-head">
              <h2>Reviews</h2>
              <button className="see-all-reviews" onClick={() => navigate(`/show/${id}/reviews`)}>
                See all <ChevronRightIcon size={14} />
              </button>
            </div>
            {reviews.length === 0 ? (
              <p className="no-reviews">No reviews yet. Be the first!</p>
            ) : (
              <>
                <div className="review-list">
                  {reviews.slice(0, 3).map((r) => (
                    <div key={r._id} className="review-row">
                      <div className="review-row-top">
                        <CommentAuthor user={r.createdBy} deleted={!r.createdBy} />
                        <Stars value={r.rating} />
                      </div>
                      <p className="review-text">{r.text}</p>
                    </div>
                  ))}
                </div>
                {reviews.length > 3 && (
                  <button className="see-all-reviews-btn" onClick={() => navigate(`/show/${id}/reviews`)}>
                    See all {reviews.length} reviews
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {showAddToList && show && (
        <AddToListModal show={show} onClose={() => setShowAddToList(false)} />
      )}

      {favError && <Toast message={favError} onClose={() => setFavError('')} />}

      {showRateModal && (
        <RatePopup
          showId={id}
          reviewId={myReviewId}
          initialRating={myRating}
          initialText={myReviewText}
          onClose={() => setShowRateModal(false)}
          onRated={(review) => {
            setMyRating(review.rating);
            setMyReviewText(review.text || '');
            setMyReviewId(review._id);
            setReviews((rs) => {
              const withoutMine = rs.filter((r) => r._id !== review._id);
              return [review, ...withoutMine];
            });
          }}
          onDeleted={() => {
            setMyRating(null);
            setReviews((rs) => rs.filter((r) => r._id !== myReviewId));
            setMyReviewId(null);
          }}
        />
      )}
      <AdBox className="page-ad" />
    </div>
  );
}
