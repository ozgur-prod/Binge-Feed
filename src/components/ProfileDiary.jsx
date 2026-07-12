import DiaryEntries from './DiaryEntries';

const DIARY_PREVIEW = 4; // max # of entries directly shown on the profile before "View all"

export default function ProfileDiary({ blocks, total, showCount, hasMore, editable, onLog, onManageAll, onViewAll }) {
  return (
    <section className="profile-section">
      <div className="section-head">
        <h2>Diary</h2>
        {editable && (
          <div className="section-head-btns">
            {blocks.length > 0 && (
              <button className="pill-btn pill-btn-small" onClick={onManageAll}>
                Edit
              </button>
            )}
            <button className="pill-btn pill-btn-small" onClick={onLog}>
              Log
            </button>
          </div>
        )}
      </div>
      <div className="diary">
        {blocks.length === 0 ? (
          editable ? (
            <button className="diary-cta" onClick={onLog}>
              + Log your first episode
            </button>
          ) : (
            <p className="diary-empty">No episodes logged yet.</p>
          )
        ) : (
          <>
            <DiaryEntries blocks={blocks.slice(0, DIARY_PREVIEW)} />
            {(blocks.length > DIARY_PREVIEW || hasMore) && (
              <button className="diary-view-all" onClick={onViewAll}>
                View all ({total} episode{total === 1 ? '' : 's'} across {showCount} show
                {showCount === 1 ? '' : 's'})
              </button>
            )}
          </>
        )}
      </div>
    </section>
  );
}
