import { useNavigate } from 'react-router-dom';
import { UserIcon, PlayIcon } from './icons';
import './CommentAuthor.css';

// Shared identity strip (avatar, handle, premium badge) for comments, reviews, and feed cards.
// Clicking a known (non-deleted) user opens their profile.
function CommentAuthor({ user, deleted = false }) {
  const navigate = useNavigate();
  const isPremium = !deleted && user?.tier === 'premium';
  const linkable = !deleted && Boolean(user?.handle);

  function openProfile(e) {
    e.stopPropagation(); // stop the click from also triggering the surrounding card
    navigate(`/user/${user.handle}`);
  }

  return (
    <div
      className={`author-row ${linkable ? 'author-row-link' : ''}`}
      onClick={linkable ? openProfile : undefined}
    >
      {!deleted && user?.avatarUrl ? (
        <img className="author-avatar" src={user.avatarUrl} alt={user.handle} />
      ) : (
        <span className="author-avatar author-avatar-placeholder">
          <UserIcon size={18} />
        </span>
      )}
      <span className={`author-handle ${deleted ? 'author-handle-muted' : ''} ${isPremium ? 'author-handle-premium' : ''}`}>
        {deleted ? 'unknown user' : user?.handle}
      </span>
      {isPremium && <PlayIcon className="author-premium-badge" size={13} />}
    </div>
  );
}

export default CommentAuthor;
