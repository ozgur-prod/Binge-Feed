import { useState } from 'react';
import { usersAPI } from '../services/api';
import './ForgotPasswordModal.css';

export default function EditProfileModal({ user, onClose, onSaved }) {
  const [form, setForm] = useState({
    displayName: user.displayName || '',
    bio: user.bio || '',
    avatarUrl: user.avatarUrl || '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    // These checks just give instant feedback. The backend validates the same rules
    // again, because requests can hit the API without going through this form.
    if (!form.displayName.trim()) return setError('Display name cannot be empty.');
    if (form.bio.length > 300) return setError('Bio must be at most 300 characters.');
    if (form.avatarUrl && !/^https?:\/\//.test(form.avatarUrl)) {
      return setError('Avatar URL must start with http:// or https://.');
    }
    setLoading(true);
    try {
      const data = await usersAPI.updateMe(form);
      onSaved(data.user);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2 className="modal-title">Edit Profile</h2>
        <p className="modal-subtitle">Update how your profile looks to others.</p>

        <form onSubmit={handleSubmit}>
          <div className="modal-field">
            <label htmlFor="displayName">Display name:</label>
            <input
              id="displayName"
              name="displayName"
              value={form.displayName}
              onChange={handleChange}
              required
              maxLength={50}
            />
          </div>

          <div className="modal-field">
            <label htmlFor="avatarUrl">Avatar URL:</label>
            <input
              id="avatarUrl"
              name="avatarUrl"
              type="url"
              value={form.avatarUrl}
              onChange={handleChange}
              placeholder="https://…"
            />
          </div>

          <div className="modal-field">
            <label htmlFor="bio">Bio:</label>
            <textarea
              id="bio"
              name="bio"
              rows={3}
              maxLength={300}
              value={form.bio}
              onChange={handleChange}
              placeholder="Tell people what you binge…"
            />
          </div>

          {error && <p className="modal-error">{error}</p>}

          <button className="modal-btn" type="submit" disabled={loading}>
            {loading ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
