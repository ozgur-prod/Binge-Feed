import { useNavigate } from 'react-router-dom';
import './ForgotPasswordModal.css';
import './FavoritesModal.css';

export default function FavoritesModal({ favorites, onClose, onRemove }) {
  const navigate = useNavigate();

  function openShow(showId) {
    onClose();
    navigate(`/show/${showId}`);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal favorites-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2 className="modal-title">Favorite Series</h2>

        <div className="favorites-modal-grid">
          {favorites.map((fav) => (
            <div className="favorites-modal-item" key={fav.showId}>
              <img
                src={fav.posterUrl}
                alt={fav.showName}
                title={fav.showName}
                onClick={() => openShow(fav.showId)}
              />
              {onRemove && (
                <button
                  className="favorites-modal-remove"
                  title="Remove favorite"
                  onClick={() => onRemove(fav.showId)}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
