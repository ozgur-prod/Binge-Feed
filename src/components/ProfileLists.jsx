const LIST_THUMBS_PREVIEW = 3;
const LISTS_PREVIEW = 5;

// every card and tile opens the same ListsModal, so onManage handles all of them
export default function ProfileLists({ lists, editable, onManage }) {
  return (
    <div className="lists-section">
      <div className="section-head">
        <h2>Lists</h2>
        {editable && (
          <button className="pill-btn pill-btn-small" onClick={onManage}>
            {lists.length === 0 ? 'Create' : 'Edit'}
          </button>
        )}
      </div>
      {lists.length === 0 ? (
        editable ? (
          <button className="lists-empty" onClick={onManage}>
            + Create your first list
          </button>
        ) : (
          <p className="diary-empty">No lists yet.</p>
        )
      ) : (
        <div className="lists-grid">
          {lists.slice(0, LISTS_PREVIEW).map((list) => (
            <button className="list-card" key={list.id} onClick={onManage}>
              <div className="list-card-posters">
                {list.shows.length === 0 ? (
                  <span className="list-card-empty">Empty</span>
                ) : (
                  list.shows.slice(0, LIST_THUMBS_PREVIEW).map((show) => (
                    <img key={show.showId} src={show.posterUrl} alt={show.showName} title={show.showName} />
                  ))
                )}
              </div>
              <p className="list-card-name">{list.title}</p>
              <p className="list-card-count">
                {list.showCount} {list.showCount === 1 ? 'show' : 'shows'}
              </p>
            </button>
          ))}
          {lists.length > LISTS_PREVIEW && (
            <button className="list-card-more" onClick={onManage}>
              <span className="list-card-more-count">+{lists.length - LISTS_PREVIEW}</span>
              <span className="list-card-more-title">View all</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
