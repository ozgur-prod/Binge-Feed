import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usersAPI } from '../services/api';
import './ForgotPasswordModal.css';
import './FollowListModal.css';

export default function FollowListModal({ userId, type, onClose }) {
  const [users, setUsers] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const load = type === 'followers' ? usersAPI.getFollowers : usersAPI.getFollowing;
    load(userId)
      .then((d) => setUsers(d.users))
      .catch(() => setUsers([]));
  }, [userId, type]);

  function openUser(id) {
    onClose();
    navigate(`/user/${id}`);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal follow-list-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2 className="modal-title">{type === 'followers' ? 'Followers' : 'Following'}</h2>

        {users === null ? (
          <p className="follow-list-status">Loading…</p>
        ) : users.length === 0 ? (
          <p className="follow-list-status">Nothing here yet.</p>
        ) : (
          <ul className="follow-list">
            {users.map((u) => (
              <li key={u.id} className="follow-list-item" onClick={() => openUser(u.id)}>
                {u.avatarUrl ? (
                  <img className="follow-list-avatar" src={u.avatarUrl} alt={u.handle} />
                ) : (
                  <span className="follow-list-avatar follow-list-avatar-placeholder">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </span>
                )}
                <div className="follow-list-text">
                  <span className="follow-list-handle">{u.handle}</span>
                  {u.displayName && <span className="follow-list-name">{u.displayName}</span>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
