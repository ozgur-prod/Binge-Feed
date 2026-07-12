import { useEffect, useRef, useState } from 'react';
import { usersAPI, listsAPI } from '../services/api';
import { XIcon, CheckIcon, PlusIcon } from './icons';
import './ForgotPasswordModal.css';
import './FavoritesModal.css';
import './ListsModal.css';

// Shows all the user's lists so this show can be added to or removed from any of them (or a new list).
export default function AddToListModal({ show, onClose }) {
  const mouseDownOnOverlay = useRef(false);
  const [lists, setLists] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    usersAPI
      .getMe()
      .then((data) => listsAPI.list(data.user.id))
      .then((l) => setLists(l.lists))
      .catch((err) => setError(err.message));
  }, []);

  function isMember(list) {
    return list.shows.some((s) => s.showId === show.id);
  }

  async function toggle(list) {
    if (busy) return;
    setBusy(true);
    try {
      const { list: updated } = isMember(list)
        ? await listsAPI.removeShow(list.id, show.id)
        : await listsAPI.addShow(list.id, { showId: show.id });
      setLists((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function deleteList(listId) {
    if (busy) return;
    setBusy(true);
    try {
      await listsAPI.remove(listId);
      setLists((prev) => prev.filter((l) => l.id !== listId));
      setConfirmDeleteId(null);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function createAndAdd() {
    const title = newTitle.trim();
    if (!title || busy) return;
    setBusy(true);
    try {
      const { list } = await listsAPI.create({ title });
      const { list: withShow } = await listsAPI.addShow(list.id, { showId: show.id });
      setLists((prev) => [withShow, ...prev]);
      setNewTitle('');
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-overlay"
      onMouseDown={(e) => { mouseDownOnOverlay.current = e.target === e.currentTarget; }}
      onClick={() => { if (mouseDownOnOverlay.current) onClose(); }}
    >
      <div className="modal favorites-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><XIcon /></button>
        <h2 className="modal-title">Add to List</h2>

        <div className="lists-create">
          <input
            className="favorites-search"
            type="text"
            placeholder="New list name…"
            value={newTitle}
            maxLength={60}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && createAndAdd()}
          />
          <button className="pill-btn pill-btn-small" onClick={createAndAdd} disabled={!newTitle.trim() || busy}>
            Create
          </button>
        </div>
        {error && <p className="favorites-modal-status favorites-modal-error">{error}</p>}

        <div className="favorites-modal-body">
          {lists === null ? (
            <p className="favorites-modal-status">Loading lists…</p>
          ) : lists.length === 0 ? (
            <p className="favorites-modal-status">No lists yet — create one above.</p>
          ) : (
            <ul className="lists-overview">
              {lists.map((list) => (
                <li className="lists-overview-row" key={list.id}>
                  <button
                    className="lists-overview-open"
                    onClick={() => toggle(list)}
                    disabled={busy || confirmDeleteId === list.id}
                  >
                    <span className="lists-overview-title">{list.title}</span>
                    <span className={isMember(list) ? 'list-check on' : 'list-check'}>
                      {isMember(list) ? <><CheckIcon size={13} /> Added</> : <><PlusIcon size={13} /> Add</>}
                    </span>
                  </button>
                  {confirmDeleteId === list.id ? (
                    <span className="lists-confirm">
                      <span className="lists-confirm-text">Delete?</span>
                      <button className="lists-confirm-yes" title="Confirm delete" onClick={() => deleteList(list.id)}><CheckIcon size={14} /></button>
                      <button className="lists-confirm-no" title="Cancel" onClick={() => setConfirmDeleteId(null)}><XIcon size={14} /></button>
                    </span>
                  ) : (
                    <button
                      className="lists-overview-delete"
                      title="Delete list"
                      onClick={() => setConfirmDeleteId(list.id)}
                    >
                      <XIcon size={14} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
