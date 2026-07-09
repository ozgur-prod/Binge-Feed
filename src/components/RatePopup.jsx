import { useState } from 'react';
import { reviewsAPI } from '../services/api';
import { StarIcon } from './icons';
import './ForgotPasswordModal.css';
import './RatePopup.css';

// season/episode both set = episode review (rating-only, backend forbids text).
// season/episode omitted = show review (text required).
export default function RatePopup({ showId, season, episode, onClose, onRated }) {
  const isEpisode = season != null && episode != null;

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!rating) return setError('Pick a star rating first.');
    if (!isEpisode && !text.trim()) return setError('Write a short review.');
    setError('');
    setLoading(true);
    try {
      await reviewsAPI.create(
        isEpisode
          ? { showId, season, episode, rating }
          : { showId, rating, text: text.trim() }
      );
      onRated(rating);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const displayValue = hoverRating || rating;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2 className="modal-title">{isEpisode ? 'Rate this episode' : 'Rate this show'}</h2>

        <form onSubmit={handleSubmit}>
          <div className="star-picker" onMouseLeave={() => setHoverRating(0)}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                className="star-picker-btn"
                onMouseEnter={() => setHoverRating(n * 2)}
                onClick={() => setRating(n * 2)}
                aria-label={`Rate ${n} star${n === 1 ? '' : 's'}`}
              >
                <StarIcon size={32} fill={displayValue >= n * 2 ? 'currentColor' : 'none'} />
              </button>
            ))}
          </div>

          {!isEpisode && (
            <div className="modal-field">
              <label htmlFor="review-text">Review:</label>
              <textarea
                id="review-text"
                rows={4}
                maxLength={2000}
                placeholder="Share your thoughts on the show..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>
          )}

          {error && <p className="modal-error">{error}</p>}

          <button
            className="modal-btn"
            type="submit"
            disabled={loading || !rating || (!isEpisode && !text.trim())}
          >
            {loading ? 'Saving…' : 'Submit Rating'}
          </button>
        </form>
      </div>
    </div>
  );
}
