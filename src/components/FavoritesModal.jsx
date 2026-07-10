import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { showsAPI } from '../services/api';
import './ForgotPasswordModal.css';
import './FavoritesModal.css';

const POSTER_W154 = 'https://image.tmdb.org/t/p/w154';

export default function FavoritesModal({ favorites, onAdd, onRemove, onClose }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const searching = searchQuery.length > 0;
  const existingIds = favorites.map((f) => f.showId);

  useEffect(() => {
    if (!searching) {
      setResults([]);
      return;
    }
    let stale = false;
    setLoading(true);
    showsAPI
      .search(searchQuery)
      .then((d) => { if (!stale) setResults((d.results || []).slice(0, 12)); })
      .catch(() => { if (!stale) setResults([]); })
      .finally(() => { if (!stale) setLoading(false); });
    return () => { stale = true; };
  }, [searchQuery, searching]);

  function onQueryChange(e) {
    const value = e.target.value;
    setQuery(value);
    if (!value.trim()) setSearchQuery(''); // clearing the box returns to the favorites view
  }

  function runSearch(e) {
    if (e.key === 'Enter') setSearchQuery(query.trim());
  }

  async function add(show) {
    try {
      await onAdd(show);
    } catch (err) {
      setError(err.message);
    }
  }

  function openShow(showId) {
    onClose();
    navigate(`/show/${showId}`);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal favorites-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2 className="modal-title">Favorite Series</h2>

        <input
          className="favorites-search"
          type="text"
          placeholder="Search a show, then press Enter…"
          value={query}
          onChange={onQueryChange}
          onKeyDown={runSearch}
        />
        {error && <p className="favorites-modal-status favorites-modal-error">{error}</p>}

        <div className="favorites-modal-body">
        {searching ? (
          loading ? (
            <p className="favorites-modal-status">Searching…</p>
          ) : results.length === 0 ? (
            <p className="favorites-modal-status">No shows found.</p>
          ) : (
            <div className="favorites-modal-grid">
              {results.map((show) => {
                const already = existingIds.includes(show.id);
                return (
                  <button
                    key={show.id}
                    className="favorites-add-item"
                    disabled={already}
                    title={already ? 'Already a favorite' : show.name}
                    onClick={() => add(show)}
                  >
                    {show.poster_path ? (
                      <img src={`${POSTER_W154}${show.poster_path}`} alt={show.name} />
                    ) : (
                      <div className="favorites-noimg">No image</div>
                    )}
                    {already && <span className="favorites-add-check">✓</span>}
                    <span className="favorites-item-name">{show.name}</span>
                  </button>
                );
              })}
            </div>
          )
        ) : favorites.length === 0 ? (
          <p className="favorites-modal-status">No favorites yet — search above to add some.</p>
        ) : (
          <div className="favorites-modal-grid">
            {favorites.map((fav) => (
              <div className="favorites-modal-item" key={fav.showId}>
                <img
                  src={fav.posterUrl}
                  alt={fav.showName}
                  title={fav.showName}
                  onClick={() => openShow(fav.showId)}
                />
                <button
                  className="favorites-modal-remove"
                  title="Remove favorite"
                  onClick={() => onRemove(fav.showId)}
                >
                  ✕
                </button>
                <span className="favorites-item-name">{fav.showName}</span>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
