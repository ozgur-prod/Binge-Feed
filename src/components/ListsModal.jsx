import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { showsAPI, listsAPI } from '../services/api';
import { XIcon, CheckIcon, ChevronLeftIcon } from './icons';
import './ForgotPasswordModal.css';
import './FavoritesModal.css';
import './ListsModal.css';

const POSTER_W154 = 'https://image.tmdb.org/t/p/w154';

export default function ListsModal({ lists, setLists, onClose }) {
  const navigate = useNavigate();
  const [activeListId, setActiveListId] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [query, setQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loadedQuery, setLoadedQuery] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [error, setError] = useState('');

  const activeList = lists.find((l) => l.id === activeListId) || null;
  const searching = searchQuery.length > 0;
  const loading = searching && searchQuery !== loadedQuery;

  // `results` is only ever rendered while `searching` is true, so there's nothing to reset when it's false.
  useEffect(() => {
    if (!searching) return;
    let stale = false;
    showsAPI
      .search(searchQuery)
      .then((d) => { if (!stale) setResults((d.results || []).slice(0, 12)); })
      .catch(() => { if (!stale) setResults([]); })
      .finally(() => { if (!stale) setLoadedQuery(searchQuery); });
    return () => { stale = true; };
  }, [searchQuery, searching]);

  function replaceList(updated) {
    setLists((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
  }

  async function createList() {
    const title = newTitle.trim();
    if (!title) return;
    try {
      const { list } = await listsAPI.create({ title });
      setLists((prev) => [list, ...prev]);
      setNewTitle('');
      setError('');
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteList(listId) {
    try {
      await listsAPI.remove(listId);
      setLists((prev) => prev.filter((l) => l.id !== listId));
      setConfirmDeleteId(null);
      if (activeListId === listId) openOverview();
    } catch (err) {
      setError(err.message);
    }
  }

  async function addShow(show) {
    try {
      const { list } = await listsAPI.addShow(activeListId, { showId: show.id });
      replaceList(list);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  }

  async function removeShow(showId) {
    try {
      const { list } = await listsAPI.removeShow(activeListId, showId);
      replaceList(list);
    } catch (err) {
      setError(err.message);
    }
  }

  function openList(listId) {
    setActiveListId(listId);
    setQuery('');
    setSearchQuery('');
    setError('');
  }

  function openOverview() {
    setActiveListId(null);
    setQuery('');
    setSearchQuery('');
    setConfirmDeleteId(null);
    setError('');
  }

  function onQueryChange(e) {
    const value = e.target.value;
    setQuery(value);
    if (!value.trim()) setSearchQuery('');
  }

  function runSearch(e) {
    if (e.key === 'Enter') setSearchQuery(query.trim());
  }

  function openShow(showId) {
    onClose();
    navigate(`/show/${showId}`);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal favorites-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><XIcon /></button>

        {activeList ? (
          <>
            <button className="lists-back" onClick={openOverview}><ChevronLeftIcon size={16} /> Lists</button>
            <h2 className="modal-title">{activeList.title}</h2>
            <input
              className="favorites-search"
              type="text"
              placeholder="Search a show, then press Enter…"
              value={query}
              onChange={onQueryChange}
              onKeyDown={runSearch}
            />
            {error && <p className="favorites-modal-status favorites-modal-error">{error}</p>}
            <div className="favorites-modal-body">
              {searching ? (
                loading ? (
                  <p className="favorites-modal-status">Searching…</p>
                ) : results.length === 0 ? (
                  <p className="favorites-modal-status">No shows found.</p>
                ) : (
                  <div className="favorites-modal-grid">
                    {results.map((show) => {
                      const already = activeList.shows.some((s) => s.showId === show.id);
                      return (
                        <button
                          key={show.id}
                          className="favorites-add-item"
                          disabled={already}
                          title={already ? 'Already in this list' : show.name}
                          onClick={() => addShow(show)}
                        >
                          {show.poster_path ? (
                            <img src={`${POSTER_W154}${show.poster_path}`} alt={show.name} />
                          ) : (
                            <div className="favorites-noimg">No image</div>
                          )}
                          {already && <span className="favorites-add-check"><CheckIcon size={14} /></span>}
                          <span className="favorites-item-name">{show.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )
              ) : activeList.shows.length === 0 ? (
                <p className="favorites-modal-status">No shows yet — search above to add some.</p>
              ) : (
                <div className="favorites-modal-grid">
                  {activeList.shows.map((s) => (
                    <div className="favorites-modal-item" key={s.showId}>
                      <img
                        src={s.posterUrl}
                        alt={s.showName}
                        title={s.showName}
                        onClick={() => openShow(s.showId)}
                      />
                      <button
                        className="favorites-modal-remove"
                        title="Remove from list"
                        onClick={() => removeShow(s.showId)}
                      >
                        <XIcon size={14} />
                      </button>
                      <span className="favorites-item-name">{s.showName}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <h2 className="modal-title">Lists</h2>
            <div className="lists-create">
              <input
                className="favorites-search"
                type="text"
                placeholder="New list name…"
                value={newTitle}
                maxLength={60}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && createList()}
              />
              <button className="pill-btn pill-btn-small" onClick={createList} disabled={!newTitle.trim()}>
                Create
              </button>
            </div>
            {error && <p className="favorites-modal-status favorites-modal-error">{error}</p>}
            <div className="favorites-modal-body">
              {lists.length === 0 ? (
                <p className="favorites-modal-status">No lists yet — create one above.</p>
              ) : (
                <ul className="lists-overview">
                  {lists.map((list) => (
                    <li className="lists-overview-row" key={list.id}>
                      <button
                        className="lists-overview-open"
                        onClick={() => openList(list.id)}
                        disabled={confirmDeleteId === list.id}
                      >
                        <span className="lists-overview-title">{list.title}</span>
                        <span className="lists-overview-count">
                          {list.showCount} show(s)
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
          </>
        )}
      </div>
    </div>
  );
}
