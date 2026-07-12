import { useRef, useState } from 'react';
import DiaryEntries from './DiaryEntries';
import { XIcon } from './icons';
import './ForgotPasswordModal.css';
import './FavoritesModal.css';

export default function DiaryModal({ blocks, total, showCount, hasMore, loadingMore, onLoadMore, onEditEpisode, onDeleteEpisode, initialManage = false, canManage = true, onClose }) {
  const mouseDownOnOverlay = useRef(false);
  const [manage, setManage] = useState(initialManage);

  return (
    <div className="modal-overlay"
      onMouseDown={(e) => { mouseDownOnOverlay.current = e.target === e.currentTarget; }}
      onClick={() => { if (mouseDownOnOverlay.current) onClose(); }}
    >
      <div className="modal favorites-modal" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><XIcon /></button>
        <div className="diary-modal-head">
          <h2 className="modal-title">Diary</h2>
          {canManage && total > 0 && (
            <button className="pill-btn pill-btn-small" onClick={() => setManage((m) => !m)}>
              {manage ? 'Done' : 'Edit'}
            </button>
          )}
        </div>
        <p className="diary-modal-total">
          {total} episode{total === 1 ? '' : 's'} across {showCount} show{showCount === 1 ? '' : 's'}
        </p>

        <div className="favorites-modal-body">
          <DiaryEntries
            blocks={blocks}
            onEditEpisode={manage ? onEditEpisode : undefined}
            onDeleteEpisode={manage ? onDeleteEpisode : undefined}
          />
          {hasMore && (
            <button className="diary-load-more" onClick={onLoadMore} disabled={loadingMore}>
              {loadingMore ? 'Loading…' : 'Load more'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
