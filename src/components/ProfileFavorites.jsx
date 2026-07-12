import { useNavigate } from 'react-router-dom';

export default function ProfileFavorites({ favorites, editable, onManage }) {
  const navigate = useNavigate();

  return (
    <section className="profile-section">
      <div className="section-head">
        <h2>Favorite Series</h2>
        {editable && (
          <button className="pill-btn pill-btn-small" onClick={onManage}>
            {favorites.length === 0 ? 'Add' : 'Edit'}
          </button>
        )}
      </div>
      {favorites.length === 0 ? (
        editable ? (
          <button className="favorites-cta favorites-cta-empty" onClick={onManage}>
            + Add shows to your favorites
          </button>
        ) : (
          <p className="diary-empty">No favorite series yet.</p>
        )
      ) : (
        <div className="favorites-row">
          {favorites.map((fav) => (
            <div className="favorite-tile" key={fav.showId}>
              <img
                className="favorite-poster clickable"
                src={fav.posterUrl}
                alt={fav.showName}
                title={fav.showName}
                onClick={() => navigate(`/show/${fav.showId}`)}
              />
              <span className="favorite-tile-name">{fav.showName}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
