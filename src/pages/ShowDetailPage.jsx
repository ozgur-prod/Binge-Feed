import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { showsAPI } from '../services/api';
import './ShowDetailPage.css';

const POSTER_BASE = 'https://image.tmdb.org/t/p/w342';
const BACKDROP_BASE = 'https://image.tmdb.org/t/p/w1280';

const PROVIDER_URLS = {
  2:    'https://tv.apple.com',
  3:    'https://play.google.com/store/movies',
  7:    'https://www.vudu.com',
  8:    'https://www.netflix.com',
  9:    'https://www.amazon.de/gp/video/storefront',
  10:   'https://www.amazon.de/gp/video/storefront',
  11:   'https://mubi.com',
  15:   'https://www.hulu.com',
  20:   'https://www.joyn.de',
  29:   'https://www.skygo.sky.de',
  30:   'https://www.wowtv.de',
  39:   'https://www.nowtv.com',
  40:   'https://www.chili.com',
  67:   'https://www.sky.de',
  119:  'https://www.amazon.de/gp/video/storefront',
  130:  'https://store.sky.com',
  170:  'https://www.sky.de',
  178:  'https://www.magenta.de/tv',
  188:  'https://www.youtube.com/premium',
  223:  'https://www.ardmediathek.de',
  246:  'https://www.zdf.de',
  283:  'https://www.crunchyroll.com',
  337:  'https://www.disneyplus.com',
  339:  'https://www.movistarplus.es',
  350:  'https://tv.apple.com',
  384:  'https://www.max.com',
  386:  'https://www.peacocktv.com',
  387:  'https://www.peacocktv.com',
  531:  'https://www.paramountplus.com',
  680:  'https://www.joyn.de',
  695:  'https://www.magenta.de/tv',
  1773: 'https://www.wowtv.de',
  1825: 'https://www.amazon.de/gp/video/storefront',
  1899: 'https://www.max.com',
  1993: 'https://www.videoload.de',
  2660: 'https://www.amazon.de/gp/video/storefront',
};

function Stars({ value, max = 5 }) {
  const filled = Math.round((value / 10) * max);
  return (
    <span className="stars">
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < filled ? 'star filled' : 'star'}>★</span>
      ))}
      <span className="rating-num">{((value / 10) * 5).toFixed(1)}</span>
    </span>
  );
}

export default function ShowDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [show, setShow] = useState(null);
  const [seasons, setSeasons] = useState([]);
  const [activeSeason, setActiveSeason] = useState(1);
  const [episodes, setEpisodes] = useState([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);
  const [watchProviders, setWatchProviders] = useState([]);
  const [watchLink, setWatchLink] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    showsAPI.getDetails(id)
      .then((data) => {
        setShow(data);
        const realSeasons = (data.seasons || []).filter((s) => s.season_number > 0);
        setSeasons(realSeasons);
        if (realSeasons.length > 0) setActiveSeason(realSeasons[0].season_number);
      })
      .catch(() => setError('Failed to load show details.'));

    showsAPI.getWatchProviders(id)
      .then((data) => {
        const providers = data.flatrate || data.buy || data.ads || [];
        setWatchProviders(providers);
        if (data.link) setWatchLink(data.link);
      })
      .catch(() => {});
  }, [id]);

  useEffect(() => {
    if (!activeSeason) return;
    setLoadingEpisodes(true);
    showsAPI.getSeason(id, activeSeason)
      .then((data) => setEpisodes(data.episodes || []))
      .catch(() => setEpisodes([]))
      .finally(() => setLoadingEpisodes(false));
  }, [id, activeSeason]);

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
                  {watchProviders.map((p) => {
                    const url = PROVIDER_URLS[p.provider_id];
                    const logo = (
                      <img
                        className="provider-logo"
                        src={`https://image.tmdb.org/t/p/original${p.logo_path}`}
                        alt={p.provider_name}
                        title={p.provider_name}
                      />
                    );
                    return url ? (
                      <a key={p.provider_id} href={url} target="_blank" rel="noopener noreferrer">
                        {logo}
                      </a>
                    ) : (
                      <span key={p.provider_id}>{logo}</span>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="detail-actions">
              <button className="action-btn primary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add to List
              </button>
              <button className="action-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                Favourite
              </button>
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
                  <div key={ep.id} className="episode-row">
                    <span className="ep-number">{ep.episode_number}. {ep.name}</span>
                    {ep.vote_average > 0 && (
                      <span className="ep-rating">
                        ★ {((ep.vote_average / 10) * 5).toFixed(1)}
                      </span>
                    )}
                    <span className="ep-check">✓</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="latest-reviews">
            <h2>Latest Reviews</h2>
            <p className="no-reviews">No reviews yet. Be the first!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
