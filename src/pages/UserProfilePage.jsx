import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usersAPI } from '../services/api';
import Header from '../components/Header';
import FollowListModal from '../components/FollowListModal';
import { UserIcon } from '../components/icons';
import './ProfilePage.css';

function UserProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [busy, setBusy] = useState(false);
  const [followModal, setFollowModal] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setUser(null);
    setError('');
    usersAPI
      .getUser(id)
      .then((data) => setUser(data.user))
      .catch((err) => setError(err.message));
  }, [id]);

  async function toggleFollow() {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    setBusy(true);
    try {
      if (user.isFollowing) {
        await usersAPI.unfollow(id);
        setUser((u) => ({ ...u, isFollowing: false, followersCount: u.followersCount - 1 }));
      } else {
        await usersAPI.follow(id);
        setUser((u) => ({ ...u, isFollowing: true, followersCount: u.followersCount + 1 }));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="profile-page">
      <Header />
      <main className="profile-main">
        <div className="profile-content">
          {error && <p className="profile-error">{error}</p>}
          {!user && !error && <p className="profile-loading">Loading…</p>}

          {user && (
            <section className="profile-header">
              {user.avatarUrl ? (
                <img className="profile-avatar" src={user.avatarUrl} alt={user.handle} />
              ) : (
                <span className="profile-avatar profile-avatar-placeholder">
                  <UserIcon strokeWidth={1.5} />
                </span>
              )}
              <div className="profile-identity">
                <h1 className="profile-handle">{user.handle}</h1>
                {user.displayName && <p className="profile-display-name">{user.displayName}</p>}
                {user.bio && <p className="profile-bio">{user.bio}</p>}
                <p className="profile-follow-counts">
                  <button className="follow-count-btn" onClick={() => setFollowModal('following')}>
                    <strong>{user.followingCount ?? 0}</strong> Following
                  </button>
                  <span className="follow-dot">·</span>
                  <button className="follow-count-btn" onClick={() => setFollowModal('followers')}>
                    <strong>{user.followersCount ?? 0}</strong> Followers
                  </button>
                </p>
              </div>
              {user.isSelf ? (
                <button className="pill-btn" onClick={() => navigate('/profile')}>
                  Your profile
                </button>
              ) : (
                <button
                  className={`pill-btn ${user.isFollowing ? 'pill-btn-muted' : ''}`}
                  onClick={toggleFollow}
                  disabled={busy}
                >
                  {user.isFollowing ? 'Following' : 'Follow'}
                </button>
              )}
            </section>
          )}
        </div>
      </main>

      {followModal && user && (
        <FollowListModal userId={user.id} type={followModal} onClose={() => setFollowModal(null)} />
      )}
    </div>
  );
}

export default UserProfilePage;
