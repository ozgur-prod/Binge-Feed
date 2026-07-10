import { UserIcon, PlayIcon } from './icons';
import './CommentAuthor.css';

// Shared identity strip (avatar, handle, premium badge) for comments, reviews, and feed cards.
function CommentAuthor({ user, deleted = false }) {
  const isPremium = !deleted && user?.tier === 'premium';

  return (
    <div className="author-row">
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
