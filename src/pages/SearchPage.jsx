import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { showsAPI } from '../services/api';
import Header from '../components/Header';
import './SearchPage.css';

// Poster card with year/platform/rating shown for popular, search, and advanced results
function ShowCard({ show }) {
  const navigate = useNavigate();
  const posterUrl = show.poster_path
    ? `https://image.tmdb.org/t/p/w300${show.poster_path}`
    : null;

  return (
    <article className="show-card clickable" onClick={() => navigate(`/show/${show.id}`)}>
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

// TMDB genre ids for TV. There is no Thriller genre for TV, Mystery is the closest.
const GENRES = [
  { id: 18, label: 'Drama' },
  { id: 35, label: 'Comedy' },
  { id: 10765, label: 'Sci-Fi & Fantasy' },
  { id: 9648, label: 'Mystery' },
  { id: 80, label: 'Crime' },
  { id: 10759, label: 'Action & Adventure' },
  { id: 16, label: 'Animation' },
  { id: 99, label: 'Documentary' },
  { id: 10751, label: 'Family' },
  { id: 10764, label: 'Reality' },
  { id: 10768, label: 'War & Politics' },
].sort((a, b) => a.label.localeCompare(b.label));

// Platform keys, the backend maps these to DE provider ids.
const PLATFORMS = [
  { key: 'netflix', label: 'Netflix' },
  { key: 'hbo', label: 'HBO' },
  { key: 'appletv+', label: 'Apple TV+' },
  { key: 'prime', label: 'Prime' },
  { key: 'disney+', label: 'Disney+' },
].sort((a, b) => a.label.localeCompare(b.label));

const MIN_RATINGS = [6, 7, 8, 9];

const SORTS = [
  { value: 'popularity', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'newest', label: 'Newest' },
];

const YEARS = [];
for (let y = new Date().getFullYear(); y >= 1980; y--) YEARS.push(y);

function AdvancedSearch() {
  const [title, setTitle] = useState('');
  const [genres, setGenres] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');
  const [minRating, setMinRating] = useState(null);
  const [sortBy, setSortBy] = useState('popularity');
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const titleMode = title.trim().length > 0;
  const hasFilters = genres.length || platforms.length || yearFrom || yearTo || minRating;

  function toggle(list, setList, id) {
    setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  }

  useEffect(() => {
    const filters = { sortBy };
    if (title.trim()) filters.q = title.trim();
    if (genres.length) filters.genres = genres.join('|');
    if (platforms.length && !titleMode) filters.platforms = platforms.join(',');
    if (yearFrom) filters.yearFrom = yearFrom;
    if (yearTo) filters.yearTo = yearTo;
    if (minRating) filters.minRating = minRating;

    let stale = false;
    setLoading(true);
    setError(null);
    // Debounce so typing a title fires one request, not one per keystroke.
    const timer = setTimeout(() => {
      showsAPI
        .discover(filters)
        .then((data) => {
          if (stale) return;
          setResults(data.results);
          setTotal(data.total_results);
        })
        .catch((err) => {
          if (!stale) setError(err.message);
        })
        .finally(() => {
          if (!stale) setLoading(false);
        });
    }, 350);
    // Ignore responses of outdated requests, quick filter clicks can answer out of order.
    return () => {
      stale = true;
      clearTimeout(timer);
    };
  }, [title, genres, platforms, yearFrom, yearTo, minRating, sortBy]);

  return (
    <div className="advanced-layout">
      <aside className="filter-sidebar">
        <h1 className="browse-title">Browse by <span className="title-accent">everything.</span></h1>
        <p className="browse-subtitle">Narrow by genre, platform, year, or rating.</p>

        <div className="filter-group">
          <h3>Title</h3>
          <input
            className="title-filter"
            type="text"
            placeholder="Search within filters…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <h3>Genre</h3>
          <div className="chip-row">
            {GENRES.map((g) => (
              <button
                key={g.id}
                className={`chip ${genres.includes(g.id) ? 'active' : ''}`}
                onClick={() => toggle(genres, setGenres, g.id)}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <h3>Platform</h3>
          <div className="chip-row">
            {PLATFORMS.map((p) => (
              <button
                key={p.key}
                className={`chip ${platforms.includes(p.key) && !titleMode ? 'active' : ''}`}
                disabled={titleMode}
                onClick={() => toggle(platforms, setPlatforms, p.key)}
              >
                {p.label}
              </button>
            ))}
          </div>
          {titleMode && <p className="filter-hint">Not available for title search.</p>}
        </div>

        <div className="filter-group">
          <h3>Year</h3>
          <div className="year-row">
            <select value={yearFrom} onChange={(e) => setYearFrom(e.target.value)}>
              <option value="">Any</option>
              {YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <span className="year-to">to</span>
            <select value={yearTo} onChange={(e) => setYearTo(e.target.value)}>
              <option value="">Any</option>
              {YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="filter-group">
          <h3>Minimum Rating</h3>
          <div className="chip-row">
            <button
              className={`chip ${minRating === null ? 'active' : ''}`}
              onClick={() => setMinRating(null)}
            >
              Any
            </button>
            {MIN_RATINGS.map((r) => (
              <button
                key={r}
                className={`chip ${minRating === r ? 'active' : ''}`}
                onClick={() => setMinRating(r)}
              >
                ★{r}+
              </button>
            ))}
          </div>
        </div>
      </aside>

      <section className="advanced-results">
        <div className="results-head">
          {/* at rest the count reads like a catalog total, so only show it once a filter narrows things */}
          <p className="results-count">
            {loading ? (
              'Loading…'
            ) : titleMode ? (
              `Top matches for "${title.trim()}"`
            ) : hasFilters ? (
              `${total.toLocaleString()} shows`
            ) : (
              <>Popular <span className="hint-accent">right now</span></>
            )}
          </p>
          <label className="sort-label">
            Sort by:
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </label>
        </div>

        {error && <p className="search-error">{error}</p>}
        {!loading && !error && results.length === 0 && (
          <p className="search-empty">No shows match these filters.</p>
        )}

        <div className="results-grid">
          {results.map((show) => (
            <ShowCard key={show.id} show={show} />
          ))}
        </div>
      </section>
    </div>
  );
}

function SearchPage() {
  const [activeTab, setActiveTab] = useState('search');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  const [popular, setPopular] = useState([]);
  const [popularLoading, setPopularLoading] = useState(true);

  // default grid content before a search is run
  useEffect(() => {
    showsAPI.getPopular()
      .then((data) => setPopular(data.results || []))
      .catch((err) => setError(err.message))
      .finally(() => setPopularLoading(false));
  }, []);

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

        {activeTab === 'advanced' && <AdvancedSearch />}
      </main>
    </div>
  );
}

export default SearchPage;
