import { UserIcon, PlayIcon } from './icons';

export default function ProfileHeader({ user, editable, busy, onEdit, onFollow, onOpenFollowers, onOpenFollowing }) {
  return (
    <section className="profile-header">
      {user.avatarUrl ? (
        <img className="profile-avatar" src={user.avatarUrl} alt={user.handle} />
      ) : (
        <span className="profile-avatar profile-avatar-placeholder">
          <UserIcon strokeWidth={1.5} />
        </span>
      )}
      <div className="profile-identity">
        <h1 className={`profile-handle${user.tier === 'premium' ? ' profile-handle--premium' : ''}`}>
          {user.handle}
          {user.tier === 'premium' && <PlayIcon size={20} className="profile-handle-play" />}
        </h1>
        {user.displayName && <p className="profile-display-name">{user.displayName}</p>}
        {user.bio && <p className="profile-bio">{user.bio}</p>}
        <p className="profile-follow-counts">
          <button className="follow-count-btn" onClick={onOpenFollowing}>
            <strong>{user.followingCount ?? 0}</strong> Following
          </button>
          <span className="follow-dot">·</span>
          <button className="follow-count-btn" onClick={onOpenFollowers}>
            <strong>{user.followersCount ?? 0}</strong> Followers
          </button>
        </p>
      </div>
      {editable ? (
        <button className="pill-btn" onClick={onEdit}>
          Edit Profile
        </button>
      ) : (
        <button
          className={`pill-btn ${user.isFollowing ? 'pill-btn-muted' : ''}`}
          onClick={onFollow}
          disabled={busy}
        >
          {user.isFollowing ? 'Following' : 'Follow'}
        </button>
      )}
    </section>
  );
}
