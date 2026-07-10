import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import './WeeklyFixPage.css';

const BASE_URL = 'http://localhost:8080/api';
const POSTER_BASE = 'https://image.tmdb.org/t/p/w300';

export default function WeeklyFixPage() {
  const navigate = useNavigate();
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');

    if (!token) { navigate('/login'); return; }
    if (user.tier !== 'premium') { navigate('/premium'); return; }

    fetch(`${BASE_URL}/premium/weekly-fix`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.shows) setShows(data.shows);
        else setError(data.message || 'Failed to load.');
      })
      .catch(() => setError('Failed to load weekly fix.'))
      .finally(() => setLoading(false));
  }, [navigate]);

  return (
    <div className="weekly-fix-page">
      <Header active="home" />

      <main className="weekly-fix-main">
        <button className="weekly-fix-back" onClick={() => navigate('/profile')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to Profile
        </button>

        <div className="weekly-fix-header">
          <span className="weekly-fix-badge">PREMIUM</span>
          <h1 className="weekly-fix-title">Your Weekly Fix</h1>
          <p className="weekly-fix-subtitle">Handpicked by experts, for you.</p>
        </div>

        {loading && <p className="weekly-fix-loading">Loading your weekly fix…</p>}
        {error && <p className="weekly-fix-error">{error}</p>}

        {!loading && !error && (
          <div className="weekly-fix-list">
            {shows.map((show, index) => (
              <div
                key={show.id}
                className="weekly-fix-card"
                onClick={() => navigate(`/show/${show.id}`)}
              >
                <span className="weekly-fix-rank">#{index + 1}</span>
                {show.poster_path ? (
                  <img
                    className="weekly-fix-poster"
                    src={`${POSTER_BASE}${show.poster_path}`}
                    alt={show.name}
                  />
                ) : (
                  <div className="weekly-fix-poster weekly-fix-poster--placeholder" />
                )}
                <div className="weekly-fix-info">
                  <h2 className="weekly-fix-show-title">{show.name}</h2>
                  {show.overview && (
                    <p className="weekly-fix-overview">{show.overview}</p>
                  )}
                  {show.vote_average > 0 && (
                    <span className="weekly-fix-rating">★ {show.vote_average.toFixed(1)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
