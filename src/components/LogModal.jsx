import { useEffect, useState } from 'react';
import { showsAPI, progressAPI } from '../services/api';
import { XIcon } from './icons';
import './ForgotPasswordModal.css';
import './FavoritesModal.css';
import './LogModal.css';

const POSTER_W92 = 'https://image.tmdb.org/t/p/w92';
const today = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
// noon avoids a day shift across timezones. today is sent as now so it isn't "future"
const watchedAtFor = (dateStr) =>
  (dateStr === today() ? new Date() : new Date(`${dateStr}T12:00:00`)).toISOString();
const keyOf = (p) => `${p.showId}-${p.season}-${p.episode}`;

// Log watched episodes (one or many via a pool), or edit an existing diary entry (when `initial` is passed).
export default function LogModal({ initial, onClose, onSaved }) {
  const editing = !!initial;
  const [query, setQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loadedSearchQuery, setLoadedSearchQuery] = useState(null);
  const searching = !!searchQuery && searchQuery !== loadedSearchQuery;
  const [show, setShow] = useState(initial ? { id: initial.showId, name: initial.showName } : null);
  const [seasons, setSeasons] = useState([]);
  const [season, setSeason] = useState(initial ? initial.season : '');
  const [episodes, setEpisodes] = useState([]);
  const [episode, setEpisode] = useState(initial ? initial.episode : ''); // edit mode: single
  const [pool, setPool] = useState([]); // log mode: many
  const [date, setDate] = useState(initial ? initial.dateISO : today());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // `results` is only ever rendered while searchQuery is set, so there's nothing to reset when it's cleared
  // (pickShow already clears results itself when it clears searchQuery).
  useEffect(() => {
    if (!searchQuery) return;
    let stale = false;
    showsAPI.search(searchQuery)
      .then((d) => { if (!stale) setResults((d.results || []).slice(0, 8)); })
      .catch(() => { if (!stale) setResults([]); })
      .finally(() => { if (!stale) setLoadedSearchQuery(searchQuery); });
    return () => { stale = true; };
  }, [searchQuery]);

  // `seasons` is only ever rendered while `show` is set, so there's nothing to reset otherwise.
  useEffect(() => {
    if (!show) return;
    showsAPI.getDetails(show.id)
      .then((d) => setSeasons((d.seasons || []).filter((s) => s.season_number > 0)))
      .catch(() => setSeasons([]));
  }, [show]);

  // `episodes` is only ever rendered while `show` and `season` are set, so there's nothing to reset otherwise.
  useEffect(() => {
    if (!show || season === '') return;
    showsAPI.getSeason(show.id, season)
      .then((d) => setEpisodes(d.episodes || []))
      .catch(() => setEpisodes([]));
  }, [show, season]);

  function pickShow(r) {
    setShow({ id: r.id, name: r.name });
    setSeason('');
    setEpisode('');
    setPool([]); // the pool is for one show at a time
    setQuery('');
    setSearchQuery('');
    setResults([]);
  }

  function togglePool(epNumber) {
    const item = { showId: show.id, showName: show.name, season: Number(season), episode: epNumber };
    setPool((prev) =>
      prev.some((p) => keyOf(p) === keyOf(item)) ? prev.filter((p) => keyOf(p) !== keyOf(item)) : [...prev, item]
    );
  }

  const inPool = (epNumber) =>
    pool.some((p) => p.showId === show?.id && p.season === Number(season) && p.episode === epNumber);

  const seasonAllInPool = episodes.length > 0 && episodes.every((ep) => inPool(ep.episode_number));

  function toggleSeasonAll() {
    if (seasonAllInPool) {
      setPool((prev) => prev.filter((p) => !(p.showId === show.id && p.season === Number(season))));
    } else {
      setPool((prev) => {
        const existing = new Set(prev.map(keyOf));
        const additions = episodes
          .map((ep) => ({ showId: show.id, showName: show.name, season: Number(season), episode: ep.episode_number }))
          .filter((item) => !existing.has(keyOf(item)));
        return [...prev, ...additions];
      });
    }
  }

  async function submit() {
    if (date > today()) { setError("You can't log a date in the future."); return; }
    const watchedAt = watchedAtFor(date);

    if (editing) {
      if (!show || season === '' || episode === '') { setError('Pick a show, season and episode.'); return; }
    } else if (pool.length === 0) {
      setError('Add at least one episode.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      if (editing) {
        await progressAPI.update({
          current: { showId: initial.showId, season: initial.season, episode: initial.episode },
          next: { showId: show.id, season: Number(season), episode: Number(episode), watchedAt },
        });
      } else {
        for (const p of pool) {
          await progressAPI.mark({ showId: p.showId, season: p.season, episode: p.episode, watchedAt });
        }
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal favorites-modal log-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><XIcon /></button>
        <h2 className="modal-title">{editing ? 'Edit entry' : 'Log episodes'}</h2>

        <div className="log-body">
          <div className="log-field">
            <span className="log-label">Show</span>
            {show ? (
              <div className="log-chosen">
                <span>{show.name}</span>
                {!editing && (
                  <button className="log-change" onClick={() => { setShow(null); setSeason(''); setPool([]); }}>change</button>
                )}
              </div>
            ) : (
              <>
                <input
                  className="favorites-search"
                  placeholder="Search a show, then press Enter…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && setSearchQuery(query.trim())}
                />
                {searching && <p className="favorites-modal-status">Searching…</p>}
                {results.length > 0 && (
                  <ul className="log-results">
                    {results.map((r) => (
                      <li key={r.id}>
                        <button className="log-result" onClick={() => pickShow(r)}>
                          {r.poster_path
                            ? <img src={`${POSTER_W92}${r.poster_path}`} alt="" />
                            : <span className="log-result-noimg" />}
                          <span>{r.name}{r.first_air_date ? ` (${r.first_air_date.slice(0, 4)})` : ''}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>

          {show && (
            <div className="log-field">
              <span className="log-label">Season</span>
              <select
                className="log-select"
                value={season}
                onChange={(e) => { setSeason(Number(e.target.value)); setEpisode(''); }}
              >
                <option value="">–</option>
                {seasons.map((s) => (
                  <option key={s.season_number} value={s.season_number}>Season {s.season_number}</option>
                ))}
              </select>
            </div>
          )}

          {/* edit mode: single episode dropdown. log mode: click episodes into the pool */}
          {show && season !== '' && (
            editing ? (
              <div className="log-field">
                <span className="log-label">Episode</span>
                <select className="log-select" value={episode} onChange={(e) => setEpisode(Number(e.target.value))}>
                  <option value="">–</option>
                  {episodes.map((ep) => (
                    <option key={ep.id} value={ep.episode_number}>E{ep.episode_number}. {ep.name}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="log-field">
                <div className="log-eps-head">
                  <span className="log-label">Episodes (click to add)</span>
                  {episodes.length > 0 && (
                    <button className="log-selectall" onClick={toggleSeasonAll}>
                      {seasonAllInPool ? 'Deselect all' : 'Select all'}
                    </button>
                  )}
                </div>
                <div className="log-episodes">
                  {episodes.map((ep) => (
                    <button
                      key={ep.id}
                      className={`log-ep${inPool(ep.episode_number) ? ' selected' : ''}`}
                      title={ep.name}
                      onClick={() => togglePool(ep.episode_number)}
                    >
                      E{ep.episode_number}
                    </button>
                  ))}
                </div>
              </div>
            )
          )}

          {!editing && pool.length > 0 && (
            <div className="log-field">
              <span className="log-label">Selected ({pool.length})</span>
              <div className="log-pool">
                {pool.map((p) => (
                  <span className="log-pool-chip" key={keyOf(p)}>
                    S{p.season}E{p.episode}
                    <button className="log-pool-x" onClick={() => setPool((prev) => prev.filter((x) => keyOf(x) !== keyOf(p)))}><XIcon size={12} /></button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="log-field">
            <span className="log-label">Watched on</span>
            <input className="log-select log-date" type="date" max={today()} value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          {error && <p className="favorites-modal-status favorites-modal-error">{error}</p>}
        </div>

        <button className="log-submit" onClick={submit} disabled={saving}>
          {saving
            ? 'Saving…'
            : editing
              ? 'Save changes'
              : `Log ${pool.length || ''} episode${pool.length === 1 ? '' : 's'}`.replace('  ', ' ')}
        </button>
      </div>
    </div>
  );
}
