import { useEffect, useState } from 'react';
import { showsAPI } from '../services/api';
import Header from '../components/Header';
import './SearchPage.css';

// Poster card with year/platform/rating shown for popular, search, and advanced results
function ShowCard({ show }) {
  const posterUrl = show.poster_path
    ? `https://image.tmdb.org/t/p/w300${show.poster_path}`
    : null;

  return (
    <article className="show-card">
      <div className="show-poster">
        {posterUrl ? (
          <img src={posterUrl} alt={show.name} />
        ) : (
          <div className="show-poster-placeholder">No Image</div>
        )}
      </div>
      <div className="show-info">
        <h2>{show.name}</h2>
        <div className="show-meta">
          {show.first_air_date && (
            <span className="show-year">{show.first_air_date.slice(0, 4)}</span>
          )}
          {show.platforms?.map((platform) => (
            <span key={platform} className="show-platform">{platform}</span>
          ))}
          {show.vote_average > 0 && (
            <span className="show-rating">★ {show.vote_average.toFixed(1)}</span>
          )}
        </div>
      </div>
    </article>
  );
}

// TMDB IDs for query
const GENRES = [
  { id: 18, label: 'Drama' },
  { id: 35, label: 'Comedy' },
  { id: 10765, label: 'Sci-Fi' },
  { id: 9648, label: 'Thriller' },
  { id: 80, label: 'Crime' },
];

const PLATFORMS = [
  { key: 'netflix', label: 'Netflix' },
  { key: 'hbo', label: 'HBO' },
  { key: 'appletv+', label: 'Apple TV+' },
  { key: 'prime', label: 'Prime' },
  { key: 'disney+', label: 'Disney+' },
];

// left-side filter sidebar for the Advanced Search tab
function AdvancedFilters({ filters, onToggleGenre, onTogglePlatform, onChangeYearFrom, onChangeYearTo, onChangeRating, onApply }) {
  return (
    <aside className="filters-sidebar">
      <h3 className="filters-heading">Filters</h3>

      <div className="filter-group">
        <h4 className="filter-title">Genre</h4>
        <div className="filter-tags">
          {GENRES.map((g) => (
            <button
              key={g.id}
              type="button"
              className={`filter-tag ${filters.genres.includes(g.id) ? 'active' : ''}`}
              onClick={() => onToggleGenre(g.id)}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <h4 className="filter-title">Platform</h4>
        <div className="filter-tags">
          {PLATFORMS.map((p) => (
            <button
              key={p.key}
              type="button"
              className={`filter-tag ${filters.platforms.includes(p.key) ? 'active' : ''}`}
              onClick={() => onTogglePlatform(p.key)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <h4 className="filter-title">Year</h4>
        <div className="filter-year-range">
          <input
            className="filter-year-input"
            type="number"
            placeholder="From"
            value={filters.yearFrom}
            onChange={(e) => onChangeYearFrom(e.target.value)}
          />
          <span className="filter-year-sep">...</span>
          <input
            className="filter-year-input"
            type="number"
            placeholder="To"
            value={filters.yearTo}
            onChange={(e) => onChangeYearTo(e.target.value)}
          />
        </div>
      </div>

      <div className="filter-group">
        <h4 className="filter-title">Minimum Rating</h4>
        <div className="filter-rating">
          <input
            type="range"
            min="0"
            max="10"
            step="0.5"
            value={filters.rating}
            onChange={(e) => onChangeRating(e.target.value)}
          />
          <span className="filter-rating-value">★ {filters.rating}</span>
        </div>
      </div>

      <button type="button" className="filter-apply-btn" onClick={onApply}>
        Apply Filters
      </button>
    </aside>
  );
}

function SearchPage() {
  const [activeTab, setActiveTab] = useState('search');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  const [filters, setFilters] = useState({ genres: [], platforms: [], yearFrom: '', yearTo: '', rating: 0 });
  const [advancedResults, setAdvancedResults] = useState([]);
  const [advancedLoading, setAdvancedLoading] = useState(false);
  const [advancedSearched, setAdvancedSearched] = useState(false);

  const [popular, setPopular] = useState([]);
  const [popularLoading, setPopularLoading] = useState(true);

  // default grid content before a search/filter is run
  useEffect(() => {
    showsAPI.getPopular()
      .then((data) => setPopular(data.results || []))
      .catch((err) => setError(err.message))
      .finally(() => setPopularLoading(false));
  }, []);

  function toggleGenre(id) {
    setFilters((f) => ({
      ...f,
      genres: f.genres.includes(id) ? f.genres.filter((g) => g !== id) : [...f.genres, id],
    }));
  }

  function togglePlatform(name) {
    setFilters((f) => ({
      ...f,
      platforms: f.platforms.includes(name) ? f.platforms.filter((p) => p !== name) : [...f.platforms, name],
    }));
  }

  function changeYearFrom(yearFrom) {
    setFilters((f) => ({ ...f, yearFrom }));
  }

  function changeYearTo(yearTo) {
    setFilters((f) => ({ ...f, yearTo }));
  }

  function changeRating(rating) {
    setFilters((f) => ({ ...f, rating: Number(rating) }));
  }

  // sends selected filters to the backend /shows/discover endpoint
  async function applyFilters() {
    setAdvancedLoading(true);
    setAdvancedSearched(true);
    try {
      const data = await showsAPI.discover({
        genres: filters.genres,
        platforms: filters.platforms,
        yearFrom: filters.yearFrom,
        yearTo: filters.yearTo,
        minRating: filters.rating,
      });
      setAdvancedResults(data.results || []);
    } catch (err) {
      setError(err.message);
      setAdvancedResults([]);
    } finally {
      setAdvancedLoading(false);
    }
  }

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const data = await showsAPI.search(query.trim());
      setResults(data.results);
    } catch (err) {
      setError(err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="search-page">
      <Header active="search" />

      <main className="search-main">
        <div className="tab-bar">
          <button className={`tab ${activeTab === 'search' ? 'active' : ''}`} onClick={() => setActiveTab('search')}>Search</button>
          <button className={`tab ${activeTab === 'advanced' ? 'active' : ''}`} onClick={() => setActiveTab('advanced')}>Advanced Search</button>
        </div>

        {activeTab === 'search' && (
          <>
            <h1>Find <span className="title-accent">series</span></h1>

            <form className="search-form" onSubmit={handleSearch}>
              <input
                className="search-input"
                type="text"
                placeholder="Search for a TV show..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button className="search-btn" type="submit" disabled={loading}>
                {loading ? 'Searching…' : 'Search'}
              </button>
            </form>

            {!searched && <p className="search-hint">Popular <span className="hint-accent">right now</span></p>}

            {error && <p className="search-error">{error}</p>}

            {!loading && searched && results.length === 0 && !error && (
              <p className="search-empty">No results found for "{query}".</p>
            )}

            {!searched && popularLoading && <p className="search-hint">Loading…</p>}

            <div className="results-grid">
              {(searched ? results : popular).map((show) => (
                <ShowCard key={show.id} show={show} />
              ))}
            </div>
          </>
        )}

        {activeTab === 'advanced' && (
          <div className="advanced-search-layout">
            <AdvancedFilters
              filters={filters}
              onToggleGenre={toggleGenre}
              onTogglePlatform={togglePlatform}
              onChangeYearFrom={changeYearFrom}
              onChangeYearTo={changeYearTo}
              onChangeRating={changeRating}
              onApply={applyFilters}
            />

            <div className="advanced-results">
              {!advancedSearched && <p className="search-hint">Popular <span className="hint-accent">right now</span></p>}

              {(advancedLoading || (!advancedSearched && popularLoading)) && <p className="search-hint">Loading…</p>}

              {!advancedLoading && advancedSearched && advancedResults.length === 0 && (
                <p className="search-empty">No results match these filters.</p>
              )}

              <div className="results-grid">
                {(advancedSearched ? advancedResults : popular).map((show) => (
                  <ShowCard key={show.id} show={show} />
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default SearchPage;