import { useState } from 'react';
import { showsAPI } from '../services/api';
import Header from '../components/Header';
import './SearchPage.css';

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
        {show.first_air_date && (
          <span className="show-year">{show.first_air_date.slice(0, 4)}</span>
        )}
        {show.vote_average > 0 && (
          <span className="show-rating">★ {show.vote_average.toFixed(1)}</span>
        )}
        <p className="show-overview">{show.overview || 'No description available.'}</p>
      </div>
    </article>
  );
}

function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

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
        <h1>Search Shows</h1>

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

        {error && <p className="search-error">{error}</p>}

        {!loading && searched && results.length === 0 && !error && (
          <p className="search-empty">No results found for "{query}".</p>
        )}

        <div className="results-grid">
          {results.map((show) => (
            <ShowCard key={show.id} show={show} />
          ))}
        </div>
      </main>
    </div>
  );
}

export default SearchPage;