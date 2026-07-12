import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usersAPI } from '../services/api';
import { UserIcon, XIcon } from './icons';
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

  function openUser(handle) {
    onClose();
    navigate(`/user/${handle}`);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal follow-list-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><XIcon /></button>
        <h2 className="modal-title">{type === 'followers' ? 'Followers' : 'Following'}</h2>

        {users === null ? (
          <p className="follow-list-status">Loading…</p>
        ) : users.length === 0 ? (
          <p className="follow-list-status">Nothing here yet.</p>
        ) : (
          <ul className="follow-list">
            {users.map((u) => (
              <li key={u.id} className="follow-list-item" onClick={() => openUser(u.handle)}>
                {u.avatarUrl ? (
                  <img className="follow-list-avatar" src={u.avatarUrl} alt={u.handle} />
                ) : (
                  <span className="follow-list-avatar follow-list-avatar-placeholder">
                    <UserIcon strokeWidth={1.5} />
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
