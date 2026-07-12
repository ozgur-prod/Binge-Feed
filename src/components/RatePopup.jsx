import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { reviewsAPI } from '../services/api';
import { StarIcon, StarHalfIcon, XIcon, CheckIcon } from './icons';
import './ForgotPasswordModal.css';
import './RatePopup.css';

export default function RatePopup({ showId, season, episode, reviewId, initialRating, initialText, onClose, onRated, onDeleted }) {
  const isEpisode = season != null && episode != null;

  const [rating, setRating] = useState(initialRating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState(initialText || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  async function handleSubmit() {
    if (!rating) return setError('Pick a star rating first.');
    setError('');
    setLoading(true);
    try {
      const { review } = await reviewsAPI.create(
        isEpisode
          ? { showId, season, episode, rating }
          : { showId, rating, ...(text.trim() ? { text: text.trim() } : {}) }
      );
      onRated(review);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    setConfirmingDelete(false);
    setError('');
    setDeleting(true);
    try {
      await reviewsAPI.remove(reviewId);
      onDeleted();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  }

  const displayValue = hoverRating || rating;
  const mouseDownOnOverlay = useRef(false);

  function getHalf(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    return (e.clientX - rect.left) < rect.width / 2 ? 'left' : 'right';
  }

  function starIcon(n) {
    const full = n * 2;
    const half = n * 2 - 1;
    if (displayValue >= full) return <StarIcon size={32} fill="currentColor" />;
    if (displayValue === half) return <StarHalfIcon size={32} />;
    return <StarIcon size={32} fill="none" />;
  }

  return createPortal(
    <div
      className="modal-overlay"
      onMouseDown={(e) => { mouseDownOnOverlay.current = e.target === e.currentTarget; }}
      onClick={() => { if (mouseDownOnOverlay.current) onClose(); }}
    >
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><XIcon /></button>
        <h2 className="modal-title">
          {isEpisode
            ? (reviewId ? 'Update episode rating' : 'Rate this episode')
            : (reviewId ? 'Update rating & review' : 'Rate & Review')}
        </h2>

        <div>
          <div className="star-picker" onMouseLeave={() => setHoverRating(0)}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                className="star-picker-btn"
                onMouseMove={(e) => setHoverRating(getHalf(e) === 'left' ? n * 2 - 1 : n * 2)}
                onClick={(e) => setRating(getHalf(e) === 'left' ? n * 2 - 1 : n * 2)}
                aria-label={`Rate ${n} star${n === 1 ? '' : 's'}`}
              >
                {starIcon(n)}
              </button>
            ))}
          </div>

          {!isEpisode && (
            <div className="modal-field">
              <label htmlFor="review-text">Review <span style={{ color: '#666', fontWeight: 400 }}>(optional)</span>:</label>
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
            type="button"
            onClick={handleSubmit}
            disabled={loading || deleting || !rating}
          >
            {loading ? 'Saving…' : reviewId ? 'Update' : 'Submit'}
          </button>

          {reviewId && (
            confirmingDelete ? (
              <div className="delete-rating-confirm">
                <span className="delete-rating-confirm-text">Delete rating?</span>
                <button type="button" className="delete-rating-yes" onClick={handleDelete} disabled={deleting}>
                  <CheckIcon size={14} />
                </button>
                <button type="button" className="delete-rating-no" onClick={() => setConfirmingDelete(false)}>
                  <XIcon size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="delete-rating-btn"
                onClick={() => setConfirmingDelete(true)}
                disabled={loading || deleting}
              >
                {deleting ? 'Deleting…' : 'Delete Rating'}
              </button>
            )
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
